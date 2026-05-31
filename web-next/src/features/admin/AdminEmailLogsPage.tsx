import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '@/features/admin/components/AdminLayout';
import { adminService } from '@/shared/api/services';
import { Mail, AlertCircle, CheckCircle2, Clock, Inbox, RefreshCw } from 'lucide-react';

type LogRow = {
  id: number;
  type: string;
  recipient: string;
  subject: string | null;
  status: 'sent' | 'logged' | 'failed' | 'skipped' | 'pending';
  providerId: string | null;
  errorMessage: string | null;
  createdAt: string | null;
};

const STATUS_META: Record<LogRow['status'], { label: string; color: string; bg: string; ring: string; Icon: typeof Mail }> = {
  sent:    { label: 'Sent',    color: '#1E5FBC', bg: 'rgba(47, 128, 237,0.10)', ring: 'rgba(47, 128, 237,0.35)', Icon: CheckCircle2 },
  logged:  { label: 'Logged',  color: '#a16207', bg: 'rgba(245,158,11,0.10)',  ring: 'rgba(245,158,11,0.35)',  Icon: Clock },
  failed:  { label: 'Failed',  color: '#b91c1c', bg: 'rgba(239,68,68,0.10)',   ring: 'rgba(239,68,68,0.35)',   Icon: AlertCircle },
  skipped: { label: 'Skipped', color: '#52525b', bg: 'rgba(120,120,120,0.08)', ring: 'rgba(120,120,120,0.25)', Icon: Inbox },
  pending: { label: 'Pending', color: '#1d4ed8', bg: 'rgba(59,130,246,0.10)',  ring: 'rgba(59,130,246,0.35)',  Icon: Clock },
};

const TYPE_LABEL: Record<string, string> = {
  'welcome': 'Welcome / Verify',
  'password-reset': 'Password reset',
  'password-changed': 'Password changed',
  'booking-confirmation': 'Booking confirmation',
};

const fmtTime = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function AdminEmailLogsPage() {
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [resendConfigured, setResendConfigured] = useState(false);
  const [filter, setFilter] = useState<'all' | LogRow['status']>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await adminService.listEmailLogs({ limit: 200 });
      setLogs(res.logs as LogRow[]);
      setResendConfigured(res.resendConfigured);
      setError(null);
    } catch (e: any) {
      setError(e?.data?.error || e?.message || 'Failed to load email logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const counts = useMemo(() => {
    const c = { all: logs.length, sent: 0, logged: 0, failed: 0, skipped: 0, pending: 0 } as Record<string, number>;
    logs.forEach((l) => { c[l.status] = (c[l.status] || 0) + 1; });
    return c;
  }, [logs]);

  const filtered = useMemo(() => {
    if (filter === 'all') return logs;
    return logs.filter((l) => l.status === filter);
  }, [logs, filter]);

  return (
    <AdminLayout title="Email Logs" breadcrumb="Admin / Emails" adminOnly>
      <div className="space-y-4">
        {/* Provider banner */}
        <div
          className={`rounded-lg border px-3 py-2 text-[12px] flex items-center gap-2 ${
            resendConfigured
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          {resendConfigured ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          {resendConfigured ? (
            <span>Resend is configured — outgoing email is going through the live provider.</span>
          ) : (
            <span>
              <span className="font-semibold">RESEND_API_KEY not set.</span> Emails are logged-only —
              add the key to your <code className="font-mono">.env</code> to actually deliver mail.
            </span>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] text-[#6b7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="text-[#1f2937] font-semibold">{logs.length}</span> recent attempts
          </p>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-0.5 bg-white dark:bg-[#11151a] border border-[#eaeaea] rounded-lg p-0.5">
              {(['all', 'sent', 'logged', 'failed', 'skipped'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                    filter === f
                      ? 'bg-[#1f2937] text-white shadow-sm'
                      : 'text-[#6b7280] hover:text-[#1f2937]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {f === 'all' ? 'All' : STATUS_META[f].label}
                  <span
                    className={`text-[10px] rounded-full px-1.5 py-px font-semibold ${
                      filter === f ? 'bg-white/15 text-white/85' : 'bg-[#f1f1f1] text-[#9aa0a6]'
                    }`}
                  >
                    {counts[f] || 0}
                  </span>
                </button>
              ))}
            </div>
            <button
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg bg-white dark:bg-[#11151a] border border-[#eaeaea] px-2.5 py-1.5 text-[12px] text-[#6b7280] hover:text-[#1f2937] hover:border-[#9aa0a6] transition-colors disabled:opacity-50"
              style={{ fontFamily: 'Inter, sans-serif' }}
              title="Refresh"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12.5px] text-red-700">{error}</div>
        )}

        {/* Table */}
        <div className="admin-card overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-[12.5px] text-[#9aa0a6]">Loading email logs…</div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
                <tr>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Time</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Type</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Recipient</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Subject</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Status</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Provider ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1f1]">
                {filtered.map((l) => {
                  const meta = STATUS_META[l.status] || STATUS_META.pending;
                  const Icon = meta.Icon;
                  return (
                    <tr key={l.id} className="hover:bg-[#fafafa] transition-colors align-top">
                      <td className="px-4 py-2.5 text-[11.5px] text-[#9aa0a6] whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {fmtTime(l.createdAt)}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#1f2937] whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {TYPE_LABEL[l.type] || l.type}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#3b3b3b]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {l.recipient}
                      </td>
                      <td className="px-4 py-2.5 text-[12px] text-[#6b7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        <span className="line-clamp-1">{l.subject || '—'}</span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                          style={{
                            color: meta.color,
                            background: meta.bg,
                            boxShadow: `inset 0 0 0 1px ${meta.ring}`,
                            fontFamily: 'Inter, sans-serif',
                          }}
                        >
                          <Icon className="w-3 h-3" strokeWidth={2.2} />
                          {meta.label}
                        </span>
                        {l.errorMessage && (
                          <p className="text-[10.5px] text-red-600 mt-1 max-w-[280px] line-clamp-2" title={l.errorMessage}>
                            {l.errorMessage}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-[10.5px] font-mono text-[#9aa0a6]" title={l.providerId || ''}>
                        {l.providerId ? (l.providerId.slice(0, 12) + '…') : '—'}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-[13px] text-[#9aa0a6] mb-1">No email attempts yet</div>
                      <div className="text-[11.5px] text-[#d4d4d8]">
                        Trigger one by registering a new user, requesting a password reset, or completing a booking.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
