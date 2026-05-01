const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendMail = require('../utils/mailer');
const { sendWelcomeEmail } = require('../utils/emails/welcomeEmail');
const { sendPasswordResetEmail } = require('../utils/emails/passwordResetEmail');

const FRONTEND_URL = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/+$/, '');

const buildVerifyEmailUrl = (token) => `${FRONTEND_URL()}/auth/verify?token=${encodeURIComponent(token)}`;
const buildResetPasswordUrl = (token) => `${FRONTEND_URL()}/auth/reset?token=${encodeURIComponent(token)}`;

const issueVerificationToken = (userId, email) =>
  jwt.sign(
    { userId, email, purpose: 'verify_email' },
    process.env.JWT_SECRET || 'replace-me-with-secure-secret',
    { expiresIn: '24h' }
  );

const issuePasswordResetToken = (userId, email) =>
  jwt.sign(
    { userId, email, purpose: 'reset_password' },
    process.env.JWT_SECRET || 'replace-me-with-secure-secret',
    { expiresIn: '30m' }
  );

let userMetaCache = null;
const otpStore = new Map();
const OTP_TTL_MS = 10 * 60 * 1000;

const pickColumn = (set, names) => names.find((n) => set.has(n)) || null;

const getUserMeta = async () => {
  if (userMetaCache) return userMetaCache;

  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`
  );
  const cols = new Set(result.rows.map((r) => r.column_name));

  userMetaCache = {
    phoneCol: pickColumn(cols, ['phoneNumber', 'phonenumber', 'phone_number']),
    isAdminCol: pickColumn(cols, ['isAdmin', 'isadmin', 'is_admin']),
    isManagerCol: pickColumn(cols, ['isManager', 'ismanager', 'is_manager']),
    verifiedAtCol: pickColumn(cols, ['verified_at', 'verifiedAt', 'email_verified_at']),
    createdCol: pickColumn(cols, ['createdAt', 'created_at']),
    updatedCol: pickColumn(cols, ['updatedAt', 'updated_at'])
  };

  return userMetaCache;
};

const quoteCol = (col) => `"${col}"`;

const mapUser = (row, meta) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phoneNumber: meta.phoneCol ? row[meta.phoneCol] : null,
  isAdmin: meta.isAdminCol ? Boolean(row[meta.isAdminCol]) : false,
  isManager: meta.isManagerCol ? Boolean(row[meta.isManagerCol]) : false,
  emailVerified: meta.verifiedAtCol ? Boolean(row[meta.verifiedAtCol]) : false,
  verifiedAt: meta.verifiedAtCol ? row[meta.verifiedAtCol] || null : null,
  createdAt: meta.createdCol ? row[meta.createdCol] : null,
  updatedAt: meta.updatedCol ? row[meta.updatedCol] : null
});

const generateToken = (userId, isAdmin, isManager) => {
  const secret = process.env.JWT_SECRET || 'replace-me-with-secure-secret';
  return jwt.sign({ userId, isAdmin, isManager }, secret, { expiresIn: '7d' });
};

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sendRegisterOtp = async (req, res) => {
  const { email, name } = req.body || {};
  if (!email || !String(email).includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  try {
    const otp = generateOtp();
    otpStore.set(String(email).toLowerCase(), {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0
    });

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
        <h2 style="margin-bottom: 8px;">Welcome to United Hotels</h2>
        <p>Hello ${name ? String(name) : 'Guest'},</p>
        <p>Your verification code is:</p>
        <div style="font-size: 28px; font-weight: 700; letter-spacing: 4px; color: #1abc9c; margin: 12px 0;">${otp}</div>
        <p>This code expires in 10 minutes.</p>
      </div>
    `;

    await sendMail(email, html, 'Your United Hotels verification code');
    return res.json({ message: 'OTP sent successfully' });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const verifyRegisterOtp = async (req, res) => {
  const { email, otp } = req.body || {};
  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP are required' });
  }

  const key = String(email).toLowerCase();
  const record = otpStore.get(key);
  if (!record) {
    return res.status(400).json({ error: 'OTP not found. Please request a new one.' });
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return res.status(400).json({ error: 'OTP expired. Please request a new one.' });
  }

  if (String(record.otp) !== String(otp)) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      otpStore.delete(key);
      return res.status(400).json({ error: 'Too many invalid attempts. Request a new OTP.' });
    }
    otpStore.set(key, record);
    return res.status(400).json({ error: 'Invalid OTP' });
  }

  otpStore.delete(key);
  const secret = process.env.JWT_SECRET || 'replace-me-with-secure-secret';
  const otpVerifiedToken = jwt.sign(
    { email: key, purpose: 'register_otp' },
    secret,
    { expiresIn: '15m' }
  );

  return res.json({ message: 'OTP verified', otpVerifiedToken });
};

