import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import ParkingCard from '../components/ParkingCard';
import InteractiveMap from '../components/InteractiveMap';
import { IconSearch, IconCar, IconMapPin, IconEV, IconCovered } from '../components/Icons';

export default function Search() {
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get('q') || '');
  const [vehicle, setVehicle] = useState(sp.get('vehicle') || '');
  const [filterEV, setFilterEV] = useState(false);
  const [filterCovered, setFilterCovered] = useState(false);
  const [list, setList] = useState(null);
  const [err, setErr] = useState('');
  const [selectedParkingId, setSelectedParkingId] = useState(null);

  const performSearch = () => {
    setList(null);
    setErr('');
    const qs = {};
    if (sp.get('q')) qs.q = sp.get('q');
    if (vehicle) qs.vehicle = vehicle;

    api.search(qs)
      .then((data) => {
        let filtered = data || [];
        if (filterEV) {
          filtered = filtered.filter((p) => (p.facilities || []).some((f) => f.toLowerCase().includes('ev')));
        }
        if (filterCovered) {
          filtered = filtered.filter((p) => (p.facilities || []).some((f) => f.toLowerCase().includes('covered')));
        }
        setList(filtered);
      })
      .catch((e) => setErr(e.message));
  };

  useEffect(() => {
    performSearch();
  }, [sp, vehicle, filterEV, filterCovered]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const nextParams = {};
    if (q) nextParams.q = q;
    if (vehicle) nextParams.vehicle = vehicle;
    setSp(nextParams);
  };

  const handleCityPick = (city) => {
    setQ(city);
    setSp(city ? { q: city } : {});
  };

  return (
    <div className="wrap" style={{ paddingTop: '28px' }}>
      {/* Search Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>Explore Smart Parking Hubs</h1>
        <p className="muted small">Real-time availability, sensor-monitored bays & instant reservations</p>
      </div>

      {/* Filter and Search Bar */}
      <form className="search-box" style={{ margin: '0 0 16px' }} onSubmit={handleSearchSubmit}>
        <div className="search-field">
          <IconSearch size={16} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by city, landmark or garage name…"
            aria-label="Location"
          />
        </div>

        <div className="search-field">
          <IconCar size={16} />
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)} aria-label="Vehicle type">
            <option value="">All Vehicle Types</option>
            {['CAR', 'SUV', 'BIKE', 'AUTO', 'COMMERCIAL'].map((v) => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn amber">Search</button>
      </form>

      {/* Quick City & Amenity Filters */}
      <div className="between" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div className="quick-cities" style={{ justifyContent: 'flex-start' }}>
          <button
            type="button"
            className={`city-chip ${!sp.get('q') ? 'active' : ''}`}
            onClick={() => handleCityPick('')}
          >
            All Locations
          </button>
          {['Mathura', 'Agra', 'Delhi', 'Connaught Place'].map((city) => (
            <button
              key={city}
              type="button"
              className={`city-chip ${sp.get('q') === city ? 'active' : ''}`}
              onClick={() => handleCityPick(city)}
            >
              {city}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`city-chip ${filterEV ? 'active' : ''}`}
            onClick={() => setFilterEV(!filterEV)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <IconEV size={12} /> EV Charging Only
          </button>
          <button
            type="button"
            className={`city-chip ${filterCovered ? 'active' : ''}`}
            onClick={() => setFilterCovered(!filterCovered)}
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <IconCovered size={12} /> Covered Garage
          </button>
        </div>
      </div>

      {err && <p className="error">{err}</p>}

      {/* Split View: Listings + Radar Map */}
      <div className="split-view">
        {/* Listings column */}
        <div>
          <div className="between" style={{ marginBottom: '14px' }}>
            <span className="small muted">
              {list ? `Showing ${list.length} verified parking facilities` : 'Scanning live bays…'}
            </span>
          </div>

          {!list && !err && (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <div className="pulse-dot" style={{ margin: '0 auto 12px', width: '12px', height: '12px' }}></div>
              <p className="muted">Fetching real-time sensor updates…</p>
            </div>
          )}

          {list?.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
              <IconMapPin size={32} className="muted" style={{ margin: '0 auto 12px' }} />
              <h3>No Parking Hubs Found</h3>
              <p className="muted small" style={{ marginTop: '6px' }}>
                Try selecting "All Locations" or removing specific amenity filters.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gap: '20px' }}>
            {list?.map((p) => (
              <div
                key={p._id}
                onMouseEnter={() => setSelectedParkingId(p._id)}
              >
                <ParkingCard p={p} />
              </div>
            ))}
          </div>
        </div>

        {/* Live Interactive Map Column */}
        <div>
          <InteractiveMap
            items={list || []}
            selectedId={selectedParkingId}
            onSelectParking={(p) => setSelectedParkingId(p._id)}
          />
        </div>
      </div>
    </div>
  );
}
