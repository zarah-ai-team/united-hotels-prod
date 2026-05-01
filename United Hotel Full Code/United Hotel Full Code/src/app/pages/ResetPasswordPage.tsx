import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { authService } from '../services/api';

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('No reset token found. Please use the link from your reset email.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      // Auto-redirect to sign-in after a beat so the user sees confirmation.
      setTimeout(() => navigate('/auth', { replace: true }), 2200);
    } catch (err) {
      const message =
        (err as { data?: { error?: string } } | null)?.data?.error ||
        (err as { message?: string } | null)?.message ||
        'Could not reset password. The link may have expired.';
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
              Reset password
            </p>
          </div>

          {success ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                <CheckCircle2 className="h-7 w-7 text-[#22C55E]" strokeWidth={1.6} />
              </div>
              <h2
                className="text-xl font-semibold text-[#3B3B3B] dark:text-white mb-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Password updated
              </h2>
              <p
                className="text-sm text-[#8C8C8C] dark:text-white/60 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                You can now sign in with your new password. Redirecting…
              </p>
            </div>
          ) : !token ? (
            <div className="p-8 text-center">
              <div className="mx-auto mb-5 h-16 w-16 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-[#EF4444]" strokeWidth={1.6} />
              </div>
              <h2
                className="text-xl font-semibold text-[#3B3B3B] dark:text-white mb-2"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Missing reset token
              </h2>
              <p
                className="text-sm text-[#8C8C8C] dark:text-white/60 leading-relaxed"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Please open this page from the link in your password-reset email.
              </p>
              <Link
                to="/auth/forgot"
                className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-lg bg-[#1ABC9C] text-white font-semibold text-sm hover:bg-[#16A085] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Request a new reset link
              </Link>
            </div>
          ) : (
            <div className="p-8">
              <h2
                className="text-xl font-semibold text-[#3B3B3B] dark:text-white mb-1"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Choose a new password
              </h2>
              <p
                className="text-sm text-[#8C8C8C] dark:text-white/60 mb-6"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                At least 8 characters. Once you confirm, your old password stops working.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label
                    htmlFor="reset-password"
                    className="block text-sm font-medium text-[#3B3B3B] dark:text-white/85 mb-1.5"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8C8C] dark:text-white/45" />
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#EAEAEA] dark:border-white/[0.12] bg-white dark:bg-white/[0.03] text-[#3B3B3B] dark:text-white placeholder:text-[#B0B0B0] dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/40 focus:border-[#1ABC9C]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8C8C] dark:text-white/50 hover:text-[#3B3B3B] dark:hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="reset-confirm"
                    className="block text-sm font-medium text-[#3B3B3B] dark:text-white/85 mb-1.5"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Confirm new password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8C8C] dark:text-white/45" />
                    <input
                      id="reset-confirm"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#EAEAEA] dark:border-white/[0.12] bg-white dark:bg-white/[0.03] text-[#3B3B3B] dark:text-white placeholder:text-[#B0B0B0] dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/40 focus:border-[#1ABC9C]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                      required
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
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#1ABC9C] hover:bg-[#16A085] text-white font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  {submitting ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
