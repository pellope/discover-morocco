const express = require('express');
const cors = require('cors');
const { authRouter, requireAuth } = require('./routes/auth');
const { tripsRouter, sharedRouter } = require('./routes/trips');
const { destinationsRouter } = require('./routes/destinations');
const { favoritesRouter } = require('./routes/favorites');
const { HttpError, validateTrip } = require('./validation');
const { computeBudgetCoach } = require('./budgetCoach');
const { buildItinerary } = require('./itinerary');

function createApp({ db, jwtSecret, corsOrigin }) {
  const app = express();
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: '50kb' }));

  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/auth', authRouter(db, jwtSecret));
  app.use('/api/destinations', destinationsRouter());
  app.use('/api/trips', requireAuth(db, jwtSecret), tripsRouter(db));
  app.use('/api/shared', sharedRouter(db));
  app.use('/api/favorites', requireAuth(db, jwtSecret), favoritesRouter(db));

  // Calcul du Budget Coach sans compte ni sauvegarde (aperçu du formulaire).
  app.post('/api/budget-coach', (req, res) => {
    const trip = validateTrip(req.body);
    const budgetCoach = computeBudgetCoach(trip);
    res.json({ budgetCoach, itinerary: buildItinerary(trip, budgetCoach) });
  });

  app.use((_req, _res, next) => next(new HttpError(404, 'not_found', 'Route not found.')));

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
