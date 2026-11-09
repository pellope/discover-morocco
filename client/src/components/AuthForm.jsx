import { useState } from 'react';
import { api } from '../api.js';
import { errorText } from '../i18n.js';

export default function AuthForm({ t, lang, onAuthenticated }) {
  const [mode, setMode] = useState('register');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const result = mode === 'register'
        ? await api.register({ ...form, language: lang })
        : await api.login({ email: form.email, password: form.password });
      onAuthenticated(result);
    } catch (err) {
      setError(err.code);
    } finally {
      setBusy(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError(null);
  }

  return (
    <div className="auth-layout">
      <section className="hero">
        <h1>{t.tagline}</h1>
        <p>{t.heroText}</p>
      </section>

      <form className="card auth-card" onSubmit={submit}>
        <div className="segmented">
          <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>{t.register}</button>
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>{t.login}</button>
        </div>

        {mode === 'register' && (
          <label className="field">
            <span>{t.name}</span>
            <input value={form.name} onChange={set('name')} autoComplete="name" required maxLength={100} />
          </label>
        )}
        <label className="field">
          <span>{t.email}</span>
          <input type="email" value={form.email} onChange={set('email')} autoComplete="email" required dir="ltr" />
        </label>
        <label className="field">
          <span>{t.password}</span>
          <input
            type="password"
            value={form.password}
            onChange={set('password')}
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            required
            minLength={mode === 'register' ? 8 : undefined}
            dir="ltr"
          />
          {mode === 'register' && <small className="muted">{t.passwordHint}</small>}
        </label>

        {error && <p className="error" role="alert">{errorText(t, error)}</p>}

        <button className="btn-primary" disabled={busy}>
          {mode === 'register' ? t.registerAction : t.loginAction}
        </button>
      </form>
    </div>
  );
}
