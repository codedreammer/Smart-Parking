import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconCar, IconShield, IconSparkles } from '../components/Icons';

export default function Auth({ mode }) {
  const isReg = mode === 'register';
  const { login, register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', password: '', role: 'USER' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    setLoading(true);
    try {
      const u = isReg ? await register(f) : await login(f);
      nav(u.role === 'ADMIN' ? '/admin' : u.role === 'OWNER' ? '/owner' : '/dashboard');
    } catch (x) {
      setErr(x.message || 'Authentication failed');
      setLoading(false);
    }
  };

  const fillDemo = async (email) => {
    setErr('');
    setLoading(true);
    try {
      const u = await login({ email, password: 'Password@123' });
      nav(u.role === 'ADMIN' ? '/admin' : u.role === 'OWNER' ? '/owner' : '/dashboard');
    } catch (x) {
      setErr(x.message || 'Demo login failed');
      setLoading(false);
    }
  };

  return (
    <div className="wrap" style={{ padding: '60px 0 80px', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '36px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="logo-icon" style={{ margin: '0 auto 14px', width: '42px', height: '42px', fontSize: '22px' }}>
            P
          </div>
          <h2 style={{ fontSize: '24px', color: '#fff' }}>
            {isReg ? 'Create Driver Account' : 'Welcome to Smart Parking'}
          </h2>
          <p className="muted small" style={{ marginTop: '4px' }}>
            {isReg ? 'Join thousands of drivers reserving space ahead' : 'Access your digital passes and parking telemetry'}
          </p>
        </div>

        {}
        {!isReg && (
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '24px',
          }}>
            <span className="small muted" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              ⚡ 1-Click Evaluator Demo Personas:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              <button
                type="button"
                className="city-chip"
                style={{ fontSize: '11px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => fillDemo('user@sp.in')}
              >
                🚗 Driver
              </button>
              <button
                type="button"
                className="city-chip"
                style={{ fontSize: '11px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => fillDemo('owner@sp.in')}
              >
                🏢 Owner
              </button>
              <button
                type="button"
                className="city-chip"
                style={{ fontSize: '11px', textAlign: 'center', cursor: 'pointer' }}
                onClick={() => fillDemo('admin@sp.in')}
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        )}

        <form onSubmit={submit}>
          {isReg && (
            <label>
              Full Name
              <input required value={f.name} onChange={set('name')} placeholder="Asha Verma" />
            </label>
          )}

          <label>
            Email Address
            <input type="email" required value={f.email} onChange={set('email')} placeholder="you@domain.com" />
          </label>

          {isReg && (
            <label>
              Mobile Number (Optional)
              <input value={f.phone} onChange={set('phone')} placeholder="9876543210" />
            </label>
          )}

          <label>
            Password
            <input type="password" required minLength={8} value={f.password} onChange={set('password')} placeholder="••••••••" />
          </label>

          {isReg && (
            <label>
              Account Purpose
              <select value={f.role} onChange={set('role')}>
                <option value="USER">Driver — I want to find & book parking</option>
                <option value="OWNER">Operator — I want to list my parking facilities</option>
              </select>
            </label>
          )}

          {err && <p className="error">{err}</p>}

          <button className="btn full amber" style={{ padding: '14px', fontSize: '15px', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Authenticating…' : isReg ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
          <p className="muted small">
            {isReg ? (
              <>Already registered? <Link to="/login" style={{ color: 'var(--accent-cyan)' }}>Sign In</Link></>
            ) : (
              <>New to Smart Parking? <Link to="/register" style={{ color: 'var(--accent-cyan)' }}>Create an account</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
