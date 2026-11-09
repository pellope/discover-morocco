const express = require('express');
const { HttpError, validateTrip } = require('../validation');
const { computeBudgetCoach } = require('../budgetCoach');

function toTrip(row) {
  const trip = {
    id: row.id,
    destination: row.destination,
    tripType: row.trip_type,
    budget: row.budget,
    days: row.days,
    people: row.people,
    createdAt: row.created_at,
  };
  return { ...trip, budgetCoach: computeBudgetCoach(trip) };
}

// Toutes les routes exigent d'être connecté ; un utilisateur ne voit que ses voyages.
function tripsRouter(db) {
  const router = express.Router();

  const findOwned = (req) => {
    const row = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) throw new HttpError(404, 'trip_not_found', 'Trip not found.');
    return row;
  };

  router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
    res.json({ trips: rows.map(toTrip) });
  });

  router.post('/', (req, res) => {
    const t = validateTrip(req.body);
    const info = db.prepare(
      'INSERT INTO trips (user_id, destination, trip_type, budget, days, people) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, t.destination, t.tripType, t.budget, t.days, t.people);
    const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ trip: toTrip(row) });
  });

  router.get('/:id', (req, res) => {
    res.json({ trip: toTrip(findOwned(req)) });
  });

  router.put('/:id', (req, res) => {
    const row = findOwned(req);
    const t = validateTrip(req.body);
    db.prepare('UPDATE trips SET destination = ?, trip_type = ?, budget = ?, days = ?, people = ? WHERE id = ?')
      .run(t.destination, t.tripType, t.budget, t.days, t.people, row.id);
    res.json({ trip: toTrip(db.prepare('SELECT * FROM trips WHERE id = ?').get(row.id)) });
  });

  router.delete('/:id', (req, res) => {
    const row = findOwned(req);
    db.prepare('DELETE FROM trips WHERE id = ?').run(row.id);
    res.status(204).end();
  });

  return router;
}

module.exports = { tripsRouter };
