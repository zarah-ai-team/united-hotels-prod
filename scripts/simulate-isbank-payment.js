// scripts/simulate-isbank-payment.js
//
// End-to-end simulation of the İş Bankası payment flow WITHOUT the bank and
// WITHOUT the real database. It:
//   1. spins up the real isbank router in-process with an in-memory fake `db`,
//   2. calls POST /initiate to get a signed 3D form,
//   3. plays the role of the bank: signs an "Approved" callback with the SAME
//      store key and POSTs it to /callback/ok,
//   4. asserts the payment settled to 'paid' and the redirect says success,
//   5. repeats with a TAMPERED signature and asserts it is rejected.
//
// Run: node scripts/simulate-isbank-payment.js
const path = require('path');
const express = require('express');
const axios = require('axios');

// ── Test config (fake creds — never leaves this process) ──────────────────────
const TEST_STORE_KEY = 'SIMULATION_STORE_KEY_123';
process.env.ISBANK_POS_ENABLED = 'true';
process.env.ISBANK_POS_CLIENT_ID = 'TEST000000000';
process.env.ISBANK_POS_STORE_KEY = TEST_STORE_KEY;
process.env.ISBANK_POS_CALLBACK_BASE_URL = 'http://127.0.0.1:9999';
process.env.ISBANK_POS_CURRENCY = 'TRY';

// ── In-memory fake DB injected in place of ../db (no real Postgres touched) ────
const rows = new Map(); // transaction_id -> payment row
const fakePool = {
  query: async (text, params = []) => {
    const sql = String(text).replace(/\s+/g, ' ').trim();
    if (/^CREATE TABLE|^ALTER TABLE/i.test(sql)) return { rows: [], rowCount: 0 };
    if (/^INSERT INTO payments/i.test(sql)) {
      const [user_id, booking_id, amount, currency, oid] = params;
      rows.set(oid, { id: rows.size + 1, user_id, booking_id, amount, currency, status: 'initiated' });
      return { rows: [], rowCount: 1 };
    }
    if (/^SELECT .* FROM payments WHERE transaction_id/i.test(sql)) {
      const r = rows.get(params[0]);
      return { rows: r ? [r] : [], rowCount: r ? 1 : 0 };
    }
    if (/^UPDATE payments SET status/i.test(sql)) {
      const [status, , oid] = params;
      const r = rows.get(oid);
      if (r) r.status = status;
      return { rows: [], rowCount: r ? 1 : 0 };
    }
    if (/^UPDATE bookings SET status/i.test(sql)) return { rows: [], rowCount: 1 };
    return { rows: [], rowCount: 0 };
  },
};
// Force require('../db') (and the controller's require) to resolve to the fake.
const dbPath = require.resolve(path.join(__dirname, '..', 'db.js'));
require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: fakePool };

const pos = require('../utils/isbankPos');
const isbankRouter = require('../routes/isbankPaymentsRoute');

let passed = 0, failed = 0;
const check = (name, cond) => {
  if (cond) { passed += 1; console.log('  ok  -', name); }
  else { failed += 1; console.log('  FAIL-', name); }
};

(async () => {
  const app = express();
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());
  app.use('/api/payments/isbank', isbankRouter);
  const server = app.listen(0);
  const port = server.address().port;
  const base = `http://127.0.0.1:${port}`;
  const http = axios.create({ baseURL: base, maxRedirects: 0, validateStatus: () => true });

  try {
    // 1) Initiate a payment.
    const init = await http.post('/api/payments/isbank/initiate', { bookingId: 42, amount: 100, currency: 'TRY' });
    check('initiate returns 200', init.status === 200);
    check('initiate returns gateUrl', !!init.data.gateUrl);
    check('initiate returns signed fields', !!init.data.fields && !!init.data.fields.hash);
    const oid = init.data.oid;
    check('payment row created as initiated', rows.get(oid)?.status === 'initiated');

    // 2) Play the bank: sign an APPROVED callback with the same store key.
    const approved = {
      clientid: 'TEST000000000', oid, Response: 'Approved', ProcReturnCode: '00',
      mdStatus: '1', amount: '100.00', AuthCode: '654321', HostRefNum: 'HRN1', TransId: 'TX1',
    };
    approved.hash = pos.computeHashV3(approved, TEST_STORE_KEY);
    const okResp = await http.post('/api/payments/isbank/callback/ok', new URLSearchParams(approved).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    check('approved callback redirects (303)', okResp.status === 303);
    check('redirect Location says success', /status=success/.test(okResp.headers.location || ''));
    check('payment row settled to paid', rows.get(oid)?.status === 'paid');

    // 3) Idempotency: a duplicate callback should still redirect success, stay paid.
    const dup = await http.post('/api/payments/isbank/callback/ok', new URLSearchParams(approved).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    check('duplicate callback stays success', /status=success/.test(dup.headers.location || ''));

    // 4) Tampered signature on a NEW order must be rejected (never settle).
    const init2 = await http.post('/api/payments/isbank/initiate', { bookingId: 43, amount: 250, currency: 'TRY' });
    const oid2 = init2.data.oid;
    const tampered = { clientid: 'TEST000000000', oid: oid2, Response: 'Approved', ProcReturnCode: '00', mdStatus: '1', amount: '250.00', hash: 'this-is-not-a-valid-hash' };
    const badResp = await http.post('/api/payments/isbank/callback/ok', new URLSearchParams(tampered).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    check('tampered callback redirects to failed', /status=failed/.test(badResp.headers.location || ''));
    check('tampered callback did NOT settle payment', rows.get(oid2)?.status === 'initiated');

    // 5) Declined card (valid signature, ProcReturnCode != 00) must fail.
    const init3 = await http.post('/api/payments/isbank/initiate', { bookingId: 44, amount: 75, currency: 'TRY' });
    const oid3 = init3.data.oid;
    const declined = { clientid: 'TEST000000000', oid: oid3, Response: 'Declined', ProcReturnCode: '99', mdStatus: '1', amount: '75.00' };
    declined.hash = pos.computeHashV3(declined, TEST_STORE_KEY);
    const decResp = await http.post('/api/payments/isbank/callback/ok', new URLSearchParams(declined).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });
    check('declined (signed) callback redirects to failed', /status=failed/.test(decResp.headers.location || ''));
    check('declined payment marked failed', rows.get(oid3)?.status === 'failed');
  } finally {
    server.close();
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
