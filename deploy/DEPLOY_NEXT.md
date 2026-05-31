# Deploying the Next.js frontend (web-next) to the DigitalOcean droplet

Staged cutover with instant rollback. The new Next app runs alongside the old
Vite site on port 3000; we only flip nginx once it's verified, and we keep the
old static webroot as the rollback.

- **Droplet:** `root@209.38.102.94` · repo at `/root/united-hotels-prod`
- **Existing PM2:** `backend` (:5000), `pricing-engine` (:5050) — leave running
- **New Next deploy dir:** `/var/www/unitedhotels-next`
- **Old Vite webroot (rollback):** `/var/www/unitedhotels` — DO NOT delete yet

Architecture after cutover: nginx → Next (:3000) serves pages **and** `/api/*`
(the BFF), which forwards server-side to Express (:5000) and pricing (:5050).

---

## A. On the LAPTOP (Windows PowerShell, in `D:\united-hotels\united-hotels-prod`)

```powershell
# 1. Build + package the standalone bundle (the 512MB droplet OOMs on next build)
powershell -ExecutionPolicy Bypass -File scripts\package-web-next.ps1
# -> produces web-next\web-next-standalone.tar.gz (~23 MB)

# 2. Ship the bundle + the deploy configs to the droplet
scp web-next\web-next-standalone.tar.gz root@209.38.102.94:/tmp/
scp deploy\ecosystem.config.cjs        root@209.38.102.94:/tmp/
scp deploy\nginx-bookunitedhotels.conf   root@209.38.102.94:/tmp/
```

---

## B. On the DROPLET (SSH in: `ssh root@209.38.102.94`)

### B1. (Once) Add swap — required on 512MB so 3 Node processes don't OOM
```bash
if ! swapon --show | grep -q /swapfile; then
  fallocate -l 1G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
free -h
```

### B2. Extract the new frontend bundle
```bash
rm -rf /var/www/unitedhotels-next && mkdir -p /var/www/unitedhotels-next
tar -xzf /tmp/web-next-standalone.tar.gz -C /var/www/unitedhotels-next
test -f /var/www/unitedhotels-next/server.js && echo "OK: server.js present" || echo "MISSING server.js — stop"
cp /tmp/ecosystem.config.cjs /var/www/unitedhotels-next/ecosystem.config.cjs
```

### B3. Start Next under PM2 on :3000 (does NOT touch the live site yet)
```bash
pm2 start /var/www/unitedhotels-next/ecosystem.config.cjs
pm2 save
pm2 status        # 'frontend' should be 'online'
pm2 logs frontend --lines 20 --nostream
```

### B4. Smoke-test the Next app locally, before any nginx change
```bash
curl -s -o /dev/null -w "home:    %{http_code}\n" http://127.0.0.1:3000/
curl -s -o /dev/null -w "health:  %{http_code}\n" http://127.0.0.1:3000/api/health
curl -s -o /dev/null -w "hotels:  %{http_code}\n" http://127.0.0.1:3000/api/hotels/public
curl -s -o /dev/null -w "sitemap: %{http_code}\n" http://127.0.0.1:3000/sitemap.xml
curl -s -o /dev/null -w "robots:  %{http_code}\n" http://127.0.0.1:3000/robots.txt
# login reaches the backend (401 with bad creds = chain OK; 502 = BFF can't reach backend)
curl -s -o /dev/null -w "login:   %{http_code}\n" -X POST http://127.0.0.1:3000/api/users/login \
  -H "Content-Type: application/json" -d '{"email":"x@y.z","password":"bad"}'
```
All should be 200 except login (401). If login is 502, check `BACKEND_URL` in the
ecosystem file and that `pm2 status` shows `backend` online.

### B5. Flip nginx to the Next app (the actual cutover)
```bash
# Find and back up the current site config
ls -l /etc/nginx/sites-enabled/
CONF=$(ls /etc/nginx/sites-enabled/ | grep -i unitedhotels | head -1)   # adjust if named differently
cp /etc/nginx/sites-available/$CONF /root/nginx-backup-$(date +%s).conf

# Install the new config — IMPORTANT: confirm the ssl_certificate paths inside
# match `certbot certificates` before reloading.
cp /tmp/nginx-bookunitedhotels.conf /etc/nginx/sites-available/$CONF
nginx -t && systemctl reload nginx
```

### B6. Verify the live site
```bash
curl -sI https://bookunitedhotels.com/ | head -5
curl -s https://bookunitedhotels.com/ | grep -o "<title>[^<]*</title>"
curl -s -o /dev/null -w "live login: %{http_code}\n" -X POST https://bookunitedhotels.com/api/users/login \
  -H "Content-Type: application/json" -d '{"email":"x@y.z","password":"bad"}'
```
Then open the site in a browser and actually log in. Check the favicon, and view
source to confirm the per-page `<title>` / meta / JSON-LD are present.

---

## C. Rollback (if anything is wrong after the flip)
```bash
cp /root/nginx-backup-<TIMESTAMP>.conf /etc/nginx/sites-available/$CONF
nginx -t && systemctl reload nginx     # back to the old Vite site instantly
# optionally stop the Next app:
pm2 stop frontend
```
The old static site at `/var/www/unitedhotels` is untouched, so reverting nginx
fully restores the previous site.

---

## D. Re-deploying later (after code changes)
```powershell
# laptop
powershell -ExecutionPolicy Bypass -File scripts\package-web-next.ps1
scp web-next\web-next-standalone.tar.gz root@209.38.102.94:/tmp/
```
```bash
# droplet
rm -rf /var/www/unitedhotels-next && mkdir -p /var/www/unitedhotels-next
tar -xzf /tmp/web-next-standalone.tar.gz -C /var/www/unitedhotels-next
cp /tmp/ecosystem.config.cjs /var/www/unitedhotels-next/ 2>/dev/null || true
pm2 reload frontend
```

## Notes
- **Build-time vs runtime env:** `NEXT_PUBLIC_*` values are baked in at build time
  (on the laptop) — set real social URLs / GA ID / GSC token before `package-web-next.ps1`
  if you want them live. `BACKEND_URL` / `PRICING_URL` are read at runtime from the
  PM2 ecosystem env, so they stay on the droplet.
- **Do not** add `location /api { proxy_pass :5000 }` to nginx — it bypasses the BFF
  and breaks `/api/pricing`. Everything goes to Next:3000.
- Backend `server.js` / `package.json` / `render.yaml` also changed in this repo
  (API-only Express, scripts point at web-next). Commit & deploy those to the droplet
  too (`git`), but they're not required for the frontend cutover above.
