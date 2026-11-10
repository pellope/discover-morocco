const { computeBudgetCoach, COMFORT } = require('./budgetCoach');
const { buildItinerary } = require('./itinerary');
const { buildPackingList } = require('./packing');
const { findDestination, effectiveMinimum } = require('./destinations');

// Tout ce qui se calcule à partir d'un voyage : Budget Coach, plan jour par jour,
// budget minimum conseillé (selon le confort et la saison) et liste de bagages.
function planTrip(trip) {
  const budgetCoach = computeBudgetCoach(trip);
  const month = trip.startDate ? Number(trip.startDate.slice(5, 7)) : null;

  // Pour un circuit, le minimum est la moyenne des villes pondérée par le nombre de jours.
  let weighted = 0;
  let peak = false;
  for (const stop of trip.stops) {
    const min = effectiveMinimum(findDestination(stop.destination), { comfort: trip.comfort, month });
    weighted += min.amount * stop.days;
    peak = peak || min.peak;
  }
  const amount = Math.round(weighted / trip.days);

  return {
    budgetCoach,
    itinerary: buildItinerary(trip, budgetCoach),
    minimum: { amount, peak, comfortFactor: COMFORT[trip.comfort].factor, enough: budgetCoach.perDayPerPerson >= amount },
    packingList: buildPackingList(trip),
  };
}

module.exports = { planTrip };
