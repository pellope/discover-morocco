const crypto = require('crypto');
const express = require('express');
const { HttpError, EXPENSE_CATEGORIES, validateTrip, validateCustomPlan, validateExpense, validateTravelers } = require('../validation');
const { planTrip } = require('../plan');

const newToken = () => crypto.randomBytes(16).toString('base64url');
const round = (n) => Math.round(n * 100) / 100;
const parse = (json, fallback) => { try { return JSON.parse(json) ?? fallback; } catch { return fallback; } };

// Voyageur sans prénom : « #2 », que l'interface affiche « Voyageur 2 ».
function defaultTravelers(ownerName, people) {
  return Array.from({ length: people }, (_, i) => (i === 0 ? ownerName.split(' ')[0] : `#${i + 1}`));
}

function toTrip(row) {
  const trip = {
    id: row.id,
    destination: row.destination,
    stops: parse(row.stops, null) ?? [{ destination: row.destination, days: row.days }],
    tripType: row.trip_type,
    budget: row.budget,
    days: row.days,
    people: row.people,
    comfort: row.comfort ?? 'budget',
    startDate: row.start_date ?? null,
    createdAt: row.created_at,
  };
  const customPlan = parse(row.custom_plan, null);
  return { ...trip, ...planTrip({ ...trip, customPlan }) };
}

// Dépenses réelles comparées au budget, et comptes entre voyageurs (parts égales).
function expenseReport(db, row, trip, travelers) {
  const expenses = db.prepare('SELECT * FROM expenses WHERE trip_id = ? ORDER BY id DESC').all(row.id)
    .map((e) => ({ id: e.id, category: e.category, label: e.label, amount: e.amount, paidBy: Math.min(e.paid_by, travelers.length - 1), createdAt: e.created_at }));

  const byCategory = {};
  for (const key of EXPENSE_CATEGORIES) {
    const spent = round(expenses.filter((e) => e.category === key).reduce((sum, e) => sum + e.amount, 0));
    const budget = trip.budgetCoach.breakdown[key].amount;
    byCategory[key] = { budget, spent, remaining: round(budget - spent) };
  }
  const totalSpent = round(expenses.reduce((sum, e) => sum + e.amount, 0));

  const share = totalSpent / travelers.length;
  const balances = travelers.map((name, i) => {
    const paid = round(expenses.filter((e) => e.paidBy === i).reduce((sum, e) => sum + e.amount, 0));
    return { name, paid, share: round(share), balance: round(paid - share) };
  });

  // Qui rembourse qui : on apparie le plus gros débiteur au plus gros créancier.
  const debtors = balances.filter((b) => b.balance < -0.005).map((b) => ({ name: b.name, amount: -b.balance }));
  const creditors = balances.filter((b) => b.balance > 0.005).map((b) => ({ name: b.name, amount: b.balance }));
  const settlements = [];
  while (debtors.length && creditors.length) {
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);
    const amount = round(Math.min(debtors[0].amount, creditors[0].amount));
    if (amount > 0) settlements.push({ from: debtors[0].name, to: creditors[0].name, amount });
    debtors[0].amount -= amount;
    creditors[0].amount -= amount;
    if (debtors[0].amount < 0.005) debtors.shift();
    if (creditors[0].amount < 0.005) creditors.shift();
  }

  return { expenses, travelers, summary: { byCategory, totalSpent, remaining: round(trip.budget - totalSpent) }, balances, settlements };
}

