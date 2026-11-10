import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { errorText } from '../i18n.js';
import Cover from './Cover.jsx';
import PlanResult from './PlanResult.jsx';
import { tripSummary, tripTitle } from './TripPage.jsx';

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

  const cover = destinations.find((d) => d.id === trip.destination);
  return (
    <article className="shared">
      <h1 className="page-title">{t.sharedTitle(trip.sharedBy, tripTitle(trip, destinations, lang))}</h1>
      <p className="lead">{tripSummary(trip, t, lang)}</p>
      {cover && <Cover destination={cover} className="city-cover" />}
      <section className="card shared-plan">
        <h2>{t.coachTitle}</h2>
        <PlanResult t={t} lang={lang} plan={trip} destinations={destinations} />
      </section>
      <a className="btn-primary inline" href={trip.stops.length > 1 ? '#/circuit' : `#/city/${trip.destination}`}>{t.sharedCta}</a>
    </article>
  );
}
