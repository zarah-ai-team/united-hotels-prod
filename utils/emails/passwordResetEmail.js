// Password reset email.
// Triggered when a user submits the "Forgot password" form.

const { sendEmail } = require('./client');
const { renderEmail, heading, paragraph, button, muted, escapeHtml } = require('./layout');

const buildResetHtml = ({ name, resetUrl, expiresInMinutes = 30 }) => {
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi there,';
  const body = `
    ${heading('Reset your password')}
    ${paragraph(greeting)}
    ${paragraph(
      'We received a request to reset the password on your United Hotels account. Click the button below to choose a new one.'
    )}
    <p style="margin:0 0 24px 0;">${button('Reset password', resetUrl)}</p>
    ${muted(
      `This link expires in ${expiresInMinutes} minutes. If you didn&rsquo;t request a reset, you can safely ignore this email — your password won&rsquo;t change.`
    )}
    ${muted('If the button doesn&rsquo;t work, paste this URL into your browser:')}
    <p style="margin:0;font-size:12px;line-height:1.5;color:#1abc9c;word-break:break-all;">
      <a href="${escapeHtml(resetUrl)}" style="color:#1abc9c;text-decoration:none;">${escapeHtml(resetUrl)}</a>
    </p>
  `;
  return renderEmail({
    title: 'Password reset',
    preview: 'Reset the password on your United Hotels account.',
    body,
    footer:
      'If you didn&rsquo;t request a password reset, you can safely ignore this email. The link will expire on its own.',
  });
};

const buildResetText = ({ name, resetUrl, expiresInMinutes = 30 }) =>
  [
    `Hi ${name || 'there'},`,
    '',
    'We received a request to reset the password on your United Hotels account.',
    'Click the link below to choose a new password:',
    '',
    resetUrl,
    '',
    `This link expires in ${expiresInMinutes} minutes. If you didn’t request a reset, ignore this email.`,
  ].join('\n');

const sendPasswordResetEmail = async ({ to, name, resetUrl, expiresInMinutes }) => {
  return sendEmail({
    to,
    subject: 'Reset your United Hotels password',
    html: buildResetHtml({ name, resetUrl, expiresInMinutes }),
    text: buildResetText({ name, resetUrl, expiresInMinutes }),
  });
};

module.exports = { sendPasswordResetEmail, buildResetHtml };
