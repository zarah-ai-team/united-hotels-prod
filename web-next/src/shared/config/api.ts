/**
 * API Configuration
 *
 * The browser talks ONLY to this app's own BFF (Next route handlers under
 * /api/*). The BFF forwards server-to-server to the real upstreams:
 *   /api/*          → Express backend   (BACKEND_URL, default :5000)
 *   /api/pricing/*  → pricing engine    (PRICING_URL, default :5050)
 *
 * Relative paths only — no CORS, and the real backend origins stay private.
 */

// Strip a trailing slash so `${BASE}/foo` never produces `//foo`.
const stripTrailingSlash = (s: string) => s.replace(/\/+$/, '');
// Force a leading slash so endpoint concatenation is always well-formed.
const ensureLeadingSlash = (s: string) => (s.startsWith('/') ? s : `/${s}`);

export const API_BASE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL || '/api',
);

// Pricing now flows through the BFF too, so it shares the /api tree. The BFF's
// pricing handler strips the /api/pricing prefix before hitting the engine.
export const PRICING_BASE_URL = stripTrailingSlash(
  process.env.NEXT_PUBLIC_PRICING_URL || '/api/pricing',
);

/** Safe URL joiner — collapses any double slashes between base and path. */
export const joinUrl = (base: string, path: string) =>
  `${stripTrailingSlash(base)}${ensureLeadingSlash(path)}`;

// Backend endpoints (joined onto API_BASE_URL — do NOT prefix with `/api`).
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/users/register',
    LOGIN: '/users/login',
    ME: '/users/me',
    VERIFY_EMAIL: '/users/verify-email',
    FORGOT_PASSWORD: '/users/forgot-password',
    RESET_PASSWORD: '/users/reset-password',
    SEND_REGISTER_OTP: '/users/send-register-otp',
    VERIFY_REGISTER_OTP: '/users/verify-register-otp',
  },

  HOTELS: {
    GET_PUBLIC: '/hotels/public',
    GET_BY_ID: (id: string) => `/hotels/public/${id}`,
    GET_RECOMMENDED_ALL: '/hotels/pricing/all',
    GET_ADMIN: '/hotels/admin',
    CREATE: '/hotels/admin/create',
    UPDATE: (id: string) => `/hotels/admin/${id}/update`,
    DELETE: (id: string) => `/hotels/admin/${id}/delete`,
  },

  ROOMS: {
    GET_ALL: '/rooms',
    GET_BY_ID: (id: string) => `/rooms/${id}`,
    CREATE: '/rooms',
    UPDATE: (id: string) => `/rooms/${id}`,
    DELETE: (id: string) => `/rooms/${id}`,
  },

  ITINERARIES: {
    GET_ALL: '/itineraries',
    GET_BY_ID: (id: string) => `/itineraries/${id}`,
    CREATE: '/itineraries',
    UPDATE: (id: string) => `/itineraries/${id}`,
    DELETE: (id: string) => `/itineraries/${id}`,
  },

  ROOM_ITINERARIES: {
    GET_BY_ITINERARY: (id: string) => `/room-itineraries/itinerary/${id}`,
    CREATE: '/room-itineraries',
    UPDATE: (id: string) => `/room-itineraries/${id}`,
    DELETE: (id: string) => `/room-itineraries/${id}`,
  },

  // Pricing routes that live on the backend (port 5000) — these wrap the
  // pricing engine internally. Distinct from PRICING_ENGINE below.
  PRICING: {
    GET_RECOMMENDED: '/rooms/getrecommendedprice',
    GET_AVAILABILITY: '/rooms/gethotelavailability',
    GET_ALL_AVAILABILITY: '/rooms/getallhotelavailability',
  },

  BOOKINGS: {
    GET_ALL: '/bookings',
    GET_BY_USER: '/bookings/getbookingsbyuserid',
    BOOK_ROOM: '/bookings/bookroom',
    CANCEL: '/bookings/cancel',
  },

  ADMIN: {
    STATS: '/admin/stats',
    ANALYTICS: '/admin/analytics',
    BOOKINGS_BY_COUNTRY: '/admin/bookings-by-country',
    USERS_BY_COUNTRY: '/admin/users-by-country',
    USERS: '/admin/users',
    USER_ROLE: (id: string) => `/admin/users/${id}/role`,
    USER_DELETE: (id: string) => `/admin/users/${id}`,
    ASSIGN_VENDOR: (hotelId: string) => `/admin/hotels/${hotelId}/assign-vendor`,
    ROOM_PRICE: (id: string) => `/admin/rooms/${id}/price`,
    EMAIL_LOGS: '/admin/email-logs',
    GROUP_REQUESTS: '/admin/group-requests',
    GROUP_REQUEST_STATUS: (id: string) => `/admin/group-requests/${id}`,
  },

  VENDOR: {
    STATS: '/vendor/stats',
    ANALYTICS: '/vendor/analytics',
    HOTELS: '/vendor/hotels',
    ROOMS: '/vendor/rooms',
    ROOM_PRICE_BAND: (id: string) => `/vendor/rooms/${id}/price-band`,
    BOOKINGS: '/vendor/bookings',
  },

  BLOG: {
    // Public reads
    PUBLIC_LIST: '/blog/public',
    PUBLIC_BY_SLUG: (slug: string) => `/blog/public/${encodeURIComponent(slug)}`,
    // Admin authoring (guarded by the backend)
    ADMIN_LIST: '/blog/admin',
    ADMIN_BY_ID: (id: string | number) => `/blog/admin/${id}`,
    ADMIN_CREATE: '/blog/admin',
    ADMIN_UPDATE: (id: string | number) => `/blog/admin/${id}`,
    ADMIN_DELETE: (id: string | number) => `/blog/admin/${id}`,
    ADMIN_UPLOAD: '/blog/admin/upload',
  },

  TRANSLATE: '/translate',
  LOCALE_DETECT: '/locale/detect',

  SUPPORT: {
    CONTACT: '/support/contact',
  },

  GROUP_REQUESTS: {
    SUBMIT: '/group-requests',
  },
};

// Pricing-engine endpoints (joined onto PRICING_BASE_URL).
export const PRICING_ENGINE_ENDPOINTS = {
  PRICE: '/v2/price',
  PRICES_BATCH: '/v2/prices/batch',
  HEALTH: '/v2/health',
};

export const getAuthHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const STORAGE_KEYS = {
  TOKEN: 'uh_auth_token',
  USER: 'uh_user',
  REFRESH_TOKEN: 'uh_refresh_token',
};
