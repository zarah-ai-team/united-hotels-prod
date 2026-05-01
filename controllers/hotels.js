const pool = require('../db');
const { resolveHotelImage, resolveHotelGallery } = require('../utils/imageKit');

const attachImageKitUrls = (hotel) => {
  if (!hotel) return hotel;
  const id = hotel.id ?? hotel.hotel_id;
  const name = hotel.name || hotel.hotel_name;
  const key = { id, name, hotel_name: hotel.hotel_name };
  const cover = resolveHotelImage(key);
  const gallery = resolveHotelGallery(key, 3);
  hotel.image_url = cover || null;
  hotel.images = gallery.length ? gallery : (cover ? [cover] : []);
  return hotel;
};

const tableColumnsCache = new Map();
const RECOMMENDED_PRICES_CACHE_TTL_MS = 5 * 60 * 1000;
let recommendedPricesCache = {
  expiresAt: 0,
  payload: null
};

const getTableColumns = async (tableName) => {
  if (tableColumnsCache.has(tableName)) {
    return tableColumnsCache.get(tableName);
  }

  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
    [tableName]
  );

  const cols = new Set(result.rows.map((row) => row.column_name));
  tableColumnsCache.set(tableName, cols);
  return cols;
};

const hasPublicTable = async (tableName) => {
  const result = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS table_exists
    `,
    [tableName]
  );
  return Boolean(result.rows[0]?.table_exists);
};

const clearTableColumnsCache = (tableName) => {
  tableColumnsCache.delete(tableName);
};

const isUndefinedTableError = (error, tableName) => {
  const message = String(error?.message || '').toLowerCase();
  const relation = `relation \"${String(tableName || '').toLowerCase()}\" does not exist`;
  return error?.code === '42P01' || message.includes(relation) || message.includes('does not exist');
};

const pickColumn = (columns, names) => names.find((name) => columns.has(name)) || null;

const normalizeLookupKey = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const expr = (alias, columnName, fallback) => {
  if (!columnName) return fallback;
  return `${alias}."${columnName}"`;
};

const toInt = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseTotalRooms = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.trunc(value);
  }
  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    if (match) {
      return parseInt(match[0], 10);
    }
  }
  return null;
};

const toNumber = (value, fallback = 0) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

// Parse a key:value pair embedded in a description string, e.g. "min_price:4000 | max_price:5000"
const parseDescMeta = (desc = '', key) => {
  const m = String(desc || '').match(new RegExp(`\\b${key}:([\\d.]+)`));
  return m ? parseFloat(m[1]) : null;
};

