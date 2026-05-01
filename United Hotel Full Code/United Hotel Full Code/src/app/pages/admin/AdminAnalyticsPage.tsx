import { useEffect, useMemo, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, DollarSign, CalendarCheck, Building2, Users } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService, type AdminAnalytics } from '../../services/api';

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
  label: string; value: string | number; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; accent?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-[#eaeaea] p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="h-11 w-11 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}1a` }}>
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </div>
      </div>
      <p className="mt-3 text-xs text-[#8c8c8c] uppercase tracking-wider">{label}</p>
      <p className="mt-1 text-2xl font-bold text-[#3b3b3b]">{value}</p>
    </div>
  );
}

export function AdminAnalyticsPage() {
  const [days, setDays] = useState<number>(30);
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    adminService
      .getAnalytics(days)
      .then((d) => { if (active) setData(d); })
      .catch((e: any) => { if (active) setError(e?.data?.error || e?.message || 'Failed to load analytics'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [days]);

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
    <AdminLayout title="Analytics" breadcrumb="Admin / Analytics" adminOnly>
      <div className="space-y-6">
        {/* Range selector */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#6b7280]">
            {data ? `Window: last ${data.window.days} days · generated ${new Date(data.window.generatedAt).toLocaleString()}` : 'Loading…'}
          </p>
          <div className="flex gap-2">
            {RANGE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setDays(opt.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  days === opt.value ? 'bg-[#1ABC9C] text-white' : 'bg-[#eaeaea] text-[#3b3b3b] hover:bg-[#d4d4d4]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* KPI strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label={`Bookings (last ${days}d)`} value={totals.bookings.toLocaleString()} icon={CalendarCheck} accent="#1ABC9C" />
          <StatCard label="Revenue" value={fmtUsd(totals.revenue)} icon={DollarSign} accent="#3B82F6" />
          <StatCard label="Avg booking value" value={fmtUsd(totals.avgValue)} icon={TrendingUp} accent="#F59E0B" />
          <StatCard label="Top hotel" value={totals.topHotelName} icon={Building2} accent="#8B5CF6" />
        </div>

        {/* Revenue trend */}
        <div className="bg-white rounded-xl border border-[#eaeaea] p-6 shadow-sm">
          <h3 className="text-base font-semibold text-[#3b3b3b] mb-4">Revenue · Direct vs OTA</h3>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={trendChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" vertical={false} />
                <XAxis dataKey="date" stroke="#8c8c8c" tickLine={false} axisLine={{ stroke: '#eaeaea' }} />
                <YAxis stroke="#8c8c8c" tickLine={false} axisLine={{ stroke: '#eaeaea' }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => fmtUsd(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea' }} />
                <Legend />
                <Line type="monotone" dataKey="direct" name="Direct" stroke="#1ABC9C" strokeWidth={2} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="ota" name="OTA" stroke="#8c8c8c" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bookings/day + Status breakdown side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#eaeaea] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#3b3b3b] mb-4">Daily bookings</h3>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={trendChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" vertical={false} />
                  <XAxis dataKey="date" stroke="#8c8c8c" tickLine={false} />
                  <YAxis stroke="#8c8c8c" tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea' }} />
                  <Bar dataKey="bookings" name="Bookings" fill="#1ABC9C" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#eaeaea] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#3b3b3b] mb-4">Bookings by status</h3>
            {data && data.bookingsByStatus.length > 0 ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={data.bookingsByStatus} dataKey="count" nameKey="status" outerRadius={90} label isAnimationActive={false}>
                      {data.bookingsByStatus.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-[#8c8c8c]">{loading ? 'Loading…' : 'No bookings yet.'}</p>
            )}
          </div>
        </div>

        {/* Top hotels + Users by role */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-[#eaeaea] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#3b3b3b] mb-4">Top hotels (revenue)</h3>
            {data && data.topHotels.length > 0 ? (
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={data.topHotels} layout="vertical" margin={{ left: 10, right: 30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" horizontal={false} />
                    <XAxis type="number" stroke="#8c8c8c" tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <YAxis dataKey="hotelName" type="category" stroke="#8c8c8c" tickLine={false} width={140} />
                    <Tooltip formatter={(v: any) => fmtUsd(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea' }} />
                    <Bar dataKey="revenue" name="Revenue" fill="#3B82F6" radius={[0, 4, 4, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-[#8c8c8c]">{loading ? 'Loading…' : 'No data yet.'}</p>
            )}
          </div>

          <div className="bg-white rounded-xl border border-[#eaeaea] p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-[#1abc9c]" />
              <h3 className="text-base font-semibold text-[#3b3b3b]">Users by role</h3>
            </div>
            {usersByRoleChartData.length > 0 ? (
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={usersByRoleChartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} label isAnimationActive={false}>
                      {usersByRoleChartData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-[#8c8c8c]">{loading ? 'Loading…' : 'No users yet.'}</p>
            )}
          </div>
        </div>

        {/* Revenue by district */}
        {data && data.revenueByDistrict.length > 0 && (
          <div className="bg-white rounded-xl border border-[#eaeaea] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[#3b3b3b] mb-4">Revenue by district</h3>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.revenueByDistrict}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaeaea" vertical={false} />
                  <XAxis dataKey="district" stroke="#8c8c8c" tickLine={false} />
                  <YAxis stroke="#8c8c8c" tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: any) => fmtUsd(Number(v))} contentStyle={{ borderRadius: 8, border: '1px solid #eaeaea' }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#F59E0B" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
