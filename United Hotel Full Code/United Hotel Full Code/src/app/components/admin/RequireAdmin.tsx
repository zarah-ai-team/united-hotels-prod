import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RequireAdminProps {
  children: ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  // While the initial /me request is in flight, render nothing rather than
  // bouncing to /admin/login. Otherwise a hard refresh on an admin page
  // would briefly redirect every time before the user state hydrates.
  if (loading) return null;

  const allowed = isAuthenticated && Boolean(user?.isAdmin || user?.isManager);
  if (!allowed) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
