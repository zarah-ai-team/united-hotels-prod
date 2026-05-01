const express = require("express");
const router = express.Router();
const translate = require("google-translate-api-x");

// In-memory LRU-ish cache: `${target}::${text}` -> translated
// Bounded so a stray batch doesn't grow memory unboundedly.
const CACHE_LIMIT = 5000;
const cache = new Map();

function cacheGet(key) {
    if (!cache.has(key)) return undefined;
    const value = cache.get(key);
    cache.delete(key);
    cache.set(key, value);
    return value;
}

function cacheSet(key, value) {
    if (cache.has(key)) cache.delete(key);
    cache.set(key, value);
    if (cache.size > CACHE_LIMIT) {
        const oldest = cache.keys().next().value;
        if (oldest !== undefined) cache.delete(oldest);
    }
}

const SUPPORTED = new Set([
    "en", "tr", "de", "fr", "es", "it", "ar", "ru", "zh", "zh-CN", "ja"
]);

function normaliseTarget(target) {
    if (typeof target !== "string") return null;
    const lower = target.toLowerCase();
    if (lower === "zh") return "zh-CN";
    return SUPPORTED.has(lower) ? lower : null;
}

router.post("/", async (request, response) => {
    try {
        const target = normaliseTarget(request.body?.target);
        const source = typeof request.body?.source === "string" && request.body.source
            ? request.body.source
            : "en";

        if (!target) {
            return response.status(400).json({ error: "Unsupported target language" });
        }

        const items = Array.isArray(request.body?.q)
            ? request.body.q
            : typeof request.body?.q === "string"
                ? [request.body.q]
                : [];

        if (!items.length) {
            return response.status(400).json({ error: "Missing q (string or string[])" });
        }

        // English target: identity. Skip the API entirely.
        if (target === "en") {
            return response.json({ target, translations: items });
        }

        const out = new Array(items.length);
        const toFetch = [];

        items.forEach((text, index) => {
            if (typeof text !== "string" || !text) {
                out[index] = text;
                return;
            }
            const key = `${target}::${text}`;
            const cached = cacheGet(key);
            if (cached !== undefined) {
                out[index] = cached;
            } else {
                toFetch.push({ index, text, key });
            }
        });

        if (toFetch.length) {
            const results = await translate(
                toFetch.map((entry) => entry.text),
                { from: source, to: target }
            );

            const arr = Array.isArray(results) ? results : [results];
            arr.forEach((res, i) => {
                const entry = toFetch[i];
                const translated = res?.text && typeof res.text === "string" ? res.text : entry.text;
                cacheSet(entry.key, translated);
                out[entry.index] = translated;
            });
        }

        return response.json({ target, translations: out });
    } catch (error) {
        // Never 500 the UI — fall back to identity translations on the client.
        console.warn("[translateRoute] failed:", error?.message || error);
        const fallback = Array.isArray(request.body?.q) ? request.body.q : [request.body?.q].filter(Boolean);
        return response.status(200).json({
            target: request.body?.target || "en",
            translations: fallback,
            error: "translation_unavailable",
        });
    }
});

module.exports = router;
