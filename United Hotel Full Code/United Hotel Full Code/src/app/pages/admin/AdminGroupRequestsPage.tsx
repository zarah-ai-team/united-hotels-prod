import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  RefreshCw,
  Users as UsersIcon,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Wallet,
  Briefcase,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Modal } from '../../components/admin/Modal';
import { adminService } from '../../services/api';

type GroupRequest = {
  id: number;
  name: string;
  email: string;
  phone: string;
  destination: string | null;
  dates: string | null;
  groupSize: string | null;
  budget: string | null;
  groupType: string | null;
  notes: string | null;
  status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost' | 'archived';
  createdAt: string | null;
  updatedAt: string | null;
};

const STATUS_META: Record<GroupRequest['status'], { label: string; color: string; bg: string; ring: string }> = {
  new:       { label: 'New',       color: '#1E5FBC', bg: 'rgba(47, 128, 237,0.10)', ring: 'rgba(47, 128, 237,0.35)' },
  contacted: { label: 'Contacted', color: '#a16207', bg: 'rgba(245,158,11,0.10)',  ring: 'rgba(245,158,11,0.35)' },
  quoted:    { label: 'Quoted',    color: '#1d4ed8', bg: 'rgba(59,130,246,0.10)',  ring: 'rgba(59,130,246,0.35)' },
  won:       { label: 'Won',       color: '#047857', bg: 'rgba(16,185,129,0.10)',  ring: 'rgba(16,185,129,0.35)' },
  lost:      { label: 'Lost',      color: '#b91c1c', bg: 'rgba(239,68,68,0.10)',   ring: 'rgba(239,68,68,0.35)' },
  archived:  { label: 'Archived',  color: '#52525b', bg: 'rgba(120,120,120,0.08)', ring: 'rgba(120,120,120,0.25)' },
};

const ALL_STATUSES: GroupRequest['status'][] = ['new', 'contacted', 'quoted', 'won', 'lost', 'archived'];

