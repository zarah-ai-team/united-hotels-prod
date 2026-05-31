/**
 * seedCancellationPolicies.js
 *
 * 1. Adds a `cancellation_policy` TEXT column to the `hotels` table (idempotent).
 * 2. Populates each hotel's cancellation policy, matched by name.
 *
 * Safe by design:
 *   - ADD COLUMN IF NOT EXISTS — never drops or rewrites the table.
 *   - Only UPDATEs rows whose policy is NULL/empty or has changed.
 *   - Matches by normalized name; any hotel not in the map is left untouched
 *     and reported, and any policy key that matched no hotel is reported too,
 *     so nothing fails silently.
 *
 * Usage (run from the project root, where .env with DATABASE_URL lives):
 *   node scripts/seedCancellationPolicies.js          # apply
 *   node scripts/seedCancellationPolicies.js --dry     # preview, no writes
 */

require('dotenv').config();
const pool = require('../db');

const DRY_RUN = process.argv.includes('--dry');

// Normalize a hotel name to a comparison key: lowercase, strip everything that
// isn't a letter/digit. "Ramada TRYP Beyoğlu" → "ramadatrypbeyoğlu". Keeps
// Turkish letters as-is (they're consistent across both sides).
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9çğıöşü]/gi, '');

// Policy text keyed by the hotel's exact name as stored in the DB. The three
// Wings and three Weingart properties intentionally share their group policy.
const POLICIES = {
  'Royan Hotel': "Free cancellation up to 48 hours before arrival. Cancellations made within 48 hours are charged the first night's stay.",
  'Amiral Palace': 'Free cancellation up to 24–48 hours before check-in. Generally flexible for individual travelers.',
  'Best Point Hotel': "Typically requires 48 hours' notice for free cancellation, due to high demand as a boutique property.",
  'Ağan Hotel': 'One of the more flexible options — free cancellation up to 24 hours before arrival.',
  'Sirkeci Golden Horn': 'Free cancellation until 48 hours before the check-in date.',
  'Erboy Hotel': 'Free cancellation until 24 to 48 hours before arrival.',
  'Sirkeci Park Hotel': 'Free cancellation usually allowed up to 24 hours before the arrival date.',
  'Triton Hotel': "As a small boutique hotel, at least 48 hours' notice is required for a full refund.",
  'Hotel Romantic': 'Free cancellation generally available until 48 hours before arrival.',
  'Avicenna Hotel': 'Free cancellation up to 48 hours before the scheduled check-in.',
  'Sumengen Hotel': 'Due to its sea-view popularity, a 48-hour cancellation window is strictly enforced.',
  'Evsen Hotel': 'Very flexible — free cancellation up to 24 hours before the check-in time.',
  'Ramada TRYP Beyoğlu': 'Follows Wyndham corporate policy; usually free cancellation until 24 hours before arrival (by 4:00 PM or 6:00 PM).',
  'City Centre Beyoğlu': 'Free cancellation until 24–48 hours before arrival.',
  'Trip Bosphorus Hotel': 'Free cancellation up to 24 hours before the arrival date.',
  'Abel Hotel': 'Free cancellation standard until 48 hours prior to arrival.',
  'Tria Hotel': '48-hour free cancellation window for standard rates.',
  'Armada Hotel': 'Free cancellation up to 24–48 hours before arrival.',
  'Wings Hotel Karaköy': 'Modern boutique policy — free cancellation up to 48 hours before arrival.',
  'Wings Hotel Pera': 'Modern boutique policy — free cancellation up to 48 hours before arrival.',
  'Wings Hotel Collection': 'Modern boutique policy — free cancellation up to 48 hours before arrival.',
  'Root Hotel Karaköy': 'Requires a 48-hour notice period for free cancellation.',
  'Sub Hotel Karaköy': 'Free cancellation window is 48 hours before check-in.',
  'Weingart Istanbul': 'Free cancellation up to 48 hours before arrival.',
  'Weingart Suite': 'Free cancellation up to 48 hours before arrival.',
  'Weingart Seaside': 'Free cancellation up to 48 hours before arrival.',
  'Union Hotel': 'Flexible 24-hour cancellation policy.',
  'Khai Hotel Karaköy': "As a high-end boutique, may require 72 hours' notice during peak seasons, otherwise 48 hours.",
  'Bankerhan Hotel': 'Free cancellation until 48 hours before the arrival date.',
  'The Galata Istanbul Hotel': 'Follows Accor (MGallery) standards; usually 24–48 hours before arrival (often by 2:00 PM or 6:00 PM local time).',
  'Galatas Hotel': 'Free cancellation up to 48 hours before arrival.',
  'The House Hotel': "Requires 48 to 72 hours' notice for free cancellation due to its luxury status.",
  'OrientBank Hotel': "Follows Marriott Autograph Collection standards; usually 48 to 72 hours' notice for free cancellation.",
  'Orient Occident Hotel': "Follows Marriott Autograph Collection standards; usually 48 to 72 hours' notice for free cancellation.",
  'Nordstern Hotel Galata': 'Free cancellation up to 48 hours before arrival.',
  'The Haze Karaköy': 'Flexible 24 to 48-hour cancellation window.',
  'Anemon Galata Hotel': 'Standard chain policy — cancellation up to 24 hours before arrival.',
  'Hotel Momento Golden Horn': 'Free cancellation up to 24–48 hours before the arrival date.',
  'Walton Hotels Galata': 'Free cancellation up to 48 hours before check-in.',
};

