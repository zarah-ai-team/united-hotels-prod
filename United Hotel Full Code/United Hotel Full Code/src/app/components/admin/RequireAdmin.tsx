import { Navigate, useLocation } from 'react-router';
import type { ReactNode } from 'react';
import { STORAGE_KEYS } from '../../config/api';

interface StoredUser {
  isAdmin?: boolean;
  isManager?: boolean;
}

function readStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;
    return JSON.parse(raw) as StoredUser;
  } catch {
    return null;
  }
}

interface RequireAdminProps {
  children: ReactNode;
}

export function RequireAdmin({ children }: RequireAdminProps) {
  const location = useLocation();
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const user = readStoredUser();

  const allowed = Boolean(token) && Boolean(user?.isAdmin || user?.isManager);
  if (!allowed) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
