import DestinationCard from './DestinationCard.jsx';

export default function Favorites({ t, lang, destinations, favorites, toggleFavorite }) {
  const list = favorites.map((id) => destinations.find((d) => d.id === id)).filter(Boolean);

  return (
    <>
      <h1 className="page-title">{t.favoritesTab}</h1>
      {list.length === 0 ? (
        <div className="empty">
          <p>{t.noFavorites}</p>
          <a className="btn-primary inline" href="#/">{t.explore}</a>
        </div>
      ) : (
        <div className="dest-grid">
          {list.map((d) => (
            <DestinationCard key={d.id} t={t} lang={lang} destination={d} isFavorite toggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </>
  );
}
