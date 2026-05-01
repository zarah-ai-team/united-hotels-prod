import { useEffect, useMemo, useState } from 'react';
import { Search, X, Building2, User as UserIcon, Mail, CalendarRange, BedDouble, DollarSign } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { vendorService } from '../../services/api';

type Booking = {
  id: number;
  user_id: number | null;
  room_id: number | null;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: string;
  special_request: string | null;
  created_at: string;
  user_name: string | null;
  user_email: string | null;
  room_name: string | null;
  room_category: string | null;
  hotel_id: number | null;
  hotel_name: string | null;
  hotel_location: string | null;
};

type StatusFilter = 'all' | 'confirmed' | 'pending' | 'cancelled' | 'checked-in' | 'checked-out';

const fmtUsd = (n: number) => `$${Math.round(Number(n) || 0).toLocaleString()}`;
const fmtDate = (d: string | null) => (d ? String(d).slice(0, 10) : '—');

const nightsBetween = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.round(ms / 86400000));
};

const getStatusBadgeClass = (status: string) => {
  const base = 'inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold';
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'booked') return `${base} bg-emerald-50 text-emerald-700`;
  if (s === 'pending') return `${base} bg-amber-50 text-amber-700`;
  if (s === 'cancelled') return `${base} bg-red-50 text-red-700`;
  if (s === 'checked-in') return `${base} bg-blue-50 text-blue-700`;
  if (s === 'checked-out') return `${base} bg-gray-100 text-gray-700`;
  return `${base} bg-gray-100 text-gray-700`;
};

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Booking | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    vendorService
      .getBookings()
      .then((res) => {
        if (!active) return;
        setBookings(res.bookings as unknown as Booking[]);
      })
      .catch((e: any) => {
        if (active) setError(e?.data?.error || e?.message || 'Failed to load bookings');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return bookings.filter((b) => {
      const matchSearch = !q ||
        String(b.id).includes(q) ||
        (b.user_name || '').toLowerCase().includes(q) ||
        (b.user_email || '').toLowerCase().includes(q) ||
        (b.hotel_name || '').toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || (b.status || '').toLowerCase() === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  return (
    <AdminLayout title="Bookings" breadcrumb="Admin / Bookings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-[#6b7280]">{bookings.length.toLocaleString()} bookings · live from Neon</p>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]" />
              <input
                placeholder="Search ID / guest / hotel"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-[#eaeaea] pl-9 pr-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-[#1ABC9C]/30 focus:border-[#1ABC9C]"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="rounded-lg border border-[#eaeaea] px-3 py-2 text-sm bg-white"
            >
              <option value="all">All statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="checked-in">Checked-in</option>
              <option value="checked-out">Checked-out</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Table */}
        <div className="bg-white rounded-xl border border-[#eaeaea] overflow-hidden">
          {loading ? (
            <p className="p-6 text-sm text-[#8c8c8c]">Loading bookings…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-sm text-[#8c8c8c]">No bookings match your filters.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#fafafa] text-[#8c8c8c]">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">ID</th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">Guest</th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">Hotel</th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">Room</th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">Check-in</th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">Nights</th>
                    <th className="px-4 py-3 text-right font-medium uppercase tracking-wider text-xs">Amount</th>
                    <th className="px-4 py-3 text-left font-medium uppercase tracking-wider text-xs">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeaea] bg-white">
                  {filtered.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-[#fafafa] cursor-pointer transition-colors"
                      onClick={() => setSelected(b)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-[#1ABC9C]">BK-{b.id}</td>
                      <td className="px-4 py-3 text-[#3b3b3b]">
                        <div className="font-medium">{b.user_name || 'Guest'}</div>
                        <div className="text-xs text-[#8c8c8c]">{b.user_email || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-[#3b3b3b]">{b.hotel_name || '—'}</td>
                      <td className="px-4 py-3 text-[#6b7280]">{b.room_name || '—'}</td>
                      <td className="px-4 py-3">{fmtDate(b.check_in_date)}</td>
                      <td className="px-4 py-3">{nightsBetween(b.check_in_date, b.check_out_date)}</td>
                      <td className="px-4 py-3 text-right font-semibold">{fmtUsd(Number(b.total_price))}</td>
                      <td className="px-4 py-3"><span className={getStatusBadgeClass(b.status)}>{b.status || 'unknown'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto p-6"
          >
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 text-[#8c8c8c] hover:text-[#3b3b3b]">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-[#3b3b3b]">Booking BK-{selected.id}</h2>
            <span className={`mt-2 inline-block ${getStatusBadgeClass(selected.status)}`}>{selected.status || 'unknown'}</span>

            <div className="mt-6 space-y-4 text-sm">
              <Field icon={UserIcon} label="Guest" value={selected.user_name || 'Anonymous'} />
              <Field icon={Mail} label="Email" value={selected.user_email || '—'} />
              <Field icon={Building2} label="Hotel" value={`${selected.hotel_name || '—'}${selected.hotel_location ? ` · ${selected.hotel_location}` : ''}`} />
              <Field icon={BedDouble} label="Room" value={`${selected.room_name || '—'}${selected.room_category ? ` (${selected.room_category})` : ''}`} />
              <Field
                icon={CalendarRange}
                label="Stay"
                value={`${fmtDate(selected.check_in_date)} → ${fmtDate(selected.check_out_date)} · ${nightsBetween(selected.check_in_date, selected.check_out_date)} night(s)`}
              />
              <Field icon={DollarSign} label="Total" value={fmtUsd(Number(selected.total_price))} />
              {selected.special_request && (
                <div className="rounded-lg bg-[#fafafa] border border-[#eaeaea] p-3">
                  <div className="text-xs text-[#8c8c8c] mb-1">Special request</div>
                  <p className="text-[13px] text-[#3b3b3b]">{selected.special_request}</p>
                </div>
              )}
              <p className="text-xs text-[#8c8c8c]">Created {selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}</p>
            </div>
          </aside>
        </div>
      )}
    </AdminLayout>
  );
}

function Field({
  icon: Icon, label, value,
}: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="h-9 w-9 rounded-full bg-[#1ABC9C]/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-[#1ABC9C]" />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-[#8c8c8c] uppercase tracking-wider">{label}</div>
        <div className="text-[#3b3b3b] break-words">{value}</div>
      </div>
    </div>
  );
}
