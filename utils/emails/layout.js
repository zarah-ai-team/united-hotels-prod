// Shared email layout — minimal, table-based, inline-styled. Email clients
// strip <head>, <style>, classes, and modern CSS, so every visible style has
// to live on the element. Keep this dumb on purpose.

const BRAND_TEAL = '#1abc9c';
const BRAND_DARK = '#1f2937';
const TEXT_MUTED = '#6b7280';
const BORDER = '#e5e7eb';
const BG_PAGE = '#f5f7fa';

const escapeHtml = (input) =>
  String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * @param {{title: string, preview?: string, body: string, footer?: string}} params
 * @returns {string} full HTML document
 */
const renderEmail = ({ title, preview, body, footer }) => {
  const previewLine = preview
    ? `<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${BG_PAGE};opacity:0;">${escapeHtml(preview)}</div>`
    : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${BG_PAGE};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND_DARK};">
  ${previewLine}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG_PAGE};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;border:1px solid ${BORDER};overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND_TEAL} 0%, #16a085 100%);padding:24px 32px;">
              <p style="margin:0;color:#ffffff;font-size:18px;font-weight:600;letter-spacing:0.02em;">United Hotels</p>
              <p style="margin:2px 0 0 0;color:rgba(255,255,255,0.78);font-size:12px;letter-spacing:0.12em;text-transform:uppercase;">${escapeHtml(title)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#fafbfc;border-top:1px solid ${BORDER};color:${TEXT_MUTED};font-size:12px;line-height:1.6;">
              ${footer || 'You&rsquo;re receiving this email because of activity on your United Hotels account. If this wasn&rsquo;t you, please ignore this message.'}
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0 0;font-size:11px;color:${TEXT_MUTED};">&copy; ${new Date().getFullYear()} United Hotels. All rights reserved.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

const button = (label, url) =>
  `<a href="${escapeHtml(url)}" style="display:inline-block;background:${BRAND_TEAL};color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;padding:12px 24px;border-radius:10px;letter-spacing:0.01em;">${escapeHtml(label)}</a>`;

const paragraph = (text) =>
  `<p style="margin:0 0 16px 0;font-size:15px;line-height:1.6;color:${BRAND_DARK};">${text}</p>`;

const muted = (text) =>
  `<p style="margin:0 0 8px 0;font-size:13px;line-height:1.6;color:${TEXT_MUTED};">${text}</p>`;

const heading = (text) =>
  `<h1 style="margin:0 0 16px 0;font-size:22px;line-height:1.3;color:${BRAND_DARK};font-weight:600;">${escapeHtml(text)}</h1>`;

module.exports = {
  renderEmail,
  button,
  paragraph,
  muted,
  heading,
  escapeHtml,
};
