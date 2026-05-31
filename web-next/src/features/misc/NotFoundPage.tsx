import { Link } from 'react-router';
import { ArrowRight, Home, Search, MessageCircle } from 'lucide-react';
import { Navigation } from '@/shared/components/Navigation';
import { Footer } from '@/shared/components/Footer';
import { useSEO } from '@/shared/hooks/useSEO';

export function NotFoundPage() {
  useSEO({
    title: 'Page not found | Book United Hotels',
    description:
      "We couldn't find that page. Search hotels in Turkey, browse our travel guides, or message our support team.",
    canonical: '/404',
    // Soft 404 — don't index, but let crawlers follow links to recover.
    robots: 'noindex,follow',
  });

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0A0A0A] flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center px-5 py-16 md:py-24">
        <div className="max-w-[640px] text-center">
          <div
            className="font-['Poppins:Bold',sans-serif] text-[88px] md:text-[140px] leading-none tracking-[-0.04em]"
            style={{
              background: 'linear-gradient(135deg, #2F80ED 0%, #1E5FBC 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            aria-hidden
          >
            404
          </div>
          <h1 className="font-['Poppins:Bold',sans-serif] text-[26px] md:text-[36px] leading-[1.15] tracking-[-0.02em] text-[#0B1F3B] dark:text-white mt-2 mb-3">
            We couldn't find that page
          </h1>
          <p className="font-['Inter:Regular',sans-serif] text-[14px] md:text-[16px] leading-[1.55] text-[#6B7280] dark:text-white/70 mb-8">
            The link may be broken, or the page may have moved. Try one of these instead — or
            message our support desk and we'll point you the right way.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 h-[48px] px-6 rounded-xl bg-[#2F80ED] hover:bg-[#1E5FBC] text-white font-['Inter:SemiBold',sans-serif] text-[14.5px] transition-colors shadow-[0_4px_16px_rgba(47,128,237,0.3)]"
            >
              <Home className="w-4 h-4" strokeWidth={2.4} />
              Go to homepage
            </Link>
            <Link
              to="/listing"
              className="inline-flex items-center gap-2 h-[48px] px-6 rounded-xl border border-[#E6EAF0] hover:border-[#2F80ED] hover:text-[#2F80ED] text-[#0B1F3B] dark:text-white dark:border-white/15 font-['Inter:SemiBold',sans-serif] text-[14.5px] transition-colors"
            >
              <Search className="w-4 h-4" strokeWidth={2.4} />
              Browse hotels
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-left">
            {[
              { to: '/groups', label: 'Group bookings', sub: 'Tours, corporate, events' },
              { to: '/blog', label: 'Travel guides', sub: 'Where to stay, when to visit' },
              { to: '/support', label: 'Help & support', sub: 'FAQ, contact, WhatsApp' },
            ].map((it) => (
              <Link
                key={it.to}
                to={it.to}
                className="group bg-white dark:bg-[#161616] border border-[#E6EAF0] dark:border-white/10 rounded-xl p-4 hover:border-[#2F80ED] transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-['Poppins:SemiBold',sans-serif] text-[14px] text-[#0B1F3B] dark:text-white">
                    {it.label}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#6B7280] group-hover:text-[#2F80ED] transition-colors" />
                </div>
                <div className="font-['Inter:Regular',sans-serif] text-[12.5px] text-[#6B7280] dark:text-white/60">
                  {it.sub}
                </div>
              </Link>
            ))}
          </div>

          <Link
            to="/support"
            className="inline-flex items-center gap-1.5 mt-8 text-[13.5px] text-[#2F80ED] hover:text-[#1E5FBC] font-['Inter:SemiBold',sans-serif]"
          >
            <MessageCircle className="w-3.5 h-3.5" strokeWidth={2.4} />
            Report a broken link
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default NotFoundPage;
