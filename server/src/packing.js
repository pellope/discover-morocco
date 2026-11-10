// Liste de bagages : des clés que l'interface traduit, choisies selon les villes,
// le type de voyage et la saison.
const WINDY = ['Essaouira', 'Dakhla', 'Tangier'];
const COLD_MONTHS = [11, 12, 1, 2, 3];
const HOT_MONTHS = [5, 6, 7, 8, 9];

function buildPackingList({ stops, tripType, startDate }) {
  const cities = stops.map((s) => s.destination);
  const types = new Set([tripType]);
  const month = startDate ? Number(startDate.slice(5, 7)) : null;
  const items = ['docs', 'cash', 'shoes', 'modest', 'sunscreen', 'bottle', 'powerbank'];

  if (types.has('beach')) items.push('swimsuit', 'towel');
  if (types.has('desert') || cities.includes('Merzouga')) items.push('cheche', 'warmNight', 'headlamp');
  if (types.has('adventure')) items.push('hiking', 'daypack');
  if (cities.some((c) => WINDY.includes(c))) items.push('windbreaker');
  if (cities.includes('Ifrane') || (month && COLD_MONTHS.includes(month))) items.push('jacket');
  if (!month || HOT_MONTHS.includes(month)) items.push('hat');
  return [...new Set(items)];
}

module.exports = { buildPackingList };
