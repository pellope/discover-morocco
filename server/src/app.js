const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { authRouter, requireAuth } = require('./routes/auth');
const { tripsRouter, sharedRouter } = require('./routes/trips');
const { destinationsRouter } = require('./routes/destinations');
const { favoritesRouter } = require('./routes/favorites');
const { HttpError, validateTrip } = require('./validation');
const { planTrip } = require('./plan');

// Taux de change approximatifs (1 unité = x MAD), à mettre à jour de temps en temps.
const RATES = { MAD: 1, EUR: 10.8, USD: 10 };

function createApp({ db, jwtSecret, corsOrigin, googleClientId = null, verifyGoogleToken, clientDist = null }) {
  const app = express();
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '50kb' }));
  const auth = requireAuth(db, jwtSecret);

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  // Réglages publics dont l'interface a besoin.
  app.get('/api/config', (_req, res) => res.json({ googleClientId, rates: RATES }));

  app.use('/api/auth', authRouter(db, jwtSecret, { googleClientId, verifyGoogleToken }));
  app.use('/api/destinations', destinationsRouter(db, auth));
  app.use('/api/trips', auth, tripsRouter(db));
  app.use('/api/shared', sharedRouter(db));
  app.use('/api/favorites', auth, favoritesRouter(db));

  // Budget Coach et plan jour par jour sans compte ni sauvegarde (aperçu du formulaire).
  app.post('/api/budget-coach', (req, res) => {
    res.json(planTrip(validateTrip(req.body)));
  });

  app.use('/api', (_req, _res, next) => next(new HttpError(404, 'not_found', 'Route not found.')));

  // En production, le serveur distribue aussi l'interface compilée (client/dist).
  if (clientDist && fs.existsSync(path.join(clientDist, 'index.html'))) {
    app.use(express.static(clientDist));
    app.get(/.*/, (_req, res) => res.sendFile(path.join(clientDist, 'index.html')));
  } else {
    app.use((_req, _res, next) => next(new HttpError(404, 'not_found', 'Route not found.')));
  }

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err instanceof HttpError) {
      return res.status(err.status).json({ error: { code: err.code, message: err.message } });
    }
    if (err.type === 'entity.parse.failed' || err.type === 'entity.too.large') {
      return res.status(err.status).json({ error: { code: 'invalid_body', message: 'Invalid request body.' } });
    }
    console.error(err);
    res.status(500).json({ error: { code: 'server_error', message: 'Internal server error.' } });
  });

  return app;
}

module.exports = { createApp };
