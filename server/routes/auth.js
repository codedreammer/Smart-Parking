const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
const pub = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, savedVehicles: u.savedVehicles || [] });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !password || password.length < 8)
      return res.status(400).json({ success: false, message: 'Name, email and a password of 8+ characters are required' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ success: false, message: 'Email already registered' });
    const user = await User.create({
      name, email, phone: phone || undefined, passwordHash: await bcrypt.hash(password, 10),
      role: role === 'OWNER' ? 'OWNER' : 'USER',
    });
    res.status(201).json({ success: true, data: { token: sign(user), user: pub(user) } });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash)))
      return res.status(401).json({ success: false, message: 'Wrong email or password' });
    res.json({ success: true, data: { token: sign(user), user: pub(user) } });
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json({ success: true, data: pub(req.user) }));

// Saved vehicles
router.get('/vehicles', protect, async (req, res) => {
  res.json({ success: true, data: req.user.savedVehicles || [] });
});

router.post('/vehicles', protect, async (req, res, next) => {
  try {
    const { plateNumber, vehicleType = 'CAR', nickname } = req.body;
    if (!plateNumber) return res.status(400).json({ success: false, message: 'License plate number is required' });
    const cleanPlate = plateNumber.toUpperCase().trim();
    const user = await User.findById(req.user._id);
    const existing = user.savedVehicles.find((v) => v.plateNumber === cleanPlate);
    if (!existing) {
      user.savedVehicles.push({ plateNumber: cleanPlate, vehicleType, nickname });
      await user.save();
    }
    res.status(201).json({ success: true, data: user.savedVehicles });
  } catch (e) { next(e); }
});

module.exports = router;
