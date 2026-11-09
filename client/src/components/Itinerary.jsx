import { TYPE_ICONS, formatMoney } from '../i18n.js';

// Plan jour par jour calculé par le serveur.
export default function Itinerary({ t, lang, itinerary }) {
  return (
    <div className="itinerary">
      <ol className="days">
        {itinerary.days.map((day) => (
          <li key={day.day} className="day">
            <span className="day-badge">{t.dayLabel(day.day)}</span>
            {day.activities.length === 0 ? (
              <p className="muted day-free">{t.freeDay}</p>
            ) : (
              <ul className="day-activities">
                {day.activities.map((activity) => (
                  <li key={activity.name.fr}>
                    <span aria-hidden="true">{TYPE_ICONS[activity.type]}</span>
                    <span className="day-activity-name">{activity.name[lang]}</span>
                    <span className={activity.cost === 0 ? 'price free' : 'price'}>
                      {activity.cost === 0 ? t.free : formatMoney(activity.cost, lang)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className="muted day-total">{t.dayEstimate} : <strong>{formatMoney(day.total, lang)}</strong></p>
          </li>
        ))}
      </ol>
      <p className="muted">{t.itineraryNote(formatMoney(itinerary.activitiesPlanned, lang), formatMoney(itinerary.activitiesBudget, lang))}</p>
    </div>
  );
}
