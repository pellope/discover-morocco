import { useState } from 'react';
import { TRIP_TYPES, TYPE_ICONS, formatMoney } from '../i18n.js';
import DestinationCard from './DestinationCard.jsx';
import SearchBar from './SearchBar.jsx';
import MapView from './MapView.jsx';

export default function Home({ t, lang, user, destinations, favorites, toggleFavorite, search, setSearch, category, setCategory }) {
  const [view, setView] = useState('grid');
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

      <div className="list-head">
        {search ? (
          <div className="search-summary">
            <strong>{t.searchSummary(formatMoney(search.budget / search.days / search.people, lang))}</strong>
            <button className="btn-link" onClick={() => setSearch(null)}>{t.clearSearch}</button>
          </div>
        ) : (
          <h2 className="home-title">{t.gridTitle}</h2>
        )}
        <div className="list-tools">
          <a className="btn-small" href="#/compare">{t.compareTab}</a>
          <div className="toggle" role="group">
            <button className={view === 'grid' ? 'active' : ''} aria-pressed={view === 'grid'} onClick={() => setView('grid')}>{t.viewGrid}</button>
            <button className={view === 'map' ? 'active' : ''} aria-pressed={view === 'map'} onClick={() => setView('map')}>{t.viewMap}</button>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="muted">{t.noResults}</p>
      ) : view === 'map' ? (
        <MapView t={t} lang={lang} destinations={visible} />
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
