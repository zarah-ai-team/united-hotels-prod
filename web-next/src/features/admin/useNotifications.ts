import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { notificationService, type AdminNotification } from '@/shared/api/services';

const POLL_MS = 60_000;
const LAST_SEEN_KEY = 'uh_notifications_last_seen';

// "Last seen" is a per-browser convenience, so localStorage is enough. Every
// access is guarded: storage can be blocked (private mode, strict settings).
const readLastSeen = (): number => {
  try {
    const raw = localStorage.getItem(LAST_SEEN_KEY);
    const n = raw ? Date.parse(raw) : NaN;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
};

const writeLastSeen = (iso: string) => {
  try { localStorage.setItem(LAST_SEEN_KEY, iso); } catch { /* storage unavailable */ }
  // Keep the bell and the notifications page in sync within this tab.
  window.dispatchEvent(new CustomEvent('uh-notifications-seen'));
};

/**
 * Polls the activity feed. `unreadCount` counts items newer than the last time
 * the viewer marked everything read. `toastNew` pops a toast for items that
 * arrive while the page is open (use it in one place only, the header bell).
 */
export function useNotifications({ limit = 30, toastNew = false }: { limit?: number; toastNew?: boolean } = {}) {
  const [items, setItems] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSeen, setLastSeen] = useState<number>(() => readLastSeen());
  const knownIds = useRef<Set<string> | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await notificationService.list(limit);
      const list = Array.isArray(res.notifications) ? res.notifications : [];

      if (toastNew && knownIds.current) {
        const fresh = list.filter((n) => !knownIds.current!.has(n.id));
        if (fresh.length === 1) {
          toast(fresh[0].title, { description: fresh[0].detail || undefined, duration: 8000 });
        } else if (fresh.length > 1) {
          toast(`${fresh.length} new notifications`, { description: fresh[0].title, duration: 8000 });
        }
      }
      knownIds.current = new Set(list.map((n) => n.id));

      setItems(list);
      setError(null);
    } catch (e: any) {
      setError(e?.data?.error || e?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [limit, toastNew]);

  useEffect(() => {
    refresh();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') refresh();
    }, POLL_MS);
    const onSeen = () => setLastSeen(readLastSeen());
    window.addEventListener('uh-notifications-seen', onSeen);
    window.addEventListener('storage', onSeen);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('uh-notifications-seen', onSeen);
      window.removeEventListener('storage', onSeen);
    };
  }, [refresh]);

  const isUnread = useCallback((n: AdminNotification) => Date.parse(n.createdAt) > lastSeen, [lastSeen]);
  const unreadCount = items.filter(isUnread).length;

  const markAllRead = useCallback(() => {
    const newest = items[0]?.createdAt;
    const stamp = newest && Date.parse(newest) > Date.now() ? newest : new Date().toISOString();
    writeLastSeen(stamp);
    setLastSeen(Date.parse(stamp));
  }, [items]);

  return { items, loading, error, unreadCount, isUnread, markAllRead, refresh };
}

// "5 min ago" style labels.
export function timeAgo(iso: string): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return '';
  const s = Math.max(0, Math.round((Date.now() - t) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? '' : 's'} ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d === 1 ? '' : 's'} ago`;
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
