import React from 'react';
import { Link } from 'react-router-dom';
import { IconMapPin, IconStar, IconEV, IconCCTV, IconCovered, IconValet, IconArrowRight } from './Icons';
import { inr } from '../utils/format';

export default function ParkingCard({ p }) {
  const prices = Object.values(p.pricing || {});
  const low = prices.length ? Math.min(...prices) : 30;
  const coverImage = p.images?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80';

  return (
    <article className="parking-card">
      <div className="card-image-wrap">
        <img src={coverImage} alt={p.name} className="card-image" loading="lazy" />
        <div className="card-badges">
          <span className="live-badge">
            <span className="pulse-dot"></span> Live Spots Available
          </span>
          <span style={{
            background: 'var(--bg-glass)',
            backdropFilter: 'blur(8px)',
            color: '#fbbf24',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            border: '1px solid rgba(251, 191, 36, 0.3)',
          }}>
            <IconStar size={13} filled /> {p.rating || '4.5'}
          </span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">{p.name}</h3>
        <p className="card-location">
          <IconMapPin size={14} className="muted" />
          <span>{p.address}, {p.city}</span>
        </p>

        {/* Amenity Badges */}
        <div className="amenity-chips">
          {(p.facilities || []).slice(0, 4).map((f) => (
            <span key={f} className="amenity-chip">
              {f.toLowerCase().includes('ev') && <IconEV size={12} className="ok" />}
              {f.toLowerCase().includes('cctv') && <IconCCTV size={12} />}
              {f.toLowerCase().includes('covered') && <IconCovered size={12} />}
              {f.toLowerCase().includes('valet') && <IconValet size={12} />}
              <span>{f}</span>
            </span>
          ))}
        </div>

        <div className="card-footer">
          <div>
            <span className="muted small" style={{ display: 'block' }}>Hourly Rate</span>
            <div className="rate-badge">
              {inr(low)}<small>/hr</small>
            </div>
          </div>
          <Link to={`/parking/${p._id}`} className="btn sm">
            Reserve Spot <IconArrowRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
