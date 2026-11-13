import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import ParkingCard from '../components/ParkingCard';
import { 
  IconSearch, 
  IconCar, 
  IconBike, 
  IconEV, 
  IconShield, 
  IconQR, 
  IconSparkles, 
  IconMapPin, 
  IconArrowRight 
} from '../components/Icons';

export default function Home() {
  const [q, setQ] = useState('');
  const [vehicle, setVehicle] = useState('');
  const [featured, setFeatured] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.search({}).then((data) => setFeatured((data || []).slice(0, 3))).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (vehicle) params.set('vehicle', vehicle);
    nav(`/search?${params.toString()}`);
  };

  const handleCityPick = (city) => {
    nav(`/search?q=${encodeURIComponent(city)}`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="wrap">
          <div className="hero-pill">
            <span className="pulse-dot"></span>
            <span>Next-Gen IoT Parking Telemetry • Live Across Major Indian Hubs</span>
          </div>

          <h1>
            Park Smarter.<br />
            <span className="gradient-text">Arrive Without The Hassle.</span>
          </h1>

          <p className="lead">
            Reserve dedicated bays with real-time sensor verification, contactless fast QR gate entry, and guaranteed EV charging spots.
          </p>

          {/* Interactive Search Console */}
          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-field">
              <IconMapPin size={18} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Destination or city (e.g. Mathura, Agra, Connaught Place)"
                aria-label="Location search"
              />
            </div>

            <div className="search-field">
              <IconCar size={18} />
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                aria-label="Vehicle type"
              >
                <option value="">Any Vehicle</option>
                <option value="CAR">Car / Sedan</option>
                <option value="SUV">SUV / Large</option>
                <option value="BIKE">Two-Wheeler</option>
                <option value="AUTO">Auto Rickshaw</option>
              </select>
            </div>

            <button type="submit" className="btn amber" style={{ padding: '12px 24px', fontSize: '15px' }}>
              <IconSearch size={16} /> Find Space
            </button>
          </form>

          {/* Quick City Filter Chips */}
          <div className="quick-cities">
            <span>Popular Destinations:</span>
            {['Mathura Junction', 'Holi Gate', 'Sanjay Place Agra', 'Connaught Place', 'Noida Sec 18'].map((city) => (
              <button
                key={city}
                type="button"
                className="city-chip"
                onClick={() => handleCityPick(city)}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Live Platform Stats */}
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-number ok">10,000+</div>
              <div className="stat-label">Smart Monitored Bays</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{ color: '#38bdf8' }}>99.8%</div>
              <div className="stat-label">Slot Booking Accuracy</div>
            </div>
            <div className="stat-item">
              <div className="stat-number" style={{ color: '#fbbf24' }}>&lt; 30s</div>
              <div className="stat-label">Touchless Gate Entry</div>
            </div>
            <div className="stat-item">
              <div className="stat-number ok">4.8 ★</div>
              <div className="stat-label">Verified Driver Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Live Hubs */}
      {featured.length > 0 && (
        <section className="wrap" style={{ margin: '40px auto 60px' }}>
          <div className="between" style={{ marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '24px' }}>Featured Smart Facilities</h2>
              <p className="muted small">High-capacity covered garages with active surveillance</p>
            </div>
            <Link to="/search" className="btn sm btn-ghost">
              Explore All Hubs <IconArrowRight size={14} />
            </Link>
          </div>

          <div className="listings-grid">
            {featured.map((p) => (
              <ParkingCard key={p._id} p={p} />
            ))}
          </div>
        </section>
      )}

      {/* Why Choose Smart Parking */}
      <section className="wrap" style={{ margin: '60px auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '28px' }}>Engineered for Seamless Transit</h2>
          <p className="muted">Say goodbye to circulating blocks looking for an empty parking spot.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper">
              <IconSparkles size={24} />
            </div>
            <h3>Real-Time Bay Allocation</h3>
            <p>Visual 2D floor plans let you choose the exact bay you desire—covered, close to elevator, or EV charging equipped.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.12)', color: 'var(--accent-emerald)' }}>
              <IconQR size={24} />
            </div>
            <h3>Contactless Gate Pass</h3>
            <p>Instant digital boarding pass with scannable QR ticket and automatic Fastag integration for sub-30 second ingress.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.12)', color: 'var(--accent-amber)' }}>
              <IconEV size={24} />
            </div>
            <h3>EV Superchargers</h3>
            <p>Guaranteed Level 2 & DC Fast Charging bays reserve electricity and space simultaneously so you charge while you park.</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-purple)' }}>
              <IconShield size={24} />
            </div>
            <h3>24/7 Security & Insurance</h3>
            <p>Continuous HD CCTV coverage, manned gate attendants, and complimentary parking protection on every verified reservation.</p>
          </div>
        </div>
      </section>

      {/* How it works 3-Step Section */}
      <section className="wrap card" style={{ padding: '40px', margin: '60px auto', textAlign: 'center' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>How It Works In 3 Simple Steps</h2>
        <p className="muted small" style={{ marginBottom: '36px' }}>Reserve ahead in less than two minutes</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
          <div style={{ padding: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8', fontWeight: 800, display: 'grid', placeContent: 'center', margin: '0 auto 16px' }}>
              1
            </div>
            <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>Discover & Pick Spot</h3>
            <p className="muted small">Filter by city, vehicle size, and check the live 2D floor bay availability.</p>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', fontWeight: 800, display: 'grid', placeContent: 'center', margin: '0 auto 16px' }}>
              2
            </div>
            <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>Reserve & Pay UPI</h3>
            <p className="muted small">Lock your dedicated bay with 1-click UPI, Card, or Fastag checkout.</p>
          </div>

          <div style={{ padding: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontWeight: 800, display: 'grid', placeContent: 'center', margin: '0 auto 16px' }}>
              3
            </div>
            <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>Scan QR & Park</h3>
            <p className="muted small">Show your Digital Parking Pass at the boom barrier and glide smoothly into your bay.</p>
          </div>
        </div>

        <div style={{ marginTop: '36px' }}>
          <Link to="/search" className="btn amber" style={{ padding: '14px 28px', fontSize: '15px' }}>
            Find Your Parking Bay Now <IconArrowRight size={16} />
          </Link>
        </div>
      </section>
    </>
  );
}
