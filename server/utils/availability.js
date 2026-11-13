const Booking = require('../models/Booking');
const LIVE = ['PENDING', 'CONFIRMED', 'ACTIVE'];
// Server-side availability: capacity minus bookings overlapping [start, end)
exports.available = async (parking, start, end) => {
  const used = await Booking.countDocuments({
    parkingId: parking._id, status: { $in: LIVE }, startTime: { $lt: end }, endTime: { $gt: start },
  });
  return Math.max(parking.capacity - used, 0);
};
