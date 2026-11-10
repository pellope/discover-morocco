const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { openDb } = require('../src/db');
const { createApp } = require('../src/app');
const { computeBudgetCoach, ALLOCATIONS } = require('../src/budgetCoach');

let server;
let base;

before(async () => {
  const app = createApp({
    db: openDb(':memory:'),
    jwtSecret: 'test-secret-test-secret-test-secret',
    corsOrigin: '*',
    googleClientId: 'test-client-id',
    // Faux vérificateur Google : le « jeton » est directement le contenu attendu.
    verifyGoogleToken: async (credential) => JSON.parse(credential),
  });
  server = app.listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://localhost:${server.address().port}/api`;
});

after(() => server.close());

async function call(method, path, body, token) {
  const res = await fetch(base + path, {
    method,
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  return { status: res.status, body: text ? JSON.parse(text) : null };
}

const trip = { destination: 'Marrakech', tripType: 'adventure', budget: 6000, days: 5, people: 2 };

async function register(email) {
  const res = await call('POST', '/auth/register', { name: 'Test', email, password: 'password123' });
  assert.equal(res.status, 201);
  return res.body.token;
}

test('budget coach: per-day figures, level and breakdown', () => {
  const coach = computeBudgetCoach(trip);
  assert.equal(coach.perDay, 1200);
  assert.equal(coach.perDayPerPerson, 600);
  assert.equal(coach.level, 'comfortable');
  assert.equal(coach.breakdown.activities.amount, 1800);
  assert.equal(computeBudgetCoach({ ...trip, budget: 1000 }).level, 'tight');
  assert.equal(computeBudgetCoach({ ...trip, budget: 20000 }).level, 'large');
});

test('budget coach: allocations total 100% and amounts total the budget', () => {
  for (const [type, shares] of Object.entries(ALLOCATIONS)) {
    assert.equal(Object.values(shares).reduce((a, b) => a + b, 0), 100, type);
    const { breakdown } = computeBudgetCoach({ ...trip, tripType: type, budget: 3333.33 });
    const total = Object.values(breakdown).reduce((a, b) => a + b.amount, 0);
    assert.equal(Math.round(total * 100) / 100, 3333.33, type);
  }
});

test('register, login and read profile', async () => {
  const token = await register('a@example.com');
  const me = await call('GET', '/auth/me', null, token);
  assert.equal(me.body.user.email, 'a@example.com');
  assert.equal(me.body.user.password_hash, undefined);

  const login = await call('POST', '/auth/login', { email: 'A@Example.com', password: 'password123' });
  assert.equal(login.status, 200);
  const bad = await call('POST', '/auth/login', { email: 'a@example.com', password: 'wrong-password' });
  assert.equal(bad.status, 401);
  const dup = await call('POST', '/auth/register', { name: 'X', email: 'a@example.com', password: 'password123' });
  assert.equal(dup.status, 409);
  const lang = await call('PATCH', '/auth/me', { language: 'ar' }, token);
  assert.equal(lang.body.user.language, 'ar');
});

test('rejects invalid registration and unauthenticated access', async () => {
  assert.equal((await call('POST', '/auth/register', { name: 'X', email: 'nope', password: 'password123' })).status, 400);
  assert.equal((await call('POST', '/auth/register', { name: 'X', email: 'b@example.com', password: 'short' })).status, 400);
  assert.equal((await call('GET', '/trips')).status, 401);
  assert.equal((await call('GET', '/trips', null, 'garbage')).status, 401);
});

test('trip CRUD is scoped to the owner', async () => {
  const alice = await register('alice@example.com');
  const bob = await register('bob@example.com');

  const created = await call('POST', '/trips', trip, alice);
  assert.equal(created.status, 201);
  assert.equal(created.body.trip.budgetCoach.level, 'comfortable');
  const { id } = created.body.trip;

  assert.equal((await call('GET', '/trips', null, alice)).body.trips.length, 1);
  assert.equal((await call('GET', '/trips', null, bob)).body.trips.length, 0);
  assert.equal((await call('GET', `/trips/${id}`, null, bob)).status, 404);
  assert.equal((await call('PUT', `/trips/${id}`, trip, bob)).status, 404);
  assert.equal((await call('DELETE', `/trips/${id}`, null, bob)).status, 404);

  const updated = await call('PUT', `/trips/${id}`, { ...trip, days: 10 }, alice);
  assert.equal(updated.body.trip.budgetCoach.perDayPerPerson, 300);
  assert.equal(updated.body.trip.budgetCoach.level, 'tight');

  assert.equal((await call('POST', '/trips', { ...trip, days: 0 }, alice)).status, 400);
  assert.equal((await call('POST', '/trips', { ...trip, tripType: 'ski' }, alice)).status, 400);

  assert.equal((await call('DELETE', `/trips/${id}`, null, alice)).status, 204);
  assert.equal((await call('GET', `/trips/${id}`, null, alice)).status, 404);
});

test('public budget coach preview and error shapes', async () => {
  const res = await call('POST', '/budget-coach', trip);
  assert.equal(res.body.budgetCoach.perDayPerPerson, 600);
  assert.equal((await call('GET', '/nope')).body.error.code, 'not_found');
  const malformed = await fetch(`${base}/budget-coach`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{oops',
  });
  assert.equal(malformed.status, 400);
});

test('destinations: list, filter by type and budget fit', async () => {
  const all = await call('GET', '/destinations');
  assert.equal(all.body.destinations.length, 14);

  const desert = await call('GET', '/destinations?type=desert');
  assert.deepEqual(desert.body.destinations.map((d) => d.id).sort(), ['Dakhla', 'Merzouga', 'Ouarzazate']);

  // 4000 MAD / 5 jours / 2 personnes = 400 MAD par jour et par personne.
  const search = await call('GET', '/destinations?budget=4000&days=5&people=2');
  const fits = search.body.destinations.filter((d) => d.fits).map((d) => d.id);
  assert.ok(fits.includes('Chefchaouen') && fits.includes('Tangier'));
  assert.ok(!fits.includes('Marrakech'));
  assert.equal(search.body.destinations[0].fits, true);
  assert.equal(search.body.destinations.at(-1).fits, false);

  assert.equal((await call('GET', '/destinations/Fes')).body.destination.name.fr, 'Fès');
  assert.equal((await call('GET', '/destinations/Paris')).status, 404);
  assert.equal((await call('GET', '/destinations?type=ski')).status, 400);
  assert.equal((await call('GET', '/destinations?budget=-5')).status, 400);
});

test('favorites are per user and idempotent', async () => {
  const carol = await register('carol@example.com');
  const dave = await register('dave@example.com');
  assert.equal((await call('GET', '/favorites')).status, 401);

  await call('PUT', '/favorites/Fes', null, carol);
  const twice = await call('PUT', '/favorites/Fes', null, carol);
  assert.deepEqual(twice.body.favorites, ['Fes']);
  assert.equal((await call('PUT', '/favorites/Paris', null, carol)).status, 404);
  assert.deepEqual((await call('GET', '/favorites', null, dave)).body.favorites, []);

  const removed = await call('DELETE', '/favorites/Fes', null, carol);
  assert.deepEqual(removed.body.favorites, []);
});

test('trips require a known destination', async () => {
  const token = await register('erin@example.com');
  assert.equal((await call('POST', '/trips', { ...trip, destination: 'Paris' }, token)).status, 400);
});

test('itinerary: one entry per day, within the activities budget, trip type first', async () => {
  const res = await call('POST', '/budget-coach', trip); // Marrakech, adventure, 6000 MAD, 5 days, 2 people
  const { itinerary, budgetCoach } = res.body;
  assert.equal(itinerary.days.length, 5);
  assert.equal(itinerary.days[0].activities[0].type, 'adventure');
  assert.ok(itinerary.activitiesPlanned <= budgetCoach.breakdown.activities.amount);
  assert.equal(itinerary.days[0].activities[0].cost, 500); // vallée de l'Ourika : 250 MAD × 2 personnes
  // 5 activités pour 5 jours : les derniers jours sont libres.
  assert.equal(itinerary.days.at(-1).activities.length, 0);

  const poor = await call('POST', '/budget-coach', { ...trip, budget: 500 });
  const paid = poor.body.itinerary.days.flatMap((d) => d.activities).filter((a) => a.cost > poor.body.budgetCoach.breakdown.activities.amount);
  assert.equal(paid.length, 0);
});

test('shared trips are readable without an account, by token only', async () => {
  const token = await register('frank@example.com');
  const created = await call('POST', '/trips', trip, token);
  const { shareToken } = created.body.trip;
  assert.ok(shareToken.length >= 20);

  const shared = await call('GET', `/shared/${shareToken}`);
  assert.equal(shared.status, 200);
  assert.equal(shared.body.trip.destination, 'Marrakech');
  assert.equal(shared.body.trip.sharedBy, 'Test');
  assert.equal(shared.body.trip.id, undefined);
  assert.equal(shared.body.trip.itinerary.days.length, 5);
  assert.equal((await call('GET', '/shared/not-a-real-token')).status, 404);

  await call('DELETE', `/trips/${created.body.trip.id}`, null, token);
  assert.equal((await call('GET', `/shared/${shareToken}`)).status, 404);
});

test('destinations carry map coordinates', async () => {
  const all = await call('GET', '/destinations');
  assert.ok(all.body.destinations.every((d) => typeof d.lat === 'number' && typeof d.lng === 'number'));
});

test('comfort level shifts the allocation and raises the recommended minimum', async () => {
  const base = { destination: 'Fes', tripType: 'culture', budget: 5000, days: 5, people: 2 };
  const budget = (await call('POST', '/budget-coach', base)).body;
  const luxury = (await call('POST', '/budget-coach', { ...base, comfort: 'luxury' })).body;
  assert.equal(budget.budgetCoach.breakdown.accommodation.percent, 35);
  assert.equal(luxury.budgetCoach.breakdown.accommodation.percent, 45);
  const total = Object.values(luxury.budgetCoach.breakdown).reduce((sum, b) => sum + b.percent, 0);
  assert.equal(total, 100);
  assert.equal(budget.minimum.amount, 350);
  assert.equal(budget.minimum.enough, true);
  assert.equal(luxury.minimum.amount, 1050);
  assert.equal(luxury.minimum.enough, false);
  assert.equal((await call('POST', '/budget-coach', { ...base, comfort: 'royal' })).status, 400);
});

test('start date gives real dates and a peak-season minimum', async () => {
  const base = { destination: 'Fes', tripType: 'culture', budget: 5000, days: 3, people: 2 };
  const april = (await call('POST', '/budget-coach', { ...base, startDate: '2027-04-29' })).body;
  assert.deepEqual(april.itinerary.days.map((d) => d.date), ['2027-04-29', '2027-04-30', '2027-05-01']);
  assert.equal(april.minimum.peak, true);
  assert.equal(april.minimum.amount, 438); // 350 × 1,25
  const august = (await call('POST', '/budget-coach', { ...base, startDate: '2027-08-10' })).body;
  assert.equal(august.minimum.peak, false);
  assert.equal((await call('POST', '/budget-coach', { ...base, startDate: '29/04/2027' })).status, 400);
  const search = await call('GET', '/destinations?month=4&comfort=comfort');
  assert.equal(search.body.destinations.find((d) => d.id === 'Fes').minDailyBudget, 656);
});

test('circuit: several stops, legs between them, days numbered across stops', async () => {
  const circuit = {
    tripType: 'desert', budget: 12000, people: 2,
    stops: [{ destination: 'Marrakech', days: 2 }, { destination: 'Ouarzazate', days: 1 }, { destination: 'Merzouga', days: 2 }],
  };
  const { body } = await call('POST', '/budget-coach', circuit);
  assert.equal(body.itinerary.days.length, 5);
  assert.deepEqual(body.itinerary.days.map((d) => d.destination), ['Marrakech', 'Marrakech', 'Ouarzazate', 'Merzouga', 'Merzouga']);
  assert.equal(body.itinerary.legs.length, 2);
  assert.ok(body.itinerary.legs[0].km > 100 && body.itinerary.legs[0].km < 300);
  assert.equal(body.itinerary.legsCost, body.itinerary.legs.reduce((sum, leg) => sum + leg.costPerPerson * 2, 0));
  assert.ok(body.itinerary.activitiesPlanned <= body.budgetCoach.breakdown.activities.amount);
  assert.ok(body.packingList.includes('cheche'));

  const token = await register('circuit@example.com');
  const saved = await call('POST', '/trips', circuit, token);
  assert.equal(saved.status, 201);
  assert.equal(saved.body.trip.days, 5);
  assert.equal(saved.body.trip.stops.length, 3);
  assert.equal((await call('POST', '/trips', { ...circuit, stops: [circuit.stops[0], circuit.stops[0]] }, token)).status, 400);
  assert.equal((await call('POST', '/trips', { ...circuit, stops: [circuit.stops[0]] }, token)).status, 400);
});

test('custom plan replaces the suggested itinerary and can be reset', async () => {
  const token = await register('plan@example.com');
  const { id } = (await call('POST', '/trips', { ...trip, days: 2 }, token)).body.trip;
  const custom = { days: [[{ name: 'Hammam traditionnel', cost: 150 }], []] };
  const edited = await call('PUT', `/trips/${id}/plan`, custom, token);
  assert.equal(edited.body.trip.itinerary.custom, true);
  assert.equal(edited.body.trip.itinerary.days[0].activities[0].name, 'Hammam traditionnel');
  assert.equal(edited.body.trip.itinerary.days[1].activities.length, 0);
  assert.equal(edited.body.trip.itinerary.activitiesPlanned, 150);
  assert.equal((await call('PUT', `/trips/${id}/plan`, { days: [[]] }, token)).status, 400);
  assert.equal((await call('PUT', `/trips/${id}/plan`, { days: [[{ name: '', cost: 1 }], []] }, token)).status, 400);
  assert.equal((await call('PUT', `/trips/${id}/plan`, { days: [[{ name: 'X', cost: -1 }], []] }, token)).status, 400);
  const reset = await call('PUT', `/trips/${id}/plan`, { days: null }, token);
  assert.equal(reset.body.trip.itinerary.custom, false);
  const other = await register('plan-other@example.com');
  assert.equal((await call('PUT', `/trips/${id}/plan`, custom, other)).status, 404);
});

test('expenses: remaining budget per category and who owes whom', async () => {
  const token = await register('spend@example.com');
  const { id } = (await call('POST', '/trips', { ...trip, people: 3 }, token)).body.trip; // 6000 MAD, 3 personnes
  const empty = await call('GET', `/trips/${id}/expenses`, null, token);
  assert.deepEqual(empty.body.travelers, ['Test', '#2', '#3']);
  assert.equal(empty.body.summary.remaining, 6000);

  const named = await call('PUT', `/trips/${id}/travelers`, { travelers: ['Sara', 'Omar', 'Lina'] }, token);
  assert.deepEqual(named.body.travelers, ['Sara', 'Omar', 'Lina']);
  assert.equal((await call('PUT', `/trips/${id}/travelers`, { travelers: ['Sara'] }, token)).status, 400);

  await call('POST', `/trips/${id}/expenses`, { category: 'food', label: 'Dîner', amount: 300, paidBy: 0 }, token);
  const report = await call('POST', `/trips/${id}/expenses`, { category: 'transport', label: 'Taxi', amount: 60, paidBy: 1 }, token);
  assert.equal(report.status, 201);
  assert.equal(report.body.summary.totalSpent, 360);
  assert.equal(report.body.summary.byCategory.food.spent, 300);
  assert.equal(report.body.summary.byCategory.food.remaining, 600); // 15 % de 6000 = 900
  assert.deepEqual(report.body.balances.map((b) => b.balance), [180, -60, -120]);
  assert.deepEqual(report.body.settlements, [
    { from: 'Lina', to: 'Sara', amount: 120 },
    { from: 'Omar', to: 'Sara', amount: 60 },
  ]);

  assert.equal((await call('POST', `/trips/${id}/expenses`, { category: 'food', label: 'X', amount: 0 }, token)).status, 400);
  assert.equal((await call('POST', `/trips/${id}/expenses`, { category: 'gifts', label: 'X', amount: 5 }, token)).status, 400);
  assert.equal((await call('POST', `/trips/${id}/expenses`, { category: 'food', label: 'X', amount: 5, paidBy: 3 }, token)).status, 400);
  const other = await register('spend-other@example.com');
  assert.equal((await call('GET', `/trips/${id}/expenses`, null, other)).status, 404);

  const removed = await call('DELETE', `/trips/${id}/expenses/${report.body.expenses[0].id}`, null, token);
  assert.equal(removed.body.summary.totalSpent, 300);
});

test('reviews: one per user and city, public average', async () => {
  const a = await register('rev-a@example.com');
  const b = await register('rev-b@example.com');
  assert.equal((await call('PUT', '/destinations/Rabat/review', { rating: 5 })).status, 401);
  await call('PUT', '/destinations/Rabat/review', { rating: 5, comment: 'Superbe' }, a);
  await call('PUT', '/destinations/Rabat/review', { rating: 4, comment: 'Très calme' }, a); // remplace le premier
  const second = await call('PUT', '/destinations/Rabat/review', { rating: 3 }, b);
  assert.deepEqual(second.body.rating, { average: 3.5, count: 2 });
  const list = await call('GET', '/destinations/Rabat/reviews');
  assert.equal(list.body.reviews.length, 2);
  assert.ok(list.body.reviews.some((r) => r.comment === 'Très calme'));
  assert.equal((await call('GET', '/destinations')).body.destinations.find((d) => d.id === 'Rabat').rating.count, 2);
  assert.equal((await call('PUT', '/destinations/Rabat/review', { rating: 6 }, a)).status, 400);
  assert.equal((await call('PUT', '/destinations/Paris/review', { rating: 4 }, a)).status, 404);
  assert.equal((await call('DELETE', '/destinations/Rabat/review', null, a)).status, 204);
  assert.equal((await call('GET', '/destinations/Rabat/reviews')).body.rating.count, 1);
});

test('profile: rename, change password, delete account', async () => {
  const token = await register('profile@example.com');
  assert.equal((await call('PATCH', '/auth/me', { name: 'Nouveau Nom' }, token)).body.user.name, 'Nouveau Nom');
  assert.equal((await call('PATCH', '/auth/me', { name: '' }, token)).status, 400);

  assert.equal((await call('POST', '/auth/password', { currentPassword: 'nope', newPassword: 'another-pass-1' }, token)).status, 401);
  assert.equal((await call('POST', '/auth/password', { currentPassword: 'password123', newPassword: 'short' }, token)).status, 400);
  assert.equal((await call('POST', '/auth/password', { currentPassword: 'password123', newPassword: 'another-pass-1' }, token)).status, 204);
  assert.equal((await call('POST', '/auth/login', { email: 'profile@example.com', password: 'password123' })).status, 401);
  assert.equal((await call('POST', '/auth/login', { email: 'profile@example.com', password: 'another-pass-1' })).status, 200);

  await call('POST', '/trips', trip, token);
  assert.equal((await call('DELETE', '/auth/me', { password: 'wrong' }, token)).status, 401);
  assert.equal((await call('DELETE', '/auth/me', { password: 'another-pass-1' }, token)).status, 204);
  assert.equal((await call('GET', '/auth/me', null, token)).status, 401);
  assert.equal((await call('POST', '/auth/login', { email: 'profile@example.com', password: 'another-pass-1' })).status, 401);
});

test('google sign-in creates an account, then reuses it; unverified emails are refused', async () => {
  const payload = { sub: 'g-123', email: 'Google.User@example.com', email_verified: true, name: 'Google User' };
  const first = await call('POST', '/auth/google', { credential: JSON.stringify(payload) });
  assert.equal(first.status, 200);
  assert.equal(first.body.user.email, 'google.user@example.com');
  assert.equal(first.body.user.google, true);
  const again = await call('POST', '/auth/google', { credential: JSON.stringify(payload) });
  assert.equal(again.body.user.id, first.body.user.id);
  assert.equal((await call('POST', '/auth/google', { credential: JSON.stringify({ ...payload, sub: 'g-9', email: 'x@example.com', email_verified: false }) })).status, 401);
  assert.equal((await call('POST', '/auth/google', { credential: 'not json' })).status, 401);
  // Un compte Google se supprime sans mot de passe.
  assert.equal((await call('DELETE', '/auth/me', {}, first.body.token)).status, 204);
});

test('public config exposes exchange rates and the Google client id', async () => {
  const { body } = await call('GET', '/config');
  assert.equal(body.rates.MAD, 1);
  assert.ok(body.rates.EUR > 5 && body.rates.USD > 5);
  assert.equal(body.googleClientId, 'test-client-id');
});
