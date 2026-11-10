import { useState } from 'react';
import { TYPE_ICONS, activityName, formatDate, formatMoney } from '../i18n.js';

// Type de voyage correspondant à chaque catégorie de lieu (pour l'icône dans le plan).
const PLACE_TYPES = { monument: 'culture', food: 'gastronomy', market: 'culture', nature: 'adventure' };

// Formulaire d'ajout d'une activité à un jour (mode modification) : un lieu de la ville ou un texte libre.
function AddActivity({ t, lang, onAdd, places, people }) {
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), type: 'custom', cost: Number(cost) || 0 });
    setName('');
    setCost('');
  }
  return (
    <form className="add-activity" onSubmit={submit}>
      {places?.length > 0 && (
        <select
          className="add-place"
          value=""
          aria-label={t.addPlace}
          onChange={(e) => {
            const place = places.find((p) => p.id === e.target.value);
            if (place) onAdd({ name: place.name, type: PLACE_TYPES[place.category], cost: place.cost * people });
          }}
        >
          <option value="">{t.addPlace}</option>
          {places.map((p) => <option key={p.id} value={p.id}>{p.name[lang]}</option>)}
        </select>
      )}
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.activityName} aria-label={t.activityName} maxLength={120} />
      <input type="number" min="0" step="any" value={cost} onChange={(e) => setCost(e.target.value)} placeholder={t.activityCost} aria-label={t.activityCost} />
      <button className="btn-small">{t.addActivity}</button>
    </form>
  );
}

// Plan jour par jour calculé par le serveur. Avec onChange, chaque activité peut être
// déplacée au jour précédent ou suivant, retirée, et on peut en ajouter.
export default function Itinerary({ t, lang, itinerary, destinations, onChange, placesByCity, people = 1 }) {
  const cityName = (id) => destinations?.find((d) => d.id === id)?.name[lang] ?? id;
  const multiCity = new Set(itinerary.days.map((d) => d.destination)).size > 1;
  const editing = Boolean(onChange);

  // Renvoie une copie du plan (une liste d'activités par jour) après une modification.
  function update(change) {
    const days = itinerary.days.map((d) => d.activities.map((a) => ({ name: a.name, type: a.type, cost: a.cost })));
    change(days);
    onChange(days);
  }
  const move = (dayIndex, activityIndex, delta) => update((days) => {
    const [activity] = days[dayIndex].splice(activityIndex, 1);
    days[dayIndex + delta].push(activity);
  });
  const remove = (dayIndex, activityIndex) => update((days) => { days[dayIndex].splice(activityIndex, 1); });
  const add = (dayIndex, activity) => update((days) => { days[dayIndex].push(activity); });

  return (
    <div className="itinerary">
      {itinerary.legs.length > 0 && (
        <div className="legs">
          <h3>{t.transferTitle}</h3>
          <ul>
            {itinerary.legs.map((leg) => (
              <li key={`${leg.from}-${leg.to}`}>
                <span>{t.legLine(cityName(leg.from), cityName(leg.to), leg.km)}</span>
                <span className="price">{formatMoney(leg.cost, lang)}</span>
              </li>
            ))}
          </ul>
          <p className={itinerary.legsCost > itinerary.transportBudget ? 'warning' : 'muted'}>
            {itinerary.legsCost > itinerary.transportBudget
              ? t.legsOver
              : t.legsNote(formatMoney(itinerary.legsCost, lang), formatMoney(itinerary.transportBudget, lang))}
          </p>
        </div>
      )}

      <ol className="days">
        {itinerary.days.map((day, dayIndex) => (
          <li key={day.day} className="day">
            <div className="day-head">
              <span className="day-badge">{t.dayLabel(day.day)}</span>
              {day.date && <span className="muted">{formatDate(day.date, lang)}</span>}
              {multiCity && <strong className="day-city">{cityName(day.destination)}</strong>}
            </div>
            {day.activities.length === 0 ? (
              <p className="muted day-free">{t.freeDay}</p>
            ) : (
              <ul className="day-activities">
                {day.activities.map((activity, activityIndex) => (
                  <li key={`${activityName(activity.name, 'fr')}-${activityIndex}`}>
                    <span aria-hidden="true">{TYPE_ICONS[activity.type] ?? TYPE_ICONS.custom}</span>
                    <span className="day-activity-name">{activityName(activity.name, lang)}</span>
                    <span className={activity.cost === 0 ? 'price free' : 'price'}>
                      {activity.cost === 0 ? t.free : formatMoney(activity.cost, lang)}
                    </span>
                    {editing && (
                      <span className="activity-tools">
                        <button className="tool" onClick={() => move(dayIndex, activityIndex, -1)} disabled={dayIndex === 0} aria-label={t.moveUp} title={t.moveUp}>↑</button>
                        <button className="tool" onClick={() => move(dayIndex, activityIndex, 1)} disabled={dayIndex === itinerary.days.length - 1} aria-label={t.moveDown} title={t.moveDown}>↓</button>
                        <button className="tool danger" onClick={() => remove(dayIndex, activityIndex)} aria-label={t.remove} title={t.remove}>✕</button>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {editing && <AddActivity t={t} lang={lang} places={placesByCity?.[day.destination]} people={people} onAdd={(activity) => add(dayIndex, activity)} />}
            <p className="muted day-total">{t.dayEstimate} : <strong>{formatMoney(day.total, lang)}</strong></p>
          </li>
        ))}
      </ol>
      <p className={itinerary.activitiesPlanned > itinerary.activitiesBudget ? 'warning' : 'muted'}>
        {t.itineraryNote(formatMoney(itinerary.activitiesPlanned, lang), formatMoney(itinerary.activitiesBudget, lang))}
      </p>
    </div>
  );
}
