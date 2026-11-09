const Database = require('better-sqlite3');

function openDb(file) {
  const db = new Database(file);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT NOT NULL,
      email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      language      TEXT NOT NULL DEFAULT 'fr',
      created_at    TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS trips (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      destination TEXT NOT NULL,
      trip_type   TEXT NOT NULL,
      budget      REAL NOT NULL,
      days        INTEGER NOT NULL,
      people      INTEGER NOT NULL,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS trips_user ON trips(user_id);
    CREATE TABLE IF NOT EXISTS favorites (
      user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      destination_id TEXT NOT NULL,
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, destination_id)
    );
  `);
  // Jeton de partage des voyages (ajouté après la première version de la base).
  const tripColumns = db.prepare('PRAGMA table_info(trips)').all().map((c) => c.name);
  if (!tripColumns.includes('share_token')) db.exec('ALTER TABLE trips ADD COLUMN share_token TEXT');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS trips_share_token ON trips(share_token)');
  return db;
}

module.exports = { openDb };
