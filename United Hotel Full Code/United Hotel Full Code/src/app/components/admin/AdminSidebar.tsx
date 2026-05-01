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
  Tag,
  ChevronLeft,
  Mail,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRole } from './RoleSwitcher';
import { authService } from '../../services/api';
import svgPaths from '../../../imports/svg-nkrjt6kvoj';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin', roles: ['admin', 'vendor'] },
  { icon: CalendarCheck, label: 'Bookings', path: '/admin/bookings', roles: ['admin', 'vendor'] },
  { icon: Building2, label: 'Hotels & Rooms', path: '/admin/hotels', roles: ['admin', 'vendor'] },
  { icon: Users, label: 'Users', path: '/admin/users', roles: ['admin'] },
  { icon: Tag, label: 'Vendor Pricing', path: '/vendor', roles: ['admin'] },
  { icon: BarChart3, label: 'Analytics', path: '/admin/analytics', roles: ['admin', 'vendor'] },
  { icon: Mail, label: 'Email Logs', path: '/admin/email-logs', roles: ['admin'] },
  { icon: Settings, label: 'Settings', path: '/admin/settings', roles: ['admin', 'vendor'] },
];

const COLLAPSED_KEY = 'uh_admin_sidebar_collapsed';

// Width helper kept in sync with the consumer (AdminLayout) so the main
// content area can offset itself by the right amount when state changes.
export const SIDEBAR_WIDTH = { expanded: 220, collapsed: 64 };

const UnitedHotelsLogo = ({ withWordmark = true }: { withWordmark?: boolean }) => (
  <div className="flex items-center gap-2 min-w-0">
    <div className="h-[22px] w-[24px] shrink-0">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 26">
        <mask fill="white" id="uh-admin-logo-mask">
          <path d={svgPaths.p32095b00} />
        </mask>
        <path d={svgPaths.p32095b00} fill="#1ABC9C" mask="url(#uh-admin-logo-mask)" stroke="#1ABC9C" strokeWidth="0.4" />
      </svg>
    </div>
    {withWordmark && (
      <span
        className="font-['Poppins:SemiBold',sans-serif] text-[15px] tracking-[-0.01em] text-white truncate"
      >
        United Hotels
      </span>
    )}
  </div>
);

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  });
  const currentRole = useRole();

  // Persist + broadcast width changes so AdminLayout can re-offset the main
  // content area (CSS only listens to its own width var).
  useEffect(() => {
    localStorage.setItem(COLLAPSED_KEY, collapsed ? '1' : '0');
    window.dispatchEvent(new CustomEvent('admin:sidebar-toggle', { detail: collapsed }));
  }, [collapsed]);

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('uh_active_role');
    localStorage.removeItem('uh_active_name');
    navigate('/admin/login', { replace: true });
  };

  const SidebarContent = () => (
    <div className="relative flex h-full flex-col text-white bg-[#1f2937] border-r border-white/8">
      {/* subtle teal accent shimmer along the top */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(26,188,156,0.6), transparent)',
        }}
      />

      {/* Logo + collapse toggle */}
      <div className={`flex h-14 items-center border-b border-white/8 ${collapsed ? 'justify-center px-2' : 'justify-between px-4'}`}>
        <Link to="/admin" className="hover:opacity-90 transition-opacity" onClick={() => setMobileOpen(false)}>
          <UnitedHotelsLogo withWordmark={!collapsed} />
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="hidden lg:inline-flex h-7 w-7 items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.06] rounded-md transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-white/60 hover:text-white transition-colors"
          aria-label="Close menu"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Floating expand button when collapsed (desktop only) */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="hidden lg:flex absolute -right-3 top-16 h-6 w-6 items-center justify-center rounded-full bg-[#1f2937] text-white/70 hover:text-white border border-white/10 shadow-md hover:bg-[#2a3441] transition-colors z-50"
          title="Expand sidebar"
          aria-label="Expand sidebar"
        >
          <ChevronLeft className="h-3 w-3 rotate-180" />
        </button>
      )}

      {/* Navigation */}
      <nav className={`flex-1 space-y-0.5 py-3 overflow-y-auto ${collapsed ? 'px-2' : 'px-2.5'}`}>
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
                title={collapsed ? item.label : undefined}
                className={`group relative flex items-center rounded-lg text-[13px] font-medium transition-all ${
                  collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-2'
                } ${
                  isActive
                    ? 'bg-[#1ABC9C]/15 text-[#5eead4] shadow-[inset_0_0_0_1px_rgba(26,188,156,0.25)]'
                    : 'text-white/65 hover:bg-white/[0.06] hover:text-white'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {isActive && !collapsed && (
                  <span aria-hidden className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-[#1ABC9C]" />
                )}
                <Icon className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}

        <div className={`my-3 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent ${collapsed ? 'mx-1' : 'mx-2'}`} />

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? 'View Live Site' : undefined}
          className={`flex items-center rounded-lg text-[13px] font-medium text-white/55 transition-all hover:bg-white/[0.06] hover:text-white ${
            collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-2'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <ExternalLink className="h-[15px] w-[15px] shrink-0" strokeWidth={1.75} />
          {!collapsed && <span>View Live Site</span>}
        </a>
      </nav>

      {/* User Section */}
      <div className={`border-t border-white/8 ${collapsed ? 'px-2 py-3' : 'px-3 py-3'}`}>
        <div className={`flex items-center rounded-lg ${collapsed ? 'flex-col gap-2 py-1' : 'gap-2.5 px-1.5 py-1'}`}>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-[11px] font-semibold shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1ABC9C, #16A085)',
              boxShadow: '0 4px 12px -4px rgba(26,188,156,0.55)',
            }}
            title={collapsed ? 'Admin User' : undefined}
          >
            AH
          </div>
          {!collapsed && (
            <>
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
                aria-label="Sign out"
              >
                <LogOut className="h-[15px] w-[15px]" strokeWidth={1.75} />
              </button>
            </>
          )}
          {collapsed && (
            <button
              className="text-white/45 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/[0.06]"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="h-[15px] w-[15px]" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 lg:hidden rounded-lg bg-[#1f2937] p-2 text-white shadow-lg border border-white/10"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop Sidebar — width animates between expanded + collapsed */}
      <aside
        className="hidden lg:block fixed left-0 top-0 h-screen z-40 transition-[width] duration-200 ease-out"
        style={{ width: collapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay (always full width on mobile) */}
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
