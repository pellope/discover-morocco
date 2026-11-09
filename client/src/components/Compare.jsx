import { useState } from 'react';
import { formatMoney } from '../i18n.js';
import Cover from './Cover.jsx';

// Comparer ce que le même budget permet dans deux villes.
export default function Compare({ t, lang, destinations, search }) {
  const [form, setForm] = useState({
    a: destinations[0].id,
    b: destinations[1].id,
    budget: search ? String(search.budget) : '',
    days: String(search?.days ?? 5),
    people: String(search?.people ?? 2),
  });
  const [result, setResult] = useState(null);
  const set = (field) => (e) => { setForm({ ...form, [field]: e.target.value }); setResult(null); };

  function submit(e) {
    e.preventDefault();
    const perDayPerPerson = Number(form.budget) / Number(form.days) / Number(form.people);
    const perPerson = Number(form.budget) / Number(form.people);
    const cities = [form.a, form.b].map((id) => {
      const d = destinations.find((item) => item.id === id);
      return { d, margin: perDayPerPerson - d.minDailyBudget, maxDays: Math.floor(perPerson / d.minDailyBudget) };
    });
    setResult({ cities, perDayPerPerson });
  }

  let verdict = null;
  if (result) {
    const [first, second] = result.cities;
    if (first.margin < 0 && second.margin < 0) verdict = t.verdictNone;
    else if (first.margin === second.margin) verdict = t.verdictEqual;
    else verdict = t.verdictBest((first.margin > second.margin ? first : second).d.name[lang]);
  }
  const same = form.a === form.b;

  return (
    <>
      <h1 className="page-title">{t.compareTitle}</h1>
      <p className="lead">{t.compareIntro}</p>

      <form className="card compare-form" onSubmit={submit}>
        <label className="select-field">
          <span>{t.cityA}</span>
          <select value={form.a} onChange={set('a')}>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}
          </select>
        </label>
        <label className="select-field">
          <span>{t.cityB}</span>
          <select value={form.b} onChange={set('b')}>
            {destinations.map((d) => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}
          </select>
        </label>
        <label className="select-field">
          <span>{t.budget}</span>
          <input type="number" min="1" step="any" inputMode="decimal" required value={form.budget} onChange={set('budget')} />
        </label>
        <label className="select-field small">
          <span>{t.days}</span>
          <input type="number" min="1" max="365" step="1" required value={form.days} onChange={set('days')} />
        </label>
        <label className="select-field small">
          <span>{t.people}</span>
          <input type="number" min="1" max="50" step="1" required value={form.people} onChange={set('people')} />
        </label>
        <button className="btn-primary" disabled={same}>{t.compareAction}</button>
        {same && <p className="error compare-error" role="alert">{t.sameCity}</p>}
      </form>

      {result && (
        <>
          <p className="verdict" role="status">{verdict}</p>
          <div className="compare-grid">
            {result.cities.map(({ d, margin, maxDays }) => (
              <article key={d.id} className="card compare-card">
                <div className="compare-cover"><Cover destination={d} /></div>
                <h2>{d.name[lang]}</h2>
                <p className="muted">{d.tagline[lang]}</p>
                <span className={`badge static ${margin >= 0 ? 'badge-fits' : 'badge-tight'}`}>{margin >= 0 ? t.fitsBadge : t.tightBadge}</span>
                <dl className="facts">
                  <div><dt>{t.minBudgetLabel}</dt><dd>{formatMoney(d.minDailyBudget, lang)}</dd></div>
                  <div>
                    <dt>{t.marginLabel}</dt>
                    <dd className={margin >= 0 ? 'positive' : 'negative'}><bdi>{margin > 0 ? '+' : ''}{formatMoney(margin, lang)}</bdi></dd>
                  </div>
                  <div><dt>{t.maxDaysLabel}</dt><dd>{t.daysCount(maxDays)}</dd></div>
                  <div><dt>{t.idealFor}</dt><dd>{d.types.map((type) => t.types[type]).join(' · ')}</dd></div>
                </dl>
                <a className="btn-secondary" href={`#/city/${d.id}`}>{t.planThisCity}</a>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  );
}
