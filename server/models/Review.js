const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  parkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, trim: true },
  vehicleType: { type: String, default: 'CAR' },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
