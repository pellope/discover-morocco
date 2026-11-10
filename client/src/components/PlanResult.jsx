import { formatMoney } from '../i18n.js';
import BudgetCoach from './BudgetCoach.jsx';
import Itinerary from './Itinerary.jsx';

// Résultat d'un calcul de voyage : avertissements, Budget Coach et plan jour par jour.
// `plan` est la réponse du serveur ({ budgetCoach, itinerary, minimum }).
export default function PlanResult({ t, lang, plan, destinations, onPlanChange, placesByCity, people, children }) {
  return (
    <>
      {plan.minimum.peak && <p className="warning" role="status">{t.peakNote}</p>}
      {!plan.minimum.enough && (
        <p className="warning" role="status">{t.belowMinimum(formatMoney(plan.minimum.amount, lang))}</p>
      )}
      <BudgetCoach t={t} lang={lang} coach={plan.budgetCoach} />
      <div className="section-head">
        <h2>{t.itineraryTitle}</h2>
        {children}
      </div>
      <Itinerary t={t} lang={lang} itinerary={plan.itinerary} destinations={destinations} onChange={onPlanChange} placesByCity={placesByCity} people={people} />
    </>
  );
}
