import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { errorText, formatDate, formatMoney } from '../i18n.js';
import Cover from './Cover.jsx';
import PlanResult from './PlanResult.jsx';
import Expenses from './Expenses.jsx';
import PackingList from './PackingList.jsx';

export const tripTitle = (trip, destinations, lang) => trip.stops
  .map((stop) => destinations.find((d) => d.id === stop.destination)?.name[lang] ?? stop.destination)
  .join(' → ');

export const tripSummary = (trip, t, lang) => [
  t.types[trip.tripType], t.comforts[trip.comfort], t.daysCount(trip.days), t.peopleCount(trip.people), formatMoney(trip.budget, lang),
  trip.startDate && formatDate(trip.startDate, lang),
].filter(Boolean).join(' · ');

// Détail d'un voyage sauvegardé : plan modifiable, dépenses, comptes, bagages, partage, impression.
export default function TripPage({ t, lang, id, destinations }) {
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [shared, setShared] = useState(null); // 'copied' ou 'manual'
  const [placesByCity, setPlacesByCity] = useState({});

  useEffect(() => {
    api.getTrip(id).then(({ trip: found }) => setTrip(found)).catch((err) => setError(err.code));
  }, [id]);

  // Les lieux de chaque ville du voyage, proposés quand on modifie le plan.
  const cities = trip ? [...new Set(trip.stops.map((stop) => stop.destination))].join(',') : '';
  useEffect(() => {
    if (!cities) return;
    Promise.all(cities.split(',').map((city) => api.places(city).then(({ places }) => [city, places])))
      .then((entries) => setPlacesByCity(Object.fromEntries(entries)))
      .catch(() => {});
  }, [cities]);

  if (error && !trip) {
    return (
      <div className="empty">
        <p className="error" role="alert">{errorText(t, error)}</p>
        <a className="btn-primary inline" href="#/trips">{t.backToTrips}</a>
      </div>
    );
  }
  if (!trip) return <p className="muted">{t.loading}</p>;

  const link = `${window.location.origin}${window.location.pathname}#/shared/${trip.shareToken}`;
  const cover = destinations.find((d) => d.id === trip.destination);

  async function savePlan(days) {
    setError(null);
    try {
      setTrip((await api.savePlan(trip.id, days)).trip);
    } catch (err) {
      setError(err.code);
    }
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(link);
      setShared('copied');
    } catch {
      setShared('manual'); // presse-papiers indisponible : on affiche le lien à copier
    }
  }

  async function remove() {
    await api.deleteTrip(trip.id);
    window.location.hash = '#/trips';
  }

  return (
    <article className="trip-page">
      <a className="btn-link back no-print" href="#/trips"><span className="arrow" aria-hidden="true">←</span> {t.backToTrips}</a>
      <h1>{tripTitle(trip, destinations, lang)}</h1>
      <p className="lead">{tripSummary(trip, t, lang)}</p>

      <div className="trip-actions no-print">
        <button className="btn-small" onClick={share}>{t.share}</button>
        <button className="btn-small" onClick={() => window.print()}>{t.print}</button>
        <button className="btn-small danger" onClick={remove}>{t.delete}</button>
      </div>
      {shared === 'copied' && <p className="success small" role="status">{t.linkCopied}</p>}
      {shared === 'manual' && (
        <label className="share-link">
          <span className="muted">{t.copyLink}</span>
          <input readOnly value={link} dir="ltr" onFocus={(e) => e.target.select()} />
        </label>
      )}

      {cover && <Cover destination={cover} className="city-cover no-print" />}

      <div className="trip-sections">
        <section className="card">
          <h2>{t.coachTitle}</h2>
          {error && <p className="error" role="alert">{errorText(t, error)}</p>}
          <PlanResult t={t} lang={lang} plan={trip} destinations={destinations} onPlanChange={editing ? savePlan : undefined} placesByCity={placesByCity} people={trip.people}>
            <span className="trip-actions no-print">
              {trip.itinerary.custom && <span className="badge static badge-fits">{t.customPlanNote}</span>}
              {editing && trip.itinerary.custom && <button className="btn-small" onClick={() => savePlan(null)}>{t.resetPlan}</button>}
              <button className="btn-small" onClick={() => setEditing(!editing)} aria-pressed={editing}>{editing ? t.donePlan : t.editPlan}</button>
            </span>
          </PlanResult>
        </section>

        <div className="trip-side no-print">
          <Expenses t={t} lang={lang} tripId={trip.id} people={trip.people} />
        </div>
        <PackingList t={t} tripId={trip.id} items={trip.packingList} />
      </div>
    </article>
  );
}
