/**
 * Unified API Service
 * Handles all HTTP requests to the backend API
 */

import { API_BASE_URL, API_ENDPOINTS, getAuthHeaders, STORAGE_KEYS } from '../config/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phoneNumber?: number;
  otpVerifiedToken?: string;
}

export interface OtpRequest {
  email: string;
  name?: string;
}

export interface OtpVerifyRequest {
  email: string;
  otp: string;
}

export interface LoginResponse {
  token: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

// Hotel Types
export interface PublicHotelRoom {
  id: number | null;
  room_name: string;
  room_category: string;
  occupancy_code?: string | null;
  occupancy_type?: string | null;
  currency_code?: string | null;
  price_raw?: string | null;
  category?: string;
  price_per_night: number;
  base_price?: number;
  max_count?: number | null;
  available_rooms?: number | null;
  images?: string[];
}

export interface PublicHotel {
  // Core identity
  id: number;
  // Mapped camelCase (from backend mapHotelRecord)
  name: string;
  location: string;
  address?: string | null;
  description?: string | null;
  hotelLink?: string | null;
  googleMapsLink?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  email?: string | null;
  starRating?: number | null;
  checkInTime?: string | null;
  checkOutTime?: string | null;
  childPolicy?: string | null;
  petPolicy?: string | null;
  smokingPolicy?: string | null;
  totalRooms?: number | null;
  // Raw DB snake_case fields (also present in response via spread ...hotelRow)
  hotel_name?: string | null;
  hotel_description?: string | null;
  location_raw?: string | null;
  hotel_link?: string | null;
  google_maps_link?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  star_rating?: number | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  child_policy?: string | null;
  pet_policy?: string | null;
  smoking_policy?: string | null;
  total_rooms?: number | null;
  // Deprecated/legacy fields
  district?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  roomCategories?: Array<Record<string, any>> | null;
  data?: Record<string, any> | null;
  amenities?: Array<{ name: string } | string>;
  rooms?: PublicHotelRoom[];
  recommendedPrices?: Array<{
    roomId?: number | null;
    roomNumber?: string | null;
    vendorId?: string | null;
    roomCategory?: string;
    category?: string;
    basePrice?: number;
    recommendedPrice?: number;
    discountPercent?: number;
    savingsAmount?: number;
  }>;
  [key: string]: any;
}

export interface PublicHotelsResponse {
  hotels: PublicHotel[];
  count: number;
  limit: number;
  offset: number;
}

export interface CreateHotelRequest {
  [key: string]: any;
}

// Room Types
export interface RoomData {
  hotel_id: number;
  category: string;
  max_count: number;
  price_per_night: number;
  room_number: string;
  images: string[];
}

// Itinerary Types
export interface CreateItineraryRequest {
  hotel_id: number;
  name: string;
  description: string;
}

// Room Itinerary Types
export interface RoomItineraryData {
  itinerary_id: number;
  room_id: number;
  quantity: number;
  price_per_night: number;
}

// Pricing Types
export interface PricingRecommendRequest {
  hotelName: string;
  minBound: number;
  maxBound: number;
}

export interface AvailabilityRequest {
  hotelName?: string;
  checkInDate: string;
  checkOutDate: string;
  guests: number;
}

// Booking Types
export interface BookingData {
  room: {
    name: string;
    id: number;
    hotelid?: number;
  };
  userid?: number;
  fromdate: string;
  todate: string;
  totalamount: number;
  totaldays: number;
  bookedRooms?: number;
  paymentMode?: string;
  transactionId?: string;
  specialRequest?: string;
  email?: string;
  phoneNumber?: string;
}

// Helper function to make API calls
async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = getAuthHeaders(token);

  const config: RequestInit = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error: ApiError = {
        message: `HTTP ${response.status}: ${response.statusText}`,
        status: response.status,
      };

      try {
        error.data = await response.json();
      } catch {
        // Response is not JSON
      }

      throw error;
    }

    // Handle empty responses (like DELETE)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    // Re-throw API errors
    if (error.status) {
      throw error;
    }

    // Handle network errors
    throw {
      message: error.message || 'Network error',
      status: 0,
    } as ApiError;
  }
}

// Get stored token
function getStoredToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

