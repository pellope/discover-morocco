import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { PLACE_ICONS, formatMoney } from '../i18n.js';

const CATEGORIES = ['monument', 'food', 'market', 'nature'];

// Visuel d'un lieu : sa photo, sinon un fond à motif avec l'icône de sa catégorie.
function PlaceCover({ place }) {
  if (place.image) return <img className="place-cover" src={place.image} alt="" loading="lazy" />;
  return (
    <div className={`place-cover place-pattern place-${place.category}`} aria-hidden="true">
      <span>{PLACE_ICONS[place.category]}</span>
    </div>
  );
}

// Section « À voir, à goûter » d'une ville, avec un onglet par catégorie.
export default function Places({ t, lang, destination }) {
  const [places, setPlaces] = useState(null);
  const [category, setCategory] = useState(null);

  useEffect(() => {
    api.places(destination.id).then(({ places: list }) => setPlaces(list)).catch(() => setPlaces([]));
  }, [destination.id]);

  if (!places || places.length === 0) return null;
  const visible = category ? places.filter((p) => p.category === category) : places;
  const count = (key) => places.filter((p) => p.category === key).length;

  return (
    <section>
      <h2>{t.placesTitle} <span className="muted">{t.placesCount(places.length)}</span></h2>
      <div className="chips place-tabs" role="group" aria-label={t.placesTitle}>
        <button className={category === null ? 'chip active' : 'chip'} aria-pressed={category === null} onClick={() => setCategory(null)}>{t.all}</button>
        {CATEGORIES.filter((key) => count(key) > 0).map((key) => (
          <button key={key} className={category === key ? 'chip active' : 'chip'} aria-pressed={category === key} onClick={() => setCategory(key)}>
            <span aria-hidden="true">{PLACE_ICONS[key]}</span> {t.placeCats[key]} <span className="chip-count">{count(key)}</span>
          </button>
        ))}
      </div>

      <ul className="places">
        {visible.map((place) => (
          <li key={place.id} className="place">
            <PlaceCover place={place} />
            <div className="place-body">
              <span className="place-cat">{t.placeCats[place.category]}</span>
              <h3>{place.name[lang]}</h3>
              <p className="muted">{place.description[lang]}</p>
              <p className={place.cost === 0 ? 'price free' : 'price'}>
                {place.cost === 0 ? t.free : <>{formatMoney(place.cost, lang)} <span className="muted">{t.perPersonShort}</span></>}
              </p>
            </div>
          </li>
        ))}
      </ul>
      <p className="muted">{t.placesNote}</p>
    </section>
  );
}
