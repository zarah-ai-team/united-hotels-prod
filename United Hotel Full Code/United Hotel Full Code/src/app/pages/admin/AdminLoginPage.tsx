import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
import { authService } from '../../services/api';
import { STORAGE_KEYS } from '../../config/api';

const SEEDED_DEMO_EMAIL = 'admin@unitedhotels.com';
const SEEDED_DEMO_PASSWORD = 'admin123';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    setErrorMessage(null);
    setSubmitting(true);

    try {
      const response = await authService.login({ email: email.trim(), password });
      const user = (response as unknown as { user?: { isAdmin?: boolean; isManager?: boolean; name?: string; email?: string } }).user;

      if (!user || (!user.isAdmin && !user.isManager)) {
        // Non-admin account — refuse and wipe the token authService just stored.
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        setErrorMessage('This account does not have admin access.');
        return;
      }

      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      // RoleSwitcher reads this flag to decide whether the role-toggle is unlocked.
      localStorage.setItem('userActualRole', 'admin');
      localStorage.setItem('adminRole', 'admin');

      navigate('/admin', { replace: true });
    } catch (error: unknown) {
      const message =
        (error as { message?: string; data?: { error?: string } } | null)?.data?.error ||
        (error as { message?: string } | null)?.message ||
        'Unable to sign in. Please try again.';
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoCreds = () => {
    setEmail(SEEDED_DEMO_EMAIL);
    setPassword(SEEDED_DEMO_PASSWORD);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#FAFAFA] via-white to-[#E0F7F1] dark:from-[#0a0a0a] dark:via-[#111] dark:to-[#0a1f1a] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-[0_24px_60px_-24px_rgba(15,23,42,0.35)] overflow-hidden bg-white dark:bg-white/[0.04] dark:backdrop-blur-xl dark:ring-1 dark:ring-white/[0.08]">
          {/* Header strip */}
          <div className="bg-[#3B3B3B] dark:bg-black/60 px-6 py-5 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#1ABC9C]/15 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-[#1ABC9C]" />
            </div>
            <div>
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
                Admin Portal
              </p>
            </div>
          </div>

          <div className="p-8">
            <h2
              className="text-xl font-semibold text-[#3B3B3B] dark:text-white mb-1"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Sign in to continue
            </h2>
            <p
              className="text-sm text-[#8C8C8C] dark:text-white/60 mb-6"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Use your admin or manager credentials.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-sm font-medium text-[#3B3B3B] dark:text-white/85 mb-1.5"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8C8C] dark:text-white/45" />
                  <input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@unitedhotels.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-[#EAEAEA] dark:border-white/[0.12] bg-white dark:bg-white/[0.03] text-[#3B3B3B] dark:text-white placeholder:text-[#B0B0B0] dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/40 focus:border-[#1ABC9C]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-sm font-medium text-[#3B3B3B] dark:text-white/85 mb-1.5"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8C8C8C] dark:text-white/45" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#EAEAEA] dark:border-white/[0.12] bg-white dark:bg-white/[0.03] text-[#3B3B3B] dark:text-white placeholder:text-[#B0B0B0] dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/40 focus:border-[#1ABC9C]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                    required
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
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <button
              type="button"
              onClick={fillDemoCreds}
              className="mt-4 w-full text-xs text-[#1ABC9C] hover:text-[#16A085] underline-offset-2 hover:underline"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Use seeded demo credentials
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <a
            href="/auth"
            className="text-sm text-[#8C8C8C] dark:text-white/55 hover:text-[#3B3B3B] dark:hover:text-white transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            ← Back to guest login
          </a>
        </div>
      </div>
    </div>
  );
}
