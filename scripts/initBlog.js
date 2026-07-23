/**
 * initBlog.js — apply the blog CMS schema. The blog starts EMPTY; posts are
 * authored in the /blog-admin editor. (No sample/mock posts are seeded.)
 *
 * Usage:  node scripts/initBlog.js
 * Safe to re-run: schema is CREATE ... IF NOT EXISTS.
 */
require('dotenv').config();
const pool = require('../db');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const schemaPath = path.join(__dirname, '..', 'db', 'blog_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('→ Applying blog schema...');
    // The file is one BEGIN/COMMIT block — run it as a single statement so the
    // transaction boundaries are preserved.
    await pool.query(schema);
    console.log('✓ blog_posts table ready (empty — author posts in /blog-admin)');

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('✗ initBlog failed:', error.message);
    await pool.end();
    process.exit(1);
  }
}

run();
