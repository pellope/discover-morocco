import { useState } from 'react';
import { api } from '../api.js';
import { errorText } from '../i18n.js';
import PlanResult from './PlanResult.jsx';
import TripFields, { tripDefaults, tripPayload } from './TripFields.jsx';

// Circuit de deux à cinq villes : le serveur estime les trajets et répartit le budget.
export default function CircuitPage({ t, lang, destinations, user, search, requireAuth }) {
  const [stops, setStops] = useState([
    { destination: 'Marrakech', days: '2' },
    { destination: 'Ouarzazate', days: '1' },
    { destination: 'Merzouga', days: '2' },
  ]);
  const [form, setForm] = useState(() => ({ ...tripDefaults(search), tripType: 'culture' }));
  const [plan, setPlan] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const changeStops = (next) => { setStops(next); setPlan(null); };
  const setStop = (i, field, value) => changeStops(stops.map((stop, index) => (index === i ? { ...stop, [field]: value } : stop)));
  const addStop = () => {
    const unused = destinations.find((d) => !stops.some((stop) => stop.destination === d.id)) ?? destinations[0];
    changeStops([...stops, { destination: unused.id, days: '1' }]);
  };

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
    const trip = { ...tripPayload(form), stops: stops.map((stop) => ({ destination: stop.destination, days: Number(stop.days) })) };
    run(async () => {
      setPlan({ trip, ...(await api.plan(trip)) });
      setSavedId(null);
    });
  }

  function save() {
    if (!user) { requireAuth(); return; }
    run(async () => {
      const { trip } = await api.saveTrip(plan.trip);
      setSavedId(trip.id);
    });
  }

  return (
    <>
      <h1 className="page-title">{t.circuitTitle}</h1>
      <p className="lead">{t.circuitIntro}</p>

      <div className="city-layout">
        <div className="city-main">
          {plan ? (
            <>
              <PlanResult t={t} lang={lang} plan={plan} destinations={destinations} />
              {savedId ? (
                <p className="success" role="status">✓ {t.saved} <a href={`#/trip/${savedId}`}>{t.openTrip}</a></p>
              ) : (
                <button className="btn-secondary" onClick={save} disabled={busy}>{t.save}</button>
              )}
            </>
          ) : (
            <p className="muted">{t.coachEmpty}</p>
          )}
        </div>

        <aside>
          <form className="card plan-card" onSubmit={generate}>
            <ol className="stops">
              {stops.map((stop, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <li key={i} className="stop">
                  <label className="select-field">
                    <span>{t.stopLabel(i + 1)}</span>
                    <select value={stop.destination} onChange={(e) => setStop(i, 'destination', e.target.value)}>
                      {destinations.map((d) => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}
                    </select>
                  </label>
                  <label className="select-field small">
                    <span>{t.days}</span>
                    <input type="number" min="1" max="60" step="1" required value={stop.days} onChange={(e) => setStop(i, 'days', e.target.value)} />
                  </label>
                  {stops.length > 2 && (
                    <button type="button" className="tool danger" onClick={() => changeStops(stops.filter((_, index) => index !== i))} aria-label={`${t.remove} : ${t.stopLabel(i + 1)}`} title={t.remove}>✕</button>
                  )}
                </li>
              ))}
            </ol>
            {stops.length < 5 && <button type="button" className="btn-small add-stop" onClick={addStop}>+ {t.addStop}</button>}

            <TripFields t={t} form={form} setForm={setForm} withDays={false} />
            {error && <p className="error" role="alert">{errorText(t, error)}</p>}
            <button className="btn-primary" disabled={busy}>{t.generate}</button>
          </form>
        </aside>
      </div>
    </>
  );
}
