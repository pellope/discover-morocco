const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { HttpError, validateRegistration, LANGUAGES } = require('../validation');

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, language: u.language });

// Middleware : exige un jeton « Authorization: Bearer <token> » valide.
function requireAuth(db, jwtSecret) {
  return (req, _res, next) => {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'unauthenticated', 'Missing token.');
    let payload;
    try {
      payload = jwt.verify(token, jwtSecret, { algorithms: ['HS256'] });
    } catch {
      throw new HttpError(401, 'invalid_token', 'Invalid or expired token.');
    }
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    if (!user) throw new HttpError(401, 'invalid_token', 'Invalid or expired token.');
    req.user = user;
    next();
  };
}

function authRouter(db, jwtSecret) {
  const router = express.Router();
  const sign = (user) => jwt.sign({ sub: user.id }, jwtSecret, { algorithm: 'HS256', expiresIn: '7d' });

  router.post('/register', async (req, res) => {
    const { name, email, password, language } = validateRegistration(req.body);
    const hash = await bcrypt.hash(password, 10);
    let info;
    try {
      info = db.prepare('INSERT INTO users (name, email, password_hash, language) VALUES (?, ?, ?, ?)')
        .run(name, email, hash, language);
    } catch (err) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw new HttpError(409, 'email_taken', 'An account already exists with this email.');
      }
      throw err;
    }
    const user = { id: info.lastInsertRowid, name, email, language };
    res.status(201).json({ user, token: sign(user) });
  });

  router.post('/login', async (req, res) => {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    // Même message pour un e-mail inconnu et un mauvais mot de passe.
    const ok = user && await bcrypt.compare(password, user.password_hash);
    if (!ok) throw new HttpError(401, 'invalid_credentials', 'Incorrect email or password.');
    res.json({ user: publicUser(user), token: sign(user) });
  });

  router.get('/me', requireAuth(db, jwtSecret), (req, res) => {
    res.json({ user: publicUser(req.user) });
  });

  router.patch('/me', requireAuth(db, jwtSecret), (req, res) => {
    const { language } = req.body ?? {};
    if (!LANGUAGES.includes(language)) {
      throw new HttpError(400, 'invalid_language', `Language must be one of: ${LANGUAGES.join(', ')}.`);
    }
    db.prepare('UPDATE users SET language = ? WHERE id = ?').run(language, req.user.id);
    res.json({ user: publicUser({ ...req.user, language }) });
  });

  return router;
}

module.exports = { authRouter, requireAuth };
