# pricing-engine-v2

Hybrid hotel-pricing microservice. External OTA median (MakCorps + RapidAPI) is the anchor; statistical adjusters layer on top; analytical fallback when external data is missing or sparse. Runs on its own port (`5050`), reads the same Postgres as the main app, never writes to it. Sibling to `UnitedHotels-Merged/` — that folder is untouched.

## Quickstart

```
cp .env.example .env
# Fill in DATABASE_URL (reusable from ../UnitedHotels-Merged/.env), MAKECORPS_API_KEY, RAPIDAPI_KEY.
npm install
npm run dev          # nodemon, port 5050
```

Smoke test once it's up:

```
curl -s -X POST http://localhost:5050/v2/price \
  -H "Content-Type: application/json" \
  -d '{"hotelId":1,"roomCategory":"Deluxe","checkIn":"2026-06-15","checkOut":"2026-06-18","guests":2,"rooms":1,"currency":"USD"}' | jq
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/v2/health` | uptime + provider availability + cache size |
| `POST` | `/v2/price` | single recommendation |
| `POST` | `/v2/prices/batch` | batch (concurrency 8) |
| `GET` | `/v2/bench` | last benchmark run summary |

## Tests

```
npm test            # vitest run
npm run test:watch  # watch mode while iterating
```

## Benchmark

```
# In a separate terminal, make sure UnitedHotels-Merged backend is running on :5000
npm run bench       # writes bench/results.csv with MAE / MAPE / direction-correct
```

## Architecture

```
request → validate (zod) → resolve hotel (pg) → fetch external anchors (MakCorps + RapidAPI, parallel)
       → aggregate (weighted median, IQR rejection) → occupancy lookup
       → adjusters (demand × leadTime × weekend × season × length × vendorMargin)
       → clamp to vendor band → currency convert → response
```

If `sampleSize < 2` from external sources, falls back to `source: "analytical"` using the seeded `basePrice` as anchor.

## Out of scope here

- No edits inside `UnitedHotels-Merged/`.
- No write paths to Postgres (read-only `pg.Pool`).
- No ML model — purely statistical adjusters anchored on external medians.
- No public deployment, no Docker.
