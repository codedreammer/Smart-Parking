const router = require('express').Router();
const Parking = require('../models/Parking');
const { available } = require('../utils/availability');

const VEHICLES = new Set(['BIKE', 'CAR', 'SUV', 'AUTO', 'COMMERCIAL']);
const escapeRegex = (value) => value.replace(/[.*+?^\x24{}()|[\]\\]/g, '\\$&');
const cleanText = (value, limit = 600) => typeof value === 'string' ? value.trim().slice(0, limit) : '';

const priceFor = (parking, vehicle) => {
  const prices = parking.pricing || {};
  const get = (key) => typeof prices.get === 'function' ? prices.get(key) : prices[key];
  const preferred = get(vehicle) ?? get('CAR') ?? Object.values(prices)[0];
  return Number(preferred) || 0;
};

const responseFallback = (recommendations, area) => {
  if (!recommendations.length) {
    return area
      ? 'I could not find an approved parking facility in ' + area + ' yet. Try a nearby landmark or city.'
      : 'Tell me the area you want to park in and I will look through the available facilities.';
  }

  const best = recommendations[0];
  const availability = best.available > 0
    ? best.available + ' spaces currently available'
    : 'currently full, so check the other suggestions';
  const rate = best.hourlyRate ? ' from Rs. ' + best.hourlyRate + '/hour' : '';
  return best.name + ' is my best match in ' + best.city + ': ' + availability + rate + '. I have included a few alternatives below so you can compare them.';
};

const compactParking = (parking, availableSpaces, vehicle) => ({
  id: String(parking._id),
  name: parking.name,
  address: parking.address || '',
  city: parking.city,
  rating: Number(parking.rating) || 0,
  available: availableSpaces,
  capacity: parking.capacity,
  hourlyRate: priceFor(parking, vehicle),
  facilities: Array.isArray(parking.facilities) ? parking.facilities.slice(0, 8) : [],
  vehicleTypes: Array.isArray(parking.vehicleTypes) ? parking.vehicleTypes : [],
  operatingHours: parking.operatingHours || {},
});

router.post('/', async (req, res, next) => {
  try {
    const message = cleanText(req.body.message);
    const area = cleanText(req.body.area, 120);
    const preferences = cleanText(req.body.preferences, 300);
    const requestedVehicle = cleanText(req.body.vehicle, 20).toUpperCase();
    const vehicle = VEHICLES.has(requestedVehicle) ? requestedVehicle : 'CAR';

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please enter a parking question.' });
    }

    const filter = { status: 'APPROVED' };
    if (area) {
      const areaRegex = new RegExp(escapeRegex(area), 'i');
      filter.$or = [{ city: areaRegex }, { address: areaRegex }, { name: areaRegex }];
    }
    if (requestedVehicle && VEHICLES.has(requestedVehicle)) filter.vehicleTypes = requestedVehicle;

    const parking = await Parking.find(filter)
      .select('name address city capacity vehicleTypes pricing facilities operatingHours rating')
      .limit(12)
      .lean();

    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    const candidates = await Promise.all(parking.map(async (item) => {
      const spaces = await available(item, start, end);
      return compactParking(item, spaces, vehicle);
    }));

    const preferenceText = (message + ' ' + preferences).toLowerCase();
    const recommendations = candidates
      .map((item) => {
        const facilities = item.facilities.join(' ').toLowerCase();
        let score = (item.rating * 16) + ((item.available / Math.max(item.capacity, 1)) * 40);
        if (preferenceText.includes('ev') && facilities.includes('ev')) score += 18;
        if (preferenceText.includes('cover') && facilities.includes('cover')) score += 12;
        if ((preferenceText.includes('cheap') || preferenceText.includes('budget')) && item.hourlyRate) score += Math.max(0, 20 - item.hourlyRate);
        return { ...item, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score, ...item }) => item);

    let answer = responseFallback(recommendations, area);
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      const suppliedHistory = Array.isArray(req.body.history) ? req.body.history : [];
      const history = suppliedHistory
        .filter((turn) => turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.text === 'string')
        .slice(-6)
        .map((turn) => (turn.role === 'assistant' ? 'ParkPilot: ' : 'Driver: ') + cleanText(turn.text, 500))
        .filter(Boolean)
        .join('\n');

      const prompt = [
        'Parking area: ' + (area || 'not specified'),
        'Vehicle: ' + vehicle,
        'Preferences: ' + (preferences || 'none specified'),
        'Prior conversation:',
        history || 'No prior conversation.',
        'Current user question: ' + message,
        'Approved parking options and live availability snapshot:',
        JSON.stringify(recommendations),
      ].join('\n');

      try {
        const model = process.env.GEMINI_MODEL || 'gemini-flash-latest';
        const geminiResponse = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/interactions',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
              'Api-Revision': '2026-05-20',
            },
            body: JSON.stringify({
              model,
              system_instruction: 'You are ParkPilot, a concise assistant for a smart parking website. Recommend only places in the provided approved-options data. Never invent parking locations, prices, amenities, availability, distances, or booking confirmation. Explain why the best option matches the user, mention live availability is a snapshot, and ask one focused follow-up only if the area or key preference is missing. Keep the response below 120 words.',
              input: prompt,
              generation_config: { max_output_tokens: 220 },
            }),
            signal: AbortSignal.timeout(12000),
          },
        );

        if (!geminiResponse.ok) throw new Error('Gemini request failed with status ' + geminiResponse.status);
        const data = await geminiResponse.json();
        const generated = (Array.isArray(data.steps) ? data.steps : [])
          .filter((step) => step.type === 'model_output')
          .flatMap((step) => step.content || [])
          .filter((content) => content.type === 'text')
          .map((content) => content.text || '')
          .join('')
          .trim();
        if (generated) answer = generated.slice(0, 1600);
      } catch (error) {
        console.warn('Parking assistant is using local recommendations:', error.message);
      }
    }

    res.json({ success: true, data: { answer, recommendations } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
