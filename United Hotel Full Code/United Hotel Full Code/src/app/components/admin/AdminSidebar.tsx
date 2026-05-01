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
  Users,
  Tag
} from 'lucide-react';
import { useState } from 'react';
import { useRole } from './RoleSwitcher';
import { authService } from '../../services/api';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['admin', 'vendor'] },
  { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings', roles: ['admin', 'vendor'] },
  { icon: Building2, label: 'Hotels & Rooms', path: '/admin/hotels', roles: ['admin', 'vendor'] },
  { icon: Users, label: 'Users', path: '/admin/users', roles: ['admin'] },
  { icon: Tag, label: 'Vendor Pricing', path: '/vendor', roles: ['admin'] },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', roles: ['admin'] },
  { icon: Settings, label: 'Settings', path: '/admin/settings', roles: ['admin', 'vendor'] },
];

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentRole = useRole();

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('uh_active_role');
    localStorage.removeItem('uh_active_name');
    navigate('/admin/login', { replace: true });
  };

  const SidebarContent = () => (
    // Frost-glass effect: a translucent dark gradient with backdrop-blur. The
    // page-body teal aurora behind shows through as a subtle wash, while the
    // 95% alpha keeps text fully legible. The right-edge highlight gives the
    // panel a slight bevel against the bright content area.
    <div
      className="relative flex h-full flex-col text-white shadow-[8px_0_24px_-12px_rgba(15,23,42,0.35)]"
      style={{
        background:
          'linear-gradient(180deg, rgba(31,41,55,0.92) 0%, rgba(15,42,40,0.94) 60%, rgba(8,30,28,0.96) 100%)',
        backdropFilter: 'blur(22px) saturate(140%)',
        WebkitBackdropFilter: 'blur(22px) saturate(140%)',
        borderRight: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* subtle teal accent shimmer along the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(26,188,156,0.6), transparent)',
        }}
      />

      {/* Logo Section — slimmer (h-14 vs h-20) */}
      <div className="flex h-14 items-center justify-between border-b border-white/8 px-5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{
              background: 'linear-gradient(135deg, #1ABC9C, #2dd4bf)',
              boxShadow: '0 6px 16px -6px rgba(26,188,156,0.65)',
            }}
          >
            <span className="text-white font-bold text-[12px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              UH
            </span>
          </div>
          <div className="leading-tight">
            <h1 className="text-[14px] font-semibold text-white tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              United Hotels
            </h1>
            <p className="text-[10px] text-white/55 tracking-wider uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
              Partner Portal
            </p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-white/60 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation — denser items: py-1.5, smaller icons (16px) */}
      <nav className="flex-1 space-y-0.5 px-2.5 py-3 overflow-y-auto">
        {navItems
          .filter((item) => currentRole && item.roles.includes(currentRole))
          .map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all ${
                  isActive
                    ? 'bg-[#1ABC9C]/15 text-[#5eead4] shadow-[inset_0_0_0_1px_rgba(26,188,156,0.25)]'
                    : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {/* Active indicator pill on the left */}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-[#1ABC9C]"
                  />
                )}
                <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}

        <div className="my-3 mx-2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium text-white/55 transition-all hover:bg-white/[0.06] hover:text-white"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <ExternalLink className="h-[15px] w-[15px]" strokeWidth={1.75} />
          View Live Site
        </a>
      </nav>

      {/* User Section — compact: 32px avatar, tighter text */}
      <div className="border-t border-white/8 px-3 py-3">
        <div className="flex items-center gap-2.5 rounded-lg px-1.5 py-1">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-[11px] font-semibold shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1ABC9C, #16A085)',
              boxShadow: '0 4px 12px -4px rgba(26,188,156,0.55)',
            }}
          >
            AH
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12.5px] font-medium text-white truncate leading-tight" style={{ fontFamily: 'Inter, sans-serif' }}>
              Admin User
            </p>
            <p className="text-[10.5px] text-white/45 leading-tight">Hotel Admin</p>
          </div>
          <button
            className="text-white/45 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/[0.06]"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut className="h-[15px] w-[15px]" strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button — smaller and more polished */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 lg:hidden rounded-lg bg-[#1f2937]/90 backdrop-blur p-2 text-white shadow-lg border border-white/10"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop Sidebar — 220px wide (was 260px) */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[220px] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="fixed left-0 top-0 z-50 h-screen w-[220px] lg:hidden">
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
