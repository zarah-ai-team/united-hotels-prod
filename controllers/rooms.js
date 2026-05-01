const pool = require('../db');

const roomColumnsCache = { cols: null };

const getRoomColumns = async () => {
  if (roomColumnsCache.cols) {
    return roomColumnsCache.cols;
  }

  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'rooms'`
  );
  roomColumnsCache.cols = new Set(result.rows.map((row) => row.column_name));
  return roomColumnsCache.cols;
};

const pickColumn = (columns, names) => names.find((name) => columns.has(name)) || null;

const toInt = (value) => {
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const normalizeRoomCounts = (payload = {}) => {
  const totalRooms = toInt(payload.total_rooms || payload.totalRooms || payload.count || payload.room_count) || 1;
  const availableRooms = toInt(payload.available_rooms || payload.availableRooms) ?? totalRooms;
  return {
    totalRooms,
    availableRooms: Math.max(Math.min(availableRooms, totalRooms), 0)
  };
};

const getRooms = async (req, res) => {
  try {
    const roomsResult = await pool.query(`
      SELECT r.*, h.name AS hotel_name
      FROM rooms r
      LEFT JOIN hotels h ON r.hotel_id = h.id
      ORDER BY r.hotel_id ASC, r.category ASC, r.id DESC
    `);
    res.json(roomsResult.rows);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getRoomById = async (req, res) => {
  const { id } = req.params;
  try {
    const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    if (roomResult.rowCount === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(roomResult.rows[0]);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const addRoom = async (req, res) => {
  const { hotel_id, category, max_count, price_per_night, room_number, images } = req.body;
  try {
    const hotelResult = await pool.query('SELECT * FROM hotels WHERE id = $1', [hotel_id]);
    const hotel = hotelResult.rows[0];
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const cols = await getRoomColumns();
    const { totalRooms, availableRooms } = normalizeRoomCounts(req.body);
    const totalRoomsCol = pickColumn(cols, ['total_rooms', 'totalRooms']);
    const availableRoomsCol = pickColumn(cols, ['available_rooms', 'availableRooms']);

    const columns = ['hotel_id', 'category', 'max_count', 'price_per_night', 'is_available', 'images', 'room_number'];
    const params = [
      hotel_id,
      category || 'standard',
      max_count || 1,
      price_per_night || 0,
      availableRooms > 0,
      JSON.stringify(images || []),
      room_number || `${hotel_id}-${category || 'standard'}`
    ];

    if (totalRoomsCol) {
      columns.push(totalRoomsCol);
      params.push(totalRooms);
    }
    if (availableRoomsCol) {
      columns.push(availableRoomsCol);
      params.push(availableRooms);
    }

    const placeholders = params.map((_, idx) => `$${idx + 1}`);
    const insertRoomQuery = `INSERT INTO rooms (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const created = await pool.query(insertRoomQuery, params);
    res.status(201).json({ message: 'Room added successfully', room: created.rows[0] });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { category, max_count, price_per_night, is_available, images, room_number } = req.body;
  try {
    const roomResult = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);
    const room = roomResult.rows[0];
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const hotelResult = await pool.query('SELECT manager_id FROM hotels WHERE id = $1', [room.hotel_id]);
    const hotel = hotelResult.rows[0];
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const cols = await getRoomColumns();
    const totalRoomsCol = pickColumn(cols, ['total_rooms', 'totalRooms']);
    const availableRoomsCol = pickColumn(cols, ['available_rooms', 'availableRooms']);
    const { totalRooms, availableRooms } = normalizeRoomCounts(req.body);

    const updates = [
      'category = COALESCE($1, category)',
      'max_count = COALESCE($2, max_count)',
      'price_per_night = COALESCE($3, price_per_night)',
      'is_available = COALESCE($4, is_available)',
      'images = COALESCE($5, images)',
      'room_number = COALESCE($6, room_number)'
    ];
    const params = [category, max_count, price_per_night, is_available, images ? JSON.stringify(images) : null, room_number];
    if (totalRoomsCol) {
      params.push(totalRooms);
      updates.push(`"${totalRoomsCol}" = COALESCE($${params.length}, "${totalRoomsCol}")`);
    }
    if (availableRoomsCol) {
      params.push(availableRooms);
      updates.push(`"${availableRoomsCol}" = COALESCE($${params.length}, "${availableRoomsCol}")`);
    }
    if (availableRoomsCol && !('is_available' in req.body)) {
      updates.push(`is_available = CASE WHEN COALESCE("${availableRoomsCol}", 0) > 0 THEN true ELSE false END`);
    }
    params.push(id);
    await pool.query(`UPDATE rooms SET ${updates.join(', ')} WHERE id = $${params.length}`, params);
    res.json({ message: 'Room updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteRoom = async (req, res) => {
  const { id } = req.params;
  try {
    const roomResult = await pool.query('SELECT hotel_id FROM rooms WHERE id = $1', [id]);
    const room = roomResult.rows[0];
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const hotelResult = await pool.query('SELECT manager_id FROM hotels WHERE id = $1', [room.hotel_id]);
    const hotel = hotelResult.rows[0];
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    if (req.user.role === 'hotel_manager' && hotel.manager_id !== req.user.id) {
      return res.status(403).json({ error: 'Hotel manager can only delete rooms from their own hotel' });
    }

    await pool.query('DELETE FROM rooms WHERE id = $1', [id]);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const adminCreateRoom = async (req, res) => {
  try {
    const cols = await getRoomColumns();
    const {
      hotel_id,
      hotelId,
      category,
      type,
      max_count,
      maxcount,
      total_rooms,
      totalRooms,
      available_rooms,
      availableRooms,
      price_per_night,
      rentperday,
      is_available,
      images,
      room_number,
      name
    } = req.body;

    const hotelIdCol = pickColumn(cols, ['hotel_id']);
    const categoryCol = pickColumn(cols, ['category', 'type']);
    const maxCountCol = pickColumn(cols, ['max_count', 'maxcount']);
    const priceCol = pickColumn(cols, ['price_per_night', 'rentperday']);
    const availableCol = pickColumn(cols, ['is_available']);
    const totalRoomsCol = pickColumn(cols, ['total_rooms', 'totalRooms']);
    const availableRoomsCol = pickColumn(cols, ['available_rooms', 'availableRooms']);
    const imagesCol = pickColumn(cols, ['images']);
    const roomNumberCol = pickColumn(cols, ['room_number', 'name']);
    const counts = normalizeRoomCounts({ total_rooms, totalRooms, available_rooms, availableRooms });

    if (!hotelIdCol || !categoryCol || !maxCountCol || !priceCol) {
      return res.status(400).json({ error: 'Rooms table is missing required columns for room creation' });
    }

    const columns = [
      `"${hotelIdCol}"`,
      `"${categoryCol}"`,
      `"${maxCountCol}"`,
      `"${priceCol}"`
    ];
    const values = [
      toInt(hotel_id || hotelId),
      category || type || 'standard',
      toInt(max_count || maxcount) || 1,
      toNumber(price_per_night || rentperday) || 0
    ];

    if (!values[0]) {
      return res.status(400).json({ error: 'hotel_id is required' });
    }

    if (availableCol) {
      columns.push(`"${availableCol}"`);
      values.push(typeof is_available === 'boolean' ? is_available : counts.availableRooms > 0);
    }

    if (totalRoomsCol) {
      columns.push(`"${totalRoomsCol}"`);
      values.push(counts.totalRooms);
    }

    if (availableRoomsCol) {
      columns.push(`"${availableRoomsCol}"`);
      values.push(counts.availableRooms);
    }

    if (imagesCol) {
      columns.push(`"${imagesCol}"`);
      values.push(Array.isArray(images) ? images : []);
    }

    if (roomNumberCol) {
      columns.push(`"${roomNumberCol}"`);
      values.push(room_number || name || `${values[0]}-${category || type || 'standard'}`);
    }

    const placeholders = values.map((_, idx) => `$${idx + 1}`);
    const insertSql = `INSERT INTO rooms (${columns.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`;
    const result = await pool.query(insertSql, values);

    return res.status(201).json({ message: 'Room created successfully', room: result.rows[0] });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const adminUpdateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const cols = await getRoomColumns();
    const {
      hotel_id,
      hotelId,
      category,
      type,
      max_count,
      maxcount,
      total_rooms,
      totalRooms,
      available_rooms,
      availableRooms,
      price_per_night,
      rentperday,
      is_available,
      images,
      room_number,
      name
    } = req.body;

    const updates = [];
    const values = [];

    const hotelIdCol = pickColumn(cols, ['hotel_id']);
    const categoryCol = pickColumn(cols, ['category', 'type']);
    const maxCountCol = pickColumn(cols, ['max_count', 'maxcount']);
    const priceCol = pickColumn(cols, ['price_per_night', 'rentperday']);
    const availableCol = pickColumn(cols, ['is_available']);
    const totalRoomsCol = pickColumn(cols, ['total_rooms', 'totalRooms']);
    const availableRoomsCol = pickColumn(cols, ['available_rooms', 'availableRooms']);
    const imagesCol = pickColumn(cols, ['images']);
    const roomNumberCol = pickColumn(cols, ['room_number', 'name']);
    const updatedCol = pickColumn(cols, ['updated_at', 'updatedAt']);
    const counts = normalizeRoomCounts({ total_rooms, totalRooms, available_rooms, availableRooms });

    if (hotelIdCol && typeof (hotel_id || hotelId) !== 'undefined') {
      values.push(toInt(hotel_id || hotelId));
      updates.push(`"${hotelIdCol}" = $${values.length}`);
    }
    if (categoryCol && typeof (category || type) !== 'undefined') {
      values.push(category || type);
      updates.push(`"${categoryCol}" = $${values.length}`);
    }
    if (maxCountCol && typeof (max_count || maxcount) !== 'undefined') {
      values.push(toInt(max_count || maxcount));
      updates.push(`"${maxCountCol}" = $${values.length}`);
    }
    if (priceCol && typeof (price_per_night || rentperday) !== 'undefined') {
      values.push(toNumber(price_per_night || rentperday));
      updates.push(`"${priceCol}" = $${values.length}`);
    }
    if (availableCol && typeof is_available === 'boolean') {
      values.push(is_available);
      updates.push(`"${availableCol}" = $${values.length}`);
    }
    if (totalRoomsCol && typeof (total_rooms || totalRooms) !== 'undefined') {
      values.push(counts.totalRooms);
      updates.push(`"${totalRoomsCol}" = $${values.length}`);
    }
    if (availableRoomsCol && typeof (available_rooms || availableRooms) !== 'undefined') {
      values.push(counts.availableRooms);
      updates.push(`"${availableRoomsCol}" = $${values.length}`);
    }
    if (imagesCol && typeof images !== 'undefined') {
      values.push(Array.isArray(images) ? images : []);
      updates.push(`"${imagesCol}" = $${values.length}`);
    }
    if (roomNumberCol && typeof (room_number || name) !== 'undefined') {
      values.push(room_number || name);
      updates.push(`"${roomNumberCol}" = $${values.length}`);
    }
    if (updatedCol) {
      updates.push(`"${updatedCol}" = NOW()`);
    }

    if (!updates.length) {
      return res.status(400).json({ error: 'No valid fields provided for update' });
    }

    values.push(toInt(id));
    const updateSql = `UPDATE rooms SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`;
    const result = await pool.query(updateSql, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.json({ message: 'Room updated successfully', room: result.rows[0] });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const adminDeleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING id', [toInt(id)]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.json({ message: 'Room deleted successfully', id: result.rows[0].id });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

module.exports = {
  getRooms,
  getRoomById,
  addRoom,
  updateRoom,
  deleteRoom,
  adminCreateRoom,
  adminUpdateRoom,
  adminDeleteRoom
};