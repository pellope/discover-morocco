import { useEffect, useState } from 'react';

// Liste de bagages à cocher. Les cases cochées sont gardées dans le navigateur, par voyage.
export default function PackingList({ t, tripId, items }) {
  const key = `dm_packing_${tripId}`;
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? []; } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(checked)); } catch { /* stockage indisponible */ }
  }, [key, checked]);

  const toggle = (item) => setChecked(checked.includes(item) ? checked.filter((i) => i !== item) : [...checked, item]);

  return (
    <section className="card">
      <h2>{t.packingTitle} <span className="muted">{checked.filter((i) => items.includes(i)).length} / {items.length}</span></h2>
      <ul className="packing">
        {items.map((item) => (
          <li key={item}>
            <label>
              <input type="checkbox" checked={checked.includes(item)} onChange={() => toggle(item)} />
              <span>{t.packing[item] ?? item}</span>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
