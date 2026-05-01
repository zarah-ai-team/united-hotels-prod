import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { AdminSidebar } from './AdminSidebar';
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

// Lowered from 1024px to 900px — admin layout is now compact enough that
// 900px works comfortably (smaller laptops + half-screen split).
const MIN_DESKTOP_WIDTH = 900;

export function AdminLayout({ children, title, breadcrumb, adminOnly = false }: AdminLayoutProps) {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? 1280 : window.innerWidth
  );

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

  // Live-update on window resize so the desktop gate flips when the user
  // expands a half-snap window (the previous version captured innerWidth
  // once and never recomputed).
  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
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
      <div className="min-h-screen bg-gradient-to-br from-[#1ABC9C]/5 via-white to-[#1ABC9C]/10 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl border-2 border-[#1ABC9C]/20 p-8 text-center">
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

  return (
    // Full-screen ambient gradient that the frosted sidebar/header sit on top
    // of — a soft teal aurora plus a slate fade so the glass actually looks
    // like glass (transparency reveals the colored backdrop).
    <div
      className="relative flex h-screen overflow-hidden"
      style={{
        background:
          'radial-gradient(1200px 600px at 8% -10%, rgba(26,188,156,0.18), transparent 55%),' +
          'radial-gradient(900px 500px at 105% 110%, rgba(45,212,191,0.13), transparent 50%),' +
          'linear-gradient(180deg, #f7f8fb 0%, #eef2f4 100%)',
      }}
    >
      <AdminSidebar />

      <div className="flex-1 flex flex-col lg:ml-[220px] min-w-0">
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
