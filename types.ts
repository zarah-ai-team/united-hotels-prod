export type RoomCategory =
  | 'economy'
  | 'standard'
  | 'deluxe'
  | 'superior'
  | 'executive'
  | 'classic'
  | 'suite'
  | 'queen'
  | 'twin'
  | 'french'
  | 'city_view'
  | 'sea_view'
  | 'small_single'
  | 'unknown';

export type OccupancyType = 'single' | 'double' | 'single_double' | 'triple' | 'unknown';

export interface Hotel {
  id: number;
  hotel_name: string;
  information_raw: string | null;
  total_rooms: number | null;
  contact_raw: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  location_raw: string;
  email: string | null;
  hotel_link: string | null;
  star_rating: number | null;
  property_label_raw: string | null;
  hotel_description: string | null;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_out_raw: string | null;
  child_policy: string | null;
  pet_policy: string | null;
  smoking_policy: string | null;
  google_maps_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface HotelRoomCategory {
  id: number;
  hotel_id: number;
  room_name: string;
  room_category: RoomCategory | null;
  occupancy_code: string | null;
  occupancy_type: OccupancyType;
  base_price: number | null;
  currency_code: string;
  price_raw: string | null;
  created_at: string;
  updated_at: string;
}

export interface AmenityType {
  id: number;
  name: string;
}

export interface HotelAmenity {
  hotel_id: number;
  amenity_type_id: number;
}

export interface HotelAdminUpsertDto {
  hotel_name: string;
  information_raw?: string | null;
  total_rooms?: number | null;
  contact_raw?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  location_raw: string;
  email?: string | null;
  hotel_link?: string | null;
  star_rating?: number | null;
  property_label_raw?: string | null;
  hotel_description?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  check_in_out_raw?: string | null;
  child_policy?: string | null;
  pet_policy?: string | null;
  smoking_policy?: string | null;
  google_maps_link?: string | null;
}

export interface HotelRoomCategoryUpsertDto {
  hotel_id: number;
  room_name: string;
  room_category?: RoomCategory | null;
  occupancy_code?: string | null;
  occupancy_type?: OccupancyType;
  base_price?: number | null;
  currency_code?: string;
  price_raw?: string | null;
}

export interface AmenityTypeUpsertDto {
  name: string;
}

export interface HotelAmenityUpsertDto {
  hotel_id: number;
  amenity_type_id: number;
}
