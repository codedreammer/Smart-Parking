const router = require('express').Router();
const Parking = require('../models/Parking');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const { protect, allow } = require('../middleware/auth');
const { available } = require('../utils/availability');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res, next) => {
  try {
    const { q, city, vehicle } = req.query;
    const f = { status: 'APPROVED' };
    if (city) f.city = new RegExp(`^${esc(city)}`, 'i');
    if (q) { const r = new RegExp(esc(q), 'i'); f.$or = [{ name: r }, { address: r }, { city: r }]; }
    if (vehicle) f.vehicleTypes = vehicle;
    res.json({ success: true, data: await Parking.find(f).limit(50) });
  } catch (e) { next(e); }
});

router.get('/nearby', async (req, res, next) => {
  try {
    const { lat, lng, km = 5 } = req.query;
    const list = await Parking.find({
      status: 'APPROVED',
      location: { $near: { $geometry: { type: 'Point', coordinates: [+lng, +lat] }, $maxDistance: km * 1000 } },
    }).limit(30);
    res.json({ success: true, data: list });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = await Parking.findOne({ _id: req.params.id, status: 'APPROVED' });
    if (!p) return res.status(404).json({ success: false, message: 'Parking not found' });
    res.json({ success: true, data: p });
  } catch (e) { next(e); }
});

router.get('/:id/availability', async (req, res, next) => {
  try {
    const p = await Parking.findOne({ _id: req.params.id, status: 'APPROVED' });
    if (!p) return res.status(404).json({ success: false, message: 'Parking not found' });
    const start = new Date(req.query.start || Date.now());
    const end = new Date(req.query.end || start.getTime() + 3600000);
    const avail = await available(p, start, end);
    res.json({ success: true, data: { total: p.capacity, available: avail } });
  } catch (e) { next(e); }
});

// Slot layout and live occupancy for a slot grid
router.get('/:id/slots', async (req, res, next) => {
  try {
    const p = await Parking.findOne({ _id: req.params.id, status: 'APPROVED' });
    if (!p) return res.status(404).json({ success: false, message: 'Parking not found' });

    const start = new Date(req.query.start || Date.now());
    const end = new Date(req.query.end || start.getTime() + 3600000);

    // Find active or overlapping bookings in this window
    const overlapping = await Booking.find({
      parkingId: p._id,
      status: { $in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
      startTime: { $lt: end },
      endTime: { $gt: start },
    }).select('slotNumber vehicleType status');

    const occupiedSlots = new Set(overlapping.map((b) => b.slotNumber).filter(Boolean));

    // If parking already has slots configured, use them; otherwise generate standard 2D layout based on capacity
    let slotsList = p.slots && p.slots.length > 0 ? p.slots.toObject() : [];
    if (slotsList.length === 0) {
      const total = p.capacity || 24;
      const count = Math.min(total, 36);
      slotsList = Array.from({ length: count }, (_, i) => {
        const row = String.fromCharCode(65 + Math.floor(i / 8)); // A, B, C, D
        const num = String((i % 8) + 1).padStart(2, '0');
        const isEV = i % 6 === 2;
        const isCovered = i < 16;
        const vehicleType = i < 4 ? 'BIKE' : (i > count - 4 ? 'SUV' : 'CAR');
        return {
          slotNumber: `${row}-${num}`,
          vehicleType,
          floor: i < 18 ? 'Level 1 (Covered)' : 'Level 2 (Open Deck)',
          isCovered,
          isEV,
          isAccessible: i === 0 || i === 8,
        };
      });
    }

    const annotated = slotsList.map((slot) => ({
      ...slot,
      isOccupied: occupiedSlots.has(slot.slotNumber),
    }));

    res.json({ success: true, data: annotated });
  } catch (e) { next(e); }
});

// Reviews endpoints
router.get('/:id/reviews', async (req, res, next) => {
  try {
    const reviews = await Review.find({ parkingId: req.params.id }).sort('-createdAt').limit(20);
    res.json({ success: true, data: reviews });
  } catch (e) { next(e); }
});

router.post('/:id/reviews', protect, async (req, res, next) => {
  try {
    const { rating, comment, vehicleType } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ success: false, message: 'Review comment cannot be empty' });
    }

    const p = await Parking.findById(req.params.id);
    if (!p) return res.status(404).json({ success: false, message: 'Parking not found' });

    const review = await Review.create({
      parkingId: p._id,
      userId: req.user._id,
      userName: req.user.name || 'Verified Driver',
      rating: Number(rating),
      comment: comment.trim(),
      vehicleType: vehicleType || 'CAR',
    });

    // Recalculate average rating
    const all = await Review.find({ parkingId: p._id });
    const avg = all.reduce((sum, r) => sum + r.rating, 0) / all.length;
    p.rating = Math.round(avg * 10) / 10;
    p.totalReviews = all.length;
    await p.save();

    res.status(201).json({ success: true, data: review, updatedRating: p.rating, totalReviews: p.totalReviews });
  } catch (e) { next(e); }
});

router.post('/', protect, allow('OWNER'), async (req, res, next) => {
  try {
    const { name, description, address, city, state, pincode, lat, lng, capacity, vehicleTypes, pricing, facilities, operatingHours, images } = req.body;
    if (!name || !city || !capacity || !vehicleTypes?.length || !pricing)
      return res.status(400).json({ success: false, message: 'Name, city, capacity, vehicle types and pricing are required' });
    const p = await Parking.create({
      ownerId: req.user._id, name, description, address, city, state, pincode, capacity, vehicleTypes, pricing, facilities, operatingHours,
      images: images || [],
      location: { type: 'Point', coordinates: [Number(lng) || 0, Number(lat) || 0] }, status: 'PENDING_APPROVAL',
    });
    res.status(201).json({ success: true, data: p });
  } catch (e) { next(e); }
});

router.put('/:id', protect, allow('OWNER'), async (req, res, next) => {
  try {
    const p = await Parking.findOne({ _id: req.params.id, ownerId: req.user._id });
    if (!p) return res.status(404).json({ success: false, message: 'Parking not found' });
    ['name', 'description', 'address', 'capacity', 'pricing', 'facilities', 'operatingHours', 'images'].forEach((k) => req.body[k] !== undefined && (p[k] = req.body[k]));
    p.status = 'PENDING_APPROVAL';
    await p.save();
    res.json({ success: true, data: p });
  } catch (e) { next(e); }
});

module.exports = router;
