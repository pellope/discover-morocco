import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import { LANGUAGES, getT } from './i18n.js';
import AuthForm from './components/AuthForm.jsx';
import TripPlanner from './components/TripPlanner.jsx';
import MyTrips from './components/MyTrips.jsx';

const LANG_KEY = 'dm_lang';

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'fr');
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(getToken()));
  const [tab, setTab] = useState('plan');
  const t = getT(lang);

  // Langue et sens d'écriture de la page (l'arabe s'écrit de droite à gauche).
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  // Au chargement, retrouver l'utilisateur à partir du jeton enregistré.
  useEffect(() => {
    if (!getToken()) return;
    api.me()
      .then(({ user: u }) => setUser(u))
      .catch((err) => { if (err.status === 401) setToken(null); })
      .finally(() => setChecking(false));
  }, []);

  function changeLanguage(code) {
    setLang(code);
    if (user) api.setLanguage(code).catch(() => {});
  }

  function onAuthenticated({ user: u, token }) {
    setToken(token);
    setUser(u);
    setTab('plan');
  }

  function logout() {
    setToken(null);
    setUser(null);
  }

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <span className="brand">Discover Morocco</span>
          {user && (
            <nav className="tabs">
              <button className={tab === 'plan' ? 'tab active' : 'tab'} onClick={() => setTab('plan')}>{t.planTab}</button>
              <button className={tab === 'trips' ? 'tab active' : 'tab'} onClick={() => setTab('trips')}>{t.tripsTab}</button>
            </nav>
          )}
          <div className="header-actions">
            <select
              className="lang-select"
              value={lang}
              onChange={(e) => changeLanguage(e.target.value)}
              aria-label="Language"
            >
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            {user && <button className="btn-ghost" onClick={logout}>{t.logout}</button>}
          </div>
        </div>
      </header>

      <main className="main">
        {checking ? (
          <p className="muted">{t.loading}</p>
        ) : !user ? (
          <AuthForm t={t} lang={lang} onAuthenticated={onAuthenticated} />
        ) : tab === 'plan' ? (
          <TripPlanner t={t} lang={lang} />
        ) : (
          <MyTrips t={t} lang={lang} />
        )}
      </main>
    </>
  );
}
