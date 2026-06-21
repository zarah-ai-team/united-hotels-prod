// Booking cancellation email.
// Sent when a booking is cancelled — to the guest (their reservation is off),
// and to the vendor/property + admin/ops (so they can release the room and
// update their records). One template, audience-aware wording.

const { sendEmail } = require('./client');
const { renderEmail, heading, paragraph, muted, escapeHtml } = require('./layout');

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatCurrency = (amount, currency = 'USD') => {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const buildCancellationHtml = (data) => {
  const {
    audience = 'guest', guestName, hotelName, roomName,
    checkIn, checkOut, bookingId, totalAmount, currency, reason,
  } = data;

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;font-size:14px;color:#1f2937;font-weight:500;text-align:right;border-bottom:1px solid #f3f4f6;">${escapeHtml(value)}</td>
    </tr>`;

  const isGuest = audience === 'guest';
  const greeting = isGuest
    ? (guestName ? `Hi ${escapeHtml(guestName)},` : 'Hello,')
    : 'Hello,';
  const lead = isGuest
    ? `Your booking for <strong>${escapeHtml(roomName)}</strong> at <strong>${escapeHtml(hotelName)}</strong> has been cancelled. If this wasn't you, please contact our support team.`
    : `The booking below at <strong>${escapeHtml(hotelName)}</strong> has been cancelled. The room has been released back to availability.`;

  const body = `
    ${heading('Booking cancelled')}
    ${paragraph(greeting)}
    ${paragraph(lead)}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:linear-gradient(135deg, rgba(239,68,68,0.10), rgba(239,68,68,0.04));padding:16px 20px;border-bottom:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">Cancelled booking</p>
          <p style="margin:4px 0 0 0;font-size:18px;font-weight:600;color:#1f2937;font-family:monospace;">BK-${escapeHtml(bookingId)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 20px 16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${!isGuest && guestName ? row('Guest', guestName) : ''}
            ${row('Room', roomName)}
            ${row('Check-in', formatDate(checkIn))}
            ${row('Check-out', formatDate(checkOut))}
            ${reason ? row('Reason', reason) : ''}
            <tr>
              <td style="padding:14px 0 4px 0;font-size:13px;color:#1f2937;font-weight:600;">Booking total</td>
              <td style="padding:14px 0 4px 0;font-size:18px;color:#ef4444;font-weight:700;text-align:right;">${escapeHtml(formatCurrency(totalAmount, currency))}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${muted('This is an automated notification from United Hotels.')}
  `;

  return renderEmail({
    title: 'Booking cancelled',
    preview: `Booking BK-${bookingId} at ${hotelName} has been cancelled.`,
    body,
    footer: isGuest
      ? 'You&rsquo;re receiving this because you made a booking on United Hotels.'
      : 'You&rsquo;re receiving this because you manage this property on United Hotels.',
  });
};

/**
 * @param {{to: string|string[], audience?: 'guest'|'vendor'|'admin',
 *   guestName?: string, hotelName: string, roomName: string, checkIn: string,
 *   checkOut: string, bookingId: string|number, totalAmount?: number,
 *   currency?: string, reason?: string}} data
 */
const sendBookingCancellationEmail = async (data) => {
  if (!data?.to) {
    console.warn('[email] booking cancellation skipped — no recipient');
    return { id: null, skipped: true };
  }
  return sendEmail({
    type: 'booking-cancellation',
    to: data.to,
    subject: `Booking cancelled — ${data.hotelName} (BK-${data.bookingId})`,
    html: buildCancellationHtml(data),
  });
};

module.exports = { sendBookingCancellationEmail, buildCancellationHtml };
