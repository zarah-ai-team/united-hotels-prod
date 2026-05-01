// Resend email client + thin send() wrapper.
//
// All transactional emails route through this module so we have one place to
// add tracking, retries, fallbacks, etc. If RESEND_API_KEY is missing we log
// the would-be email instead of throwing — keeps local dev frictionless.

const { Resend } = require('resend');

const FROM_DEFAULT = 'United Hotels <onboarding@resend.dev>';

let cachedClient = null;

const getClient = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cachedClient) cachedClient = new Resend(key);
  return cachedClient;
};

const isConfigured = () => Boolean(process.env.RESEND_API_KEY);

const fromAddress = () => process.env.EMAIL_FROM || FROM_DEFAULT;

/**
 * Send an email via Resend.
 * @param {{to: string, subject: string, html: string, text?: string}} params
 * @returns {Promise<{id: string|null, skipped: boolean}>}
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (!to) {
    console.warn('[email] skipped — no recipient');
    return { id: null, skipped: true };
  }

  const client = getClient();

  if (!client) {
    // Local-dev path: log the email so the flow can still be exercised end-to-end.
    console.log('\n──── [email] RESEND_API_KEY not set — logging instead ────');
    console.log(`  from:    ${fromAddress()}`);
    console.log(`  to:      ${to}`);
    console.log(`  subject: ${subject}`);
    if (text) console.log(`  text:\n${text}`);
    console.log('────────────────────────────────────────────────────────\n');
    return { id: null, skipped: true };
  }

  try {
    const { data, error } = await client.emails.send({
      from: fromAddress(),
      to,
      subject,
      html,
      text,
    });
    if (error) {
      console.error('[email] Resend rejected send:', error);
      return { id: null, skipped: false, error };
    }
    return { id: data?.id || null, skipped: false };
  } catch (err) {
    // Never let an email failure bubble up into the user-facing API response —
    // signups and bookings should not 500 because email infra is flaky.
    console.error('[email] send failed:', err);
    return { id: null, skipped: false, error: err };
  }
};

module.exports = {
  sendEmail,
  isConfigured,
  fromAddress,
};
