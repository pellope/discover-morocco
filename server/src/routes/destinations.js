const express = require('express');
const { DESTINATIONS, findDestination, effectiveMinimum } = require('../destinations');
const { TRIP_TYPES, COMFORT_LEVELS } = require('../budgetCoach');
const { HttpError, validateReview } = require('../validation');

function destinationsRouter(db, auth) {
  const router = express.Router();

  const ratings = () => {
    const map = new Map();
    for (const row of db.prepare('SELECT destination_id AS id, AVG(rating) AS average, COUNT(*) AS count FROM reviews GROUP BY destination_id').all()) {
      map.set(row.id, { average: Math.round(row.average * 10) / 10, count: row.count });
    }
    return map;
  };
  const known = (req) => {
    const destination = findDestination(req.params.id);
    if (!destination) throw new HttpError(404, 'destination_not_found', 'Destination not found.');
    return destination;
  };

  // Recherche : ?type=beach filtre par type de voyage ; ?budget=&days=&people= ajoute « fits »
  // (le budget suffit-il ?) et classe d'abord les villes qui rentrent dans le budget.
  // ?comfort= et ?month= ajustent le budget minimum (confort choisi, haute saison).
  router.get('/', (req, res) => {
    const { type, comfort = 'budget' } = req.query;
    const month = req.query.month === undefined ? null : Number(req.query.month);
    if (type !== undefined && !TRIP_TYPES.includes(type)) {
      throw new HttpError(400, 'invalid_trip_type', `Trip type must be one of: ${TRIP_TYPES.join(', ')}.`);
    }
    if (!COMFORT_LEVELS.includes(comfort)) throw new HttpError(400, 'invalid_comfort', 'Unknown comfort level.');
    if (month !== null && !(Number.isInteger(month) && month >= 1 && month <= 12)) throw new HttpError(400, 'invalid_date', 'Month must be 1 to 12.');

    const rated = ratings();
    let list = (type ? DESTINATIONS.filter((d) => d.types.includes(type)) : DESTINATIONS).map((d) => {
      const min = effectiveMinimum(d, { comfort, month });
      return { ...d, minDailyBudget: min.amount, peak: min.peak, rating: rated.get(d.id) ?? { average: null, count: 0 } };
    });

    if (req.query.budget !== undefined) {
      const budget = Number(req.query.budget);
      const days = Number(req.query.days ?? 1);
      const people = Number(req.query.people ?? 1);
      if (!Number.isFinite(budget) || budget <= 0) throw new HttpError(400, 'invalid_budget', 'Budget must be a positive number.');
      if (!Number.isInteger(days) || days < 1 || days > 365) throw new HttpError(400, 'invalid_days', 'Days must be an integer between 1 and 365.');
      if (!Number.isInteger(people) || people < 1 || people > 50) throw new HttpError(400, 'invalid_people', 'People must be an integer between 1 and 50.');
      const perDayPerPerson = budget / days / people;
      list = list
        .map((d) => ({ ...d, fits: perDayPerPerson >= d.minDailyBudget }))
        .sort((a, b) => Number(b.fits) - Number(a.fits) || a.minDailyBudget - b.minDailyBudget);
    }
    res.json({ destinations: list });
  });

  router.get('/:id', (req, res) => {
    const destination = known(req);
    res.json({ destination: { ...destination, rating: ratings().get(destination.id) ?? { average: null, count: 0 } } });
  });

  // Avis des voyageurs : lecture publique, un avis par personne et par ville.
  router.get('/:id/reviews', (req, res) => {
    const destination = known(req);
    const reviews = db.prepare(`
      SELECT reviews.user_id AS userId, users.name, rating, comment, reviews.created_at AS createdAt
      FROM reviews JOIN users ON users.id = reviews.user_id WHERE destination_id = ? ORDER BY reviews.created_at DESC, reviews.rowid DESC
    `).all(destination.id).map((r) => ({ ...r, name: r.name.split(' ')[0] }));
    res.json({ rating: ratings().get(destination.id) ?? { average: null, count: 0 }, reviews });
  });

  router.put('/:id/review', auth, (req, res) => {
    const destination = known(req);
    const { rating, comment } = validateReview(req.body);
    db.prepare(`
      INSERT INTO reviews (user_id, destination_id, rating, comment) VALUES (?, ?, ?, ?)
      ON CONFLICT (user_id, destination_id) DO UPDATE SET rating = excluded.rating, comment = excluded.comment, created_at = datetime('now')
    `).run(req.user.id, destination.id, rating, comment);
    res.json({ rating: ratings().get(destination.id) });
  });

  router.delete('/:id/review', auth, (req, res) => {
    db.prepare('DELETE FROM reviews WHERE user_id = ? AND destination_id = ?').run(req.user.id, known(req).id);
    res.status(204).end();
  });

  return router;
}

module.exports = { destinationsRouter };
