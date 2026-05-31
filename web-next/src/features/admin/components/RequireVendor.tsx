import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { useAuth } from '@/shared/context/AuthContext';

interface RequireVendorProps {
  children: ReactNode;
}

export function RequireVendor({ children }: RequireVendorProps) {
  const location = useLocation();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  const allowed =
    isAuthenticated &&
    Boolean(user?.role === 'vendor' || user?.isManager || user?.isAdmin);
  if (!allowed) {
    return <Navigate to="/vendor/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