// ─────────────────────────────────────────────
// Authentication Service
// ─────────────────────────────────────────────

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiCall<LoginResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );

    if (response.token) {
      localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
    }

    return response;
  },

  async register(data: RegisterRequest): Promise<any> {
    const response = await apiCall(
      API_ENDPOINTS.AUTH.REGISTER,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );

    return response;
  },

  async sendRegisterOtp(data: OtpRequest): Promise<any> {
    return apiCall(
      '/api/users/send-register-otp',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async verifyRegisterOtp(data: OtpVerifyRequest): Promise<{ otpVerifiedToken: string; message?: string }> {
    return apiCall(
      '/api/users/verify-register-otp',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async getCurrentUser(): Promise<any> {
    const token = getStoredToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await apiCall(
      API_ENDPOINTS.AUTH.ME,
      { method: 'GET' },
      token
    );

    if (response?.user) return response.user;
    return response;
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  async verifyEmail(token: string): Promise<{ message: string; user?: { id: number; name: string; email: string } }> {
    return apiCall(
      `${API_ENDPOINTS.AUTH.VERIFY_EMAIL}?token=${encodeURIComponent(token)}`,
      { method: 'GET' }
    );
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiCall(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { method: 'POST', body: JSON.stringify({ email }) }
    );
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiCall(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      { method: 'POST', body: JSON.stringify({ token, password }) }
    );
  },
};

// ─────────────────────────────────────────────
// Hotels Service
// ─────────────────────────────────────────────

export const hotelService = {
  async getPublicHotels(params: {
    status?: string;
    limit?: number;
    offset?: number;
    includeRecommendedPrices?: boolean;
    refreshPrices?: boolean;
  } = {}): Promise<PublicHotelsResponse> {
    const query = new URLSearchParams({
      status: params.status || 'active',
      limit: String(params.limit ?? 50),
      offset: String(params.offset ?? 0),
      includeRecommendedPrices: String(params.includeRecommendedPrices ?? true),
      refreshPrices: String(params.refreshPrices ?? false),
    });

    return apiCall<PublicHotelsResponse>(
      `${API_ENDPOINTS.HOTELS.GET_PUBLIC}?${query.toString()}`,
      { method: 'GET' }
    );
  },

  async getAll(): Promise<PublicHotel[]> {
    const response = await this.getPublicHotels();
    return Array.isArray(response.hotels) ? response.hotels : [];
  },

  async getById(id: string): Promise<PublicHotel | null> {
    try {
      const response = await apiCall<{ hotel: PublicHotel }>(
        API_ENDPOINTS.HOTELS.GET_BY_ID(id),
        { method: 'GET' }
      );
      return response.hotel || null;
    } catch (err: any) {
      // Fallback: scan the public list if single endpoint not yet deployed
      if (err?.status === 404 || err?.status === 400) return null;
      const response = await this.getPublicHotels({ limit: 200, offset: 0 });
      return (response.hotels || []).find((h) => String(h.id) === String(id)) || null;
    }
  },

  async getAllRecommended(status = 'active', refresh = false): Promise<any> {
    const query = new URLSearchParams({
      status,
      refresh: String(refresh),
    });

    return apiCall(
      `${API_ENDPOINTS.HOTELS.GET_RECOMMENDED_ALL}?${query.toString()}`,
      { method: 'GET' }
    );
  },

  async create(data: CreateHotelRequest): Promise<any> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.HOTELS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  },

  async update(id: string, data: Partial<CreateHotelRequest>): Promise<any> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.HOTELS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  },

  async delete(id: string): Promise<void> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.HOTELS.DELETE(id),
      { method: 'DELETE' },
      token
    );
  },
};

// ─────────────────────────────────────────────
// Rooms Service
// ─────────────────────────────────────────────

export const roomService = {
  async getAll(): Promise<any[]> {
    return apiCall(
      API_ENDPOINTS.ROOMS.GET_ALL,
      { method: 'GET' }
    );
  },

  async getById(id: string): Promise<any> {
    return apiCall(
      API_ENDPOINTS.ROOMS.GET_BY_ID(id),
      { method: 'GET' }
    );
  },

  async create(data: RoomData): Promise<any> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.ROOMS.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  },

  async update(id: string, data: Partial<RoomData>): Promise<any> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.ROOMS.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  },

  async delete(id: string): Promise<void> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.ROOMS.DELETE(id),
      { method: 'DELETE' },
      token
    );
  },
};

// ─────────────────────────────────────────────
// Itineraries Service
// ─────────────────────────────────────────────

