/**
 * Real auth-aware role display for the admin layout.
 *
 * Shows the logged-in user's role (admin / vendor) — no fake "switch to admin"
 * modal or demo credentials. The role is fetched once from `/api/users/me`
 * after login and cached in localStorage so the sidebar can filter without
 * re-hitting the server on every render.
 */

import { useEffect, useState } from 'react';
import { ShieldCheck, Tag, LogOut } from 'lucide-react';
import { authService } from '../../services/api';

export type Role = 'admin' | 'vendor';

const ROLE_KEY = 'uh_active_role';
const NAME_KEY = 'uh_active_name';

const readCachedRole = (): Role | null => {
  const raw = localStorage.getItem(ROLE_KEY);
  return raw === 'admin' || raw === 'vendor' ? raw : null;
};

export function RoleSwitcher() {
  const [role, setRole] = useState<Role | null>(readCachedRole());
  const [name, setName] = useState<string>(localStorage.getItem(NAME_KEY) || '');

  useEffect(() => {
    let active = true;
    authService.getCurrentUser()
      .then((user: any) => {
        if (!active) return;
        const r: Role | null =
          user?.isAdmin || user?.role === 'admin' ? 'admin' :
          user?.role === 'vendor' || user?.isManager ? 'vendor' : null;
        if (r) {
          setRole(r);
          setName(user?.name || user?.email || '');
          localStorage.setItem(ROLE_KEY, r);
          localStorage.setItem(NAME_KEY, user?.name || user?.email || '');
          window.dispatchEvent(new CustomEvent('roleChanged', { detail: r }));
        }
      })
      .catch(() => { /* not logged in — gating happens in AdminLayout */ });
    return () => { active = false; };
  }, []);

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(NAME_KEY);
    window.location.href = '/admin/login';
  };

  if (!role) return null;

  const isAdmin = role === 'admin';
  const Icon = isAdmin ? ShieldCheck : Tag;
  const accent = isAdmin ? '#1ABC9C' : '#3B82F6';
  const label = isAdmin ? 'Admin' : 'Vendor';

  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/70 border"
        style={{
          borderColor: `${accent}33`,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <Icon className="w-3 h-3" style={{ color: accent }} strokeWidth={2.2} />
        <span className="text-[11.5px] font-semibold text-[#3b3b3b] leading-none" style={{ fontFamily: 'Inter, sans-serif' }}>
          {label}
        </span>
        {name && <span className="text-[10.5px] text-[#8c8c8c] leading-none">· {name}</span>}
      </div>
      <button
        onClick={handleLogout}
        className="inline-flex items-center gap-1 text-[11.5px] text-[#6b7280] hover:text-[#3b3b3b] transition-colors px-1.5 py-1 rounded-md hover:bg-[#fafafa]"
        title="Sign out"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <LogOut className="w-3 h-3" strokeWidth={2} /> Sign out
      </button>
    </div>
  );
}

export function useRole(): Role | null {
  const [role, setRole] = useState<Role | null>(readCachedRole());

  useEffect(() => {
    const handler = (e: Event) => {
      const r = (e as CustomEvent<Role>).detail;
      if (r === 'admin' || r === 'vendor') setRole(r);
    };
    window.addEventListener('roleChanged', handler);

    // Resync from server in case localStorage is stale.
    authService.getCurrentUser()
      .then((user: any) => {
        const r: Role | null =
          user?.isAdmin || user?.role === 'admin' ? 'admin' :
          user?.role === 'vendor' || user?.isManager ? 'vendor' : null;
        if (r) {
          setRole(r);
          localStorage.setItem(ROLE_KEY, r);
        }
      })
      .catch(() => { /* leave as-is */ });

    return () => window.removeEventListener('roleChanged', handler);
  }, []);

  return role;
}

// Kept as a no-op export for backwards compatibility with old call sites.
// The role now follows the real auth state and can't be set client-side.
export function setUserActualRole(_role: Role) {
  // intentional no-op
}
