const { ACTIVITIES } = require('./activities');
const { findDestination } = require('./destinations');

const PER_DAY = 2;
const round = (n) => Math.round(n * 100) / 100;

// Distance à vol d'oiseau entre deux villes (km).
function distanceKm(a, b) {
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

// Trajets entre les étapes d'un circuit. Estimation : route = 1,3 × vol d'oiseau,
// environ 0,45 MAD par km et par personne en bus ou en train.
function buildLegs(stops, people) {
  const legs = [];
  for (let i = 1; i < stops.length; i += 1) {
    const from = findDestination(stops[i - 1].destination);
    const to = findDestination(stops[i].destination);
    const km = Math.round((distanceKm(from, to) * 1.3) / 10) * 10;
    const costPerPerson = Math.round((km * 0.45) / 5) * 5;
    legs.push({ from: from.id, to: to.id, km, costPerPerson, cost: costPerPerson * people });
  }
  return legs;
}

function addDays(isoDate, n) {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + n);
  return date.toISOString().slice(0, 10);
}

// Plan jour par jour. Pour chaque étape, les activités de la ville sont réparties sur ses jours,
// en commençant par le type de voyage choisi, sans dépasser la part « activités » du budget.
// Si l'utilisateur a modifié son plan (customPlan), c'est ce plan qui est utilisé.
function buildItinerary(trip, coach) {
  const { days, people, tripType, stops, startDate, customPlan } = trip;
  const activitiesBudget = coach.breakdown.activities.amount;
  const daily = {
    accommodation: round(coach.breakdown.accommodation.amount / days),
    food: round(coach.breakdown.food.amount / days),
    transport: round(coach.breakdown.transport.amount / days),
  };

  const plan = [];
  let dayNumber = 0;
  for (const stop of stops) {
    const all = ACTIVITIES[stop.destination] ?? [];
    const ordered = [...all.filter((a) => a.type === tripType), ...all.filter((a) => a.type !== tripType)];
    const stopBudget = (activitiesBudget * stop.days) / days;
    const chosen = [];
    let spent = 0;
    for (const activity of ordered) {
      if (chosen.length === stop.days * PER_DAY) break;
      const cost = activity.cost * people;
      if (spent + cost > stopBudget) continue;
      chosen.push({ name: activity.name, type: activity.type, cost });
      spent += cost;
    }
    for (let i = 0; i < stop.days; i += 1) {
      const activities = customPlan ? customPlan[dayNumber] ?? [] : chosen.slice(i * PER_DAY, (i + 1) * PER_DAY);
      const activitiesCost = activities.reduce((sum, a) => sum + a.cost, 0);
      dayNumber += 1;
      plan.push({
        day: dayNumber,
        date: startDate ? addDays(startDate, dayNumber - 1) : null,
        destination: stop.destination,
        activities, // vide = journée libre
        costs: { ...daily, activities: activitiesCost },
        total: round(daily.accommodation + daily.food + daily.transport + activitiesCost),
      });
    }
  }

  const legs = buildLegs(stops, people);
  return {
    days: plan,
    custom: Boolean(customPlan),
    activitiesPlanned: plan.reduce((sum, d) => sum + d.costs.activities, 0),
    activitiesBudget,
    legs,
    legsCost: legs.reduce((sum, leg) => sum + leg.cost, 0),
    transportBudget: coach.breakdown.transport.amount,
  };
}

module.exports = { buildItinerary, buildLegs };
