require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Parking = require('../models/Parking');
const Review = require('../models/Review');
const Booking = require('../models/Booking');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Promise.all([
      User.deleteMany({}),
      Parking.deleteMany({}),
      Review.deleteMany({}),
      Booking.deleteMany({}),
    ]);

    const passwordHash = await bcrypt.hash('Password@123', 10);
    const [, owner, driver] = await User.create([
      { name: 'Admin Control', email: 'admin@sp.in', passwordHash, role: 'ADMIN', phone: '9876543210' },
      { name: 'Rohan Sharma (Owner)', email: 'owner@sp.in', passwordHash, role: 'OWNER', phone: '9876543211' },
      {
        name: 'Asha Verma',
        email: 'user@sp.in',
        passwordHash,
        role: 'USER',
        phone: '9876543212',
        savedVehicles: [
          { plateNumber: 'UP85 AB 1234', vehicleType: 'CAR', nickname: 'My Honda City' },
          { plateNumber: 'UP85 XY 9988', vehicleType: 'BIKE', nickname: 'Royal Enfield' },
        ],
      },
    ]);

    const base = { ownerId: owner._id, status: 'APPROVED' };

    const generateSlots = (count = 20) => {
      return Array.from({ length: count }, (_, i) => {
        const row = String.fromCharCode(65 + Math.floor(i / 5));
        const num = String((i % 5) + 1).padStart(2, '0');
        const isEV = i % 4 === 1;
        const isCovered = i < 15;
        const vehicleType = i < 4 ? 'BIKE' : (i > count - 4 ? 'SUV' : 'CAR');
        return {
          slotNumber: `${row}-${num}`,
          vehicleType,
          floor: i < 10 ? 'Level 1 (Covered Ground)' : 'Level 2 (Open Deck)',
          isCovered,
          isEV,
          isAccessible: i === 0,
        };
      });
    };

    const parkings = await Parking.create([
      {
        ...base,
        name: 'Krishna Plaza Smart Multi-Level',
        description: 'Automated barrier entry, covered bay with 24/7 CCTV surveillance and fast EV charging stations near Holi Gate.',
        city: 'Mathura',
        state: 'Uttar Pradesh',
        address: 'Holi Gate Market Road',
        pincode: '281001',
        capacity: 80,
        vehicleTypes: ['CAR', 'BIKE', 'SUV'],
        pricing: { CAR: 30, BIKE: 10, SUV: 45 },
        facilities: ['EV Charging', 'CCTV 24/7', 'Covered Garage', 'Security Guards', 'Fastag Auto-Barrier'],
        images: [
          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
          'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80',
        ],
        location: { type: 'Point', coordinates: [77.6737, 27.4924] },
        slots: generateSlots(20),
        rating: 4.8,
        totalReviews: 3,
        operatingHours: { open: '06:00', close: '23:30' },
      },
      {
        ...base,
        name: 'Mathura Junction Railway Hub',
        description: 'Prime outdoor lot located 50m from Mathura Junction Gate 2. Hassle-free drop & pick parking with 2-wheeler dedicated bays.',
        city: 'Mathura',
        state: 'Uttar Pradesh',
        address: 'Station Road, Mathura Junction Gate 2',
        pincode: '281001',
        capacity: 120,
        vehicleTypes: ['CAR', 'BIKE', 'AUTO'],
        pricing: { CAR: 20, BIKE: 8, AUTO: 15 },
        facilities: ['Security Guards', 'Floodlights', 'CCTV 24/7', 'Quick Entry Gate'],
        images: [
          'https://images.unsplash.com/photo-1621972750749-0fdd14726b4d?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        ],
        location: { type: 'Point', coordinates: [77.6890, 27.4800] },
        slots: generateSlots(24),
        rating: 4.3,
        totalReviews: 2,
        operatingHours: { open: '00:00', close: '23:59' },
      },
      {
        ...base,
        name: 'Taj Gateway AeroPark Agra',
        description: 'Ultra-modern covered underground garage with valet assistance, high-speed DC fast chargers and automatic number plate recognition (ANPR).',
        city: 'Agra',
        state: 'Uttar Pradesh',
        address: 'Sanjay Place Commercial Complex',
        pincode: '282002',
        capacity: 180,
        vehicleTypes: ['CAR', 'SUV', 'BIKE'],
        pricing: { CAR: 40, SUV: 55, BIKE: 15 },
        facilities: ['EV Charging', 'Covered Garage', 'Valet Service', 'ANPR Camera', 'Wheelchair Access'],
        images: [
          'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80',
        ],
        location: { type: 'Point', coordinates: [78.0081, 27.1767] },
        slots: generateSlots(25),
        rating: 4.9,
        totalReviews: 2,
        operatingHours: { open: '07:00', close: '23:00' },
      },
      {
        ...base,
        name: 'Connaught Place Central Hub',
        description: 'Automated multi-level smart parking structure in the heart of Delhi. Touchless QR code entry and real-time floor availability indicators.',
        city: 'Delhi',
        state: 'Delhi',
        address: 'Outer Circle, Connaught Place',
        pincode: '110001',
        capacity: 250,
        vehicleTypes: ['CAR', 'SUV', 'BIKE'],
        pricing: { CAR: 50, SUV: 70, BIKE: 20 },
        facilities: ['EV Charging', 'Multi-Level', 'Covered Garage', 'ANPR Camera', 'Valet Service', '24/7 Security'],
        images: [
          'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
        ],
        location: { type: 'Point', coordinates: [77.2167, 28.6304] },
        slots: generateSlots(30),
        rating: 4.7,
        totalReviews: 2,
        operatingHours: { open: '00:00', close: '23:59' },
      },
    ]);

    // Seed Sample Reviews
    await Review.create([
      {
        parkingId: parkings[0]._id,
        userId: driver._id,
        userName: 'Asha Verma',
        rating: 5,
        comment: 'Super easy contactless entry using the QR pass. The EV charging bay worked seamlessly!',
        vehicleType: 'CAR',
      },
      {
        parkingId: parkings[0]._id,
        userId: driver._id,
        userName: 'Vikram Malhotra',
        rating: 4,
        comment: 'Very clean and spacious bays. Guards were helpful with directing to Slot A-03.',
        vehicleType: 'SUV',
      },
      {
        parkingId: parkings[2]._id,
        userId: driver._id,
        userName: 'Priya Sen',
        rating: 5,
        comment: 'Best parking in Agra Sanjay Place. Fastag entry was instant and shade kept the car cool.',
        vehicleType: 'CAR',
      },
    ]);

    // Seed 1 active sample booking for driver
    const startTime = new Date();
    const endTime = new Date(Date.now() + 3 * 3600000);
    await Booking.create({
      bookingId: 'SP-2026-000001',
      userId: driver._id,
      parkingId: parkings[0]._id,
      ownerId: owner._id,
      vehicleType: 'CAR',
      vehicleNumber: 'UP85 AB 1234',
      slotNumber: 'A-02',
      startTime,
      endTime,
      duration: 3,
      baseAmount: 90,
      platformFee: 5,
      totalAmount: 95,
      status: 'CONFIRMED',
      gatePin: '4921',
      qrPassCode: 'SP-PASS-KRISHNA-001',
      payment: {
        paymentId: 'PAY-SAMPLE-01',
        method: 'UPI',
        status: 'PAID',
        paidAt: new Date(),
        transactionRef: 'UPI-98421098234',
      },
    });

    console.log('Seeded database successfully with rich Smart Parking assets!');
    console.log('Credentials (Password: Password@123):');
    console.log('Admin: admin@sp.in | Owner: owner@sp.in | Driver: user@sp.in');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
})();
