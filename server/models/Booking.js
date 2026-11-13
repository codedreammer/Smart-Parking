const mongoose = require('mongoose');
module.exports = mongoose.model('Booking', new mongoose.Schema({
  bookingId: { type: String, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  parkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleType: String, vehicleNumber: String,
  slotNumber: { type: String, default: 'General' },
  startTime: Date, endTime: Date, duration: Number,
  baseAmount: Number, platformFee: Number, totalAmount: Number,
  status: { type: String, enum: ['PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'], default: 'PENDING' },
  payment: {
    paymentId: String,
    method: { type: String, enum: ['UPI', 'CARD', 'FASTAG', 'NETBANKING', 'CASH'], default: 'UPI' },
    status: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
    paidAt: Date,
    transactionRef: String,
  },
  qrPassCode: String,
  gatePin: String,
  checkInTime: Date,
  checkOutTime: Date,
}, { timestamps: true }));
