require('dotenv').config();
const pool = require('../db');

async function checkAndFixDatabase() {
  try {
    console.log('Checking database tables...');
    
    // Check if users table exists
    const tablesResult = await pool.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log('Existing tables:', tables);
    
    if (tables.includes('users')) {
      // Check columns in users table
      const columnsResult = await pool.query(`
        SELECT column_name, data_type FROM information_schema.columns 
        WHERE table_name = 'users' ORDER BY ordinal_position
      `);
      
      console.log('\nUsers table columns:');
      columnsResult.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type}`);
      });
      
      const columnNames = columnsResult.rows.map(r => r.column_name);
      if (!columnNames.includes('phonenumber')) {
        console.log('\n⚠️ phonenumber column missing! Adding it...');
        await pool.query('ALTER TABLE users ADD COLUMN phonenumber TEXT;');
        console.log('✓ phonenumber column added');
      }
      if (!columnNames.includes('role')) {
        console.log('\n⚠️ role column missing! Adding it...');
        await pool.query("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'hotel_manager';");
        console.log('✓ role column added');
      }
      if (!columnNames.includes('isAdmin')) {
        console.log('\n⚠️ isAdmin column missing! Adding it...');
        await pool.query('ALTER TABLE users ADD COLUMN "isAdmin" BOOLEAN NOT NULL DEFAULT false;');
        console.log('✓ isAdmin column added');
      }
      if (!columnNames.includes('isManager')) {
        console.log('\n⚠️ isManager column missing! Adding it...');
        await pool.query('ALTER TABLE users ADD COLUMN "isManager" BOOLEAN NOT NULL DEFAULT false;');
        console.log('✓ isManager column added');
      }

      if (tables.includes('bookings')) {
        const bookingColumnsResult = await pool.query(`
          SELECT column_name FROM information_schema.columns
          WHERE table_name = 'bookings'
        `);
        const bookingColumnNames = bookingColumnsResult.rows.map(r => r.column_name);

        if (!bookingColumnNames.includes('special_request') && !bookingColumnNames.includes('specialrequest')) {
          console.log('\n⚠️ special_request column missing in bookings! Adding it...');
          await pool.query('ALTER TABLE bookings ADD COLUMN special_request TEXT;');
          console.log('✓ special_request column added');
        }
      }
    } else {
      console.log('\n❌ users table does not exist! Creating all tables...');
      await createAllTables();
    }
    
    console.log('\n✓ Database check complete');
    await pool.end();
    process.exit(0);
    
  } catch (error) {
    console.error('✗ Error:', error.message);
    await pool.end();
    process.exit(1);
  }
}

async function createAllTables() {
  const createTablesSQL = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phonenumber TEXT,
      role TEXT NOT NULL DEFAULT 'hotel_manager',
      "isAdmin" BOOLEAN NOT NULL DEFAULT false,
      "isManager" BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS hotels (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT,
      contact_name TEXT,
      contact_phone TEXT,
      contact_email TEXT,
      manager_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      total_rooms INTEGER DEFAULT 0,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id SERIAL PRIMARY KEY,
      hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
      category TEXT NOT NULL,
      max_count INTEGER NOT NULL DEFAULT 1,
      total_rooms INTEGER NOT NULL DEFAULT 1,
      available_rooms INTEGER NOT NULL DEFAULT 1,
      price_per_night NUMERIC(10,2) NOT NULL DEFAULT 0,
      is_available BOOLEAN NOT NULL DEFAULT true,
      images JSONB DEFAULT '[]',
      room_number TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
      check_in_date DATE NOT NULL,
      check_out_date DATE NOT NULL,
      total_price NUMERIC(10,2) NOT NULL,
      special_request TEXT,
      status TEXT DEFAULT 'confirmed',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      booking_id INTEGER REFERENCES bookings(id) ON DELETE SET NULL,
      amount NUMERIC(10,2) NOT NULL,
      currency TEXT NOT NULL DEFAULT 'USD',
      method TEXT NOT NULL DEFAULT 'card',
      payment_mode TEXT DEFAULT 'card',
      transaction_id TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'created',
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;

  const statements = createTablesSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0);

  for (const statement of statements) {
    await pool.query(statement);
    console.log('✓ Created table');
  }
}

checkAndFixDatabase();
