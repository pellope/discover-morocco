import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { errorText, formatMoney } from '../i18n.js';
import BudgetCoach from './BudgetCoach.jsx';
import Cover from './Cover.jsx';
import Itinerary from './Itinerary.jsx';

// Page publique d'un voyage partagé par lien.
export default function SharedTrip({ t, lang, token, destinations }) {
  const [trip, setTrip] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.shared(token).then(({ trip: found }) => setTrip(found)).catch((err) => setError(err.code));
  }, [token]);

  if (error) {
    return (
      <div className="empty">
        <p className="error" role="alert">{errorText(t, error)}</p>
        <a className="btn-primary inline" href="#/">{t.explore}</a>
      </div>
    );
  }
  if (!trip) return <p className="muted">{t.loading}</p>;

  const d = destinations.find((item) => item.id === trip.destination);
  return (
    <article className="shared">
      <h1 className="page-title">{t.sharedTitle(trip.sharedBy, d.name[lang])}</h1>
      <p className="lead">
        {t.types[trip.tripType]} · {t.daysCount(trip.days)} · {t.peopleCount(trip.people)} · {formatMoney(trip.budget, lang)}
      </p>
      <Cover destination={d} className="city-cover" />
      <div className="shared-layout">
        <section className="card">
          <h2>{t.coachTitle}</h2>
          <BudgetCoach t={t} lang={lang} coach={trip.budgetCoach} />
        </section>
        <section className="card">
          <h2>{t.itineraryTitle}</h2>
          <Itinerary t={t} lang={lang} itinerary={trip.itinerary} />
        </section>
      </div>
      <a className="btn-primary inline" href={`#/city/${d.id}`}>{t.sharedCta}</a>
    </article>
  );
}
