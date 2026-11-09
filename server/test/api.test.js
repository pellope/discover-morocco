const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { openDb } = require('../src/db');
const { createApp } = require('../src/app');
const { computeBudgetCoach, ALLOCATIONS } = require('../src/budgetCoach');

let server;
let base;

before(async () => {
  const app = createApp({ db: openDb(':memory:'), jwtSecret: 'test-secret-test-secret-test-secret', corsOrigin: '*' });
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