const fmtTime = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const StatusPill = ({ status }: { status: GroupRequest['status'] }) => {
  const meta = STATUS_META[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
      style={{
        color: meta.color,
        background: meta.bg,
        boxShadow: `inset 0 0 0 1px ${meta.ring}`,
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {meta.label}
    </span>
  );
};

// Poll interval for new-inquiry toast notifications. 30s is a good balance:
// fast enough that the desk sees new requests within the same screen session,
// slow enough to avoid hammering the API.
const POLL_MS = 30_000;

export function AdminGroupRequestsPage() {
  const [rows, setRows] = useState<GroupRequest[]>([]);
  const [filter, setFilter] = useState<'all' | GroupRequest['status']>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<GroupRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  // Highest request ID we've already shown the admin. New rows with id > this
  // value trigger a popup toast.
  const seenMaxIdRef = useRef<number | null>(null);

  const refresh = async (opts: { showToast?: boolean } = {}) => {
    setLoading(true);
    try {
      const res = await adminService.listGroupRequests({ limit: 200 });
      const list = res.requests as GroupRequest[];
      // Detect anything newer than what we last saw and surface a popup.
      const maxId = list.reduce((acc, r) => (r.id > acc ? r.id : acc), 0);
      const baseline = seenMaxIdRef.current;
      if (baseline != null && opts.showToast) {
        const fresh = list.filter((r) => r.id > baseline);
        if (fresh.length === 1) {
          const r = fresh[0];
          toast.success('New group inquiry', {
            description: `${r.name} · ${r.destination || 'destination TBD'} · ${r.groupSize || 'size TBD'}`,
            action: { label: 'Open', onClick: () => setSelectedId(r.id) },
            duration: 8000,
          });
        } else if (fresh.length > 1) {
          toast.success(`${fresh.length} new group inquiries`, {
            description: 'Open the list to review them.',
            duration: 8000,
          });
        }
      }
      seenMaxIdRef.current = maxId;
      setRows(list);
      setError(null);
    } catch (e: any) {
      setError(e?.data?.error || e?.data?.message || e?.message || 'Failed to load group requests');
    } finally {
      setLoading(false);
    }
  };

  // Initial load (no toast — these aren't new to the admin).
  useEffect(() => {
    refresh({ showToast: false });
  }, []);

  // Background poll while the admin sits on this page.
  useEffect(() => {
    const id = window.setInterval(() => {
      refresh({ showToast: true });
    }, POLL_MS);
    return () => window.clearInterval(id);
  }, []);

  // Whenever a row is selected, re-fetch the full list so the modal renders
  // against the freshest copy of the row. This satisfies the requirement that
  // info refreshes "when the modal renders".
  useEffect(() => {
    if (selectedId == null) {
      setDetail(null);
      return;
    }
    let active = true;
    setDetailLoading(true);
    adminService
      .listGroupRequests({ limit: 200 })
      .then((res) => {
        if (!active) return;
        const fresh = (res.requests as GroupRequest[]).find((r) => r.id === selectedId) || null;
        setRows(res.requests as GroupRequest[]);
        setDetail(fresh);
      })
      .catch((e: any) => {
        if (!active) return;
        setError(e?.data?.error || e?.data?.message || e?.message || 'Failed to load request');
      })
      .finally(() => {
        if (active) setDetailLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: rows.length };
    ALL_STATUSES.forEach((s) => (c[s] = 0));
    rows.forEach((r) => {
      c[r.status] = (c[r.status] || 0) + 1;
    });
    return c;
  }, [rows]);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter((r) => r.status === filter);
  }, [rows, filter]);

  const handleStatusChange = async (status: GroupRequest['status']) => {
    if (!detail) return;
    setStatusUpdating(true);
    try {
      const res = await adminService.updateGroupRequestStatus(detail.id, status);
      setDetail(res.request as GroupRequest);
      setRows((prev) => prev.map((r) => (r.id === detail.id ? (res.request as GroupRequest) : r)));
    } catch (e: any) {
      setError(e?.data?.error || e?.data?.message || e?.message || 'Could not update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <AdminLayout title="Group Requests" breadcrumb="Admin / Group Requests" adminOnly>
      <div className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] text-[#6b7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="text-[#1f2937] font-semibold">{rows.length}</span> group request{rows.length === 1 ? '' : 's'}
          </p>
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-0.5 bg-white dark:bg-[#11151a] border border-[#eaeaea] rounded-lg p-0.5">
              {(['all', ...ALL_STATUSES] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11.5px] font-medium transition-colors ${
                    filter === f
                      ? 'bg-[#1f2937] text-white shadow-sm'
                      : 'text-[#6b7280] hover:text-[#1f2937]'
                  }`}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {f === 'all' ? 'All' : STATUS_META[f as GroupRequest['status']].label}
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
              onClick={() => refresh()}
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
            <div className="p-6 text-center text-[12.5px] text-[#9aa0a6]">Loading group requests…</div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
                <tr>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Received</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Name</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Email</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Phone</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Destination</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Group size</th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Status</th>
                  <th className="px-4 py-2 text-right text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1f1]">
                {filtered.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedId(r.id)}
                    className="hover:bg-[#fafafa] transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2.5 text-[11.5px] text-[#9aa0a6] whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {fmtTime(r.createdAt)}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#1f2937] whitespace-nowrap font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {r.name}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#3b3b3b]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <a href={`mailto:${r.email}`} onClick={(e) => e.stopPropagation()} className="text-[#2F80ED] hover:underline">{r.email}</a>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#3b3b3b] whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <a href={`tel:${r.phone}`} onClick={(e) => e.stopPropagation()} className="text-[#2F80ED] hover:underline">{r.phone}</a>
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#3b3b3b]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {r.destination || '—'}
                    </td>
                    <td className="px-4 py-2.5 text-[12px] text-[#6b7280] whitespace-nowrap" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {r.groupSize || '—'}
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusPill status={r.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11.5px] text-[#2F80ED]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        View <ExternalLink className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="text-[13px] text-[#9aa0a6] mb-1">No group requests yet</div>
                      <div className="text-[11.5px] text-[#d4d4d8]">
                        New submissions from the public /groups page will appear here.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal — pulls a fresh copy every time it opens (selectedId effect above). */}
      <Modal
        isOpen={selectedId !== null}
        onClose={() => setSelectedId(null)}
        title={detail ? `Group request from ${detail.name}` : 'Group request'}
        size="lg"
      >
        {detailLoading || !detail ? (
          <div className="py-10 text-center text-[12.5px] text-[#9aa0a6]">Loading…</div>
        ) : (
          <div className="space-y-5" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Header strip */}
            <div className="flex items-center justify-between flex-wrap gap-3 pb-3 border-b border-[#eaeaea]">
              <div className="flex items-center gap-2 text-[12px] text-[#6b7280]">
                <Clock className="w-3.5 h-3.5" />
                Received {fmtTime(detail.createdAt)}
                {detail.updatedAt && detail.updatedAt !== detail.createdAt && (
                  <span className="text-[#9aa0a6]">· updated {fmtTime(detail.updatedAt)}</span>
                )}
              </div>
              <StatusPill status={detail.status} />
            </div>

            {/* Contact card — the whole point of this admin page */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-[#eaeaea] p-3 bg-[#fafafa]">
                <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.08em] text-[#9aa0a6] mb-1.5">
                  <UsersIcon className="w-3 h-3" /> Name
                </div>
                <div className="text-[13.5px] font-semibold text-[#1f2937]">{detail.name}</div>
              </div>
              <div className="rounded-lg border border-[#eaeaea] p-3 bg-[#fafafa]">
                <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.08em] text-[#9aa0a6] mb-1.5">
                  <Mail className="w-3 h-3" /> Email
                </div>
                <a href={`mailto:${detail.email}`} className="text-[13px] text-[#2F80ED] hover:underline break-all">{detail.email}</a>
              </div>
              <div className="rounded-lg border border-[#eaeaea] p-3 bg-[#fafafa]">
                <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.08em] text-[#9aa0a6] mb-1.5">
                  <Phone className="w-3 h-3" /> Phone / WhatsApp
                </div>
                <a href={`tel:${detail.phone}`} className="text-[13px] text-[#2F80ED] hover:underline">{detail.phone}</a>
              </div>
            </div>

            {/* Trip details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DetailRow icon={MapPin} label="Destination" value={detail.destination} />
              <DetailRow icon={CalendarIcon} label="Dates" value={detail.dates} />
              <DetailRow icon={UsersIcon} label="Group size" value={detail.groupSize} />
              <DetailRow icon={Wallet} label="Budget" value={detail.budget} />
              <DetailRow icon={Briefcase} label="Group type" value={detail.groupType} />
            </div>

            {detail.notes && (
              <div>
                <div className="text-[10.5px] uppercase tracking-[0.08em] text-[#9aa0a6] mb-1.5">Notes</div>
                <div className="rounded-lg border border-[#eaeaea] p-3 bg-white text-[13px] text-[#1f2937] whitespace-pre-wrap">
                  {detail.notes}
                </div>
              </div>
            )}

            {/* Status actions */}
            <div className="border-t border-[#eaeaea] pt-4">
              <div className="text-[10.5px] uppercase tracking-[0.08em] text-[#9aa0a6] mb-2">Update status</div>
              <div className="flex flex-wrap items-center gap-2">
                {ALL_STATUSES.map((s) => {
                  const meta = STATUS_META[s];
                  const active = detail.status === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStatusChange(s)}
                      disabled={statusUpdating || active}
                      className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-colors disabled:opacity-60"
                      style={
                        active
                          ? {
                              color: meta.color,
                              background: meta.bg,
                              boxShadow: `inset 0 0 0 1px ${meta.ring}`,
                            }
                          : {
                              color: '#6b7280',
                              background: 'white',
                              boxShadow: 'inset 0 0 0 1px #eaeaea',
                            }
                      }
                    >
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick contact CTAs */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <a
                href={`https://wa.me/${detail.phone.replace(/[^\d]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#25D366] text-white px-3 py-1.5 text-[12px] font-semibold hover:bg-[#20ba5a] transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Message on WhatsApp
              </a>
            </div>
          </div>
        )}
      </Modal>
    </AdminLayout>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-lg border border-[#eaeaea] p-3 bg-white">
      <div className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.08em] text-[#9aa0a6] mb-1.5">
        <Icon className="w-3 h-3" /> {label}
      </div>
      <div className="text-[13px] text-[#1f2937]">{value || '—'}</div>
    </div>
  );
}

export default AdminGroupRequestsPage;
