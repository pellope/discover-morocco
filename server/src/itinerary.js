const { ACTIVITIES } = require('./activities');

const PER_DAY = 2;
const round = (n) => Math.round(n * 100) / 100;

// Plan jour par jour : répartit les activités de la ville sur le séjour, en commençant par
// celles du type de voyage choisi, sans dépasser la part « activités » du Budget Coach.
function buildItinerary(trip, coach) {
  const { days, people, tripType } = trip;
  const activitiesBudget = coach.breakdown.activities.amount;
  const all = ACTIVITIES[trip.destination] ?? [];
  const ordered = [...all.filter((a) => a.type === tripType), ...all.filter((a) => a.type !== tripType)];

  const chosen = [];
  let spent = 0;
  for (const activity of ordered) {
    if (chosen.length === days * PER_DAY) break;
    const cost = activity.cost * people;
    if (spent + cost > activitiesBudget) continue;
    chosen.push({ name: activity.name, type: activity.type, costPerPerson: activity.cost, cost });
    spent += cost;
  }

  const daily = {
    accommodation: round(coach.breakdown.accommodation.amount / days),
    food: round(coach.breakdown.food.amount / days),
    transport: round(coach.breakdown.transport.amount / days),
  };

  const plan = [];
  for (let day = 1; day <= days; day += 1) {
    const activities = chosen.slice((day - 1) * PER_DAY, day * PER_DAY);
    const activitiesCost = activities.reduce((sum, a) => sum + a.cost, 0);
    plan.push({
      day,
      activities, // vide = journée libre
      costs: { ...daily, activities: activitiesCost },
      total: round(daily.accommodation + daily.food + daily.transport + activitiesCost),
    });
  }

  return {
    days: plan,
    activitiesPlanned: spent,
    activitiesBudget,
  };
}

module.exports = { buildItinerary };
