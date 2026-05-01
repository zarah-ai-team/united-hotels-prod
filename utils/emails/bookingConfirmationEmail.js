// Booking confirmation email.
// Triggered after a guest successfully books a room.

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
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const buildBookingHtml = ({
  guestName,
  bookingId,
  hotelName,
  hotelAddress,
  roomName,
  checkIn,
  checkOut,
  nights,
  totalAmount,
  currency,
  manageUrl,
}) => {
  const detailRow = (label, value) => `
    <tr>
      <td style="padding:10px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;font-size:14px;color:#1f2937;font-weight:500;text-align:right;border-bottom:1px solid #f3f4f6;">${escapeHtml(value)}</td>
    </tr>`;

  const greeting = guestName ? `Hi ${escapeHtml(guestName)},` : 'Hi there,';

  const body = `
    ${heading('Your booking is confirmed')}
    ${paragraph(greeting)}
    ${paragraph(
      `Thanks for booking with United Hotels. Your reservation at <strong>${escapeHtml(hotelName)}</strong> is locked in. Here are the details:`
    )}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 16px 0;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="background:linear-gradient(135deg, rgba(26,188,156,0.1), rgba(56,189,248,0.06));padding:16px 20px;border-bottom:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:#6b7280;">Booking reference</p>
          <p style="margin:4px 0 0 0;font-size:18px;font-weight:600;color:#1f2937;font-family:monospace;">BK-${escapeHtml(bookingId)}</p>
        </td>
      </tr>
      <tr>
        <td style="padding:8px 20px 16px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${detailRow('Hotel', hotelName)}
            ${hotelAddress ? detailRow('Address', hotelAddress) : ''}
            ${detailRow('Room', roomName)}
            ${detailRow('Check-in', formatDate(checkIn))}
            ${detailRow('Check-out', formatDate(checkOut))}
            ${detailRow('Nights', String(nights || 1))}
            <tr>
              <td style="padding:14px 0 4px 0;font-size:13px;color:#1f2937;font-weight:600;">Total paid</td>
              <td style="padding:14px 0 4px 0;font-size:18px;color:#1abc9c;font-weight:700;text-align:right;">${escapeHtml(formatCurrency(totalAmount, currency))}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${manageUrl ? `<p style="margin:0 0 24px 0;"><a href="${escapeHtml(manageUrl)}" style="display:inline-block;background:#1abc9c;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">View booking details</a></p>` : ''}

    ${muted('Need to make changes? Reply to this email or contact the property directly.')}
  `;

  return renderEmail({
    title: 'Booking confirmed',
    preview: `Your stay at ${hotelName} from ${formatDate(checkIn)} to ${formatDate(checkOut)} is confirmed.`,
    body,
    footer: 'You&rsquo;re receiving this email because you completed a booking on United Hotels. Please keep this email for your records.',
  });
};

const buildBookingText = ({
  guestName,
  bookingId,
  hotelName,
  hotelAddress,
  roomName,
  checkIn,
  checkOut,
  nights,
  totalAmount,
  currency,
  manageUrl,
}) =>
  [
    `Hi ${guestName || 'there'},`,
    '',
    `Your booking at ${hotelName} is confirmed.`,
    '',
    `Reference: BK-${bookingId}`,
    `Hotel:     ${hotelName}`,
    hotelAddress ? `Address:   ${hotelAddress}` : null,
    `Room:      ${roomName}`,
    `Check-in:  ${formatDate(checkIn)}`,
    `Check-out: ${formatDate(checkOut)}`,
    `Nights:    ${nights || 1}`,
    `Total:     ${formatCurrency(totalAmount, currency)}`,
    manageUrl ? `\nView details: ${manageUrl}` : null,
    '',
    'Need to make changes? Reply to this email or contact the property directly.',
  ]
    .filter(Boolean)
    .join('\n');

const sendBookingConfirmationEmail = async (booking) => {
  if (!booking?.to) {
    console.warn('[email] booking confirmation skipped — no recipient');
    return { id: null, skipped: true };
  }
  return sendEmail({
    type: 'booking-confirmation',
    to: booking.to,
    subject: `Booking confirmed at ${booking.hotelName} (BK-${booking.bookingId})`,
    html: buildBookingHtml(booking),
    text: buildBookingText(booking),
  });
};

module.exports = { sendBookingConfirmationEmail, buildBookingHtml };
