// routes/isbankMockGateway.js
//
// DEV-ONLY stand-in for the İş Bankası (NestPay) 3D Pay Hosting gateway. Lets
// you exercise the full payment flow locally without real bank credentials:
//
//   checkout → POST to this mock → enter a card → mock signs a response with the
//   SAME store key in .env → posts back to our real callback → booking settles →
//   /payment/result.
//
// Because the mock signs with cfg.storeKey and our callback verifies with the
// same key, signatures match — the placeholder key is fine here. The ONLY thing
// this does not prove is that the real bank accepts our request hash.
//
// Mounted by server.js ONLY when ISBANK_MOCK_GATEWAY=true. Never enable in prod.

const express = require('express');
const pos = require('../utils/isbankPos');

const router = express.Router();

// Cards that "approve". Anything else (a random card) is declined — which is
// exactly the failure path we want to demo.
const APPROVED_PANS = new Set(['4355084355084305', '4355 0843 5508 4305']);

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// Build a signed response field set and an auto-submitting form that POSTs it to
// the bank's okUrl/failUrl (our real callback), mirroring NestPay's behaviour.
const renderCallbackPost = (action, fields) => {
  const cfg = pos.config();
  const signed = { ...fields };
  signed.hash = pos.computeHashV3(signed, cfg.storeKey);
  const inputs = Object.entries(signed)
    .map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`)
    .join('\n    ');
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Returning…</title></head>
<body onload="document.forms[0].submit()">
  <p style="font:14px sans-serif">Returning to merchant…</p>
  <form method="POST" action="${esc(action)}" accept-charset="UTF-8">
    ${inputs}
    <noscript><button type="submit">Continue</button></noscript>
  </form>
</body></html>`;
};

// 1) Gate landing — the checkout's signed form lands here. Show a fake card page.
router.post('/gate', (req, res) => {
  const b = req.body || {};
  const carry = {
    oid: b.oid || '',
    amount: b.amount || '',
    currency: b.currency || '',
    clientid: b.clientid || '',
    okUrl: b.okUrl || '',
    failUrl: b.failUrl || '',
  };
  const hidden = Object.entries(carry)
    .map(([k, v]) => `<input type="hidden" name="${esc(k)}" value="${esc(v)}">`)
    .join('\n      ');

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>MOCK İş Bankası — 3D Secure</title>
<style>
  body{font:15px/1.5 -apple-system,Segoe UI,sans-serif;background:#eef2f7;margin:0;padding:32px;color:#1f2937}
  .card{max-width:420px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;box-shadow:0 8px 40px rgba(0,0,0,.08)}
  .banner{background:#fde68a;color:#92400e;font-size:12px;font-weight:600;padding:8px 12px;border-radius:8px;margin-bottom:20px;text-align:center}
  h1{font-size:18px;margin:0 0 4px}.sub{color:#6b7280;font-size:13px;margin:0 0 20px}
  label{display:block;font-size:12px;font-weight:600;margin:14px 0 4px}
  input[type=text]{width:100%;box-sizing:border-box;padding:11px 12px;border:1px solid #d1d5db;border-radius:9px;font-size:15px}
  .row{display:flex;gap:12px}.row>div{flex:1}
  button{width:100%;margin-top:22px;padding:13px;border:0;border-radius:10px;background:#2F80ED;color:#fff;font-size:15px;font-weight:600;cursor:pointer}
  .amt{font-size:22px;font-weight:700;margin:0 0 2px}
  .hint{margin-top:16px;font-size:11.5px;color:#9ca3af;text-align:center}
</style></head>
<body>
  <div class="card">
    <div class="banner">⚠ MOCK GATEWAY — not the real bank. Test only.</div>
    <p class="amt">${esc(carry.amount)} ${esc(carry.currency)}</p>
    <p class="sub">Order ${esc(carry.oid)}</p>
    <h1>Enter your card</h1>
    <p class="sub">Any random card number → payment is declined.</p>
    <form method="POST" action="/mock/isbank/submit">
      ${hidden}
      <label>Card number</label>
      <input type="text" name="pan" inputmode="numeric" autocomplete="off" placeholder="1234 5678 9012 3456" value="">
      <div class="row">
        <div><label>Expiry</label><input type="text" name="exp" placeholder="MM/YY"></div>
        <div><label>CVV</label><input type="text" name="cvv" placeholder="123"></div>
      </div>
      <button type="submit">Pay</button>
    </form>
    <p class="hint">Approved test card: 4355&nbsp;0843&nbsp;5508&nbsp;4305 · anything else declines.</p>
  </div>
</body></html>`);
});

// 2) Submit — decide approve/decline, sign a response, post it to our callback.
router.post('/submit', (req, res) => {
  const b = req.body || {};
  const pan = String(b.pan || '').trim();
  const approved = APPROVED_PANS.has(pan) || APPROVED_PANS.has(pan.replace(/\s+/g, ''));

  const base = {
    clientid: b.clientid || '',
    oid: b.oid || '',
    amount: b.amount || '',
    currency: b.currency || '',
  };

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (approved) {
    res.send(
      renderCallbackPost(b.okUrl, {
        ...base,
        Response: 'Approved',
        ProcReturnCode: '00',
        mdStatus: '1',
        AuthCode: '987654',
        HostRefNum: 'MOCK0000001',
        TransId: `MOCK${base.oid}`,
        ErrMsg: '',
      })
    );
  } else {
    res.send(
      renderCallbackPost(b.failUrl, {
        ...base,
        Response: 'Declined',
        ProcReturnCode: '05',
        mdStatus: '1',
        AuthCode: '',
        HostRefNum: '',
        TransId: '',
        ErrMsg: 'Card declined (mock): not an approved test card',
      })
    );
  }
});

module.exports = router;
