// pricingEngine.js
require('dotenv').config();
const pool = require('./db');
const axios = require('axios');
const crypto = require('crypto');

const TURKISH_CURRENCY = 'TRY';
const USD_TO_TRY_RATE = 32.5;

const USE_MOCK_MAKECORPS = process.env.USE_MOCK_MAKECORPS === 'true';
const MAKECORPS_BASE_URL = process.env.MAKECORPS_API_BASE_URL || 'https://api.makcorps.com';
const MAKECORPS_API_KEY = process.env.MAKECORPS_API_KEY;
const PRICING_CACHE_TTL_SECONDS = parseInt(process.env.PRICING_CACHE_TTL_SECONDS || '60', 10);
const PRICING_CACHE_STALE_TTL_SECONDS = parseInt(process.env.PRICING_CACHE_STALE_TTL_SECONDS || '180', 10);
const MAPPING_CACHE_TTL_SECONDS = parseInt(process.env.MAPPING_CACHE_TTL_SECONDS || '43200', 10);
const PRICING_CACHE_MAX_ENTRIES = parseInt(process.env.PRICING_CACHE_MAX_ENTRIES || '1000', 10);
const DEFAULT_MIN_BOUND_USD = parseFloat(process.env.DEFAULT_MIN_BOUND_USD || '50');
const DEFAULT_MAX_BOUND_USD = parseFloat(process.env.DEFAULT_MAX_BOUND_USD || '500');
const COMPETITOR_UNDERCUT_MIN_PERCENT = 5;
const COMPETITOR_UNDERCUT_MAX_PERCENT = 10;

const cacheStore = new Map();
const inflightRequests = new Map();

// -----------------------------
// Helpers
// -----------------------------
function normalizeDate(dateStr, fallbackDate) {
  if (!dateStr) return fallbackDate;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return fallbackDate;
  return d.toISOString().split('T')[0];
}

function getDefaultDates() {
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  return {
    checkInDate: today.toISOString().split('T')[0],
    checkOutDate: tomorrow.toISOString().split('T')[0]
  };
}

function parseGuests(guests) {
  const n = parseInt(guests, 10);
  return Number.isFinite(n) && n > 0 ? n : 2;
}

function parseRooms(rooms) {
  const n = parseInt(rooms, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function safeNumber(val, fallback = 0) {
  const n = parseFloat(val);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeBounds(minBound, maxBound) {
  let min = safeNumber(minBound, DEFAULT_MIN_BOUND_USD);
  let max = safeNumber(maxBound, DEFAULT_MAX_BOUND_USD);

  if (!Number.isFinite(min)) min = DEFAULT_MIN_BOUND_USD;
  if (!Number.isFinite(max)) max = DEFAULT_MAX_BOUND_USD;

  if (max < min) {
    const temp = min;
    min = max;
    max = temp;
  }

  if (min === max) {
    max = min + 1;
  }

  return { min, max };
}

function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000));
}

function getRealtimeDiscountedPrice({
  minBound,
  maxBound,
  hotelId,
  checkInDate,
  checkOutDate,
  availabilityRatio = 0.5
}) {
  const bounds = normalizeBounds(minBound, maxBound);
  const availability = clamp(safeNumber(availabilityRatio, 0.5), 0, 1);
  const minuteBucket = Math.floor(Date.now() / 60000);
  const seed = `${hotelId || 'hotel'}|${checkInDate}|${checkOutDate}|${minuteBucket}`;
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  const randomFactor = parseInt(hash.slice(0, 8), 16) / 0xffffffff;

  const leadDays = getDaysBetween(new Date().toISOString().split('T')[0], checkInDate);
  const leadFactor = clamp(leadDays / 30, 0, 1);
  const spread = bounds.max - bounds.min;

  const boundPosition = clamp(0.45 + availability * 0.35 - leadFactor * 0.15, 0.25, 0.85);
  const anchorPrice = bounds.min + spread * boundPosition;

  const discountPercentage = clamp(7.5 + (availability - 0.5) * 2 + (randomFactor - 0.5) * 1.5, 5, 10);
  const discountedRaw = anchorPrice * (1 - discountPercentage / 100);
  const finalPrice = clamp(discountedRaw, bounds.min, bounds.max);

  return {
    discountPercentage: discountPercentage.toFixed(2),
    originalPrice: anchorPrice,
    discountedPrice: finalPrice.toFixed(2),
    savingsAmount: Math.max(0, anchorPrice - finalPrice).toFixed(2),
    availabilityRatio: availability.toFixed(2)
  };
}

