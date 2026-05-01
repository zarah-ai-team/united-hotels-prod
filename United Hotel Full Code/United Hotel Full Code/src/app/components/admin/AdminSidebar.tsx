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
    // Clear any auth tokens/session
    navigate('/admin/login');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-[#3B3B3B]">
      {/* Logo Section */}
      <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
        <div>
          <h1 className="text-xl font-semibold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
            United Hotels
          </h1>
          <p className="text-sm text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>
            Partner Portal
          </p>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden text-white/70 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
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
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors
                ${isActive 
                  ? 'border-l-3 border-[#1ABC9C] bg-[#1ABC9C]/5 text-[#1ABC9C]' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                }
              `}
              style={{ 
                fontFamily: 'Inter, sans-serif',
                borderLeftWidth: isActive ? '3px' : '0',
                borderLeftColor: isActive ? '#1ABC9C' : 'transparent'
              }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.5} />
              {item.label}
            </Link>
          );
        })}

        <div className="my-4 border-t border-white/10" />

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          <ExternalLink className="h-5 w-5" strokeWidth={1.5} />
          View Live Site
        </a>
      </nav>

      {/* User Section */}
      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1ABC9C] text-white font-semibold">
            AH
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
              Admin User
            </p>
            <p className="text-xs text-white/50">Hotel Admin</p>
          </div>
          <button className="text-white/50 hover:text-white transition-colors" onClick={handleLogout}>
            <LogOut className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden rounded-lg bg-[#3B3B3B] p-2 text-white shadow-lg"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[260px]">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
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