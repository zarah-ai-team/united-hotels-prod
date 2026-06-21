# Production go-live: payment credentials + email activation

Two external things gate go-live — neither is code, both are account/DNS work you
do once. This doc is the checklist.

---

## 1. İş Bankası — production payment credentials

### What you have vs. what's missing
| Have | Missing |
|---|---|
| Merchant / store number — `clientid 700704600170` ✅ | The real **3D Store Key** ❌ |
| A reporting-dashboard login ✅ | The real **API user + password** ❌ |

The `ISBANK_POS_STORE_KEY` currently in `.env` (`Unit3dHotels._2026`) and the API
user/password (`unitedhotels_api` / `UnitedHotels._2026`) are **placeholders you
invented** — the bank does not know them, so it rejects the payment hash. Card
payments stay broken until these are the **real values from İş Bankası's panel**.

### How to get them
1. **Get management-panel access.** Log into **https://sanalpos.isbank.com.tr**
   for merchant `700704600170`. If your current login only opens *reporting*
   screens, request **management / API access** from İş Bankası or Payten
   (`destek@payten.com`) — quote the merchant number.
2. **Store Key (3D hash key / *işyeri güvenlik anahtarı*).** In the panel, open
   the merchant's **3D Secure / security settings**. On NestPay you typically
   **set this value yourself in the panel** — set a strong secret there, then put
   the *exact same* string in `ISBANK_POS_STORE_KEY`. Both sides must match
   byte-for-byte.
3. **API role user + password.** In the panel create an **API role user** (for
   refund / void / status calls) → put into `ISBANK_POS_API_USER` /
   `ISBANK_POS_API_PASSWORD`.
4. Confirm `clientid 700704600170` is the **API client id** (same as the store
   number on most İş Bankası merchants — Payten can confirm).

### Test first (optional but recommended)
Ask Payten for the **TEST environment**: a test clientid + test store key + their
**test card list**. Point `ISBANK_POS_GATE_URL`/`_API_URL` at the asseco test gate
(`https://entegrasyon.asseco-see.com.tr/fim/est3Dgate`), run a test charge, then
switch back to the production URLs with the real production store key.

### How you'll know it works
- On boot the server prints **no** `[payments] PROD WARNING ...` (the readiness
  guard flags a placeholder store key / non-prod gate URL / localhost callback).
- A real card on the checkout reaches `sanalpos.isbank.com.tr`'s 3-D page and
  returns to `/payment/result?status=success`.

---

## 2. Email activation (Resend)

Email triggers are all wired (registration, booking success → guest + vendor +
admin, cancellation, group request + acknowledgement, support, password reset).
They just need a live sender. **You already have a Resend API key** — it's
commented out in `.env`.

### Steps
1. **Verify the sending domain in Resend.** Go to https://resend.com/domains, add
   `bookunitedhotels.com`, and add the **SPF, DKIM, and DMARC** DNS records Resend
   shows to your DNS provider. Wait until the domain status reads **"Verified"**
   (DNS can take minutes to a few hours).
2. **Enable the key in `.env`** — uncomment these two lines:
   ```
   RESEND_API_KEY=re_UbiL1ESu_JwBNQNcABeXc1S5RYcCHpq7w
   EMAIL_FROM=United Hotels <noreply@bookunitedhotels.com>
   ```
   (The `EMAIL_FROM` address must be on the verified domain.)
3. **Set the inbox addresses** so internal notifications land somewhere real:
   `SUPPORT_INBOX`, `BOOKING_OPS_INBOX`, `GROUPS_INBOX`.
4. **`NODE_ENV=production`** — important: in production the mailer fails loudly if
   Resend is misconfigured instead of silently falling back to the Ethereal test
   inbox (which is what masks delivery problems in dev).
5. Restart the backend and test: register an account → you get a welcome email;
   make a booking → guest + vendor + admin emails; cancel → cancellation emails.

> The Gmail SMTP block (`SMTP_USER`/`SMTP_PASS`) is only a fallback used when
> `RESEND_API_KEY` is unset, and its current password is a placeholder. Once
> Resend is verified, SMTP is unused — you can ignore it.

---

## 3. Other go-live env (do not skip)
- **`JWT_SECRET`** — the dev value (`local-dev-secret-change-me`) is **insecure**;
  anyone who knows it can forge admin tokens. On the droplet use a strong unique
  secret: `openssl rand -hex 48`. (If the droplet already has a strong one, keep it.)
- **`FRONTEND_URL=https://bookunitedhotels.com`** (not localhost).
- **`ISBANK_POS_CALLBACK_BASE_URL=https://bookunitedhotels.com`** (already set).
- **Never set `ISBANK_MOCK_GATEWAY` in production** — it's local-test only and is
  hard-disabled when `NODE_ENV=production`.

---

## 4. Go-live checklist
- [ ] Real `ISBANK_POS_STORE_KEY` + API user/password from the bank panel
- [ ] (Optional) Verified one test charge on the İş Bankası test environment
- [ ] Resend domain `bookunitedhotels.com` shows **Verified**
- [ ] `RESEND_API_KEY` + `EMAIL_FROM` uncommented; `SUPPORT_INBOX` / `BOOKING_OPS_INBOX` / `GROUPS_INBOX` set
- [ ] `NODE_ENV=production`, strong `JWT_SECRET`, `FRONTEND_URL` = the live domain
- [ ] Deploy (see `deploy/DEPLOY_NEXT.md`); backend logs show no `[payments] PROD WARNING`
- [ ] Real test booking end-to-end: pay → confirmation page → emails arrive
