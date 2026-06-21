// utils/isbankPos.js
//
// İş Bankası Sanal POS integration (Payten / Asseco "NestPay / EST" platform).
//
// Model in use: 3D Pay Hosting + TranType=Auth.
//   - The cardholder enters their card on İş Bankası's OWN hosted page, so raw
//     PAN/CVV never touch this server (smallest PCI-DSS scope — SAQ A).
//   - We POST a signed form to the 3D gateway; the bank authenticates the card
//     (3-D Secure) AND captures the sale in one step, then POSTs the result
//     back to our okUrl / failUrl. There is NO separate server-to-server sale
//     call on the happy path (that is only needed for the plain "3d" model).
//
// Signing uses HashV3 ("ver3"), which the bank mandates: SHA-512 over every
// request parameter (sorted, escaped, pipe-joined) with the store key
// appended, Base64-encoded. The same scheme verifies the bank's callback.
//
// SECRETS: clientId / storeKey / API user+password come ONLY from env. Nothing
// sensitive is hardcoded here. See .env.example (ISBANK_POS_*).

const crypto = require('crypto');
const axios = require('axios');

// ISO 4217 numeric currency codes the gateway expects (it does not take "USD").
const CURRENCY_CODES = {
  TRY: '949',
  USD: '840',
  EUR: '978',
  GBP: '826',
};

// Sanitize an env value: trim surrounding whitespace and strip an accidental
// trailing inline comment (e.g. a line copied verbatim from .env.example like
// `ISBANK_POS_CLIENT_ID=700704600170   # Mağaza...`). Older dotenv versions do
// not strip inline comments, which would otherwise glue the comment onto the
// clientid/store key and silently break every hash. Only ` #` (whitespace then
// hash) is treated as a comment, so a `#` inside a real secret is preserved.
const clean = (value, fallback = '') => {
  if (value == null) return fallback;
  let s = String(value).trim();
  const commentAt = s.search(/\s+#/);
  if (commentAt !== -1) s = s.slice(0, commentAt).trim();
  return s || fallback;
};

const config = () => ({
  enabled: /^(1|true|yes)$/i.test(clean(process.env.ISBANK_POS_ENABLED)),
  clientId: clean(process.env.ISBANK_POS_CLIENT_ID),
  storeKey: clean(process.env.ISBANK_POS_STORE_KEY),
  apiUser: clean(process.env.ISBANK_POS_API_USER),
  apiPassword: clean(process.env.ISBANK_POS_API_PASSWORD),
  storeType: clean(process.env.ISBANK_POS_STORE_TYPE, '3d_pay_hosting'),
  gateUrl: clean(process.env.ISBANK_POS_GATE_URL, 'https://sanalpos.isbank.com.tr/fim/est3Dgate'),
  apiUrl: clean(process.env.ISBANK_POS_API_URL, 'https://sanalpos.isbank.com.tr/fim/api'),
  currency: clean(process.env.ISBANK_POS_CURRENCY, 'TRY').toUpperCase(),
  lang: clean(process.env.ISBANK_POS_LANG, 'tr'),
  // Public, HTTPS base the bank redirects back to (where /api/.../callback
  // lives). Falls back to the site URL.
  callbackBaseUrl: clean(
    process.env.ISBANK_POS_CALLBACK_BASE_URL ||
    process.env.SITE_BASE_URL ||
    process.env.FRONTEND_URL
  ).replace(/\/+$/, ''),
  // Origin that serves the SPA result page (/payment/result). In production
  // this is the same origin as the callback; locally the API (:5000) and the
  // frontend (:3000) differ, so this is split out. Falls back to callbackBaseUrl.
  frontendUrl: clean(
    process.env.ISBANK_POS_FRONTEND_URL ||
    process.env.FRONTEND_URL ||
    process.env.SITE_BASE_URL ||
    process.env.ISBANK_POS_CALLBACK_BASE_URL
  ).replace(/\/+$/, ''),
});

// Minimum needed to sign and post a 3D form. API user/password are only
// required for refund/void/status, checked separately in the API client.
const isConfigured = (cfg = config()) =>
  Boolean(cfg.enabled && cfg.clientId && cfg.storeKey && cfg.callbackBaseUrl);

const currencyCode = (currency, cfg = config()) =>
  CURRENCY_CODES[String(currency || cfg.currency).toUpperCase()] || CURRENCY_CODES.TRY;

// ── HashV3 ──────────────────────────────────────────────────────────────────
//
// Mirror NestPay's reference exactly:
//   1. Drop `hash` and `encoding` from the parameter set.
//   2. Sort the REMAINING parameter NAMES case-insensitively (Java
//      String.CASE_INSENSITIVE_ORDER — compare char-by-char, not by locale).
//   3. Escape each value: '\' -> '\\' then '|' -> '\|'.
//   4. Join escaped values with '|', then append '|' + escaped storeKey.
//   5. SHA-512 the UTF-8 bytes, Base64-encode the digest.

const escapeHashValue = (value) =>
  String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/\|/g, '\\|');

