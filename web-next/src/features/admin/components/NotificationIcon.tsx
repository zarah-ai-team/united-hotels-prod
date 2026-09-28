import {
  AlertTriangle, CalendarCheck, CalendarX, Clock, CreditCard, Handshake, MailWarning, UserPlus, Bell,
} from 'lucide-react';

// Icon + accent per notification type, shared by the bell and the page.
export const NOTIFICATION_META: Record<string, { Icon: typeof Bell; color: string; category: string }> = {
  booking:           { Icon: CalendarCheck, color: '#16a34a', category: 'bookings' },
  booking_pending:   { Icon: Clock,         color: '#d97706', category: 'bookings' },
  booking_cancelled: { Icon: CalendarX,     color: '#dc2626', category: 'bookings' },
  payment:           { Icon: CreditCard,    color: '#2F80ED', category: 'payments' },
  payment_failed:    { Icon: AlertTriangle, color: '#dc2626', category: 'payments' },
  group_request:     { Icon: Handshake,     color: '#7c3aed', category: 'groups' },
  user:              { Icon: UserPlus,      color: '#0891b2', category: 'users' },
  email_failed:      { Icon: MailWarning,   color: '#dc2626', category: 'emails' },
};

export function NotificationIcon({ type, size = 'sm' }: { type: string; size?: 'sm' | 'md' }) {
  const meta = NOTIFICATION_META[type] || { Icon: Bell, color: '#6b7280' };
  const box = size === 'md' ? 'h-9 w-9' : 'h-7 w-7';
  const icon = size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <span
      className={`${box} shrink-0 rounded-full flex items-center justify-center`}
      style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
    >
      <meta.Icon className={icon} strokeWidth={2} />
    </span>
  );
}
