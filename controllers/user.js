const pool = require('../db');

let userMetaCache = null;

const pickColumn = (set, names) => names.find((n) => set.has(n)) || null;

const getUserMeta = async () => {
  if (userMetaCache) return userMetaCache;

  const result = await pool.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'users'`
  );
  const cols = new Set(result.rows.map((r) => r.column_name));

  userMetaCache = {
    isAdminCol: pickColumn(cols, ['isAdmin', 'isadmin', 'is_admin']),
    isManagerCol: pickColumn(cols, ['isManager', 'ismanager', 'is_manager']),
    phoneCol: pickColumn(cols, ['phoneNumber', 'phonenumber', 'phone_number']),
    createdCol: pickColumn(cols, ['createdAt', 'created_at']),
    updatedCol: pickColumn(cols, ['updatedAt', 'updated_at'])
  };

  return userMetaCache;
};

const mapUser = (row, meta) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phoneNumber: meta.phoneCol ? row[meta.phoneCol] : null,
  isAdmin: meta.isAdminCol ? Boolean(row[meta.isAdminCol]) : false,
  isManager: meta.isManagerCol ? Boolean(row[meta.isManagerCol]) : false,
  createdAt: meta.createdCol ? row[meta.createdCol] : null,
  updatedAt: meta.updatedCol ? row[meta.updatedCol] : null
});

const getUsers = async (req, res) => {
  try {
    const meta = await getUserMeta();
    const usersResult = await pool.query('SELECT * FROM users ORDER BY id DESC');
    return res.json(usersResult.rows.map((row) => mapUser(row, meta)));
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const assignRole = async (req, res) => {
  const { id } = req.params;
  const { isAdmin, isManager } = req.body;

  try {
    const meta = await getUserMeta();
    if (!meta.isAdminCol || !meta.isManagerCol) {
      return res.status(400).json({ error: 'Admin/Manager columns are missing in users table' });
    }

    const userLookup = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userLookup.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const current = userLookup.rows[0];
    const nextIsAdmin = typeof isAdmin === 'boolean' ? isAdmin : Boolean(current[meta.isAdminCol]);
    const nextIsManager = typeof isManager === 'boolean' ? isManager : Boolean(current[meta.isManagerCol]);

    const updates = [
      `"${meta.isAdminCol}" = $1`,
      `"${meta.isManagerCol}" = $2`
    ];
    const values = [nextIsAdmin, nextIsManager];

    if (meta.updatedCol) {
      updates.push(`"${meta.updatedCol}" = NOW()`);
    }

    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $3`,
      [...values, id]
    );

    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.json({ message: 'User roles updated successfully', user: mapUser(result.rows[0], meta) });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userid = req.params.id;
    await pool.query('DELETE FROM users WHERE id = $1', [userid]);
    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    return res.status(404).json({ error: error.message });
  }
};

module.exports = { getUsers, assignRole, deleteUser };
