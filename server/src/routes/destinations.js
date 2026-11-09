const express = require('express');
const { DESTINATIONS, findDestination } = require('../destinations');
const { TRIP_TYPES } = require('../budgetCoach');
const { HttpError } = require('../validation');

function destinationsRouter() {
  const router = express.Router();

  // Recherche : ?type=beach filtre par type de voyage ;
  // ?budget=&days=&people= ajoute « fits » (le budget suffit-il pour cette ville ?)
  // et classe d'abord les villes qui rentrent dans le budget.
  router.get('/', (req, res) => {
    const { type } = req.query;
    if (type !== undefined && !TRIP_TYPES.includes(type)) {
      throw new HttpError(400, 'invalid_trip_type', `Trip type must be one of: ${TRIP_TYPES.join(', ')}.`);
    }
    let list = type ? DESTINATIONS.filter((d) => d.types.includes(type)) : DESTINATIONS;

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
    const destination = findDestination(req.params.id);
    if (!destination) throw new HttpError(404, 'destination_not_found', 'Destination not found.');
    res.json({ destination });
  });

  return router;
}

module.exports = { destinationsRouter };
