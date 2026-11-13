import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { inr, when } from '../utils/format';
import { IconShield, IconCheck, IconCross, IconMapPin, IconClock } from '../components/Icons';

export default function AdminDashboard() {
  const [s, setS] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = () => {
    api.adminStats().then(setS).catch(() => {});
    api.adminPending().then(setPending).catch(() => {});
  };

  useEffect(load, []);

  const handleApprove = async (id) => {
    try {
      await api.approve(id);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Specify rejection reason for the owner:');
    if (!reason) return;
    try {
      await api.reject(id, reason);
      load();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="wrap" style={{ padding: '36px 0 60px' }}>
      {/* Admin Header */}
      <div style={{ marginBottom: '28px' }}>
        <div className="row gap-sm" style={{ marginBottom: '6px' }}>
          <span className="role-tag" style={{ background: 'rgba(244,63,94,0.2)', color: '#fb7185' }}>Admin Security Clearance</span>
          <span className="live-badge">
            <span className="pulse-dot"></span> System Oversight Active
          </span>
        </div>
        <h1 style={{ fontSize: '28px' }}>Platform Operations & Approvals</h1>
        <p className="muted small">Audit facility listings, verify compliance, and inspect live network bookings</p>
      </div>

      {/* KPI Stats Bar */}
      {s && (
        <div className="stats-bar" style={{ margin: '0 0 32px' }}>
          <div className="stat-item">
            <span className="stat-number ok">{s.parking || 0}</span>
            <div className="stat-label">Approved Live Hubs</div>
          </div>
          <div className="stat-item">
            <span className="stat-number" style={{ color: '#fbbf24' }}>{s.pending || pending.length}</span>
            <div className="stat-label">Pending Verification</div>
          </div>
          <div className="stat-item">
            <span className="stat-number" style={{ color: '#38bdf8' }}>{s.bookings || 0}</span>
            <div className="stat-label">Platform Bookings</div>
          </div>
          <div className="stat-item">
            <span className="stat-number ok">{inr(s.grossVolume || 0)}</span>
            <div className="stat-label">Network Gross Volume</div>
          </div>
        </div>
      )}

      {/* Pending Approvals Queue */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '20px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>Pending Facility Approvals</span>
          <span className="pill PENDING">{pending.length} Waiting</span>
        </h2>

        {pending.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '36px' }}>
            <IconCheck size={32} className="ok" style={{ margin: '0 auto 12px' }} />
            <h3>All Facilities Verified</h3>
            <p className="muted small" style={{ marginTop: '4px' }}>There are currently no listings pending compliance approval.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {pending.map((p) => (
              <div key={p._id} className="card" style={{ borderLeft: '4px solid var(--accent-amber)' }}>
                <div className="between" style={{ flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    {p.images?.[0] && (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        style={{ width: '80px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                    )}
                    <div>
                      <strong style={{ fontSize: '18px', color: '#fff' }}>{p.name}</strong>
                      <p className="muted small">
                        <IconMapPin size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        {p.address}, {p.city} • {p.capacity} Bays
                      </p>
                      <p className="small" style={{ color: 'var(--accent-cyan)', marginTop: '2px' }}>
                        Listed by: {p.ownerId?.name} ({p.ownerId?.email} • {p.ownerId?.phone || 'No phone'})
                      </p>
                    </div>
                  </div>

                  <div className="row gap-sm">
                    <button
                      className="btn sm emerald"
                      onClick={() => handleApprove(p._id)}
                    >
                      <IconCheck size={14} /> Approve & Publish
                    </button>
                    <button
                      className="btn-ghost sm"
                      style={{ color: '#fb7185', borderColor: 'rgba(244,63,94,0.3)' }}
                      onClick={() => handleReject(p._id)}
                    >
                      <IconCross size={14} /> Reject
                    </button>
                  </div>
                </div>

                <div className="amenity-chips" style={{ marginTop: '14px' }}>
                  {(p.facilities || []).map((f) => (
                    <span key={f} className="amenity-chip">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Network Bookings Feed */}
      {s?.recentBookings?.length > 0 && (
        <section>
          <h2 style={{ fontSize: '18px', marginBottom: '14px', color: 'var(--text-secondary)' }}>
            Network-Wide Ingress Stream
          </h2>
          <div style={{ display: 'grid', gap: '10px' }}>
            {s.recentBookings.map((b) => (
              <div key={b._id} className="card" style={{ padding: '14px', fontSize: '13px' }}>
                <div className="between">
                  <div>
                    <strong style={{ color: '#fff' }}>{b.bookingId}</strong>
                    <span className="muted" style={{ marginLeft: '8px' }}>@ {b.parkingId?.name}</span>
                    <span className="small mono ok" style={{ marginLeft: '8px' }}>Bay {b.slotNumber || 'A-01'}</span>
                  </div>
                  <span className={`pill ${b.status}`}>{b.status}</span>
                </div>
                <div className="between muted small" style={{ marginTop: '6px' }}>
                  <span>Driver: {b.userId?.name} ({b.vehicleNumber})</span>
                  <span>Amount: {inr(b.totalAmount)}</span>
                  <span>{when(b.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
