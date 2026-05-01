import { AdminLayout } from '../../components/admin/AdminLayout';
import { User, Sun, Moon, Save, Sparkles, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTheme } from '../../context/ThemeContext';
import { authService } from '../../services/api';

// Minimal settings — just the essentials a partner-portal user touches
// regularly: their display name, the theme, and a sign-out shortcut.
// Everything else (notifications, billing, security 2FA, localisation,
// email branding, property defaults) was placeholder-only and got cut to
// keep this page honest. We can bring sections back individually as
// each of them gets real backend wiring.

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label
        className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] mb-1"
        style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text-faint)' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-md border bg-transparent px-2.5 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/25 focus:border-[#1ABC9C] transition-colors';

interface SectionCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accent?: string;
  children: React.ReactNode;
}

function SectionCard({ title, icon: Icon, accent = '#1ABC9C', children }: SectionCardProps) {
  return (
    <div className="admin-card p-4">
      <div className="flex items-center gap-2 mb-3.5">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accent}1a, ${accent}33)`,
            boxShadow: `inset 0 0 0 1px ${accent}28`,
          }}
        >
          <Icon className="h-[14px] w-[14px]" strokeWidth={1.85} style={{ color: accent }} />
        </span>
        <h3
          className="text-[12.5px] font-semibold"
          style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--admin-text)' }}
        >
          {title}
        </h3>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  // Cached display info from the login response. Optional — falls back
  // gracefully if the user object isn't in localStorage yet.
  const cachedUser = (() => {
    try { return JSON.parse(localStorage.getItem('uh_user') || '{}'); } catch { return {}; }
  })();
  const [name, setName] = useState<string>(cachedUser?.name || '');

  const handleSignOut = () => {
    authService.logout();
    localStorage.removeItem('uh_active_role');
    localStorage.removeItem('uh_active_name');
    navigate('/admin/login', { replace: true });
  };

  return (
    <AdminLayout title="Settings" breadcrumb="Admin / Settings">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[800px]">
        {/* Appearance — theme picker (the headline setting) */}
        <SectionCard title="Appearance" icon={Sparkles} accent="#8b5cf6">
          <Field label="Theme">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-[12.5px] font-medium border transition-colors ${
                  theme === 'light'
                    ? 'bg-[#1ABC9C]/10 border-[#1ABC9C]/40 text-[#0f9b86]'
                    : 'border hover:border-[#9aa0a6]'
                }`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: theme === 'light' ? undefined : 'var(--admin-border)',
                  color: theme === 'light' ? undefined : 'var(--admin-text-muted)',
                }}
              >
                <Sun className="w-4 h-4" strokeWidth={2} />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 rounded-md py-2.5 text-[12.5px] font-medium border transition-colors ${
                  theme === 'dark'
                    ? 'bg-[#1ABC9C]/10 border-[#1ABC9C]/40 text-[#0f9b86]'
                    : 'border hover:border-[#9aa0a6]'
                }`}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  borderColor: theme === 'dark' ? undefined : 'var(--admin-border)',
                  color: theme === 'dark' ? undefined : 'var(--admin-text-muted)',
                }}
              >
                <Moon className="w-4 h-4" strokeWidth={2} />
                Dark
              </button>
            </div>
            <p className="text-[10.5px] mt-1.5" style={{ color: 'var(--admin-text-faint)' }}>
              Theme preference is saved per-device and applies to the whole portal.
            </p>
          </Field>
        </SectionCard>

        {/* Profile — display name + email + sign out */}
        <SectionCard title="Profile" icon={User} accent="#1ABC9C">
          <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: 'var(--admin-border)' }}>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white text-[12px] font-semibold shrink-0"
              style={{
                background: 'linear-gradient(135deg, #1ABC9C, #16A085)',
                boxShadow: '0 4px 10px -4px rgba(26,188,156,0.45)',
              }}
            >
              {(name || 'A').slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="text-[12.5px] font-semibold truncate"
                style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text)' }}
              >
                {name || 'Admin User'}
              </div>
              <div className="text-[10.5px] truncate" style={{ color: 'var(--admin-text-faint)' }}>
                {cachedUser?.email || '—'}
              </div>
            </div>
          </div>
          <Field label="Display name">
            <input
              className={inputCls}
              style={{ borderColor: 'var(--admin-border)', color: 'var(--admin-text)' }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="How you appear in the portal"
            />
          </Field>
          <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--admin-border)' }}>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#dc2626] hover:text-[#b91c1c] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1ABC9C] px-3 py-1.5 text-[11.5px] font-semibold text-white hover:bg-[#16A085] transition-colors shadow-[0_4px_12px_-4px_rgba(26,188,156,0.55)]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <Save className="w-3.5 h-3.5" /> Save changes
            </button>
          </div>
        </SectionCard>
      </div>
    </AdminLayout>
  );
}
