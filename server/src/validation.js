const { TRIP_TYPES, COMFORT_LEVELS } = require('./budgetCoach');
const { findDestination } = require('./destinations');

const LANGUAGES = ['fr', 'en', 'ar'];
const EXPENSE_CATEGORIES = ['accommodation', 'transport', 'food', 'activities', 'contingency'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

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

function validateName(value) {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name || name.length > 100) fail('invalid_name', 'Name is required (max 100 characters).');
  return name;
}

function validatePassword(value) {
  const password = typeof value === 'string' ? value : '';
  // bcrypt ignore tout ce qui dépasse 72 octets.
  if (password.length < 8 || Buffer.byteLength(password) > 72) {
    fail('invalid_password', 'Password must be between 8 and 72 characters.');
  }
  return password;
}

function validateLanguage(value) {
  if (!LANGUAGES.includes(value)) fail('invalid_language', `Language must be one of: ${LANGUAGES.join(', ')}.`);
  return value;
}

function validateRegistration(body = {}) {
  const name = validateName(body.name);
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_RE.test(email) || email.length > 254) fail('invalid_email', 'A valid email is required.');
  return { name, email, password: validatePassword(body.password), language: validateLanguage(body.language ?? 'fr') };
}

function validDate(value) {
  return typeof value === 'string' && DATE_RE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
}

// Un voyage vise une ville (destination + days) ou un circuit (stops : 2 à 5 étapes).
function validateTrip(body = {}) {
  const { tripType } = body;
  const budget = Number(body.budget);
  const people = Number(body.people);
  const comfort = body.comfort ?? 'budget';
  const startDate = body.startDate || null;

  let stops;
  if (Array.isArray(body.stops)) {
    if (body.stops.length < 2 || body.stops.length > 5) fail('invalid_stops', 'A circuit has between 2 and 5 stops.');
    stops = body.stops.map((stop) => ({ destination: stop?.destination, days: Number(stop?.days) }));
  } else {
    stops = [{ destination: typeof body.destination === 'string' ? body.destination.trim() : '', days: Number(body.days) }];
  }
  for (const [i, stop] of stops.entries()) {
    if (!findDestination(stop.destination)) fail('invalid_destination', 'Unknown destination.');
    if (!Number.isInteger(stop.days) || stop.days < 1 || stop.days > 365) fail('invalid_days', 'Days must be an integer between 1 and 365.');
    if (i > 0 && stops[i - 1].destination === stop.destination) fail('invalid_stops', 'Two consecutive stops must be different cities.');
  }
  const days = stops.reduce((sum, stop) => sum + stop.days, 0);

  if (days > 365) fail('invalid_days', 'Days must be an integer between 1 and 365.');
  if (!TRIP_TYPES.includes(tripType)) fail('invalid_trip_type', `Trip type must be one of: ${TRIP_TYPES.join(', ')}.`);
  if (!COMFORT_LEVELS.includes(comfort)) fail('invalid_comfort', `Comfort must be one of: ${COMFORT_LEVELS.join(', ')}.`);
  if (!Number.isFinite(budget) || budget <= 0 || budget > 10_000_000) fail('invalid_budget', 'Budget must be a positive number.');
  if (!Number.isInteger(people) || people < 1 || people > 50) fail('invalid_people', 'People must be an integer between 1 and 50.');
  if (startDate !== null && !validDate(startDate)) fail('invalid_date', 'Start date must be YYYY-MM-DD.');
  return { destination: stops[0].destination, stops, tripType, budget, days, people, comfort, startDate };
}

// Plan modifié : un tableau par jour, chaque activité { name, type?, cost }.
function validateCustomPlan(body, days) {
  const plan = body?.days;
  if (!Array.isArray(plan) || plan.length !== days) fail('invalid_plan', 'The plan must have one entry per day.');
  return plan.map((activities) => {
    if (!Array.isArray(activities) || activities.length > 8) fail('invalid_plan', 'At most 8 activities per day.');
    return activities.map((a) => {
      const cost = Number(a?.cost);
      const named = typeof a?.name === 'string'
        ? a.name.trim().length > 0 && a.name.length <= 120
        : a?.name && LANGUAGES.every((l) => typeof a.name[l] === 'string' && a.name[l].length <= 200);
      if (!named) fail('invalid_plan', 'Each activity needs a name.');
      if (!Number.isFinite(cost) || cost < 0 || cost > 1_000_000) fail('invalid_amount', 'Cost must be zero or more.');
      const name = typeof a.name === 'string' ? a.name.trim() : { fr: a.name.fr, en: a.name.en, ar: a.name.ar };
      return { name, type: TRIP_TYPES.includes(a.type) ? a.type : 'custom', cost };
    });
  });
}

function validateExpense(body = {}, people) {
  const label = typeof body.label === 'string' ? body.label.trim() : '';
  const amount = Number(body.amount);
  const paidBy = Number(body.paidBy ?? 0);
  if (!EXPENSE_CATEGORIES.includes(body.category)) fail('invalid_category', 'Unknown expense category.');
  if (!label || label.length > 100) fail('invalid_label', 'A label is required (max 100 characters).');
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10_000_000) fail('invalid_amount', 'Amount must be a positive number.');
  if (!Number.isInteger(paidBy) || paidBy < 0 || paidBy >= people) fail('invalid_traveler', 'Unknown traveler.');
  return { category: body.category, label, amount, paidBy };
}

function validateTravelers(body, people) {
  const list = body?.travelers;
  if (!Array.isArray(list) || list.length !== people) fail('invalid_travelers', 'One name per traveler is required.');
  return list.map((name) => {
    if (typeof name !== 'string' || !name.trim() || name.length > 40) fail('invalid_travelers', 'One name per traveler is required.');
    return name.trim();
  });
}

function validateReview(body = {}) {
  const rating = Number(body.rating);
  const comment = typeof body.comment === 'string' ? body.comment.trim() : '';
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) fail('invalid_rating', 'Rating must be between 1 and 5.');
  if (comment.length > 1000) fail('invalid_comment', 'Comment is too long (max 1000 characters).');
  return { rating, comment };
}

module.exports = {
  HttpError, LANGUAGES, EXPENSE_CATEGORIES,
  validateRegistration, validateName, validatePassword, validateLanguage,
  validateTrip, validateCustomPlan, validateExpense, validateTravelers, validateReview,
};
