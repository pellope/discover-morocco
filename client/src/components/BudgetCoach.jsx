import { formatMoney } from '../i18n.js';

export default function BudgetCoach({ t, lang, coach, compact = false }) {
  return (
    <div className="coach">
      <div className="coach-top">
        <div>
          <div className="coach-amount">{formatMoney(coach.perDayPerPerson, lang)}</div>
          <div className="muted">{t.perDayPerPerson}</div>
        </div>
        <span className={`level level-${coach.level}`}>{t.levels[coach.level]}</span>
      </div>

      {!compact && (
        <>
          <p className="muted">{formatMoney(coach.perDay, lang)} {t.perDay}</p>
          <p className="tip">{t.tips[coach.level]}</p>
          <h3>{t.breakdownTitle}</h3>
        </>
      )}

      <ul className="breakdown">
        {Object.entries(coach.breakdown).map(([key, { percent, amount }]) => (
          <li key={key}>
            <div className="breakdown-row">
              <span>{t.categories[key]}</span>
              <span><strong>{formatMoney(amount, lang)}</strong> <span className="muted">· {percent}%</span></span>
            </div>
            <div className="bar"><div className={`bar-fill bar-${key}`} style={{ width: `${percent}%` }} /></div>
          </li>
        ))}
      </ul>
    </div>
  );
}