const normalizeRoomCategory = (category) => {
  const value = String(category || '').toLowerCase();
  if (!value) return 'unknown';

  const mapping = [
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

  for (const [target, keywords] of mapping) {
    if (keywords.some((keyword) => value.includes(keyword))) {
      return target;
    }
  }

  return 'unknown';
};

const getDeterministicDiscountPercent = (hotelId, category) => {
  // Changes every 5 minutes to keep pricing dynamic and cache-aligned.
  const bucket = Math.floor(Date.now() / RECOMMENDED_PRICES_CACHE_TTL_MS);
  const seed = `${hotelId || 'hotel'}:${category || 'unknown'}:${bucket}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }

  const normalized = Math.abs(hash % 1000) / 1000;
  return clamp(5 + (normalized * 5), 5, 10);
};

// Market-competitive, date-aware price computation.
//
//   recommendedPrice = clamp(base × demand × leadTime × weekend × season,
//                            vendorMin or 0.85·base,
//                            vendorMax or 1.45·base)
//
// where each multiplier reflects a real-world signal:
//   • demand     : hotel-wide occupancy ratio (0.95–1.20 swing).
//   • leadTime   : >30d out → discount (-6%); <3d out → premium (+8%).
//   • weekend    : Fri/Sat night → +6%; Sun-Thu → 0.
//   • season     : Jun-Aug & Dec → +5%; shoulder months → -2%.
//   • length     : 4+ nights → -3% (longer stays absorb fixed costs).
//
// The result is bounded by the vendor-set price band (`min_price`/`max_price`)
// and the small-group hash variance (±1.5%) keeps neighbouring rooms from
// publishing identical numbers when seed inputs are identical.
const SHOULDER_MONTHS = new Set([1, 2, 3, 10, 11]); // Jan-Mar, Oct-Nov
const PEAK_MONTHS = new Set([5, 6, 7, 8, 11]);      // Jun-Aug, Dec (0-indexed: 11=Dec)

const dateToObj = (d) => {
  if (!d) return null;
  const obj = new Date(d);
  return Number.isNaN(obj.getTime()) ? null : obj;
};

const daysBetween = (a, b) => {
  if (!a || !b) return 1;
  return Math.max(1, Math.round((b.getTime() - a.getTime()) / 86400000));
};

const computeRecommendedPrice = ({
  basePrice,
  hotelId,
  roomCategory,
  minPrice = null,
  maxPrice = null,
  checkInDate = null,
  checkOutDate = null,
  occupancyRatio = 0.65,
}) => {
  const base = Number(basePrice);
  if (!Number.isFinite(base) || base <= 0) return null;

  const checkIn = dateToObj(checkInDate);
  const checkOut = dateToObj(checkOutDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 1. Demand multiplier — high occupancy lifts price up to +20%.
  const occ = clamp(Number(occupancyRatio) || 0.65, 0, 1);
  const demand = 0.95 + occ * 0.25;

  // 2. Lead-time — last-minute is premium; far-out is discounted.
  let leadTime = 1.0;
  if (checkIn) {
    const lead = Math.max(0, Math.round((checkIn - today) / 86400000));
    if (lead <= 2) leadTime = 1.08;
    else if (lead <= 7) leadTime = 1.04;
    else if (lead >= 60) leadTime = 0.92;
    else if (lead >= 30) leadTime = 0.94;
  }

  // 3. Weekend premium — average across the stay.
  let weekend = 1.0;
  if (checkIn && checkOut) {
    const nights = daysBetween(checkIn, checkOut);
    let weekendNights = 0;
    for (let i = 0; i < nights; i++) {
      const dow = new Date(checkIn.getTime() + i * 86400000).getDay();
      if (dow === 5 || dow === 6) weekendNights++; // Fri / Sat
    }
    weekend = 1 + (weekendNights / nights) * 0.06;
  }

  // 4. Seasonality — Istanbul peak is summer + Christmas/NYE.
  let season = 1.0;
  if (checkIn) {
    const m = checkIn.getMonth();
    if (PEAK_MONTHS.has(m)) season = 1.05;
    else if (SHOULDER_MONTHS.has(m)) season = 0.98;
  }

  // 5. Length-of-stay — light discount for 4+ nights.
  let lengthMul = 1.0;
  if (checkIn && checkOut) {
    const nights = daysBetween(checkIn, checkOut);
    if (nights >= 7) lengthMul = 0.95;
    else if (nights >= 4) lengthMul = 0.97;
  }

  // 6. Tiny per-room jitter so two identical rooms don't show the same price.
  const jitter = 1 + ((getDeterministicDiscountPercent(hotelId, roomCategory) - 7.5) / 100) * 0.20; // ±1.5%

  let recommended = base * demand * leadTime * weekend * season * lengthMul * jitter;

  // Vendor-set price band acts as a hard clamp; otherwise use ±15-45% of base.
  const floor = Number.isFinite(minPrice) && minPrice > 0 ? minPrice : base * 0.85;
  const ceiling = Number.isFinite(maxPrice) && maxPrice > floor ? maxPrice : base * 1.45;
  recommended = clamp(recommended, floor, ceiling);

  const effectiveDiscount = base > 0 ? ((base - recommended) / base) * 100 : 0;

  return {
    basePrice: Number(base.toFixed(2)),
    discountPercent: Number(effectiveDiscount.toFixed(2)),
    recommendedPrice: Number(recommended.toFixed(2)),
    savingsAmount: Number(Math.max(0, base - recommended).toFixed(2)),
    dynamicPrice: Number(recommended.toFixed(2)),
    roomCategory,
    priceBounds: {
      minPrice: Number.isFinite(minPrice) && minPrice > 0 ? Number(minPrice.toFixed(2)) : null,
      maxPrice: Number.isFinite(maxPrice) && maxPrice > 0 ? Number(maxPrice.toFixed(2)) : null,
      floorApplied: Number(floor.toFixed(2)),
    },
    factors: {
      demand: Number(demand.toFixed(3)),
      leadTime: Number(leadTime.toFixed(3)),
      weekend: Number(weekend.toFixed(3)),
      season: Number(season.toFixed(3)),
      lengthMul: Number(lengthMul.toFixed(3)),
    },
  };
};

const toRoomObject = (roomLike = {}, index = 0) => {
  const parsed = typeof roomLike === 'string' ? parseJsonLikeValue(roomLike) : roomLike;
  const room = parsed && typeof parsed === 'object' ? parsed : {};

  const roomName = room.room_name || room.roomNumber || room.room_number || room.name || room.category || `room-${index + 1}`;
  const roomCategory = room.room_category || room.category || 'unknown';
  const pricePerNight = toNumber(
    room.price_per_night ?? room.base_price ?? room.price ?? room.rentperday,
    0
  );

  const descStr = room.description || room.desc || '';
  const minPrice = toNumber(
    room.min_price ?? room.minPrice ?? room.min_amount ?? parseDescMeta(descStr, 'min_price'),
    null
  );
  const maxPrice = toNumber(
    room.max_price ?? room.maxPrice ?? room.max_amount ?? parseDescMeta(descStr, 'max_price'),
    null
  );

  return {
    id: room.id || null,
    room_number: roomName,
    room_name: roomName,
    category: roomCategory,
    room_category: roomCategory,
    price_per_night: pricePerNight,
    base_price: pricePerNight,
    min_price: Number.isFinite(minPrice) && minPrice > 0 ? minPrice : null,
    max_price: Number.isFinite(maxPrice) && maxPrice > 0 ? maxPrice : null,
    vendor_id: room.vendor_id || room.vendorid || room.vendorId || room.provider_id || room.providerid || null,
    tax_percent: toNumber(room.tax_percent ?? room.tax_rate ?? room.taxpercentage, 0),
    tax_amount: toNumber(room.tax_amount ?? room.taxes ?? room.tax_value ?? room.taxamount, 0),
    total_rooms: toInt(room.total_rooms ?? room.totalRooms),
    available_rooms: toInt(room.available_rooms ?? room.availableRooms),
    max_count: toInt(room.max_count ?? room.maxcount),
    is_available: typeof room.is_available === 'boolean' ? room.is_available : true,
    images: Array.isArray(room.images) ? room.images : []
  };
};

const getHotelRoomsForPricing = (hotel = {}) => {
  const directRooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
  if (directRooms.length) {
    return directRooms.map((room, index) => toRoomObject(room, index));
  }

  const detailsRoomCategories = hotel?.data?.details?.roomCategories;
  const rootRoomCategories = hotel.roomCategories;
  const roomCategories = Array.isArray(detailsRoomCategories)
    ? detailsRoomCategories
    : (Array.isArray(rootRoomCategories) ? rootRoomCategories : []);

  return roomCategories.map((category, index) => toRoomObject(category, index));
};

const getBasePriceIndex = async () => {
  const hasRoomCategoryTable = await hasPublicTable('hotel_room_categories');

  if (hasRoomCategoryTable) {
    const columns = await getTableColumns('hotel_room_categories');
    if (columns.size && columns.has('hotel_id') && columns.has('base_price')) {
      const hasRoomCategory = columns.has('room_category');
      const basePriceQuery = hasRoomCategory
        ? `
          SELECT hotel_id, room_category, AVG(base_price)::numeric(12,2) AS avg_base_price
          FROM hotel_room_categories
          WHERE base_price IS NOT NULL
          GROUP BY hotel_id, room_category
        `
        : `
          SELECT hotel_id, NULL::text AS room_category, AVG(base_price)::numeric(12,2) AS avg_base_price
          FROM hotel_room_categories
          WHERE base_price IS NOT NULL
          GROUP BY hotel_id
        `;

      try {
        const result = await pool.query(basePriceQuery);
        const index = new Map();
        result.rows.forEach((row) => {
          const hotelId = toInt(row.hotel_id);
          if (!hotelId) return;
          const roomCategory = normalizeRoomCategory(row.room_category || 'unknown');
          if (!index.has(hotelId)) index.set(hotelId, new Map());
          index.get(hotelId).set(roomCategory, Number(row.avg_base_price));
        });
        return index;
      } catch (error) {
        if (isUndefinedTableError(error, 'hotel_room_categories')) {
          clearTableColumnsCache('hotel_room_categories');
        } else {
          throw error;
        }
      }
    }
  }

  clearTableColumnsCache('hotel_room_categories');

  // Fallback: read from rooms table using rentperday/price_per_night column
  const roomCols = await getTableColumns('rooms');
  if (!roomCols.size) return new Map();

  const hotelIdCol = pickColumn(roomCols, ['hotel_id', 'hotelid', 'hotelId']);
  const priceCol = pickColumn(roomCols, ['rentperday', 'price_per_night', 'base_price', 'price']);
  const typeCol = pickColumn(roomCols, ['type', 'category', 'room_category']);

  if (!hotelIdCol || !priceCol) return new Map();

  const categorySelect = typeCol
    ? `"${typeCol}" AS room_category`
    : `NULL::text AS room_category`;
  const roomBasePriceQuery = `
    SELECT "${hotelIdCol}" AS hotel_id, ${categorySelect}, AVG("${priceCol}")::numeric(12,2) AS avg_base_price
    FROM rooms
    WHERE "${priceCol}" IS NOT NULL AND "${priceCol}" > 0
    GROUP BY "${hotelIdCol}"${typeCol ? `, "${typeCol}"` : ''}
  `;

  let roomResult;
  try {
    roomResult = await pool.query(roomBasePriceQuery);
  } catch (e) {
    return new Map();
  }

  const index = new Map();
  roomResult.rows.forEach((row) => {
    const hotelId = toInt(row.hotel_id);
    if (!hotelId) return;
    const roomCategory = normalizeRoomCategory(row.room_category || 'unknown');
    if (!index.has(hotelId)) index.set(hotelId, new Map());
    index.get(hotelId).set(roomCategory, Number(row.avg_base_price));
  });
  return index;
};

const buildAllHotelsRecommendedPricing = async ({
  status = 'active',
  forceRefresh = false,
  checkInDate = null,
  checkOutDate = null,
}) => {
  const now = Date.now();
  // Cache key is per-date so different stay windows don't share results.
  const cacheKey = `${status}|${checkInDate || 'no-in'}|${checkOutDate || 'no-out'}`;
  const cached = recommendedPricesCache.byKey?.get(cacheKey);
  if (!forceRefresh && cached && cached.expiresAt > now) {
    return { ...cached.payload, cache: { hit: true, expiresAt: cached.expiresAt } };
  }

  const hotelResult = await fetchHotels({ status, limit: 10000, offset: 0 });
  const basePriceIndex = await getBasePriceIndex();

  const hotelsWithRecommendations = hotelResult.rows.map((hotel) => {
    const hotelId = toInt(hotel.id);
    const basePricesByCategory = basePriceIndex.get(hotelId) || new Map();

    const rooms = getHotelRoomsForPricing(hotel);
    const sourceRooms = rooms.length
      ? rooms
      : Array.from(basePricesByCategory.entries()).map(([category, basePrice], index) => ({
          id: null,
          room_number: `${category}-${index + 1}`,
          category,
          price_per_night: basePrice,
          vendor_id: null,
          tax_percent: null,
          tax_amount: null
        }));

    const pricedRooms = sourceRooms.map((room) => {
      const roomCategory = normalizeRoomCategory(room.category);
      const baseFromCategory = basePricesByCategory.get(roomCategory);
      const fallbackBase = toNumber(room.price_per_night, 0);
      const basePrice = Number.isFinite(baseFromCategory) && baseFromCategory > 0
        ? baseFromCategory
        : fallbackBase;

      return {
        room,
        roomCategory,
        basePrice
      };
    }).filter((item) => Number.isFinite(item.basePrice) && item.basePrice > 0);

    const roomRecommendations = pricedRooms.map((item, index) => {
      const { room, roomCategory, basePrice } = item;

      const recommendation = computeRecommendedPrice({
        basePrice,
        hotelId,
        roomCategory,
        minPrice: toNumber(room.min_price, null),
        maxPrice: toNumber(room.max_price, null),
        checkInDate,
        checkOutDate,
      });

      const otherPrices = pricedRooms
        .filter((_, i) => i !== index)
        .map((entry) => entry.basePrice)
        .filter((price) => Number.isFinite(price) && price > 0);

      const averageOtherPrices = otherPrices.length
        ? Number((otherPrices.reduce((sum, price) => sum + price, 0) / otherPrices.length).toFixed(2))
        : Number(basePrice.toFixed(2));

      const vendorId = room.vendor_id || room.vendorid || room.vendorId || room.provider_id || room.providerid || `hotel-${hotelId}`;
      const taxPercent = toNumber(room.tax_percent ?? room.tax_rate ?? room.taxpercentage, 0);
      const explicitTaxAmount = toNumber(room.tax_amount ?? room.taxes ?? room.tax_value ?? room.taxamount, 0);
      const computedTaxAmount = explicitTaxAmount > 0
        ? explicitTaxAmount
        : Number(((recommendation.recommendedPrice * taxPercent) / 100).toFixed(2));
      const totalWithTaxes = Number((recommendation.recommendedPrice + computedTaxAmount).toFixed(2));

      return {
        roomId: room.id,
        roomNumber: room.room_number,
        category: room.category,
        vendorId,
        averageOtherPrices,
        taxes: {
          percent: Number(taxPercent.toFixed(2)),
          amount: computedTaxAmount,
          totalWithTaxes
        },
        ...recommendation
      };
    }).filter((item) => item.recommendedPrice !== null && typeof item.recommendedPrice !== 'undefined');

    return {
      hotelId: hotel.id,
      hotelName: hotel.name,
      recommendedPrices: roomRecommendations
    };
  });

  const payload = {
    status,
    generatedAt: now,
    ttlMs: RECOMMENDED_PRICES_CACHE_TTL_MS,
    checkInDate,
    checkOutDate,
    hotels: hotelsWithRecommendations,
    count: hotelsWithRecommendations.length
  };

  if (!recommendedPricesCache.byKey) recommendedPricesCache.byKey = new Map();
  recommendedPricesCache.byKey.set(cacheKey, {
    payload,
    expiresAt: now + RECOMMENDED_PRICES_CACHE_TTL_MS,
  });
  // Backwards-compat: keep the legacy single-payload slot in sync.
  recommendedPricesCache.payload = payload;
  recommendedPricesCache.expiresAt = now + RECOMMENDED_PRICES_CACHE_TTL_MS;

  return {
    ...payload,
    cache: { hit: false, expiresAt: now + RECOMMENDED_PRICES_CACHE_TTL_MS },
  };
};

const pickValue = (source, keys) => {
  if (!source || typeof source !== 'object') {
    return null;
  }

  for (const key of keys) {
    if (typeof source[key] !== 'undefined' && source[key] !== null && source[key] !== '') {
      return source[key];
    }
  }

  const normalizedEntries = Object.entries(source).reduce((acc, [key, value]) => {
    const normalizedKey = normalizeLookupKey(key);
    if (!acc.has(normalizedKey) && value !== null && value !== '') {
      acc.set(normalizedKey, value);
    }
    return acc;
  }, new Map());

  for (const key of keys) {
    const normalizedKey = normalizeLookupKey(key);
    if (normalizedEntries.has(normalizedKey)) {
      return normalizedEntries.get(normalizedKey);
    }
  }

  return null;
};

const parseStarRating = (value) => {
  const parsed = toInt(value);
  if (parsed === null) return null;
  return Math.max(1, Math.min(parsed, 5));
};

const parseJsonLikeValue = (value) => {
  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return value;
  }
  if (typeof value !== 'string') {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
};

const parseTimeString = (value) => {
  if (!value || typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{2}:\d{2})(?::\d{2})?$/);
  if (!match) return null;
  return `${match[1]}:00`;
};

const buildRoomCategoryWriteValue = (category = {}) => {
  const rawMin = category.min_price ?? category.minPrice ?? category.min_amount ?? category.minimumPrice ?? null;
  const rawMax = category.max_price ?? category.maxPrice ?? category.max_amount ?? category.maximumPrice ?? null;
  return {
    room_name: category.room_name || category.roomName || category.name || null,
    room_category: category.room_category || category.roomCategory || category.category || null,
    occupancy_code: category.occupancy_code || category.occupancyCode || null,
    occupancy_type: category.occupancy_type || category.occupancyType || 'unknown',
    base_price: toNumber(category.base_price ?? category.basePrice ?? category.price, 0),
    currency_code: category.currency_code || category.currencyCode || 'TRY',
    price_raw: category.price_raw || category.priceRaw || null,
    min_price: rawMin !== null ? toNumber(rawMin, null) : null,
    max_price: rawMax !== null ? toNumber(rawMax, null) : null
  };
};

const upsertRoomsTableFallback = async (client, hotelId, roomCategories = []) => {
  const roomCols = await getTableColumns('rooms');
  if (!roomCols.size) return [];

  const hotelIdCol = pickColumn(roomCols, ['hotel_id', 'hotelid', 'hotelId']);
  if (!hotelIdCol) return [];

  const nameCol = pickColumn(roomCols, ['name', 'room_name', 'room_number']);
  const typeCol = pickColumn(roomCols, ['type', 'category', 'room_category']);
  const priceCol = pickColumn(roomCols, ['rentperday', 'price_per_night', 'base_price', 'price']);
  const maxCountCol = pickColumn(roomCols, ['maxcount', 'max_count']);
  const descCol = pickColumn(roomCols, ['description']);
  const createdCol = pickColumn(roomCols, ['createdAt', 'created_at']);
  const updatedCol = pickColumn(roomCols, ['updatedAt', 'updated_at']);

  // Detect NOT NULL columns without a server-side default so we can supply safe values
  const notNullNoDefault = await client.query(
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_schema='public' AND table_name='rooms'
       AND is_nullable='NO' AND column_default IS NULL`
  );
  const requiredCols = {};
  notNullNoDefault.rows.forEach(({ column_name, data_type }) => {
    if (['bigint', 'integer', 'smallint', 'numeric', 'real', 'double precision'].some((t) => data_type.includes(t))) {
      requiredCols[column_name] = 0;
    } else if (data_type === 'boolean') {
      requiredCols[column_name] = false;
    } else {
      requiredCols[column_name] = '';
    }
  });

  await client.query(`DELETE FROM rooms WHERE "${hotelIdCol}" = $1`, [hotelId]);

  const preparedRows = roomCategories
    .map(buildRoomCategoryWriteValue)
    .filter((row) => row.room_name || row.room_category || row.base_price > 0);

  const inserted = [];
  for (const row of preparedRows) {
    // Start with any required NOT NULL defaults, then overwrite with real values
    const writeValues = { ...requiredCols, [hotelIdCol]: hotelId };
    if (nameCol) writeValues[nameCol] = row.room_name || row.room_category || 'Room';
    if (typeCol) writeValues[typeCol] = row.room_category || 'standard';
    if (priceCol && row.base_price > 0) writeValues[priceCol] = row.base_price;
    const occupancyMaxCount = row.occupancy_type === 'triple' ? 3 : row.occupancy_type === 'single' ? 1 : 2;
    if (maxCountCol) writeValues[maxCountCol] = occupancyMaxCount;
    const descParts = [];
    if (row.price_raw) descParts.push(row.price_raw);
    if (row.occupancy_type) descParts.push(`occupancy:${row.occupancy_type}`);
    if (row.occupancy_code) descParts.push(`code:${row.occupancy_code}`);
    if (row.currency_code) descParts.push(`currency:${row.currency_code}`);
    if (row.min_price != null && Number.isFinite(row.min_price)) descParts.push(`min_price:${row.min_price}`);
    if (row.max_price != null && Number.isFinite(row.max_price)) descParts.push(`max_price:${row.max_price}`);
    if (descCol) writeValues[descCol] = descParts.length ? descParts.join(' | ') : (row.room_name || 'Room');
    if (createdCol) writeValues[createdCol] = new Date().toISOString();
    if (updatedCol) writeValues[updatedCol] = new Date().toISOString();

    const columns = Object.keys(writeValues);
    const values = Object.values(writeValues);
    const placeholders = values.map((_, i) => `$${i + 1}`);
    const insertSql = `INSERT INTO rooms (${columns.map((c) => `"${c}"`).join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const result = await client.query(insertSql, values);
    if (result.rowCount) {
      const r = result.rows[0];
      inserted.push({
        id: r.id,
        hotel_id: hotelId,
        room_name: nameCol ? r[nameCol] : null,
        room_category: typeCol ? r[typeCol] : null,
        base_price: priceCol ? r[priceCol] : null,
        price_per_night: priceCol ? r[priceCol] : null
      });
    }
  }

  clearTableColumnsCache('rooms');
  return inserted;
};

const upsertHotelRoomCategories = async (client, hotelId, roomCategories = []) => {
  if (!hotelId || !Array.isArray(roomCategories)) {
    return [];
  }

  const hasRoomCategoryTable = await hasPublicTable('hotel_room_categories');
  if (!hasRoomCategoryTable) {
    clearTableColumnsCache('hotel_room_categories');
    return upsertRoomsTableFallback(client, hotelId, roomCategories);
  }

  const roomCategoryCols = await getTableColumns('hotel_room_categories');
  if (!roomCategoryCols.size || !roomCategoryCols.has('hotel_id')) {
    return upsertRoomsTableFallback(client, hotelId, roomCategories);
  }

  try {
    await client.query('DELETE FROM hotel_room_categories WHERE hotel_id = $1', [hotelId]);
  } catch (error) {
    if (isUndefinedTableError(error, 'hotel_room_categories')) {
      clearTableColumnsCache('hotel_room_categories');
      return upsertRoomsTableFallback(client, hotelId, roomCategories);
    }
    throw error;
  }

  const preparedRows = roomCategories
    .map(buildRoomCategoryWriteValue)
    .filter((row) => row.room_name || row.room_category || row.base_price > 0);

  const inserted = [];
  for (const row of preparedRows) {
    const writeValues = { hotel_id: hotelId };
    if (roomCategoryCols.has('room_name') && row.room_name) writeValues.room_name = row.room_name;
    if (roomCategoryCols.has('room_category') && row.room_category) writeValues.room_category = row.room_category;
    if (roomCategoryCols.has('occupancy_code') && row.occupancy_code) writeValues.occupancy_code = row.occupancy_code;
    if (roomCategoryCols.has('occupancy_type') && row.occupancy_type) writeValues.occupancy_type = row.occupancy_type;
    if (roomCategoryCols.has('base_price') && Number.isFinite(row.base_price)) writeValues.base_price = row.base_price;
    if (roomCategoryCols.has('currency_code') && row.currency_code) writeValues.currency_code = row.currency_code;
    if (roomCategoryCols.has('price_raw') && row.price_raw) writeValues.price_raw = row.price_raw;

    const columns = Object.keys(writeValues);
    const values = Object.values(writeValues);
    const placeholders = values.map((_, index) => `$${index + 1}`);
    const insertSql = `
      INSERT INTO hotel_room_categories (${columns.map((column) => `"${column}"`).join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;
    let result;
    try {
      result = await client.query(insertSql, values);
    } catch (error) {
      if (isUndefinedTableError(error, 'hotel_room_categories')) {
        clearTableColumnsCache('hotel_room_categories');
        return upsertRoomsTableFallback(client, hotelId, roomCategories);
      }
      throw error;
    }
    if (result.rowCount) {
      inserted.push(result.rows[0]);
    }
  }

  return inserted;
};

const normalizeAmenitiesInput = (value) => {
  if (value === null || typeof value === 'undefined' || value === '') return null;

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .map((name) => ({ name }));
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (!item) return null;
        if (typeof item === 'string') {
          try {
            const parsed = JSON.parse(item);
            if (parsed && typeof parsed === 'object' && parsed.name) {
              return { name: String(parsed.name).trim() };
            }
            return { name: item.trim() };
          } catch (_error) {
            return { name: item.trim() };
          }
        }
        if (typeof item === 'object' && item.name) {
          return { name: String(item.name).trim() };
        }
        return null;
      })
      .filter((item) => item && item.name);
  }

  return null;
};

