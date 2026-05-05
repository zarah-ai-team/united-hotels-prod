import { useEffect, useMemo, useState } from 'react';
import {
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, DollarSign, CalendarCheck, Building2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService, vendorService, type AdminAnalytics } from '../../services/api';
import { useRole } from '../../components/admin/RoleSwitcher';

const RANGE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const fmtUsd = (n: number) => `$${Math.round(Number(n) || 0).toLocaleString()}`;

function StatCard({
  label, value, icon: Icon, accent = '#2F80ED',
}: {
  label: string; value: string | number; icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>; accent?: string;
}) {
  return (
    <div className="admin-card p-3 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_22px_-10px_rgba(47, 128, 237,0.25)] hover:border-[#2F80ED]/30 transition-all">
      <div className="flex items-center gap-2.5">
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: `linear-gradient(135deg, ${accent}1a, ${accent}33)`,
            boxShadow: `inset 0 0 0 1px ${accent}22`,
          }}
        >
          <Icon className="h-[16px] w-[16px]" strokeWidth={1.85} style={{ color: accent }} />
        </div>
        <div className="min-w-0">
          <p className="text-[10.5px] text-[#8c8c8c] uppercase tracking-[0.08em] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
            {label}
          </p>
          <p className="text-[18px] font-bold text-[#1f2937] mt-0.5 leading-none truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

const ChartCard: React.FC<{ title: string; children: React.ReactNode; right?: React.ReactNode }> = ({ title, children, right }) => (
  <div className="admin-card overflow-hidden">
    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-[#eaeaea]/60">
      <h3 className="text-[12.5px] font-semibold text-[#1f2937]" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {title}
      </h3>
      {right}
    </div>
    <div className="p-3.5">{children}</div>
  </div>
);

export function AdminAnalyticsPage() {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = useRole();
  const isVendor = role === 'vendor';

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    // Staff (vendor) → scoped /api/vendor/analytics; admin → /api/admin/analytics.
    // Identical response shape, so the rendering below doesn't branch.
    const fetcher = isVendor ? vendorService.getAnalytics(days) : adminService.getAnalytics(days);
    fetcher
      .then((d) => { if (active) setData(d); })
      .catch((e: any) => { if (active) setError(e?.data?.error || e?.message || 'Failed to load analytics'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [days, isVendor]);

  const totals = useMemo(() => {
    if (!data) return { bookings: 0, revenue: 0, avgValue: 0, topHotelName: '—' };
    const bookings = data.bookingTrend.reduce((s, d) => s + d.bookings, 0);
    const revenue = data.bookingTrend.reduce((s, d) => s + d.revenue, 0);
    return {
      bookings,
      revenue,
      avgValue: data.avgBookingValue.value,
      topHotelName: data.topHotels[0]?.hotelName || '—',
    };
  }, [data]);

  const trendChartData = useMemo(() => {
    if (!data) return [];
    return data.bookingTrend.map((d, i) => ({
      date: d.date.slice(5),
      bookings: d.bookings,
      direct: data.revenueTrend[i]?.direct ?? 0,
      ota: data.revenueTrend[i]?.ota ?? 0,
      revenue: d.revenue,
    }));
  }, [data]);

  return (
    <AdminLayout title="Analytics" breadcrumb={isVendor ? 'Staff / Analytics' : 'Admin / Analytics'}>
      <div className="space-y-4">
        {/* Range + meta — single tidy row */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12px] text-[#6b7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
            {data
              ? <>Window: <span className="text-[#1f2937] font-semibold">last {data.window.days} days</span> · generated {new Date(data.window.generatedAt).toLocaleString()}</>
              : 'Loading…'}
          </p>
          <div className="inline-flex items-center gap-0.5 bg-white dark:bg-[#11151a] border border-[#eaeaea] rounded-lg p-0.5">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                  days === opt.value
                    ? 'bg-[#1f2937] text-white shadow-sm'
                    : 'text-[#6b7280] hover:text-[#1f2937]'
                }`}
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-[12.5px] text-red-700">{error}</div>
        )}

        {/* KPI strip — compact row of 4 (matches dashboard) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label={`Bookings (${days}d)`} value={totals.bookings.toLocaleString()} icon={CalendarCheck} accent="#2F80ED" />
          <StatCard label="Revenue" value={fmtUsd(totals.revenue)} icon={DollarSign} accent="#10b981" />
          <StatCard label="Avg booking" value={fmtUsd(totals.avgValue)} icon={TrendingUp} accent="#0ea5e9" />
          <StatCard label="Top hotel" value={totals.topHotelName} icon={Building2} accent="#8b5cf6" />
        </div>

        {/* Minimal analytics — exactly two charts:
            (1) booking trend (volume + revenue per day)
            (2) top hotels by revenue.
            Everything else (status pie, users-by-role, revenue-by-district)
            was deliberately removed to keep the page scannable. The same
            data is still available via /api/admin/analytics if needed. */}
        <ChartCard title="Booking trend">
          {trendChartData.length === 0 ? (
            <p className="text-[12.5px] py-6 text-center" style={{ color: 'var(--admin-text-faint)' }}>
              {loading ? 'Loading…' : 'No bookings in this window yet.'}
            </p>
          ) : (
            <div style={{ width: '100%', height: 220 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={trendChartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" vertical={false} />
                  <XAxis dataKey="date" stroke="var(--admin-text-faint)" tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="left" stroke="var(--admin-text-faint)" tickLine={false} allowDecimals={false} tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="var(--admin-text-faint)" tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid var(--admin-border)', fontSize: 12, background: 'var(--admin-surface-2)', color: 'var(--admin-text)' }}
                    formatter={(v: any, n: any) => (n === 'Revenue' ? fmtUsd(Number(v)) : v)}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="bookings" name="Bookings" fill="#2F80ED" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  <Bar yAxisId="right" dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Top hotels by revenue">
          {data && data.topHotels.length > 0 ? (
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data.topHotels.slice(0, 8)} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border)" horizontal={false} />
                  <XAxis type="number" stroke="var(--admin-text-faint)" tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <YAxis dataKey="hotelName" type="category" stroke="var(--admin-text-faint)" tickLine={false} width={120} tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v: any) => fmtUsd(Number(v))}
                    contentStyle={{ borderRadius: 8, border: '1px solid var(--admin-border)', fontSize: 12, background: 'var(--admin-surface-2)', color: 'var(--admin-text)' }}
                  />
                  <Bar dataKey="revenue" name="Revenue" fill="#2F80ED" radius={[0, 3, 3, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-[12.5px] py-6 text-center" style={{ color: 'var(--admin-text-faint)' }}>
              {loading ? 'Loading…' : 'No bookings yet — top hotels will populate as guests book.'}
            </p>
          )}
        </ChartCard>
      </div>
    </AdminLayout>
  );
}
