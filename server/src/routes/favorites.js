const express = require('express');
const { findDestination } = require('../destinations');
const { HttpError } = require('../validation');

// Favoris de l'utilisateur connecté (liste d'identifiants de destinations).
function favoritesRouter(db) {
  const router = express.Router();

  const list = (userId) => db
    .prepare('SELECT destination_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC, rowid DESC')
    .all(userId)
    .map((row) => row.destination_id);

  router.get('/', (req, res) => {
    res.json({ favorites: list(req.user.id) });
  });

  router.put('/:id', (req, res) => {
    if (!findDestination(req.params.id)) throw new HttpError(404, 'destination_not_found', 'Destination not found.');
    db.prepare('INSERT OR IGNORE INTO favorites (user_id, destination_id) VALUES (?, ?)').run(req.user.id, req.params.id);
    res.json({ favorites: list(req.user.id) });
  });

  router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM favorites WHERE user_id = ? AND destination_id = ?').run(req.user.id, req.params.id);
    res.json({ favorites: list(req.user.id) });
  });

  return router;
}

module.exports = { favoritesRouter };
