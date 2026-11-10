import { CREDITS } from '../photoCredits.js';
import { PLACE_CREDITS } from '../placeCredits.js';

// Auteurs et licences des photos (obligatoire pour les licences Creative Commons).
export default function Credits({ t, lang, destinations }) {
  const label = (id) => destinations.find((d) => d.id === id.split('-')[0])?.name[lang] ?? 'Discover Morocco';
  const entries = [
    ...CREDITS.map((c) => ({ ...c, label: label(c.id) })),
    ...PLACE_CREDITS.map((c) => ({ ...c, label: `${label(c.id)} — ${c.label}` })),
  ];
  return (
    <>
      <h1 className="page-title">{t.photoCredits}</h1>
      <p className="muted">{t.creditsIntro}</p>
      <ul className="credits">
        {entries.map((c) => (
          <li key={c.id}>
            <strong>{c.label}</strong> — {t.photoBy} : {c.author},{' '}
            <a href={c.url} target="_blank" rel="noreferrer">{c.license}</a>
          </li>
        ))}
      </ul>
    </>
  );
}
