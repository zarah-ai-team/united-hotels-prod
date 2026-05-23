const {
  sendSupportInquiryEmail,
  sendSupportConfirmationEmail,
} = require('../utils/emails/supportInquiryEmail');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_MESSAGE_LEN = 5000;

const submitContact = async (req, res) => {
  try {
    const {
      name = '',
      email = '',
      subject = '',
      message = '',
      notifyByEmail = false,
    } = req.body || {};

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanSubject = String(subject).trim();
    const cleanMessage = String(message).trim();

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      return res.status(400).json({ message: 'Name, email, subject and message are required.' });
    }
    if (!EMAIL_RE.test(cleanEmail)) {
      return res.status(400).json({ message: 'Please provide a valid email address.' });
    }
    if (cleanMessage.length > MAX_MESSAGE_LEN) {
      return res.status(400).json({ message: `Message must be ${MAX_MESSAGE_LEN} characters or fewer.` });
    }

    const supportInbox = process.env.SUPPORT_INBOX || process.env.EMAIL_FROM || process.env.SMTP_USER;
    if (!supportInbox) {
      console.error('[support] no SUPPORT_INBOX / EMAIL_FROM / SMTP_USER configured — cannot forward request');
      return res.status(500).json({ message: 'Support inbox is not configured. Please try again later.' });
    }

    const inboxResult = await sendSupportInquiryEmail({
      to: supportInbox,
      name: cleanName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    });

    let confirmationResult = null;
    if (notifyByEmail) {
      confirmationResult = await sendSupportConfirmationEmail({
        to: cleanEmail,
        name: cleanName,
        subject: cleanSubject,
        message: cleanMessage,
      });
    }

    return res.status(200).json({
      message: 'Your message has been received.',
      notified: Boolean(notifyByEmail),
      inboxDeliveryId: inboxResult?.id || null,
      confirmationDeliveryId: confirmationResult?.id || null,
    });
  } catch (err) {
    console.error('[support] submitContact failed:', err);
    return res.status(500).json({ message: 'Could not deliver your message right now. Please try again.' });
  }
};

module.exports = { submitContact };
