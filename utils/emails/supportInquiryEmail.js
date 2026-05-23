// Support / contact-form emails.
// Two templates:
//   - sendSupportInquiryEmail:    notification to the internal support inbox
//   - sendSupportConfirmationEmail: opt-in confirmation back to the requester

const { sendEmail } = require('./client');
const { renderEmail, heading, paragraph, muted, escapeHtml } = require('./layout');

const SUBJECT_LABELS = {
  booking: 'Booking Inquiry',
  modification: 'Modify/Cancel Booking',
  payment: 'Payment Issue',
  hotel: 'Hotel Question',
  feedback: 'Feedback',
  other: 'Other',
};

const subjectLabel = (key) => SUBJECT_LABELS[key] || key || 'General Inquiry';

const buildInquiryHtml = ({ name, email, subject, message }) => {
  const body = `
    ${heading('New support request')}
    ${paragraph(`<strong>From:</strong> ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;`)}
    ${paragraph(`<strong>Topic:</strong> ${escapeHtml(subjectLabel(subject))}`)}
    ${paragraph('<strong>Message:</strong>')}
    <div style="margin:0 0 16px 0;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;line-height:1.6;color:#1f2937;white-space:pre-wrap;">${escapeHtml(message)}</div>
    ${muted(`Reply directly to ${escapeHtml(email)} to respond.`)}
  `;
  return renderEmail({
    title: 'Support inbox',
    preview: `New ${subjectLabel(subject)} from ${name}`,
    body,
  });
};

const buildConfirmationHtml = ({ name, subject, message }) => {
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hi there,';
  const body = `
    ${heading('We received your message')}
    ${paragraph(greeting)}
    ${paragraph(
      "Thanks for reaching out to United Hotels. Our team typically responds within 24 hours. For urgent matters, message us on WhatsApp at +90 555 123 4567."
    )}
    ${paragraph('<strong>Your message:</strong>')}
    ${paragraph(`<strong>Topic:</strong> ${escapeHtml(subjectLabel(subject))}`)}
    <div style="margin:0 0 16px 0;padding:16px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;font-size:14px;line-height:1.6;color:#1f2937;white-space:pre-wrap;">${escapeHtml(message)}</div>
    ${muted("You're receiving this because you opted in to a confirmation when contacting our support team.")}
  `;
  return renderEmail({
    title: 'Confirmation',
    preview: "We've received your message — here's a copy for your records.",
    body,
  });
};

const sendSupportInquiryEmail = async ({ to, name, email, subject, message }) =>
  sendEmail({
    type: 'support_inquiry',
    to,
    subject: `[Support] ${subjectLabel(subject)} — ${name}`,
    html: buildInquiryHtml({ name, email, subject, message }),
    text: `From: ${name} <${email}>\nTopic: ${subjectLabel(subject)}\n\n${message}`,
  });

const sendSupportConfirmationEmail = async ({ to, name, subject, message }) =>
  sendEmail({
    type: 'support_confirmation',
    to,
    subject: "We've received your message — United Hotels",
    html: buildConfirmationHtml({ name, subject, message }),
    text: `Hi ${name || 'there'},\n\nThanks for reaching out. Our team will respond within 24 hours.\n\nTopic: ${subjectLabel(subject)}\n\nYour message:\n${message}`,
  });

module.exports = {
  sendSupportInquiryEmail,
  sendSupportConfirmationEmail,
};
