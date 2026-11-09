import { TRIP_TYPES, TYPE_ICONS, formatMoney } from '../i18n.js';
import DestinationCard from './DestinationCard.jsx';
import SearchBar from './SearchBar.jsx';

export default function Home({ t, lang, user, destinations, favorites, toggleFavorite, search, setSearch, category, setCategory }) {
  const visible = category ? destinations.filter((d) => d.types.includes(category)) : destinations;

  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="hero-greeting">{t.greeting(user?.name)}</p>
          <h1>{t.heroTitle}</h1>
          <p className="hero-text">{t.heroText}</p>
          <SearchBar t={t} search={search} setSearch={setSearch} />
        </div>
      </section>

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
        <h2 className="home-title">{t.gridTitle}</h2>
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

      <section className="how">
        <h2>{t.howTitle}</h2>
        <ol className="how-steps">
          {t.steps.map((step, i) => (
            <li key={step.title}>
              <span className="how-number" aria-hidden="true">{i + 1}</span>
              <h3>{step.title}</h3>
              <p className="muted">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