const normalizeRoomCategoriesInput = (value) => {
  if (value === null || typeof value === 'undefined' || value === '') return null;

  if (typeof value === 'string') {
    const parsed = parseJsonLikeValue(value);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return null;
  }

  if (Array.isArray(value)) {
    return value.filter((item) => item && typeof item === 'object');
  }

  return null;
};

const setWritableValue = (target, columnName, value) => {
  if (!columnName || typeof value === 'undefined' || value === null || value === '') {
    return;
  }

  target[columnName] = value;
};

const extractTimesFromCombinedText = (text) => {
  if (!text || typeof text !== 'string') {
    return { checkInTime: null, checkOutTime: null };
  }

  const matches = text.match(/\b\d{2}:\d{2}(?::\d{2})?\b/g) || [];
  const first = matches[0] ? parseTimeString(matches[0]) : null;
  const second = matches[1] ? parseTimeString(matches[1]) : null;

  return {
    checkInTime: first,
    checkOutTime: second
  };
};

const normalizeHotelInput = (source = {}) => {
  const contact = pickValue(source, ['contact', 'CONTACT', 'contact_phone', 'contactPhone']);
  const email = pickValue(source, ['email', 'E-Mail ADDRESS', 'contact_email', 'contactEmail']);
  const roomTypes = pickValue(source, ['ROOM TYPES', 'roomTypes', 'room_types']);
  const prices = pickValue(source, ['PRICES', 'prices']);
  const hotelLink = pickValue(source, ['HOTEL LINK', 'hotel_link', 'hotelLink', 'link']);
  const amenities = normalizeAmenitiesInput(pickValue(source, ['HOTEL AMENITIES', 'amenities']));
  const starRating = parseStarRating(pickValue(source, ['STAR RATINGS', 'star_rating', 'starRating', 'rating']));
  const images = parseJsonLikeValue(pickValue(source, ['images', 'image', 'IMAGE']));
  const roomCategories = normalizeRoomCategoriesInput(pickValue(source, ['room_categories', 'roomCategories']));
  const informationRaw = pickValue(source, ['information_raw', 'INFORMATION']);
  const contactRaw = pickValue(source, ['contact_raw', 'CONTACT']);
  const contactName = pickValue(source, ['contact_name', 'contactName']);
  const contactPhone = pickValue(source, ['contact_phone', 'contactPhone', 'CONTACT']);
  const propertyLabelRaw = pickValue(source, ['property_label_raw', 'propertyLabelRaw']);
  const checkInTime = parseTimeString(pickValue(source, ['check_in_time', 'checkInTime']));
  const checkOutTime = parseTimeString(pickValue(source, ['check_out_time', 'checkOutTime']));
  const checkInOutRaw = pickValue(source, ['check_in_out_raw', 'checkInOutRaw', 'CHECK IN AND CHECK OUT']);
  const childPolicy = pickValue(source, ['child_policy', 'childPolicy']);
  const petPolicy = pickValue(source, ['pet_policy', 'petPolicy']);
  const smokingPolicy = pickValue(source, ['smoking_policy', 'smokingPolicy']);

  const mapped = {
    hotelId: pickValue(source, ['hotel_id', 'hotelId']),
    status: pickValue(source, ['status']),
    managerId: pickValue(source, ['manager_id', 'managerId']),
    name: pickValue(source, ['name', 'displayName', 'hotel_name', 'HOTEL NAMES', 'HOTEL NAME']),
    address: pickValue(source, ['address', 'location', 'LOCATION', 'location_raw']),
    description: pickValue(source, ['description', 'HOTEL DESCRIPTON', 'HOTEL DESCRIPTION', 'hotel_description']),
    googleMapsLink: pickValue(source, ['googleMapsLink', 'google_maps_link', 'GOOGLE MAPS LINK']),
    contact,
    email,
    roomTypes,
    prices,
    hotelLink,
    amenities,
    starRating,
    images,
    roomCategories,
    informationRaw,
    contactRaw,
    contactName,
    contactPhone,
    propertyLabelRaw,
    checkInTime,
    checkOutTime,
    checkInOutRaw,
    childPolicy,
    petPolicy,
    smokingPolicy
  };

  const totalRooms = parseTotalRooms(
    pickValue(source, ['INFORMATION', 'total_rooms', 'totalRooms', 'TOTAL ROOMS'])
  );

  const combinedTimes = extractTimesFromCombinedText(checkInOutRaw);
  const resolvedCheckInTime = checkInTime || combinedTimes.checkInTime;
  const resolvedCheckOutTime = checkOutTime || combinedTimes.checkOutTime;

  const hasMappedDataFields = Boolean(
    mapped.name ||
    mapped.address ||
    mapped.description ||
    totalRooms !== null ||
    source['HOTEL NAMES'] ||
    source['INFORMATION'] ||
    contact ||
    email ||
    roomTypes ||
    prices ||
    hotelLink ||
    mapped.googleMapsLink ||
    starRating !== null ||
    amenities ||
    roomCategories ||
    resolvedCheckInTime ||
    resolvedCheckOutTime
  );

  return {
    ...mapped,
    totalRooms,
    checkInTime: resolvedCheckInTime,
    checkOutTime: resolvedCheckOutTime,
    hasDataPayload: hasMappedDataFields,
    raw: source
  };
};

