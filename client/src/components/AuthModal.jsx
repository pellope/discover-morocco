import { useEffect } from 'react';
import AuthForm from './AuthForm.jsx';

export default function AuthModal({ t, lang, googleClientId, onAuthenticated, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <div className="modal-head">
          <button className="modal-close" onClick={onClose} aria-label={t.close}>✕</button>
          <strong>{t.login} / {t.register}</strong>
        </div>
        <div className="modal-body">
          <h2 id="auth-title">{t.authTitle}</h2>
          <p className="muted">{t.authReason}</p>
          <AuthForm t={t} lang={lang} googleClientId={googleClientId} onAuthenticated={onAuthenticated} />
        </div>
      </div>
    </div>
  );
}
