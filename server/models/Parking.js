const mongoose = require('mongoose');
const VEHICLES = ['BIKE', 'CAR', 'SUV', 'AUTO', 'COMMERCIAL', 'OTHER'];
const s = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  address: String, city: { type: String, required: true }, state: String, pincode: String,
  location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: { type: [Number], default: [0, 0] } },
  capacity: { type: Number, required: true, min: 1 },
  vehicleTypes: [{ type: String, enum: VEHICLES }],
  pricing: { type: Map, of: Number },
  facilities: [String],
  images: [{ type: String }],
  slots: [{
    slotNumber: { type: String, required: true },
    vehicleType: { type: String, enum: VEHICLES, default: 'CAR' },
    floor: { type: String, default: 'Ground / Level 1' },
    isCovered: { type: Boolean, default: true },
    isEV: { type: Boolean, default: false },
    isAccessible: { type: Boolean, default: false },
  }],
  operatingHours: { open: { type: String, default: '08:00' }, close: { type: String, default: '23:00' } },
  status: { type: String, enum: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'SUSPENDED'], default: 'PENDING_APPROVAL' },
  rejectionReason: String,
  rating: { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
}, { timestamps: true });
s.index({ location: '2dsphere' });
module.exports = mongoose.model('Parking', s);
