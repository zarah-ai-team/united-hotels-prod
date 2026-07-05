const pool = require('../db');
const { sendEmail } = require('../utils/emails/client');
const { renderEmail, heading, paragraph, muted, escapeHtml } = require('../utils/emails/layout');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s().-]{6,}$/;
const MAX_TEXT = 1000;

const ALLOWED_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost', 'archived'];

let tableReady = false;

// Best-effort schema bootstrap. We create the table on first use rather than
// requiring a migration step, so the feature works in any environment
// (Neon prod, sqlite dev, fresh database) without ops coordination.
const ensureTable = async () => {
  if (tableReady) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS group_requests (
        id            SERIAL PRIMARY KEY,
        name          TEXT NOT NULL,
        email         TEXT NOT NULL,
        phone         TEXT NOT NULL,
        destination   TEXT,
        dates         TEXT,
        group_size    TEXT,
        budget        TEXT,
        group_type    TEXT,
        notes         TEXT,
        status        TEXT NOT NULL DEFAULT 'new',
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
    tableReady = true;
  } catch (err) {
    console.error('[group_requests] ensureTable failed:', err.message);
  }
};

const trim = (v) => String(v ?? '').trim();

const submitGroupRequest = async (req, res) => {
  try {
    await ensureTable();

    const body = req.body || {};
    const name = trim(body.name);
    const email = trim(body.email).toLowerCase();
    const phone = trim(body.phone);
    const destination = trim(body.destination);
    const dates = trim(body.dates);
    const groupSize = trim(body.groupSize);
    const budget = trim(body.budget);
    const groupType = trim(body.type || body.groupType);
    const notes = trim(body.notes);

    if (!name || !email || !phone) {
      return res.status(400).json({ message: 'Name, email, and phone are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (!PHONE_RE.test(phone)) {
      return res.status(400).json({ message: 'Please provide a valid phone number.' });
    }
    for (const [field, value] of Object.entries({ destination, dates, groupSize, budget, groupType, notes })) {
      if (value.length > MAX_TEXT) {
        return res.status(400).json({ message: `${field} is too long.` });
      }
    }

    const insert = await pool.query(
      `INSERT INTO group_requests
         (name, email, phone, destination, dates, group_size, budget, group_type, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING id, name, email, phone, destination, dates, group_size AS "groupSize",
                 budget, group_type AS "groupType", notes, status, created_at AS "createdAt"`,
      [name, email, phone, destination || null, dates || null, groupSize || null, budget || null, groupType || null, notes || null],
    );
    const saved = insert.rows[0];

    // Notify the group desk inbox best-effort. Failure shouldn't fail the
    // submission — the row is already persisted and visible in the admin
    // portal even if delivery is blocked.
    const inbox = process.env.GROUPS_INBOX || process.env.SUPPORT_INBOX || process.env.EMAIL_FROM || process.env.SMTP_USER;
    if (inbox) {
      const html = renderEmail({
        title: 'Group request',
        preview: `New group request from ${name}`,
        body: `
          ${heading('New group request')}
          ${paragraph(`<strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;`)}
          ${paragraph(`<strong>Phone / WhatsApp:</strong> ${escapeHtml(phone)}`)}
          ${paragraph(`<strong>Destination:</strong> ${escapeHtml(destination || '—')}`)}
          ${paragraph(`<strong>Dates:</strong> ${escapeHtml(dates || '—')}`)}
          ${paragraph(`<strong>Group size:</strong> ${escapeHtml(groupSize || '—')}`)}
          ${paragraph(`<strong>Budget:</strong> ${escapeHtml(budget || '—')}`)}
          ${paragraph(`<strong>Group type:</strong> ${escapeHtml(groupType || '—')}`)}
          ${notes ? paragraph(`<strong>Notes:</strong> ${escapeHtml(notes)}`) : ''}
          ${muted(`Reply directly to ${escapeHtml(email)} or message ${escapeHtml(phone)} on WhatsApp.`)}
        `,
      });
      sendEmail({
        type: 'group_request',
        to: inbox,
        subject: `[Groups] ${groupType || 'Group'} — ${name}`,
        html,
        text: `From: ${name} <${email}>\nPhone: ${phone}\nDestination: ${destination}\nDates: ${dates}\nGroup size: ${groupSize}\nBudget: ${budget}\nType: ${groupType}\n\n${notes}`,
      }).catch((err) => console.warn('[group_requests] inbox email failed:', err?.message));
    }

    // Acknowledge to the requester so they know it landed (best-effort).
    const ackHtml = renderEmail({
      title: 'Group request received',
      preview: 'Thanks — we usually respond with an offer within 2-3 hours.',
      body: `
        ${heading(`Thanks, ${escapeHtml(name)}!`)}
        ${paragraph('We&rsquo;ve received your group request. We usually respond with an offer &mdash; hotel options and pricing &mdash; within 2-3 hours.')}
        ${paragraph(`<strong>Destination:</strong> ${escapeHtml(destination || '—')}`)}
        ${paragraph(`<strong>Dates:</strong> ${escapeHtml(dates || '—')}`)}
        ${paragraph(`<strong>Group size:</strong> ${escapeHtml(groupSize || '—')}`)}
        ${muted('Need anything sooner? Just reply to this email or message us on WhatsApp.')}
      `,
    });
    sendEmail({
      type: 'group_request_ack',
      to: email,
      subject: 'We received your group request — United Hotels',
      html: ackHtml,
      text: `Hi ${name},\n\nWe received your group request and will be in touch shortly.\n\nDestination: ${destination || '—'}\nDates: ${dates || '—'}\nGroup size: ${groupSize || '—'}\n\n— United Hotels`,
    }).catch((err) => console.warn('[group_requests] ack email failed:', err?.message));

    return res.status(201).json({
      message: 'Your group request has been received.',
      request: saved,
    });
  } catch (err) {
    console.error('[group_requests] submit failed:', err);
    return res.status(500).json({ message: 'Could not save your request. Please try again.' });
  }
};

const listGroupRequests = async (req, res) => {
  try {
    await ensureTable();
    const status = trim(req.query.status);
    const limit = Math.min(parseInt(req.query.limit, 10) || 200, 500);
    const params = [];
    let where = '';
    if (status && ALLOWED_STATUSES.includes(status)) {
      params.push(status);
      where = `WHERE status = $${params.length}`;
    }
    params.push(limit);
    const result = await pool.query(
      `SELECT id, name, email, phone, destination, dates,
              group_size AS "groupSize", budget, group_type AS "groupType",
              notes, status, created_at AS "createdAt", updated_at AS "updatedAt"
         FROM group_requests
         ${where}
         ORDER BY created_at DESC
         LIMIT $${params.length}`,
      params,
    );
    return res.json({ requests: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('[group_requests] list failed:', err);
    return res.status(500).json({ message: 'Could not load group requests.' });
  }
};

const updateGroupRequestStatus = async (req, res) => {
  try {
    await ensureTable();
    const id = parseInt(req.params.id, 10);
    const status = trim(req.body?.status);
    if (!id) return res.status(400).json({ message: 'Invalid id.' });
    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Status must be one of: ${ALLOWED_STATUSES.join(', ')}.` });
    }
    const result = await pool.query(
      `UPDATE group_requests
          SET status = $1, updated_at = NOW()
        WHERE id = $2
        RETURNING id, name, email, phone, destination, dates,
                  group_size AS "groupSize", budget, group_type AS "groupType",
                  notes, status, created_at AS "createdAt", updated_at AS "updatedAt"`,
      [status, id],
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Request not found.' });
    }
    return res.json({ request: result.rows[0] });
  } catch (err) {
    console.error('[group_requests] update status failed:', err);
    return res.status(500).json({ message: 'Could not update status.' });
  }
};

module.exports = {
  submitGroupRequest,
  listGroupRequests,
  updateGroupRequestStatus,
};
