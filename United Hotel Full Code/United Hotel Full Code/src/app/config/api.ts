/**
 * API Configuration
 * Centralized configuration for API endpoints and base URL
 */

// API Base URL - defaults to same-origin for production static serving.
// Set VITE_API_URL for cross-origin deployments.
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/api/users/register',
    LOGIN: '/api/users/login',
    ME: '/api/users/me',
    VERIFY_EMAIL: '/api/users/verify-email',
    FORGOT_PASSWORD: '/api/users/forgot-password',
    RESET_PASSWORD: '/api/users/reset-password',
  },

  // Hotels
  HOTELS: {
    GET_PUBLIC: '/api/hotels/public',
    GET_BY_ID: (id: string) => `/api/hotels/public/${id}`,
    GET_RECOMMENDED_ALL: '/api/hotels/pricing/all',
    GET_ADMIN: '/api/hotels/admin',
    CREATE: '/api/hotels/admin/create',
    UPDATE: (id: string) => `/api/hotels/admin/${id}/update`,
    DELETE: (id: string) => `/api/hotels/admin/${id}/delete`,
  },

  // Rooms
  ROOMS: {
    GET_ALL: '/api/rooms',
    GET_BY_ID: (id: string) => `/api/rooms/${id}`,
    CREATE: '/api/rooms',
    UPDATE: (id: string) => `/api/rooms/${id}`,
    DELETE: (id: string) => `/api/rooms/${id}`,
  },

  // Itineraries
  ITINERARIES: {
    GET_ALL: '/api/itineraries',
    GET_BY_ID: (id: string) => `/api/itineraries/${id}`,
    CREATE: '/api/itineraries',
    UPDATE: (id: string) => `/api/itineraries/${id}`,
    DELETE: (id: string) => `/api/itineraries/${id}`,
  },

  // Room Itineraries
  ROOM_ITINERARIES: {
    GET_BY_ITINERARY: (id: string) => `/api/room-itineraries/itinerary/${id}`,
    CREATE: '/api/room-itineraries',
    UPDATE: (id: string) => `/api/room-itineraries/${id}`,
    DELETE: (id: string) => `/api/room-itineraries/${id}`,
  },

  // Pricing
  PRICING: {
    GET_RECOMMENDED: '/api/rooms/getrecommendedprice',
    GET_AVAILABILITY: '/api/rooms/gethotelavailability',
    GET_ALL_AVAILABILITY: '/api/rooms/getallhotelavailability',
  },

  // Bookings
  BOOKINGS: {
    GET_ALL: '/api/bookings',
    GET_BY_USER: '/api/bookings/getbookingsbyuserid',
    BOOK_ROOM: '/api/bookings/bookroom',
  },
};

// Headers configuration
export const getAuthHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

// Storage keys
export const STORAGE_KEYS = {
  TOKEN: 'uh_auth_token',
  USER: 'uh_user',
  REFRESH_TOKEN: 'uh_refresh_token',
};
