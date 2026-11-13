import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// UI guard only; the API enforces roles for real.
export default function Protected({ roles, children }) {
  const { user, ready } = useAuth();
  if (!ready) return <p className="wrap">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
