# Public Test Deployment (Fastest)

This project can be deployed as one service:
- Backend API (Express)
- Frontend (Vite build) served by backend from `dist`

## Option A: Render (recommended for quick public testing)

### 1) Push latest code to GitHub
Make sure these files are in the repo:
- `render.yaml`
- backend + frontend source code

### 2) Create a Postgres database
Use Neon, Supabase, or Render Postgres.
Copy the connection string as `DATABASE_URL`.

### 3) Deploy on Render
1. Open Render Dashboard.
2. Click New > Blueprint.
3. Select your GitHub repo.
4. Render reads `render.yaml` automatically.
5. Add required secrets when prompted:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `CORS_ORIGIN` (set to your Render app URL after first deploy)

### 4) Recommended env values
Set these in Render service Environment:
- `PG_SSL=true`
- `REQUIRE_EMAIL_OTP=false`
- Optional Makecorps live pricing env vars:
  - `USE_MOCK_MAKECORPS=false`
  - `MAKECORPS_API_BASE_URL=https://api.makcorps.com`
  - `MAKECORPS_API_KEY=<your_makecorps_key>`
- Optional email env vars:
  - `SMTP_USER`
  - `SMTP_PASS`
  - `MAIL_FROM`

### 5) Initialize database schema
After first deploy, run schema SQL on your Postgres DB:
- `db/schema.sql`
- or run your migration script as needed

### 6) Verify
Open:
- `https://<your-render-app>.onrender.com` (frontend)
- `https://<your-render-app>.onrender.com/api/hotels/public?limit=1&offset=0` (API)

## Important notes
- If frontend cannot call API, update `CORS_ORIGIN` to exact frontend origin.
- On free plans, first request may be cold-start slow.
- If SMTP is not configured, booking should still work; email may be skipped.

## Option B: Instant temporary public URL (no deploy)
If you just need a quick demo now, run locally and tunnel with Cloudflare Tunnel or ngrok:
- Start backend on `5000`.
- Build frontend and serve via backend (already supported by `server.js`).
- Expose local port with a tunnel command.

This is temporary and best only for short testing sessions.
