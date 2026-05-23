/**
 * Unified API Service
 * Handles all HTTP requests to the backend API
 */

import {
  API_BASE_URL,
  API_ENDPOINTS,
  PRICING_BASE_URL,
  PRICING_ENGINE_ENDPOINTS,
  getAuthHeaders,
  joinUrl,
  STORAGE_KEYS,
} from '../config/api';

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
  min_price?: number | null;
  max_price?: number | null;
  hotel_id?: number | null;
  description?: string | null;
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
  guestName?: string;
  guestFirstName?: string;
  guestLastName?: string;
  guests?: number;
  adults?: number;
  children?: number;
  currency?: string;
}

// Core fetch wrapper. `base` lets us point at either backend (/api) or
// pricing engine (/pricing) without duplicating error handling.
async function request<T = any>(
  base: string,
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const url = joinUrl(base, endpoint);
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

      console.error(`[api] ${options.method || 'GET'} ${url} failed:`, error);
      throw error;
    }

    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return {} as T;
    }

    return await response.json();
  } catch (error: any) {
    if (error.status) throw error;

    console.error(`[api] network error on ${url}:`, error);
    throw {
      message: error.message || 'Network error',
      status: 0,
    } as ApiError;
  }
}

async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  return request<T>(API_BASE_URL, endpoint, options, token);
}

