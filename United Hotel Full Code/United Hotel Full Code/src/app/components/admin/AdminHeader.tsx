import { Search, Bell, User, LogOut, Home } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { RoleSwitcher } from './RoleSwitcher';
import { authService } from '../../services/api';

interface AdminHeaderProps {
  title: string;
  breadcrumb?: string;
}

export function AdminHeader({ title, breadcrumb }: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('uh_active_role');
    localStorage.removeItem('uh_active_name');
    navigate('/admin/login', { replace: true });
  };

  const notifications = [
    { id: 1, text: 'New booking from John Smith', time: '5 min ago', unread: true },
    { id: 2, text: 'Payment received - BK-1247', time: '1 hour ago', unread: true },
    { id: 3, text: 'Review posted for Grand Palace Hotel', time: '2 hours ago', unread: false },
    { id: 4, text: 'Room 204 checked out', time: '3 hours ago', unread: false },
  ];

  return (
    // Slimmer (h-12 vs h-16) + frosted so it visually pairs with the dark
    // sidebar. Light theme: white/80; dark theme: slate/80 with a faint
    // bottom border that picks up the page bg.
    <header
      className="sticky top-0 z-30 h-12 border-b border-[#EAEAEA]/70 dark:border-white/8 bg-white/80 dark:bg-[#11151a]/85"
      style={{ backdropFilter: 'blur(14px) saturate(140%)', WebkitBackdropFilter: 'blur(14px) saturate(140%)' }}
    >
      <div className="flex h-full items-center justify-between pl-12 pr-5 lg:pl-6 lg:pr-6">
        {/* Page Title & Breadcrumb — single line, smaller */}
        <div className="flex items-center gap-2 min-w-0">
          {breadcrumb && (
            <span
              className="text-[11px] text-[#9aa0a6] dark:text-white/45 uppercase tracking-[0.12em]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {breadcrumb}
            </span>
          )}
          {breadcrumb && <span className="text-[#d4d4d8] dark:text-white/25 text-[11px]">/</span>}
          <h1
            className="text-[14px] font-semibold text-[#1f2937] dark:text-white truncate"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {title}
          </h1>
        </div>

        {/* Right Section — denser controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Role Switcher (smaller now via its own component) */}
          <RoleSwitcher />

          {/* Search Input — narrower, slimmer */}
          <div className="hidden lg:flex items-center gap-1.5 rounded-lg border border-[#EAEAEA] bg-white/60 px-2.5 py-1 w-52 hover:border-[#1ABC9C]/40 transition-colors">
            <Search className="h-3.5 w-3.5 text-[#9aa0a6]" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search bookings, hotels..."
              className="flex-1 bg-transparent text-[12.5px] text-[#3B3B3B] placeholder:text-[#9aa0a6] focus:outline-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-1.5 hover:bg-[#FAFAFA] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-[15px] w-[15px] text-[#6b7280]" strokeWidth={1.75} />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#EF4444] ring-2 ring-white" />
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-72 bg-white/95 rounded-xl shadow-xl border border-[#EAEAEA] py-1 z-50"
                style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
              >
                <div className="px-3 py-2 border-b border-[#EAEAEA]">
                  <h3 className="font-semibold text-[12.5px] text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Notifications
                  </h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      className={`w-full px-3 py-2 text-left hover:bg-[#FAFAFA] transition-colors border-b border-[#EAEAEA]/60 last:border-0 ${
                        notif.unread ? 'bg-[#1ABC9C]/[0.04]' : ''
                      }`}
                    >
                      <p className="text-[12.5px] text-[#3B3B3B] mb-0.5 leading-snug" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {notif.text}
                      </p>
                      <p className="text-[10.5px] text-[#9aa0a6]">{notif.time}</p>
                    </button>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-[#EAEAEA]">
                  <button className="text-[12px] text-[#1ABC9C] font-medium hover:text-[#16A085]">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar — smaller (28px vs 36px) */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white text-[11px] font-semibold transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #1ABC9C, #16A085)',
                boxShadow: '0 4px 10px -4px rgba(26,188,156,0.55)',
              }}
              aria-label="Account menu"
            >
              AH
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white/95 rounded-xl shadow-xl border border-[#EAEAEA] py-1 z-50"
                style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
              >
                <div className="px-3 py-2 border-b border-[#EAEAEA]">
                  <p className="font-semibold text-[12.5px] text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Admin User
                  </p>
                  <p className="text-[10.5px] text-[#9aa0a6] truncate">admin@unitedhotels.com</p>
                </div>
                <Link
                  to="/"
                  className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-[#3B3B3B] hover:bg-[#FAFAFA] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Home className="h-[14px] w-[14px]" strokeWidth={1.75} />
                  View Live Site
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-[#3B3B3B] hover:bg-[#FAFAFA] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <User className="h-[14px] w-[14px]" strokeWidth={1.75} />
                  Profile Settings
                </Link>
                <div className="border-t border-[#EAEAEA] my-0.5" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-[#EF4444] hover:bg-[#FAFAFA] transition-colors w-full text-left"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <LogOut className="h-[14px] w-[14px]" strokeWidth={1.75} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
