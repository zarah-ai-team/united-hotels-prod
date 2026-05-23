import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  X,
  Building2,
  User as UserIcon,
  Mail,
  CalendarRange,
  BedDouble,
  DollarSign,
  Filter,
  ChevronRight,
  Plus,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { vendorService } from '../../services/api';
import { AdminBookingCreateDialog } from '../../components/admin/AdminBookingCreateDialog';

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

const STATUS_OPTIONS: Array<{ key: StatusFilter; label: string }> = [
  { key: 'all',         label: 'All' },
  { key: 'confirmed',   label: 'Confirmed' },
  { key: 'pending',     label: 'Pending' },
  { key: 'checked-in',  label: 'Checked-in' },
  { key: 'checked-out', label: 'Checked-out' },
  { key: 'cancelled',   label: 'Cancelled' },
];

const fmtUsd = (n: number) => `$${Math.round(Number(n) || 0).toLocaleString()}`;
const fmtDate = (d: string | null) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};
const fmtShortDate = (d: string | null) => {
  if (!d) return '—';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d).slice(0, 10);
  return dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const nightsBetween = (checkIn: string, checkOut: string) => {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  if (!Number.isFinite(ms)) return 0;
  return Math.max(0, Math.round(ms / 86400000));
};

const initials = (name?: string | null, email?: string | null) => {
  const src = (name || email || 'G').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (src[0] + (src[1] || '')).toUpperCase();
};

