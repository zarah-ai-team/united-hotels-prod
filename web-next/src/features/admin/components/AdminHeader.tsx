import { Bell, User, LogOut, Home, CheckCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNotifications, timeAgo } from '@/features/admin/useNotifications';
import { NotificationIcon } from '@/features/admin/components/NotificationIcon';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/shared/context/AuthContext';

interface AdminHeaderProps {
  title: string;
  breadcrumb?: string;
}

export function AdminHeader({ title, breadcrumb }: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    // Use AuthContext.logout so React state clears alongside the token —
    // otherwise /admin/login bounces back to /admin.
    logout();
    localStorage.removeItem('uh_active_role');
    localStorage.removeItem('uh_active_name');
    navigate('/admin/login', { replace: true });
  };

  // Live activity feed (bookings, payments, inquiries, sign-ups, email
  // failures). Toasts pop for items that arrive while the admin is on a page.
  const { items, loading, error, unreadCount, isUnread, markAllRead } = useNotifications({ limit: 30, toastNew: true });
  const latest = items.slice(0, 8);

  // Close the dropdown on outside click.
  const bellRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showNotifications) return;
    const onDown = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [showNotifications]);

  const openNotification = (link: string) => {
    setShowNotifications(false);
    navigate(link);
  };

  return (
    // Slim frosted bar — uses admin-strip-* tokens so the same charcoal
    // tone shows up across header / sidebar / table info bars.
    <header
      className="sticky top-0 z-30 h-12 bg-white/85 dark:bg-[rgba(20,24,33,0.78)] border-b border-[#EAEAEA]/70 dark:border-white/8"
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
          {/* Notification Bell */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-1.5 hover:bg-[#FAFAFA] dark:hover:bg-white/[0.06] transition-colors"
              aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            >
              <Bell className="h-[15px] w-[15px] text-[#6b7280] dark:text-white/55" strokeWidth={1.75} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[#EF4444] text-white text-[9px] font-bold leading-[15px] text-center ring-2 ring-white dark:ring-[#141821]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div
                className="absolute right-0 mt-2 w-80 bg-white/95 dark:bg-[rgba(20,24,33,0.95)] rounded-xl shadow-xl border border-[#EAEAEA] dark:border-white/10 py-1 z-50"
                style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
              >
                <div className="px-3 py-2 border-b border-[#EAEAEA] dark:border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-[12.5px] text-[#3B3B3B] dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Notifications{unreadCount > 0 ? ` · ${unreadCount} new` : ''}
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="inline-flex items-center gap-1 text-[11px] text-[#2F80ED] dark:text-[#5DA0F8] font-medium hover:text-[#1E5FBC]"
                    >
                      <CheckCheck className="h-3.5 w-3.5" /> Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {loading && latest.length === 0 && (
                    <p className="px-3 py-6 text-center text-[12px] text-[#9aa0a6]">Loading…</p>
                  )}
                  {!loading && error && latest.length === 0 && (
                    <p className="px-3 py-6 text-center text-[12px] text-red-600">{error}</p>
                  )}
                  {!loading && !error && latest.length === 0 && (
                    <p className="px-3 py-6 text-center text-[12px] text-[#9aa0a6]">No activity yet.</p>
                  )}
                  {latest.map((notif) => {
                    const unread = isUnread(notif);
                    return (
                      <button
                        key={notif.id}
                        onClick={() => openNotification(notif.link)}
                        className={`w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-[#FAFAFA] dark:hover:bg-white/[0.06] transition-colors border-b border-[#EAEAEA]/60 dark:border-white/[0.06] last:border-0 ${
                          unread ? 'bg-[#2F80ED]/[0.04] dark:bg-[#2F80ED]/[0.12]' : ''
                        }`}
                      >
                        <NotificationIcon type={notif.type} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12.5px] text-[#3B3B3B] dark:text-white/85 leading-snug" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {notif.title}
                          </span>
                          {notif.detail && (
                            <span className="block text-[11px] text-[#6b7280] dark:text-white/55 truncate">{notif.detail}</span>
                          )}
                          <span className="block text-[10.5px] text-[#9aa0a6] dark:text-white/45 mt-0.5">{timeAgo(notif.createdAt)}</span>
                        </span>
                        {unread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#2F80ED]" aria-label="Unread" />}
                      </button>
                    );
                  })}
                </div>
                <div className="px-3 py-2 border-t border-[#EAEAEA] dark:border-white/10">
                  <button
                    onClick={() => openNotification('/admin/notifications')}
                    className="text-[12px] text-[#2F80ED] dark:text-[#5DA0F8] font-medium hover:text-[#1E5FBC] dark:hover:text-[#7DB4FA]"
                  >
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
                background: 'linear-gradient(135deg, #2F80ED, #1E5FBC)',
                boxShadow: '0 4px 10px -4px rgba(47, 128, 237,0.55)',
              }}
              aria-label="Account menu"
            >
              AH
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-52 bg-white/95 dark:bg-[rgba(20,24,33,0.95)] rounded-xl shadow-xl border border-[#EAEAEA] dark:border-white/10 py-1 z-50"
                style={{ backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)' }}
              >
                <div className="px-3 py-2 border-b border-[#EAEAEA] dark:border-white/10">
                  <p className="font-semibold text-[12.5px] text-[#3B3B3B] dark:text-white truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Admin User
                  </p>
                  <p className="text-[10.5px] text-[#9aa0a6] dark:text-white/50 truncate">info@united-tourism.com</p>
                </div>
                <Link
                  to="/"
                  className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-[#3B3B3B] dark:text-white/85 hover:bg-[#FAFAFA] dark:hover:bg-white/[0.06] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Home className="h-[14px] w-[14px]" strokeWidth={1.75} />
                  View Live Site
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-[#3B3B3B] dark:text-white/85 hover:bg-[#FAFAFA] dark:hover:bg-white/[0.06] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <User className="h-[14px] w-[14px]" strokeWidth={1.75} />
                  Profile Settings
                </Link>
                <div className="border-t border-[#EAEAEA] dark:border-white/10 my-0.5" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2 text-[12.5px] text-[#EF4444] dark:text-[#F87171] hover:bg-[#FAFAFA] dark:hover:bg-white/[0.06] transition-colors w-full text-left"
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
