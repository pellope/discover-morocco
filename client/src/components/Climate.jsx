// Températures maximales moyennes par mois ; les meilleurs mois sont mis en couleur.
export default function Climate({ t, destination }) {
  const { climate, bestMonths } = destination;
  const max = Math.max(...climate);
  return (
    <section>
      <h2>{t.climateTitle}</h2>
      <ol className="climate">
        {climate.map((temp, i) => {
          const best = bestMonths.includes(i + 1);
          return (
            <li key={t.months[i]} className={best ? 'best' : ''}>
              <span className="climate-temp">{temp}°</span>
              <span className="climate-bar" style={{ height: `${Math.round((temp / max) * 72)}px` }} />
              <span className="climate-month">{t.months[i]}</span>
            </li>
          );
        })}
      </ol>
      <p><strong>{t.bestPeriod} :</strong> {bestMonths.map((m) => t.months[m - 1]).join(', ')}</p>
      <p className="muted">{t.climateNote}</p>
    </section>
  );
}