function normalizeRoomCategory(roomType = '') {
  const value = String(roomType || '').trim().toLowerCase();
  if (!value) return 'unknown';

  const categoryRules = [
    ['economy', ['economy']],
    ['standard', ['standard']],
    ['deluxe', ['deluxe']],
    ['superior', ['superior']],
    ['executive', ['executive']],
    ['classic', ['classic']],
    ['suite', ['suite']],
    ['queen', ['queen']],
    ['twin', ['twin']],
    ['french', ['french']],
    ['city_view', ['city view', 'city_view']],
    ['sea_view', ['sea view', 'sea_view', 'ocean view', 'ocean_view']],
    ['small_single', ['small single', 'small_single']]
  ];

  for (const [category, keywords] of categoryRules) {
    if (keywords.some(keyword => value.includes(keyword))) {
      return category;
    }
  }

  return 'unknown';
}

function parseNumericValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') return null;

  const normalized = value.replace(/,/g, '').match(/\d+(\.\d+)?/);
  if (!normalized) return null;

  const num = parseFloat(normalized[0]);
  return Number.isFinite(num) ? num : null;
}

function collectCompetitorPriceCandidates(input, candidates = []) {
  if (input === null || input === undefined) return candidates;

  if (Array.isArray(input)) {
    input.forEach(item => collectCompetitorPriceCandidates(item, candidates));
    return candidates;
  }

  if (typeof input === 'object') {
    Object.entries(input).forEach(([key, value]) => {
      const keyLower = key.toLowerCase();
      const looksLikePriceKey = /(price|rate|amount|cost|fare|night|avg|value|usd|total)/i.test(keyLower);

      if (looksLikePriceKey) {
        const parsed = parseNumericValue(value);
        if (parsed !== null && parsed > 0) {
          candidates.push(parsed);
        }
      }

      if (typeof value === 'object') {
        collectCompetitorPriceCandidates(value, candidates);
      }
    });
  }

  return candidates;
}

function getCompetitorPriceInsight(makecorpsPrices, bounds) {
  if (!makecorpsPrices?.success) return null;

  const candidates = collectCompetitorPriceCandidates(makecorpsPrices.data, []);
  if (!candidates.length) return null;

  const minWindow = Math.max(1, bounds.min * 0.4);
  const maxWindow = Math.max(bounds.max * 20, bounds.min * 2);
  const filtered = candidates
    .filter(price => price >= minWindow && price <= maxWindow)
    .sort((a, b) => a - b);

  if (!filtered.length) return null;

  const midIndex = Math.floor(filtered.length / 2);
  const median =
    filtered.length % 2 === 1
      ? filtered[midIndex]
      : (filtered[midIndex - 1] + filtered[midIndex]) / 2;

  return {
    sampleSize: filtered.length,
    minPriceUSD: filtered[0],
    maxPriceUSD: filtered[filtered.length - 1],
    medianPriceUSD: parseFloat(median.toFixed(2))
  };
}

function getBaseAnchoredRecommendation({
  basePrice,
  discountPercent,
  bounds,
  competitorMedianPrice
}) {
  const validBasePrice = Number.isFinite(basePrice) && basePrice > 0
    ? basePrice
    : bounds.min;

  let recommended = validBasePrice * (1 - discountPercent / 100);

  if (Number.isFinite(competitorMedianPrice) && competitorMedianPrice > 0) {
    const competitorMinTarget = competitorMedianPrice * (1 - (COMPETITOR_UNDERCUT_MAX_PERCENT / 100));
    const competitorMaxTarget = competitorMedianPrice * (1 - (COMPETITOR_UNDERCUT_MIN_PERCENT / 100));
    const low = Math.min(competitorMinTarget, competitorMaxTarget);
    const high = Math.max(competitorMinTarget, competitorMaxTarget);

    // Keep recommendation close to base while enforcing 5-10% lower than competitor prices.
    recommended = clamp(validBasePrice, low, high);
  }

  return clamp(recommended, bounds.min, bounds.max);
}

function stableStringify(value) {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(',')}]`;
  }

  const keys = Object.keys(value).sort();
  const entries = keys.map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`);
  return `{${entries.join(',')}}`;
}

function makeCacheKey(prefix, payload) {
  return `${prefix}:${stableStringify(payload)}`;
}

function getCacheValue(cacheKey) {
  const entry = cacheStore.get(cacheKey);
  if (!entry) return null;

  const now = Date.now();
  if (entry.expiresAt > now) {
    return { hit: 'fresh', value: entry.value };
  }

  if (entry.staleUntil > now) {
    return { hit: 'stale', value: entry.value };
  }

  cacheStore.delete(cacheKey);
  return null;
}

function setCacheValue(cacheKey, value, ttlSeconds = PRICING_CACHE_TTL_SECONDS, staleSeconds = PRICING_CACHE_STALE_TTL_SECONDS) {
  const now = Date.now();
  const ttlMs = Math.max(1, ttlSeconds) * 1000;
  const staleMs = Math.max(1, staleSeconds) * 1000;

  while (cacheStore.size >= PRICING_CACHE_MAX_ENTRIES) {
    const firstKey = cacheStore.keys().next().value;
    if (!firstKey) break;
    cacheStore.delete(firstKey);
  }

  cacheStore.set(cacheKey, {
    value,
    expiresAt: now + ttlMs,
    staleUntil: now + ttlMs + staleMs
  });
}

