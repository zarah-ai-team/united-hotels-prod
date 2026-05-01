// Welcome email + email-verification link.
// Triggered after a user successfully registers an account.

const { sendEmail } = require('./client');
const { renderEmail, heading, paragraph, button, muted, escapeHtml } = require('./layout');

const buildWelcomeHtml = ({ name, verifyUrl }) => {
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi there,';
  const body = `
    ${heading('Welcome to United Hotels')}
    ${paragraph(greeting)}
    ${paragraph(
      "Thanks for creating an account. You're one click away from booking your next stay across our partner properties in Istanbul and beyond."
    )}
    ${paragraph('Please confirm your email so we can secure your account:')}
    <p style="margin:0 0 24px 0;">${button('Verify my email', verifyUrl)}</p>
    ${muted(
      'If the button doesn&rsquo;t work, paste this link into your browser:'
    )}
    <p style="margin:0 0 16px 0;font-size:12px;line-height:1.5;color:#1abc9c;word-break:break-all;">
      <a href="${escapeHtml(verifyUrl)}" style="color:#1abc9c;text-decoration:none;">${escapeHtml(verifyUrl)}</a>
    </p>
    ${muted('This verification link expires in 24 hours.')}
  `;
  return renderEmail({
    title: 'Welcome',
    preview: 'Confirm your email to finish setting up your United Hotels account.',
    body,
  });
};

const buildWelcomeText = ({ name, verifyUrl }) =>
  [
    `Hi ${name || 'there'},`,
    '',
    'Thanks for creating a United Hotels account. Please confirm your email to finish setup:',
    '',
    verifyUrl,
    '',
    'This link expires in 24 hours. If you didn’t sign up, you can ignore this email.',
  ].join('\n');

const sendWelcomeEmail = async ({ to, name, verifyUrl }) => {
  return sendEmail({
    to,
    subject: 'Welcome to United Hotels — confirm your email',
    html: buildWelcomeHtml({ name, verifyUrl }),
    text: buildWelcomeText({ name, verifyUrl }),
  });
};

module.exports = { sendWelcomeEmail, buildWelcomeHtml };
