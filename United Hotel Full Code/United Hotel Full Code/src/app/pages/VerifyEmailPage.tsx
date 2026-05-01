import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle2, XCircle, Loader2, MailWarning, Sparkles, ShieldCheck } from 'lucide-react';
import { authService } from '../services/api';

type Status = 'loading' | 'success' | 'error';

interface VerifiedUser {
  name?: string;
  email?: string;
}

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState<string>('Verifying your email…');
  const [user, setUser] = useState<VerifiedUser | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token in the URL. Please use the link from your welcome email.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const response = await authService.verifyEmail(token);
        if (cancelled) return;
        setStatus('success');
        setMessage(response?.message || 'Your email has been verified.');
        if (response?.user) setUser(response.user);
      } catch (err) {
        if (cancelled) return;
        const errMessage =
          (err as { data?: { error?: string } } | null)?.data?.error ||
          (err as { message?: string } | null)?.message ||
          'Verification failed.';
        setStatus('error');
        setMessage(errMessage);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAFAFA] via-white to-[#E0F7F1] dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#0a1f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] overflow-hidden bg-white dark:bg-white/[0.04] dark:backdrop-blur-xl dark:ring-1 dark:ring-white/[0.08]">
          {/* Brand strip — switches to a celebratory teal gradient on success */}
          <div
            className={
              status === 'success'
                ? 'px-6 py-5 bg-linear-to-r from-[#1ABC9C] to-[#16A085]'
                : 'px-6 py-5 bg-[#3B3B3B] dark:bg-black/60'
            }
          >
            <h1
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              United Hotels
            </h1>
            <p
              className="text-xs text-white/80"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {status === 'success' ? 'Email verified' : 'Email verification'}
            </p>
          </div>

          <div className="p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-[#FAFAFA] dark:bg-white/[0.06] flex items-center justify-center">
                  <Loader2 className="h-7 w-7 text-[#1ABC9C] animate-spin" strokeWidth={1.6} />
                </div>
                <h2
                  className="text-xl font-semibold text-[#3B3B3B] dark:text-white mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Verifying your email
                </h2>
                <p
                  className="text-sm text-[#8C8C8C] dark:text-white/60"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Hang tight — this only takes a moment.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                {/* Animated success checkmark — pulsing teal halo behind it */}
                <div className="relative mx-auto mb-6 h-24 w-24">
                  <span className="absolute inset-0 rounded-full bg-[#1ABC9C]/20 dark:bg-[#2dd4bf]/15 animate-ping" />
                  <span className="absolute inset-2 rounded-full bg-[#1ABC9C]/30 dark:bg-[#2dd4bf]/25" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-16 w-16 rounded-full bg-linear-to-br from-[#1ABC9C] to-[#16A085] flex items-center justify-center shadow-[0_12px_30px_-12px_rgba(26,188,156,0.65)]">
                      <CheckCircle2 className="h-9 w-9 text-white" strokeWidth={2.2} />
                    </div>
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 h-5 w-5 text-[#FFA500]" strokeWidth={1.8} />
                  <Sparkles className="absolute -bottom-1 -left-1 h-4 w-4 text-[#1ABC9C]" strokeWidth={1.8} />
                </div>

                <h2
                  className="text-2xl font-bold text-[#3B3B3B] dark:text-white mb-1"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  You&apos;re all set!
                </h2>
                <p
                  className="text-[15px] text-[#1ABC9C] dark:text-[#2dd4bf] font-semibold mb-3"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Your email has been verified.
                </p>
                <p
                  className="text-sm text-[#8C8C8C] dark:text-white/60 leading-relaxed mb-5"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {user?.name ? `Welcome aboard, ${user.name}. ` : ''}Your United Hotels account is
                  active and ready — sign in to start booking your next stay.
                </p>

                {/* Account confirmation card */}
                {(user?.email || user?.name) && (
                  <div className="rounded-xl border border-[#1ABC9C]/25 bg-[#1ABC9C]/[0.06] dark:border-[#2dd4bf]/30 dark:bg-[#2dd4bf]/[0.05] px-4 py-3 mb-5 text-left">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="h-4 w-4 text-[#1ABC9C] dark:text-[#2dd4bf] shrink-0" strokeWidth={2} />
                      <div className="min-w-0">
                        <p
                          className="text-[12px] font-medium text-[#1f2937] dark:text-white truncate"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {user.email || user.name}
                        </p>
                        <p className="text-[11px] text-[#16A085] dark:text-[#5eead4]">
                          Verified · just now
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <Link
                  to="/auth"
                  className="w-full inline-flex items-center justify-center px-5 py-3 rounded-lg bg-linear-to-br from-[#1ABC9C] to-[#16A085] text-white font-semibold text-sm shadow-[0_10px_24px_-12px_rgba(26,188,156,0.55)] hover:brightness-105 transition-all"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Sign in to your account
                </Link>
                <Link
                  to="/"
                  className="block mt-3 text-xs text-[#8C8C8C] dark:text-white/55 hover:text-[#3B3B3B] dark:hover:text-white"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Or browse hotels first →
                </Link>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-[#FEE2E2] dark:bg-[#7f1d1d]/30 flex items-center justify-center">
                  {!token ? (
                    <MailWarning className="h-7 w-7 text-[#EF4444]" strokeWidth={1.6} />
                  ) : (
                    <XCircle className="h-7 w-7 text-[#EF4444]" strokeWidth={1.6} />
                  )}
                </div>
                <h2
                  className="text-xl font-semibold text-[#3B3B3B] dark:text-white mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Verification failed
                </h2>
                <p
                  className="text-sm text-[#8C8C8C] dark:text-white/60 leading-relaxed mb-5"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {message}
                </p>
                <Link
                  to="/auth"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-[#1ABC9C] text-white font-semibold text-sm hover:bg-[#16A085] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Back to sign in
                </Link>
                <Link
                  to="/"
                  className="block mt-3 text-xs text-[#8C8C8C] dark:text-white/55 hover:text-[#3B3B3B] dark:hover:text-white"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Go to homepage
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