const registerUser = async (req, res) => {
  const { name, email, password, phoneNumber, isAdmin = false, isManager = false, otpVerifiedToken } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const requireOtp = String(process.env.REQUIRE_EMAIL_OTP || 'false').toLowerCase() !== 'false';
  if (requireOtp) {
    if (!otpVerifiedToken) {
      return res.status(400).json({ error: 'OTP verification is required before registration' });
    }

    try {
      const secret = process.env.JWT_SECRET || 'replace-me-with-secure-secret';
      const decoded = jwt.verify(otpVerifiedToken, secret);
      if (decoded.purpose !== 'register_otp' || String(decoded.email || '').toLowerCase() !== String(email).toLowerCase()) {
        return res.status(401).json({ error: 'Invalid OTP verification token' });
      }
    } catch (_e) {
      return res.status(401).json({ error: 'OTP verification token expired or invalid' });
    }
  }

  try {
    const meta = await getUserMeta();
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rowCount > 0) {
      // Already-registered email. If the user never finished email
      // verification, treat the second register attempt as a "resend
      // verification" — better UX than 409, and prevents account lockout
      // when the original welcome email gets lost in the spam folder.
      const existingRow = existingUser.rows[0];
      const existingUserMapped = mapUser(existingRow, meta);
      if (!existingUserMapped.emailVerified) {
        const verifyToken = issueVerificationToken(existingUserMapped.id, existingUserMapped.email);
        sendWelcomeEmail({
          to: existingUserMapped.email,
          name: existingUserMapped.name,
          verifyUrl: buildVerifyEmailUrl(verifyToken),
        }).catch((err) => console.error('[auth] welcome resend failed:', err));

        return res.status(200).json({
          message: 'This email is already registered but not yet verified. We&rsquo;ve resent the verification link — please check your inbox.',
          resent: true,
          user: existingUserMapped,
        });
      }
      return res.status(409).json({ error: 'Email already registered. Please sign in or use Forgot password.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let phone = null;
    if (phoneNumber) {
      const cleanPhone = String(phoneNumber).replace(/\D/g, '');
      phone = cleanPhone || null;
    }

    const columns = ['name', 'email', 'password'];
    const values = [name, email, hashedPassword];

    if (meta.phoneCol) {
      columns.push(quoteCol(meta.phoneCol));
      values.push(phone);
    }
    if (meta.isAdminCol) {
      columns.push(quoteCol(meta.isAdminCol));
      values.push(Boolean(isAdmin));
    }
    if (meta.isManagerCol) {
      columns.push(quoteCol(meta.isManagerCol));
      values.push(Boolean(isManager));
    }
    if (meta.createdCol) {
      columns.push(quoteCol(meta.createdCol));
      values.push(new Date().toISOString());
    }
    if (meta.updatedCol) {
      columns.push(quoteCol(meta.updatedCol));
      values.push(new Date().toISOString());
    }

    const placeholders = values.map((_, idx) => `$${idx + 1}`);
    const insertResult = await pool.query(
      `INSERT INTO users (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING id`
    , values);

    const id = insertResult.rows[0].id;
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = mapUser(userResult.rows[0], meta);
    const token = generateToken(user.id, user.isAdmin, user.isManager);

    // Welcome email with verification link — fire-and-forget so a flaky
    // email provider can't block account creation. The send() helper
    // already swallows errors and logs them.
    const verifyToken = issueVerificationToken(user.id, user.email);
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      verifyUrl: buildVerifyEmailUrl(verifyToken),
    }).catch((err) => console.error('[auth] welcome email failed:', err));

    return res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user,
      token,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const verifyEmail = async (req, res) => {
  const token = req.query.token || req.body?.token;
  if (!token) return res.status(400).json({ error: 'Verification token is required' });

  try {
    const secret = process.env.JWT_SECRET || 'replace-me-with-secure-secret';
    const decoded = jwt.verify(token, secret);
    if (decoded.purpose !== 'verify_email') {
      return res.status(401).json({ error: 'Invalid verification token' });
    }

    const meta = await getUserMeta();
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    if (!userResult.rowCount) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Persist verification idempotently. If the column doesn't exist (older
    // schema), skip silently — link click still counts as a confirmation.
    if (meta.verifiedAtCol) {
      const alreadyVerified = Boolean(userResult.rows[0][meta.verifiedAtCol]);
      if (!alreadyVerified) {
        await pool.query(
          `UPDATE users SET ${quoteCol(meta.verifiedAtCol)} = $1 WHERE id = $2`,
          [new Date().toISOString(), decoded.userId]
        );
      }
    }

    const refreshed = await pool.query('SELECT * FROM users WHERE id = $1', [decoded.userId]);
    return res.json({
      message: 'Email verified successfully',
      user: mapUser(refreshed.rows[0], meta),
    });
  } catch (err) {
    return res.status(401).json({ error: 'Verification link is invalid or has expired' });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'Email is required' });

  // We always respond with the same generic success message, even when the
  // email isn't on file — prevents enumerating registered accounts.
  const genericResponse = {
    message: 'If that email is registered, a password reset link has been sent.',
  };

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const row = userResult.rows[0];
    if (!row) return res.json(genericResponse);

    const meta = await getUserMeta();
    const user = mapUser(row, meta);
    const resetToken = issuePasswordResetToken(user.id, user.email);

    sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl: buildResetPasswordUrl(resetToken),
      expiresInMinutes: 30,
    }).catch((err) => console.error('[auth] reset email failed:', err));

    return res.json(genericResponse);
  } catch (error) {
    console.error('[auth] forgotPassword error:', error);
    return res.json(genericResponse);
  }
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body || {};
  if (!token || !password) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'replace-me-with-secure-secret';
    const decoded = jwt.verify(token, secret);
    if (decoded.purpose !== 'reset_password') {
      return res.status(401).json({ error: 'Invalid reset token' });
    }

    const userResult = await pool.query('SELECT id FROM users WHERE id = $1', [decoded.userId]);
    if (!userResult.rowCount) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, decoded.userId]);

    return res.json({ message: 'Password reset successfully. You can now sign in with your new password.' });
  } catch (err) {
    return res.status(401).json({ error: 'Reset link is invalid or has expired' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const meta = await getUserMeta();
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const row = userResult.rows[0];

    if (!row) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, row.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = mapUser(row, meta);
    const token = generateToken(user.id, user.isAdmin, user.isManager);

    return res.json({
      message: 'Login successful',
      user,
      token
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const meta = await getUserMeta();
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user: mapUser(userResult.rows[0], meta) });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  sendRegisterOtp,
  verifyRegisterOtp,
  verifyEmail,
  forgotPassword,
  resetPassword,
};
