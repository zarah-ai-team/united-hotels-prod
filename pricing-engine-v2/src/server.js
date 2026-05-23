// pricing-engine-v2 — express bootstrap.
//
// Boots a tiny JSON HTTP server that mounts the /v2 router. Default port
// is 5050 to avoid colliding with UnitedHotels-Merged (5000) and the Vite
// dev server (5173). Reads .env from the package root if present.

import 'dotenv/config';
import express from 'express';

import v2Router from './routes/v2.js';
import { log } from './lib/log.js';

const PORT = Number(process.env.PORT) || 5050;
// Default to localhost-only so accidentally running this on a public host
// doesn't expose /v2/price (no auth). Set BIND_HOST=0.0.0.0 to override.
const HOST = process.env.BIND_HOST || '127.0.0.1';
const app = express();

app.use(express.json({ limit: '64kb' }));

// Friendly root so `curl http://localhost:5050/` doesn't 404 silently.
app.get('/', (_req, res) => {
  res.json({
    service: 'pricing-engine-v2',
    docs: 'POST /v2/price · POST /v2/prices/batch · GET /v2/health · GET /v2/bench',
  });
});

app.use('/v2', v2Router);

// Last-resort error handler so a thrown non-Error inside compute doesn't
// crash the worker. We log full stack but only return a stable shape.
app.use((err, _req, res, _next) => {
  log.error({ err: err.message, stack: err.stack }, 'unhandled middleware error');
  res.status(500).json({ error: 'internal error' });
});

const server = app.listen(PORT, HOST, () => {
  log.info(
    {
      port: PORT,
      host: HOST,
      sources: {
        makcorps: !!process.env.MAKECORPS_API_KEY,
        rapidapi: !!process.env.RAPIDAPI_KEY,
      },
      db: !!process.env.DATABASE_URL,
    },
    'pricing-engine-v2 listening',
  );
});

// Graceful shutdown so nodemon restarts don't leak sockets.
for (const sig of ['SIGTERM', 'SIGINT']) {
  process.on(sig, () => {
    log.info({ sig }, 'shutting down');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 5000).unref();
  });
}

export default app;
