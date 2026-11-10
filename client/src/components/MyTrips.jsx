import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { errorText } from '../i18n.js';
import BudgetCoach from './BudgetCoach.jsx';
import Cover from './Cover.jsx';
import { tripSummary, tripTitle } from './TripPage.jsx';

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
          {trips.map((trip) => {
            const cover = destinations.find((d) => d.id === trip.destination);
            return (
              <article className="card trip-card" key={trip.id}>
                {cover && <Cover destination={cover} className="trip-cover" />}
                <div className="trip-body">
                  <h3><a href={`#/trip/${trip.id}`}>{tripTitle(trip, destinations, lang)}</a></h3>
                  <p className="muted">{tripSummary(trip, t, lang)}</p>
                  <BudgetCoach t={t} lang={lang} coach={trip.budgetCoach} compact />
                  <div className="trip-actions">
                    <a className="btn-small primary" href={`#/trip/${trip.id}`}>{t.openTrip}</a>
                    <button className="btn-small danger" onClick={() => remove(trip.id)}>{t.delete}</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
