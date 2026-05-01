// Resend email client + thin send() wrapper.
//
// All transactional emails route through this module so we have one place
// to add tracking, retries, fallbacks, and an audit log. Every send (whether
// it actually went out via Resend or was logged-only because the API key is
// missing) writes a row to the email_logs table — the admin panel reads
// from that to show "what mail did the system attempt to send recently?".

const { Resend } = require('resend');
const pool = require('../../db');

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

// Best-effort audit logger. Never let a logging failure poison the email
// flow — the catch swallows everything.
const logEmail = async ({ type, recipient, subject, status, providerId, errorMessage }) => {
  try {
    await pool.query(
      `INSERT INTO email_logs (type, recipient, subject, status, provider_id, error_message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        type || 'unknown',
        recipient || '',
        subject || '',
        status || 'sent',
        providerId || null,
        errorMessage || null,
      ],
    );
  } catch (err) {
    // Log to console so we still see the trail even when the audit table
    // doesn't exist (e.g. fresh Postgres without the migration applied yet).
    console.warn('[email] log write failed:', err.message);
  }
};

/**
 * Send an email via Resend (or skip + log when no API key).
 * @param {{type?: string, to: string, subject: string, html: string, text?: string}} params
 *   `type` is a short tag used by the admin email-logs view —
 *   e.g. 'welcome' / 'reset' / 'booking-confirmation' / 'password-changed'.
 * @returns {Promise<{id: string|null, skipped: boolean, error?: any}>}
 */
const sendEmail = async ({ type, to, subject, html, text }) => {
  if (!to) {
    console.warn('[email] skipped — no recipient', { type, subject });
    await logEmail({
      type,
      recipient: '',
      subject,
      status: 'skipped',
      errorMessage: 'no recipient',
    });
    return { id: null, skipped: true };
  }

  const client = getClient();

  if (!client) {
    // Local-dev path: log the email so the flow can still be exercised end-to-end.
    console.log(`\n──── [email] RESEND_API_KEY not set — logging instead (${type || 'unknown'}) ────`);
    console.log(`  from:    ${fromAddress()}`);
    console.log(`  to:      ${to}`);
    console.log(`  subject: ${subject}`);
    if (text) console.log(`  text:\n${text}`);
    console.log('───────────────────────────────────────────────────────────────────\n');
    await logEmail({
      type,
      recipient: to,
      subject,
      status: 'logged',
      errorMessage: 'RESEND_API_KEY not set',
    });
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
      await logEmail({
        type,
        recipient: to,
        subject,
        status: 'failed',
        errorMessage: error?.message || JSON.stringify(error).slice(0, 500),
      });
      return { id: null, skipped: false, error };
    }
    console.log(`[email] sent ${type || ''} → ${to} (resend id ${data?.id})`);
    await logEmail({
      type,
      recipient: to,
      subject,
      status: 'sent',
      providerId: data?.id || null,
    });
    return { id: data?.id || null, skipped: false };
  } catch (err) {
    // Never let an email failure bubble up into the user-facing API response —
    // signups and bookings should not 500 because email infra is flaky.
    console.error('[email] send failed:', err);
    await logEmail({
      type,
      recipient: to,
      subject,
      status: 'failed',
      errorMessage: err?.message || String(err).slice(0, 500),
    });
    return { id: null, skipped: false, error: err };
  }
};

module.exports = {
  sendEmail,
  isConfigured,
  fromAddress,
};
