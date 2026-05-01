import { Search, Bell, User, LogOut, Home, ChevronRight, Sun, Moon } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router';
import { RoleSwitcher } from './RoleSwitcher';
import { STORAGE_KEYS } from '../../config/api';
import { useTheme } from '../../context/ThemeContext';

interface AdminHeaderProps {
  title: string;
  breadcrumb?: string;
}

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

export function AdminHeader({ title, breadcrumb }: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const user = readStoredUser();
  const displayName = user?.name || 'Admin User';
  const email = user?.email || 'admin@unitedhotels.com';
  const initials = initialsFor(user?.name);
  const { theme, toggleTheme } = useTheme();

  // Close popovers on outside click
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem('userActualRole');
    localStorage.removeItem('adminRole');
    navigate('/admin/login', { replace: true });
  };

  const notifications = [
    { id: 1, text: 'New booking from John Smith', time: '5 min ago', unread: true },
    { id: 2, text: 'Payment received — BK-1247', time: '1 hour ago', unread: true },
    { id: 3, text: 'Review posted for Grand Palace Hotel', time: '2 hours ago', unread: false },
    { id: 4, text: 'Room 204 checked out', time: '3 hours ago', unread: false },
  ];
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="admin-glass-header sticky top-0 z-30 h-16">
      <div className="flex h-full items-center justify-between px-6 md:px-8">
        {/* Title + breadcrumb */}
        <div className="min-w-0">
          {breadcrumb && (
            <p
              className="flex items-center gap-1 text-[11px] uppercase tracking-[0.12em] text-[#8C8C8C] dark:text-white/45 mb-0.5"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <span>{breadcrumb}</span>
              <ChevronRight className="h-3 w-3" strokeWidth={2} />
              <span className="text-[#1ABC9C] dark:text-[#2dd4bf]">{title}</span>
            </p>
          )}
          <h1
            className="text-[20px] font-semibold text-[#1f2937] dark:text-white leading-tight truncate"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {title}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <RoleSwitcher />

          {/* Theme toggle — light ↔ dark, persisted via ThemeContext */}
          <button
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
            onClick={toggleTheme}
            className="theme-pill"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <Sun className="theme-pill-track-icon sun w-3.5 h-3.5" strokeWidth={2.5} />
            <Moon className="theme-pill-track-icon moon w-3.5 h-3.5" strokeWidth={2.5} />
            <span className="theme-pill-thumb">
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5" strokeWidth={2.5} />
              ) : (
                <Sun className="w-3.5 h-3.5" strokeWidth={2.5} />
              )}
            </span>
          </button>

          {/* Search */}
          <div className="hidden xl:flex items-center gap-2 rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-white/55 dark:bg-white/[0.04] backdrop-blur-md px-3.5 py-2 w-64">
            <Search className="h-4 w-4 text-[#8C8C8C] dark:text-white/50" strokeWidth={1.6} />
            <input
              type="text"
              placeholder="Search bookings, hotels…"
              className="flex-1 bg-transparent text-[13px] text-[#3B3B3B] dark:text-white placeholder:text-[#8C8C8C] dark:placeholder:text-white/40 focus:outline-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              className="relative h-9 w-9 inline-flex items-center justify-center rounded-full border border-black/[0.08] dark:border-white/[0.08] bg-white/55 dark:bg-white/[0.04] backdrop-blur-md hover:bg-white/85 dark:hover:bg-white/[0.08] transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-[18px] w-[18px] text-[#3B3B3B] dark:text-white/80" strokeWidth={1.6} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 inline-flex items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="admin-card absolute right-0 mt-2 w-80 py-2 z-50 overflow-hidden">
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-black/[0.06] dark:border-white/[0.06]">
                  <h3
                    className="text-[13px] font-semibold text-[#1f2937] dark:text-white"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Notifications
                  </h3>
                  <span className="text-[11px] text-[#8C8C8C] dark:text-white/55">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      className="w-full px-4 py-3 text-left hover:bg-white/55 dark:hover:bg-white/[0.04] transition-colors flex items-start gap-3"
                    >
                      <span
                        className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                          notif.unread ? 'bg-[#1ABC9C]' : 'bg-transparent'
                        }`}
                      />
                      <div className="min-w-0">
                        <p
                          className="text-[13px] text-[#3B3B3B] dark:text-white/85 leading-snug"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {notif.text}
                        </p>
                        <p className="text-[11px] text-[#8C8C8C] dark:text-white/45 mt-0.5">
                          {notif.time}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-black/[0.06] dark:border-white/[0.06]">
                  <button className="text-[12px] font-medium text-[#1ABC9C] hover:text-[#16A085]">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setShowUserMenu((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-[#1ABC9C] to-[#0d9488] text-white text-[12.5px] font-semibold shadow-[0_8px_22px_-10px_rgba(26,188,156,0.55)] hover:scale-105 transition-transform"
              aria-label="Open user menu"
            >
              {initials}
            </button>

            {showUserMenu && (
              <div className="admin-card absolute right-0 mt-2 w-60 py-2 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-black/[0.06] dark:border-white/[0.06]">
                  <p
                    className="text-[13px] font-semibold text-[#1f2937] dark:text-white"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {displayName}
                  </p>
                  <p className="text-[11px] text-[#8C8C8C] dark:text-white/55 truncate">{email}</p>
                </div>
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#3B3B3B] dark:text-white/85 hover:bg-white/55 dark:hover:bg-white/[0.04] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Home className="h-4 w-4" strokeWidth={1.6} />
                  View Live Site
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#3B3B3B] dark:text-white/85 hover:bg-white/55 dark:hover:bg-white/[0.04] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <User className="h-4 w-4" strokeWidth={1.6} />
                  Profile Settings
                </Link>
                <div className="h-px my-1 bg-black/[0.06] dark:bg-white/[0.06]" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-[#EF4444] hover:bg-[#FEE2E2]/60 dark:hover:bg-[#7f1d1d]/30 transition-colors w-full text-left"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.6} />
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