const mapHotelRecord = (row, meta) => {
  const data = row.data || null;
  const details = data?.details || {};
  const location = data?.location || {};
  const basicInfo = data?.basicInfo || {};
  const extractedTimes = extractTimesFromCombinedText(
    (meta.checkInOutRawCol ? row[meta.checkInOutRawCol] : null) || details.checkInOutRaw || null
  );
  const normalizedAmenities = normalizeAmenitiesInput(
    (meta.amenitiesCol ? row[meta.amenitiesCol] : null) || details.amenities || null
  );

  return {
    id: row.id,
    hotelId: meta.hotelIdCol ? row[meta.hotelIdCol] : row.hotel_id || null,
    status: meta.statusCol ? row[meta.statusCol] : row.status || 'active',
    managerId: meta.managerCol ? row[meta.managerCol] : row.manager_id || null,
    name: (meta.nameCol ? row[meta.nameCol] : null) || data?.name?.displayName || 'Unnamed Hotel',
    location: (meta.locationCol ? row[meta.locationCol] : null) || (meta.addressCol ? row[meta.addressCol] : null) || location.addressText || 'Address not provided',
    address: (meta.addressCol ? row[meta.addressCol] : null) || (meta.locationCol ? row[meta.locationCol] : null) || location.addressText || 'Address not provided',
    description: (meta.descriptionCol ? row[meta.descriptionCol] : null) || basicInfo.descriptionShort || null,
    totalRooms: (meta.totalRoomsCol ? row[meta.totalRoomsCol] : null) ?? details.totalRooms ?? null,
    informationRaw: (meta.informationRawCol ? row[meta.informationRawCol] : null) || details.informationRaw || null,
    contactRaw: (meta.contactRawCol ? row[meta.contactRawCol] : null) || details.contactRaw || null,
    contactName: (meta.contactNameCol ? row[meta.contactNameCol] : null) || details.contactName || null,
    contactPhone:
      (meta.contactPhoneCol ? row[meta.contactPhoneCol] : null) ||
      details.contactPhone ||
      details.contact ||
      null,
    contact:
      (meta.contactRawCol ? row[meta.contactRawCol] : null) ||
      (meta.contactPhoneCol ? row[meta.contactPhoneCol] : null) ||
      details.contact ||
      null,
    email: (meta.emailCol ? row[meta.emailCol] : null) || details.email || null,
    hotelLink: (meta.hotelLinkCol ? row[meta.hotelLinkCol] : null) || details.hotelLink || null,
    googleMapsLink: (meta.googleMapsLinkCol ? row[meta.googleMapsLinkCol] : null) || details.googleMapsLink || null,
    starRating: (meta.starRatingCol ? row[meta.starRatingCol] : null) ?? details.starRatings ?? null,
    propertyLabelRaw: (meta.propertyLabelRawCol ? row[meta.propertyLabelRawCol] : null) || details.propertyLabelRaw || null,
    amenities: normalizedAmenities,
    roomCategories: details.roomCategories || null,
    checkInTime:
      (meta.checkInTimeCol ? row[meta.checkInTimeCol] : null) ||
      details.checkInTime ||
      extractedTimes.checkInTime ||
      null,
    checkOutTime:
      (meta.checkOutTimeCol ? row[meta.checkOutTimeCol] : null) ||
      details.checkOutTime ||
      extractedTimes.checkOutTime ||
      null,
    childPolicy: (meta.childPolicyCol ? row[meta.childPolicyCol] : null) || details.childPolicy || null,
    petPolicy: (meta.petPolicyCol ? row[meta.petPolicyCol] : null) || details.petPolicy || null,
    smokingPolicy: (meta.smokingPolicyCol ? row[meta.smokingPolicyCol] : null) || details.smokingPolicy || null,
    createdAt: meta.hotelCreatedCol ? row[meta.hotelCreatedCol] : row.created_at || row.createdAt || null,
    updatedAt: meta.hotelUpdatedCol ? row[meta.hotelUpdatedCol] : row.updated_at || row.updatedAt || null
  };
};

