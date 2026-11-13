const router = require('express').Router();
const Parking = require('../models/Parking');
const Booking = require('../models/Booking');
const { protect, allow } = require('../middleware/auth');
router.use(protect, allow('OWNER'));

router.get('/parking', async (req, res, next) => {
  try {
    const list = await Parking.find({ ownerId: req.user._id }).sort('-createdAt');
    res.json({ success: true, data: list });
  } catch (e) { next(e); }
});

router.get('/dashboard', async (req, res, next) => {
  try {
    const listings = await Parking.find({ ownerId: req.user._id });
    const parkingIds = listings.map((p) => p._id);
    const totalCapacity = listings.reduce((sum, p) => sum + (p.capacity || 0), 0);

    const bookings = await Booking.find({ parkingId: { $in: parkingIds }, status: { $ne: 'CANCELLED' } })
      .populate('parkingId', 'name city')
      .populate('userId', 'name phone email')
      .sort('-createdAt')
      .limit(20);

    const activeVehicles = bookings.filter((b) => b.status === 'ACTIVE' || b.status === 'CONFIRMED');
    const revenue = bookings.reduce((s, b) => s + (b.baseAmount || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.min(Math.round((activeVehicles.length / totalCapacity) * 100), 100) : 0;

    res.json({
      success: true,
      data: {
        listingsCount: listings.length,
        totalCapacity,
        bookingsCount: bookings.length,
        activeCount: activeVehicles.length,
        occupancyRate,
        revenue,
        recentBookings: bookings,
      },
    });
  } catch (e) { next(e); }
});

module.exports = router;
