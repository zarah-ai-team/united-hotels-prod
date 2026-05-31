const express = require("express");
require("dotenv").config();

const app = express();

const dbCOnfig = require("./db")
const cors = require("cors")
const path = require('path')
const fs = require('fs')

const roomsRoute = require("./routes/roomsRoute")
const usersRoute = require("./routes/userRoute")
const bookingRoute = require("./routes/bookingsRoute");
const hotelsRoute = require("./routes/hotelsRoute");
const paymentsRoute = require("./routes/paymentsRoute");
const translateRoute = require("./routes/translateRoute");
const adminRoute = require("./routes/adminRoute");
const vendorRoute = require("./routes/vendorRoute");
const localeRoute = require("./routes/localeRoute");
const supportRoute = require("./routes/supportRoute");
const groupRequestsRoute = require("./routes/groupRequestsRoute");


// Trust the proxy chain so req.ip uses x-forwarded-for and the geoip util
// can read the real client address behind Render/Cloudflare/etc.
app.set('trust proxy', true);
// Drop the default `X-Powered-By: Express` header — small but a real signal
// to fingerprinting tools.
app.disable('x-powered-by');

// Security headers applied to every response. Kept tight on purpose — CSP
// is intentionally omitted here because this SPA loads from many CDNs
// (Imagekit, Google Fonts, GA, FB Pixel); a wrong CSP breaks more than it
// secures. Add a CSP report-only policy first if you want one.
app.use((req, res, next) => {
    // HSTS — force HTTPS for a year, include subdomains. Safe behind a
    // terminating proxy that handles TLS (Render/Cloudflare).
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)');
    next();
});

app.use(express.urlencoded({extended: false}));
app.use(express.json());

// Lightweight request logger so we can see exactly what the frontend hits.
app.use((req, _res, next) => {
    const ts = new Date().toISOString().slice(11, 19);
    console.log(`[${ts}] ${req.method} ${req.originalUrl}`);
    next();
});

const parseCorsOrigins = () => {
    const raw = process.env.CORS_ORIGIN || process.env.CORS_ORIGINS || '';
    // Wildcard short-hands: '', '*', 'true', 'all', 'any' all mean "allow any origin".
    if (!raw || raw === '*' || /^(true|all|any)$/i.test(raw)) {
        return true; // cors() treats `true` as reflect-request-origin (works with credentials).
    }

    const origins = raw
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);

    return origins.length ? origins : true;
};

const allowedOrigins = parseCorsOrigins();
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/api/rooms", roomsRoute);
app.use("/api/users", usersRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/hotels", hotelsRoute);
app.use("/api/payments", paymentsRoute);
app.use("/api/translate", translateRoute);
app.use("/api/admin", adminRoute);
app.use("/api/vendor", vendorRoute);
app.use("/api/locale", localeRoute);
app.use("/api/support", supportRoute);
app.use("/api/group-requests", groupRequestsRoute);

// Keep health checks independent from database state.
app.get('/api/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
});

// SEO endpoints — must be registered before the SPA catch-all below so
// Google fetches the real XML/text instead of index.html.
const { sitemapXml, robotsTxt, adsTxt } = require('./controllers/seo');
app.get('/sitemap.xml', sitemapXml);
app.get('/robots.txt', robotsTxt);
// Ad-tech compliance / verification. Audit tooling expects text/plain.
app.get('/ads.txt', adsTxt);

const port = process.env.PORT || 5000;

const explicitStaticDir = process.env.FRONTEND_STATIC_DIR
    ? path.resolve(process.env.FRONTEND_STATIC_DIR)
    : null;

// The frontend is now the Next.js app (web-next), served by its own Node
// process behind nginx — Express is API-only. These candidates remain as an
// optional fallback (set FRONTEND_STATIC_DIR to serve a prebuilt SPA from
// Express); when none exist, the static/SPA-fallback block below is skipped.
const defaultStaticCandidates = [
    path.join(__dirname, 'client', 'build'),
];

const staticDir = [explicitStaticDir, ...defaultStaticCandidates]
    .filter(Boolean)
    .find((candidate) => fs.existsSync(candidate));

if (staticDir) {
    // Long-cache hashed bundle assets, but never cache index.html — otherwise
    // a returning user gets stale chunk hashes and a blank page.
    app.use(express.static(staticDir, {
        index: false,
        setHeaders: (res, filePath) => {
            if (filePath.endsWith('.html')) {
                res.setHeader('Cache-Control', 'no-cache');
            } else if (/\.(js|css|woff2?|ttf|otf|eot|png|jpg|jpeg|webp|avif|gif|svg|ico)$/i.test(filePath)) {
                // Vite emits hashed filenames for these — 1 year immutable is safe.
                res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            } else {
                res.setHeader('Cache-Control', 'public, max-age=3600');
            }
        },
    }));

    app.get('*', (request, response, next) => {
        if (request.path.startsWith('/api/')) {
            return next();
        }
        // SPA fallback. The SPA renders its own 404 via the catch-all route,
        // so a real status code can't be set here without breaking client
        // routing — known SPA tradeoff. The crawler-visible signal lives in
        // the noscript block + the NotFoundPage's noindex meta robots tag.
        response.setHeader('Cache-Control', 'no-cache');
        response.sendFile(path.join(staticDir, 'index.html'));
    });
}


app.listen(port, ()=>{
    console.log(`Server started at port ${port}`);
})