const path = require('path');
require('dotenv').config({ quiet: true });
const { openDb } = require('./db');
const { createApp } = require('./app');

const {
  JWT_SECRET,
  PORT = 4000,
  DATABASE_FILE = 'discover-morocco.db',
  CORS_ORIGIN = 'http://localhost:5173',
  GOOGLE_CLIENT_ID,
} = process.env;

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('JWT_SECRET is missing or shorter than 32 characters. Copy .env.example to .env and set it.');
  process.exit(1);
}

const app = createApp({
  db: openDb(DATABASE_FILE),
  jwtSecret: JWT_SECRET,
  corsOrigin: CORS_ORIGIN,
  googleClientId: GOOGLE_CLIENT_ID || null,
  clientDist: path.join(__dirname, '..', '..', 'client', 'dist'),
});
app.listen(PORT, () => console.log(`Discover Morocco listening on http://localhost:${PORT}`));
