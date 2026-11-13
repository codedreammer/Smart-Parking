import React, { useState } from 'react';
import { IconCreditCard, IconCheck, IconCross, IconShield, IconSparkles } from './Icons';
import { inr } from '../utils/format';

export default function PaymentModal({ booking, onClose, onSuccess }) {
  const [method, setMethod] = useState('UPI');
  const [upiId, setUpiId] = useState('driver@oksbi');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8821');
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(false);
  const [error, setError] = useState('');

  if (!booking) return null;

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      // Simulate real-world gateway latency
      await new Promise((res) => setTimeout(res, 900));
      if (onSuccess) {
        await onSuccess(booking._id, method);
      }
      setPaid(true);
    } catch (err) {
      setError(err.message || 'Payment simulation failed');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '18px',
            right: '18px',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
        >
          <IconCross size={20} />
        </button>

        {!paid ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', color: '#38bdf8', marginBottom: '12px' }}>
                <IconShield size={28} />
              </div>
              <h2 style={{ fontSize: '22px' }}>Secure Checkout</h2>
              <p className="muted small">Smart Parking Instant Payment Gateway</p>
            </div>

            {/* Bill Preview */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px',
            }}>
              <div className="between small" style={{ marginBottom: '6px' }}>
                <span className="muted">Booking ID</span>
                <span className="mono">{booking.bookingId}</span>
              </div>
              <div className="between small" style={{ marginBottom: '6px' }}>
                <span className="muted">Assigned Spot</span>
                <strong className="mono" style={{ color: '#fbbf24' }}>Bay {booking.slotNumber || 'A-01'}</strong>
              </div>
              <div className="between small" style={{ marginBottom: '6px' }}>
                <span className="muted">Duration</span>
                <span>{booking.duration} hr(s)</span>
              </div>
              <div style={{ borderTop: '1px dashed rgba(255, 255, 255, 0.1)', margin: '10px 0' }}></div>
              <div className="between" style={{ fontSize: '18px', fontWeight: 800 }}>
                <span>Amount to Pay</span>
                <span className="ok">{inr(booking.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '20px' }}>
              {[
                { id: 'UPI', label: 'UPI / QR' },
                { id: 'CARD', label: 'Card' },
                { id: 'FASTAG', label: 'Fastag' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: `1px solid ${method === m.id ? 'var(--accent-cyan)' : 'var(--border-subtle)'}`,
                    background: method === m.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: method === m.id ? '#fff' : '#94a3b8',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Method Details */}
            {method === 'UPI' && (
              <div style={{ marginBottom: '20px' }}>
                <label>
                  UPI VPA / ID
                  <input
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@okhdfcbank"
                  />
                </label>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <span
                      key={app}
                      onClick={() => setUpiId(`driver@${app.toLowerCase()}`)}
                      className="city-chip"
                      style={{ fontSize: '11px', cursor: 'pointer' }}
                    >
                      {app}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {method === 'CARD' && (
              <div style={{ marginBottom: '20px' }}>
                <label>
                  Card Number
                  <input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="16-digit card number"
                  />
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '8px' }}>
                  <label>
                    Expiry (MM/YY)
                    <input defaultValue="08/28" />
                  </label>
                  <label>
                    CVV
                    <input defaultValue="•••" type="password" maxLength={3} />
                  </label>
                </div>
              </div>
            )}

            {method === 'FASTAG' && (
              <div style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '13px',
              }}>
                <p><strong>Fastag Auto-Debit</strong></p>
                <p className="muted small">Vehicle {booking.vehicleNumber} linked wallet will automatically deduct upon barrier passage.</p>
              </div>
            )}

            {error && <p className="error">{error}</p>}

            <button
              className="btn full emerald"
              style={{ padding: '14px', fontSize: '15px' }}
              disabled={loading}
              onClick={handlePay}
            >
              {loading ? 'Authorizing Payment…' : `Confirm & Pay ${inr(booking.totalAmount)}`}
            </button>
            <p className="muted small text-center" style={{ textAlign: 'center', marginTop: '12px' }}>
              🔒 256-bit encrypted • Instant server confirmation
            </p>
          </>
        ) : (
          /* Payment Success State */
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--accent-emerald)',
              color: 'var(--accent-emerald)',
              display: 'grid',
              placeContent: 'center',
              margin: '0 auto 20px',
            }}>
              <IconCheck size={36} />
            </div>

            <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '8px' }}>Payment Confirmed!</h2>
            <p className="muted small" style={{ marginBottom: '24px' }}>
              Booking <strong>{booking.bookingId}</strong> has been secured. Your digital parking pass is ready.
            </p>

            <button
              className="btn full amber"
              style={{ padding: '14px', fontSize: '15px' }}
              onClick={onClose}
            >
              <IconSparkles size={18} /> View Digital Parking Pass
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
