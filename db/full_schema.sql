-- ============================================================================
-- United Hotels — full portable schema (any PostgreSQL: Supabase, Neon, RDS…).
--
-- Recreates every table the app uses, matching the LIVE column layout. Run this
-- ONCE on a fresh database, then seed the hotel/room data:
--
--   1) psql "$DATABASE_URL" -f db/full_schema.sql        (or paste into Supabase SQL editor)
--   2) node scripts/seedNeon.js                          (loads 39 hotels + rooms from frontendHotels.json)
--   3) node scripts/initBlog.js                          (blog tables)  — or run db/blog_schema.sql
--
-- NOTE: this creates the STRUCTURE + (via the seed) hotel/room content. It does
-- NOT contain your existing users, bookings, or blog posts — that data lives only
-- in the Neon database and can only be extracted with pg_dump once Neon is
-- reachable again. After seeding, register an admin via the app and promote it:
--   UPDATE users SET role='admin', "isAdmin"=true WHERE email='you@domain.com';
-- The app also self-heals: many columns are added at runtime via ADD COLUMN IF
-- NOT EXISTS, so small differences here are tolerated.
-- ============================================================================

-- ── users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            serial PRIMARY KEY,
  name          text,
  email         text NOT NULL UNIQUE,
  password      text NOT NULL,
  "phoneNumber" text,
  phonenumber   text,
  "isAdmin"     boolean DEFAULT false,
  "isManager"   boolean DEFAULT false,
  role          text NOT NULL DEFAULT 'user',
  country       text,
  "createdAt"   timestamptz NOT NULL DEFAULT now(),
  "updatedAt"   timestamptz NOT NULL DEFAULT now()
);

-- ── hotels ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS hotels (
  id                  serial PRIMARY KEY,
  name                text,
  location            text,
  district            text,
  address             text,
  description         text,
  rating              numeric,
  "reviewCount"       integer DEFAULT 0,
  image               text,
  amenities           text[],
  "totalRooms"        integer,
  contact             text,
  contact_name        text,
  email               text,
  vendor_id           integer REFERENCES users(id) ON DELETE SET NULL,
  slug                text,
  status              text NOT NULL DEFAULT 'active',
  check_in_time       time,
  check_out_time      time,
  pet_policy          text,
  smoking_policy      text,
  child_policy        text,
  cancellation_policy text,
  hotel_link          text,
  google_maps_link    text,
  "createdAt"         timestamptz NOT NULL DEFAULT now(),
  "updatedAt"         timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_hotels_slug_unique ON hotels (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_hotels_status ON hotels (status);

-- ── rooms ────────────────────────────────────────────────────────────────────
-- Keeps both the modern columns (name/price_per_night/…) and the legacy ones
-- (rentperday/maxcount/imageurls/…) so all read paths in the app resolve.
CREATE TABLE IF NOT EXISTS rooms (
  id              serial PRIMARY KEY,
  hotel_id        integer REFERENCES hotels(id) ON DELETE CASCADE,
  name            text,
  category        text,
  occupancy_type  text,
  type            text,
  max_count       integer DEFAULT 2,
  maxcount        integer,
  total_rooms     integer DEFAULT 1,
  available_rooms integer DEFAULT 1,
  price_per_night numeric(12,2) DEFAULT 0,
  rentperday      numeric(12,2),
  min_price       numeric(12,2),
  max_price       numeric(12,2),
  currency_code   char(3) DEFAULT 'USD',
  description     text,
  images          jsonb DEFAULT '[]'::jsonb,
  imageurls       jsonb DEFAULT '[]'::jsonb,
  currentbookings jsonb DEFAULT '[]'::jsonb,
  phonenumber     text,
  room_number     text,
  is_available    boolean DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  "createdAt"     timestamptz DEFAULT now(),
  "updatedAt"     timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rooms_hotel_id ON rooms (hotel_id);

-- ── bookings ─────────────────────────────────────────────────────────────────
-- roomid is stored as text (the app joins b.roomid = rooms.id::text).
CREATE TABLE IF NOT EXISTS bookings (
  id              serial PRIMARY KEY,
  userid          integer,
  hotelid         integer,
  roomid          text,
  room            text,
  guest_name      text,
  guest_email     text,
  guest_phone     text,
  guests          integer,
  adults          integer,
  children        integer,
  booked_rooms    integer DEFAULT 1,
  fromdate        date,
  todate          date,
  totaldays       integer,
  totalamount     numeric(12,2),
  currency        text DEFAULT 'USD',
  payment_mode    text,
  special_request text,
  "transactionId" text,
  status          text DEFAULT 'booked',
  country         text,
  "createdAt"     timestamptz NOT NULL DEFAULT now(),
  "updatedAt"     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_bookings_userid ON bookings (userid);
CREATE INDEX IF NOT EXISTS idx_bookings_hotelid ON bookings (hotelid);

-- ── payments ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id             serial PRIMARY KEY,
  user_id        integer,
  booking_id     integer REFERENCES bookings(id) ON DELETE CASCADE,
  amount         numeric(12,2) NOT NULL DEFAULT 0,
  currency       text DEFAULT 'USD',
  method         text,
  payment_mode   text,
  transaction_id text,
  status         text NOT NULL DEFAULT 'paid',
  metadata       jsonb DEFAULT '{}'::jsonb,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments (transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments (booking_id);

-- ── group_requests ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS group_requests (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  email       text NOT NULL,
  phone       text NOT NULL,
  destination text,
  dates       text,
  group_size  text,
  budget      text,
  group_type  text,
  notes       text,
  status      text NOT NULL DEFAULT 'new',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Blog tables live in db/blog_schema.sql — run that too, or `node scripts/initBlog.js`.
