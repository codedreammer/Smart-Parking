const router = require('express').Router();
const crypto = require('crypto');
const Booking = require('../models/Booking');
const Parking = require('../models/Parking');
const { protect } = require('../middleware/auth');
const { available } = require('../utils/availability');
router.use(protect);

router.post('/', async (req, res, next) => {
  try {
    const { parkingId, vehicleType, vehicleNumber, startTime, endTime, slotNumber } = req.body;
    const start = new Date(startTime), end = new Date(endTime);
    if (isNaN(start) || isNaN(end) || end <= start || start < new Date())
      return res.status(400).json({ success: false, message: 'Choose a valid future start and end time' });
    const p = await Parking.findById(parkingId);
    if (!p || p.status !== 'APPROVED') return res.status(404).json({ success: false, message: 'Parking not available for booking' });
    if (!p.vehicleTypes.includes(vehicleType)) return res.status(400).json({ success: false, message: `${vehicleType} not supported here` });
    if ((await available(p, start, end)) < 1) return res.status(409).json({ success: false, message: 'No space left for that time slot' });

    const hours = Math.ceil((end - start) / 3600000);
    const rate = p.pricing instanceof Map ? p.pricing.get(vehicleType) : (p.pricing[vehicleType] || 30);
    const baseAmount = hours * (rate || 30);
    const platformFee = Number(process.env.PLATFORM_FEE || 5);
    const count = await Booking.countDocuments();
    const bookingId = `SP-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;
    const gatePin = String(Math.floor(1000 + Math.random() * 9000));
    const qrPassCode = crypto.createHash('sha256').update(`${bookingId}-${Date.now()}`).digest('hex').slice(0, 16).toUpperCase();

    const b = await Booking.create({
      bookingId,
      userId: req.user._id,
      parkingId: p._id,
      ownerId: p.ownerId,
      vehicleType,
      vehicleNumber: (vehicleNumber || 'UNREGISTERED').toUpperCase(),
      slotNumber: slotNumber || `A-${String(Math.floor(1 + Math.random() * p.capacity)).padStart(2, '0')}`,
      startTime: start,
      endTime: end,
      duration: hours,
      baseAmount,
      platformFee,
      totalAmount: baseAmount + platformFee,
      status: 'PENDING',
      gatePin,
      qrPassCode,
    });
    res.status(201).json({ success: true, data: b });
  } catch (e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await Booking.find({ userId: req.user._id })
        .populate('parkingId', 'name city address images facilities location')
        .sort('-createdAt')
    });
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const b = await Booking.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('parkingId', 'name city address images facilities operatingHours location');
    if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: b });
  } catch (e) { next(e); }
});

// Mock Payment verification (transitions PENDING -> CONFIRMED)
router.patch('/:id/pay', async (req, res, next) => {
  try {
    const { method = 'UPI', transactionRef } = req.body;
    const b = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (b.status !== 'PENDING') return res.status(400).json({ success: false, message: `Booking is already ${b.status}` });

    b.status = 'CONFIRMED';
    b.payment = {
      paymentId: `PAY-${Date.now().toString(36).toUpperCase()}`,
      method,
      status: 'PAID',
      paidAt: new Date(),
      transactionRef: transactionRef || `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    };
    await b.save();
    res.json({ success: true, data: b });
  } catch (e) { next(e); }
});

// Gate Entry Check-in simulation (transitions CONFIRMED -> ACTIVE)
router.patch('/:id/checkin', async (req, res, next) => {
  try {
    const b = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (b.status !== 'CONFIRMED') return res.status(400).json({ success: false, message: 'Only confirmed bookings can check in at gate' });

    b.status = 'ACTIVE';
    b.checkInTime = new Date();
    await b.save();
    res.json({ success: true, data: b });
  } catch (e) { next(e); }
});

// Gate Departure Check-out simulation (transitions ACTIVE -> COMPLETED)
router.patch('/:id/checkout', async (req, res, next) => {
  try {
    const b = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (b.status !== 'ACTIVE') return res.status(400).json({ success: false, message: 'Only currently active parking can check out' });

    b.status = 'COMPLETED';
    b.checkOutTime = new Date();
    await b.save();
    res.json({ success: true, data: b });
  } catch (e) { next(e); }
});

router.patch('/:id/cancel', async (req, res, next) => {
  try {
    const b = await Booking.findOne({ _id: req.params.id, userId: req.user._id });
    if (!b) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (!['PENDING', 'CONFIRMED'].includes(b.status)) return res.status(400).json({ success: false, message: 'This booking cannot be cancelled' });
    b.status = 'CANCELLED';
    if (b.payment?.status === 'PAID') {
      b.payment.status = 'REFUNDED';
    }
    await b.save();
    res.json({ success: true, data: b });
  } catch (e) { next(e); }
});

module.exports = router;
