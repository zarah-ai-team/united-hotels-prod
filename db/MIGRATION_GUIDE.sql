-- Migration Guide: From Old Hotel Schema to New JSONB Schema

-- STEP 1: Create backup of old hotels data
CREATE TABLE hotels_backup AS SELECT * FROM hotels;

-- STEP 2: Create new hotels table with JSONB structure
CREATE TABLE hotels_new (
  id SERIAL PRIMARY KEY,
  hotel_id TEXT UNIQUE NOT NULL,
  data JSONB NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('active', 'draft', 'inactive')),
  manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- STEP 3: Create indexes
CREATE INDEX idx_hotels_new_hotel_id ON hotels_new(hotel_id);
CREATE INDEX idx_hotels_new_status ON hotels_new(status);
CREATE INDEX idx_hotels_new_manager_id ON hotels_new(manager_id);

-- STEP 4: Migrate existing hotels data
INSERT INTO hotels_new (hotel_id, data, status, manager_id, created_at, updated_at)
SELECT 
  'hotel_' || COALESCE(slug(name), 'unknown_' || id::text),
  jsonb_build_object(
    'hotelId', 'hotel_' || COALESCE(slug(name), 'unknown_' || id::text),
    'name', jsonb_build_object(
      'displayName', COALESCE(name, 'Hotel ' || id::text),
      'canonicalName', lower(replace(replace(COALESCE(name, 'Hotel'), ' ', '_'), '-', '_')),
      'sourceNames', jsonb_build_array(COALESCE(name, 'Hotel ' || id::text))
    ),
    'status', 'active',
    'basicInfo', jsonb_build_object(
      'starRating', NULL::numeric,
      'propertyType', 'hotel',
      'descriptionShort', NULL,
      'descriptionLong', COALESCE(description, NULL),
      'totalRooms', COALESCE(total_rooms, NULL)
    ),
    'location', jsonb_build_object(
      'addressText', COALESCE(address, ''),
      'street', NULL,
      'area', NULL,
      'district', NULL,
      'city', NULL,
      'postalCode', NULL,
      'country', 'Turkey',
      'coordinates', NULL,
      'googleMapsUrl', NULL
    ),
    'contacts', jsonb_build_object(
      'primaryContactName', COALESCE(contact_name, NULL),
      'primaryPhone', COALESCE(contact_phone, NULL),
      'secondaryPhones', '[]'::jsonb,
      'email', COALESCE(contact_email, NULL),
      'websiteUrl', NULL
    ),
    'checkInOut', jsonb_build_object(
      'checkInTime', NULL,
      'checkOutTime', NULL,
      'notes', NULL,
      'rawText', NULL
    ),
    'amenities', '[]'::jsonb,
    'roomTypes', '[]'::jsonb,
    'ratePlans', '[]'::jsonb,
    'policies', jsonb_build_object(
      'childPolicy', '{}'::jsonb,
      'petPolicy', '{}'::jsonb,
      'smokingPolicy', '{}'::jsonb
    ),
    'media', jsonb_build_object(
      'coverImageUrl', NULL,
      'gallery', '[]'::jsonb
    ),
    'bookingConfig', jsonb_build_object(
      'instantBookEnabled', false,
      'minStayNights', NULL,
      'maxStayNights', NULL,
      'cancellationPolicyText', NULL
    ),
    'source', jsonb_build_object(
      'fileName', 'legacy_migration',
      'sheetRefs', jsonb_build_array('migration'),
      'lastImportedAt', NOW()::text,
      'rawRowData', '{}'::jsonb
    ),
    'audit', jsonb_build_object(
      'createdAt', created_at::text,
      'updatedAt', updated_at::text
    )
  ),
  'active',
  manager_id,
  created_at,
  updated_at
FROM hotels;

-- STEP 5: Helper function to create URL-friendly slug
CREATE OR REPLACE FUNCTION slug(input TEXT)
RETURNS TEXT AS $$
  SELECT LOWER(
    TRIM(
      REGEXP_REPLACE(
        REGEXP_REPLACE(input, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '_', 'g'
      )
    )
  );
$$ LANGUAGE SQL;

-- STEP 6: Verify migration
SELECT 
  COUNT(*) as old_count,
  (SELECT COUNT(*) FROM hotels_new) as new_count
FROM hotels;

-- STEP 7: Drop old table and rename new one
-- (Run only after verifying migration is correct)
-- DROP TABLE IF EXISTS hotels CASCADE;
-- ALTER TABLE hotels_new RENAME TO hotels;

-- STEP 8: Check for any duplicate hotel_ids
SELECT hotel_id, COUNT(*) as count
FROM hotels_new
GROUP BY hotel_id
HAVING COUNT(*) > 1;

-- STEP 9: Verify data integrity
SELECT 
  COUNT(*) as total_hotels,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN status = 'draft' THEN 1 END) as draft,
  COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive
FROM hotels_new;

-- STEP 10: Sample query to view migrated data
SELECT 
  id,
  hotel_id,
  data->>'hotelId' as hotel_id_from_data,
  data->'name'->>'displayName' as hotel_name,
  data->'location'->>'addressText' as address,
  status,
  created_at
FROM hotels_new
LIMIT 5;
