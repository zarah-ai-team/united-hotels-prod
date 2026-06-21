# Deploy the payment changes to bookunitedhotels.com

Runbook for shipping the İş Bankası payment integration + the booking/cancel/
group emails, FX conversion, price-cache fix, SEO loader fix, and Docker files.

- **Droplet:** `root@209.38.102.94` · repo `/root/united-hotels-prod`
- **PM2 apps:** `backend` (:5000), `pricing-engine` (:5050), `frontend` (:3000)
- **Backend** ships via `git pull`; **frontend** via the standalone tarball.
- **Credentials + email activation:** see [`PRODUCTION_SETUP.md`](../PRODUCTION_SETUP.md).

---

## 0. Prerequisites (before you start)
- [ ] Real **İş Bankası store key** + API user/password in hand (PRODUCTION_SETUP.md §1)
- [ ] **Resend** domain `bookunitedhotels.com` verified (PRODUCTION_SETUP.md §2)
- [ ] The production `.env` block ready to paste (current values + the 3 TODOs filled)

---

## 1. LAPTOP — commit, build, ship
```powershell
# in D:\united-hotels\united-hotels-prod
git add -A
git reset -q .claude                         # keep local tooling out of the repo
git commit -m "feat(payments): live Is Bankasi flow, emails, FX, price-cache bust, SEO loader, Docker"
git push origin payment-integrated

# Build + package the Next standalone bundle (NEXT_PUBLIC_ISBANK_ENABLED=true
# is baked from web-next/.env.local).
powershell -ExecutionPolicy Bypass -File scripts\package-web-next.ps1

scp web-next\web-next-standalone.tar.gz root@209.38.102.94:/tmp/
scp deploy\ecosystem.config.cjs         root@209.38.102.94:/tmp/
```
> `.env` is gitignored — no secrets are committed.

---

## 2. DROPLET — backend
```bash
ssh root@209.38.102.94
cd /root/united-hotels-prod

git fetch origin
git checkout payment-integrated        # or merge into your prod branch (e.g. main)
git pull
npm install --omit=dev

# Update production env (paste the prepared block; fix JWT_SECRET, real Is Bankasi
# creds, inbox emails). Must include NODE_ENV=production and must NOT set
# ISBANK_MOCK_GATEWAY.
nano .env

pm2 reload backend
pm2 logs backend --lines 30 --nostream
# Expect: "Server started at port 5000"  AND  no  "[payments] PROD WARNING ..."
# A PROD WARNING means the store key / gate URL / callback is still wrong.
```

---

## 3. DROPLET — frontend
```bash
rm -rf /var/www/unitedhotels-next && mkdir -p /var/www/unitedhotels-next
tar -xzf /tmp/web-next-standalone.tar.gz -C /var/www/unitedhotels-next
test -f /var/www/unitedhotels-next/server.js && echo "OK: server.js present" || echo "MISSING — stop"
cp /tmp/ecosystem.config.cjs /var/www/unitedhotels-next/ 2>/dev/null || true
pm2 reload frontend
pm2 status        # backend, pricing-engine, frontend all "online"
```

---

## 4. Verify
```bash
curl -s -o /dev/null -w "home:   %{http_code}\n" https://bookunitedhotels.com/
curl -s -o /dev/null -w "health: %{http_code}\n" https://bookunitedhotels.com/api/health
```
Then in a browser:
1. Book a room → **Continue to secure payment** → must redirect to the real
   `sanalpos.isbank.com.tr` 3‑D Secure page.
2. Pay with a real card → land on `/payment/result?status=success`.
3. Confirmation email arrives (guest); vendor + admin get their notifications.
4. In the portal: a pending booking shows **Awaiting payment**; **Cancel Booking**
   shows a toast and the cancellation emails fire.
5. Submit a group request → requester + group-desk emails arrive.
6. View-source the home page → SEO `<h1>`/JSON-LD present (crawlable), no flash of
   raw text for users.

---

## 5. Rollback
```bash
cd /root/united-hotels-prod
git checkout <previous-sha>
pm2 reload backend
# Frontend: re-extract the previous web-next-standalone bundle, then: pm2 reload frontend
# nginx-level rollback (back to the prior site) is in deploy/DEPLOY_NEXT.md §C.
```

---

## Notes
- `NEXT_PUBLIC_*` are **build-time** (baked on the laptop). To change
  `NEXT_PUBLIC_ISBANK_ENABLED` etc. you must rebuild + re-ship the bundle.
- `BACKEND_URL` / `PRICING_URL` are runtime, from the PM2 ecosystem env on the
  droplet — they stay on the server.
- The local **mock gateway** is hard-disabled when `NODE_ENV=production`; never set
  `ISBANK_MOCK_GATEWAY` in prod.
- Docker is an **alternative** path (`DOCKER.md`); the PM2/scp flow above is the
  live one — don't mix them.
```