async function withInflightDedupe(cacheKey, fetcher) {
  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  const promise = (async () => {
    try {
      return await fetcher();
    } finally {
      inflightRequests.delete(cacheKey);
    }
  })();

  inflightRequests.set(cacheKey, promise);
  return promise;
}

async function getCachedOrFetch({ cacheKey, ttlSeconds, staleSeconds, fetcher }) {
  const cached = getCacheValue(cacheKey);
  if (cached?.hit === 'fresh') {
    return cached.value;
  }

  try {
    const data = await withInflightDedupe(cacheKey, fetcher);
    setCacheValue(cacheKey, data, ttlSeconds, staleSeconds);
    return data;
  } catch (error) {
    if (cached?.hit === 'stale') {
      return cached.value;
    }
    throw error;
  }
}

// -----------------------------
// Nearby local DB median pricing
// -----------------------------
const getNearbyHotelsMedianPrice = async (hotelName, hotel) => {
  try {
    const nearbyResult = await pool.query(
      `SELECT DISTINCT r.rentperday
       FROM hotels h
       JOIN rooms r ON h.id = r.hotel_id
       WHERE h.district = $1 AND h.id != $2
       ORDER BY r.rentperday`,
      [hotel.district, hotel.id]
    );

    if (nearbyResult.rows.length === 0) {
      return null;
    }

    const prices = nearbyResult.rows.map(r => safeNumber(r.rentperday)).sort((a, b) => a - b);
    const midIndex = Math.floor(prices.length / 2);
    const medianPrice =
      prices.length % 2 !== 0
        ? prices[midIndex]
        : (prices[midIndex - 1] + prices[midIndex]) / 2;

    return {
      nearbyHotelsCount: prices.length,
      medianPriceUSD: parseFloat(medianPrice.toFixed(2)),
      medianPriceTRY: Math.round(medianPrice * USD_TO_TRY_RATE),
      priceRange: {
        minUSD: Math.min(...prices),
        maxUSD: Math.max(...prices)
      }
    };
  } catch (error) {
    console.log('Error fetching nearby hotels:', error.message);
    return null;
  }
};

// -----------------------------
// Makcorps helpers
// -----------------------------
// Mapping API gives hotel/city IDs via document_id
// https://docs.makcorps.com/mapping-api-hotel-city-ids
async function resolveMakcorpsMapping(name) {
  try {
    if (!MAKECORPS_API_KEY) {
      return { success: false, reason: 'MAKECORPS_API_KEY is missing' };
    }

    const response = await axios.get(`${MAKECORPS_BASE_URL}/mapping`, {
      params: {
        api_key: MAKECORPS_API_KEY,
        name
      },
      timeout: 10000
    });

    const data = response.data;

    // Makcorps docs explicitly mention document_id in mapping response.
    // Response shape may differ, so we try a few safe patterns.
    let items = [];

    if (Array.isArray(data)) {
      items = data;
    } else if (Array.isArray(data?.results)) {
      items = data.results;
    } else if (Array.isArray(data?.data)) {
      items = data.data;
    } else if (data && typeof data === 'object') {
      items = [data];
    }

    const normalized = items
      .map(item => ({
        document_id: item.document_id || item?.details?.document_id || item?.hotelid || item?.cityid || null,
        name: item.name || item.hotel_name || item.city_name || item.title || name,
        type: item.type || item.entity_type || item.category || null,
        raw: item
      }))
      .filter(item => item.document_id);

    if (!normalized.length) {
      return {
        success: false,
        reason: 'No mapping results found',
        raw: data
      };
    }

    return {
      success: true,
      query: name,
      count: normalized.length,
      results: normalized,
      raw: data
    };
  } catch (error) {
    return {
      success: false,
      reason: error.response?.data || error.message
    };
  }
}

async function resolveMakcorpsMappingCached(name) {
  const key = makeCacheKey('makcorps:mapping', { name: String(name || '').toLowerCase() });
  return getCachedOrFetch({
    cacheKey: key,
    ttlSeconds: MAPPING_CACHE_TTL_SECONDS,
    staleSeconds: MAPPING_CACHE_TTL_SECONDS,
    fetcher: () => resolveMakcorpsMapping(name)
  });
}

function inferMappingType(item, queryName = '') {
  const type = String(item?.type || '').toLowerCase();
  const rawText = JSON.stringify(item?.raw || {}).toLowerCase();
  const q = String(queryName || '').toLowerCase();

  if (
    type.includes('geo') ||
    type.includes('city') ||
    type.includes('location') ||
    rawText.includes('"type":"geo"') ||
    rawText.includes('"entity_type":"city"')
  ) {
    return 'city';
  }

  if (
    type.includes('hotel') ||
    rawText.includes('hotel') ||
    rawText.includes('"entity_type":"hotel"')
  ) {
    return 'hotel';
  }

  if (q.includes('district') || q.includes('city')) {
    return 'city';
  }

  return 'hotel';
}

