const pool = require('../db');

let paymentsTableChecked = false;
let paymentsColumnsCache = null;

const getPaymentsColumns = async () => {
  if (paymentsColumnsCache) {
    return paymentsColumnsCache;
  }

  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'payments'`
  );
  const cols = new Set(result.rows.map((row) => row.column_name));
  paymentsColumnsCache = cols;
  return cols;
};

const normalizePaymentRecord = (row) => ({
  ...row,
  transactionId: row.transaction_id,
  paymentMode: row.payment_mode || row.method
});

const ensurePaymentsTable = async () => {
  if (paymentsTableChecked) {
    return;
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
      amount NUMERIC(10,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      method TEXT NOT NULL DEFAULT 'card',
      payment_mode TEXT DEFAULT 'card',
      transaction_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'created',
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS payment_mode TEXT DEFAULT 'card';
  `);

  paymentsTableChecked = true;
};

const createPayment = async (req, res) => {
  try {
    const { bookingId, amount, currency = 'USD', paymentMode, method = 'card', transactionId, metadata = {} } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'amount is required and must be greater than 0' });
    }

    await ensurePaymentsTable();
    const paymentColumns = await getPaymentsColumns();

    const finalTransactionId = transactionId || `PAY-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const finalPaymentMode = paymentMode || method || 'card';

    const columns = ['user_id', 'booking_id', 'amount', 'currency', 'transaction_id', 'status', 'metadata'];
    const values = [
      req.user.id,
      bookingId || null,
      Number(amount),
      String(currency).toUpperCase(),
      finalTransactionId,
      'created',
      metadata && typeof metadata === 'object' ? metadata : {}
    ];

    if (paymentColumns.has('method')) {
      columns.push('method');
      values.push(finalPaymentMode);
    }

    if (paymentColumns.has('payment_mode')) {
      columns.push('payment_mode');
      values.push(finalPaymentMode);
    }

    const placeholders = values.map((_, index) => `$${index + 1}`);
    const result = await pool.query(
      `INSERT INTO payments (${columns.join(', ')}, created_at, updated_at)
       VALUES (${placeholders.join(', ')}, NOW(), NOW())
       RETURNING *`
    , values);

    return res.status(201).json({
      message: 'Payment created successfully',
      payment: normalizePaymentRecord(result.rows[0])
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getPayments = async (req, res) => {
  try {
    await ensurePaymentsTable();

    let query = 'SELECT * FROM payments';
    let params = [];

    if (!req.user?.isAdmin) {
      query += ' WHERE user_id = $1';
      params = [req.user.id];
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);

    return res.json({
      payments: result.rows.map(normalizePaymentRecord),
      count: result.rowCount
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getPaymentById = async (req, res) => {
  try {
    await ensurePaymentsTable();

    const { id } = req.params;
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = result.rows[0];
    if (!req.user?.isAdmin && payment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You are not allowed to access this payment' });
    }

    return res.json({ payment: normalizePaymentRecord(payment) });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = { createPayment, getPayments, getPaymentById };
