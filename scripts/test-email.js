// scripts/test-email.js
//
// Verify transactional email delivery end-to-end after configuring a provider.
// Sends a sample GUEST confirmation and a sample VENDOR notification, then
// prints which provider was used (resend / smtp / ethereal) and the result.
//
// Usage:
//   node scripts/test-email.js                 # sends to EMAIL_FROM / SMTP_USER
//   node scripts/test-email.js you@example.com # sends to a specific address
//
// If you see provider "ethereal", real mail was NOT delivered — set
// RESEND_API_KEY or a valid Gmail App Password (see .env.example).
require('dotenv').config();
const { isConfigured, fromAddress } = require('../utils/emails/client');
const { sendBookingConfirmationEmail } = require('../utils/emails/bookingConfirmationEmail');
const { sendVendorBookingNotification } = require('../utils/emails/vendorBookingNotification');

const to =
  process.argv[2] ||
  process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] ||
  process.env.SMTP_USER ||
  process.env.SUPPORT_INBOX;

(async () => {
  console.log('Provider configured (Resend or SMTP):', isConfigured());
  console.log('From address:', fromAddress());
  console.log('Sending test emails to:', to, '\n');

  if (!to) {
    console.error('No recipient. Pass one: node scripts/test-email.js you@example.com');
    process.exit(1);
  }

  const sample = {
    hotelName: 'Grand Plaza Istanbul',
    roomName: 'Deluxe King Room',
    checkIn: '2026-07-01',
    checkOut: '2026-07-04',
    nights: 3,
    totalAmount: 450,
    currency: 'USD',
    bookingId: 'TEST-1',
    paymentMode: 'card',
    specialRequest: 'Late check-in around 11pm',
  };

  const guest = await sendBookingConfirmationEmail({
    to,
    guestName: 'Jane Doe',
    ...sample,
    manageUrl: `${(process.env.FRONTEND_URL || '').replace(/\/+$/, '')}/portal`,
  });
  console.log('GUEST confirmation  ->', { provider: guest.provider, id: guest.id, error: guest.error?.message, preview: guest.previewUrl });

  const vendor = await sendVendorBookingNotification({
    to,
    vendorName: 'Property Manager',
    guestName: 'Jane Doe',
    guestEmail: 'jane@example.com',
    guestPhone: '+90 555 000 0000',
    ...sample,
    manageUrl: `${(process.env.FRONTEND_URL || '').replace(/\/+$/, '')}/vendor`,
  });
  console.log('VENDOR notification ->', { provider: vendor.provider, id: vendor.id, error: vendor.error?.message, preview: vendor.previewUrl });

  console.log('\nDone. If provider is "ethereal", open the preview URL above; real inboxes did NOT receive it.');
  process.exit(0);
})();
