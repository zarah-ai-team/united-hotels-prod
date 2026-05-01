/**
 * Imports all hotels from hotels.json into the current live hotels table schema.
 * Run: node scripts/importHotels.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db');

const parseIntOrNull = (v) => {
  if (v == null || v === '') return null;
  const n = parseInt(String(v).replace(/\D/g, ''), 10);
  return Number.isNaN(n) ? null : n;
};

const parseFloatOr = (v, fallback = 0) => {
  if (v == null || v === '') return fallback;
  const n = parseFloat(String(v));
  return Number.isNaN(n) ? fallback : n;
};

const parseTime = (v) => {
  if (!v) return null;
  const match = String(v).trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hh = String(Math.min(23, Math.max(0, parseInt(match[1], 10)))).padStart(2, '0');
  const mm = String(Math.min(59, Math.max(0, parseInt(match[2], 10)))).padStart(2, '0');
  return `${hh}:${mm}:00`;
};

const normalizeAmenities = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : (item?.name || '').trim()))
      .filter(Boolean);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return normalizeAmenities(parsed);
    } catch {
      return value
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
};

const toDistrict = (locationRaw) => {
  if (!locationRaw) return null;
  const parts = String(locationRaw).split(',').map((p) => p.trim()).filter(Boolean);
  return parts.length > 1 ? parts[0] : null;
};

const normalizeRoomCategories = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const occupancyToMaxCount = (occupancyType) => {
  const key = String(occupancyType || '').toLowerCase();
  if (key === 'single') return 1;
  if (key === 'double' || key === 'single_double') return 2;
  if (key === 'triple') return 3;
  return 2;
};

async function upsertRoomsForHotel(client, hotelId, roomCategories = []) {
  const rows = normalizeRoomCategories(roomCategories)
    .map((rc, idx) => {
      const name = (rc.room_name || rc.name || `Room ${idx + 1}`).toString().trim();
      const type = (rc.room_category || rc.category || 'standard').toString().trim();
      const maxcount = parseIntOrNull(rc.max_count) || occupancyToMaxCount(rc.occupancy_type);
      const rentperday = parseFloatOr(rc.base_price ?? rc.price_per_night ?? rc.rentperday ?? 0, 0);
      const description = [rc.occupancy_code, rc.occupancy_type, rc.price_raw].filter(Boolean).join(' | ') || 'Imported from hotels.json';

      return {
        name,
        type,
        maxcount,
        rentperday,
        description,
      };
    })
    .filter((r) => r.name && r.rentperday >= 0);

  await client.query('DELETE FROM rooms WHERE hotel_id = $1', [hotelId]);

  const defaultPhone = 9000000000 + Number(hotelId || 0);

  for (const room of rows) {
    await client.query(
      `INSERT INTO rooms (
        name, maxcount, phonenumber, rentperday, imageurls, currentbookings,
        type, description, hotel_id, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, NOW(), NOW()
      )`,
      [
        room.name,
        room.maxcount,
        defaultPhone,
        room.rentperday,
        [],
        [],
        room.type,
        room.description,
        hotelId,
      ],
    );
  }
}

async function importHotels() {
  const hotelsPath = path.join(__dirname, '..', 'hotels.json');
  const hotels = JSON.parse(fs.readFileSync(hotelsPath, 'utf8'));

  console.log(`Found ${hotels.length} hotels to import.`);

  const client = await pool.connect();
  let imported = 0;
  let errors = 0;

  try {
    await client.query(`ALTER TABLE hotels
      ADD COLUMN IF NOT EXISTS hotel_link text,
      ADD COLUMN IF NOT EXISTS google_maps_link text,
      ADD COLUMN IF NOT EXISTS contact_name text,
      ADD COLUMN IF NOT EXISTS child_policy text,
      ADD COLUMN IF NOT EXISTS pet_policy text,
      ADD COLUMN IF NOT EXISTS smoking_policy text`);

    for (const hotel of hotels) {
      const name = (hotel.hotel_name || '').trim() || 'Unnamed Hotel';
      const location = (hotel.location_raw || '').trim() || 'Turkey';
      const district = toDistrict(hotel.location_raw);
      const address = location;
      const description = hotel.hotel_description || hotel.information_raw || null;
      const rating = parseFloatOr(hotel.star_rating, 4);
      const reviewCount = 0;
      const image = '';
      const amenities = normalizeAmenities(hotel.amenities);
      const totalRooms = parseIntOrNull(hotel.total_rooms);
      const contact = hotel.contact_phone || hotel.contact_raw || null;
      const contactName = hotel.contact_name || null;
      const email = hotel.email || null;
      const hotelLink = hotel.hotel_link || null;
      const googleMapsLink = hotel.google_maps_link || null;
      const childPolicy = hotel.child_policy || null;
      const petPolicy = hotel.pet_policy || null;
      const smokingPolicy = hotel.smoking_policy || null;
      const checkIn = parseTime(hotel.check_in_time);
      const checkOut = parseTime(hotel.check_out_time);

      try {
        await client.query('BEGIN');

        const existing = await client.query(
          'SELECT id FROM hotels WHERE name = $1 AND location = $2 LIMIT 1',
          [name, location],
        );

        let hotelId;
        if (existing.rows.length > 0) {
          hotelId = existing.rows[0].id;
          await client.query(
            `UPDATE hotels SET
              district = $2,
              address = $3,
              description = $4,
              rating = $5,
              "reviewCount" = $6,
              image = $7,
              amenities = $8,
              "totalRooms" = $9,
              contact = $10,
              email = $11,
              contact_name = $12,
              hotel_link = $13,
              google_maps_link = $14,
              child_policy = $15,
              pet_policy = $16,
              smoking_policy = $17,
              check_in_time = $18,
              check_out_time = $19,
              "updatedAt" = NOW()
             WHERE id = $1`,
            [hotelId, district, address, description, rating, reviewCount, image, amenities, totalRooms, contact, email, contactName, hotelLink, googleMapsLink, childPolicy, petPolicy, smokingPolicy, checkIn, checkOut],
          );
          console.log(`  ↻ Updated: ${name}`);
        } else {
          const inserted = await client.query(
            `INSERT INTO hotels (
              name, location, district, address, description,
              rating, "reviewCount", image, amenities, "totalRooms",
              contact, email, contact_name, hotel_link, google_maps_link,
              child_policy, pet_policy, smoking_policy,
              check_in_time, check_out_time,
              "createdAt", "updatedAt"
            ) VALUES (
              $1, $2, $3, $4, $5,
              $6, $7, $8, $9, $10,
              $11, $12, $13, $14, $15,
              $16, $17, $18,
              $19, $20,
              NOW(), NOW()
            ) RETURNING id`,
            [name, location, district, address, description, rating, reviewCount, image, amenities, totalRooms, contact, email, contactName, hotelLink, googleMapsLink, childPolicy, petPolicy, smokingPolicy, checkIn, checkOut],
          );
          hotelId = inserted.rows[0].id;
          console.log(`  ✓ Inserted: ${name}`);
        }

        await upsertRoomsForHotel(client, hotelId, hotel.room_categories);

        await client.query('COMMIT');
        imported++;
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`  ✗ Failed: ${name} -> ${e.message}`);
        errors++;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n═══════════════════════════════');
  console.log(`Import complete:`);
  console.log(`  ✓ Imported/updated: ${imported}`);
  console.log(`  ✗ Errors:           ${errors}`);
  console.log('═══════════════════════════════');

  process.exit(errors > 0 ? 1 : 0);
}

importHotels().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
