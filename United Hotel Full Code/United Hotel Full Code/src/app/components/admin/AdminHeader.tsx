import { Search, Bell, User, LogOut, Home } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { RoleSwitcher } from './RoleSwitcher';

interface AdminHeaderProps {
  title: string;
  breadcrumb?: string;
}

export function AdminHeader({ title, breadcrumb }: AdminHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear any auth tokens/session
    navigate('/admin/login');
  };

  const notifications = [
    { id: 1, text: 'New booking from John Smith', time: '5 min ago', unread: true },
    { id: 2, text: 'Payment received - BK-1247', time: '1 hour ago', unread: true },
    { id: 3, text: 'Review posted for Grand Palace Hotel', time: '2 hours ago', unread: false },
    { id: 4, text: 'Room 204 checked out', time: '3 hours ago', unread: false },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 border-b border-[#EAEAEA] bg-white">
      <div className="flex h-full items-center justify-between px-8">
        {/* Page Title & Breadcrumb */}
        <div>
          {breadcrumb && (
            <p className="text-xs text-[#8C8C8C] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {breadcrumb}
            </p>
          )}
          <h1 
            className="text-xl font-semibold text-[#3B3B3B]" 
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {title}
          </h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Role Switcher */}
          <RoleSwitcher />

          {/* Search Input */}
          <div className="hidden md:flex items-center gap-2 rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] px-3 py-2 w-64">
            <Search className="h-4 w-4 text-[#8C8C8C]" strokeWidth={1.5} />
            <input
              type="text"
              placeholder="Search bookings, hotels..."
              className="flex-1 bg-transparent text-sm text-[#3B3B3B] placeholder:text-[#8C8C8C] focus:outline-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 hover:bg-[#FAFAFA] transition-colors"
            >
              <Bell className="h-5 w-5 text-[#8C8C8C]" strokeWidth={1.5} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#EF4444]" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-[#EAEAEA] py-2 z-50">
                <div className="px-4 py-2 border-b border-[#EAEAEA]">
                  <h3 className="font-semibold text-sm text-[#3B3B3B]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Notifications
                  </h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <button
                      key={notif.id}
                      className={`w-full px-4 py-3 text-left hover:bg-[#FAFAFA] transition-colors border-b border-[#EAEAEA] last:border-0 ${
                        notif.unread ? 'bg-[#1ABC9C]/5' : ''
                      }`}
                    >
                      <p className="text-sm text-[#3B3B3B] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {notif.text}
                      </p>
                      <p className="text-xs text-[#8C8C8C]">{notif.time}</p>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-[#EAEAEA]">
                  <button className="text-sm text-[#1ABC9C] font-medium hover:text-[#16A085]">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Avatar with Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1ABC9C] text-white text-sm font-semibold hover:bg-[#16A085] transition-colors"
            >
              AH
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#EAEAEA] py-2 z-50">
                <div className="px-4 py-2 border-b border-[#EAEAEA]">
                  <p className="font-semibold text-sm text-[#3B3B3B]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Admin User
                  </p>
                  <p className="text-xs text-[#8C8C8C]">admin@unitedhotels.com</p>
                </div>
                <Link
                  to="/"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3B3B3B] hover:bg-[#FAFAFA] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Home className="h-4 w-4" strokeWidth={1.5} />
                  View Live Site
                </Link>
                <Link
                  to="/admin/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#3B3B3B] hover:bg-[#FAFAFA] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <User className="h-4 w-4" strokeWidth={1.5} />
                  Profile Settings
                </Link>
                <div className="border-t border-[#EAEAEA] my-1" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#EF4444] hover:bg-[#FAFAFA] transition-colors w-full text-left"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
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