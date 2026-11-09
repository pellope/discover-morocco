import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { TYPE_ICONS, errorText, formatMoney } from '../i18n.js';
import BudgetCoach from './BudgetCoach.jsx';
import Cover from './Cover.jsx';
import { HeartButton } from './DestinationCard.jsx';
import Itinerary from './Itinerary.jsx';

export default function CityPage({ t, lang, destination, favorites, toggleFavorite, search, category, user, requireAuth }) {
  const d = destination;
  const [form, setForm] = useState(() => ({
    tripType: d?.types.includes(category) ? category : d?.types[0],
    budget: search ? String(search.budget) : '',
    days: String(search?.days ?? 5),
    people: String(search?.people ?? 2),
  }));
  const [plan, setPlan] = useState(null); // { trip, coach, itinerary }
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

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

  function generate(values = form) {
    const trip = { destination: d.id, tripType: values.tripType, budget: Number(values.budget), days: Number(values.days), people: Number(values.people) };
    return run(async () => {
      const { budgetCoach, itinerary } = await api.budgetCoach(trip);
      setPlan({ trip, coach: budgetCoach, itinerary });
      setSaved(false);
    });
  }

  // En arrivant depuis une recherche, le plan est calculé tout de suite.
  useEffect(() => {
    if (d && search) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!d) return <p className="error" role="alert">{errorText(t, 'destination_not_found')}</p>;

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function save() {
    if (!user) { requireAuth(); return; }
    run(async () => {
      await api.saveTrip(plan.trip);
      setSaved(true);
    });
  }

  return (
    <article>
      <a className="btn-link back" href="#/"><span className="arrow" aria-hidden="true">←</span> {t.back}</a>
      <div className="city-head">
        <h1>{d.name[lang]}</h1>
        <HeartButton t={t} active={favorites.includes(d.id)} onClick={() => toggleFavorite(d.id)} className="outlined" />
      </div>
      <Cover destination={d} className="city-cover" />

      <div className="city-layout">
        <div className="city-main">
          <p className="city-tagline">{d.tagline[lang]}</p>
          <p className="muted">{t.minBudgetNote(formatMoney(d.minDailyBudget, lang))}</p>

          <blockquote className="tip-card">
            <strong>{t.ourTip}</strong>
            <p>{d.tip[lang]}</p>
          </blockquote>

          <hr />
          <h2>{t.idealFor}</h2>
          <ul className="type-list">
            {d.types.map((type) => (
              <li key={type}><span aria-hidden="true">{TYPE_ICONS[type]}</span> {t.types[type]}</li>
            ))}
          </ul>

          <hr />
          <h2>{t.coachTitle}</h2>
          {plan ? (
            <>
              {plan.coach.perDayPerPerson < d.minDailyBudget && (
                <p className="warning" role="status">{t.belowMinimum(formatMoney(d.minDailyBudget, lang))}</p>
              )}
              <BudgetCoach t={t} lang={lang} coach={plan.coach} />
              <h2 className="section-gap">{t.itineraryTitle}</h2>
              <Itinerary t={t} lang={lang} itinerary={plan.itinerary} />
              {saved ? (
                <p className="success" role="status">✓ {t.saved}</p>
              ) : (
                <button className="btn-secondary" onClick={save} disabled={busy}>{t.save}</button>
              )}
            </>
          ) : (
            <p className="muted">{t.coachEmpty}</p>
          )}
        </div>

        <aside>
          <form className="card plan-card" onSubmit={(e) => { e.preventDefault(); generate(); }}>
            <h2>{t.planTitle}</h2>
            <fieldset className="field">
              <legend>{t.tripType}</legend>
              <div className="chips">
                {d.types.map((type) => (
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
            <div className="input-group">
              <label>
                <span>{t.budget}</span>
                <input type="number" min="1" step="any" inputMode="decimal" required value={form.budget} onChange={set('budget')} />
              </label>
              <div className="input-group-row">
                <label>
                  <span>{t.days}</span>
                  <input type="number" min="1" max="365" step="1" required value={form.days} onChange={set('days')} />
                </label>
                <label>
                  <span>{t.people}</span>
                  <input type="number" min="1" max="50" step="1" required value={form.people} onChange={set('people')} />
                </label>
              </div>
            </div>
            {error && <p className="error" role="alert">{errorText(t, error)}</p>}
            <button className="btn-primary" disabled={busy}>{t.generate}</button>
          </form>
        </aside>
      </div>
    </article>
  );
}