// Hotel API requires hotelid, adults, cur, rooms, checkin, checkout
// https://docs.makcorps.com/hotel-price-apis/hotel-api-search-by-hotel-id
async function fetchMakcorpsHotelById(hotelId, checkInDate, checkOutDate, guests = 2, rooms = 1, currency = 'USD') {
  const cacheKey = makeCacheKey('makcorps:hotel', {
    hotelId,
    checkInDate,
    checkOutDate,
    guests,
    rooms,
    currency
  });

  return getCachedOrFetch({
    cacheKey,
    ttlSeconds: PRICING_CACHE_TTL_SECONDS,
    staleSeconds: PRICING_CACHE_STALE_TTL_SECONDS,
    fetcher: async () => {
      const response = await axios.get(`${MAKECORPS_BASE_URL}/hotel`, {
        params: {
          hotelid: hotelId,
          rooms,
          adults: guests,
          cur: currency,
          checkin: checkInDate,
          checkout: checkOutDate,
          api_key: MAKECORPS_API_KEY
        },
        timeout: 15000
      });

      return response.data;
    }
  });
}

// City API requires cityid, pagination, cur, rooms, adults, checkin, checkout
// https://docs.makcorps.com/hotel-price-apis/hotel-api-search-by-city-id
async function fetchMakcorpsCityById(cityId, checkInDate, checkOutDate, guests = 2, rooms = 1, currency = 'USD', pagination = 0) {
  const cacheKey = makeCacheKey('makcorps:city', {
    cityId,
    checkInDate,
    checkOutDate,
    guests,
    rooms,
    currency,
    pagination
  });

  return getCachedOrFetch({
    cacheKey,
    ttlSeconds: PRICING_CACHE_TTL_SECONDS,
    staleSeconds: PRICING_CACHE_STALE_TTL_SECONDS,
    fetcher: async () => {
      const response = await axios.get(`${MAKECORPS_BASE_URL}/city`, {
        params: {
          cityid: cityId,
          pagination,
          cur: currency,
          rooms,
          adults: guests,
          checkin: checkInDate,
          checkout: checkOutDate,
          api_key: MAKECORPS_API_KEY
        },
        timeout: 20000
      });

      return response.data;
    }
  });
}

// Resolve a hotel name first, then call /hotel.
// If hotel mapping is unavailable, optionally try location fallback with /city.
async function getMakcorpsHotelPrices({
  hotelName,
  locationName,
  checkInDate,
  checkOutDate,
  guests = 2,
  rooms = 1,
  currency = 'USD'
}) {
  try {
    if (USE_MOCK_MAKECORPS) {
      return {
        success: false,
        reason: 'Mock pricing is disabled. USE_MOCK_MAKECORPS must be false for live prices.'
      };
    }

    if (!MAKECORPS_API_KEY) {
      return {
        success: false,
        reason: 'MAKECORPS_API_KEY is missing'
      };
    }

    const hotelMapping = await resolveMakcorpsMappingCached(hotelName);

    if (hotelMapping.success && hotelMapping.results.length > 0) {
      const hotelCandidate =
        hotelMapping.results.find(r => inferMappingType(r, hotelName) === 'hotel') ||
        hotelMapping.results[0];

      const liveData = await fetchMakcorpsHotelById(
        hotelCandidate.document_id,
        checkInDate,
        checkOutDate,
        guests,
        rooms,
        currency
      );

      return {
        success: true,
        source: 'Makcorps Live Hotel API',
        is_mock: false,
        queryType: 'hotel',
        mapping: {
          query: hotelName,
          document_id: hotelCandidate.document_id,
          inferredType: inferMappingType(hotelCandidate, hotelName),
          raw: hotelCandidate.raw
        },
        data: liveData
      };
    }

    if (locationName) {
      const cityMapping = await resolveMakcorpsMappingCached(locationName);

      if (cityMapping.success && cityMapping.results.length > 0) {
        const cityCandidate =
          cityMapping.results.find(r => inferMappingType(r, locationName) === 'city') ||
          cityMapping.results[0];

        const cityData = await fetchMakcorpsCityById(
          cityCandidate.document_id,
          checkInDate,
          checkOutDate,
          guests,
          rooms,
          currency,
          0
        );

        return {
          success: true,
          source: 'Makcorps Live City API',
          is_mock: false,
          queryType: 'city',
          mapping: {
            query: locationName,
            document_id: cityCandidate.document_id,
            inferredType: inferMappingType(cityCandidate, locationName),
            raw: cityCandidate.raw
          },
          data: cityData
        };
      }
    }

    return {
      success: false,
      reason: `No Makcorps mapping found for '${hotelName}' or fallback location '${locationName || 'N/A'}'`
    };
  } catch (error) {
    return {
      success: false,
      reason: error.response?.data || error.message
    };
  }
}

