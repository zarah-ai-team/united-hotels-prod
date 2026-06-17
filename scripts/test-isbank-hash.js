// Quick self-test for the İş Bankası HashV3 helpers. Run: node scripts/test-isbank-hash.js
// Not part of the app; validates the signer/verifier independently.
const crypto = require('crypto');
const pos = require('../utils/isbankPos');

let pass = 0;
let fail = 0;
const check = (name, cond) => {
  if (cond) { pass += 1; console.log('  ok  -', name); }
  else { fail += 1; console.log('  FAIL-', name); }
};

const storeKey = 'TESTKEY123';
const params = {
  clientid: 'TEST000000000', oid: 'UH-B5-1', amount: '100.00', currency: '949',
  okUrl: 'https://x/ok', failUrl: 'https://x/fail', rnd: 'abc',
  storetype: '3d_pay_hosting', TranType: 'Auth', hashAlgorithm: 'ver3', lang: 'tr',
};

// 1) Independent reference computation of HashV3.
const esc = (v) => String(v).replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
const names = Object.keys(params)
  .filter((n) => !['hash', 'encoding'].includes(n.toLowerCase()))
  .sort((a, b) => { const A = a.toLowerCase(), B = b.toLowerCase(); return A < B ? -1 : A > B ? 1 : 0; });
const plain = names.map((n) => esc(params[n])).join('|') + '|' + esc(storeKey);
const ref = crypto.createHash('sha512').update(plain, 'utf8').digest('base64');
check('HashV3 matches independent reference', ref === pos.computeHashV3(params, storeKey));

// 2) Escaping of | and \ is deterministic.
const tricky = { a: 'va|lue', b: 'back\\slash', c: 'plain' };
check('escaped values hash deterministically', pos.computeHashV3(tricky, storeKey) === pos.computeHashV3(tricky, storeKey));

// 3) Callback round-trip.
const resp = { clientid: 'TEST000000000', oid: 'UH-B5-1', Response: 'Approved', ProcReturnCode: '00', mdStatus: '1', amount: '100.00', AuthCode: '123456' };
resp.hash = pos.computeHashV3(resp, storeKey);
check('callback verifies with correct key', pos.verifyCallbackHash(resp, storeKey) === true);
check('callback rejects wrong key', pos.verifyCallbackHash(resp, 'WRONG') === false);
check('callback rejects missing hash', pos.verifyCallbackHash({ oid: 'x' }, storeKey) === false);
check('approved when mdStatus=1 & ProcReturnCode=00', pos.isCallbackApproved(resp) === true);
check('declined when mdStatus=0', pos.isCallbackApproved({ ...resp, mdStatus: '0' }) === false);

// 4) Form building for 3d_pay_hosting.
const cfg = { ...pos.config(), clientId: 'TEST000000000', storeKey, storeType: '3d_pay_hosting', lang: 'en' };
const fields = pos.buildPaymentFormFields({ oid: 'UH-B5-1', amount: 49.9, currency: 'USD', okUrl: 'https://x/ok', failUrl: 'https://x/fail', cfg });
check('currency USD maps to 840', fields.currency === '840');
check('amount formatted to 49.90', fields.amount === '49.90');
check('hosted flow omits pan', !('pan' in fields));
check('hosted flow omits cv2', !('cv2' in fields));
check('built form self-verifies', pos.verifyCallbackHash(fields, storeKey) === true);
check('hashAlgorithm is ver3', fields.hashAlgorithm === 'ver3');
check('TranType is Auth', fields.TranType === 'Auth');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
