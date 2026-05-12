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


// Trust the proxy chain so req.ip uses x-forwarded-for and the geoip util
// can read the real client address behind Render/Cloudflare/etc.
app.set('trust proxy', true);

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

// Keep health checks independent from database state.
app.get('/api/health', (_request, response) => {
    response.status(200).json({ status: 'ok' });
});

const port = process.env.PORT || 5000;

const explicitStaticDir = process.env.FRONTEND_STATIC_DIR
    ? path.resolve(process.env.FRONTEND_STATIC_DIR)
    : null;

const defaultStaticCandidates = [
    path.join(__dirname, 'client', 'build'),
    path.join(__dirname, 'United Hotel Full Code', 'United Hotel Full Code', 'dist')
];

const staticDir = [explicitStaticDir, ...defaultStaticCandidates]
    .filter(Boolean)
    .find((candidate) => fs.existsSync(candidate));

if (staticDir) {
    app.use(express.static(staticDir));

    app.get('*', (request, response, next) => {
        if (request.path.startsWith('/api/')) {
            return next();
        }

        response.sendFile(path.join(staticDir, 'index.html'));
    });
}


app.listen(port, ()=>{
    console.log(`Server started at port ${port}`);
})