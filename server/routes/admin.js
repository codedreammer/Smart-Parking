const router = require('express').Router();
const Parking = require('../models/Parking');
const User = require('../models/User');
const Booking = require('../models/Booking');
const { protect, allow } = require('../middleware/auth');
router.use(protect, allow('ADMIN'));

router.get('/dashboard', async (req, res, next) => {
  try {
    const [users, owners, parking, bookings, pending, recentBookings] = await Promise.all([
      User.countDocuments({ role: 'USER' }),
      User.countDocuments({ role: 'OWNER' }),
      Parking.countDocuments({ status: 'APPROVED' }),
      Booking.countDocuments(),
      Parking.countDocuments({ status: 'PENDING_APPROVAL' }),
      Booking.find().populate('userId', 'name email').populate('parkingId', 'name city').sort('-createdAt').limit(10),
    ]);
    const paidBookings = await Booking.find({ 'payment.status': 'PAID' });
    const platformRevenue = paidBookings.reduce((sum, b) => sum + (b.platformFee || 5), 0);
    const grossVolume = paidBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        users,
        owners,
        parking,
        bookings,
        pending,
        platformRevenue,
        grossVolume,
        recentBookings,
      },
    });
  } catch (e) { next(e); }
});

router.get('/parking', async (req, res, next) => {
  try {
    const f = req.query.status ? { status: req.query.status } : {};
    res.json({ success: true, data: await Parking.find(f).populate('ownerId', 'name email phone').sort('-createdAt') });
  } catch (e) { next(e); }
});

router.patch('/parking/:id/approve', async (req, res, next) => {
  try {
    res.json({
      success: true,
      data: await Parking.findByIdAndUpdate(req.params.id, { status: 'APPROVED', rejectionReason: '' }, { new: true }),
    });
  } catch (e) { next(e); }
});

router.patch('/parking/:id/reject', async (req, res, next) => {
  try {
    if (!req.body.reason) return res.status(400).json({ success: false, message: 'A rejection reason is required' });
    res.json({
      success: true,
      data: await Parking.findByIdAndUpdate(req.params.id, { status: 'REJECTED', rejectionReason: req.body.reason }, { new: true }),
    });
  } catch (e) { next(e); }
});

module.exports = router;