// Faithful port of java.lang.String.CASE_INSENSITIVE_ORDER so our sort order
// matches the bank's signer byte-for-byte (a locale-aware localeCompare would
// reorder some characters and break the hash).
const caseInsensitiveCompare = (a, b) => {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i += 1) {
    let c1 = a.charCodeAt(i);
    let c2 = b.charCodeAt(i);
    if (c1 !== c2) {
      c1 = String.fromCharCode(c1).toUpperCase().charCodeAt(0);
      c2 = String.fromCharCode(c2).toUpperCase().charCodeAt(0);
      if (c1 !== c2) {
        c1 = String.fromCharCode(c1).toLowerCase().charCodeAt(0);
        c2 = String.fromCharCode(c2).toLowerCase().charCodeAt(0);
        if (c1 !== c2) return c1 - c2;
      }
    }
  }
  return a.length - b.length;
};

const computeHashV3 = (params, storeKey) => {
  const names = Object.keys(params)
    .filter((name) => {
      const lower = name.toLowerCase();
      return lower !== 'hash' && lower !== 'encoding';
    })
    .sort(caseInsensitiveCompare);

  const plain =
    names.map((name) => escapeHashValue(params[name])).join('|') +
    '|' +
    escapeHashValue(storeKey);

  return crypto.createHash('sha512').update(plain, 'utf8').digest('base64');
};

// ── Outbound 3D form ─────────────────────────────────────────────────────────
//
// Build the signed field set the browser POSTs to the 3D gateway. For
// 3d_pay_hosting we deliberately do NOT include pan/expiry/cvv — the bank's
// hosted page collects those.
const buildPaymentFormFields = ({
  oid,
  amount,
  currency,
  okUrl,
  failUrl,
  email,
  billToName,
  cfg = config(),
}) => {
  const fields = {
    clientid: cfg.clientId,
    storetype: cfg.storeType,
    hashAlgorithm: 'ver3',
    TranType: 'Auth',
    oid: String(oid),
    amount: Number(amount).toFixed(2),
    currency: currencyCode(currency, cfg),
    okUrl,
    failUrl,
    rnd: crypto.randomBytes(16).toString('hex'),
    lang: cfg.lang,
  };

  if (email) fields.email = String(email);
  if (billToName) fields.BillToName = String(billToName);

  fields.hash = computeHashV3(fields, cfg.storeKey);
  // encoding is intentionally excluded from the hash (see computeHashV3).
  fields.encoding = 'UTF-8';
  return fields;
};

