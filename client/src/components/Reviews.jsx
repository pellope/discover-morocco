import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { errorText, formatDate } from '../i18n.js';

function Stars({ value, onChange, t }) {
  return (
    <span className="stars" role={onChange ? 'radiogroup' : 'img'} aria-label={t.starsLabel(value)}>
      {[1, 2, 3, 4, 5].map((n) => (onChange ? (
        <button type="button" key={n} role="radio" aria-checked={value === n} aria-label={t.starsLabel(n)} className={n <= value ? 'star on' : 'star'} onClick={() => onChange(n)}>★</button>
      ) : (
        <span key={n} className={n <= value ? 'star on' : 'star'} aria-hidden="true">★</span>
      )))}
    </span>
  );
}

// Avis des voyageurs sur une ville : lecture pour tous, un avis par compte.
export default function Reviews({ t, lang, destination, user, requireAuth, onChanged }) {
  const [data, setData] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState(null);

  const load = () => api.reviews(destination.id).then((result) => {
    setData(result);
    const mine = user && result.reviews.find((r) => r.userId === user.id);
    setRating(mine?.rating ?? 0);
    setComment(mine?.comment ?? '');
  }).catch((err) => setError(err.code));

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [destination.id, user?.id]);

  async function act(action) {
    setError(null);
    try {
      await action();
      await load();
      onChanged?.();
    } catch (err) {
      setError(err.code);
    }
  }

  const mine = user && data?.reviews.find((r) => r.userId === user.id);

  return (
    <section>
      <h2>{t.reviewsTitle}</h2>

      {user ? (
        <form className="review-form" onSubmit={(e) => { e.preventDefault(); act(() => api.saveReview(destination.id, { rating, comment })); }}>
          <strong>{t.yourReview}</strong>
          <Stars value={rating} onChange={setRating} t={t} />
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t.commentPlaceholder} aria-label={t.commentPlaceholder} maxLength={1000} rows={3} />
          <div className="trip-actions">
            <button className="btn-small primary" disabled={rating === 0}>{t.publish}</button>
            {mine && <button type="button" className="btn-small danger" onClick={() => act(() => api.deleteReview(destination.id))}>{t.deleteReview}</button>}
          </div>
        </form>
      ) : (
        <button className="btn-small" onClick={requireAuth}>{t.loginToReview}</button>
      )}
      {error && <p className="error" role="alert">{errorText(t, error)}</p>}

      {data && data.reviews.length === 0 && <p className="muted review-empty">{t.noReviews}</p>}
      <ul className="reviews">
        {data?.reviews.map((review) => (
          <li key={review.userId}>
            <div className="review-head">
              <strong>{review.name}</strong>
              <Stars value={review.rating} t={t} />
              <span className="muted">{formatDate(review.createdAt.slice(0, 10), lang)}</span>
            </div>
            {review.comment && <p>{review.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
