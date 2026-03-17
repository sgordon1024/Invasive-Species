// ProtectedRoute — guards pages that require authentication.
// requireStaff=true additionally requires the is_staff flag.

import { Navigate, useLocation } from 'react-router-dom';
import { usePassport } from './PassportContext';

export default function ProtectedRoute({ children, requireStaff = false }) {
  const { user, profile, loading } = usePassport();
  const location = useLocation();

  // Still resolving session — show nothing to avoid flash of wrong content.
  if (loading) {
    return (
      <div className="pp-loading-screen">
        <div className="pp-spinner" />
      </div>
    );
  }

  // Not logged in → send to login, preserve the intended destination.
  if (!user) {
    return <Navigate to="/passport/login" state={{ from: location }} replace />;
  }

  // Staff-only route and user is not staff.
  if (requireStaff && !profile?.is_staff) {
    return <Navigate to="/passport/profile" replace />;
  }

  return children;
}
