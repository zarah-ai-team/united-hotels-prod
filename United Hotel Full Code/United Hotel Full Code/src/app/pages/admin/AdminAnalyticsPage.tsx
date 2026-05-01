import { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, DollarSign, CalendarCheck, Building2, Users } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService, vendorService, type AdminAnalytics } from '../../services/api';
import { useRole } from '../../components/admin/RoleSwitcher';

const COLORS = ['#1ABC9C', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#6B7280'];
const RANGE_OPTIONS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

const fmtUsd = (n: number) => `$${Math.round(Number(n) || 0).toLocaleString()}`;

function StatCard({
  label, value, icon: Icon, accent = '#1ABC9C',
}: {
  label: string; value: string | number; icon: React.ComponentType<{ className?: string; strokeWidth?: number; style?: React.CSSProperties }>; accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#eaeaea]/80 p-3 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] hover:shadow-[0_8px_22px_-10px_rgba(26,188,156,0.25)] hover:border-[#1ABC9C]/30 transition-all">
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
  <div className="bg-white rounded-xl border border-[#eaeaea]/80 shadow-[0_2px_8px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
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

  const usersByRoleChartData = useMemo(() => {
    if (!data) return [];
    return [
      { name: 'Users', value: data.usersByRole.user },
      { name: 'Vendors', value: data.usersByRole.vendor },
      { name: 'Admins', value: data.usersByRole.admin },
    ].filter((r) => r.value > 0);
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
          <div className="inline-flex items-center gap-0.5 bg-white border border-[#eaeaea] rounded-lg p-0.5">
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
          <StatCard label={`Bookings (${days}d)`} value={totals.bookings.toLocaleString()} icon={CalendarCheck} accent="#1ABC9C" />
          <StatCard label="Revenue" value={fmtUsd(totals.revenue)} icon={DollarSign} accent="#10b981" />
          <StatCard label="Avg booking" value={fmtUsd(totals.avgValue)} icon={TrendingUp} accent="#0ea5e9" />
          <StatCard label="Top hotel" value={totals.topHotelName} icon={Building2} accent="#8b5cf6" />
        </div>

        {/* Revenue trend — chart height 320 → 220 */}
        <ChartCard title="Revenue · Direct vs OTA">
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendChartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" vertical={false} />
                <XAxis dataKey="date" stroke="#9aa0a6" tickLine={false} axisLine={{ stroke: '#eaeaea' }} tick={{ fontSize: 11 }} />
                <YAxis stroke="#9aa0a6" tickLine={false} axisLine={{ stroke: '#eaeaea' }} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => fmtUsd(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="direct" name="Direct" stroke="#1ABC9C" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="ota" name="OTA" stroke="#8c8c8c" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Bookings/day + Status breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <ChartCard title="Daily bookings">
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={trendChartData} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" vertical={false} />
                    <XAxis dataKey="date" stroke="#9aa0a6" tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis stroke="#9aa0a6" tickLine={false} allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12 }} />
                    <Bar dataKey="bookings" name="Bookings" fill="#1ABC9C" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          <ChartCard title="Bookings by status">
            {data && data.bookingsByStatus.length > 0 ? (
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={data.bookingsByStatus} dataKey="count" nameKey="status" outerRadius={68} label={{ fontSize: 10 }} isAnimationActive={false}>
                      {data.bookingsByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-[12.5px] text-[#9aa0a6] py-6 text-center">{loading ? 'Loading…' : 'No bookings yet.'}</p>
            )}
          </ChartCard>
        </div>

        {/* Top hotels + Users by role */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2">
            <ChartCard title="Top hotels (revenue)">
              {data && data.topHotels.length > 0 ? (
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={data.topHotels} layout="vertical" margin={{ left: 4, right: 16, top: 4, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" horizontal={false} />
                      <XAxis type="number" stroke="#9aa0a6" tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <YAxis dataKey="hotelName" type="category" stroke="#9aa0a6" tickLine={false} width={120} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: any) => fmtUsd(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12 }} />
                      <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[0, 3, 3, 0]} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-[12.5px] text-[#9aa0a6] py-6 text-center">{loading ? 'Loading…' : 'No data yet.'}</p>
              )}
            </ChartCard>
          </div>

          <ChartCard title="Users by role" right={<Users className="w-3.5 h-3.5 text-[#1abc9c]" />}>
            {usersByRoleChartData.length > 0 ? (
              <div style={{ width: '100%', height: 200 }}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={usersByRoleChartData} dataKey="value" nameKey="name" innerRadius={38} outerRadius={68} label={{ fontSize: 10 }} isAnimationActive={false}>
                      {usersByRoleChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-[12.5px] text-[#9aa0a6] py-6 text-center">{loading ? 'Loading…' : 'No users yet.'}</p>
            )}
          </ChartCard>
        </div>

        {/* Revenue by district */}
        {data && data.revenueByDistrict.length > 0 && (
          <ChartCard title="Revenue by district">
            <div style={{ width: '100%', height: 200 }}>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.revenueByDistrict} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" vertical={false} />
                  <XAxis dataKey="district" stroke="#9aa0a6" tickLine={false} tick={{ fontSize: 11 }} />
                  <YAxis stroke="#9aa0a6" tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => fmtUsd(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea', fontSize: 12 }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#F59E0B" radius={[3, 3, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        )}
      </div>
    </AdminLayout>
  );
}