const getHotelMeta = async () => {
  const hotelCols = await getTableColumns('hotels');
  const roomCategoriesTableExists = await hasPublicTable('hotel_room_categories');
  const roomsTableExists = await hasPublicTable('rooms');
  const roomCategoryCols = roomCategoriesTableExists ? await getTableColumns('hotel_room_categories') : new Set();
  const roomCols = roomsTableExists ? await getTableColumns('rooms') : new Set();

  if (!roomCategoriesTableExists) {
    clearTableColumnsCache('hotel_room_categories');
  }
  if (!roomsTableExists) {
    clearTableColumnsCache('rooms');
  }

  const hotelIdCol = pickColumn(hotelCols, ['hotel_id']);
  const statusCol = pickColumn(hotelCols, ['status']);
  const managerCol = pickColumn(hotelCols, ['manager_id', 'managerId']);
  const createdCol = pickColumn(hotelCols, ['created_at', 'createdAt']);
  const updatedCol = pickColumn(hotelCols, ['updated_at', 'updatedAt']);
  const nameCol = pickColumn(hotelCols, ['name', 'hotel_name']);
  const addressCol = pickColumn(hotelCols, ['address', 'location_raw']);
  const locationCol = pickColumn(hotelCols, ['location', 'location_raw']);
  const descriptionCol = pickColumn(hotelCols, ['description', 'information', 'hotel_description']);
  const informationRawCol = pickColumn(hotelCols, ['information_raw', 'information']);
  const totalRoomsCol = pickColumn(hotelCols, ['total_rooms', 'totalRooms']);
  const googleMapsLinkCol = pickColumn(hotelCols, ['google_maps_link', 'googleMapsLink', 'map_link', 'maps_link']);
  const contactRawCol = pickColumn(hotelCols, ['contact', 'contact_raw']);
  const contactNameCol = pickColumn(hotelCols, ['contact_name']);
  const contactPhoneCol = pickColumn(hotelCols, ['contact_phone']);
  const emailCol = pickColumn(hotelCols, ['email', 'contact_email']);
  const hotelLinkCol = pickColumn(hotelCols, ['hotel_link', 'link']);
  const starRatingCol = pickColumn(hotelCols, ['star_rating', 'starRating', 'rating']);
  const propertyLabelRawCol = pickColumn(hotelCols, ['property_label_raw']);
  const amenitiesCol = pickColumn(hotelCols, ['amenities']);
  const checkInTimeCol = pickColumn(hotelCols, ['check_in_time']);
  const checkOutTimeCol = pickColumn(hotelCols, ['check_out_time']);
  const checkInOutRawCol = pickColumn(hotelCols, ['check_in_out_raw']);
  const childPolicyCol = pickColumn(hotelCols, ['child_policy']);
  const petPolicyCol = pickColumn(hotelCols, ['pet_policy']);
  const smokingPolicyCol = pickColumn(hotelCols, ['smoking_policy']);

  const roomHotelIdCol = pickColumn(roomCategoryCols, ['hotel_id']);
  const roomHotelIdAnyCol = roomHotelIdCol || pickColumn(roomCategoryCols, ['hotelid', 'hotelId']);
  const roomCategoryCol = pickColumn(roomCategoryCols, ['room_category', 'category', 'type']);
  const roomNameCol = pickColumn(roomCategoryCols, ['room_name', 'name']);
  const roomPriceCol = pickColumn(roomCategoryCols, ['base_price', 'price_per_night', 'rentperday', 'price']);
  const roomCurrencyCol = pickColumn(roomCategoryCols, ['currency_code', 'currency']);
  const occupancyCodeCol = pickColumn(roomCategoryCols, ['occupancy_code']);
  const occupancyTypeCol = pickColumn(roomCategoryCols, ['occupancy_type']);
  const priceRawCol = pickColumn(roomCategoryCols, ['price_raw']);
  const roomCreatedCol = pickColumn(roomCategoryCols, ['created_at', 'createdAt']);
  const roomUpdatedCol = pickColumn(roomCategoryCols, ['updated_at', 'updatedAt']);
  const roomVendorIdCol = pickColumn(roomCategoryCols, ['vendor_id', 'vendorid', 'vendorId', 'provider_id', 'providerid']);
  const roomTaxPercentCol = pickColumn(roomCategoryCols, ['tax_percent', 'tax_rate', 'taxpercentage']);
  const roomTaxAmountCol = pickColumn(roomCategoryCols, ['tax_amount', 'taxes', 'tax_value', 'taxamount']);

  const roomTableHotelIdCol = pickColumn(roomCols, ['hotel_id', 'hotelid', 'hotelId']);
  const roomTableCategoryCol = pickColumn(roomCols, ['category', 'room_category', 'type']);
  const roomTableNameCol = pickColumn(roomCols, ['room_number', 'room_name', 'name', 'category']);
  const roomTablePriceCol = pickColumn(roomCols, ['price_per_night', 'rentperday', 'base_price', 'price']);
  const roomTableCurrencyCol = pickColumn(roomCols, ['currency_code', 'currency']);
  const roomTableMaxCountCol = pickColumn(roomCols, ['max_count', 'maxcount']);
  const roomTableTotalRoomsCol = pickColumn(roomCols, ['total_rooms', 'totalRooms']);
  const roomTableAvailableRoomsCol = pickColumn(roomCols, ['available_rooms', 'availableRooms']);
  const roomTableVendorIdCol = pickColumn(roomCols, ['vendor_id', 'vendorid', 'vendorId', 'provider_id', 'providerid']);
  const roomTableTaxPercentCol = pickColumn(roomCols, ['tax_percent', 'tax_rate', 'taxpercentage']);
  const roomTableTaxAmountCol = pickColumn(roomCols, ['tax_amount', 'taxes', 'tax_value', 'taxamount']);
  const roomTableIsAvailableCol = pickColumn(roomCols, ['is_available']);
  const roomTableImagesCol = pickColumn(roomCols, ['images', 'imageurls']);
  const roomTableCreatedCol = pickColumn(roomCols, ['created_at', 'createdAt']);
  const roomTableUpdatedCol = pickColumn(roomCols, ['updated_at', 'updatedAt']);

  return {
    hotelCols,
    hotelIdCol,
    statusCol,
    managerCol,
    nameCol,
    addressCol,
    locationCol,
    descriptionCol,
    informationRawCol,
    totalRoomsCol,
    googleMapsLinkCol,
    contactRawCol,
    contactNameCol,
    contactPhoneCol,
    emailCol,
    hotelLinkCol,
    starRatingCol,
    propertyLabelRawCol,
    amenitiesCol,
    checkInTimeCol,
    checkOutTimeCol,
    checkInOutRawCol,
    childPolicyCol,
    petPolicyCol,
    smokingPolicyCol,
    hotelIdExpr: expr('h', hotelIdCol, `NULL::text`),
    hotelStatusExpr: expr('h', statusCol, `'active'::text`),
    hotelManagerExpr: expr('h', managerCol, `NULL::int`),
    hotelUpdatedExpr: expr('h', updatedCol, `NOW()`),
    hotelCreatedCol: createdCol,
    hotelUpdatedCol: updatedCol,
    hasStatus: Boolean(statusCol),
    hasRoomCategoriesTable: roomCategoriesTableExists && roomCategoryCols.size > 0,
    hasRoomsTable: roomsTableExists && roomCols.size > 0 && Boolean(roomTableHotelIdCol),
    roomJoinCondition: roomHotelIdAnyCol ? `rc."${roomHotelIdAnyCol}" = base.id` : 'FALSE',
    roomHotelIdExpr: expr('rc', roomHotelIdAnyCol, `NULL::int`),
    roomCategoryExpr: expr('rc', roomCategoryCol, `NULL::text`),
    roomNameExpr: expr('rc', roomNameCol, `NULL::text`),
    roomPriceExpr: expr('rc', roomPriceCol, `NULL::numeric`),
    roomCurrencyExpr: expr('rc', roomCurrencyCol, `NULL::text`),
    occupancyCodeExpr: expr('rc', occupancyCodeCol, `NULL::text`),
    occupancyTypeExpr: expr('rc', occupancyTypeCol, `NULL::text`),
    priceRawExpr: expr('rc', priceRawCol, `NULL::text`),
    roomVendorIdExpr: expr('rc', roomVendorIdCol, `NULL::text`),
    roomTaxPercentExpr: expr('rc', roomTaxPercentCol, `NULL::numeric`),
    roomTaxAmountExpr: expr('rc', roomTaxAmountCol, `NULL::numeric`),
    roomCreatedExpr: expr('rc', roomCreatedCol, `NULL::timestamptz`),
    roomUpdatedExpr: expr('rc', roomUpdatedCol, `NULL::timestamptz`),
    roomTableJoinCondition: roomTableHotelIdCol ? `r."${roomTableHotelIdCol}" = base.id` : 'FALSE',
    roomTableHotelIdExpr: expr('r', roomTableHotelIdCol, `NULL::int`),
    roomTableCategoryExpr: expr('r', roomTableCategoryCol, `NULL::text`),
    roomTableNameExpr: expr('r', roomTableNameCol, `NULL::text`),
    roomTablePriceExpr: expr('r', roomTablePriceCol, `NULL::numeric`),
    roomTableCurrencyExpr: expr('r', roomTableCurrencyCol, `NULL::text`),
    roomTableMaxCountExpr: expr('r', roomTableMaxCountCol, `NULL::int`),
    roomTableTotalRoomsExpr: expr('r', roomTableTotalRoomsCol, `NULL::int`),
    roomTableAvailableRoomsExpr: expr('r', roomTableAvailableRoomsCol, `NULL::int`),
    roomTableVendorIdExpr: expr('r', roomTableVendorIdCol, `NULL::text`),
    roomTableTaxPercentExpr: expr('r', roomTableTaxPercentCol, `NULL::numeric`),
    roomTableTaxAmountExpr: expr('r', roomTableTaxAmountCol, `NULL::numeric`),
    roomTableIsAvailableExpr: expr('r', roomTableIsAvailableCol, 'true'),
    roomTableImagesExpr: expr('r', roomTableImagesCol, `'[]'::json`),
    roomTableCreatedExpr: expr('r', roomTableCreatedCol, `NULL::timestamptz`),
    roomTableUpdatedExpr: expr('r', roomTableUpdatedCol, `NULL::timestamptz`)
  };
};

