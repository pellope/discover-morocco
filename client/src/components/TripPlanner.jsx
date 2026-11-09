import { useState } from 'react';
import { api } from '../api.js';
import { CITIES, TRIP_TYPES, errorText } from '../i18n.js';
import BudgetCoach from './BudgetCoach.jsx';

const initialForm = { destination: 'Marrakech', tripType: 'culture', budget: '', days: '5', people: '2' };

export default function TripPlanner({ t, lang }) {
  const [form, setForm] = useState(initialForm);
  const [plan, setPlan] = useState(null); // { trip, coach }
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function run(action) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err.code);
    } finally {
      setBusy(false);
    }
  }

  function generate(e) {
    e.preventDefault();
    const trip = { ...form, budget: Number(form.budget), days: Number(form.days), people: Number(form.people) };
    run(async () => {
      const { budgetCoach } = await api.budgetCoach(trip);
      setPlan({ trip, coach: budgetCoach });
      setSaved(false);
    });
  }

  function save() {
    run(async () => {
      await api.saveTrip(plan.trip);
      setSaved(true);
    });
  }

  return (
    <div className="planner">
      <form className="card" onSubmit={generate}>
        <h2>{t.formTitle}</h2>

        <label className="field">
          <span>{t.destination}</span>
          <select value={form.destination} onChange={set('destination')}>
            {CITIES.map((c) => <option key={c.id} value={c.id}>{c[lang]}</option>)}
          </select>
        </label>

        <fieldset className="field">
          <legend>{t.tripType}</legend>
          <div className="chips">
            {TRIP_TYPES.map((type) => (
              <button
                type="button"
                key={type}
                className={form.tripType === type ? 'chip active' : 'chip'}
                aria-pressed={form.tripType === type}
                onClick={() => setForm({ ...form, tripType: type })}
              >
                {t.types[type]}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="field">
          <span>{t.budget}</span>
          <input type="number" min="1" step="any" value={form.budget} onChange={set('budget')} required inputMode="decimal" />
        </label>

        <div className="field-row">
          <label className="field">
            <span>{t.days}</span>
            <input type="number" min="1" max="365" step="1" value={form.days} onChange={set('days')} required />
          </label>
          <label className="field">
            <span>{t.people}</span>
            <input type="number" min="1" max="50" step="1" value={form.people} onChange={set('people')} required />
          </label>
        </div>

        {error && <p className="error" role="alert">{errorText(t, error)}</p>}
        <button className="btn-primary" disabled={busy}>{t.generate}</button>
      </form>

      {plan && (
        <section className="card">
          <h2>{t.coachTitle}</h2>
          <BudgetCoach t={t} lang={lang} coach={plan.coach} />
          {saved ? (
            <p className="success" role="status">✓ {t.saved}</p>
          ) : (
            <button className="btn-secondary" onClick={save} disabled={busy}>{t.save}</button>
          )}
        </section>
      )}
    </div>
  );
}
