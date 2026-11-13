import React, { useState } from 'react';
import { IconCar, IconBike, IconEV, IconCheck } from './Icons';

export default function SlotSelector({ slots = [], selectedSlot, onSelectSlot, vehicleType = 'CAR' }) {
  const [activeFloor, setActiveFloor] = useState('all');

  const floors = ['all', ...new Set(slots.map((s) => s.floor).filter(Boolean))];

  const filteredSlots = activeFloor === 'all'
    ? slots
    : slots.filter((s) => s.floor === activeFloor);

  return (
    <div className="slot-layout-card">
      <div className="between" style={{ marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h3 style={{ fontSize: '17px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="logo-icon" style={{ width: '22px', height: '22px', fontSize: '13px' }}>P</span>
            Select Your Dedicated Parking Bay
          </h3>
          <p className="muted small">Real-time floor map. Tap an available green bay to guarantee your spot.</p>
        </div>

        {/* Floor selector tabs */}
        {floors.length > 2 && (
          <div className="quick-cities" style={{ justifyContent: 'flex-start' }}>
            {floors.map((f) => (
              <button
                key={f}
                type="button"
                className={`city-chip ${activeFloor === f ? 'active' : ''}`}
                onClick={() => setActiveFloor(f)}
              >
                {f === 'all' ? 'All Floors' : f}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="slot-legend">
        <div className="legend-item">
          <div className="legend-color legend-available"></div>
          <span>Available</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-selected"></div>
          <span>Selected</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-occupied"></div>
          <span>Occupied</span>
        </div>
        <div className="legend-item">
          <div className="legend-color legend-ev"></div>
          <span>EV Fast Charger</span>
        </div>
      </div>

      {/* 2D Parking Deck Grid */}
      <div className="parking-floor-bay">
        {filteredSlots.map((slot) => {
          const isSelected = selectedSlot === slot.slotNumber;
          const isOccupied = slot.isOccupied;

          let statusClass = 'available';
          if (isOccupied) statusClass = 'occupied';
          else if (isSelected) statusClass = 'selected';

          return (
            <div
              key={slot.slotNumber}
              className={`slot-box ${statusClass} ${slot.isEV ? 'ev-bay' : ''}`}
              onClick={() => {
                if (!isOccupied && onSelectSlot) {
                  onSelectSlot(slot.slotNumber);
                }
              }}
              title={`${slot.slotNumber}: ${isOccupied ? 'Occupied' : 'Vacant'} ${slot.isEV ? '(EV Bay)' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0 4px' }}>
                <span className="slot-number">{slot.slotNumber}</span>
                {slot.isEV && <IconEV size={12} className="ok" />}
              </div>

              <div style={{ opacity: isOccupied ? 0.35 : 0.85, marginTop: '2px' }}>
                {slot.vehicleType === 'BIKE' ? <IconBike size={18} /> : <IconCar size={18} />}
              </div>

              <span className="small mono" style={{ fontSize: '10px', marginTop: '2px', fontWeight: 600 }}>
                {isSelected ? 'SELECTED' : isOccupied ? 'TAKEN' : 'VACANT'}
              </span>
            </div>
          );
        })}
      </div>

      {selectedSlot && (
        <div style={{
          marginTop: '16px',
          padding: '10px 16px',
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div className="row gap-sm">
            <IconCheck size={18} className="ok" />
            <span style={{ fontSize: '13px', color: '#fff' }}>
              Reserved Bay: <strong className="mono" style={{ color: '#fbbf24' }}>{selectedSlot}</strong>
            </span>
          </div>
          <span className="small muted">Guaranteed sensor lock upon check-in</span>
        </div>
      )}
    </div>
  );
}
