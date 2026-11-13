import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { inr, when } from '../utils/format';
import { 
  IconCar, 
  IconBike, 
  IconEV, 
  IconShield, 
  IconMapPin, 
  IconClock, 
  IconSparkles 
} from '../components/Icons';

const VEH = ['BIKE', 'CAR', 'SUV', 'AUTO', 'COMMERCIAL'];
const empty = {
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  lat: '',
  lng: '',
  capacity: 20,
  vehicleTypes: ['CAR', 'BIKE'],
  pricing: { CAR: 30, BIKE: 10 },
  facilities: 'CCTV 24/7, Covered Garage, Security Guards, EV Charging',
  images: '',
};

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [list, setList] = useState([]);
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.ownerStats().then(setStats).catch(() => {});
    api.ownerParking().then(setList).catch(() => {});
  };

  useEffect(load, []);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const toggle = (v) => {
    const on = f.vehicleTypes.includes(v);
    setF({
      ...f,
      vehicleTypes: on ? f.vehicleTypes.filter((x) => x !== v) : [...f.vehicleTypes, v],
      pricing: { ...f.pricing, [v]: f.pricing[v] || 25 },
    });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg('');
    setLoading(true);
    try {
      const pricing = Object.fromEntries(f.vehicleTypes.map((v) => [v, Number(f.pricing[v])]));
      const facilities = f.facilities.split(',').map((s) => s.trim()).filter(Boolean);
      const images = f.images ? f.images.split(',').map((s) => s.trim()).filter(Boolean) : [
        'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
      ];

      await api.createParking({
        ...f,
        pricing,
        capacity: Number(f.capacity),
        facilities,
        images,
      });

      setF(empty);
      setMsg('Listing submitted for admin approval! It will go live once verified.');
      load();
    } catch (x) {
      setMsg(x.message || 'Failed to submit parking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wrap" style={{ padding: '36px 0 60px' }}>
      {/* Owner Header */}
      <div className="between" style={{ marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div className="row gap-sm" style={{ marginBottom: '6px' }}>
            <span className="role-tag">Owner Operator Portal</span>
            <span className="live-badge">
              <span className="pulse-dot"></span> Live Telemetry
            </span>
          </div>
          <h1 style={{ fontSize: '28px' }}>Facility Hub & Revenue Analytics</h1>
          <p className="muted small">Monitor live bay occupancy, configure vehicle rates, and register new facilities</p>
        </div>
      </div>

      {/* KPI Stats Bar */}
      {stats && (
        <div className="stats-bar" style={{ margin: '0 0 32px' }}>
          <div className="stat-item">
            <span className="stat-number ok">{stats.listingsCount || stats.listings || 0}</span>
            <div className="stat-label">Active Facilities</div>
          </div>
          <div className="stat-item">
            <span className="stat-number" style={{ color: '#38bdf8' }}>{stats.occupancyRate || 68}%</span>
            <div className="stat-label">Average Live Occupancy</div>
          </div>
          <div className="stat-item">
            <span className="stat-number" style={{ color: '#fbbf24' }}>{stats.activeCount || 8}</span>
            <div className="stat-label">Vehicles Parked Right Now</div>
          </div>
          <div className="stat-item">
            <span className="stat-number ok">{inr(stats.revenue || 0)}</span>
            <div className="stat-label">Total Operator Gross Earnings</div>
          </div>
        </div>
      )}

      <div className="split-view">
        {/* Left Column: My Listings & Recent Bookings */}
        <div>
          <section style={{ marginBottom: '36px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>My Registered Parking Facilities</h2>

            {list.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
                <p className="muted">You haven't listed any facilities yet. Fill out the form to add your first lot.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {list.map((p) => (
                  <div key={p._id} className="card" style={{ padding: '20px' }}>
                    <div className="between" style={{ marginBottom: '10px' }}>
                      <div className="row gap-sm">
                        <strong style={{ fontSize: '17px', color: '#fff' }}>{p.name}</strong>
                        <span className={`pill ${p.status}`}>{p.status.replace('_', ' ')}</span>
                      </div>
                      <span className="mono ok" style={{ fontSize: '13px' }}>★ {p.rating || '4.5'}</span>
                    </div>

                    <p className="muted small" style={{ marginBottom: '12px' }}>
                      {p.city} • {p.address} • {p.capacity} Monitored Bays
                    </p>

                    <div className="amenity-chips" style={{ marginBottom: '12px' }}>
                      {(p.facilities || []).slice(0, 4).map((f) => (
                        <span key={f} className="amenity-chip">{f}</span>
                      ))}
                    </div>

                    {p.rejectionReason && (
                      <p className="error" style={{ fontSize: '13px' }}>Rejection feedback: {p.rejectionReason}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recent Bookings Feed */}
          {stats?.recentBookings?.length > 0 && (
            <section>
              <h2 style={{ fontSize: '18px', marginBottom: '14px', color: 'var(--text-secondary)' }}>
                Recent Vehicle Ingress Log
              </h2>
              <div style={{ display: 'grid', gap: '10px' }}>
                {stats.recentBookings.slice(0, 5).map((b) => (
                  <div key={b._id} className="card" style={{ padding: '14px', fontSize: '13px' }}>
                    <div className="between">
                      <div>
                        <strong className="mono" style={{ color: '#fbbf24' }}>Bay {b.slotNumber || 'A-01'}</strong>
                        <span style={{ color: '#fff', marginLeft: '10px' }}>{b.vehicleNumber} ({b.vehicleType})</span>
                      </div>
                      <span className={`pill ${b.status}`}>{b.status}</span>
                    </div>
                    <div className="between muted small" style={{ marginTop: '6px' }}>
                      <span>Driver: {b.userId?.name || 'Verified Customer'}</span>
                      <span>{when(b.startTime)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Column: Add Parking Facility Form */}
        <form className="card" onSubmit={submit}>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontSize: '20px' }}>Add New Parking Hub</h2>
            <p className="muted small">List your commercial or residential lot to start earning.</p>
          </div>

          <label>
            Facility Name
            <input required value={f.name} onChange={set('name')} placeholder="e.g. Metro Heights Covered Parking" />
          </label>

          <label>
            Description & Highlights
            <textarea
              rows={2}
              value={f.description}
              onChange={set('description')}
              placeholder="e.g. 24/7 manned security, wide bays, automated gate barriers."
            />
          </label>

          <label>
            Street Address
            <input required value={f.address} onChange={set('address')} placeholder="e.g. 14 Station Road" />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '12px' }}>
            <label>
              City
              <input required value={f.city} onChange={set('city')} placeholder="Mathura / Agra / Delhi" />
            </label>
            <label>
              Pincode
              <input value={f.pincode} onChange={set('pincode')} placeholder="281001" />
            </label>
          </div>

          <label>
            Total Capacity (Bays)
            <input type="number" min="1" max="500" value={f.capacity} onChange={set('capacity')} />
          </label>

          {/* Vehicle Rates Matrix */}
          <div style={{ margin: '16px 0' }}>
            <span className="muted small" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Permitted Vehicle Types & Hourly Rates (₹/hr)
            </span>
            <div style={{ display: 'grid', gap: '8px' }}>
              {VEH.map((v) => (
                <div key={v} className="between" style={{ background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={f.vehicleTypes.includes(v)}
                      onChange={() => toggle(v)}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    <span>{v}</span>
                  </label>
                  {f.vehicleTypes.includes(v) ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', width: '110px' }}>
                      <span className="small muted">₹</span>
                      <input
                        type="number"
                        min="5"
                        value={f.pricing[v] || ''}
                        onChange={(e) => setF({ ...f, pricing: { ...f.pricing, [v]: e.target.value } })}
                        style={{ margin: 0, padding: '6px 8px' }}
                      />
                    </div>
                  ) : (
                    <span className="small muted">Disabled</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <label>
            Amenities (Comma-separated)
            <input
              value={f.facilities}
              onChange={set('facilities')}
              placeholder="CCTV 24/7, Covered Garage, EV Charging, Valet Service"
            />
          </label>

          <label>
            Photo Image URLs (Comma-separated, optional)
            <input
              value={f.images}
              onChange={set('images')}
              placeholder="https://images.unsplash.com/..."
            />
          </label>

          {msg && (
            <p className={msg.includes('approval') ? 'ok' : 'error'} style={{ margin: '12px 0' }}>
              {msg}
            </p>
          )}

          <button className="btn full amber" disabled={loading} style={{ padding: '14px', marginTop: '10px' }}>
            {loading ? 'Submitting…' : 'Submit Facility For Verification'}
          </button>
        </form>
      </div>
    </div>
  );
}
