// Vendor / property booking notification.
// Sent to the hotel's owning vendor (and optionally an ops inbox) the moment a
// guest books one of their rooms, so the property can prepare for the stay.

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

const buildVendorHtml = (data) => {
  const {
    vendorName, guestName, guestEmail, guestPhone, hotelName, roomName,
    checkIn, checkOut, nights, totalAmount, currency, bookingId, paymentMode,
    specialRequest, manageUrl,
  } = data;

  const row = (label, value) => `
    <tr>
      <td style="padding:10px 0;font-size:13px;color:#6b7280;border-bottom:1px solid #f3f4f6;">${escapeHtml(label)}</td>
      <td style="padding:10px 0;font-size:14px;color:#1f2937;font-weight:500;text-align:right;border-bottom:1px solid #f3f4f6;">${escapeHtml(value)}</td>
    </tr>`;

  const greeting = vendorName ? `Hi ${escapeHtml(vendorName)},` : 'Hello,';

  const body = `
    ${heading('New booking received')}
    ${paragraph(greeting)}
    ${paragraph(`A guest has just booked <strong>${escapeHtml(roomName)}</strong> at <strong>${escapeHtml(hotelName)}</strong>. Details below.`)}

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
            ${row('Guest', guestName || '—')}
            ${guestEmail ? row('Guest email', guestEmail) : ''}
            ${guestPhone ? row('Guest phone', guestPhone) : ''}
            ${row('Room', roomName)}
            ${row('Check-in', formatDate(checkIn))}
            ${row('Check-out', formatDate(checkOut))}
            ${row('Nights', String(nights || 1))}
            ${paymentMode ? row('Payment', String(paymentMode))  : ''}
            ${specialRequest ? row('Special request', specialRequest) : ''}
            <tr>
              <td style="padding:14px 0 4px 0;font-size:13px;color:#1f2937;font-weight:600;">Booking total</td>
              <td style="padding:14px 0 4px 0;font-size:18px;color:#1abc9c;font-weight:700;text-align:right;">${escapeHtml(formatCurrency(totalAmount, currency))}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    ${manageUrl ? `<p style="margin:0 0 24px 0;"><a href="${escapeHtml(manageUrl)}" style="display:inline-block;background:#1abc9c;color:#fff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;">Open vendor portal</a></p>` : ''}

    ${muted('This is an automated notification from United Hotels. Reply to this email to reach the guest if needed.')}
  `;

  return renderEmail({
    title: 'New booking',
    preview: `New booking BK-${bookingId} at ${hotelName} — ${formatDate(checkIn)} to ${formatDate(checkOut)}.`,
    body,
    footer: 'You&rsquo;re receiving this because you manage this property on United Hotels.',
  });
};

const buildVendorText = (data) =>
  [
    `Hi ${data.vendorName || 'there'},`,
    '',
    `New booking at ${data.hotelName}.`,
    '',
    `Reference:       BK-${data.bookingId}`,
    `Guest:           ${data.guestName || '—'}`,
    data.guestEmail ? `Guest email:     ${data.guestEmail}` : null,
    data.guestPhone ? `Guest phone:     ${data.guestPhone}` : null,
    `Room:            ${data.roomName}`,
    `Check-in:        ${formatDate(data.checkIn)}`,
    `Check-out:       ${formatDate(data.checkOut)}`,
    `Nights:          ${data.nights || 1}`,
    data.paymentMode ? `Payment:         ${data.paymentMode}` : null,
    data.specialRequest ? `Special request: ${data.specialRequest}` : null,
    `Total:           ${formatCurrency(data.totalAmount, data.currency)}`,
    data.manageUrl ? `\nVendor portal:   ${data.manageUrl}` : null,
  ]
    .filter(Boolean)
    .join('\n');

/**
 * @param {{to: string|string[], vendorName?: string, guestName?: string,
 *   guestEmail?: string, guestPhone?: string, hotelName: string, roomName: string,
 *   checkIn: string, checkOut: string, nights?: number, totalAmount: number,
 *   currency?: string, bookingId: string|number, paymentMode?: string,
 *   specialRequest?: string, manageUrl?: string}} data
 */
const sendVendorBookingNotification = async (data) => {
  if (!data?.to) {
    console.warn('[email] vendor booking notification skipped — no recipient');
    return { id: null, skipped: true };
  }
  return sendEmail({
    type: 'vendor-booking-notification',
    to: data.to,
    subject: `New booking at ${data.hotelName} (BK-${data.bookingId})`,
    html: buildVendorHtml(data),
    text: buildVendorText(data),
  });
};

module.exports = { sendVendorBookingNotification, buildVendorHtml };