// Toutes les routes exigent d'être connecté ; un utilisateur ne voit que ses voyages.
function tripsRouter(db) {
  const router = express.Router();

  const findOwned = (req) => {
    const row = db.prepare('SELECT * FROM trips WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!row) throw new HttpError(404, 'trip_not_found', 'Trip not found.');
    return row;
  };
  const reload = (id) => db.prepare('SELECT * FROM trips WHERE id = ?').get(id);

  // Les voyages créés avant l'ajout du partage reçoivent leur jeton à la première lecture.
  const ensureToken = (row) => {
    if (row.share_token) return row.share_token;
    const token = newToken();
    db.prepare('UPDATE trips SET share_token = ? WHERE id = ?').run(token, row.id);
    return token;
  };
  const present = (row) => ({ ...toTrip(row), shareToken: ensureToken(row) });
  const travelersOf = (req, row) => {
    const saved = parse(row.travelers, null);
    return Array.isArray(saved) && saved.length === row.people ? saved : defaultTravelers(req.user.name, row.people);
  };

  router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM trips WHERE user_id = ? ORDER BY id DESC').all(req.user.id);
    res.json({ trips: rows.map(present) });
  });

  router.post('/', (req, res) => {
    const t = validateTrip(req.body);
    const info = db.prepare(`
      INSERT INTO trips (user_id, destination, trip_type, budget, days, people, comfort, start_date, stops, share_token)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(req.user.id, t.destination, t.tripType, t.budget, t.days, t.people, t.comfort, t.startDate, JSON.stringify(t.stops), newToken());
    res.status(201).json({ trip: present(reload(info.lastInsertRowid)) });
  });

  router.get('/:id', (req, res) => {
    res.json({ trip: present(findOwned(req)) });
  });

  router.put('/:id', (req, res) => {
    const row = findOwned(req);
    const t = validateTrip(req.body);
    // Le plan modifié et les prénoms ne valent que pour la durée et le nombre de voyageurs d'origine.
    db.prepare(`
      UPDATE trips SET destination = ?, trip_type = ?, budget = ?, days = ?, people = ?, comfort = ?, start_date = ?, stops = ?,
        custom_plan = CASE WHEN days = ? AND stops IS ? THEN custom_plan ELSE NULL END,
        travelers = CASE WHEN people = ? THEN travelers ELSE NULL END
      WHERE id = ?
    `).run(t.destination, t.tripType, t.budget, t.days, t.people, t.comfort, t.startDate, JSON.stringify(t.stops),
      t.days, JSON.stringify(t.stops), t.people, row.id);
    res.json({ trip: present(reload(row.id)) });
  });

  router.delete('/:id', (req, res) => {
    db.prepare('DELETE FROM trips WHERE id = ?').run(findOwned(req).id);
    res.status(204).end();
  });

  // Plan jour par jour modifié par l'utilisateur ; { days: null } revient au plan proposé.
  router.put('/:id/plan', (req, res) => {
    const row = findOwned(req);
    const plan = req.body?.days === null ? null : validateCustomPlan(req.body, row.days);
    db.prepare('UPDATE trips SET custom_plan = ? WHERE id = ?').run(plan && JSON.stringify(plan), row.id);
    res.json({ trip: present(reload(row.id)) });
  });

  router.put('/:id/travelers', (req, res) => {
    const row = findOwned(req);
    db.prepare('UPDATE trips SET travelers = ? WHERE id = ?').run(JSON.stringify(validateTravelers(req.body, row.people)), row.id);
    const fresh = reload(row.id);
    res.json(expenseReport(db, fresh, toTrip(fresh), travelersOf(req, fresh)));
  });

  router.get('/:id/expenses', (req, res) => {
    const row = findOwned(req);
    res.json(expenseReport(db, row, toTrip(row), travelersOf(req, row)));
  });

  router.post('/:id/expenses', (req, res) => {
    const row = findOwned(req);
    const e = validateExpense(req.body, row.people);
    db.prepare('INSERT INTO expenses (trip_id, category, label, amount, paid_by) VALUES (?, ?, ?, ?, ?)')
      .run(row.id, e.category, e.label, e.amount, e.paidBy);
    res.status(201).json(expenseReport(db, row, toTrip(row), travelersOf(req, row)));
  });

  router.delete('/:id/expenses/:expenseId', (req, res) => {
    const row = findOwned(req);
    db.prepare('DELETE FROM expenses WHERE id = ? AND trip_id = ?').run(req.params.expenseId, row.id);
    res.json(expenseReport(db, row, toTrip(row), travelersOf(req, row)));
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