// For all hotels in a location, use mapping -> city
async function getMakcorpsCityPrices({
  locationName,
  checkInDate,
  checkOutDate,
  guests = 2,
  rooms = 1,
  currency = 'USD',
  pagination = 0
}) {
  try {
    if (USE_MOCK_MAKECORPS) {
      return {
        success: false,
        reason: 'Mock pricing is disabled. USE_MOCK_MAKECORPS must be false for live prices.'
      };
    }

    if (!MAKECORPS_API_KEY) {
      return {
        success: false,
        reason: 'MAKECORPS_API_KEY is missing'
      };
    }

    const mapping = await resolveMakcorpsMappingCached(locationName);
    if (!mapping.success || !mapping.results.length) {
      return {
        success: false,
        reason: `No Makcorps mapping found for '${locationName}'`,
        mapping
      };
    }

    const cityCandidate =
      mapping.results.find(r => inferMappingType(r, locationName) === 'city') ||
      mapping.results[0];

    const liveData = await fetchMakcorpsCityById(
      cityCandidate.document_id,
      checkInDate,
      checkOutDate,
      guests,
      rooms,
      currency,
      pagination
    );

    return {
      success: true,
      is_mock: false,
      source: 'Makcorps Live City API',
      locationName,
      mapping: {
        query: locationName,
        document_id: cityCandidate.document_id,
        inferredType: inferMappingType(cityCandidate, locationName),
        raw: cityCandidate.raw
      },
      data: liveData
    };
  } catch (error) {
    return {
      success: false,
      reason: error.response?.data || error.message
    };
  }
}