async function pricingCall<T = any>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  return request<T>(PRICING_BASE_URL, endpoint, options);
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
    // The user object is no longer cached in localStorage — AuthContext owns
    // it in React state and re-fetches /me on every app boot. This keeps user
    // data (role, country, profile fields) always fresh and avoids stale
    // role caches sticking around after a server-side change.
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
      API_ENDPOINTS.AUTH.SEND_REGISTER_OTP,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  async verifyRegisterOtp(data: OtpVerifyRequest): Promise<{ otpVerifiedToken: string; message?: string }> {
    return apiCall(
      API_ENDPOINTS.AUTH.VERIFY_REGISTER_OTP,
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

    const user = response?.user ?? response;
    // No localStorage write here — AuthContext owns the in-memory user state.
    return user;
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

  async getById(
    id: string,
    params: { checkInDate?: string; checkOutDate?: string } = {},
  ): Promise<PublicHotel | null> {
    const qs = new URLSearchParams();
    if (params.checkInDate) qs.set('checkInDate', params.checkInDate);
    if (params.checkOutDate) qs.set('checkOutDate', params.checkOutDate);
    const query = qs.toString();
    const url = `${API_ENDPOINTS.HOTELS.GET_BY_ID(id)}${query ? `?${query}` : ''}`;
    try {
      const response = await apiCall<{ hotel: PublicHotel }>(url, { method: 'GET' });
      return response.hotel || null;
    } catch (err: any) {
      // Fallback: scan the public list if single endpoint not yet deployed
      if (err?.status === 404 || err?.status === 400) return null;
      const response = await this.getPublicHotels({ limit: 200, offset: 0 });
      return (response.hotels || []).find((h) => String(h.id) === String(id)) || null;
    }
  },

  async getAllRecommended(
    status = 'active',
    refresh = false,
    checkInDate?: string | null,
    checkOutDate?: string | null,
  ): Promise<any> {
    const query = new URLSearchParams({
      status,
      refresh: String(refresh),
    });
    // Forward the user's selected stay window — the v2 engine needs dates
    // to fetch live OTA anchors. Without them the engine falls back to the
    // analytical formula and live prices never engage.
    if (checkInDate) query.set('checkInDate', checkInDate);
    if (checkOutDate) query.set('checkOutDate', checkOutDate);

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
// Admin Service (admin-only routes)
// ─────────────────────────────────────────────

export interface AdminStats {
  totals: {
    hotels: number;
    rooms: number;
    bookings: number;
    revenue: number;
    payments: number;
  };
  usersByRole: { user: number; vendor: number; admin: number };
  perHotel: Array<{
    hotelId: number;
    hotelName: string;
    location: string;
    bookings: number;
    revenue: number;
  }>;
  recentBookings: Array<{
    id: number;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    status: string;
    userName?: string;
    userEmail?: string;
    hotelName?: string;
  }>;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phoneNumber?: string | null;
  role: 'user' | 'vendor' | 'admin';
  isAdmin: boolean;
  isManager: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminAnalytics {
  window: { days: number; generatedAt: string };
  bookingTrend: Array<{ date: string; bookings: number; revenue: number }>;
  revenueTrend: Array<{ date: string; direct: number; ota: number }>;
  topHotels: Array<{ hotelId: number; hotelName: string; location: string; bookings: number; revenue: number }>;
  bookingsByStatus: Array<{ status: string; count: number }>;
  usersByRole: { user: number; vendor: number; admin: number };
  revenueByDistrict: Array<{ district: string; bookings: number; revenue: number }>;
  avgBookingValue: { value: number; sampleSize: number };
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const token = getStoredToken() || undefined;
    return apiCall<AdminStats>(API_ENDPOINTS.ADMIN.STATS, { method: 'GET' }, token);
  },

  async getAnalytics(days = 30): Promise<AdminAnalytics> {
    const token = getStoredToken() || undefined;
    return apiCall<AdminAnalytics>(`${API_ENDPOINTS.ADMIN.ANALYTICS}?days=${days}`, { method: 'GET' }, token);
  },

  async getBookingsByCountry(): Promise<{
    total: number;
    countries: Array<{ country: string; bookings: number; revenue: number; share: number }>;
  }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.ADMIN.BOOKINGS_BY_COUNTRY, { method: 'GET' }, token);
  },

  async getUsersByCountry(): Promise<{
    total: number;
    countries: Array<{ country: string; users: number; share: number }>;
  }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.ADMIN.USERS_BY_COUNTRY, { method: 'GET' }, token);
  },

  async listUsers(params: { role?: 'user' | 'vendor' | 'admin'; search?: string } = {}): Promise<{ users: AdminUser[]; count: number }> {
    const token = getStoredToken() || undefined;
    const query = new URLSearchParams();
    if (params.role) query.set('role', params.role);
    if (params.search) query.set('search', params.search);
    const qs = query.toString();
    return apiCall(`${API_ENDPOINTS.ADMIN.USERS}${qs ? `?${qs}` : ''}`, { method: 'GET' }, token);
  },

  async createUser(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber?: string;
    role: 'user' | 'vendor' | 'admin';
  }): Promise<{ message: string; user: AdminUser }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.ADMIN.USERS, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  async updateUserRole(id: string | number, role: 'user' | 'vendor' | 'admin'): Promise<{ user: AdminUser }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.ADMIN.USER_ROLE(String(id)), {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }, token);
  },

  async deleteUser(id: string | number): Promise<{ message: string }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.ADMIN.USER_DELETE(String(id)), { method: 'DELETE' }, token);
  },

  async assignVendor(hotelId: string | number, vendorId: number | null): Promise<{ hotel: PublicHotel }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.ADMIN.ASSIGN_VENDOR(String(hotelId)), {
      method: 'PATCH',
      body: JSON.stringify({ vendorId }),
    }, token);
  },

  async updateRoomPrice(
    roomId: string | number,
    data: { basePrice?: number; minPrice?: number; maxPrice?: number },
  ): Promise<{ room: PublicHotelRoom }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.ADMIN.ROOM_PRICE(String(roomId)), {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  },

  async listGroupRequests(params: { status?: string; limit?: number } = {}): Promise<{
    requests: Array<{
      id: number;
      name: string;
      email: string;
      phone: string;
      destination: string | null;
      dates: string | null;
      groupSize: string | null;
      budget: string | null;
      groupType: string | null;
      notes: string | null;
      status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost' | 'archived';
      createdAt: string | null;
      updatedAt: string | null;
    }>;
    count: number;
  }> {
    const token = getStoredToken() || undefined;
    const qs = new URLSearchParams();
    if (params.status) qs.set('status', params.status);
    if (params.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiCall(`${API_ENDPOINTS.ADMIN.GROUP_REQUESTS}${q ? `?${q}` : ''}`, { method: 'GET' }, token);
  },

  async updateGroupRequestStatus(
    id: number,
    status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost' | 'archived',
  ): Promise<{ request: any }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.ADMIN.GROUP_REQUEST_STATUS(String(id)), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, token);
  },

  async listEmailLogs(params: { type?: string; status?: string; limit?: number } = {}): Promise<{
    logs: Array<{
      id: number;
      type: string;
      recipient: string;
      subject: string | null;
      status: 'sent' | 'logged' | 'failed' | 'skipped' | 'pending';
      providerId: string | null;
      errorMessage: string | null;
      createdAt: string | null;
    }>;
    count: number;
    resendConfigured: boolean;
  }> {
    const token = getStoredToken() || undefined;
    const qs = new URLSearchParams();
    if (params.type) qs.set('type', params.type);
    if (params.status) qs.set('status', params.status);
    if (params.limit) qs.set('limit', String(params.limit));
    const q = qs.toString();
    return apiCall(`${API_ENDPOINTS.ADMIN.EMAIL_LOGS}${q ? `?${q}` : ''}`, { method: 'GET' }, token);
  },
};

// ─────────────────────────────────────────────
// Vendor Service (vendor-only routes)
// ─────────────────────────────────────────────

export interface VendorHotel {
  id: number;
  name: string;
  location: string;
  address?: string | null;
  image?: string | null;
  totalRooms?: number | null;
  room_count: number;
}

