# Docker deployment

Three containers — **backend** (Express API, :5000), **pricing** (pricing engine v2, :5050),
and **frontend** (Next.js, :3000). The database is external (Neon) via `DATABASE_URL`.

## Prerequisites
- Docker + Docker Compose on the server.
- A populated `.env` in the repo root (copy from `.env.example`). At minimum set:
  `DATABASE_URL`, `PG_SSL=true`, `JWT_SECRET`, `RESEND_API_KEY`, `BOOKING_OPS_INBOX`,
  and the production `ISBANK_POS_*` values (real bank-issued store key + API creds).

## Build & run
```bash
docker compose up -d --build
```
- `frontend` → http://SERVER:3000  (browser hits this; its BFF proxies `/api` to the backend)
- `backend`  → http://SERVER:5000
- `pricing`  → http://SERVER:5050

Stop / update:
```bash
docker compose down
docker compose pull        # if using a registry
docker compose up -d --build
```

## nginx (host) — terminate TLS and route to the frontend
```nginx
server {
  server_name bookunitedhotels.com;
  location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; }
}
```
The frontend's BFF forwards `/api/*` to the backend over the internal compose network
(`BACKEND_URL=http://backend:5000`), so you usually only need to expose `:3000` publicly.

## Notes
- **`NEXT_PUBLIC_*` are build-time** for the frontend — change them via the `args:` block in
  `docker-compose.yml` (e.g. `NEXT_PUBLIC_ISBANK_ENABLED`, `NEXT_PUBLIC_SITE_URL`) and rebuild.
- **Do not** set `ISBANK_MOCK_GATEWAY` in production — the mock gateway is for local testing
  only and is hard-guarded off when `NODE_ENV=production`.
- This is an alternative to the existing build-locally-then-scp + PM2 flow; pick one.
