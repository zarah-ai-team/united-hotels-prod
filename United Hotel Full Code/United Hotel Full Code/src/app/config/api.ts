/**
 * API Configuration
 *
 * Two upstreams sit behind nginx in production:
 *   /api      → backend          (port 5000)
 *   /pricing  → pricing engine   (port 5050)
 *
 * Frontend talks to relative paths so there is no CORS dependency.
 */

// Strip a trailing slash so `${BASE}/foo` never produces `//foo`.
const stripTrailingSlash = (s: string) => s.replace(/\/+$/, '');
// Force a leading slash so endpoint concatenation is always well-formed.
const ensureLeadingSlash = (s: string) => (s.startsWith('/') ? s : `/${s}`);

export const API_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_API_URL || '/api',
);

export const PRICING_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_PRICING_URL || '/pricing',
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
  },

  VENDOR: {
    STATS: '/vendor/stats',
    ANALYTICS: '/vendor/analytics',
    HOTELS: '/vendor/hotels',
    ROOMS: '/vendor/rooms',
    ROOM_PRICE_BAND: (id: string) => `/vendor/rooms/${id}/price-band`,
    BOOKINGS: '/vendor/bookings',
  },

  TRANSLATE: '/translate',
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
