import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { TYPE_ICONS, errorText, formatMoney } from '../i18n.js';
import Cover from './Cover.jsx';
import { HeartButton, Rating } from './DestinationCard.jsx';
import PlanResult from './PlanResult.jsx';
import TripFields, { tripDefaults, tripPayload } from './TripFields.jsx';
import Climate from './Climate.jsx';
import Guide from './Guide.jsx';
import Reviews from './Reviews.jsx';
import Places from './Places.jsx';

export default function CityPage({ t, lang, destination, favorites, toggleFavorite, search, category, user, requireAuth, onReviewed }) {
  const d = destination;
  const [form, setForm] = useState(() => ({ ...tripDefaults(search), tripType: d?.types.includes(category) ? category : d?.types[0] }));
  const [plan, setPlan] = useState(null); // { trip, budgetCoach, itinerary, minimum }
  const [savedId, setSavedId] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [photo, setPhoto] = useState(0);

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

  function generate() {
    const trip = { ...tripPayload(form), destination: d.id, days: Number(form.days) };
    return run(async () => {
      setPlan({ trip, ...(await api.plan(trip)) });
      setSavedId(null);
    });
  }

  // En arrivant depuis une recherche, le plan est calculé tout de suite.
  useEffect(() => {
    if (d && search) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!d) return <p className="error" role="alert">{errorText(t, 'destination_not_found')}</p>;

  function save() {
    if (!user) { requireAuth(); return; }
    run(async () => {
      const { trip } = await api.saveTrip(plan.trip);
      setSavedId(trip.id);
    });
  }

  return (
    <article>
      <a className="btn-link back" href="#/"><span className="arrow" aria-hidden="true">←</span> {t.back}</a>
      <div className="city-head">
        <div>
          <h1>{d.name[lang]}</h1>
          <Rating t={t} rating={d.rating} />
        </div>
        <HeartButton t={t} active={favorites.includes(d.id)} onClick={() => toggleFavorite(d.id)} className="outlined" />
      </div>

      <Cover destination={{ ...d, image: d.gallery[photo] ?? d.image }} className="city-cover" />
      {d.gallery.length > 1 && (
        <div className="thumbs" role="group" aria-label={t.photosOf(d.name[lang])}>
          {d.gallery.map((src, i) => (
            <button key={src} className={i === photo ? 'thumb active' : 'thumb'} aria-pressed={i === photo} aria-label={`${i + 1} / ${d.gallery.length}`} onClick={() => setPhoto(i)}>
              <img src={src} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}

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
              <PlanResult t={t} lang={lang} plan={plan} destinations={[d]} />
              {savedId ? (
                <p className="success" role="status">✓ {t.saved} <a href={`#/trip/${savedId}`}>{t.openTrip}</a></p>
              ) : (
                <button className="btn-secondary" onClick={save} disabled={busy}>{t.save}</button>
              )}
            </>
          ) : (
            <p className="muted">{t.coachEmpty}</p>
          )}

          <hr />
          <Places t={t} lang={lang} destination={d} />
          <hr />
          <Climate t={t} destination={d} />
          <hr />
          <Guide t={t} lang={lang} destination={d} />
          <hr />
          <Reviews t={t} lang={lang} destination={d} user={user} requireAuth={requireAuth} onChanged={onReviewed} />
        </div>

        <aside>
          <form className="card plan-card" onSubmit={(e) => { e.preventDefault(); generate(); }}>
            <h2>{t.planTitle}</h2>
            <TripFields t={t} form={form} setForm={setForm} types={d.types} />
            {error && <p className="error" role="alert">{errorText(t, error)}</p>}
            <button className="btn-primary" disabled={busy}>{t.generate}</button>
          </form>
        </aside>
      </div>
    </article>
  );
}