const fetchHotels = async ({ status = 'active', limit = 50, offset = 0, managerId, _retryWithoutRoomCategories = false }) => {
  const meta = await getHotelMeta();
  const whereClauses = [];
  const params = [];

  if (meta.hasStatus && status) {
    whereClauses.push(`${meta.hotelStatusExpr} = $${params.length + 1}`);
    params.push(status);
  }

  if (typeof managerId !== 'undefined') {
    if (!meta.managerCol) {
      return { rows: [], total: 0, managerMissing: true };
    }
    whereClauses.push(`${meta.hotelManagerExpr} = $${params.length + 1}`);
    params.push(toInt(managerId));
  }

  const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const baseUpdatedExpr = meta.hotelUpdatedCol ? `base."${meta.hotelUpdatedCol}"` : 'NOW()';

  const baseSql = `
    SELECT h.*
    FROM hotels h
    ${whereSql}
    ORDER BY ${meta.hotelUpdatedExpr} DESC, h.id DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const shouldUseRoomCategories = meta.hasRoomCategoriesTable && !_retryWithoutRoomCategories;

  const roomDataJoinSql = shouldUseRoomCategories
    ? `
    LEFT JOIN LATERAL (
      SELECT json_agg(
        json_build_object(
          'id', rc.id,
          'hotel_id', ${meta.roomHotelIdExpr},
          'room_name', ${meta.roomNameExpr},
          'room_category', ${meta.roomCategoryExpr},
          'occupancy_code', ${meta.occupancyCodeExpr},
          'occupancy_type', ${meta.occupancyTypeExpr},
          'base_price', ${meta.roomPriceExpr},
          'currency_code', ${meta.roomCurrencyExpr},
          'price_raw', ${meta.priceRawExpr},
          'category', ${meta.roomCategoryExpr},
          'max_count', NULL,
          'total_rooms', NULL,
          'available_rooms', NULL,
          'price_per_night', ${meta.roomPriceExpr},
          'vendor_id', ${meta.roomVendorIdExpr},
          'tax_percent', ${meta.roomTaxPercentExpr},
          'tax_amount', ${meta.roomTaxAmountExpr},
          'is_available', true,
          'images', '[]'::json,
          'room_number', ${meta.roomNameExpr},
          'created_at', ${meta.roomCreatedExpr},
          'updated_at', ${meta.roomUpdatedExpr}
        ) ORDER BY rc.id
      ) AS rooms
      FROM hotel_room_categories rc
      WHERE ${meta.roomJoinCondition}
    ) room_data ON true`
    : meta.hasRoomsTable
      ? `
    LEFT JOIN LATERAL (
      SELECT json_agg(
        json_build_object(
          'id', r.id,
          'hotel_id', ${meta.roomTableHotelIdExpr},
          'room_name', ${meta.roomTableNameExpr},
          'room_category', ${meta.roomTableCategoryExpr},
          'occupancy_code', NULL,
          'occupancy_type', NULL,
          'base_price', ${meta.roomTablePriceExpr},
          'currency_code', ${meta.roomTableCurrencyExpr},
          'price_raw', NULL,
          'category', ${meta.roomTableCategoryExpr},
          'max_count', ${meta.roomTableMaxCountExpr},
          'total_rooms', ${meta.roomTableTotalRoomsExpr},
          'available_rooms', ${meta.roomTableAvailableRoomsExpr},
          'price_per_night', ${meta.roomTablePriceExpr},
          'vendor_id', ${meta.roomTableVendorIdExpr},
          'tax_percent', ${meta.roomTableTaxPercentExpr},
          'tax_amount', ${meta.roomTableTaxAmountExpr},
          'is_available', ${meta.roomTableIsAvailableExpr},
          'images', ${meta.roomTableImagesExpr},
          'room_number', ${meta.roomTableNameExpr},
          'created_at', ${meta.roomTableCreatedExpr},
          'updated_at', ${meta.roomTableUpdatedExpr}
        ) ORDER BY r.id
      ) AS rooms
      FROM rooms r
      WHERE ${meta.roomTableJoinCondition}
    ) room_data ON true`
    : `
    LEFT JOIN LATERAL (
      SELECT '[]'::json AS rooms
    ) room_data ON true`;

  const listSql = `
    SELECT
      base.*,
      COALESCE(room_data.rooms, '[]'::json) AS rooms
    FROM (${baseSql}) base
    ${roomDataJoinSql}
    ORDER BY ${baseUpdatedExpr} DESC, base.id DESC
  `;

  const listParams = [...params, toInt(limit) || 50, toInt(offset) || 0];
  let listResult;
  try {
    listResult = await pool.query(listSql, listParams);
  } catch (error) {
    if (!_retryWithoutRoomCategories && isUndefinedTableError(error, 'hotel_room_categories')) {
      clearTableColumnsCache('hotel_room_categories');
      return fetchHotels({ status, limit, offset, managerId, _retryWithoutRoomCategories: true });
    }
    throw error;
  }

  const countSql = `SELECT COUNT(*) FROM hotels h ${whereSql}`;
  const countResult = await pool.query(countSql, params);

  return {
    rows: listResult.rows,
    total: parseInt(countResult.rows[0].count, 10),
    managerMissing: false
  };
};

const getPublicHotels = async (req, res) => {
  try {
    const { status = 'active', limit = 50, offset = 0, includeRecommendedPrices = 'true', refreshPrices = 'false' } = req.query;
    const result = await fetchHotels({ status, limit, offset });
    const meta = await getHotelMeta();

    const normalizedHotels = result.rows.map((hotelRow) => {
      const mapped = mapHotelRecord(hotelRow, meta);
      const normalizedAmenities = normalizeAmenitiesInput(hotelRow.amenities ?? mapped.amenities) || [];
      const normalizedRooms = getHotelRoomsForPricing({
        ...hotelRow,
        roomCategories: mapped.roomCategories
      });

      const roomCategories = normalizedRooms.map((room) => ({
        room_name: room.room_name || room.room_number,
        room_category: room.room_category || room.category || 'unknown',
        base_price: toNumber(room.base_price ?? room.price_per_night, 0),
        currency_code: room.currency_code || 'TRY'
      }));

      return {
        ...hotelRow,
        name: hotelRow.name || mapped.name,
        location: hotelRow.location || mapped.location,
        address: hotelRow.address || mapped.address,
        description: hotelRow.description || mapped.description,
        totalRooms: hotelRow.totalRooms ?? hotelRow.total_rooms ?? mapped.totalRooms ?? null,
        amenities: normalizedAmenities,
        rooms: normalizedRooms,
        roomCategories,
        check_in_time: hotelRow.check_in_time || mapped.checkInTime,
        check_out_time: hotelRow.check_out_time || mapped.checkOutTime
      };
    });

    let recommendedByHotelId = null;
    if (String(includeRecommendedPrices).toLowerCase() === 'true') {
      const pricing = await buildAllHotelsRecommendedPricing({
        status,
        forceRefresh: String(refreshPrices).toLowerCase() === 'true'
      });
      recommendedByHotelId = new Map(
        pricing.hotels.map((item) => [String(item.hotelId), item.recommendedPrices])
      );
    }

    const hotels = recommendedByHotelId
      ? normalizedHotels.map((hotel) => attachImageKitUrls({
          ...hotel,
          recommendedPrices: recommendedByHotelId.get(String(hotel.id)) || []
        }))
      : normalizedHotels.map(attachImageKitUrls);

    return res.json({
      hotels,
      count: result.total,
      limit: toInt(limit) || 50,
      offset: toInt(offset) || 0
    });
  } catch (error) {
    console.error('Error fetching public hotels:', error);
    return res.status(400).json({ error: error.message });
  }
};

const getPublicHotelById = async (req, res) => {
  try {
    const { id } = req.params;
    const hotelId = toInt(id);
    if (!hotelId) {
      return res.status(400).json({ error: 'Invalid hotel id' });
    }

    const meta = await getHotelMeta();
    const whereClauses = ['h.id = $1'];
    const params = [hotelId];

    if (meta.hasStatus) {
      whereClauses.push(`${meta.hotelStatusExpr} = $2`);
      params.push('active');
    }

    const whereSql = `WHERE ${whereClauses.join(' AND ')}`;

    const shouldUseRoomCategories = meta.hasRoomCategoriesTable;
    const roomJoinConditionForSingle = String(meta.roomJoinCondition || 'FALSE').replace(/\bbase\./g, 'h.');
    const roomTableJoinConditionForSingle = String(meta.roomTableJoinCondition || 'FALSE').replace(/\bbase\./g, 'h.');
    const roomDataJoinSql = shouldUseRoomCategories
      ? `
    LEFT JOIN LATERAL (
      SELECT json_agg(
        json_build_object(
          'id', rc.id,
          'hotel_id', ${meta.roomHotelIdExpr},
          'room_name', ${meta.roomNameExpr},
          'room_category', ${meta.roomCategoryExpr},
          'occupancy_code', ${meta.occupancyCodeExpr},
          'occupancy_type', ${meta.occupancyTypeExpr},
          'base_price', ${meta.roomPriceExpr},
          'currency_code', ${meta.roomCurrencyExpr},
          'price_raw', ${meta.priceRawExpr},
          'category', ${meta.roomCategoryExpr},
          'max_count', NULL,
          'total_rooms', NULL,
          'available_rooms', NULL,
          'price_per_night', ${meta.roomPriceExpr},
          'vendor_id', ${meta.roomVendorIdExpr},
          'is_available', true,
          'images', '[]'::json,
          'room_number', ${meta.roomNameExpr}
        ) ORDER BY rc.id
      ) AS rooms
      FROM hotel_room_categories rc
      WHERE ${roomJoinConditionForSingle}
    ) room_data ON true`
      : meta.hasRoomsTable
        ? `
    LEFT JOIN LATERAL (
      SELECT json_agg(
        json_build_object(
          'id', r.id,
          'hotel_id', ${meta.roomTableHotelIdExpr},
          'room_name', ${meta.roomTableNameExpr},
          'room_category', ${meta.roomTableCategoryExpr},
          'occupancy_code', NULL,
          'occupancy_type', NULL,
          'base_price', ${meta.roomTablePriceExpr},
          'currency_code', ${meta.roomTableCurrencyExpr},
          'price_raw', NULL,
          'category', ${meta.roomTableCategoryExpr},
          'max_count', ${meta.roomTableMaxCountExpr},
          'total_rooms', ${meta.roomTableTotalRoomsExpr},
          'available_rooms', ${meta.roomTableAvailableRoomsExpr},
          'price_per_night', ${meta.roomTablePriceExpr},
          'is_available', ${meta.roomTableIsAvailableExpr},
          'images', ${meta.roomTableImagesExpr},
          'room_number', ${meta.roomTableNameExpr}
        ) ORDER BY r.id
      ) AS rooms
      FROM rooms r
      WHERE ${roomTableJoinConditionForSingle}
    ) room_data ON true`
        : `
    LEFT JOIN LATERAL (
      SELECT '[]'::json AS rooms
    ) room_data ON true`;

    const sql = `
      SELECT
        h.*,
        COALESCE(room_data.rooms, '[]'::json) AS rooms
      FROM hotels h
      ${roomDataJoinSql}
      ${whereSql}
      LIMIT 1
    `;

    const result = await pool.query(sql, params);
    if (!result.rowCount) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const hotelRow = result.rows[0];
    const mapped = mapHotelRecord(hotelRow, meta);
    const normalizedAmenities = normalizeAmenitiesInput(hotelRow.amenities ?? mapped.amenities) || [];
    const normalizedRooms = getHotelRoomsForPricing({ ...hotelRow, roomCategories: mapped.roomCategories });

    const roomCategories = normalizedRooms.map((room) => ({
      room_name: room.room_name || room.room_number,
      room_category: room.room_category || room.category || 'unknown',
      base_price: toNumber(room.base_price ?? room.price_per_night, 0),
      currency_code: room.currency_code || 'TRY'
    }));

    const hotel = {
      ...hotelRow,
      name: hotelRow.name || mapped.name,
      location: hotelRow.location || mapped.location,
      address: hotelRow.address || mapped.address,
      description: hotelRow.description || mapped.description,
      totalRooms: hotelRow.totalRooms ?? hotelRow.total_rooms ?? mapped.totalRooms ?? null,
      amenities: normalizedAmenities,
      rooms: normalizedRooms,
      roomCategories,
      check_in_time: hotelRow.check_in_time || mapped.checkInTime,
      check_out_time: hotelRow.check_out_time || mapped.checkOutTime
    };

    // Attach recommended pricing — date-aware when query params are provided.
    const { checkInDate = null, checkOutDate = null } = req.query || {};
    const pricing = await buildAllHotelsRecommendedPricing({
      status: 'active',
      forceRefresh: false,
      checkInDate: checkInDate || null,
      checkOutDate: checkOutDate || null,
    });
    const recommendedPrices = pricing.hotels.find((h) => String(h.hotelId) === String(hotelRow.id))?.recommendedPrices || [];
    hotel.recommendedPrices = recommendedPrices;
    attachImageKitUrls(hotel);
    return res.json({ hotel });
  } catch (error) {
    console.error('Error fetching hotel by id:', error);
    return res.status(400).json({ error: error.message });
  }
};

const getAllHotelsRecommendedPrices = async (req, res) => {
  try {
    const { status = 'active', refresh = 'false' } = req.query;
    const payload = await buildAllHotelsRecommendedPricing({
      status,
      forceRefresh: String(refresh).toLowerCase() === 'true'
    });
    return res.json(payload);
  } catch (error) {
    console.error('Error fetching recommended prices for all hotels:', error);
    return res.status(400).json({ error: error.message });
  }
};

const getAdminHotels = async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Only admin can access admin portal' });
    }

    const { managerId, userId, status = 'active', limit = 50, offset = 0 } = req.query;
    const targetManagerId = managerId || userId || req.user.id;
    const result = await fetchHotels({
      status,
      limit,
      offset,
      managerId: targetManagerId
    });

    if (result.managerMissing) {
      return res.json({
        hotels: [],
        count: 0,
        limit: toInt(limit) || 50,
        offset: toInt(offset) || 0,
        message: 'manager_id column is not available in hotels table'
      });
    }

    return res.json({
      hotels: result.rows,
      count: result.total,
      managerId: toInt(targetManagerId),
      limit: toInt(limit) || 50,
      offset: toInt(offset) || 0
    });
  } catch (error) {
    console.error('Error fetching admin hotels:', error);
    return res.status(400).json({ error: error.message });
  }
};

const adminCreateHotel = async (req, res) => {
  try {
    const meta = await getHotelMeta();
    const normalized = normalizeHotelInput(req.body);
    const {
      hotelId,
      status,
      managerId,
      name,
      address,
      description,
      totalRooms,
      googleMapsLink,
      contact,
      email,
      hotelLink,
      starRating,
      amenities,
      roomCategories,
      informationRaw,
      contactRaw,
      contactName,
      contactPhone,
      propertyLabelRaw,
      checkInTime,
      checkOutTime,
      childPolicy,
      petPolicy,
      smokingPolicy
    } = normalized;
    const resolvedName = name || normalized.raw?.['HOTEL NAMES'] || normalized.raw?.name || 'Unnamed Hotel';
    const resolvedAddress =
      address ||
      normalized.raw?.LOCATION ||
      normalized.raw?.location ||
      normalized.raw?.address ||
      'Address not provided';

    const writeValues = {};

    setWritableValue(writeValues, meta.hotelIdCol, hotelId || `HOTEL-${Date.now()}`);
    setWritableValue(writeValues, meta.statusCol, status || 'active');
    setWritableValue(writeValues, meta.managerCol, toInt(managerId || req.user.id));
    setWritableValue(writeValues, meta.hotelCreatedCol, new Date().toISOString());
    setWritableValue(writeValues, meta.hotelUpdatedCol, new Date().toISOString());
    setWritableValue(writeValues, meta.nameCol, resolvedName);
    setWritableValue(writeValues, meta.addressCol, resolvedAddress);
    setWritableValue(writeValues, meta.locationCol, resolvedAddress);
    setWritableValue(writeValues, meta.descriptionCol, description);
    setWritableValue(writeValues, meta.informationRawCol, informationRaw);
    setWritableValue(writeValues, meta.totalRoomsCol, totalRooms);
    setWritableValue(writeValues, meta.googleMapsLinkCol, googleMapsLink);
    setWritableValue(writeValues, meta.contactRawCol, contactRaw || contact);
    setWritableValue(writeValues, meta.contactNameCol, contactName);
    setWritableValue(writeValues, meta.contactPhoneCol, contactPhone || contact);
    setWritableValue(writeValues, meta.emailCol, email);
    setWritableValue(writeValues, meta.hotelLinkCol, hotelLink);
    setWritableValue(writeValues, meta.starRatingCol, starRating);
    setWritableValue(writeValues, meta.propertyLabelRawCol, propertyLabelRaw);
    setWritableValue(writeValues, meta.amenitiesCol, amenities);
    setWritableValue(writeValues, meta.checkInTimeCol, checkInTime);
    setWritableValue(writeValues, meta.checkOutTimeCol, checkOutTime);
    setWritableValue(writeValues, meta.childPolicyCol, childPolicy);
    setWritableValue(writeValues, meta.petPolicyCol, petPolicy);
    setWritableValue(writeValues, meta.smokingPolicyCol, smokingPolicy);

    const columns = Object.keys(writeValues);
    const values = Object.values(writeValues);
    const placeholders = values.map((_, index) => `$${index + 1}`);

    if (!columns.length) {
      return res.status(400).json({ error: 'No writable hotel columns found' });
    }

    const client = await pool.connect();
    let result;
    let savedRoomCategories = [];

    try {
      await client.query('BEGIN');
      const insertSql = `INSERT INTO hotels (${columns.map((column) => `"${column}"`).join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
      result = await client.query(insertSql, values);

      if (Array.isArray(roomCategories) && roomCategories.length) {
        savedRoomCategories = await upsertHotelRoomCategories(client, result.rows[0].id, roomCategories);
      }

      await client.query('COMMIT');
    } catch (txError) {
      try {
        await client.query('ROLLBACK');
      } catch (_rollbackError) {
        // no-op
      }
      throw txError;
    } finally {
      client.release();
    }

    clearTableColumnsCache('hotels');
    const hotel = mapHotelRecord(result.rows[0], meta);
    hotel.roomCategories = savedRoomCategories.length
      ? savedRoomCategories
      : (Array.isArray(roomCategories) ? roomCategories : null);
    return res.status(201).json({ message: 'Hotel created successfully', hotel });
  } catch (error) {
    console.error('Error creating hotel:', error);
    return res.status(400).json({ error: error.message });
  }
};

const adminUpdateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const meta = await getHotelMeta();
    const normalized = normalizeHotelInput(req.body);
    const {
      hotelId,
      status,
      managerId,
      name,
      address,
      description,
      totalRooms,
      googleMapsLink,
      contact,
      email,
      hotelLink,
      starRating,
      amenities,
      roomCategories,
      informationRaw,
      contactRaw,
      contactName,
      contactPhone,
      propertyLabelRaw,
      checkInTime,
      checkOutTime,
      childPolicy,
      petPolicy,
      smokingPolicy
    } = normalized;

    const updates = [];
    const values = [];

    if (meta.hotelIdCol && typeof hotelId !== 'undefined' && hotelId !== null) {
      values.push(hotelId);
      updates.push(`"${meta.hotelIdCol}" = $${values.length}`);
    }

    if (meta.statusCol && typeof status !== 'undefined' && status !== null) {
      values.push(status);
      updates.push(`"${meta.statusCol}" = $${values.length}`);
    }

    if (meta.managerCol && typeof managerId !== 'undefined' && managerId !== null) {
      values.push(toInt(managerId));
      updates.push(`"${meta.managerCol}" = $${values.length}`);
    }

    if (meta.nameCol && typeof name !== 'undefined') {
      values.push(name);
      updates.push(`"${meta.nameCol}" = $${values.length}`);
    }

    if (meta.addressCol && typeof address !== 'undefined' && address !== null) {
      values.push(address);
      updates.push(`"${meta.addressCol}" = $${values.length}`);
    }

    if (meta.locationCol && typeof address !== 'undefined' && address !== null) {
      values.push(address);
      updates.push(`"${meta.locationCol}" = $${values.length}`);
    }

    if (meta.descriptionCol && typeof description !== 'undefined') {
      values.push(description);
      updates.push(`"${meta.descriptionCol}" = $${values.length}`);
    }

    if (meta.informationRawCol && typeof informationRaw !== 'undefined' && informationRaw !== null) {
      values.push(informationRaw);
      updates.push(`"${meta.informationRawCol}" = $${values.length}`);
    }

    if (meta.totalRoomsCol && totalRooms !== null) {
      values.push(totalRooms);
      updates.push(`"${meta.totalRoomsCol}" = $${values.length}`);
    }

    if (meta.googleMapsLinkCol && googleMapsLink) {
      values.push(googleMapsLink);
      updates.push(`"${meta.googleMapsLinkCol}" = $${values.length}`);
    }

    if (meta.contactRawCol && typeof (contactRaw || contact) !== 'undefined' && (contactRaw || contact) !== null) {
      values.push(contactRaw || contact);
      updates.push(`"${meta.contactRawCol}" = $${values.length}`);
    }

    if (meta.contactNameCol && typeof contactName !== 'undefined' && contactName !== null) {
      values.push(contactName);
      updates.push(`"${meta.contactNameCol}" = $${values.length}`);
    }

    if (meta.contactPhoneCol && typeof (contactPhone || contact) !== 'undefined' && (contactPhone || contact) !== null) {
      values.push(contactPhone || contact);
      updates.push(`"${meta.contactPhoneCol}" = $${values.length}`);
    }

    if (meta.emailCol && typeof email !== 'undefined' && email !== null) {
      values.push(email);
      updates.push(`"${meta.emailCol}" = $${values.length}`);
    }

    if (meta.hotelLinkCol && typeof hotelLink !== 'undefined' && hotelLink !== null) {
      values.push(hotelLink);
      updates.push(`"${meta.hotelLinkCol}" = $${values.length}`);
    }

    if (meta.starRatingCol && starRating !== null) {
      values.push(starRating);
      updates.push(`"${meta.starRatingCol}" = $${values.length}`);
    }

    if (meta.propertyLabelRawCol && typeof propertyLabelRaw !== 'undefined') {
      values.push(propertyLabelRaw);
      updates.push(`"${meta.propertyLabelRawCol}" = $${values.length}`);
    }

    if (meta.amenitiesCol && typeof amenities !== 'undefined' && amenities !== null) {
      values.push(amenities);
      updates.push(`"${meta.amenitiesCol}" = $${values.length}`);
    }

    if (meta.checkInTimeCol && typeof checkInTime !== 'undefined' && checkInTime !== null) {
      values.push(checkInTime);
      updates.push(`"${meta.checkInTimeCol}" = $${values.length}`);
    }

    if (meta.checkOutTimeCol && typeof checkOutTime !== 'undefined' && checkOutTime !== null) {
      values.push(checkOutTime);
      updates.push(`"${meta.checkOutTimeCol}" = $${values.length}`);
    }

    if (meta.childPolicyCol && typeof childPolicy !== 'undefined') {
      values.push(childPolicy);
      updates.push(`"${meta.childPolicyCol}" = $${values.length}`);
    }

    if (meta.petPolicyCol && typeof petPolicy !== 'undefined') {
      values.push(petPolicy);
      updates.push(`"${meta.petPolicyCol}" = $${values.length}`);
    }

    if (meta.smokingPolicyCol && typeof smokingPolicy !== 'undefined') {
      values.push(smokingPolicy);
      updates.push(`"${meta.smokingPolicyCol}" = $${values.length}`);
    }

    const updatedCol = pickColumn(meta.hotelCols, ['updated_at', 'updatedAt']);
    if (updatedCol) {
      updates.push(`"${updatedCol}" = NOW()`);
    }

    if (!updates.length) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    const client = await pool.connect();
    let result;
    let savedRoomCategories = null;
    try {
      await client.query('BEGIN');
      values.push(toInt(id));
      const updateSql = `UPDATE hotels SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
      result = await client.query(updateSql, values);

      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Hotel not found' });
      }

      if (Array.isArray(roomCategories)) {
        savedRoomCategories = await upsertHotelRoomCategories(client, toInt(id), roomCategories);
      }

      await client.query('COMMIT');
    } catch (txError) {
      try {
        await client.query('ROLLBACK');
      } catch (_rollbackError) {
        // no-op
      }
      throw txError;
    } finally {
      client.release();
    }

    const hotel = mapHotelRecord(result.rows[0], meta);
    if (savedRoomCategories) {
      hotel.roomCategories = savedRoomCategories;
    }
    return res.json({ message: 'Hotel updated successfully', hotel });
  } catch (error) {
    console.error('Error updating hotel:', error);
    return res.status(400).json({ error: error.message });
  }
};

const adminDeleteHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM hotels WHERE id = $1 RETURNING id', [toInt(id)]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    return res.json({ message: 'Hotel deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getPublicHotels,
  getPublicHotelById,
  getAllHotelsRecommendedPrices,
  getAdminHotels,
  adminCreateHotel,
  adminUpdateHotel,
  adminDeleteHotel
};
