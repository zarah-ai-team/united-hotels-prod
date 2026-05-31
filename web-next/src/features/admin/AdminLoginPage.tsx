import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ShieldCheck, Loader2, AlertCircle, Building2, Users, Tag, BarChart3 } from 'lucide-react';
import { useAuth } from '@/shared/context/AuthContext';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already logged in as admin or staff, jump straight to the dashboard.
  // Read from AuthContext so the gate matches RequireAdmin's gate exactly —
  // anything else and the bounce/redirect ping-pongs.
  useEffect(() => {
    if (authLoading) return;
    const allowed = Boolean(user?.isAdmin || user?.isManager);
    if (allowed) navigate('/admin', { replace: true });
  }, [authLoading, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const fresh = await login({ email: email.trim(), password });
      const allowed = Boolean(fresh?.isAdmin || fresh?.isManager);
      if (!allowed) {
        logout();
        setError('This account does not have staff or admin access. Use the Guest Portal instead.');
        return;
      }
      navigate('/admin', { replace: true });
    } catch (e: any) {
      setError(e?.data?.error || e?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E5FBC] via-[#2F80ED] to-[#5DA0F8] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl bg-white">
        {/* Left: feature panel */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-[#1E5FBC] to-[#2F80ED] text-white p-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-7 h-7" />
              <span className="font-['Poppins'] font-bold text-[20px]">United Hotels Admin</span>
            </div>
            <h2 className="font-['Poppins'] font-bold text-[28px] leading-tight">
              Operate every property from one console.
            </h2>
            <p className="text-white/85 mt-3 text-[15px] leading-relaxed">
              Sign in to manage hotels, vendors, room categories and live pricing with bookings and revenue at a glance.
            </p>
          </div>

          <ul className="space-y-3 mt-10">
            <li className="flex items-start gap-3">
              <Building2 className="w-5 h-5 mt-0.5 text-white/90" />
              <div>
                <div className="font-semibold">Hotels & Rooms</div>
                <div className="text-white/80 text-sm">Add properties, categories, amenities and images.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Users className="w-5 h-5 mt-0.5 text-white/90" />
              <div>
                <div className="font-semibold">Users & Vendors</div>
                <div className="text-white/80 text-sm">Register accounts, assign roles, and link vendors to hotels.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Tag className="w-5 h-5 mt-0.5 text-white/90" />
              <div>
                <div className="font-semibold">Live Pricing</div>
                <div className="text-white/80 text-sm">Vendor min/max bands feed the dynamic pricing engine.</div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <BarChart3 className="w-5 h-5 mt-0.5 text-white/90" />
              <div>
                <div className="font-semibold">Analytics</div>
                <div className="text-white/80 text-sm">Total bookings, revenue, and per-hotel performance.</div>
              </div>
            </li>
          </ul>

          <div className="text-xs text-white/70">
            © {new Date().getFullYear()} United Hotels. Internal use only.
          </div>
        </div>

        {/* Right: login form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <ShieldCheck className="w-6 h-6 text-[#2F80ED]" />
            <span className="font-['Poppins'] font-bold text-[18px] text-[#3b3b3b]">United Hotels Admin</span>
          </div>

          <h1 className="font-['Poppins'] font-bold text-[28px] text-[#3b3b3b] mb-1">Sign in</h1>
          <p className="text-[#6b7280] text-[14px] mb-8">Use your admin credentials to access the portal.</p>

          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700 mb-5">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#3b3b3b] mb-1.5">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@unitedhotels.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#eaeaea] px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#3b3b3b] mb-1.5">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-[#eaeaea] px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/30 focus:border-[#2F80ED]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#2F80ED] hover:bg-[#1E5FBC] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-2.5 transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#eaeaea] flex items-center justify-between text-sm">
            <Link to="/auth" className="text-[#6b7280] hover:text-[#3b3b3b] transition-colors">
              ← Guest login
            </Link>
            <Link to="/" className="text-[#6b7280] hover:text-[#3b3b3b] transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