// -----------------------------
// Local availability - all hotels
// -----------------------------
const getHotelAvailability = async (req, res) => {
  const { checkInDate, checkOutDate, guests, useMakecorps, locationName, rooms } = req.body;

  try {
    if (!checkInDate || !checkOutDate) {
      return res.status(400).json({ error: 'checkInDate and checkOutDate are required' });
    }

    const hotelsResult = await pool.query('SELECT * FROM hotels ORDER BY id DESC');
    const hotels = hotelsResult.rows;

    if (hotels.length === 0) {
      return res.json({ hotels: [], message: 'No hotels available' });
    }

    const hotelsWithAvailability = await Promise.all(
      hotels.map(async (hotel) => {
        const roomsResult = await pool.query(
          `SELECT id, type, maxcount, rentperday, imageurls, name
           FROM rooms
           WHERE hotel_id = $1`,
          [hotel.id]
        );

        const bookedResult = await pool.query(
          `SELECT DISTINCT room_id
           FROM bookings
           WHERE room_id IN (SELECT id FROM rooms WHERE hotel_id = $1)
           AND check_in_date < $2
           AND check_out_date > $3`,
          [hotel.id, checkOutDate, checkInDate]
        );

        const bookedRoomIds = bookedResult.rows.map(r => r.room_id);

        const roomsByType = {};
        roomsResult.rows.forEach(room => {
          if (!roomsByType[room.type]) {
            roomsByType[room.type] = {
              type: room.type,
              totalRooms: 0,
              availableRooms: 0,
              maxGuestCount: room.maxcount,
              rentPerDayUSD: safeNumber(room.rentperday),
              rentPerDayTRY: Math.round(safeNumber(room.rentperday) * USD_TO_TRY_RATE),
              rooms: []
            };
          }

          roomsByType[room.type].totalRooms += 1;
          if (!bookedRoomIds.includes(room.id)) {
            roomsByType[room.type].availableRooms += 1;
          }

          roomsByType[room.type].rooms.push({
            id: room.id,
            name: room.name,
            isAvailable: !bookedRoomIds.includes(room.id),
            images: room.imageurls
          });
        });

        return {
          id: hotel.id,
          name: hotel.name,
          address: hotel.address,
          district: hotel.district,
          location: hotel.location,
          contactName: hotel.contact_name,
          contactEmail: hotel.contact_email,
          totalRooms: hotel.total_rooms,
          description: hotel.description,
          roomTypes: Object.values(roomsByType),
          checkInDate,
          checkOutDate
        };
      })
    );

    let makecorpsCityPrices = null;
    if (useMakecorps && locationName) {
      makecorpsCityPrices = await getMakcorpsCityPrices({
        locationName,
        checkInDate,
        checkOutDate,
        guests: parseGuests(guests),
        rooms: parseRooms(rooms),
        currency: 'USD',
        pagination: 0
      });
    }

    res.json({
      hotels: hotelsWithAvailability,
      makecorpsCityPrices: makecorpsCityPrices || {
        success: false,
        reason: 'Pass useMakecorps=true and locationName to fetch live city prices'
      },
      currency: TURKISH_CURRENCY,
      usdToTryRate: USD_TO_TRY_RATE
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// Local availability - specific hotel
// -----------------------------
const getSpecificHotelAvailability = async (req, res) => {
  const { hotelName, checkInDate, checkOutDate, guests, useMakecorps, rooms } = req.body;

  try {
    if (!hotelName) {
      return res.status(400).json({ error: 'hotelName is required' });
    }

    const defaults = getDefaultDates();
    const finalCheckInDate = normalizeDate(checkInDate, defaults.checkInDate);
    const finalCheckOutDate = normalizeDate(checkOutDate, defaults.checkOutDate);

    const hotelResult = await pool.query(
      'SELECT * FROM hotels WHERE LOWER(name) = LOWER($1)',
      [hotelName]
    );

    if (hotelResult.rows.length === 0) {
      return res.status(404).json({ error: `Hotel '${hotelName}' not found` });
    }

    const hotel = hotelResult.rows[0];

    const roomsResult = await pool.query(
      `SELECT id, type, maxcount, rentperday, imageurls, name
       FROM rooms
       WHERE hotel_id = $1`,
      [hotel.id]
    );

    const bookedResult = await pool.query(
      `SELECT DISTINCT room_id
       FROM bookings
       WHERE room_id IN (SELECT id FROM rooms WHERE hotel_id = $1)
       AND check_in_date < $2
       AND check_out_date > $3`,
      [hotel.id, finalCheckOutDate, finalCheckInDate]
    );

    const bookedRoomIds = bookedResult.rows.map(r => r.room_id);

    const roomsByType = {};
    roomsResult.rows.forEach(room => {
      if (!roomsByType[room.type]) {
        roomsByType[room.type] = {
          type: room.type,
          totalRooms: 0,
          availableRooms: 0,
          maxGuestCount: room.maxcount,
          rentPerDayUSD: safeNumber(room.rentperday),
          rentPerDayTRY: Math.round(safeNumber(room.rentperday) * USD_TO_TRY_RATE),
          rooms: []
        };
      }

      roomsByType[room.type].totalRooms += 1;
      if (!bookedRoomIds.includes(room.id)) {
        roomsByType[room.type].availableRooms += 1;
      }

      roomsByType[room.type].rooms.push({
        id: room.id,
        name: room.name,
        isAvailable: !bookedRoomIds.includes(room.id),
        images: room.imageurls
      });
    });

    let makecorpsPrices = null;
    if (useMakecorps) {
      makecorpsPrices = await getMakcorpsHotelPrices({
        hotelName,
        locationName: hotel.district || hotel.location,
        checkInDate: finalCheckInDate,
        checkOutDate: finalCheckOutDate,
        guests: parseGuests(guests),
        rooms: parseRooms(rooms),
        currency: 'USD'
      });
    }

    res.json({
      hotel: {
        id: hotel.id,
        name: hotel.name,
        address: hotel.address,
        district: hotel.district,
        location: hotel.location,
        contactName: hotel.contact_name,
        contactEmail: hotel.contact_email,
        totalRooms: hotel.total_rooms,
        description: hotel.description,
        roomTypes: Object.values(roomsByType),
        checkInDate: finalCheckInDate,
        checkOutDate: finalCheckOutDate,
        makecorpsPrices: makecorpsPrices
          ? (
              makecorpsPrices.success
                ? { status: 'available', data: makecorpsPrices }
                : { status: 'unavailable', reason: makecorpsPrices.reason || 'Live pricing not available' }
            )
          : { status: 'unavailable', reason: 'Live pricing was not requested' }
      },
      currency: TURKISH_CURRENCY,
      usdToTryRate: USD_TO_TRY_RATE
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// Recommended price
// -----------------------------
const getRecommendedPrice = async (req, res) => {
  const {
    hotelName,
    minBound,
    maxBound,
    useMakecorps,
    checkInDate,
    checkOutDate,
    guests,
    rooms
  } = req.body;

  try {
    if (!hotelName) {
      return res.status(400).json({ error: 'hotelName is required' });
    }

    if (minBound === undefined && maxBound === undefined) {
      return res.status(400).json({
        error: 'minBound and maxBound are required (or configure DEFAULT_MIN_BOUND_USD and DEFAULT_MAX_BOUND_USD)'
      });
    }

    const defaults = getDefaultDates();
    const finalCheckInDate = normalizeDate(checkInDate, defaults.checkInDate);
    const finalCheckOutDate = normalizeDate(checkOutDate, defaults.checkOutDate);

    const hotelResult = await pool.query(
      'SELECT * FROM hotels WHERE LOWER(name) = LOWER($1)',
      [hotelName]
    );

    if (hotelResult.rows.length === 0) {
      return res.status(404).json({ error: `Hotel '${hotelName}' not found` });
    }

    const hotel = hotelResult.rows[0];
    const bounds = normalizeBounds(minBound, maxBound);
    const minBoundUSD = bounds.min;
    const maxBoundUSD = bounds.max;

    let categoryBasePrices = new Map();
    try {
      const categoryResult = await pool.query(
        `SELECT room_category, AVG(base_price) AS avg_base_price
         FROM hotel_room_categories
         WHERE hotel_id = $1
           AND base_price IS NOT NULL
         GROUP BY room_category`,
        [hotel.id]
      );

      categoryBasePrices = new Map(
        categoryResult.rows
          .filter(row => row.room_category)
          .map(row => [String(row.room_category).toLowerCase(), safeNumber(row.avg_base_price)])
      );
    } catch (categoryError) {
      console.log(`⚠️ Room category base-price fallback to rooms table: ${categoryError.message}`);
    }

    let availabilityRatio = 0.5;
    try {
      const availabilityResult = await pool.query(
        `SELECT
           COUNT(r.id)::int AS total_rooms,
           COUNT(r.id) FILTER (WHERE b.room_id IS NULL)::int AS available_rooms
         FROM rooms r
         LEFT JOIN (
           SELECT DISTINCT room_id
           FROM bookings
           WHERE room_id IN (SELECT id FROM rooms WHERE hotel_id = $1)
           AND check_in_date < $2
           AND check_out_date > $3
         ) b ON b.room_id = r.id
         WHERE r.hotel_id = $1`,
        [hotel.id, finalCheckOutDate, finalCheckInDate]
      );

      const totalRooms = safeNumber(availabilityResult.rows?.[0]?.total_rooms, 0);
      const availableRooms = safeNumber(availabilityResult.rows?.[0]?.available_rooms, 0);
      availabilityRatio = totalRooms > 0 ? availableRooms / totalRooms : 0.5;
    } catch (availabilityError) {
      console.log(`⚠️ Availability ratio fallback for pricing: ${availabilityError.message}`);
    }

    const roomsResult = await pool.query(
      `SELECT DISTINCT type, rentperday
       FROM rooms
       WHERE hotel_id = $1
       ORDER BY type`,
      [hotel.id]
    );

    let recommendedPrices = [];
    let nearbyMedian = null;
    let makecorpsPrices = null;
    let competitorPriceInsight = null;

    if (useMakecorps) {
      makecorpsPrices = await getMakcorpsHotelPrices({
        hotelName,
        locationName: hotel.district || hotel.location,
        checkInDate: finalCheckInDate,
        checkOutDate: finalCheckOutDate,
        guests: parseGuests(guests),
        rooms: parseRooms(rooms),
        currency: 'USD'
      });

      competitorPriceInsight = getCompetitorPriceInsight(makecorpsPrices, bounds);
    }

    if (roomsResult.rows.length === 0) {
      nearbyMedian = await getNearbyHotelsMedianPrice(hotelName, hotel);

      if (!nearbyMedian) {
        return res.status(404).json({
          error: 'No rooms available for this hotel',
          suggestion: 'Try searching for nearby hotels'
        });
      }

      const discountInfo = getRealtimeDiscountedPrice({
        minBound: minBoundUSD,
        maxBound: maxBoundUSD,
        hotelId: hotel.id,
        checkInDate: finalCheckInDate,
        checkOutDate: finalCheckOutDate,
        availabilityRatio
      });
      const recommendedPriceUSD = Math.max(parseFloat(discountInfo.discountedPrice), minBoundUSD);
      const finalRecommendedPrice = Math.min(recommendedPriceUSD, maxBoundUSD);

      recommendedPrices = [{
        category: 'Nearby Hotels Average',
        type: 'Nearby Hotels Average',
        basePriceUSD: nearbyMedian.medianPriceUSD,
        basePriceTRY: nearbyMedian.medianPriceTRY,
        priceBounds: {
          minBound: minBoundUSD,
          maxBound: maxBoundUSD
        },
        recommendedPrice: {
          discountPercentage: `${discountInfo.discountPercentage}%`,
          originalMidPrice: discountInfo.originalPrice.toFixed(2),
          discountedPriceUSD: finalRecommendedPrice.toFixed(2),
          discountedPriceTRY: Math.round(finalRecommendedPrice * USD_TO_TRY_RATE),
          savingsAmountUSD: (discountInfo.originalPrice - finalRecommendedPrice).toFixed(2),
          savingsAmountTRY: Math.round((discountInfo.originalPrice - finalRecommendedPrice) * USD_TO_TRY_RATE)
        },
        isWithinBounds: finalRecommendedPrice >= minBoundUSD && finalRecommendedPrice <= maxBoundUSD,
        source: 'Nearby Hotels Median'
      }];
    } else {
      recommendedPrices = roomsResult.rows.map(room => {
        const normalizedCategory = normalizeRoomCategory(room.type);
        const categoryBasePrice = categoryBasePrices.get(normalizedCategory);
        const basePrice = Number.isFinite(categoryBasePrice) && categoryBasePrice > 0
          ? categoryBasePrice
          : safeNumber(room.rentperday);

        const discountInfo = getRealtimeDiscountedPrice({
          minBound: minBoundUSD,
          maxBound: maxBoundUSD,
          hotelId: `${hotel.id}:${room.type}`,
          checkInDate: finalCheckInDate,
          checkOutDate: finalCheckOutDate,
          availabilityRatio
        });

        const dynamicDiscountPercent = safeNumber(discountInfo.discountPercentage, 7.5);
        const finalRecommendedPrice = getBaseAnchoredRecommendation({
          basePrice,
          discountPercent: dynamicDiscountPercent,
          bounds,
          competitorMedianPrice: competitorPriceInsight?.medianPriceUSD
        });
        const effectiveOriginalPrice = basePrice > 0 ? basePrice : discountInfo.originalPrice;

        return {
          category: room.type,
          type: room.type,
          roomCategory: normalizedCategory,
          basePriceUSD: basePrice,
          basePriceTRY: Math.round(basePrice * USD_TO_TRY_RATE),
          priceBounds: {
            minBound: minBoundUSD,
            maxBound: maxBoundUSD
          },
          recommendedPrice: {
            discountPercentage: `${discountInfo.discountPercentage}%`,
            originalMidPrice: effectiveOriginalPrice.toFixed(2),
            discountedPriceUSD: finalRecommendedPrice.toFixed(2),
            discountedPriceTRY: Math.round(finalRecommendedPrice * USD_TO_TRY_RATE),
            savingsAmountUSD: Math.max(0, effectiveOriginalPrice - finalRecommendedPrice).toFixed(2),
            savingsAmountTRY: Math.round(Math.max(0, effectiveOriginalPrice - finalRecommendedPrice) * USD_TO_TRY_RATE)
          },
          competitorReference: competitorPriceInsight
            ? {
                medianPriceUSD: competitorPriceInsight.medianPriceUSD,
                targetUndercutRangePercent: `${COMPETITOR_UNDERCUT_MIN_PERCENT}-${COMPETITOR_UNDERCUT_MAX_PERCENT}`
              }
            : null,
          isWithinBounds: finalRecommendedPrice >= minBoundUSD && finalRecommendedPrice <= maxBoundUSD,
          source: categoryBasePrice ? 'Hotel Room Category Base Pricing' : 'Hotel Direct Pricing'
        };
      });
    }

    res.json({
      hotel: {
        id: hotel.id,
        name: hotel.name,
        address: hotel.address,
        district: hotel.district,
        location: hotel.location
      },
      recommendedPrices,
      nearbyHotelsMedian: nearbyMedian,
      makecorpsPrices: makecorpsPrices
        ? (
            makecorpsPrices.success
              ? {
                  status: 'available',
                  data: makecorpsPrices
                }
              : {
                  status: 'unavailable',
                  reason: makecorpsPrices.reason || 'Live pricing not available'
                }
          )
        : { status: 'unavailable', reason: 'Live pricing was not requested' },
      currency: TURKISH_CURRENCY,
      usdToTryRate: USD_TO_TRY_RATE,
      discountApplied: true,
      discountRange: '5-10%',
      realtimePricing: {
        availabilityRatio: availabilityRatio.toFixed(2),
        competitorPriceInsight,
        cachePolicy: {
          pricingTtlSeconds: PRICING_CACHE_TTL_SECONDS,
          staleTtlSeconds: PRICING_CACHE_STALE_TTL_SECONDS,
          mappingTtlSeconds: MAPPING_CACHE_TTL_SECONDS
        }
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------
// NEW: all hotels live by location
// -----------------------------
// Pass locationName, checkInDate, checkOutDate, guests, rooms, page
const getLivePricesByLocation = async (req, res) => {
  const { locationName, checkInDate, checkOutDate, guests, rooms, page } = req.body;

  try {
    if (!locationName) {
      return res.status(400).json({ error: 'locationName is required' });
    }

    const defaults = getDefaultDates();
    const finalCheckInDate = normalizeDate(checkInDate, defaults.checkInDate);
    const finalCheckOutDate = normalizeDate(checkOutDate, defaults.checkOutDate);

    const data = await getMakcorpsCityPrices({
      locationName,
      checkInDate: finalCheckInDate,
      checkOutDate: finalCheckOutDate,
      guests: parseGuests(guests),
      rooms: parseRooms(rooms),
      currency: 'USD',
      pagination: Number.isFinite(parseInt(page, 10)) ? parseInt(page, 10) : 0
    });

    if (!data.success) {
      return res.status(400).json({
        error: 'Unable to fetch live Makcorps city prices',
        details: data.reason || data
      });
    }

    return res.json({
      locationName,
      checkInDate: finalCheckInDate,
      checkOutDate: finalCheckOutDate,
      guests: parseGuests(guests),
      rooms: parseRooms(rooms),
      makecorpsPrices: {
        status: 'available',
        data
      },
      currency: 'USD'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getHotelAvailability,
  getSpecificHotelAvailability,
  getRecommendedPrice,
  getLivePricesByLocation
};