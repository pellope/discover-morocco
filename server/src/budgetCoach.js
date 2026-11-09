// Budget Coach : budget par jour et par personne, niveau et répartition.
// Les montants sont en dirhams (MAD).

const TRIP_TYPES = ['culture', 'beach', 'desert', 'adventure', 'gastronomy'];

// Seuils du budget par jour et par personne (MAD).
const TIGHT_BELOW = 400;
const COMFORTABLE_BELOW = 1000;

// Répartition en pourcentage selon le type de voyage (total = 100).
const ALLOCATIONS = {
  culture:    { accommodation: 35, transport: 15, food: 20, activities: 20, contingency: 10 },
  beach:      { accommodation: 40, transport: 15, food: 20, activities: 15, contingency: 10 },
  desert:     { accommodation: 30, transport: 25, food: 15, activities: 20, contingency: 10 },
  adventure:  { accommodation: 25, transport: 20, food: 15, activities: 30, contingency: 10 },
  gastronomy: { accommodation: 30, transport: 10, food: 35, activities: 15, contingency: 10 },
};

function levelFor(perDayPerPerson) {
  if (perDayPerPerson < TIGHT_BELOW) return 'tight';
  if (perDayPerPerson < COMFORTABLE_BELOW) return 'comfortable';
  return 'large';
}

function computeBudgetCoach({ budget, days, people, tripType }) {
  const perDay = budget / days;
  const perDayPerPerson = perDay / people;
  const shares = ALLOCATIONS[tripType];

  const breakdown = {};
  let allocated = 0;
  const keys = Object.keys(shares);
  keys.forEach((key, i) => {
    // Le dernier poste reçoit le reste pour que la somme soit exactement le budget.
    const amount = i === keys.length - 1
      ? Math.round((budget - allocated) * 100) / 100
      : Math.round(budget * shares[key]) / 100;
    allocated += amount;
    breakdown[key] = { percent: shares[key], amount };
  });

  return {
    perDay: Math.round(perDay * 100) / 100,
    perDayPerPerson: Math.round(perDayPerPerson * 100) / 100,
    level: levelFor(perDayPerPerson),
    breakdown,
  };
}

module.exports = { computeBudgetCoach, TRIP_TYPES, ALLOCATIONS };
