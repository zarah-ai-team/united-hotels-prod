// Shared LRU cache with stale-while-revalidate semantics + inflight dedup.
//
// Both source adapters import the same instance so a flood of concurrent
// requests for the same hotel collapses to one upstream call.
//
// API:
//   getFresh(key)              → value | undefined (null if cache miss / expired)
//   getStale(key)              → value | undefined (last-known, used when fresh fetch fails)
//   set(key, value, freshMs?)  → void  (sets both fresh + stale TTLs)
//   withInflight(key, fn)      → fn() result, deduped by key while in flight
//
// Wraps lru-cache and adds two parallel TTL stores so a value can be
// "stale-but-still-usable" between freshTTL and staleTTL.

import { LRUCache } from 'lru-cache';

const FRESH_TTL_MS_DEFAULT = 60_000;     //  1 min
const STALE_TTL_MS_DEFAULT = 180_000;    //  3 min — stale-while-revalidate window
const MAX_ENTRIES = 1000;

const fresh = new LRUCache({ max: MAX_ENTRIES, ttl: FRESH_TTL_MS_DEFAULT });
const stale = new LRUCache({ max: MAX_ENTRIES, ttl: STALE_TTL_MS_DEFAULT });
const inflight = new Map();

export const cache = {
  getFresh(key) {
    return fresh.get(key);
  },
  getStale(key) {
    return stale.get(key);
  },
  set(key, value, freshMs = FRESH_TTL_MS_DEFAULT, staleMs = STALE_TTL_MS_DEFAULT) {
    fresh.set(key, value, { ttl: freshMs });
    stale.set(key, value, { ttl: staleMs });
  },
  /**
   * Run `fn()` if no other call with the same key is in flight, otherwise
   * wait on the existing promise. Prevents thundering-herd against MakCorps.
   */
  async withInflight(key, fn) {
    const existing = inflight.get(key);
    if (existing) return existing;

    const p = (async () => {
      try {
        return await fn();
      } finally {
        inflight.delete(key);
      }
    })();
    inflight.set(key, p);
    return p;
  },
  size() {
    return fresh.size;
  },
  clear() {
    fresh.clear();
    stale.clear();
    inflight.clear();
  },
};

export default cache;
