# Smart Parking Platform (MERN) — Milestone Build (~45%)

Smart parking marketplace and telemetry network. Interactive 2D parking bay selector, simulated UPI/Razorpay payment gateway, scannable digital QR boarding passes, gate entry/exit simulation, customer reviews & ratings, and operator analytics.

## What's Completed (~45%)

### Frontend & UI / Theme
- **Cyber-Aero Dark Slate Aesthetic**: Sleek dark slate (`#080c15`), electric cyan (`#06b6d4`), and safety amber (`#f59e0b`) accents with glassmorphism, glowing telemetry indicators, and micro-animations.
- **Interactive Radar Map Widget**: Real-time city hub map with animated radar sweep, occupancy pins, and click-to-preview popovers.
- **2D Visual Parking Bay Selector**: Interactive floor-by-floor layout (Level 1 / Level 2 / Open Deck) with color-coded slots (Vacant, Occupied, Selected, EV Fast Charger Bay).
- **Simulated Payment Gateway (UPI / Card / Fastag)**: Indian payment gateway modal (Google Pay, PhonePe, Paytm, BHIM, RuPay/Cards) with instant server confirmation.
- **Digital QR Boarding Pass**: Scannable procedural QR code, barcode, gate PIN, vehicle tag, and active countdown timer.
- **Customer Reviews & 5-Star Ratings**: Star ratings summary with verified driver reviews and interactive submission form.
- **1-Click Evaluator Demo Personas**: Instant login buttons in the navbar and auth page (`🚗 Driver`, `🏢 Owner`, `🛡️ Admin`) for frictionless testing.

### Backend & API
- **Complete Booking Lifecycle**:
  - `POST /api/bookings`: Reserves bay, calculates server-side pricing, generates unique booking ID, gate PIN, and QR pass secret.
  - `PATCH /api/bookings/:id/pay`: Simulates payment authorization, transitions `PENDING` $\to$ `CONFIRMED`.
  - `PATCH /api/bookings/:id/checkin`: Simulates boom barrier arrival, transitions `CONFIRMED` $\to$ `ACTIVE`.
  - `PATCH /api/bookings/:id/checkout`: Simulates gate departure, transitions `ACTIVE` $\to$ `COMPLETED`.
  - `PATCH /api/bookings/:id/cancel`: Cancellation and mock refund handling.
- **Parking & Slot Telemetry**:
  - `GET /api/parking/:id/slots`: Returns 2D bay layout annotated with real-time occupancy.
  - `GET /api/parking/:id/reviews` & `POST /api/parking/:id/reviews`: Fetches and submits driver reviews, automatically recalculating the facility's rating.
- **User Vehicle Profiles**:
  - `GET /api/auth/vehicles` & `POST /api/auth/vehicles`: Saves vehicle license plates and nicknames for 1-click checkout.
- **Enhanced Operator & Admin Analytics**:
  - Live occupancy gauge (%), active vehicle ingress count, operator revenue, and platform gross volume.

## Quick Run

Requires Node 18+ and MongoDB running locally.

```bash
# 1. Start Server
cd server
npm install
npm run seed       # Seeds Mathura, Agra & Delhi hubs with slots, photos & test accounts
npm run dev        # http://localhost:5000

# 2. Start Client (in a separate terminal)
cd client
npm install
npm run dev        # http://localhost:5173
```

### Pre-Configured Test Personas (Password: `Password@123`)
- **Driver Persona**: `user@sp.in` (Book bays, test UPI payment, view QR tickets, simulate gate check-in/out)
- **Operator Persona**: `owner@sp.in` (Monitor live lot occupancy, view earnings, register new hubs)
- **Admin Persona**: `admin@sp.in` (Review pending facility applications, monitor network telemetry)
