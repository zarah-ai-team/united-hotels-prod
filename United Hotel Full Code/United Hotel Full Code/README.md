# United Hotel Frontend V2

Client-redesign track of the United Hotels frontend.

This folder is an isolated copy of `UnitedHotels-Merged/United Hotel Full Code/United Hotel Full Code/`. The V1 folder stays frozen as a fallback / visual-diff reference; **all client-requested redesign work happens here**.

## Quick start

```bash
npm install
npm run dev
```

The dev server runs on `http://localhost:5174` (V1 keeps `:5173`, so you can run both side-by-side).

## Backend connection

Vite proxies API traffic to the same backend the V1 frontend uses:

- `/api`     → `http://localhost:5000`  (Express server in `UnitedHotels-Merged/`, `server.js`)
- `/pricing` → `http://localhost:5050`  (pricing engine)

To override the proxy targets (e.g. point at a remote backend), set in `.env`:

```
VITE_API_PROXY=http://your-backend
VITE_PRICING_PROXY=http://your-pricing
```

The `VITE_API_URL=/api` and `VITE_PRICING_URL=/pricing` values stay as relative paths so the production build is drop-in compatible with the existing nginx setup.

## Production cutover

When the redesign is approved, replace the contents of
`UnitedHotels-Merged/United Hotel Full Code/United Hotel Full Code/`
with the contents of this folder and rebuild. No backend, nginx, or `render.yaml` changes are needed — the API contract (see `src/app/config/api.ts` and `src/app/services/api.ts`) is unchanged.

## Ground rules during redesign

- Do **not** touch the V1 folder.
- Components and pages can change freely.
- `src/app/config/api.ts` and the call signatures in `src/app/services/api.ts` should stay shape-compatible with the backend so integration stays seamless.
