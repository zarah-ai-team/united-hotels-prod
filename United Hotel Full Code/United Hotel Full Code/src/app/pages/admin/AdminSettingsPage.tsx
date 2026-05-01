import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  User,
  Bell,
  CreditCard,
  Sun,
  Moon,
  Mail,
  Lock,
  Globe,
  Building2,
  Sparkles,
  Save,
} from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

// Compact, single-screen settings — everything the user might want is laid
// out as a 2-column grid of focused cards: Profile / Theme / Notifications /
// Security / Localisation / Billing. Fits on one viewport at 1440x900 without
// scroll, much like Linear or Notion's settings pages.

interface SectionCardProps {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  accent?: string;
  children: React.ReactNode;
  className?: string;
}

function SectionCard({ title, icon: Icon, accent = '#1ABC9C', children, className = '' }: SectionCardProps) {
  return (
    <div
      className={`bg-white dark:bg-[#11151a] rounded-xl border border-[#eaeaea] dark:border-white/8 p-3.5 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] ${className}`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-md shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accent}1a, ${accent}33)`,
            boxShadow: `inset 0 0 0 1px ${accent}22`,
          }}
        >
          <Icon className="h-[14px] w-[14px]" strokeWidth={1.85} />
        </span>
        <h3
          className="text-[12.5px] font-semibold text-[#1f2937] dark:text-white"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          {title}
        </h3>
      </div>
      <div className="space-y-2.5">{children}</div>
    </div>
  );
}

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div>
      <label
        className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6] dark:text-white/45 mb-1"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  'w-full rounded-md border border-[#eaeaea] dark:border-white/10 bg-white dark:bg-[#0d1014] dark:text-white dark:placeholder-white/40 px-2.5 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/25 focus:border-[#1ABC9C] transition-colors';

interface ToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between gap-2 text-left"
    >
      <div className="min-w-0">
        <div
          className="text-[12.5px] font-medium text-[#1f2937] dark:text-white leading-tight"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {label}
        </div>
        {description && (
          <div className="text-[10.5px] text-[#9aa0a6] dark:text-white/45 leading-tight mt-0.5 truncate">
            {description}
          </div>
        )}
      </div>
      <span
        className={`relative inline-flex h-[18px] w-[32px] shrink-0 rounded-full transition-colors ${
          checked ? 'bg-[#1ABC9C]' : 'bg-[#e5e7eb] dark:bg-white/15'
        }`}
        aria-pressed={checked}
      >
        <span
          className={`absolute top-[2px] h-[14px] w-[14px] rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-[16px]' : 'translate-x-[2px]'
          }`}
        />
      </span>
    </button>
  );
}

export function AdminSettingsPage() {
  const { theme, setTheme } = useTheme();

  // Notification toggles
  const [notify, setNotify] = useState({
    bookings: true,
    payments: true,
    reviews: false,
    weeklyReport: true,
  });

  // Localisation
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Europe/Istanbul');

  return (
    <AdminLayout title="Settings" breadcrumb="Admin / Settings">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {/* Profile */}
        <SectionCard title="Profile" icon={User} accent="#1ABC9C">
          <div className="flex items-center gap-3 pb-2 border-b border-[#f1f1f1] dark:border-white/5">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full text-white text-[12px] font-semibold shrink-0"
              style={{
                background: 'linear-gradient(135deg, #1ABC9C, #16A085)',
                boxShadow: '0 4px 10px -4px rgba(26,188,156,0.45)',
              }}
            >
              AH
            </div>
            <div className="min-w-0 flex-1">
              <div
                className="text-[12.5px] font-semibold text-[#1f2937] dark:text-white truncate"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Admin User
              </div>
              <div className="text-[10.5px] text-[#9aa0a6] dark:text-white/45 truncate">admin@unitedhotels.com</div>
            </div>
            <button className="text-[10.5px] font-semibold text-[#1ABC9C] hover:text-[#16A085] whitespace-nowrap">
              Change
            </button>
          </div>
          <Field label="Display name">
            <input className={inputCls} defaultValue="Admin User" />
          </Field>
          <Field label="Phone">
            <input className={inputCls} defaultValue="+1 555 0100" placeholder="Optional" />
          </Field>
        </SectionCard>

        {/* Appearance */}
        <SectionCard title="Appearance" icon={Sparkles} accent="#8b5cf6">
          <Field label="Theme">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-[11.5px] font-medium border transition-colors ${
                  theme === 'light'
                    ? 'bg-[#1ABC9C]/10 border-[#1ABC9C]/40 text-[#0f9b86]'
                    : 'border-[#eaeaea] dark:border-white/10 text-[#6b7280] dark:text-white/55 hover:border-[#9aa0a6]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Sun className="w-3.5 h-3.5" strokeWidth={2} />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-1.5 rounded-md py-2 text-[11.5px] font-medium border transition-colors ${
                  theme === 'dark'
                    ? 'bg-[#1ABC9C]/10 border-[#1ABC9C]/40 text-[#0f9b86]'
                    : 'border-[#eaeaea] dark:border-white/10 text-[#6b7280] dark:text-white/55 hover:border-[#9aa0a6]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Moon className="w-3.5 h-3.5" strokeWidth={2} />
                Dark
              </button>
            </div>
          </Field>
          <Field label="Density">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                className="flex items-center justify-center gap-1 rounded-md py-1.5 text-[11.5px] font-medium border bg-[#1ABC9C]/10 border-[#1ABC9C]/40 text-[#0f9b86]"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Compact
              </button>
              <button
                className="flex items-center justify-center gap-1 rounded-md py-1.5 text-[11.5px] font-medium border border-[#eaeaea] dark:border-white/10 text-[#6b7280] dark:text-white/55"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                Comfortable
              </button>
            </div>
          </Field>
        </SectionCard>

        {/* Notifications */}
        <SectionCard title="Notifications" icon={Bell} accent="#f59e0b">
          <Toggle
            label="New bookings"
            description="Email + push when a booking arrives"
            checked={notify.bookings}
            onChange={(v) => setNotify({ ...notify, bookings: v })}
          />
          <Toggle
            label="Payment alerts"
            description="Successful payments and refunds"
            checked={notify.payments}
            onChange={(v) => setNotify({ ...notify, payments: v })}
          />
          <Toggle
            label="Reviews"
            description="When a guest leaves a review"
            checked={notify.reviews}
            onChange={(v) => setNotify({ ...notify, reviews: v })}
          />
          <Toggle
            label="Weekly performance digest"
            description="Sent every Monday at 8:00 AM"
            checked={notify.weeklyReport}
            onChange={(v) => setNotify({ ...notify, weeklyReport: v })}
          />
        </SectionCard>

        {/* Security */}
        <SectionCard title="Security" icon={Lock} accent="#0ea5e9">
          <button className="w-full text-left rounded-md border border-[#eaeaea] dark:border-white/10 px-3 py-2 hover:border-[#1ABC9C]/40 hover:bg-[#1ABC9C]/[0.04] transition-colors">
            <div
              className="text-[12.5px] font-medium text-[#1f2937] dark:text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Change password
            </div>
            <div className="text-[10.5px] text-[#9aa0a6] dark:text-white/45 mt-0.5">
              Last changed 47 days ago
            </div>
          </button>
          <Toggle
            label="Two-factor authentication"
            description="Authenticator app required at sign-in"
            checked={false}
            onChange={() => {}}
          />
          <button className="w-full text-left rounded-md border border-[#eaeaea] dark:border-white/10 px-3 py-2 hover:border-[#1ABC9C]/40 transition-colors">
            <div
              className="text-[12.5px] font-medium text-[#1f2937] dark:text-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Active sessions
            </div>
            <div className="text-[10.5px] text-[#9aa0a6] dark:text-white/45 mt-0.5">
              2 devices · sign out all
            </div>
          </button>
        </SectionCard>

        {/* Localisation */}
        <SectionCard title="Localisation" icon={Globe} accent="#10b981">
          <Field label="Default currency">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={inputCls}
            >
              <option value="USD">USD — US Dollar</option>
              <option value="EUR">EUR — Euro</option>
              <option value="GBP">GBP — British Pound</option>
              <option value="TRY">TRY — Turkish Lira</option>
              <option value="AED">AED — UAE Dirham</option>
            </select>
          </Field>
          <Field label="Timezone">
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className={inputCls}
            >
              <option value="Europe/Istanbul">Europe/Istanbul (UTC+3)</option>
              <option value="Europe/London">Europe/London (UTC+0)</option>
              <option value="America/New_York">America/New York (UTC-5)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (UTC+9)</option>
            </select>
          </Field>
          <Field label="Date format">
            <div className="grid grid-cols-3 gap-1">
              {['MM/DD/YY', 'DD/MM/YY', 'YYYY-MM-DD'].map((f, i) => (
                <button
                  key={f}
                  className={`rounded-md py-1 text-[10.5px] font-medium border transition-colors ${
                    i === 1
                      ? 'bg-[#1ABC9C]/10 border-[#1ABC9C]/40 text-[#0f9b86]'
                      : 'border-[#eaeaea] dark:border-white/10 text-[#6b7280] dark:text-white/55 hover:border-[#9aa0a6]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {f}
                </button>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* Email & Branding */}
        <SectionCard title="Email & Branding" icon={Mail} accent="#3b82f6">
          <Field label="Sender name">
            <input className={inputCls} defaultValue="United Hotels" />
          </Field>
          <Field label="From address">
            <input
              className={inputCls}
              defaultValue="onboarding@resend.dev"
              placeholder="hello@yourdomain.com"
            />
          </Field>
          <div className="flex items-center justify-between">
            <span
              className="text-[10.5px] text-[#9aa0a6] dark:text-white/45"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Resend ·{' '}
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Connected</span>
            </span>
            <button className="text-[10.5px] font-semibold text-[#1ABC9C] hover:text-[#16A085]">
              Test email
            </button>
          </div>
        </SectionCard>

        {/* Billing */}
        <SectionCard title="Billing" icon={CreditCard} accent="#ef4444">
          <div className="rounded-md bg-gradient-to-br from-[#1ABC9C] to-[#0f766e] text-white p-3">
            <div
              className="text-[10.5px] uppercase tracking-[0.08em] font-semibold opacity-85"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Current Plan
            </div>
            <div
              className="text-[16px] font-bold mt-1"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Partner Pro
            </div>
            <div className="text-[10.5px] opacity-90 mt-0.5">
              Renews Aug 14, 2026 · $99/month
            </div>
          </div>
          <button className="w-full rounded-md bg-[#1ABC9C]/10 hover:bg-[#1ABC9C] hover:text-white text-[#0f9b86] dark:text-[#2dd4bf] dark:hover:text-white text-[11.5px] font-semibold py-1.5 transition-colors">
            Manage subscription
          </button>
        </SectionCard>

        {/* Property defaults */}
        <SectionCard title="Property Defaults" icon={Building2} accent="#a16207">
          <Field label="Check-in time">
            <input className={inputCls} type="time" defaultValue="14:00" />
          </Field>
          <Field label="Check-out time">
            <input className={inputCls} type="time" defaultValue="12:00" />
          </Field>
          <Field label="Cancellation window">
            <select className={inputCls} defaultValue="24">
              <option value="24">24 hours before</option>
              <option value="48">48 hours before</option>
              <option value="72">72 hours before</option>
              <option value="0">Non-refundable</option>
            </select>
          </Field>
        </SectionCard>

        {/* Save bar */}
        <div className="md:col-span-2 xl:col-span-3 flex items-center justify-end gap-2 pt-1">
          <button
            className="rounded-lg border border-[#eaeaea] dark:border-white/10 bg-white dark:bg-[#11151a] px-3.5 py-1.5 text-[12.5px] font-medium text-[#6b7280] dark:text-white/65 hover:text-[#1f2937] dark:hover:text-white hover:border-[#9aa0a6] transition-colors"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Reset to defaults
          </button>
          <button
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#1ABC9C] px-3.5 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#16A085] transition-colors shadow-[0_4px_12px_-4px_rgba(26,188,156,0.55)]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Save className="w-3.5 h-3.5" /> Save changes
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
