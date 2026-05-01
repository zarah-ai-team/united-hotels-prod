// Shared helpers for the /admin pages — turn the raw bookings + hotels
// payload from the API into the numbers the dashboard, bookings table, and
// hotels grid display.

import type { BookingRecord } from '../services/api';
import type { PublicHotel } from '../services/api';

export interface AdminKpis {
  totalBookings: number;
  totalRevenue: number;
  occupancyPct: number | null;
  directBookingPct: number | null;
}

export interface RecentBookingRow {
  id: string;
  guest: string;
  hotelName: string;
  roomName: string;
  checkIn: string;
  status: string;
  amount: string;
}

export interface BookingsTableRow {
  id: string;
  guest: string;
  email: string;
  hotelName: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: string;
  amountNumeric: number;
  status: string;
}

const formatCurrency = (value: number, currency = 'USD') => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `$${Math.round(value).toLocaleString()}`;
  }
};

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  const d = new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d;
};

const daysBetween = (a: Date, b: Date) =>
  Math.max(1, Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)));

const toNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const readField = (record: Record<string, unknown>, ...keys: string[]): unknown => {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== '') {
      return record[key];
    }
  }
  return undefined;
};

const hotelLookup = (hotels: PublicHotel[]) => {
  const byId = new Map<string, PublicHotel>();
  for (const h of hotels) {
    byId.set(String(h.id), h);
  }
  return byId;
};

const roomLookup = (hotels: PublicHotel[]) => {
  const byId = new Map<string, { name: string; hotelId: string | number }>();
  for (const h of hotels) {
    const rooms = (h as unknown as { rooms?: Array<{ id?: number; room_name?: string; room_number?: string }> }).rooms;
    if (!Array.isArray(rooms)) continue;
    for (const r of rooms) {
      if (r?.id != null) {
        byId.set(String(r.id), {
          name: r.room_name || r.room_number || 'Room',
          hotelId: h.id,
        });
      }
    }
  }
  return byId;
};

export function computeKpis(bookings: BookingRecord[], hotels: PublicHotel[]): AdminKpis {
  const totalBookings = bookings.length;

  const totalRevenue = bookings.reduce(
    (sum, b) => sum + toNumber(readField(b as Record<string, unknown>, 'totalAmount', 'total_amount', 'totalamount')),
    0,
  );

  const directCount = bookings.filter((b) => {
    const mode = String(readField(b as Record<string, unknown>, 'paymentMode', 'payment_mode', 'method') || '').toLowerCase();
    return mode === 'direct' || mode === 'cash' || mode === '';
  }).length;
  const directBookingPct = totalBookings > 0 ? Math.round((directCount / totalBookings) * 100) : null;

  // Occupancy = nights booked / total room-nights this period.
  // We approximate by summing booking durations across the last 30 days vs
  // total rooms × 30. If hotels return no totalRooms data, we skip it.
  const totalRooms = hotels.reduce((sum, h) => {
    const t =
      toNumber((h as { totalRooms?: number | null }).totalRooms ?? 0) ||
      toNumber((h as { total_rooms?: number | null }).total_rooms ?? 0);
    return sum + t;
  }, 0);

  let occupancyPct: number | null = null;
  if (totalRooms > 0) {
    const now = Date.now();
    const windowStart = now - 30 * 24 * 60 * 60 * 1000;
    let nightsBooked = 0;
    for (const b of bookings) {
      const from = toDate(readField(b as Record<string, unknown>, 'fromDate', 'from_date', 'check_in_date'));
      const to = toDate(readField(b as Record<string, unknown>, 'toDate', 'to_date', 'check_out_date'));
      if (!from || !to) continue;
      const start = Math.max(from.getTime(), windowStart);
      const end = Math.min(to.getTime(), now);
      if (end > start) {
        nightsBooked += Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
      }
    }
    const capacity = totalRooms * 30;
    occupancyPct = capacity > 0 ? Math.min(100, Math.round((nightsBooked / capacity) * 100)) : null;
  }

  return {
    totalBookings,
    totalRevenue,
    occupancyPct,
    directBookingPct,
  };
}

