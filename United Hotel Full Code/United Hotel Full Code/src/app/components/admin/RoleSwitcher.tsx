/**
 * Real auth-aware role display for the admin layout.
 *
 * Shows the logged-in user's role (admin / vendor) — no fake "switch to admin"
 * modal or demo credentials. The role + name come from AuthContext (which
 * hydrates from /api/users/me on every app boot), so we never read a stale
 * cached blob from localStorage.
 */

import { useEffect, useState } from 'react';
import { ShieldCheck, Tag, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type Role = 'admin' | 'vendor';

function deriveRole(user: any): Role | null {
  if (!user) return null;
  if (user.isAdmin || user.role === 'admin') return 'admin';
  if (user.isManager || user.role === 'vendor') return 'vendor';
  return null;
}

export function RoleSwitcher() {
  const { user, logout } = useAuth();
  const role = deriveRole(user);
  const name = (user?.name || user?.email || '') as string;

  // Notify legacy listeners (sidebar menus etc.) so they re-filter when role
  // becomes available. Cheap, fires once per role change.
  useEffect(() => {
    if (role) window.dispatchEvent(new CustomEvent('roleChanged', { detail: role }));
  }, [role]);

  const handleLogout = () => {
    logout();
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
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(deriveRole(user));

  useEffect(() => {
    setRole(deriveRole(user));
  }, [user]);

  // Listen for legacy 'roleChanged' events emitted elsewhere in the app.
  useEffect(() => {
    const handler = (e: Event) => {
      const r = (e as CustomEvent<Role>).detail;
      if (r === 'admin' || r === 'vendor') setRole(r);
    };
    window.addEventListener('roleChanged', handler);
    return () => window.removeEventListener('roleChanged', handler);
  }, []);

  return role;
}

// Kept as a no-op export for backwards compatibility with old call sites.
// The role now follows the real auth state and can't be set client-side.
export function setUserActualRole(_role: Role) {
  // intentional no-op
}
