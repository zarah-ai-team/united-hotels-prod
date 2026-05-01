import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { Monitor } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  breadcrumb?: string;
}

export function AdminLayout({ children, title, breadcrumb }: AdminLayoutProps) {
  // Mobile gate — admin tooling assumes desktop real-estate
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  if (isMobile) {
    return (
      <div className="admin-shell-bg min-h-screen flex items-center justify-center p-6">
        <div className="admin-card max-w-md w-full p-8 text-center">
          <div className="h-20 w-20 rounded-full bg-[#1ABC9C]/10 flex items-center justify-center mx-auto mb-6">
            <Monitor className="h-10 w-10 text-[#1ABC9C]" strokeWidth={1.5} />
          </div>

          <h1
            className="text-2xl font-bold text-[#3B3B3B] dark:text-white mb-3"
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Desktop Only
          </h1>

          <p
            className="text-base text-[#8C8C8C] dark:text-white/60 mb-6 leading-relaxed"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            The admin panel is optimized for desktop use. Please open it on a screen at least 1024px
            wide for the full experience.
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
    <div className="admin-shell-bg flex h-screen overflow-hidden">
      {/* Soft floating blob — mirrors the public site's frosted backdrop */}
      <span
        className="pointer-events-none absolute -left-32 top-32 w-[420px] h-[420px] rounded-full opacity-[0.18] dark:opacity-[0.10] mix-blend-multiply dark:mix-blend-screen"
        style={{ background: 'var(--brand-teal, #1abc9c)', filter: 'blur(120px)' }}
        aria-hidden
      />

      <AdminSidebar />

      <div className="flex-1 flex flex-col lg:ml-[260px] relative">
        <AdminHeader title={title} breadcrumb={breadcrumb} />

        <main className="flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8">
          <div className="mx-auto max-w-[1280px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
