// scripts/test-isbank-mock-flow.js
//
// Drives the full payment flow against the local MOCK gateway end-to-end over
// HTTP — initiate → mock gate → enter card → signed callback → result redirect.
// Proves the integration (redirect form, HashV3 signing/verification, callback
// settlement, result-page redirect) without real bank credentials.
//
// Prereq: backend running with the mock enabled, e.g.
//   $env:ISBANK_MOCK_GATEWAY="true"
//   $env:ISBANK_POS_GATE_URL="http://localhost:5000/mock/isbank/gate"
//   $env:ISBANK_POS_CALLBACK_BASE_URL="http://localhost:5000"
//   $env:ISBANK_POS_FRONTEND_URL="http://localhost:3000"
//   node server.js
// Then: node scripts/test-isbank-mock-flow.js

const BASE = process.env.MOCK_TEST_BASE || 'http://localhost:5000';

// Pull name/value pairs out of the mock's auto-submit form.
const parseHiddenInputs = (html) => {
  const fields = {};
  const re = /<input[^>]*name="([^"]*)"[^>]*value="([^"]*)"/g;
  let m;
  while ((m = re.exec(html))) {
    fields[m[1]] = m[2]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  }
  return fields;
};
const parseFormAction = (html) => (html.match(/<form[^>]*action="([^"]*)"/) || [])[1];

const form = (obj) => new URLSearchParams(obj).toString();

async function runOne(label, pan, expectStatus) {
  // 1) initiate
  const initRes = await fetch(`${BASE}/api/payments/isbank/initiate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount: 100, currency: 'TRY', notify: { hotelId: 1, guestEmail: 'demo@example.com' } }),
  });
  const init = await initRes.json();
  if (!init.fields || !init.gateUrl) throw new Error(`initiate failed: ${JSON.stringify(init)}`);

  // 2) post the signed fields to the mock gate (as the browser form would)
  const gateRes = await fetch(init.gateUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form(init.fields),
  });
  const gateHtml = await gateRes.text();
  if (!/MOCK GATEWAY/.test(gateHtml)) throw new Error('mock gate did not render card page');

  // 3) submit the card → mock returns a signed callback-post form
  const carry = parseHiddenInputs(gateHtml);
  const submitRes = await fetch(`${BASE}/mock/isbank/submit`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form({ ...carry, pan, exp: '12/30', cvv: '123' }),
  });
  const submitHtml = await submitRes.text();
  const callbackUrl = parseFormAction(submitHtml);
  const signed = parseHiddenInputs(submitHtml);

  // 4) post the signed response to our real callback (no auto-follow)
  const cbRes = await fetch(callbackUrl, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: form(signed), redirect: 'manual',
  });
  const location = cbRes.headers.get('location') || '';
  const ok = cbRes.status === 303 && location.includes(`status=${expectStatus}`);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: oid=${init.fields.oid} pan=${pan || '(blank)'} -> ${cbRes.status} ${location}`);
  return ok;
}

(async () => {
  let pass = 0, total = 0;
  const cases = [
    ['random card declines', '4111111111111111', 'failed'],
    ['blank card declines', '', 'failed'],
    ['approved test card', '4355084355084305', 'success'],
  ];
  for (const [label, pan, expect] of cases) {
    total += 1;
    try { if (await runOne(label, pan, expect)) pass += 1; }
    catch (e) { console.log(`FAIL  ${label}: ${e.message}`); }
  }
  console.log(`\n${pass}/${total} passed`);
  process.exit(pass === total ? 0 : 1);
})();