const statusClass = (status: string) => {
  const s = (status || '').toLowerCase();
  if (s === 'confirmed' || s === 'booked') return 'status-pill status-confirmed';
  if (s === 'pending') return 'status-pill status-pending';
  if (s === 'checked-in') return 'status-pill status-checked-in';
  if (s === 'checked-out') return 'status-pill status-checked-out';
  if (s === 'cancelled') return 'status-pill status-cancelled';
  return 'status-pill status-checked-out';
};

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [selected, setSelected] = useState<Booking | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const reload = useCallback(() => {
    setLoading(true);
    return vendorService
      .getBookings()
      .then((res) => setBookings(res.bookings as unknown as Booking[]))
      .catch((e: any) => setError(e?.data?.error || e?.message || 'Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    vendorService
      .getBookings()
      .then((res) => { if (active) setBookings(res.bookings as unknown as Booking[]); })
      .catch((e: any) => { if (active) setError(e?.data?.error || e?.message || 'Failed to load bookings'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: bookings.length };
    bookings.forEach((b) => {
      const s = (b.status || '').toLowerCase();
      c[s] = (c[s] || 0) + 1;
    });
    return c;
  }, [bookings]);

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

  const totalRevenue = useMemo(
    () => filtered.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0),
    [filtered],
  );

  return (
    <AdminLayout title="Bookings" breadcrumb="Admin / Bookings">
      <div className="space-y-3">
        {/* Top info bar — solid charcoal in BOTH modes per the brief.
            Holds the count, total revenue, search and status filter. */}
        <div className="admin-strip rounded-xl overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_auto] items-stretch">
            {/* Stats */}
            <div className="flex items-center divide-x divide-white/10 px-4">
              <div className="pr-5 py-3">
                <div className="admin-strip-cell">Total bookings</div>
                <div className="text-[18px] font-semibold text-white tabular-nums leading-none mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {bookings.length.toLocaleString()}
                </div>
              </div>
              <div className="px-5 py-3">
                <div className="admin-strip-cell">Filtered revenue</div>
                <div className="text-[18px] font-semibold text-[#5DA0F8] tabular-nums leading-none mt-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {fmtUsd(totalRevenue)}
                </div>
              </div>
            </div>

            {/* Search — middle */}
            <div className="flex items-center px-3 py-2 md:py-0 border-t md:border-t-0 md:border-l border-white/10">
              <div className="relative w-full max-w-md">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/45" />
                <input
                  placeholder="Search ID, guest name, email, or hotel…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 pl-8 pr-3 py-2.5 text-[12.5px] text-white placeholder-white/35 focus:outline-none"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            {/* Status filter dropdown + New booking button */}
            <div className="flex items-center gap-2 px-3 py-2 md:py-0 border-t md:border-t-0 md:border-l border-white/10">
              <div className="relative">
                <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/45 pointer-events-none" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                  className="appearance-none bg-white/[0.06] hover:bg-white/[0.10] text-white text-[12.5px] font-medium pl-8 pr-7 py-1.5 rounded-md border border-white/10 focus:outline-none focus:ring-1 focus:ring-white/30 cursor-pointer"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {STATUS_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key} className="bg-[#1f2937] text-white">
                      {o.label} {counts[o.key] != null ? `(${counts[o.key]})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronRight className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-white/45 pointer-events-none" />
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(true)}
                className="inline-flex items-center gap-1.5 bg-[#2F80ED] hover:bg-[#1E5FBC] text-white text-[12.5px] font-semibold px-3 py-1.5 rounded-md shadow-[0_8px_18px_-8px_rgba(47,128,237,0.7)] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <Plus className="w-3.5 h-3.5" />
                New booking
              </button>
            </div>
          </div>
        </div>

        <AdminBookingCreateDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onCreated={reload}
        />

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2 text-[12.5px] text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="admin-card overflow-hidden">
          {loading ? (
            <p className="p-6 text-[12.5px] text-center" style={{ color: 'var(--admin-text-muted)' }}>Loading bookings…</p>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-[13px]" style={{ color: 'var(--admin-text-muted)' }}>No bookings match your filters.</div>
              <div className="text-[11.5px] mt-1" style={{ color: 'var(--admin-text-faint)' }}>Try clearing the search or switching status.</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--admin-border)' }}>
                    {['Booking', 'Guest', 'Property', 'Check-in', 'Nights', 'Amount', 'Status'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-4 py-2.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] ${
                          i === 5 ? 'text-right' : 'text-left'
                        }`}
                        style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text-muted)' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b, idx) => (
                    <tr
                      key={b.id}
                      onClick={() => setSelected(b)}
                      className={`admin-row cursor-pointer ${
                        idx !== filtered.length - 1 ? 'border-b' : ''
                      }`}
                      style={{ borderColor: 'var(--admin-border-soft)' }}
                    >
                      {/* Booking ID + created date */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className="font-mono text-[12px] font-semibold text-[#1E5FBC] dark:text-[#5DA0F8]">BK-{b.id}</div>
                        <div className="text-[10.5px] mt-0.5" style={{ color: 'var(--admin-text-faint)' }}>
                          {fmtShortDate(b.created_at)}
                        </div>
                      </td>

                      {/* Guest avatar + name + email */}
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-[10.5px] font-semibold shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #2F80ED, #1E5FBC)',
                              boxShadow: '0 4px 10px -4px rgba(47, 128, 237,0.45)',
                            }}
                          >
                            {initials(b.user_name, b.user_email)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-semibold truncate" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text)' }}>
                              {b.user_name || 'Guest'}
                            </div>
                            <div className="text-[10.5px] truncate" style={{ color: 'var(--admin-text-faint)' }}>
                              {b.user_email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Hotel + room */}
                      <td className="px-4 py-3 align-top">
                        <div className="text-[12.5px] font-medium truncate max-w-[200px]" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text)' }}>
                          {b.hotel_name || '—'}
                        </div>
                        <div className="text-[10.5px] truncate" style={{ color: 'var(--admin-text-faint)' }}>
                          <BedDouble className="w-2.5 h-2.5 inline -mt-0.5 mr-1" />
                          {b.room_name || 'Room'}{b.room_category ? ` · ${b.room_category}` : ''}
                        </div>
                      </td>

                      {/* Check-in (full date) + check-out (short) */}
                      <td className="px-4 py-3 align-top whitespace-nowrap">
                        <div className="text-[12.5px] font-medium" style={{ fontFamily: 'Inter, sans-serif', color: 'var(--admin-text)' }}>
                          {fmtShortDate(b.check_in_date)}
                        </div>
                        <div className="text-[10.5px]" style={{ color: 'var(--admin-text-faint)' }}>
                          → {fmtShortDate(b.check_out_date)}
                        </div>
                      </td>

                      {/* Nights */}
                      <td className="px-4 py-3 align-top">
                        <span
                          className="inline-flex items-center justify-center min-w-[28px] h-6 rounded-md text-[11px] font-semibold tabular-nums"
                          style={{
                            background: 'rgba(47, 128, 237,0.10)',
                            color: '#1E5FBC',
                            border: '1px solid rgba(47, 128, 237,0.20)',
                          }}
                        >
                          {nightsBetween(b.check_in_date, b.check_out_date)}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 align-top text-right whitespace-nowrap">
                        <div className="text-[13.5px] font-bold tabular-nums" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--admin-text)' }}>
                          {fmtUsd(Number(b.total_price))}
                        </div>
                      </td>

                      {/* Status pill */}
                      <td className="px-4 py-3 align-top">
                        <span className={statusClass(b.status)}>{b.status || 'unknown'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-[10.5px] text-right" style={{ color: 'var(--admin-text-faint)' }}>
          Showing {filtered.length} of {bookings.length} bookings · click any row for details
        </p>
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
          <aside
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md admin-card rounded-none border-l h-full overflow-y-auto p-6"
            style={{ borderRadius: 0 }}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              style={{ color: 'var(--admin-text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
            <div className="font-mono text-[11px] font-semibold mb-1 text-[#1E5FBC] dark:text-[#5DA0F8]">BK-{selected.id}</div>
            <h2 className="text-[18px] font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: 'var(--admin-text)' }}>
              {selected.user_name || 'Booking detail'}
            </h2>
            <span className={`mt-2 inline-block ${statusClass(selected.status)}`}>{selected.status || 'unknown'}</span>

            <div className="mt-5 space-y-3">
              <Field icon={UserIcon} label="Guest" value={selected.user_name || 'Anonymous'} />
              <Field icon={Mail} label="Email" value={selected.user_email || '—'} />
              <Field
                icon={Building2}
                label="Hotel"
                value={`${selected.hotel_name || '—'}${selected.hotel_location ? ` · ${selected.hotel_location}` : ''}`}
              />
              <Field
                icon={BedDouble}
                label="Room"
                value={`${selected.room_name || '—'}${selected.room_category ? ` (${selected.room_category})` : ''}`}
              />
              <Field
                icon={CalendarRange}
                label="Stay"
                value={`${fmtDate(selected.check_in_date)} → ${fmtDate(selected.check_out_date)} · ${nightsBetween(selected.check_in_date, selected.check_out_date)} night(s)`}
              />
              <Field icon={DollarSign} label="Total" value={fmtUsd(Number(selected.total_price))} />
              {selected.special_request && (
                <div
                  className="rounded-lg p-3"
                  style={{
                    background: 'var(--admin-row-hover)',
                    border: '1px solid var(--admin-border)',
                  }}
                >
                  <div className="text-[10.5px] uppercase tracking-[0.08em] font-semibold mb-1" style={{ color: 'var(--admin-text-faint)' }}>
                    Special request
                  </div>
                  <p className="text-[12.5px]" style={{ color: 'var(--admin-text)' }}>
                    {selected.special_request}
                  </p>
                </div>
              )}
              <p className="text-[10.5px] pt-2" style={{ color: 'var(--admin-text-faint)' }}>
                Created {selected.created_at ? new Date(selected.created_at).toLocaleString() : '—'}
              </p>
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
      <div
        className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0"
        style={{
          background: 'linear-gradient(135deg, rgba(47, 128, 237,0.12), rgba(47, 128, 237,0.22))',
          boxShadow: 'inset 0 0 0 1px rgba(47, 128, 237,0.25)',
        }}
      >
        <Icon className="w-3.5 h-3.5 text-[#1E5FBC] dark:text-[#5DA0F8]" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[10.5px] uppercase tracking-[0.08em] font-semibold" style={{ color: 'var(--admin-text-faint)' }}>
          {label}
        </div>
        <div className="text-[12.5px] break-words" style={{ color: 'var(--admin-text)' }}>{value}</div>
      </div>
    </div>
  );
}
