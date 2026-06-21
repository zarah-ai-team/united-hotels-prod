// Transactional email client.
//
// Resolution order on every send:
//   1. Resend  — when RESEND_API_KEY is set (production path).
//   2. SMTP    — when SMTP_USER + SMTP_PASS are set (e.g. Gmail/SES/Mailgun).
//   3. Ethereal — auto-provisioned test SMTP account; emails are captured
//      and viewable at the preview URL printed in the server logs. Lets the
//      whole flow be exercised end-to-end without the operator signing up
//      for anything.
//
// Every send (regardless of provider) writes a row to email_logs so the
// admin panel can display "what mail did the system attempt recently?".

const { Resend } = require('resend');
const nodemailer = require('nodemailer');
const pool = require('../../db');

const FROM_DEFAULT = 'United Hotels <onboarding@resend.dev>';

let cachedResendClient = null;
let cachedSmtpTransporter = null;
let etherealReadyPromise = null;
let etherealAccount = null;

const getResendClient = () => {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!cachedResendClient) cachedResendClient = new Resend(key);
  return cachedResendClient;
};

const hasRealSmtp = () => Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);

const getSmtpTransporter = () => {
  if (!hasRealSmtp()) return null;
  if (cachedSmtpTransporter) return cachedSmtpTransporter;
  cachedSmtpTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    service: process.env.SMTP_SERVICE || undefined,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    tls: { rejectUnauthorized: false }
  });
  return cachedSmtpTransporter;
};

// Lazily create an Ethereal test account. The whole point of Ethereal is to
// give us a working SMTP target with zero setup — every send returns a
// preview URL that opens the captured message in a browser.
const getEtherealTransporter = async () => {
  if (etherealReadyPromise) return etherealReadyPromise;
  etherealReadyPromise = (async () => {
    etherealAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: etherealAccount.smtp.host,
      port: etherealAccount.smtp.port,
      secure: etherealAccount.smtp.secure,
      auth: { user: etherealAccount.user, pass: etherealAccount.pass }
    });
    console.log('\n──── [email] Ethereal test inbox provisioned ────');
    console.log(`  user:    ${etherealAccount.user}`);
    console.log(`  pass:    ${etherealAccount.pass}`);
    console.log(`  webmail: https://ethereal.email/messages`);
    console.log('  Sends will print a one-off preview URL per email.');
    console.log('────────────────────────────────────────────────────\n');
    return transporter;
  })().catch((err) => {
    console.error('[email] failed to provision Ethereal account:', err.message);
    etherealReadyPromise = null;
    throw err;
  });
  return etherealReadyPromise;
};

const isConfigured = () => Boolean(process.env.RESEND_API_KEY) || hasRealSmtp();

const fromAddress = () => {
  if (process.env.EMAIL_FROM) return process.env.EMAIL_FROM;
  if (etherealAccount?.user) return `United Hotels <${etherealAccount.user}>`;
  if (process.env.SMTP_USER) return `United Hotels <${process.env.SMTP_USER}>`;
  return FROM_DEFAULT;
};

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

const sendViaResend = async ({ type, to, subject, html, text }) => {
  const client = getResendClient();
  const { data, error } = await client.emails.send({ from: fromAddress(), to, subject, html, text });
  if (error) {
    await logEmail({
      type, recipient: to, subject, status: 'failed',
      errorMessage: error?.message || JSON.stringify(error).slice(0, 500)
    });
    return { id: null, skipped: false, error, provider: 'resend' };
  }
  await logEmail({ type, recipient: to, subject, status: 'sent', providerId: data?.id || null });
  return { id: data?.id || null, skipped: false, provider: 'resend' };
};

const sendViaTransporter = async (transporter, providerName, { type, to, subject, html, text }) => {
  const info = await transporter.sendMail({ from: fromAddress(), to, subject, html, text });
  const previewUrl = nodemailer.getTestMessageUrl(info) || null;
  if (previewUrl) {
    console.log(`[email] sent ${type || ''} → ${to} via ${providerName}\n          preview: ${previewUrl}`);
  } else {
    console.log(`[email] sent ${type || ''} → ${to} via ${providerName} (id ${info.messageId})`);
  }
  await logEmail({
    type, recipient: to, subject, status: 'sent',
    providerId: info.messageId || null,
    errorMessage: previewUrl ? `preview: ${previewUrl}` : null
  });
  return { id: info.messageId || null, skipped: false, provider: providerName, previewUrl };
};

/**
 * Send a transactional email through the first available provider.
 * Order: Resend → SMTP → Ethereal (auto-provisioned).
 * Never throws — failures are logged and a result object is returned.
 *
 * @param {{type?: string, to: string, subject: string, html: string, text?: string}} params
 * @returns {Promise<{id: string|null, skipped: boolean, error?: any, provider?: string, previewUrl?: string|null}>}
 */
const sendEmail = async ({ type, to, subject, html, text }) => {
  if (!to) {
    console.warn('[email] skipped — no recipient', { type, subject });
    await logEmail({ type, recipient: '', subject, status: 'skipped', errorMessage: 'no recipient' });
    return { id: null, skipped: true };
  }

  // Priority 1 — Resend
  if (getResendClient()) {
    try {
      return await sendViaResend({ type, to, subject, html, text });
    } catch (err) {
      console.error('[email] Resend send threw:', err.message);
      await logEmail({ type, recipient: to, subject, status: 'failed', errorMessage: err?.message });
      // Fall through to SMTP/Ethereal so we still try to deliver.
    }
  }

  // Priority 2 — real SMTP creds
  const smtp = getSmtpTransporter();
  if (smtp) {
    try {
      return await sendViaTransporter(smtp, 'smtp', { type, to, subject, html, text });
    } catch (err) {
      console.error('[email] SMTP send failed:', err.message);
      await logEmail({ type, recipient: to, subject, status: 'failed', errorMessage: err?.message });
      // Fall through to Ethereal so the dev flow still emits something viewable.
    }
  }

  // Priority 3 — Ethereal (zero-config dev fallback). NEVER in production:
  // Ethereal delivers to a throwaway inbox, so falling back to it in prod
  // silently swallows real mail (the guest/vendor never receives anything)
  // while the call still "succeeds". In production we instead fail loudly so
  // a credential misconfig is visible in the logs and email_logs table.
  if (process.env.NODE_ENV === 'production') {
    const msg =
      'No working email provider in production. Set RESEND_API_KEY (recommended) ' +
      'or valid SMTP_USER/SMTP_PASS (Gmail needs a 16-char App Password).';
    console.error(`[email] ${msg} — NOT delivered:`, { type, to, subject });
    await logEmail({ type, recipient: to, subject, status: 'failed', errorMessage: msg });
    return { id: null, skipped: false, error: new Error(msg) };
  }

  try {
    const ethereal = await getEtherealTransporter();
    return await sendViaTransporter(ethereal, 'ethereal', { type, to, subject, html, text });
  } catch (err) {
    console.error('[email] Ethereal send failed:', err.message);
    await logEmail({ type, recipient: to, subject, status: 'failed', errorMessage: err?.message });
    return { id: null, skipped: false, error: err };
  }
};

module.exports = {
  sendEmail,
  isConfigured,
  fromAddress,
};