// Build a normalized-key → policy lookup once.
const POLICY_BY_NORM = new Map(
  Object.entries(POLICIES).map(([name, policy]) => [norm(name), { name, policy }])
);

async function main() {
  console.log(DRY_RUN ? '— DRY RUN (no writes) —\n' : '— Applying cancellation policies —\n');

  // 1. Ensure the column exists. IF NOT EXISTS makes this safe to re-run.
  if (!DRY_RUN) {
    await pool.query('ALTER TABLE hotels ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;');
    console.log('✓ Column hotels.cancellation_policy is present\n');
  } else {
    console.log('• Would run: ALTER TABLE hotels ADD COLUMN IF NOT EXISTS cancellation_policy TEXT;\n');
  }

  // 2. Load all hotels and match.
  const { rows } = await pool.query('SELECT id, name, cancellation_policy FROM hotels ORDER BY id')
    .catch(async (e) => {
      // If we're in dry-run and the column doesn't exist yet, re-query without it.
      if (DRY_RUN && /cancellation_policy/.test(e.message)) {
        const r = await pool.query('SELECT id, name FROM hotels ORDER BY id');
        return { rows: r.rows.map((h) => ({ ...h, cancellation_policy: null })) };
      }
      throw e;
    });

  const matchedNorms = new Set();
  let updated = 0;
  let unchanged = 0;
  const unmatchedHotels = [];

  for (const hotel of rows) {
    const match = POLICY_BY_NORM.get(norm(hotel.name));
    if (!match) {
      unmatchedHotels.push(hotel.name);
      continue;
    }
    matchedNorms.add(norm(hotel.name));

    if ((hotel.cancellation_policy || '') === match.policy) {
      unchanged++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`• Would set [${hotel.id}] ${hotel.name}\n    → ${match.policy}`);
      updated++;
      continue;
    }

    await pool.query('UPDATE hotels SET cancellation_policy = $1 WHERE id = $2', [match.policy, hotel.id]);
    console.log(`✓ [${hotel.id}] ${hotel.name}`);
    updated++;
  }

  // 3. Report anything that didn't line up, in both directions.
  const unmatchedKeys = [...POLICY_BY_NORM.entries()]
    .filter(([k]) => !matchedNorms.has(k))
    .map(([, v]) => v.name);

  console.log('\n──────── Summary ────────');
  console.log(`${DRY_RUN ? 'Would update' : 'Updated'}: ${updated}`);
  console.log(`Already up to date: ${unchanged}`);
  if (unmatchedHotels.length) {
    console.log(`\n⚠ Hotels in DB with NO policy mapping (left untouched):`);
    unmatchedHotels.forEach((n) => console.log(`   - ${n}`));
  }
  if (unmatchedKeys.length) {
    console.log(`\n⚠ Policy entries that matched NO hotel (check the name spelling):`);
    unmatchedKeys.forEach((n) => console.log(`   - ${n}`));
  }
  if (!unmatchedHotels.length && !unmatchedKeys.length) {
    console.log('\n✓ Every hotel matched a policy and every policy matched a hotel.');
  }
}

main()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('\n✗ Failed:', err.message);
    await pool.end();
    process.exit(1);
  });
