import { Routes, Route, Link } from 'react-router-dom';
import Navbar from './components/Navbar';
import Protected from './routes/Protected';
import Home from './pages/Home';
import Search from './pages/Search';
import ParkingDetails from './pages/ParkingDetails';
import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { IconMapPin, IconShield, IconSparkles } from './components/Icons';

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: 'calc(100vh - 220px)' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search />} />
          <Route path="/parking/:id" element={<ParkingDetails />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
          <Route path="/dashboard" element={<Protected roles={['USER', 'OWNER']}><UserDashboard /></Protected>} />
          <Route path="/owner" element={<Protected roles={['OWNER']}><OwnerDashboard /></Protected>} />
          <Route path="/admin" element={<Protected roles={['ADMIN']}><AdminDashboard /></Protected>} />
          <Route path="*" element={
            <div className="wrap" style={{ padding: '80px 0', textAlign: 'center' }}>
              <h2>Page Not Found</h2>
              <p className="muted" style={{ margin: '12px 0 20px' }}>The destination you are looking for does not exist.</p>
              <Link to="/" className="btn sm amber">Return Home</Link>
            </div>
          } />
        </Routes>
      </main>

      <footer className="foot">
        <div className="wrap">
          <div className="between" style={{ flexWrap: 'wrap', gap: '20px', marginBottom: '24px' }}>
            <div>
              <div className="row gap-sm" style={{ marginBottom: '8px' }}>
                <span className="logo-icon" style={{ width: '24px', height: '24px', fontSize: '14px' }}>P</span>
                <strong style={{ color: '#fff', fontSize: '16px' }}>Smart<span style={{ color: '#38bdf8' }}>Parking</span> Platform</strong>
              </div>
              <p className="muted small" style={{ maxWidth: '420px' }}>
                India's real-time smart parking network with IoT sensor tracking, 2D dedicated bay selection, and contactless digital QR gate passes.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', fontSize: '13px' }}>
              <div>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Active Cities</strong>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <Link to="/search?q=Mathura" className="muted">Mathura Junction</Link>
                  <Link to="/search?q=Agra" className="muted">Agra Sanjay Place</Link>
                  <Link to="/search?q=Delhi" className="muted">Delhi Connaught Place</Link>
                </div>
              </div>

              <div>
                <strong style={{ color: '#fff', display: 'block', marginBottom: '8px' }}>Quick Portals</strong>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <Link to="/search" className="muted">Find Parking</Link>
                  <Link to="/owner" className="muted">Owner Dashboard</Link>
                  <Link to="/admin" className="muted">Admin Approval</Link>
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '20px' }} className="between">
            <span className="small muted">© 2026 Smart Parking Platform</span>
            <span className="live-badge" style={{ fontSize: '11px' }}>
              <span className="pulse-dot"></span> System Operational
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
