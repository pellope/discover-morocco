const crypto = require('crypto');
const express = require('express');
const { HttpError, validateTrip } = require('../validation');
const { computeBudgetCoach } = require('../budgetCoach');
const { buildItinerary } = require('../itinerary');

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
  const budgetCoach = computeBudgetCoach(trip);
  return { ...trip, budgetCoach, itinerary: buildItinerary(trip, budgetCoach) };
}

const newToken = () => crypto.randomBytes(16).toString('base64url');

// Toutes les routes exigent d'être connecté ; un utilisateur ne voit que ses voyages.
function tripsRouter(db) {
  const router = express.Router();

  const findOwned = (req) => {
    const row = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) throw new HttpError(404, 'trip_not_found', 'Trip not found.');
    return row;
  };

  // Les voyages créés avant l'ajout du partage reçoivent leur jeton à la première lecture.
  const ensureToken = (row) => {
    if (row.share_token) return row.share_token;
    const token = newToken();
    db.prepare('UPDATE trips SET share_token = ? WHERE id = ?').run(token, row.id);
    return token;
  };

  router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
    res.json({ trips: rows.map((row) => ({ ...toTrip(row), shareToken: ensureToken(row) })) });
  });

  router.post('/', (req, res) => {
    const t = validateTrip(req.body);
    const info = db.prepare(
      'INSERT INTO trips (user_id, destination, trip_type, budget, days, people, share_token) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, t.destination, t.tripType, t.budget, t.days, t.people, newToken());
    const row = db.prepare('SELECT * FROM trips WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ trip: { ...toTrip(row), shareToken: row.share_token } });
  });

  router.get('/:id', (req, res) => {
    const row = findOwned(req);
    res.json({ trip: { ...toTrip(row), shareToken: ensureToken(row) } });
  });

  router.put('/:id', (req, res) => {
    const row = findOwned(req);
    const t = validateTrip(req.body);
    db.prepare('UPDATE trips SET destination = ?, trip_type = ?, budget = ?, days = ?, people = ? WHERE id = ?')
      .run(t.destination, t.tripType, t.budget, t.days, t.people, row.id);
    res.json({ trip: { ...toTrip(db.prepare('SELECT * FROM trips WHERE id = ?').get(row.id)), shareToken: ensureToken(row) } });
  });

  router.delete('/:id', (req, res) => {
    const row = findOwned(req);
    db.prepare('DELETE FROM trips WHERE id = ?').run(row.id);
    res.status(204).end();
  });

  return router;
}

// Lecture publique d'un voyage partagé : quiconque a le lien peut le voir, sans compte.
function sharedRouter(db) {
  const router = express.Router();
  router.get('/:token', (req, res) => {
    const row = db.prepare(
      'SELECT trips.*, users.name AS owner_name FROM trips JOIN users ON users.id = trips.user_id WHERE share_token = ?'
    ).get(req.params.token);
    if (!row) throw new HttpError(404, 'trip_not_found', 'Trip not found.');
    const { id, ...trip } = toTrip(row);
    res.json({ trip: { ...trip, sharedBy: row.owner_name.split(' ')[0] } });
  });
  return router;
}

module.exports = { tripsRouter, sharedRouter };
