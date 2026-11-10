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
    CREATE TABLE IF NOT EXISTS reviews (
      user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      destination_id TEXT NOT NULL,
      rating         INTEGER NOT NULL,
      comment        TEXT NOT NULL DEFAULT '',
      created_at     TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (user_id, destination_id)
    );
    CREATE TABLE IF NOT EXISTS expenses (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id    INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
      category   TEXT NOT NULL,
      label      TEXT NOT NULL,
      amount     REAL NOT NULL,
      paid_by    INTEGER NOT NULL DEFAULT 0,  -- position du voyageur dans la liste du voyage
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS expenses_trip ON expenses(trip_id);
  `);

  // Colonnes ajoutées après la première version de la base.
  const addColumn = (table, column, definition) => {
    const columns = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
    if (!columns.includes(column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  };
  addColumn('users', 'google_sub', 'TEXT');
  addColumn('trips', 'share_token', 'TEXT');
  addColumn('trips', 'comfort', "TEXT NOT NULL DEFAULT 'budget'");
  addColumn('trips', 'start_date', 'TEXT');
  addColumn('trips', 'stops', 'TEXT');        // JSON : étapes d'un circuit
  addColumn('trips', 'travelers', 'TEXT');    // JSON : prénoms des voyageurs
  addColumn('trips', 'custom_plan', 'TEXT');  // JSON : plan jour par jour modifié
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS trips_share_token ON trips(share_token)');
  db.exec('CREATE UNIQUE INDEX IF NOT EXISTS users_google_sub ON users(google_sub)');
  return db;
}

module.exports = { openDb };
