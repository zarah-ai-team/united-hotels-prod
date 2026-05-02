// Shared axios instance with a hard timeout + bounded retry policy.
//
// Both source adapters use this so timeout / retry behaviour is uniform:
//   - 2.5s per request
//   - retry once on 5xx or network error, with 250ms backoff
// Anything beyond that is a real provider failure — we want to fall back
// to the analytical path quickly, not chain retries.

import axios from 'axios';
import { log } from './log.js';

// Hotels.com Provider's /v3/hotels/search regularly takes 5-8s on the free
// tier. 10s gives it room without making the whole request feel hung; the
// orchestrator's per-source timeout still caps the worst case.
const TIMEOUT_MS = 10000;
const RETRY_DELAY_MS = 250;

export const http = axios.create({
  timeout: TIMEOUT_MS,
  // Don't throw on 4xx — let the caller decide. Only network errors / 5xx
  // are worth a retry.
  validateStatus: (status) => status >= 200 && status < 500,
});

http.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() };
  return config;
});

http.interceptors.response.use(
  (response) => {
    const ms = Date.now() - (response.config.metadata?.startTime || Date.now());
    log.debug({ url: response.config.url, status: response.status, ms }, 'http ok');
    return response;
  },
  async (error) => {
    const config = error.config || {};
    config._retryCount = (config._retryCount || 0) + 1;

    // Only retry true network errors (no response received) — NOT timeouts.
    // For slow third-party APIs (Hotels.com Provider /v3/hotels/search takes
    // 5-8s typical), retrying on ECONNABORTED just compounds the latency
    // and busts the orchestrator's per-source budget. The orchestrator will
    // fall back cleanly without a retry here.
    const isNetworkError = !error.response && error.code !== 'ECONNABORTED' && error.code !== 'ETIMEDOUT';
    const shouldRetry = config._retryCount === 1 && isNetworkError;

    if (shouldRetry) {
      log.warn({ url: config.url, code: error.code, attempt: config._retryCount }, 'http retry');
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      return http.request(config);
    }

    log.warn({ url: config.url, code: error.code, message: error.message }, 'http fail');
    return Promise.reject(error);
  },
);

export default http;
