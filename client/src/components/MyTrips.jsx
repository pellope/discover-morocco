import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { errorText, formatMoney } from '../i18n.js';
import BudgetCoach from './BudgetCoach.jsx';
import Cover from './Cover.jsx';

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
            const d = destinations.find((item) => item.id === trip.destination);
            return (
              <article className="card trip-card" key={trip.id}>
                {d && <Cover destination={d} className="trip-cover" />}
                <div className="trip-body">
                  <div className="trip-head">
                    <div>
                      <h3>{d ? <a href={`#/city/${d.id}`}>{d.name[lang]}</a> : trip.destination}</h3>
                      <p className="muted">
                        {t.types[trip.tripType]} · {t.daysCount(trip.days)} · {t.peopleCount(trip.people)} · {formatMoney(trip.budget, lang)}
                      </p>
                    </div>
                    <button className="btn-link danger" onClick={() => remove(trip.id)}>{t.delete}</button>
                  </div>
                  <BudgetCoach t={t} lang={lang} coach={trip.budgetCoach} compact />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
