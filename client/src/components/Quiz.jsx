import { useState } from 'react';
import DestinationCard from './DestinationCard.jsx';

const BIG_CITIES = ['Marrakech', 'Casablanca', 'Fes', 'Tangier', 'Agadir', 'Rabat'];
const TYPE_BY_ANSWER = ['culture', 'beach', 'desert', 'adventure', 'gastronomy'];
// Rythme : chaque réponse favorise un ou deux types de voyage.
const PACE = [['beach', 'gastronomy'], ['adventure'], ['culture'], ['desert']];

// Note chaque ville selon les cinq réponses et renvoie les trois meilleures.
function recommend(answers, destinations) {
  const [dream, pace, budget, size, season] = answers;
  return destinations
    .map((d) => {
      let score = 0;
      if (d.types.includes(TYPE_BY_ANSWER[dream])) score += d.types[0] === TYPE_BY_ANSWER[dream] ? 4 : 3;
      score += PACE[pace].filter((type) => d.types.includes(type)).length * 1.5;
      const limit = [350, 500, Infinity][budget];
      score += d.minDailyBudget <= limit ? 2 : -3;
      const big = BIG_CITIES.includes(d.id);
      if ((size === 0 && big) || (size === 1 && !big)) score += 1.5;
      if (season === 0 && d.climate[0] >= 18) score += 2;       // soleil en hiver
      if (season === 1 && d.climate[6] <= 30) score += 2;       // fraîcheur en été
      if (season === 2 && [4, 5, 10].some((m) => d.bestMonths.includes(m))) score += 1;
      return { d, score };
    })
    .sort((a, b) => b.score - a.score || a.d.minDailyBudget - b.d.minDailyBudget)
    .slice(0, 3)
    .map((entry) => entry.d);
}

export default function Quiz({ t, lang, destinations, favorites, toggleFavorite }) {
  const [answers, setAnswers] = useState([]);
  const step = answers.length;
  const total = t.quiz.length;

  if (step === total) {
    return (
      <>
        <h1 className="page-title">{t.quizResultTitle}</h1>
        <div className="dest-grid quiz-results">
          {recommend(answers, destinations).map((d) => (
            <DestinationCard key={d.id} t={t} lang={lang} destination={d} isFavorite={favorites.includes(d.id)} toggleFavorite={toggleFavorite} />
          ))}
        </div>
        <button className="btn-small" onClick={() => setAnswers([])}>{t.quizRestart}</button>
      </>
    );
  }

  const question = t.quiz[step];
  return (
    <div className="quiz">
      <h1 className="page-title">{t.quizTitle}</h1>
      <p className="lead">{t.quizIntro}</p>
      <div className="card quiz-card">
        <p className="muted">{t.quizStep(step + 1, total)}</p>
        <div className="bar"><div className="bar-fill bar-accommodation" style={{ width: `${(step / total) * 100}%` }} /></div>
        <h2>{question.q}</h2>
        <div className="quiz-options">
          {question.options.map((option, i) => (
            <button key={option} className="quiz-option" onClick={() => setAnswers([...answers, i])}>{option}</button>
          ))}
        </div>
        {step > 0 && <button className="btn-link" onClick={() => setAnswers(answers.slice(0, -1))}><span className="arrow" aria-hidden="true">←</span> {t.back}</button>}
      </div>
    </div>
  );
}