export const itineraryService = {
  async getAll(): Promise<any[]> {
    return apiCall(
      API_ENDPOINTS.ITINERARIES.GET_ALL,
      { method: 'GET' }
    );
  },

  async getById(id: string): Promise<any> {
    return apiCall(
      API_ENDPOINTS.ITINERARIES.GET_BY_ID(id),
      { method: 'GET' }
    );
  },

  async create(data: CreateItineraryRequest): Promise<any> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.ITINERARIES.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  },

  async update(id: string, data: Partial<CreateItineraryRequest>): Promise<any> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.ITINERARIES.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  },

  async delete(id: string): Promise<void> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.ITINERARIES.DELETE(id),
      { method: 'DELETE' },
      token
    );
  },
};

// ─────────────────────────────────────────────
// Room Itineraries Service
// ─────────────────────────────────────────────

export const roomItineraryService = {
  async getByItineraryId(itineraryId: string): Promise<any[]> {
    return apiCall(
      API_ENDPOINTS.ROOM_ITINERARIES.GET_BY_ITINERARY(itineraryId),
      { method: 'GET' }
    );
  },

  async create(data: RoomItineraryData): Promise<any> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.ROOM_ITINERARIES.CREATE,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  },

  async update(id: string, data: Partial<RoomItineraryData>): Promise<any> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.ROOM_ITINERARIES.UPDATE(id),
      {
        method: 'PUT',
        body: JSON.stringify(data),
      },
      token
    );
  },

  async delete(id: string): Promise<void> {
    const token = getStoredToken();
    return apiCall(
      API_ENDPOINTS.ROOM_ITINERARIES.DELETE(id),
      { method: 'DELETE' },
      token
    );
  },
};

// ─────────────────────────────────────────────
// Pricing Service
// ─────────────────────────────────────────────

export const pricingService = {
  async getRecommendedPrice(data: PricingRecommendRequest): Promise<any> {
    return apiCall(
      API_ENDPOINTS.PRICING.GET_RECOMMENDED,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async getAvailability(data: AvailabilityRequest): Promise<any> {
    return apiCall(
      API_ENDPOINTS.PRICING.GET_AVAILABILITY,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async getAllAvailability(data: Omit<AvailabilityRequest, 'hotelName'>): Promise<any> {
    return apiCall(
      API_ENDPOINTS.PRICING.GET_ALL_AVAILABILITY,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },
};

// ─────────────────────────────────────────────
// Bookings Service
// ─────────────────────────────────────────────

export interface BookingRecord {
  id: number | string;
  hotelId?: number | string | null;
  roomId?: number | string | null;
  userId?: number | string | null;
  fromDate?: string | null;
  toDate?: string | null;
  totalAmount?: number | null;
  paymentMode?: string | null;
  transactionId?: string | null;
  specialRequest?: string | null;
  status?: string | null;
  created_at?: string | null;
  // Backend spreads `...row` so any extra columns (guest_name, guest_email,
  // check_in_date, etc.) come through too — typed loosely on purpose.
  [key: string]: unknown;
}

export interface BookingsResponse {
  bookings: BookingRecord[];
  count: number;
  scope?: 'admin' | 'user';
}

export const bookingService = {
  async getAll(): Promise<BookingsResponse> {
    const token = getStoredToken() || undefined;
    return apiCall<BookingsResponse>(
      API_ENDPOINTS.BOOKINGS.GET_ALL,
      { method: 'GET' },
      token
    );
  },

  async getByUser(): Promise<{ bookings: any[]; count: number }> {
    const token = getStoredToken();
    if (!token) throw new Error('Not authenticated');
    return apiCall(
      API_ENDPOINTS.BOOKINGS.GET_BY_USER,
      { method: 'POST', body: JSON.stringify({}) },
      token
    );
  },

  async bookRoom(data: BookingData): Promise<any> {
    const token = getStoredToken() || undefined;
    return apiCall(
      API_ENDPOINTS.BOOKINGS.BOOK_ROOM,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  },
};

// ─────────────────────────────────────────────
// Utility exports
// ─────────────────────────────────────────────

export default {
  auth: authService,
  hotels: hotelService,
  rooms: roomService,
  itineraries: itineraryService,
  roomItineraries: roomItineraryService,
  pricing: pricingService,
  bookings: bookingService,
};
