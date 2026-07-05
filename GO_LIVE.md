# Go‑live checklist — bookunitedhotels.com (payments + email)

Everything in the code is built and verified. What's left is **account / DNS
work** you do once, then deploy. Do the steps in order.

Companion docs: [`PRODUCTION_SETUP.md`](PRODUCTION_SETUP.md) (creds detail) ·
[`deploy/DEPLOY_PAYMENTS.md`](deploy/DEPLOY_PAYMENTS.md) (deploy commands).

---

## Step 1 — Add DNS records (email deliverability via Resend)

Email won't send until the domain `bookunitedhotels.com` is **Verified** in Resend.
Verification = adding the DNS records below at your DNS provider (where the domain's
nameservers point — e.g. Cloudflare / GoDaddy / Namecheap / DigitalOcean DNS).

> ⚠️ The **exact values are shown in the Resend dashboard** when you add the domain
> (https://resend.com/domains → *Add Domain* → `bookunitedhotels.com`). The DKIM
> key is unique to your domain, and the MX host depends on your Resend **region**
> (`us-east-1` shown below; it may be `eu-west-1`). **Copy the values Resend shows**
> — the table below is the shape so you know what to expect.

| # | Type | Host / Name | Value | Priority | TTL |
|---|------|-------------|-------|----------|-----|
| 1 | **MX**  | `send`               | `feedback-smtp.us-east-1.amazonses.com` *(use the region Resend shows)* | `10` | Auto |
| 2 | **TXT** (SPF)  | `send`        | `v=spf1 include:amazonses.com ~all` | — | Auto |
| 3 | **TXT** (DKIM) | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQ…` *(long key — copy exactly from Resend)* | — | Auto |
| 4 | **TXT** (DMARC, recommended) | `_dmarc` | `v=DMARC1; p=none;` | — | Auto |

Notes:
- Records 1–2 are on the **`send.` subdomain**, so they do **not** conflict with any
  existing root‑domain MX you use for *receiving* mail (e.g. Google Workspace).
- If your DNS provider auto‑appends the domain, enter the host as `send` /
  `resend._domainkey` / `_dmarc`. If it wants the full name, use
  `send.bookunitedhotels.com`, etc.
- After saving, click **Verify** in Resend. DNS can take minutes to a few hours.
  Status must read **Verified** before email delivers.

(You already have the Resend **API key** — `re_UbiL1ESu_…` — it's just commented in
`.env`; Step 3 enables it.)

---

## Step 2 — Get İş Bankası production payment credentials

The store key + API user/password in `.env` today are **placeholders**; the bank
rejects every charge until they're real. Detail in `PRODUCTION_SETUP.md §1`. Short
version:
1. Log into the **management** panel **https://sanalpos.isbank.com.tr** for merchant
   `700704600170`. If you only have the *reporting* login, request management/API
   access from İş Bankası / Payten (`destek@payten.com`).
2. In **3D Secure / security settings**, set the **Store Key** → copy the exact same
   value into `ISBANK_POS_STORE_KEY`.
3. Create an **API role user** → `ISBANK_POS_API_USER` / `ISBANK_POS_API_PASSWORD`.

(Optional: test on Payten's test environment first — see `PRODUCTION_SETUP.md`.)

---

## Step 3 — Set production `.env` on the droplet

Paste the prepared production `.env` block into `/root/united-hotels-prod/.env`,
then fix these:
- `JWT_SECRET` → strong unique value: `openssl rand -hex 48` (don't ship the dev one)
- `ISBANK_POS_STORE_KEY` / `ISBANK_POS_API_USER` / `ISBANK_POS_API_PASSWORD` → the real values from Step 2
- `RESEND_API_KEY` + `EMAIL_FROM` → **uncommented** (after Step 1 is Verified)
- `SUPPORT_INBOX` / `BOOKING_OPS_INBOX` / `GROUPS_INBOX` → real mailboxes you monitor
- `NODE_ENV=production`, `FRONTEND_URL=https://bookunitedhotels.com`
- **Do NOT** set `ISBANK_MOCK_GATEWAY`

---

## Step 4 — Deploy

Follow [`deploy/DEPLOY_PAYMENTS.md`](deploy/DEPLOY_PAYMENTS.md):
1. Laptop: `git commit` + `git push`, then `package-web-next.ps1`, then `scp`.
2. Droplet: `git pull` + `npm install --omit=dev` + `pm2 reload backend`.
3. Droplet: extract the bundle + `pm2 reload frontend`.

On `pm2 logs backend` you must see **no** `[payments] PROD WARNING …` — that warning
means the store key / gate URL / callback is still wrong.

---

## Step 5 — Verify live
- `curl -sI https://bookunitedhotels.com/` → 200
- Browser: book → **Continue to secure payment** → real `sanalpos.isbank.com.tr`
  3‑D page → pay → `/payment/result?status=success`.
- Confirmation email arrives (guest); vendor + admin notified.
- Portal: pending booking shows **Awaiting payment**; **Cancel** shows a toast +
  cancellation emails fire.
- Group request form → requester + group‑desk emails arrive.

---

## Master checklist
- [ ] DNS: MX + SPF + DKIM (+ DMARC) added; Resend domain shows **Verified**
- [ ] İş Bankası real store key + API user/password obtained
- [ ] `.env`: real creds, Resend enabled, inboxes set, strong `JWT_SECRET`, `NODE_ENV=production`
- [ ] Deployed (backend `git pull`/reload + frontend bundle/reload)
- [ ] `pm2 logs backend` clean — no `[payments] PROD WARNING`
- [ ] End‑to‑end test: real payment succeeds + all emails deliver
