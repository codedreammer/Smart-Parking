import React, { useState } from 'react';
import { IconQR, IconMapPin, IconClock, IconCar, IconCheck, IconCross, IconTicket } from './Icons';
import { when, inr } from '../utils/format';

export default function DigitalTicketModal({ booking, onClose, onCheckIn, onCheckOut }) {
  const [loading, setLoading] = useState(false);
  const [gateActionSuccess, setGateActionSuccess] = useState('');

  if (!booking) return null;

  const handleGateEntry = async () => {
    setLoading(true);
    setGateActionSuccess('');
    try {
      if (onCheckIn) await onCheckIn(booking._id);
      setGateActionSuccess('Barrier Gate Opened! Sensor confirmed vehicle entry.');
    } catch (err) {
      alert(err.message || 'Check-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGateExit = async () => {
    setLoading(true);
    setGateActionSuccess('');
    try {
      if (onCheckOut) await onCheckOut(booking._id);
      setGateActionSuccess('Barrier Gate Opened! Thank you for using Smart Parking.');
    } catch (err) {
      alert(err.message || 'Check-out failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px', padding: '0', background: 'transparent' }} onClick={(e) => e.stopPropagation()}>
        {/* Close icon */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-36px',
            right: '0',
            background: 'none',
            border: 'none',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          <IconCross size={24} />
        </button>

        {/* Digital Boarding Pass */}
        <div className="ticket-pass">
          <div className="ticket-header">
            <div className="between">
              <span className="live-badge" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none' }}>
                <span className="pulse-dot" style={{ backgroundColor: '#fff' }}></span>
                {booking.status}
              </span>
              <span className="mono" style={{ fontSize: '13px', letterSpacing: '1px' }}>{booking.bookingId}</span>
            </div>
            <h2 style={{ fontSize: '20px', marginTop: '10px' }}>{booking.parkingId?.name || 'Smart Parking Plaza'}</h2>
            <p style={{ opacity: 0.85, fontSize: '12px' }}>{booking.parkingId?.city || 'Verified City Lot'}</p>
          </div>

          <div className="ticket-notch-left"></div>
          <div className="ticket-notch-right"></div>

          <div style={{ padding: '24px' }}>
            {/* Quick Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <span className="muted small" style={{ display: 'block' }}>BAY</span>
                <strong className="mono" style={{ color: '#fbbf24', fontSize: '16px' }}>{booking.slotNumber || 'A-01'}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <span className="muted small" style={{ display: 'block' }}>GATE PIN</span>
                <strong className="mono ok" style={{ fontSize: '16px' }}>{booking.gatePin || '5821'}</strong>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '10px', borderRadius: '8px' }}>
                <span className="muted small" style={{ display: 'block' }}>VEHICLE</span>
                <strong className="mono" style={{ fontSize: '13px', color: '#fff' }}>{booking.vehicleNumber}</strong>
              </div>
            </div>

            {/* Timings */}
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
              <div className="between" style={{ marginBottom: '4px' }}>
                <span className="muted">Valid From</span>
                <span className="mono">{when(booking.startTime)}</span>
              </div>
              <div className="between">
                <span className="muted">Valid Until</span>
                <span className="mono">{when(booking.endTime)}</span>
              </div>
            </div>

            {/* Procedural High-Contrast QR Code */}
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <div className="qr-code-box">
                <svg width="150" height="150" viewBox="0 0 100 100">
                  {/* Outer corner finders */}
                  <rect x="5" y="5" width="26" height="26" fill="#080c15" />
                  <rect x="9" y="9" width="18" height="18" fill="#fff" />
                  <rect x="13" y="13" width="10" height="10" fill="#080c15" />

                  <rect x="69" y="5" width="26" height="26" fill="#080c15" />
                  <rect x="73" y="9" width="18" height="18" fill="#fff" />
                  <rect x="77" y="13" width="10" height="10" fill="#080c15" />

                  <rect x="5" y="69" width="26" height="26" fill="#080c15" />
                  <rect x="9" y="73" width="18" height="18" fill="#fff" />
                  <rect x="13" y="77" width="10" height="10" fill="#080c15" />

                  {/* QR Pattern dots */}
                  <rect x="36" y="8" width="6" height="6" fill="#080c15" />
                  <rect x="46" y="14" width="6" height="6" fill="#080c15" />
                  <rect x="56" y="8" width="6" height="6" fill="#080c15" />
                  <rect x="36" y="24" width="6" height="6" fill="#080c15" />
                  <rect x="12" y="38" width="6" height="6" fill="#080c15" />
                  <rect x="24" y="44" width="6" height="6" fill="#080c15" />
                  <rect x="36" y="40" width="12" height="12" fill="#080c15" />
                  <rect x="54" y="44" width="6" height="6" fill="#080c15" />
                  <rect x="66" y="38" width="6" height="6" fill="#080c15" />
                  <rect x="80" y="44" width="6" height="6" fill="#080c15" />
                  <rect x="40" y="62" width="6" height="6" fill="#080c15" />
                  <rect x="52" y="70" width="6" height="6" fill="#080c15" />
                  <rect x="64" y="62" width="6" height="6" fill="#080c15" />
                  <rect x="76" y="74" width="6" height="6" fill="#080c15" />
                  <rect x="88" y="82" width="6" height="6" fill="#080c15" />
                </svg>
              </div>
              <p className="small muted" style={{ marginTop: '8px' }}>
                Scan at entry barrier scanner or display to attendant
              </p>
            </div>

            <div className="barcode-stripe"></div>

            {/* IoT Gate Entry Simulation Actions */}
            <div style={{ marginTop: '20px' }}>
              {gateActionSuccess && (
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid var(--accent-emerald)',
                  borderRadius: '8px',
                  color: '#34d399',
                  fontSize: '13px',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}>
                  {gateActionSuccess}
                </div>
              )}

              {booking.status === 'CONFIRMED' && (
                <button
                  className="btn full emerald"
                  style={{ padding: '12px' }}
                  disabled={loading}
                  onClick={handleGateEntry}
                >
                  <IconTicket size={18} /> Simulate Gate Entry (Scan QR)
                </button>
              )}

              {booking.status === 'ACTIVE' && (
                <button
                  className="btn full amber"
                  style={{ padding: '12px' }}
                  disabled={loading}
                  onClick={handleGateExit}
                >
                  <IconTicket size={18} /> Simulate Gate Exit (Depart Lot)
                </button>
              )}

              {booking.status === 'COMPLETED' && (
                <p className="ok small text-center" style={{ textAlign: 'center', fontWeight: 600 }}>
                  ✓ Session Completed. Thank you for parking with us!
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
