import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { inr, when } from '../utils/format';
import SlotSelector from '../components/SlotSelector';
import PaymentModal from '../components/PaymentModal';
import DigitalTicketModal from '../components/DigitalTicketModal';
import ReviewSection from '../components/ReviewSection';
import { 
  IconStar, 
  IconMapPin, 
  IconClock, 
  IconShield, 
  IconEV, 
  IconCCTV, 
  IconCovered, 
  IconValet, 
  IconCar, 
  IconCheck, 
  IconSparkles 
} from '../components/Icons';

const localTimeStr = (d) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default function ParkingDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();

  const [p, setP] = useState(null);
  const [vehicle, setVehicle] = useState('CAR');
  const [num, setNum] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [start, setStart] = useState(localTimeStr(new Date(Date.now() + 1800000))); // in 30 mins
  const [end, setEnd] = useState(localTimeStr(new Date(Date.now() + 3.5 * 3600000))); // 3 hours
  const [avail, setAvail] = useState(null);
  const [slotsList, setSlotsList] = useState([]);
  const [err, setErr] = useState('');
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Modals state
  const [activeBooking, setActiveBooking] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);

  useEffect(() => {
    api.parking(id)
      .then((d) => {
        setP(d);
        if (d.vehicleTypes?.length) setVehicle(d.vehicleTypes[0]);
      })
      .catch((e) => setErr(e.message));
  }, [id]);

  // Load availability and live slots layout
  useEffect(() => {
    if (!p || new Date(end) <= new Date(start)) return;
    const startIso = new Date(start).toISOString();
    const endIso = new Date(end).toISOString();

    api.availability(id, startIso, endIso).then(setAvail).catch(() => {});
    api.slots(id, startIso, endIso).then((slots) => {
      setSlotsList(slots || []);
      // Auto-select first vacant slot if none selected
      const firstVacant = (slots || []).find((s) => !s.isOccupied);
      if (firstVacant && !selectedSlot) {
        setSelectedSlot(firstVacant.slotNumber);
      }
    }).catch(() => {});
  }, [p, start, end, id]);

  // Prefill vehicle from user's saved vehicles if available
  useEffect(() => {
    if (user?.savedVehicles?.length && !num) {
      setNum(user.savedVehicles[0].plateNumber);
    }
  }, [user]);

  if (!p) {
    return (
      <div className="wrap" style={{ padding: '60px 0', textAlign: 'center' }}>
        <div className="pulse-dot" style={{ margin: '0 auto 12px' }}></div>
        <p className={`muted ${err ? 'error' : ''}`}>{err || 'Connecting to parking telemetry…'}</p>
      </div>
    );
  }

  const hours = Math.max(Math.ceil((new Date(end) - new Date(start)) / 3600000), 1);
  const rate = p.pricing?.[vehicle] || (p.pricing instanceof Map ? p.pricing.get(vehicle) : 30) || 30;
  const platformFee = 5;
  const totalAmount = hours * rate + platformFee;

  const handleBookClick = async () => {
    if (!user) return nav('/login');
    setErr('');
    try {
      const booking = await api.book({
        parkingId: id,
        vehicleType: vehicle,
        vehicleNumber: num || 'UP85 AB 1234',
        slotNumber: selectedSlot || 'A-01',
        startTime: new Date(start).toISOString(),
        endTime: new Date(end).toISOString(),
      });
      setActiveBooking(booking);
      setShowPaymentModal(true);
    } catch (e) {
      setErr(e.message);
    }
  };

  const handlePaymentSuccess = async (bookingId, method) => {
    const updated = await api.pay(bookingId, { method });
    setActiveBooking(updated);
    setShowPaymentModal(false);
    setShowTicketModal(true);
  };

  const images = p.images?.length
    ? p.images
    : ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80'];

  return (
    <div className="wrap" style={{ padding: '30px 0 60px' }}>
      {/* Top Banner & Gallery */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{
          position: 'relative',
          height: '380px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-card)',
          background: '#000',
        }}>
          <img
            src={images[activeImageIdx]}
            alt={p.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(8, 12, 21, 0.95) 0%, rgba(8, 12, 21, 0.2) 60%, transparent 100%)',
          }}></div>

          <div style={{ position: 'absolute', bottom: '24px', left: '28px', right: '28px' }} className="between">
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
                <span className="live-badge">
                  <span className="pulse-dot"></span> Live Telemetry
                </span>
                <span style={{ background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '3px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconStar size={13} filled /> {p.rating || '4.8'} ({p.totalReviews || 24} reviews)
                </span>
              </div>
              <h1 style={{ fontSize: '32px' }}>{p.name}</h1>
              <p className="muted small" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <IconMapPin size={14} /> {p.address}, {p.city} {p.pincode}
              </p>
            </div>

            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px' }}>
                {images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt=""
                    onClick={() => setActiveImageIdx(idx)}
                    style={{
                      width: '60px',
                      height: '42px',
                      borderRadius: '6px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      border: idx === activeImageIdx ? '2px solid var(--accent-cyan)' : '1px solid rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="split-view">
        {/* Left Column: Information, Amenities, 2D Slot Selector, Reviews */}
        <div>
          <div className="card" style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>About This Facility</h2>
            <p style={{ color: '#cbd5e1', lineHeight: '1.7', marginBottom: '20px' }}>
              {p.description || 'Modern automated smart parking facility equipped with high-speed boom barriers, CCTV surveillance, and designated EV charging stations.'}
            </p>

            <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Key Amenities & Capabilities</h3>
            <div className="amenity-chips" style={{ gap: '10px' }}>
              {(p.facilities || []).map((f) => (
                <span key={f} className="amenity-chip" style={{ padding: '6px 12px', fontSize: '13px' }}>
                  {f.toLowerCase().includes('ev') && <IconEV size={14} className="ok" />}
                  {f.toLowerCase().includes('cctv') && <IconCCTV size={14} />}
                  {f.toLowerCase().includes('covered') && <IconCovered size={14} />}
                  {f.toLowerCase().includes('valet') && <IconValet size={14} />}
                  {f.toLowerCase().includes('security') && <IconShield size={14} />}
                  <span>{f}</span>
                </span>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <span className="muted small" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconClock size={14} /> Operating Hours
                </span>
                <strong style={{ fontSize: '15px', color: '#fff', display: 'block', marginTop: '2px' }}>
                  {p.operatingHours?.open || '06:00'} to {p.operatingHours?.close || '23:30'}
                </strong>
              </div>
              <div>
                <span className="muted small" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <IconCar size={14} /> Total Capacity
                </span>
                <strong style={{ fontSize: '15px', color: '#fff', display: 'block', marginTop: '2px' }}>
                  {p.capacity} Monitored Bays
                </strong>
              </div>
            </div>
          </div>

          {/* Interactive 2D Parking Bay Layout Selector */}
          <SlotSelector
            slots={slotsList}
            selectedSlot={selectedSlot}
            onSelectSlot={setSelectedSlot}
            vehicleType={vehicle}
          />

          {/* Customer Reviews Section */}
          <ReviewSection
            parkingId={id}
            currentRating={p.rating}
            totalReviews={p.totalReviews}
          />
        </div>

        {/* Right Column: Sticky Booking Console */}
        <aside className="card" style={{ position: 'sticky', top: '88px' }}>
          <div className="between" style={{ marginBottom: '16px' }}>
            <h2 style={{ fontSize: '20px' }}>Reserve Space</h2>
            <span className="rate-badge" style={{ color: 'var(--accent-cyan)' }}>
              {inr(rate)}<small>/hr</small>
            </span>
          </div>

          {/* Vehicle selection */}
          <label>
            Vehicle Type
            <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
              {(p.vehicleTypes || ['CAR', 'BIKE']).map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>

          {/* Vehicle plate number */}
          <label>
            Vehicle Number (License Plate)
            <input
              value={num}
              onChange={(e) => setNum(e.target.value.toUpperCase())}
              placeholder="e.g. UP85 AB 1234"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}
            />
          </label>

          {/* Timings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <label>
              Entry Date & Time
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
              />
            </label>
            <label>
              Exit Date & Time
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
              />
            </label>
          </div>

          {/* Availability Status */}
          {avail && (
            <div style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: avail.available > 0 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
              border: `1px solid ${avail.available > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
              color: avail.available > 0 ? '#34d399' : '#fb7185',
              fontSize: '13px',
              margin: '12px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <span className="pulse-dot" style={{ backgroundColor: avail.available > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}></span>
              <strong>{avail.available} of {avail.total} spaces vacant</strong> for this time slot.
            </div>
          )}

          {/* Selected Bay Confirmation */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            padding: '10px 14px',
            margin: '14px 0',
            fontSize: '13px',
          }} className="between">
            <span className="muted">Assigned Bay</span>
            <strong className="mono" style={{ color: '#fbbf24' }}>
              {selectedSlot ? `Bay ${selectedSlot}` : 'Auto-Allocate on Entry'}
            </strong>
          </div>

          {/* Price Calculation Bill */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '10px',
            padding: '14px',
            margin: '16px 0',
            fontSize: '13px',
          }}>
            <div className="between" style={{ marginBottom: '6px' }}>
              <span className="muted">{hours} hr(s) × {inr(rate)}</span>
              <span>{inr(hours * rate)}</span>
            </div>
            <div className="between" style={{ marginBottom: '6px' }}>
              <span className="muted">Platform & Gateway fee</span>
              <span>{inr(platformFee)}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }}></div>
            <div className="between" style={{ fontSize: '17px', fontWeight: 800 }}>
              <span>Total Payable</span>
              <span className="ok">{inr(totalAmount)}</span>
            </div>
          </div>

          {err && <p className="error">{err}</p>}

          <button
            className="btn full amber"
            style={{ padding: '14px', fontSize: '15px' }}
            disabled={!hours || avail?.available === 0}
            onClick={handleBookClick}
          >
            <IconSparkles size={18} />
            {user ? `Reserve Bay & Pay ${inr(totalAmount)}` : 'Log In to Reserve Bay'}
          </button>

          <p className="muted small text-center" style={{ textAlign: 'center', marginTop: '12px' }}>
            Instant QR Ticket generated upon payment. Cancel anytime before start time.
          </p>
        </aside>
      </div>

      {/* Payment Gateway Modal */}
      {showPaymentModal && activeBooking && (
        <PaymentModal
          booking={activeBooking}
          onClose={() => {
            setShowPaymentModal(false);
            nav('/dashboard');
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Digital Parking Pass Modal */}
      {showTicketModal && activeBooking && (
        <DigitalTicketModal
          booking={activeBooking}
          onClose={() => {
            setShowTicketModal(false);
            nav('/dashboard');
          }}
          onCheckIn={async (id) => {
            const updated = await api.checkin(id);
            setActiveBooking(updated);
          }}
          onCheckOut={async (id) => {
            const updated = await api.checkout(id);
            setActiveBooking(updated);
          }}
        />
      )}
    </div>
  );
}
