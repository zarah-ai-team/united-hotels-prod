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

export function AdminLayout({ children, title, breadcrumb, adminOnly = false }: AdminLayoutProps) {
  const [authState, setAuthState] = useState<AuthState>('checking');

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

  // Check if device is mobile
  const isMobile = window.innerWidth < 1024;

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
            The admin panel is optimized for desktop use and requires a minimum screen width of 1024px for the best experience.
          </p>
          
          <div className="bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl p-4 mb-6">
            <p className="text-sm text-[#075985]" style={{ fontFamily: 'Inter, sans-serif' }}>
              💡 <strong>Tip:</strong> Please access the admin panel from a desktop computer or laptop for full functionality.
            </p>
          </div>

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
    <div className="flex h-screen overflow-hidden bg-[#FAFAFA]">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col lg:ml-[260px]">
        <AdminHeader title={title} breadcrumb={breadcrumb} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-[1200px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}