import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { inr, when } from '../utils/format';
import DigitalTicketModal from '../components/DigitalTicketModal';
import PaymentModal from '../components/PaymentModal';
import { 
  IconTicket, 
  IconCar, 
  IconBike, 
  IconCheck, 
  IconClock, 
  IconMapPin, 
  IconQR, 
  IconArrowRight 
} from '../components/Icons';

export default function UserDashboard() {
  const { user } = useAuth();
  const [list, setList] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [payBooking, setPayBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('passes'); // 'passes' | 'vehicles'

  // Saved vehicles state
  const [savedVehicles, setSavedVehicles] = useState(user?.savedVehicles || []);
  const [newPlate, setNewPlate] = useState('');
  const [newType, setNewType] = useState('CAR');
  const [newNick, setNewNick] = useState('');

  const load = () => {
    api.myBookings().then(setList).catch(() => {});
    api.savedVehicles().then(setSavedVehicles).catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!newPlate.trim()) return;
    try {
      const updated = await api.saveVehicle({
        plateNumber: newPlate.toUpperCase().trim(),
        vehicleType: newType,
        nickname: newNick.trim(),
      });
      setSavedVehicles(updated);
      setNewPlate('');
      setNewNick('');
    } catch (e) {
      alert(e.message);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.cancel(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const activePasses = (list || []).filter((b) => ['PENDING', 'CONFIRMED', 'ACTIVE'].includes(b.status));
  const pastPasses = (list || []).filter((b) => ['COMPLETED', 'CANCELLED'].includes(b.status));
  const totalSpent = (list || []).filter((b) => b.status !== 'CANCELLED').reduce((s, b) => s + (b.totalAmount || 0), 0);

  return (
    <div className="wrap" style={{ padding: '36px 0 60px' }}>
      {/* User Greeting & Stats Banner */}
      <div className="card" style={{ marginBottom: '28px', background: 'linear-gradient(135deg, rgba(27, 42, 64, 0.96) 0%, rgba(43, 60, 84, 0.72) 100%)' }}>
        <div className="between" style={{ flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="row gap-sm" style={{ marginBottom: '6px' }}>
              <span className="role-tag">Driver Portal</span>
              <span className="live-badge">
                <span className="pulse-dot"></span> System Connected
              </span>
            </div>
            <h1 style={{ fontSize: '28px' }}>Welcome Back, {user.name}</h1>
            <p className="muted small">Manage your digital parking passes, bay reservations & registered vehicles</p>
          </div>

          <Link to="/search" className="btn amber">
            <IconCar size={16} /> Book A New Bay
          </Link>
        </div>

        {/* Quick KPI stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <div style={{ background: 'var(--bg-control)', padding: '16px', borderRadius: '10px' }}>
            <span className="muted small">Active Passes</span>
            <strong style={{ fontSize: '26px', display: 'block', color: 'var(--accent-cyan)' }}>{activePasses.length}</strong>
          </div>
          <div style={{ background: 'var(--bg-control)', padding: '16px', borderRadius: '10px' }}>
            <span className="muted small">Total Reservations</span>
            <strong style={{ fontSize: '26px', display: 'block', color: '#fff' }}>{list?.length ?? '–'}</strong>
          </div>
          <div style={{ background: 'var(--bg-control)', padding: '16px', borderRadius: '10px' }}>
            <span className="muted small">Total Value Parked</span>
            <strong style={{ fontSize: '26px', display: 'block', color: 'var(--accent-emerald)' }}>{inr(totalSpent)}</strong>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '24px' }}>
        <button
          type="button"
          onClick={() => setActiveTab('passes')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'passes' ? 'var(--accent-cyan)' : 'transparent'}`,
            color: activeTab === 'passes' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          My Passes & Reservations ({list?.length || 0})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('vehicles')}
          style={{
            padding: '10px 16px',
            background: 'none',
            border: 'none',
            borderBottom: `2px solid ${activeTab === 'vehicles' ? 'var(--accent-cyan)' : 'transparent'}`,
            color: activeTab === 'vehicles' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
          }}
        >
          Saved Vehicles ({savedVehicles.length})
        </button>
      </div>

      {activeTab === 'passes' ? (
        <>
          {/* Active Passes Section */}
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '18px', color: '#38bdf8', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="pulse-dot"></span> Active & Upcoming Passes ({activePasses.length})
            </h2>

            {activePasses.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
                <p className="muted" style={{ marginBottom: '16px' }}>No active bookings currently.</p>
                <Link to="/search" className="btn sm">Find and reserve a parking spot</Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {activePasses.map((b) => (
                  <div key={b._id} className="card" style={{ borderLeft: '4px solid var(--accent-cyan)' }}>
                    <div className="between" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <div className="row gap-sm">
                          <strong style={{ fontSize: '17px', color: '#fff' }}>{b.parkingId?.name}</strong>
                          <span className={`pill ${b.status}`}>{b.status}</span>
                        </div>
                        <p className="muted small" style={{ marginTop: '3px' }}>
                          <IconMapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                          {b.parkingId?.address}, {b.parkingId?.city}
                        </p>
                      </div>

                      <div className="right">
                        <span className="muted small">Total</span>
                        <strong className="ok" style={{ display: 'block', fontSize: '18px' }}>{inr(b.totalAmount)}</strong>
                      </div>
                    </div>

                    <div style={{
                      background: 'var(--bg-inset)',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                      gap: '10px',
                      fontSize: '13px',
                      marginBottom: '16px',
                    }}>
                      <div>
                        <span className="muted small" style={{ display: 'block' }}>Bay Allocated</span>
                        <strong className="mono" style={{ color: '#fbbf24' }}>Bay {b.slotNumber || 'A-01'}</strong>
                      </div>
                      <div>
                        <span className="muted small" style={{ display: 'block' }}>Vehicle Plate</span>
                        <strong className="mono">{b.vehicleNumber} ({b.vehicleType})</strong>
                      </div>
                      <div>
                        <span className="muted small" style={{ display: 'block' }}>Entry Time</span>
                        <span>{when(b.startTime)}</span>
                      </div>
                      <div>
                        <span className="muted small" style={{ display: 'block' }}>Exit Time</span>
                        <span>{when(b.endTime)}</span>
                      </div>
                    </div>

                    <div className="between" style={{ flexWrap: 'wrap', gap: '10px' }}>
                      <div className="row gap-sm">
                        {/* Open QR pass */}
                        {b.status !== 'PENDING' ? (
                          <button
                            className="btn sm amber"
                            onClick={() => setSelectedTicket(b)}
                          >
                            <IconQR size={15} /> Show QR Pass & Gate PIN
                          </button>
                        ) : (
                          <button
                            className="btn sm emerald"
                            onClick={() => setPayBooking(b)}
                          >
                            Pay {inr(b.totalAmount)} (Confirm Booking)
                          </button>
                        )}
                      </div>

                      {['PENDING', 'CONFIRMED'].includes(b.status) && (
                        <button
                          className="btn-ghost"
                          style={{ color: '#fb7185', borderColor: 'rgba(244,63,94,0.3)', fontSize: '13px' }}
                          onClick={() => handleCancel(b._id)}
                        >
                          Cancel Reservation
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Past History */}
          <section>
            <h2 style={{ fontSize: '18px', marginBottom: '14px', color: 'var(--text-secondary)' }}>
              Completed & Cancelled History ({pastPasses.length})
            </h2>

            {pastPasses.length === 0 ? (
              <p className="muted small">No past booking records.</p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {pastPasses.map((b) => (
                  <div key={b._id} className="card" style={{ padding: '16px', opacity: 0.85 }}>
                    <div className="between">
                      <div>
                        <div className="row gap-sm">
                          <strong>{b.parkingId?.name}</strong>
                          <span className={`pill ${b.status}`}>{b.status}</span>
                        </div>
                        <p className="muted small">{b.bookingId} • {b.vehicleType} • {when(b.startTime)}</p>
                      </div>
                      <div className="right">
                        <strong>{inr(b.totalAmount)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        /* Saved Vehicles Tab */
        <div className="split-view">
          <div>
            <h2 style={{ fontSize: '18px', marginBottom: '14px' }}>Registered Vehicles</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {savedVehicles.length === 0 ? (
                <p className="muted small">No vehicles registered yet. Add your vehicle for 1-click checkout.</p>
              ) : (
                savedVehicles.map((v, i) => (
                  <div key={i} className="card" style={{ padding: '16px' }}>
                    <div className="between">
                      <div className="row gap">
                        <div style={{ padding: '8px', background: 'rgba(6, 182, 212, 0.1)', color: '#38bdf8', borderRadius: '8px' }}>
                          {v.vehicleType === 'BIKE' ? <IconBike size={20} /> : <IconCar size={20} />}
                        </div>
                        <div>
                          <strong className="mono" style={{ fontSize: '16px', color: '#fff' }}>{v.plateNumber}</strong>
                          <span className="muted small" style={{ display: 'block' }}>{v.nickname || `${v.vehicleType} Preset`}</span>
                        </div>
                      </div>
                      <span className="live-badge">Verified</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Vehicle Form */}
          <form className="card" onSubmit={handleAddVehicle}>
            <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>Register A Vehicle</h3>
            <label>
              License Plate Number
              <input
                required
                value={newPlate}
                onChange={(e) => setNewPlate(e.target.value.toUpperCase())}
                placeholder="e.g. DL 01 AB 9988"
              />
            </label>
            <label>
              Vehicle Type
              <select value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="CAR">Car</option>
                <option value="SUV">SUV</option>
                <option value="BIKE">Two-Wheeler</option>
                <option value="AUTO">Auto</option>
              </select>
            </label>
            <label>
              Vehicle Nickname (Optional)
              <input
                value={newNick}
                onChange={(e) => setNewNick(e.target.value)}
                placeholder="e.g. My Honda City"
              />
            </label>
            <button className="btn sm amber full" style={{ marginTop: '8px' }}>
              Save Vehicle
            </button>
          </form>
        </div>
      )}

      {/* Modals */}
      {selectedTicket && (
        <DigitalTicketModal
          booking={selectedTicket}
          onClose={() => {
            setSelectedTicket(null);
            load();
          }}
          onCheckIn={async (id) => {
            const updated = await api.checkin(id);
            setSelectedTicket(updated);
            load();
          }}
          onCheckOut={async (id) => {
            const updated = await api.checkout(id);
            setSelectedTicket(updated);
            load();
          }}
        />
      )}

      {payBooking && (
        <PaymentModal
          booking={payBooking}
          onClose={() => {
            setPayBooking(null);
            load();
          }}
          onSuccess={async (id, method) => {
            await api.pay(id, { method });
            setPayBooking(null);
            load();
          }}
        />
      )}
    </div>
  );
}
