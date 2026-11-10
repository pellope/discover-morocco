import { TRIP_TYPES } from '../i18n.js';

// Champs communs aux formulaires de voyage : type, confort, budget, voyageurs, date de départ.
// `types` limite les types de voyage proposés (ceux de la ville) ; `withDays` ajoute la durée.
export default function TripFields({ t, form, setForm, types = TRIP_TYPES, withDays = true }) {
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  return (
    <>
      <fieldset className="field">
        <legend>{t.tripType}</legend>
        <div className="chips">
          {types.map((type) => (
            <button type="button" key={type} className={form.tripType === type ? 'chip active' : 'chip'} aria-pressed={form.tripType === type} onClick={() => setForm({ ...form, tripType: type })}>
              {t.types[type]}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="field">
        <legend>{t.comfortLabel}</legend>
        <div className="chips">
          {Object.keys(t.comforts).map((level) => (
            <button type="button" key={level} className={form.comfort === level ? 'chip active' : 'chip'} aria-pressed={form.comfort === level} onClick={() => setForm({ ...form, comfort: level })}>
              {t.comforts[level]}
            </button>
          ))}
        </div>
        <small className="muted comfort-hint">{t.comfortHints[form.comfort]}</small>
      </fieldset>

      <div className="input-group">
        <label>
          <span>{t.budget}</span>
          <input type="number" min="1" step="any" inputMode="decimal" required value={form.budget} onChange={set('budget')} />
        </label>
        <div className="input-group-row">
          {withDays && (
            <label>
              <span>{t.days}</span>
              <input type="number" min="1" max="365" step="1" required value={form.days} onChange={set('days')} />
            </label>
          )}
          <label>
            <span>{t.people}</span>
            <input type="number" min="1" max="50" step="1" required value={form.people} onChange={set('people')} />
          </label>
        </div>
        <label>
          <span>{t.startDate}</span>
          <input type="date" value={form.startDate} onChange={set('startDate')} />
        </label>
      </div>
    </>
  );
}

export const tripDefaults = (search) => ({
  comfort: 'budget',
  budget: search ? String(search.budget) : '',
  days: String(search?.days ?? 5),
  people: String(search?.people ?? 2),
  startDate: '',
});

// Convertit les champs du formulaire en corps de requête pour le serveur.
export const tripPayload = (form) => ({
  tripType: form.tripType,
  comfort: form.comfort,
  budget: Number(form.budget),
  people: Number(form.people),
  startDate: form.startDate || null,
});
