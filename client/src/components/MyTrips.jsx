import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { errorText, formatMoney } from '../i18n.js';
import BudgetCoach from './BudgetCoach.jsx';
import Cover from './Cover.jsx';
import Itinerary from './Itinerary.jsx';

function TripCard({ t, lang, trip, destination: d, onDelete }) {
  const [open, setOpen] = useState(false);
  const [shared, setShared] = useState(null); // 'copied' ou 'manual'
  const link = `${window.location.origin}${window.location.pathname}#/shared/${trip.shareToken}`;

  async function share() {
    try {
      await navigator.clipboard.writeText(link);
      setShared('copied');
    } catch {
      setShared('manual'); // presse-papiers indisponible : on affiche le lien à copier
    }
  }

  return (
    <article className="card trip-card">
      {d && <Cover destination={d} className="trip-cover" />}
      <div className="trip-body">
        <h3>{d ? <a href={`#/city/${d.id}`}>{d.name[lang]}</a> : trip.destination}</h3>
        <p className="muted">
          {t.types[trip.tripType]} · {t.daysCount(trip.days)} · {t.peopleCount(trip.people)} · {formatMoney(trip.budget, lang)}
        </p>
        <BudgetCoach t={t} lang={lang} coach={trip.budgetCoach} compact />
        <div className="trip-actions">
          <button className="btn-small" onClick={() => setOpen(!open)} aria-expanded={open}>{open ? t.hidePlan : t.showPlan}</button>
          <button className="btn-small" onClick={share}>{t.share}</button>
          <button className="btn-small danger" onClick={onDelete}>{t.delete}</button>
        </div>
        {shared === 'copied' && <p className="success small" role="status">{t.linkCopied}</p>}
        {shared === 'manual' && (
          <label className="share-link">
            <span className="muted">{t.copyLink}</span>
            <input readOnly value={link} dir="ltr" onFocus={(e) => e.target.select()} />
          </label>
        )}
        {open && <Itinerary t={t} lang={lang} itinerary={trip.itinerary} />}
      </div>
    </article>
  );
}

export default function MyTrips({ t, lang, destinations }) {
  const [trips, setTrips] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listTrips()
      .then(({ trips: list }) => setTrips(list))
      .catch((err) => setError(err.code));
  }, []);

  async function remove(id) {
    try {
      await api.deleteTrip(id);
      setTrips((list) => list.filter((trip) => trip.id !== id));
    } catch (err) {
      setError(err.code);
    }
  }

  if (error && !trips) return <p className="error" role="alert">{errorText(t, error)}</p>;
  if (!trips) return <p className="muted">{t.loading}</p>;

  return (
    <>
      <h1 className="page-title">{t.tripsTab}</h1>
      {error && <p className="error" role="alert">{errorText(t, error)}</p>}
      {trips.length === 0 ? (
        <div className="empty">
          <p>{t.noTrips}</p>
          <a className="btn-primary inline" href="#/">{t.explore}</a>
        </div>
      ) : (
        <div className="trip-grid">
          {trips.map((trip) => (
            <TripCard
              key={trip.id}
              t={t}
              lang={lang}
              trip={trip}
              destination={destinations.find((item) => item.id === trip.destination)}
              onDelete={() => remove(trip.id)}
            />
          ))}
        </div>
      )}
    </>
  );
}
