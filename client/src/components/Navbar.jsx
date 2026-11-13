import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconCar, IconShield, IconSparkles } from './Icons';

export default function Navbar() {
  const { user, logout, login } = useAuth();
  const nav = useNavigate();
  const location = useLocation();

  const home = user?.role === 'ADMIN' ? '/admin' : user?.role === 'OWNER' ? '/owner' : '/dashboard';

  const handleQuickSwitch = async (email) => {
    try {
      await login({ email, password: 'Password@123' });
      nav(email.includes('admin') ? '/admin' : email.includes('owner') ? '/owner' : '/dashboard');
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <header className="nav">
      <div className="wrap">
        <div className="row gap">
          <Link to="/" className="logo">
            <span className="logo-icon">P</span>
            <span style={{ color: '#fff' }}>Smart<span style={{ color: '#38bdf8' }}>Parking</span></span>
          </Link>

          <span className="live-badge" style={{ display: 'none' }} id="desktop-live-indicator">
            <span className="pulse-dot"></span> Live IoT Telemetry
          </span>
        </div>

        <nav className="nav-links">
          <Link
            to="/search"
            className={`nav-link ${location.pathname === '/search' ? 'active' : ''}`}
          >
            Find Parking
          </Link>

          {user ? (
            <>
              <Link
                to={home}
                className={`nav-link ${['/dashboard', '/owner', '/admin'].includes(location.pathname) ? 'active' : ''}`}
              >
                {user.role === 'ADMIN' ? 'Admin Portal' : user.role === 'OWNER' ? 'Owner Portal' : 'My Bookings'}
              </Link>

              {user.role === 'OWNER' && (
                <Link to="/dashboard" className="nav-link">Driver Passes</Link>
              )}

              <div className="user-chip">
                <span className="role-tag">{user.role}</span>
                <span style={{ fontWeight: 600 }}>{user.name.split(' ')[0]}</span>
              </div>

              <button
                className="btn-ghost"
                style={{ padding: '6px 12px', fontSize: '12px' }}
                onClick={() => { logout(); nav('/'); }}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              {/* Quick Buttons */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch('user@sp.in')}
                  className="city-chip"
                  title="Quick login as Driver demo"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  🚗 Driver
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSwitch('owner@sp.in')}
                  className="city-chip"
                  title="Quick login as Owner demo"
                  style={{ fontSize: '11px', padding: '3px 8px' }}
                >
                  🏢 Owner
                </button>
              </div>

              <Link to="/login" className="nav-link">Log In</Link>
              <Link to="/register" className="btn sm">Sign Up</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
