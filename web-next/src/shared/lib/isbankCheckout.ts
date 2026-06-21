// İş Bankası 3D Pay Hosting redirect helper.
//
// The backend returns { gateUrl, fields } from /payments/isbank/initiate. The
// browser must POST those fields to the bank's gateway as a top-level form
// navigation so the bank can render its hosted card page. We build a hidden
// form and submit it — this navigates the whole tab to the bank.

export function postToIsbankGateway(gateUrl: string, fields: Record<string, string>): void {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = gateUrl;
  form.acceptCharset = 'UTF-8';
  form.style.display = 'none';

  Object.entries(fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value == null ? '' : String(value);
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

// Whether the UI should present the bank-hosted card experience (hide manual
// card fields / "payments unavailable" notice). Cosmetic only — the actual
// redirect is driven by the backend's `paymentRequired` flag, so a stale value
// here can't cause a wrong charge.
export const isbankUiEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_ISBANK_ENABLED === 'true';
