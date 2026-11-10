// Budget Coach : budget par jour et par personne, niveau et répartition.
// Les montants sont en dirhams (MAD).

const TRIP_TYPES = ['culture', 'beach', 'desert', 'adventure', 'gastronomy'];
const COMFORT_LEVELS = ['budget', 'comfort', 'luxury'];

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

// Le niveau de confort déplace quelques points d'un poste à l'autre (total = 0)
// et multiplie le budget minimum conseillé d'une ville.
const COMFORT = {
  budget:  { factor: 1,   shift: { accommodation: 0,  transport: 0,  food: 0, activities: 0 } },
  comfort: { factor: 1.5, shift: { accommodation: 5,  transport: 0,  food: 0, activities: -5 } },
  luxury:  { factor: 3,   shift: { accommodation: 10, transport: -5, food: 5, activities: -10 } },
};

const round = (n) => Math.round(n * 100) / 100;

function levelFor(perDayPerPerson) {
  if (perDayPerPerson < TIGHT_BELOW) return 'tight';
  if (perDayPerPerson < COMFORTABLE_BELOW) return 'comfortable';
  return 'large';
}

function sharesFor(tripType, comfort = 'budget') {
  const shares = { ...ALLOCATIONS[tripType] };
  for (const [key, delta] of Object.entries(COMFORT[comfort].shift)) shares[key] += delta;
  return shares;
}

function computeBudgetCoach({ budget, days, people, tripType, comfort = 'budget' }) {
  const perDay = budget / days;
  const perDayPerPerson = perDay / people;
  const shares = sharesFor(tripType, comfort);

  const breakdown = {};
  let allocated = 0;
  const keys = Object.keys(shares);
  keys.forEach((key, i) => {
    // Le dernier poste reçoit le reste pour que la somme soit exactement le budget.
    const amount = i === keys.length - 1 ? round(budget - allocated) : Math.round(budget * shares[key]) / 100;
    allocated += amount;
    breakdown[key] = { percent: shares[key], amount };
  });

  return { perDay: round(perDay), perDayPerPerson: round(perDayPerPerson), level: levelFor(perDayPerPerson), breakdown };
}

module.exports = { computeBudgetCoach, sharesFor, TRIP_TYPES, COMFORT_LEVELS, COMFORT, ALLOCATIONS };