// Self-submitting HTML page that posts `fields` to the gateway. Returned so a
// non-JS / server-driven flow works; the JSON { gateUrl, fields } is also
// available for SPA-driven submission.
const renderAutoSubmitForm = (gateUrl, fields) => {
  const inputs = Object.entries(fields)
    .map(([name, value]) => {
      const safeName = String(name).replace(/"/g, '&quot;');
      const safeValue = String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      return `<input type="hidden" name="${safeName}" value="${safeValue}">`;
    })
    .join('\n    ');

  const safeGateUrl = String(gateUrl).replace(/"/g, '&quot;');
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Redirecting to secure payment…</title></head>
<body onload="document.forms[0].submit()">
  <noscript><p>Please click continue to proceed to the secure payment page.</p></noscript>
  <form method="POST" action="${safeGateUrl}" accept-charset="UTF-8">
    ${inputs}
    <noscript><button type="submit">Continue</button></noscript>
  </form>
</body></html>`;
};

// ── Callback verification ─────────────────────────────────────────────────────
//
// Recompute HashV3 over the returned params and compare to the bank's `hash`.
// timingSafeEqual avoids leaking the comparison via timing.
const verifyCallbackHash = (body, storeKey) => {
  const received = body.hash || body.HASH;
  if (!received) return false;

  const expected = computeHashV3(body, storeKey);
  const a = Buffer.from(String(received));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

// mdStatus 1 = full 3DS auth; 2/3/4 = half-secure / attempted (still
// acceptable per NestPay). The sale itself is approved when ProcReturnCode is
// '00' (equivalently Response === 'Approved').
const isCallbackApproved = (body) => {
  const mdStatus = String(body.mdStatus || '');
  const authedMdStatuses = ['1', '2', '3', '4'];
  const procOk = String(body.ProcReturnCode || '') === '00';
  const responseOk = String(body.Response || '').toLowerCase() === 'approved';
  return authedMdStatuses.includes(mdStatus) && (procOk || responseOk);
};

// ── Server-to-server API (refund / void / status) ─────────────────────────────
//
// Plain CC5Request XML to /fim/api. Responses are flat, so small targeted
// regex extraction avoids pulling in an XML parser dependency.
const buildCc5Xml = (fieldsObj) => {
  const esc = (v) =>
    String(v ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  const body = Object.entries(fieldsObj)
    .map(([k, v]) => `  <${k}>${esc(v)}</${k}>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<CC5Request>\n${body}\n</CC5Request>`;
};

const pickXml = (xml, tag) => {
  const m = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'i').exec(xml || '');
  return m ? m[1].trim() : '';
};

const sendApiRequest = async (extraFields, cfg = config()) => {
  if (!cfg.clientId || !cfg.apiUser || !cfg.apiPassword) {
    throw new Error('İş Bankası API credentials are not configured (ISBANK_POS_API_USER / ISBANK_POS_API_PASSWORD)');
  }

  const xml = buildCc5Xml({
    Name: cfg.apiUser,
    Password: cfg.apiPassword,
    ClientId: cfg.clientId,
    ...extraFields,
  });

  const response = await axios.post(cfg.apiUrl, `DATA=${encodeURIComponent(xml)}`, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 20000,
  });

  const data = typeof response.data === 'string' ? response.data : String(response.data);
  return {
    approved: pickXml(data, 'Response').toLowerCase() === 'approved' ||
      pickXml(data, 'ProcReturnCode') === '00',
    response: pickXml(data, 'Response'),
    procReturnCode: pickXml(data, 'ProcReturnCode'),
    errMsg: pickXml(data, 'ErrMsg') || pickXml(data, 'Extra.ERRORMSG'),
    transId: pickXml(data, 'TransId'),
    authCode: pickXml(data, 'AuthCode'),
    raw: data,
  };
};

// Full refund (no Amount) or partial refund (Amount set). Type=Credit.
const refund = (orderId, { amount, currency } = {}, cfg = config()) =>
  sendApiRequest(
    {
      Type: 'Credit',
      OrderId: String(orderId),
      ...(amount ? { Amount: Number(amount).toFixed(2), Currency: currencyCode(currency, cfg) } : {}),
    },
    cfg
  );

// Void — cancels a same-day transaction before settlement. Type=Void.
const voidTransaction = (orderId, cfg = config()) =>
  sendApiRequest({ Type: 'Void', OrderId: String(orderId) }, cfg);

// Order status inquiry. Type=Inquiry / StatusRequest.
const inquiry = (orderId, cfg = config()) =>
  sendApiRequest({ Type: 'Inquiry', OrderId: String(orderId) }, cfg);

module.exports = {
  config,
  isConfigured,
  currencyCode,
  computeHashV3,
  escapeHashValue,
  caseInsensitiveCompare,
  buildPaymentFormFields,
  renderAutoSubmitForm,
  verifyCallbackHash,
  isCallbackApproved,
  refund,
  voidTransaction,
  inquiry,
  CURRENCY_CODES,
};
