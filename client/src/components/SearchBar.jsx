import { useEffect, useState } from 'react';

const empty = { budget: '', days: '5', people: '2' };

// Barre de recherche : budget total, durée et voyageurs.
export default function SearchBar({ t, search, setSearch }) {
  const [form, setForm] = useState(empty);

  // Quand la recherche est effacée ailleurs, vider aussi les champs.
  useEffect(() => {
    if (!search) setForm(empty);
  }, [search]);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  function submit(e) {
    e.preventDefault();
    setSearch({ budget: Number(form.budget), days: Number(form.days), people: Number(form.people) });
  }

  return (
    <form className="search" onSubmit={submit} role="search">
      <label className="search-field grow">
        <span>{t.searchBudget}</span>
        <input type="number" min="1" step="any" inputMode="decimal" required placeholder={t.searchBudgetPlaceholder} value={form.budget} onChange={set('budget')} />
      </label>
      <label className="search-field">
        <span>{t.searchDays} <span className="search-unit">({t.searchDaysUnit})</span></span>
        <input type="number" min="1" max="365" step="1" required value={form.days} onChange={set('days')} />
      </label>
      <label className="search-field">
        <span>{t.searchPeople}</span>
        <input type="number" min="1" max="50" step="1" required value={form.people} onChange={set('people')} />
      </label>
      <button className="search-button" aria-label={t.search}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
        </svg>
        <span className="search-button-text">{t.search}</span>
      </button>
    </form>
  );
}
