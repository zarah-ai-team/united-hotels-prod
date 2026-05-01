/**
 * One-shot Neon migration + seed.
 *   • Adds role/vendor/price-band columns required by the new RBAC + vendor pricing.
 *   • Loads `frontendHotels.json` into the hotels table.
 *   • Generates realistic Standard/Superior/Deluxe rooms per hotel with
 *     min/max price bands derived from the hotel's location tier.
 *
 * Idempotent — safe to run repeatedly.
 *
 *   $ node scripts/seedNeon.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('../db');

const IMAGEKIT_BASE = 'https://ik.imagekit.io/UnitedHotels/hotels';

// Three room tiers per hotel. Prices are USD bands; TRY conversion happens
// downstream via the pricing engine.
const ROOM_TEMPLATES = [
  {
    suffix: 'standard',
    name: 'Standard Room',
    category: 'standard',
    occupancyType: 'double',
    bedType: 'Double Bed',
    size: '18 m²',
    maxGuests: 2,
    pictureIndex: 2,
    description: 'Cozy room with modern furnishings and all essentials for a comfortable stay.',
    amenities: ['Free WiFi', 'Air Conditioning', 'Minibar', 'Safe', 'Flat-screen TV'],
    basePriceUsd: 75,
    minBandPct: 0.85,
    maxBandPct: 1.30,
  },
  {
    suffix: 'superior',
    name: 'Superior Room',
    category: 'superior',
    occupancyType: 'double',
    bedType: 'Queen Bed',
    size: '22 m²',
    maxGuests: 2,
    pictureIndex: 3,
    description: 'Spacious room with upgraded décor and partial city or sea views from the upper floors.',
    amenities: ['Free WiFi', 'Air Conditioning', 'Minibar', 'Safe', 'Flat-screen TV', 'City View'],
    basePriceUsd: 100,
    minBandPct: 0.85,
    maxBandPct: 1.30,
  },
  {
    suffix: 'deluxe',
    name: 'Deluxe Room',
    category: 'deluxe',
    occupancyType: 'double',
    bedType: 'King Bed',
    size: '26 m²',
    maxGuests: 2,
    pictureIndex: 2,
    description: 'Premium room with the best views, generous space, and luxury amenities for a memorable stay.',
    amenities: [
      'Free WiFi', 'Air Conditioning', 'Minibar', 'Safe', 'Flat-screen TV',
      'Premium View', 'Bathrobe & Slippers',
    ],
    basePriceUsd: 130,
    minBandPct: 0.85,
    maxBandPct: 1.35,
  },
];

// Coarse location-tier multiplier — Sultanahmet/Sirkeci/Karaköy are premium,
// outer Beyoğlu cheaper. Keeps seed prices closer to real Istanbul rates than
// flat 75/100/130 across the board.
const LOCATION_TIER_MULTIPLIER = (locationRaw = '') => {
  const loc = String(locationRaw).toLowerCase();
  if (loc.includes('sultanahmet') || loc.includes('cankurtaran')) return 1.15;
  if (loc.includes('galata')) return 1.20;
  if (loc.includes('karaköy') || loc.includes('karakoy')) return 1.10;
  if (loc.includes('sirkeci')) return 1.00;
  if (loc.includes('beyoğlu') || loc.includes('beyoglu') || loc.includes('pera')) return 0.95;
  return 1.00;
};

const round2 = (n) => Number(Number(n).toFixed(2));

const buildRoomsForHotel = (hotel) => {
  const tierMul = LOCATION_TIER_MULTIPLIER(hotel.location);
  return ROOM_TEMPLATES.map((tpl) => {
    const basePrice = round2(tpl.basePriceUsd * tierMul);
    const minPrice = round2(basePrice * tpl.minBandPct);
    const maxPrice = round2(basePrice * tpl.maxBandPct);
    return {
      name: tpl.name,
      category: tpl.category,
      occupancy_type: tpl.occupancyType,
      max_count: tpl.maxGuests,
      base_price: basePrice,
      min_price: minPrice,
      max_price: maxPrice,
      description: `${tpl.bedType} • ${tpl.size} • ${tpl.amenities.join(', ')} — ${tpl.description}`,
      image: `${IMAGEKIT_BASE}/${hotel.id}/picture-${tpl.pictureIndex}.png`,
      total_rooms: Math.max(1, Math.floor((hotel.totalRooms || 30) / ROOM_TEMPLATES.length)),
    };
  });
};

async function applyMigration(client) {
  await client.query(`
    ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS phonenumber text;
  `);

  // Normalise legacy role values: anything not in the new enum becomes 'user'.
  await client.query(`
    UPDATE users
    SET role = CASE
      WHEN "isAdmin" IS TRUE THEN 'admin'
      WHEN role IN ('vendor', 'admin', 'user') THEN role
      WHEN role IN ('hotel_manager', 'manager', 'super_admin') THEN
        CASE WHEN "isAdmin" IS TRUE THEN 'admin' ELSE 'vendor' END
      ELSE 'user'
    END
    WHERE role IS NULL OR role NOT IN ('user', 'vendor', 'admin');
  `).catch(() => { /* "isAdmin" column may not exist on minimal schemas */ });

  await client.query(`
    ALTER TABLE hotels
      ADD COLUMN IF NOT EXISTS name text,
      ADD COLUMN IF NOT EXISTS location text,
      ADD COLUMN IF NOT EXISTS district text,
      ADD COLUMN IF NOT EXISTS address text,
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS rating numeric,
      ADD COLUMN IF NOT EXISTS "reviewCount" integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS image text,
      ADD COLUMN IF NOT EXISTS amenities text[],
      ADD COLUMN IF NOT EXISTS "totalRooms" integer,
      ADD COLUMN IF NOT EXISTS contact text,
      ADD COLUMN IF NOT EXISTS email text,
      ADD COLUMN IF NOT EXISTS contact_name text,
      ADD COLUMN IF NOT EXISTS vendor_id integer REFERENCES users(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS slug text,
      ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
      ADD COLUMN IF NOT EXISTS "createdAt" timestamptz NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS "updatedAt" timestamptz NOT NULL DEFAULT NOW();
  `);

  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_hotels_slug_unique ON hotels (slug) WHERE slug IS NOT NULL;`);

  await client.query(`
    ALTER TABLE rooms
      ADD COLUMN IF NOT EXISTS name text,
      ADD COLUMN IF NOT EXISTS category text,
      ADD COLUMN IF NOT EXISTS occupancy_type text,
      ADD COLUMN IF NOT EXISTS max_count integer DEFAULT 2,
      ADD COLUMN IF NOT EXISTS total_rooms integer DEFAULT 1,
      ADD COLUMN IF NOT EXISTS available_rooms integer DEFAULT 1,
      ADD COLUMN IF NOT EXISTS price_per_night numeric(12,2) DEFAULT 0,
      ADD COLUMN IF NOT EXISTS min_price numeric(12,2),
      ADD COLUMN IF NOT EXISTS max_price numeric(12,2),
      ADD COLUMN IF NOT EXISTS currency_code char(3) DEFAULT 'USD',
      ADD COLUMN IF NOT EXISTS description text,
      ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS hotel_id integer REFERENCES hotels(id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS room_number text,
      ADD COLUMN IF NOT EXISTS is_available boolean DEFAULT true,
      ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT NOW(),
      ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT NOW();
  `);

  console.log('✓ Migration applied (idempotent)');
}

async function upsertHotel(client, hotel) {
  const existing = await client.query('SELECT id FROM hotels WHERE slug = $1 LIMIT 1', [hotel.id]);

  const params = [
    hotel.name,
    hotel.location,
    hotel.district || null,
    hotel.address || null,
    hotel.description || null,
    Number.isFinite(hotel.rating) ? hotel.rating : 4,
    Number.isFinite(hotel.reviewCount) ? hotel.reviewCount : 250,
    `${IMAGEKIT_BASE}/${hotel.id}/picture-1.png`,
    hotel.amenities || [
      'Free WiFi', 'Breakfast', 'Air Conditioning',
      '24/7 Front Desk', 'Room Service', 'Laundry Service',
    ],
    Number.isFinite(hotel.totalRooms) ? hotel.totalRooms : null,
    hotel.contact || null,
    hotel.email || null,
    hotel.contactPerson || null,
    hotel.id, // slug
  ];

  if (existing.rowCount > 0) {
    const id = existing.rows[0].id;
    await client.query(
      `UPDATE hotels SET
        name = $1, location = $2, district = $3, address = $4, description = $5,
        rating = $6, "reviewCount" = $7, image = $8, amenities = $9,
        "totalRooms" = $10, contact = $11, email = $12, contact_name = $13, slug = $14,
        "updatedAt" = NOW()
       WHERE id = $15`,
      [...params, id]
    );
    return { id, action: 'updated' };
  }

  const inserted = await client.query(
    `INSERT INTO hotels (
      name, location, district, address, description,
      rating, "reviewCount", image, amenities, "totalRooms",
      contact, email, contact_name, slug,
      "createdAt", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
      NOW(), NOW()
    ) RETURNING id`,
    params,
  );
  return { id: inserted.rows[0].id, action: 'inserted' };
}

async function ensureRoomsLegacyColumnsRelaxed(client) {
  // The Neon `rooms` table was originally created by scripts/importHotels.js
  // with several NOT NULL legacy columns. Relax those so the modern seed
  // (which only populates the new columns) doesn't trip the constraints.
  for (const col of ['maxcount', 'phonenumber', 'rentperday', 'imageurls', 'currentbookings', 'type', 'description', 'createdAt', 'updatedAt']) {
    await client.query(`ALTER TABLE rooms ALTER COLUMN "${col}" DROP NOT NULL`).catch(() => { /* column missing or already nullable */ });
  }
}

async function upsertRoomsForHotel(client, hotelId, rooms) {
  await client.query('DELETE FROM rooms WHERE hotel_id = $1', [hotelId]);
  for (const room of rooms) {
    await client.query(
      `INSERT INTO rooms (
        hotel_id, name, category, occupancy_type, max_count,
        total_rooms, available_rooms, price_per_night,
        min_price, max_price, currency_code, description, images, room_number, is_available,
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'USD', $11, $12::jsonb, $13, true,
        NOW(), NOW()
      )`,
      [
        hotelId,
        room.name,
        room.category,
        room.occupancy_type,
        room.max_count,
        room.total_rooms,
        room.total_rooms,
        room.base_price,
        room.min_price,
        room.max_price,
        room.description,
        JSON.stringify([room.image]),
        room.name,
      ],
    );
  }
}

async function seedNeon() {
  const dataPath = path.join(__dirname, '..', 'frontendHotels.json');
  const hotels = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Seeding ${hotels.length} hotels into Neon…`);

  const client = await pool.connect();
  let inserted = 0;
  let updated = 0;
  let errors = 0;

  try {
    await applyMigration(client);
    await ensureRoomsLegacyColumnsRelaxed(client);

    // Clean slate: drop all existing hotels (and their rooms via ON DELETE CASCADE)
    // and any auxiliary join rows so we re-seed exactly the 39 hotels in JSON.
    await client.query(`DELETE FROM hotel_amenities`).catch(() => {});
    await client.query(`DELETE FROM hotel_room_categories`).catch(() => {});
    await client.query(`DELETE FROM rooms`).catch(() => {});
    await client.query(`DELETE FROM hotels`);
    console.log('✓ Cleared existing hotels/rooms before reseed');

    for (const hotel of hotels) {
      try {
        await client.query('BEGIN');
        const { id: hotelId, action } = await upsertHotel(client, hotel);
        await upsertRoomsForHotel(client, hotelId, buildRoomsForHotel(hotel));
        await client.query('COMMIT');
        if (action === 'inserted') inserted++;
        else updated++;
        console.log(`  ${action === 'inserted' ? '✓' : '↻'} ${hotel.name} (id=${hotelId})`);
      } catch (e) {
        await client.query('ROLLBACK');
        console.error(`  ✗ ${hotel.name} → ${e.message}`);
        errors++;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }

  console.log('\n═══════════════════════════════');
  console.log(`Seed complete:  ✓ inserted: ${inserted}   ↻ updated: ${updated}   ✗ errors: ${errors}`);
  console.log('═══════════════════════════════');
  process.exit(errors > 0 ? 1 : 0);
}

seedNeon().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
