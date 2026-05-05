// db.js — switched to live Neon Postgres.
// The original in-memory SQLite mock is preserved in db.sqlite.js;
// to revert, replace this file's contents with `module.exports = require('./db.sqlite');`.
module.exports = require('./db.postgres');
