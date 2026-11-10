import { formatMoney } from '../i18n.js';
import Cover from './Cover.jsx';

export function HeartButton({ t, active, onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`heart ${active ? 'active' : ''} ${className}`}
      aria-pressed={active}
      aria-label={active ? t.removeFavorite : t.addFavorite}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClick(); }}
    >
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path d="M12 21s-7.5-4.6-9.6-9.1C.9 8.600 2.700 5 6.200 5c2 0 3.400 1 4.300 2.300L12 9.400l1.500-2.100C14.400 6 15.800 5 17.800 5c3.500 0 5.300 3.600 3.800 6.900C19.500 16.400 12 21 12 21z" />
      </svg>
    </button>
  );
}

// Note moyenne d'une ville, affichée seulement s'il existe au moins un avis.
export function Rating({ t, rating }) {
  if (!rating || rating.count === 0) return null;
  return (
    <span className="rating" title={t.starsLabel(rating.average)}>
      <span aria-hidden="true">★</span> {rating.average} <span className="muted">({t.reviewsCount(rating.count)})</span>
    </span>
  );
}

export default function DestinationCard({ t, lang, destination, isFavorite, toggleFavorite }) {
  const d = destination;
  return (
    <a className={`dest-card ${d.fits === false ? 'dimmed' : ''}`} href={`#/city/${d.id}`}>
      <div className="dest-cover">
        <Cover destination={d} />
        {d.fits !== undefined && (
          <span className={`badge ${d.fits ? 'badge-fits' : 'badge-tight'}`}>{d.fits ? t.fitsBadge : t.tightBadge}</span>
        )}
        <HeartButton t={t} active={isFavorite} onClick={() => toggleFavorite(d.id)} className="on-cover" />
      </div>
      <div className="dest-body">
        <div className="dest-title">
          <h3>{d.name[lang]}</h3>
          <Rating t={t} rating={d.rating} />
        </div>
        <p className="muted dest-types">{d.types.map((type) => t.types[type]).join(' · ')}</p>
        <p className="muted dest-tagline">{d.tagline[lang]}</p>
        <p className="dest-price">
          {t.from} <strong>{formatMoney(d.minDailyBudget, lang)}</strong> {t.perDayShort}
        </p>
      </div>
    </a>
  );
}
