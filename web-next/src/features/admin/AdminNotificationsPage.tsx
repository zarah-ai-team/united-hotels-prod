import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { CheckCheck, ChevronRight, RefreshCw } from 'lucide-react';
import { AdminLayout } from '@/features/admin/components/AdminLayout';
import { useRole } from '@/features/admin/components/RoleSwitcher';
import { NotificationIcon, NOTIFICATION_META } from '@/features/admin/components/NotificationIcon';
import { useNotifications, timeAgo } from '@/features/admin/useNotifications';

const FILTERS: Array<{ key: string; label: string; adminOnly?: boolean }> = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'payments', label: 'Payments', adminOnly: true },
  { key: 'groups', label: 'Group inquiries', adminOnly: true },
  { key: 'users', label: 'Sign-ups', adminOnly: true },
  { key: 'emails', label: 'Email failures', adminOnly: true },
];

const fmtFull = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function AdminNotificationsPage() {
  const navigate = useNavigate();
  const isAdmin = useRole() === 'admin';
  const { items, loading, error, unreadCount, isUnread, markAllRead, refresh } = useNotifications({ limit: 100 });
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const visibleFilters = FILTERS.filter((f) => isAdmin || !f.adminOnly);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length, unread: 0 };
    for (const n of items) {
      const cat = NOTIFICATION_META[n.type]?.category || 'other';
      c[cat] = (c[cat] || 0) + 1;
      if (isUnread(n)) c.unread += 1;
    }
    return c;
  }, [items, isUnread]);

  const shown = useMemo(() => {
    if (filter === 'all') return items;
    if (filter === 'unread') return items.filter(isUnread);
    return items.filter((n) => NOTIFICATION_META[n.type]?.category === filter);
  }, [items, filter, isUnread]);

  const doRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  return (
    <AdminLayout title="Notifications" breadcrumb="Admin">
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[12.5px] text-[#6b7280] dark:text-white/60">
            Latest activity across {isAdmin ? 'bookings, payments, group inquiries, sign-ups and emails' : 'bookings for your hotels'}.
            {' '}Updates every minute.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={doRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#eaeaea] dark:border-white/10 bg-white dark:bg-transparent px-3 py-1.5 text-[12.5px] font-semibold text-[#3b3b3b] dark:text-white/80 hover:bg-[#fafafa] dark:hover:bg-white/[0.06] disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </button>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F80ED] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#1E5FBC] disabled:opacity-50"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {visibleFilters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`rounded-full px-3 py-1 text-[12px] font-medium transition-colors ${
                  active
                    ? 'bg-[#2F80ED] text-white'
                    : 'bg-white dark:bg-white/[0.04] text-[#4b5563] dark:text-white/70 border border-[#eaeaea] dark:border-white/10 hover:border-[#2F80ED]/50'
                }`}
              >
                {f.label}
                <span className={`ml-1.5 ${active ? 'text-white/80' : 'text-[#9aa0a6]'}`}>{counts[f.key] || 0}</span>
              </button>
            );
          })}
        </div>

        <div className="admin-card dark:border-white/8 overflow-hidden">
          {loading && items.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-[#9aa0a6]">Loading notifications…</p>
          ) : error && items.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-red-600">{error}</p>
          ) : shown.length === 0 ? (
            <p className="px-4 py-10 text-center text-[13px] text-[#9aa0a6]">Nothing here yet.</p>
          ) : (
            <ul className="divide-y divide-[#f1f1f1] dark:divide-white/5">
              {shown.map((n) => {
                const unread = isUnread(n);
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => navigate(n.link)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#fafafa] dark:hover:bg-white/[0.03] ${
                        unread ? 'bg-[#2F80ED]/[0.04] dark:bg-[#2F80ED]/[0.10]' : ''
                      }`}
                    >
                      <NotificationIcon type={n.type} size="md" />
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[13px] text-[#1f2937] dark:text-white ${unread ? 'font-semibold' : 'font-medium'}`}>
                          {n.title}
                        </span>
                        {n.detail && <span className="block text-[12px] text-[#6b7280] dark:text-white/60 truncate">{n.detail}</span>}
                      </span>
                      <span className="hidden sm:block text-right shrink-0">
                        <span className="block text-[11.5px] text-[#6b7280] dark:text-white/60">{timeAgo(n.createdAt)}</span>
                        <span className="block text-[10.5px] text-[#9aa0a6] dark:text-white/40">{fmtFull(n.createdAt)}</span>
                      </span>
                      {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-[#2F80ED]" aria-label="Unread" />}
                      <ChevronRight className="w-4 h-4 shrink-0 text-[#c4c9d0]" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
