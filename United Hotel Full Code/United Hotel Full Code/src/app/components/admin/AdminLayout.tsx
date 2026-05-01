import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { AdminSidebar, SIDEBAR_WIDTH } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Monitor, Loader2 } from 'lucide-react';
import { authService } from '../../services/api';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
  // Pages that are admin-only (Users, Analytics, Vendor Pricing) pass this
  // and vendors get bounced back to the dashboard.
  adminOnly?: boolean;
}

type AuthState = 'checking' | 'allowed' | 'admin-required' | 'denied';

const MIN_DESKTOP_WIDTH = 900;
const COLLAPSED_KEY = 'uh_admin_sidebar_collapsed';

export function AdminLayout({ children, title, breadcrumb, adminOnly = false }: AdminLayoutProps) {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth
  );
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(COLLAPSED_KEY) === '1';
  });

  useEffect(() => {
    let active = true;
    authService.getCurrentUser()
      .then((user: any) => {
        if (!active) return;
        const isAdmin = Boolean(user?.isAdmin || user?.role === 'admin');
        const isVendor = Boolean(user?.role === 'vendor' || user?.isManager);
        if (!isAdmin && !isVendor) setAuthState('denied');
        else if (adminOnly && !isAdmin) setAuthState('admin-required');
        else setAuthState('allowed');
      })
      .catch(() => { if (active) setAuthState('denied'); });
    return () => { active = false; };
  }, [adminOnly]);

  // Live viewport width so the desktop gate flips on resize.
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Sidebar broadcasts its collapsed state via a custom event; subscribe so
  // the main content area's left margin updates in lockstep with the
  // animated sidebar width.
  useEffect(() => {
    const onToggle = (e: Event) => setSidebarCollapsed(Boolean((e as CustomEvent).detail));
    window.addEventListener('admin:sidebar-toggle', onToggle);
    return () => window.removeEventListener('admin:sidebar-toggle', onToggle);
  }, []);

  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <Loader2 className="w-6 h-6 text-[#1ABC9C] animate-spin" />
      </div>
    );
  }

  if (authState === 'denied') {
    return <Navigate to="/admin/login" replace />;
  }

  if (authState === 'admin-required') {
    return <Navigate to="/admin" replace />;
  }

  const isMobile = viewportWidth < MIN_DESKTOP_WIDTH;

  if (isMobile) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-[#1ABC9C]/15 p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-[#1ABC9C]/10 flex items-center justify-center mx-auto mb-6">
            <Monitor className="h-10 w-10 text-[#1ABC9C]" strokeWidth={1.5} />
          </div>

          <h1 className="text-2xl font-bold text-[#3B3B3B] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Desktop Only
          </h1>

          <p className="text-base text-[#8C8C8C] mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            The admin panel is optimized for desktop use. Please open it on a screen at least {MIN_DESKTOP_WIDTH}px wide.
          </p>

          <a
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-[#1ABC9C] text-white rounded-lg font-semibold hover:bg-[#16A085] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Go to Homepage
          </a>
        </div>
      </div>
    );
  }

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH.collapsed : SIDEBAR_WIDTH.expanded;

  return (
    // Plain neutral background that flips with the global ThemeContext.
    // Light: #f5f6f8 (cool grey canvas). Dark: #0b0d10 (near-black slate
    // that lets the teal accent + glass cards pop).
    <div className="relative flex h-screen overflow-hidden bg-[#f5f6f8] dark:bg-[#0b0d10]">
      <AdminSidebar />

      <div
        className="flex-1 flex flex-col min-w-0 transition-[margin-left] duration-200 ease-out"
        style={{ marginLeft: viewportWidth >= 1024 ? sidebarWidth : 0 }}
      >
        <AdminHeader title={title} breadcrumb={breadcrumb} />

        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          <div className="mx-auto max-w-[1400px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
