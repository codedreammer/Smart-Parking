const mongoose = require('mongoose');
module.exports = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, match: /^[6-9]\d{9}$/ },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['USER', 'OWNER', 'ADMIN'], default: 'USER' },
  savedVehicles: [{
    plateNumber: { type: String, uppercase: true },
    vehicleType: { type: String, default: 'CAR' },
    nickname: String,
  }],
  isActive: { type: Boolean, default: true },
}, { timestamps: true }));
