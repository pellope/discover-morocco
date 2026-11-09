import { TRIP_TYPES, TYPE_ICONS, formatMoney } from '../i18n.js';
import DestinationCard from './DestinationCard.jsx';

export default function Home({ t, lang, destinations, favorites, toggleFavorite, search, setSearch, category, setCategory }) {
  const visible = category ? destinations.filter((d) => d.types.includes(category)) : destinations;

  return (
    <>
      <nav className="categories" aria-label={t.tripType}>
        {[null, ...TRIP_TYPES].map((type) => (
          <button
            key={type ?? 'all'}
            className={category === type ? 'category active' : 'category'}
            aria-pressed={category === type}
            onClick={() => setCategory(type)}
          >
            <span className="category-icon" aria-hidden="true">{TYPE_ICONS[type ?? 'all']}</span>
            <span>{type ? t.types[type] : t.all}</span>
          </button>
        ))}
      </nav>

      {search ? (
        <div className="search-summary">
          <strong>{t.searchSummary(formatMoney(search.budget / search.days / search.people, lang))}</strong>
          <button className="btn-link" onClick={() => setSearch(null)}>{t.clearSearch}</button>
        </div>
      ) : (
        <h1 className="home-title">{t.tagline}</h1>
      )}

      {visible.length === 0 ? (
        <p className="muted">{t.noResults}</p>
      ) : (
        <div className="dest-grid">
          {visible.map((d) => (
            <DestinationCard key={d.id} t={t} lang={lang} destination={d} isFavorite={favorites.includes(d.id)} toggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </>
  );
}
