import { Link, useLocation, useNavigate } from 'react-router';
import {
  LayoutDashboard,
  CalendarCheck,
  Building2,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';
import { useRole } from './RoleSwitcher';
import { STORAGE_KEYS } from '../../config/api';

interface StoredUser {
  name?: string;
  email?: string;
  isAdmin?: boolean;
  isManager?: boolean;
}

function readStoredUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

function initialsFor(name?: string): string {
  if (!name) return 'AH';
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('') || 'AH';
}

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['admin', 'staff'] },
  { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings', roles: ['admin', 'staff'] },
  { icon: Building2, label: 'Hotels & Rooms', path: '/admin/hotels', roles: ['admin'] },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', roles: ['admin'] },
  { icon: Settings, label: 'Settings', path: '/admin/settings', roles: ['admin', 'staff'] },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentRole = useRole();

  const storedUser = readStoredUser();
  const displayName = storedUser?.name || 'Admin User';
  const displayRole = storedUser?.isAdmin
    ? 'Hotel Admin'
    : storedUser?.isManager
    ? 'Hotel Manager'
    : 'Staff';
  const avatarInitials = initialsFor(storedUser?.name);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('userActualRole');
    localStorage.removeItem('adminRole');
    navigate('/admin/login', { replace: true });
  };

  const SidebarContent = () => (
    <div className="admin-glass-rail flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-20 items-center justify-between px-6 border-b border-black/[0.06] dark:border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-linear-to-br from-[#1ABC9C] to-[#16A085] flex items-center justify-center shadow-[0_8px_22px_-10px_rgba(26,188,156,0.55)]">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p
              className="text-[15px] font-semibold text-[#1f2937] dark:text-white leading-tight"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              United Hotels
            </p>
            <p className="text-[11px] text-[#8C8C8C] dark:text-white/55 tracking-wide uppercase">
              Partner Portal
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-[#8C8C8C] hover:text-[#3B3B3B] dark:text-white/60 dark:hover:text-white"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-5">
        <p
          className="px-3 mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#8C8C8C] dark:text-white/40"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Workspace
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
          const hasAccess = item.roles.includes(currentRole);

          if (!hasAccess) {
            return (
              <div
                key={item.path}
                className="admin-nav-link is-disabled"
                title="Admin access required"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
                <span className="flex-1">{item.label}</span>
                <Lock className="h-3.5 w-3.5" strokeWidth={2} />
              </div>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`admin-nav-link ${isActive ? 'is-active' : ''}`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
              <span className="flex-1">{item.label}</span>
            </Link>
          );
        })}

        <div className="my-4 h-px bg-linear-to-r from-transparent via-black/10 to-transparent dark:via-white/10" />

        <p
          className="px-3 mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[#8C8C8C] dark:text-white/40"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          Shortcuts
        </p>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-nav-link"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <ExternalLink className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
          <span className="flex-1">View Live Site</span>
        </a>
      </nav>

      {/* User card */}
      <div className="px-3 pb-4">
        <div className="admin-card flex items-center gap-3 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[#1ABC9C] to-[#0d9488] text-white text-sm font-semibold shadow-[0_8px_22px_-10px_rgba(26,188,156,0.55)]">
            {avatarInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-[13px] font-semibold text-[#1f2937] dark:text-white truncate"
              style={{ fontFamily: 'Inter, sans-serif' }}
              title={storedUser?.email}
            >
              {displayName}
            </p>
            <p className="text-[11px] text-[#8C8C8C] dark:text-white/55 truncate">{displayRole}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-[#8C8C8C] dark:text-white/55 hover:text-[#EF4444] dark:hover:text-[#fb7185] transition-colors p-1"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.7} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg admin-card p-2 text-[#3B3B3B] dark:text-white shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[260px] z-30">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-screen w-[260px] lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
