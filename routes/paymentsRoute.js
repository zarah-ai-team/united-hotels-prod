const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { createPayment, getPayments, getPaymentById } = require('../controllers/payments');

const router = express.Router();

// User payment endpoint
router.post('/create', authenticate, createPayment);
router.get('/', authenticate, getPayments);
router.get('/:id', authenticate, getPaymentById);

module.exports = router;
