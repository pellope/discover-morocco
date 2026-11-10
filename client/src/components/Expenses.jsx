import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { errorText, formatMoney } from '../i18n.js';

const CATEGORIES = ['accommodation', 'transport', 'food', 'activities', 'contingency'];

// Suivi des dépenses d'un voyage et comptes entre voyageurs.
export default function Expenses({ t, lang, tripId, people }) {
  const [report, setReport] = useState(null);
  const [form, setForm] = useState({ label: '', amount: '', category: 'food', paidBy: '0' });
  const [names, setNames] = useState(null);
  const [error, setError] = useState(null);

  // « #2 » est le nom par défaut d'un voyageur sans prénom.
  const display = (name) => (/^#\d+$/.test(name) ? t.travelerDefault(name.slice(1)) : name);
  const apply = (next) => { setReport(next); setNames(next.travelers.map(display)); };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { api.expenses(tripId).then(apply).catch((err) => setError(err.code)); }, [tripId]);

  async function act(action) {
    setError(null);
    try {
      apply(await action());
    } catch (err) {
      setError(err.code);
    }
  }

  function addExpense(e) {
    e.preventDefault();
    act(async () => {
      const next = await api.addExpense(tripId, { ...form, amount: Number(form.amount), paidBy: Number(form.paidBy) });
      setForm({ ...form, label: '', amount: '' });
      return next;
    });
  }

  if (!report) return error ? <p className="error" role="alert">{errorText(t, error)}</p> : <p className="muted">{t.loading}</p>;
  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <>
      <section className="card">
        <h2>{t.expensesTitle}</h2>
        <p className="muted">{t.expensesIntro}</p>

        <ul className="breakdown expense-bars">
          {CATEGORIES.map((key) => {
            const { budget, spent, remaining } = report.summary.byCategory[key];
            const over = remaining < 0;
            return (
              <li key={key}>
                <div className="breakdown-row">
                  <span>{t.categories[key]}</span>
                  <span className={over ? 'negative' : ''}>
                    <strong>{formatMoney(spent, lang)}</strong> <span className="muted">/ {formatMoney(budget, lang)}</span>
                    {over && <> · {t.overBudget}</>}
                  </span>
                </div>
                <div className="bar"><div className={`bar-fill ${over ? 'bar-over' : `bar-${key}`}`} style={{ width: `${Math.min(100, budget ? (spent / budget) * 100 : 0)}%` }} /></div>
              </li>
            );
          })}
        </ul>
        <p className="totals">
          <span>{t.spent} : <strong>{formatMoney(report.summary.totalSpent, lang)}</strong></span>
          <span className={report.summary.remaining < 0 ? 'negative' : 'positive'}>{t.remaining} : <strong><bdi>{formatMoney(report.summary.remaining, lang)}</bdi></strong></span>
        </p>

        <form className="expense-form" onSubmit={addExpense}>
          <label className="select-field">
            <span>{t.expenseLabel}</span>
            <input value={form.label} onChange={set('label')} required maxLength={100} />
          </label>
          <label className="select-field small">
            <span>{t.amount}</span>
            <input type="number" min="0.01" step="any" inputMode="decimal" required value={form.amount} onChange={set('amount')} />
          </label>
          <label className="select-field">
            <span>{t.category}</span>
            <select value={form.category} onChange={set('category')}>
              {CATEGORIES.map((key) => <option key={key} value={key}>{t.categories[key]}</option>)}
            </select>
          </label>
          {people > 1 && (
            <label className="select-field">
              <span>{t.paidBy}</span>
              <select value={form.paidBy} onChange={set('paidBy')}>
                {report.travelers.map((name, i) => <option key={name} value={i}>{display(name)}</option>)}
              </select>
            </label>
          )}
          <button className="btn-primary">{t.addExpense}</button>
        </form>
        {error && <p className="error" role="alert">{errorText(t, error)}</p>}

        {report.expenses.length === 0 ? (
          <p className="muted">{t.noExpenses}</p>
        ) : (
          <ul className="expense-list">
            {report.expenses.map((expense) => (
              <li key={expense.id}>
                <span className="expense-label">
                  <strong>{expense.label}</strong>
                  <span className="muted">{t.categories[expense.category]}{people > 1 && ` · ${display(report.travelers[expense.paidBy])}`}</span>
                </span>
                <span className="price">{formatMoney(expense.amount, lang)}</span>
                <button className="tool danger" onClick={() => act(() => api.deleteExpense(tripId, expense.id))} aria-label={`${t.delete} : ${expense.label}`} title={t.delete}>✕</button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {people > 1 && (
        <section className="card">
          <h2>{t.splitTitle}</h2>
          <p className="muted">{t.splitIntro}</p>

          <form className="names-form" onSubmit={(e) => { e.preventDefault(); act(() => api.saveTravelers(tripId, names)); }}>
            <fieldset className="field">
              <legend>{t.travelersTitle}</legend>
              <div className="names">
                {names.map((name, i) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <input key={i} value={name} maxLength={40} required aria-label={t.travelerDefault(i + 1)} onChange={(e) => setNames(names.map((n, index) => (index === i ? e.target.value : n)))} />
                ))}
              </div>
            </fieldset>
            <button className="btn-small">{t.saveNames}</button>
          </form>

          <dl className="facts">
            {report.balances.map((b) => (
              <div key={b.name}>
                <dt>{display(b.name)} <span className="muted">· {t.spent.toLowerCase()} {formatMoney(b.paid, lang)}</span></dt>
                <dd className={b.balance < 0 ? 'negative' : b.balance > 0 ? 'positive' : ''}><bdi>{b.balance > 0 ? '+' : ''}{formatMoney(b.balance, lang)}</bdi></dd>
              </div>
            ))}
          </dl>
          {report.settlements.length === 0 ? (
            <p className="muted">{t.allSettled}</p>
          ) : (
            <ul className="settlements">
              {report.settlements.map((s) => (
                <li key={`${s.from}-${s.to}`}>{t.owes(display(s.from), display(s.to), formatMoney(s.amount, lang))}</li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
