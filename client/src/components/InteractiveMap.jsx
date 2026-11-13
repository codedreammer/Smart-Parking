import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconMapPin, IconEV, IconCar, IconStar, IconArrowRight } from './Icons';
import { inr } from '../utils/format';

export default function InteractiveMap({ items = [], onSelectParking, selectedId }) {
  const [activePin, setActivePin] = useState(null);

  const getNodePosition = (p, idx) => {
    const coords = p.location?.coordinates || [77.6, 27.4];
    const x = ((coords[0] * 137 + idx * 23) % 76) + 12;
    const y = ((coords[1] * 191 + idx * 31) % 72) + 14;
    return { top: `${y}%`, left: `${x}%` };
  };

  const selectedItem = items.find((p) => p._id === (activePin || selectedId));

  return (
    <div className="radar-map-widget">
      <div className="radar-header">
        <div className="row gap-sm">
          <span className="pulse-dot"></span>
          <span className="small font-weight-bold" style={{ fontWeight: 600, color: '#38bdf8' }}>
            Live Radar Grid ({items.length} Hubs)
          </span>
        </div>
        <span className="small muted">IoT Sensor Telemetry Active</span>
      </div>

      <div className="radar-canvas-area" onClick={() => setActivePin(null)}>
        {/* Radar concentric sweep circles */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '380px',
          height: '380px',
          border: '1px solid rgba(6, 182, 212, 0.12)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '220px',
          height: '220px',
          border: '1px solid rgba(6, 182, 212, 0.15)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}></div>

        {/* Rotating sweep line */}
        <div className="radar-sweep"></div>

        {/* Grid city roads representation */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.18, pointerEvents: 'none' }}>
          <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" />
          <line x1="68%" y1="0" x2="68%" y2="100%" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6" />
        </svg>

        {/* Parking Pins */}
        {items.map((p, idx) => {
          const isSelected = p._id === (activePin || selectedId);
          const prices = Object.values(p.pricing || {});
          const lowPrice = prices.length ? Math.min(...prices) : 30;
          const pos = getNodePosition(p, idx);

          return (
            <div
              key={p._id}
              className="map-node"
              style={pos}
              onClick={(e) => {
                e.stopPropagation();
                setActivePin(p._id);
                if (onSelectParking) onSelectParking(p);
              }}
            >
              <div className={`node-pin ${isSelected ? 'active' : ''}`}>
                <IconCar size={13} />
                <span>{inr(lowPrice)}</span>
              </div>
            </div>
          );
        })}

        {/* Preview Popover for selected parking on the map */}
        {selectedItem && (
          <div
            style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              right: '16px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              borderRadius: '12px',
              padding: '14px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 20px 30px rgba(0,0,0,0.8)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              zIndex: 30,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {selectedItem.images?.[0] && (
              <img
                src={selectedItem.images[0]}
                alt={selectedItem.name}
                style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover' }}
              />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <strong style={{ fontSize: '14px', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {selectedItem.name}
                </strong>
                <span className="ok small" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <IconStar size={12} filled /> {selectedItem.rating || '4.5'}
                </span>
              </div>
              <p className="muted small" style={{ margin: '2px 0 6px' }}>{selectedItem.address}, {selectedItem.city}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="live-badge" style={{ padding: '2px 8px', fontSize: '11px' }}>
                  <span className="pulse-dot"></span> Available
                </span>
                <span className="small mono ok">{selectedItem.capacity} Total Bays</span>
              </div>
            </div>
            <Link to={`/parking/${selectedItem._id}`} className="btn sm amber">
              Book <IconArrowRight size={13} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