export interface VendorRoom extends PublicHotelRoom {
  hotel_name?: string;
}

export const vendorService = {
  async getStats(): Promise<AdminStats> {
    const token = getStoredToken() || undefined;
    return apiCall<AdminStats>(API_ENDPOINTS.VENDOR.STATS, { method: 'GET' }, token);
  },

  async getAnalytics(days = 30): Promise<AdminAnalytics> {
    const token = getStoredToken() || undefined;
    return apiCall<AdminAnalytics>(`${API_ENDPOINTS.VENDOR.ANALYTICS}?days=${days}`, { method: 'GET' }, token);
  },

  async getMyHotels(): Promise<{ hotels: VendorHotel[]; count: number }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.VENDOR.HOTELS, { method: 'GET' }, token);
  },

  async getMyRooms(hotelId?: string | number): Promise<{ rooms: VendorRoom[]; count: number }> {
    const token = getStoredToken() || undefined;
    const qs = hotelId ? `?hotelId=${encodeURIComponent(String(hotelId))}` : '';
    return apiCall(`${API_ENDPOINTS.VENDOR.ROOMS}${qs}`, { method: 'GET' }, token);
  },

  async setRoomPriceBand(roomId: string | number, minPrice: number, maxPrice: number): Promise<{ room: VendorRoom }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.VENDOR.ROOM_PRICE_BAND(String(roomId)), {
      method: 'PATCH',
      body: JSON.stringify({ minPrice, maxPrice }),
    }, token);
  },

  async addRoom(data: {
    hotelId: number; name: string; category?: string; occupancyType?: string;
    maxGuests?: number; basePrice: number; minPrice?: number; maxPrice?: number;
    totalRooms?: number; image?: string | null;
  }): Promise<{ room: VendorRoom }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.VENDOR.ROOMS, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  async getBookings(): Promise<{
    bookings: Array<{
      id: number; user_id: number | null; room_id: number | null;
      check_in_date: string; check_out_date: string; total_price: number;
      status: string; special_request: string | null; created_at: string;
      user_name: string | null; user_email: string | null;
      room_name: string | null; room_category: string | null;
      hotel_id: number | null; hotel_name: string | null; hotel_location: string | null;
    }>;
    count: number;
  }> {
    const token = getStoredToken() || undefined;
    return apiCall(API_ENDPOINTS.VENDOR.BOOKINGS, { method: 'GET' }, token);
  },
};

// ─────────────────────────────────────────────
// Pricing Engine Service (direct calls to /pricing → port 5050)
// ─────────────────────────────────────────────

export interface PricingEngineQuoteRequest {
  hotelId: number | string;
  checkIn: string;
  checkOut: string;
  roomCategory?: string;
  guests?: number;
  rooms?: number;
  currency?: string;
  hotelName?: string;
  location?: string;
  district?: string;
  basePrice?: number;
  minPrice?: number;
  maxPrice?: number;
}

export const pricingEngineService = {
  async getPrice(data: PricingEngineQuoteRequest): Promise<any> {
    return pricingCall(PRICING_ENGINE_ENDPOINTS.PRICE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getPricesBatch(items: PricingEngineQuoteRequest[]): Promise<any> {
    return pricingCall(PRICING_ENGINE_ENDPOINTS.PRICES_BATCH, {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  },

  async getHealth(): Promise<any> {
    return pricingCall(PRICING_ENGINE_ENDPOINTS.HEALTH, { method: 'GET' });
  },
};

// ─────────────────────────────────────────────
// Centralized helpers — the names the rest of the app should reach for
// ─────────────────────────────────────────────

export async function getHotels(
  params: Parameters<typeof hotelService.getPublicHotels>[0] = {},
): Promise<PublicHotel[]> {
  const response = await hotelService.getPublicHotels(params);
  return Array.isArray(response.hotels) ? response.hotels : [];
}

export async function searchHotels(query: {
  q?: string;
  location?: string;
  checkInDate?: string;
  checkOutDate?: string;
  guests?: number;
}): Promise<PublicHotel[]> {
  const hotels = await getHotels({ limit: 200, offset: 0 });
  const needle = (query.q || query.location || '').trim().toLowerCase();
  if (!needle) return hotels;
  return hotels.filter((h) => {
    const name = (h.name || h.hotel_name || '').toLowerCase();
    const loc = (h.location || h.location_raw || '').toLowerCase();
    return name.includes(needle) || loc.includes(needle);
  });
}

export async function getPricing(data: PricingEngineQuoteRequest): Promise<any> {
  return pricingEngineService.getPrice(data);
}

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
  pricingEngine: pricingEngineService,
  bookings: bookingService,
  admin: adminService,
  vendor: vendorService,
  getHotels,
  searchHotels,
  getPricing,
};
