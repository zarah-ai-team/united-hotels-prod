import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '@/shared/api/services';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      const message =
        (err as { data?: { error?: string } } | null)?.data?.error ||
        (err as { message?: string } | null)?.message ||
        'Could not request a reset right now. Please try again.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAFAFA] via-white to-[#E0F7F1] dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#0a1f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] overflow-hidden bg-white dark:bg-white/[0.04] dark:backdrop-blur-xl dark:ring-1 dark:ring-white/[0.08]">
          <div className="bg-[#3B3B3B] dark:bg-black/60 px-6 py-5">
            <h1
              className="text-lg font-semibold text-white"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              United Hotels
            </h1>
            <p
              className="text-xs text-white/70"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Forgot password
            </p>
          </div>

          {submitted ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-[#22C55E]" strokeWidth={1.6} />
              </div>
              <h2
                className="text-xl font-semibold text-[#3B3B3B] dark:text-white mb-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Check your inbox
              </h2>
              <p
                className="text-sm text-[#8C8C8C] dark:text-white/60 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                If <strong className="text-[#3B3B3B] dark:text-white">{email}</strong> is registered,
                a reset link is on its way. The link expires in 30 minutes.
              </p>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-1.5 mt-6 text-sm text-[#2F80ED] hover:text-[#1E5FBC] font-medium"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <div className="p-8">
              <h2
                className="text-xl font-semibold text-[#3B3B3B] dark:text-white mb-1"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Reset your password
              </h2>
              <p
                className="text-sm text-[#8C8C8C] dark:text-white/60 mb-6"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Enter the email on your account and we&rsquo;ll send a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-sm font-medium text-[#3B3B3B] dark:text-white/85 mb-1.5"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8C8C] dark:text-white/45" />
                    <input
                      id="forgot-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#EAEAEA] dark:border-white/[0.12] bg-white dark:bg-white/[0.03] text-[#3B3B3B] dark:text-white placeholder:text-[#B0B0B0] dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/40 focus:border-[#2F80ED]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div
                    className="rounded-lg border border-[#EF4444]/40 bg-[#FEE2E2] dark:bg-[#7f1d1d]/30 px-3 py-2 text-sm text-[#B91C1C] dark:text-[#fecaca]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    role="alert"
                  >
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2F80ED] hover:bg-[#1E5FBC] text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-1.5 w-full mt-4 text-xs text-[#8C8C8C] dark:text-white/60 hover:text-[#3B3B3B] dark:hover:text-white"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
