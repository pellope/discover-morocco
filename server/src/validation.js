const { TRIP_TYPES } = require('./budgetCoach');

const LANGUAGES = ['fr', 'en', 'ar'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function fail(code, message) {
  throw new HttpError(400, code, message);
}

function validateRegistration(body = {}) {
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const language = body.language ?? 'fr';

  if (!name || name.length > 100) fail('invalid_name', 'Name is required (max 100 characters).');
  if (!EMAIL_RE.test(email) || email.length > 254) fail('invalid_email', 'A valid email is required.');
  // bcrypt ignore tout ce qui dépasse 72 octets.
  if (password.length < 8 || Buffer.byteLength(password) > 72) {
    fail('invalid_password', 'Password must be between 8 and 72 characters.');
  }
  if (!LANGUAGES.includes(language)) fail('invalid_language', `Language must be one of: ${LANGUAGES.join(', ')}.`);
  return { name, email, password, language };
}

function validateTrip(body = {}) {
  const destination = typeof body.destination === 'string' ? body.destination.trim() : '';
  const { tripType } = body;
  const budget = Number(body.budget);
  const days = Number(body.days);
  const people = Number(body.people);

  if (!destination || destination.length > 100) fail('invalid_destination', 'Destination is required.');
  if (!TRIP_TYPES.includes(tripType)) fail('invalid_trip_type', `Trip type must be one of: ${TRIP_TYPES.join(', ')}.`);
  if (!Number.isFinite(budget) || budget <= 0 || budget > 10_000_000) fail('invalid_budget', 'Budget must be a positive number.');
  if (!Number.isInteger(days) || days < 1 || days > 365) fail('invalid_days', 'Days must be an integer between 1 and 365.');
  if (!Number.isInteger(people) || people < 1 || people > 50) fail('invalid_people', 'People must be an integer between 1 and 50.');
  return { destination, tripType, budget, days, people };
}

module.exports = { HttpError, validateRegistration, validateTrip, LANGUAGES };
