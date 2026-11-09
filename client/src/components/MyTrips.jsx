import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { cityName, errorText, formatMoney } from '../i18n.js';
import BudgetCoach from './BudgetCoach.jsx';

export default function MyTrips({ t, lang }) {
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
    <div>
      <h2>{t.tripsTab}</h2>
      {error && <p className="error" role="alert">{errorText(t, error)}</p>}
      {trips.length === 0 ? (
        <p className="muted">{t.noTrips}</p>
      ) : (
        <div className="trip-grid">
          {trips.map((trip) => (
            <article className="card" key={trip.id}>
              <div className="trip-head">
                <div>
                  <h3>{cityName(trip.destination, lang)}</h3>
                  <p className="muted">
                    {t.types[trip.tripType]} · {t.daysCount(trip.days)} · {t.peopleCount(trip.people)} · {formatMoney(trip.budget, lang)}
                  </p>
                </div>
                <button className="btn-ghost danger" onClick={() => remove(trip.id)}>{t.delete}</button>
              </div>
              <BudgetCoach t={t} lang={lang} coach={trip.budgetCoach} compact />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
