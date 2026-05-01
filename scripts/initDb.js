require('dotenv').config();
const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Initializing database schema...');
    // Split statements and execute each one
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      await pool.query(statement);
    }
    
    console.log('✓ Database schema initialized successfully');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ Error initializing database:', error.message);
    await pool.end();
    process.exit(1);
  }
}

initializeDatabase();