export function buildRecentBookings(
  bookings: BookingRecord[],
  hotels: PublicHotel[],
  limit = 5,
): RecentBookingRow[] {
  const byHotelId = hotelLookup(hotels);
  const byRoomId = roomLookup(hotels);

  return bookings.slice(0, limit).map((booking) => {
    const record = booking as Record<string, unknown>;
    const hotelId = readField(record, 'hotelId', 'hotel_id', 'hotelid');
    const roomId = readField(record, 'roomId', 'room_id', 'roomid');
    const hotel = hotelId != null ? byHotelId.get(String(hotelId)) : undefined;
    const room = roomId != null ? byRoomId.get(String(roomId)) : undefined;
    const guestName =
      String(readField(record, 'guest_name', 'guestName', 'name') || '') ||
      `Guest #${booking.id}`;
    const checkIn = String(readField(record, 'fromDate', 'from_date', 'check_in_date') || '').slice(0, 10);
    const status = String(readField(record, 'status') || 'confirmed').toLowerCase();
    const amount = formatCurrency(
      toNumber(readField(record, 'totalAmount', 'total_amount', 'totalamount')),
    );

    return {
      id: `BK-${booking.id}`,
      guest: guestName,
      hotelName: hotel?.name || hotel?.hotel_name || 'Hotel',
      roomName: room?.name || 'Room',
      checkIn: checkIn || '—',
      status,
      amount,
    };
  });
}

export function buildBookingsTable(
  bookings: BookingRecord[],
  hotels: PublicHotel[],
): BookingsTableRow[] {
  const byHotelId = hotelLookup(hotels);
  const byRoomId = roomLookup(hotels);

  return bookings.map((booking) => {
    const record = booking as Record<string, unknown>;
    const hotelId = readField(record, 'hotelId', 'hotel_id', 'hotelid');
    const roomId = readField(record, 'roomId', 'room_id', 'roomid');
    const hotel = hotelId != null ? byHotelId.get(String(hotelId)) : undefined;
    const room = roomId != null ? byRoomId.get(String(roomId)) : undefined;
    const fromDate = toDate(readField(record, 'fromDate', 'from_date', 'check_in_date'));
    const toDateValue = toDate(readField(record, 'toDate', 'to_date', 'check_out_date'));
    const nights = fromDate && toDateValue ? daysBetween(fromDate, toDateValue) : 1;
    const amountNumeric = toNumber(readField(record, 'totalAmount', 'total_amount', 'totalamount'));

    return {
      id: `BK-${booking.id}`,
      guest:
        String(readField(record, 'guest_name', 'guestName', 'name') || '') ||
        `Guest #${booking.id}`,
      email: String(readField(record, 'guest_email', 'guestEmail', 'email') || ''),
      hotelName: hotel?.name || hotel?.hotel_name || 'Hotel',
      roomName: room?.name || 'Room',
      checkIn: fromDate ? fromDate.toISOString().slice(0, 10) : '—',
      checkOut: toDateValue ? toDateValue.toISOString().slice(0, 10) : '—',
      nights,
      amount: formatCurrency(amountNumeric),
      amountNumeric,
      status: String(readField(record, 'status') || 'confirmed').toLowerCase(),
    };
  });
}

// Group bookings into 7 weekly buckets ending today.
// Returns chart-ready rows for the dashboard recharts LineChart.
export interface WeeklyRevenuePoint {
  id: string;
  date: string;
  direct: number;
  ota: number;
}

export function buildWeeklyRevenue(bookings: BookingRecord[]): WeeklyRevenuePoint[] {
  const buckets: WeeklyRevenuePoint[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - i * 7 - 6);
    const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    buckets.push({ id: `w${i}`, date: label, direct: 0, ota: 0 });
  }
  if (bookings.length === 0) return buckets;

  const earliestBucket = new Date(now);
  earliestBucket.setDate(earliestBucket.getDate() - 7 * 7);

  for (const booking of bookings) {
    const record = booking as Record<string, unknown>;
    const created = toDate(readField(record, 'created_at', 'createdAt'));
    if (!created || created < earliestBucket) continue;
    const weeksAgo = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24 * 7));
    const idx = 6 - weeksAgo;
    if (idx < 0 || idx >= buckets.length) continue;
    const amount = toNumber(readField(record, 'totalAmount', 'total_amount', 'totalamount'));
    const mode = String(readField(record, 'paymentMode', 'payment_mode', 'method') || '').toLowerCase();
    if (mode === 'direct' || mode === 'cash' || mode === '') {
      buckets[idx].direct += amount;
    } else {
      buckets[idx].ota += amount;
    }
  }
  return buckets;
}

export const formatKpiCurrency = (value: number) => formatCurrency(value);
