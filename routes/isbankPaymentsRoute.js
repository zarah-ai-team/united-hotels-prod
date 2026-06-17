const express = require('express');
const { authenticate, authenticateOptional } = require('../middleware/authMiddleware');
const { authorizeAdmin } = require('../middleware/rbacMiddleware');
const { initiatePayment, handleCallback, refundPayment } = require('../controllers/isbankPayments');

const router = express.Router();

// Start a payment. Guests can book, so auth is optional.
router.post('/initiate', authenticateOptional, initiatePayment);

// Bank-to-browser POST returns here. NO auth / NO CSRF: the request comes from
// the cardholder's browser after the bank's hosted page, and is authenticated
// instead by the HashV3 signature verified inside the handler. The bank uses
// distinct ok/fail URLs, but the signature — not the path — decides settlement.
router.post('/callback/ok', handleCallback);
router.post('/callback/fail', handleCallback);
// Some gateway configs issue a GET on return; accept it too.
router.get('/callback/ok', handleCallback);
router.get('/callback/fail', handleCallback);

// Server-to-server refund / void. Admin only.
router.post('/refund/:orderId', authenticate, authorizeAdmin, refundPayment);
router.post('/refund', authenticate, authorizeAdmin, refundPayment);

module.exports = router;
