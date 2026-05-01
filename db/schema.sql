-- Production-ready PostgreSQL schema for hotel admin/backend import workflow
-- Source workbook: HOTEL-INFORMATIONS-ENGLISH-2026.xlsx

BEGIN;

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS hotels (
  id bigserial PRIMARY KEY,
  hotel_name text NOT NULL,
  information_raw text,
  total_rooms integer,
  contact_raw text,
  contact_name text,
  contact_phone text,
  location_raw text NOT NULL,
  email text,
  hotel_link text,
  star_rating smallint,
  property_label_raw text,
  hotel_description text,
  check_in_time time,
  check_out_time time,
  check_in_out_raw text,
  child_policy text,
  pet_policy text,
  smoking_policy text,
  google_maps_link text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hotels_star_rating_check CHECK (star_rating BETWEEN 1 AND 5 OR star_rating IS NULL),
  CONSTRAINT hotels_total_rooms_check CHECK (total_rooms IS NULL OR total_rooms >= 0)
);

COMMENT ON TABLE hotels IS 'Normalized hotel-level fields imported from workbook sheets.';
COMMENT ON COLUMN hotels.information_raw IS 'Original INFORMATION column text when room count parsing is unreliable.';
COMMENT ON COLUMN hotels.total_rooms IS 'Parsed integer room count when INFORMATION begins with a safe room count.';
COMMENT ON COLUMN hotels.contact_raw IS 'Original CONTACT text before extracting phone and optional contact name.';
COMMENT ON COLUMN hotels.property_label_raw IS 'Original STAR RATINGS label when the source contains mixed text and numeric labels.';
COMMENT ON COLUMN hotels.check_in_out_raw IS 'Original CHECK IN AND CHECK OUT cell text for audit and reparsing.';
COMMENT ON COLUMN hotels.google_maps_link IS 'Joined from the Google Map Links sheet by hotel name.';

CREATE INDEX IF NOT EXISTS idx_hotels_hotel_name ON hotels (hotel_name);
CREATE INDEX IF NOT EXISTS idx_hotels_star_rating ON hotels (star_rating);

CREATE TABLE IF NOT EXISTS hotel_room_categories (
  id bigserial PRIMARY KEY,
  hotel_id bigint NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_name text NOT NULL,
  room_category text,
  occupancy_code text,
  occupancy_type text NOT NULL DEFAULT 'unknown',
  base_price numeric(12,2),
  currency_code char(3) NOT NULL DEFAULT 'TRY',
  price_raw text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hotel_room_categories_room_category_check CHECK (
    room_category IN (
      'economy', 'standard', 'deluxe', 'superior', 'executive', 'classic', 'suite',
      'queen', 'twin', 'french', 'city_view', 'sea_view', 'small_single', 'unknown'
    ) OR room_category IS NULL
  ),
  CONSTRAINT hotel_room_categories_occupancy_type_check CHECK (
    occupancy_type IN ('single', 'double', 'single_double', 'triple', 'unknown')
  ),
  CONSTRAINT hotel_room_categories_base_price_check CHECK (base_price IS NULL OR base_price >= 0)
);

COMMENT ON TABLE hotel_room_categories IS 'One hotel can have multiple imported room labels, price variants, and occupancy mappings.';
COMMENT ON COLUMN hotel_room_categories.room_name IS 'Exact human-facing room label from ROOM TYPES.';
COMMENT ON COLUMN hotel_room_categories.price_raw IS 'Original PRICES cell text prior to structured parsing.';
COMMENT ON COLUMN hotel_room_categories.occupancy_code IS 'Extracted code such as DBL-SNG or TRP.';

CREATE INDEX IF NOT EXISTS idx_hotel_room_categories_hotel_id ON hotel_room_categories (hotel_id);
CREATE INDEX IF NOT EXISTS idx_hotel_room_categories_base_price ON hotel_room_categories (base_price);

CREATE TABLE IF NOT EXISTS amenity_types (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE
);

COMMENT ON TABLE amenity_types IS 'Canonical amenity lookup table for filterable hotel amenities.';

CREATE TABLE IF NOT EXISTS hotel_amenities (
  hotel_id bigint NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  amenity_type_id bigint NOT NULL REFERENCES amenity_types(id) ON DELETE RESTRICT,
  PRIMARY KEY (hotel_id, amenity_type_id)
);

COMMENT ON TABLE hotel_amenities IS 'Join table between hotels and amenity types.';

DROP TRIGGER IF EXISTS trg_hotels_set_updated_at ON hotels;
CREATE TRIGGER trg_hotels_set_updated_at
BEFORE UPDATE ON hotels
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_hotel_room_categories_set_updated_at ON hotel_room_categories;
CREATE TRIGGER trg_hotel_room_categories_set_updated_at
BEFORE UPDATE ON hotel_room_categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

COMMIT;
