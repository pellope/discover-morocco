// Guide pratique : accès à la ville, déplacements, pourboires et quelques mots de darija.
export default function Guide({ t, lang, destination }) {
  return (
    <section>
      <h2>{t.guideTitle}</h2>
      <div className="guide">
        <div>
          <h3>✈️ {t.getThere}</h3>
          <p>{destination.getThere[lang]}</p>
        </div>
        <div>
          <h3>🚕 {t.getAround}</h3>
          <p>{t.getAroundText}</p>
        </div>
        <div>
          <h3>🪙 {t.tipping}</h3>
          <p>{t.tippingText}</p>
        </div>
        <div>
          <h3>💬 {t.phrases}</h3>
          <dl className="phrases">
            {t.phraseList.map(([word, meaning]) => (
              <div key={word}><dt>{word}</dt><dd>{meaning}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
