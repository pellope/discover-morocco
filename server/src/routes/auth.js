const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { HttpError, validateRegistration, validateName, validatePassword, validateLanguage, LANGUAGES } = require('../validation');

const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, language: u.language, google: Boolean(u.google_sub) });

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

// verifyGoogleToken peut être remplacé dans les tests ; par défaut il interroge Google.
function authRouter(db, jwtSecret, { googleClientId, verifyGoogleToken } = {}) {
  const router = express.Router();
  const auth = requireAuth(db, jwtSecret);
  const sign = (user) => jwt.sign({ sub: user.id }, jwtSecret, { algorithm: 'HS256', expiresIn: '7d' });
  const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;
  const verifyGoogle = verifyGoogleToken ?? (async (credential) => {
    const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: googleClientId });
    return ticket.getPayload();
  });

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
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ user: publicUser(user), token: sign(user) });
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

  // Connexion avec Google : l'interface envoie le jeton d'identité reçu de Google.
  router.post('/google', async (req, res) => {
    if (!googleClientId) throw new HttpError(503, 'google_not_configured', 'Google sign-in is not configured.');
    let payload;
    try {
      payload = await verifyGoogle(String(req.body?.credential ?? ''));
    } catch {
      throw new HttpError(401, 'invalid_credentials', 'Invalid Google credential.');
    }
    if (!payload?.sub || !payload.email || !payload.email_verified) {
      throw new HttpError(401, 'invalid_credentials', 'Invalid Google credential.');
    }
    const email = payload.email.toLowerCase();
    let user = db.prepare('SELECT * FROM users WHERE google_sub = ?').get(payload.sub)
      ?? db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      // Mot de passe aléatoire inutilisable : ce compte se connecte seulement avec Google.
      const hash = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 10);
      const language = LANGUAGES.includes(req.body?.language) ? req.body.language : 'fr';
      const info = db.prepare('INSERT INTO users (name, email, password_hash, language, google_sub) VALUES (?, ?, ?, ?, ?)')
        .run(String(payload.name || email.split('@')[0]).slice(0, 100), email, hash, language, payload.sub);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
    } else if (!user.google_sub) {
      db.prepare('UPDATE users SET google_sub = ? WHERE id = ?').run(payload.sub, user.id);
      user.google_sub = payload.sub;
    }
    res.json({ user: publicUser(user), token: sign(user) });
  });

  router.get('/me', auth, (req, res) => {
    res.json({ user: publicUser(req.user) });
  });

  // Modifier son nom et/ou sa langue.
  router.patch('/me', auth, (req, res) => {
    const name = req.body?.name !== undefined ? validateName(req.body.name) : req.user.name;
    const language = req.body?.language !== undefined ? validateLanguage(req.body.language) : req.user.language;
    db.prepare('UPDATE users SET name = ?, language = ? WHERE id = ?').run(name, language, req.user.id);
    res.json({ user: publicUser({ ...req.user, name, language }) });
  });

  router.post('/password', auth, async (req, res) => {
    const current = typeof req.body?.currentPassword === 'string' ? req.body.currentPassword : '';
    if (!await bcrypt.compare(current, req.user.password_hash)) {
      throw new HttpError(401, 'wrong_password', 'Current password is incorrect.');
    }
    const hash = await bcrypt.hash(validatePassword(req.body?.newPassword), 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.user.id);
    res.status(204).end();
  });

  // Supprimer son compte et toutes ses données. Le mot de passe est redemandé,
  // sauf pour un compte Google (qui n'en a pas).
  router.delete('/me', auth, async (req, res) => {
    if (!req.user.google_sub) {
      const password = typeof req.body?.password === 'string' ? req.body.password : '';
      if (!await bcrypt.compare(password, req.user.password_hash)) {
        throw new HttpError(401, 'wrong_password', 'Password is incorrect.');
      }
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
    res.status(204).end();
  });

  return router;
}

module.exports = { authRouter, requireAuth };
