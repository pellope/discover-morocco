import { useEffect, useRef, useState } from 'react';
import { CURRENCIES, LANGUAGES } from '../i18n.js';
import Logo from './Logo.jsx';

export default function Header({ t, lang, user, theme, toggleTheme, currency, setCurrency, changeLanguage, openAuth, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Fermer le menu au clic en dehors ou avec la touche Échap.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const onClick = (e) => { if (!menuRef.current?.contains(e.target)) setMenuOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const go = (hash) => { window.location.hash = hash; setMenuOpen(false); };

  return (
    <header className="header">
      <div className="header-inner">
        <a className="brand" href="#/">
          <Logo />
          <span className="brand-name">Discover <b>Morocco</b></span>
        </a>

        <div className="header-actions">
          <button className="icon-button" onClick={toggleTheme} aria-label={theme === 'dark' ? t.themeLight : t.themeDark} title={theme === 'dark' ? t.themeLight : t.themeDark}>
            <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          <select className="lang-select" value={currency} onChange={(e) => setCurrency(e.target.value)} aria-label={t.currency}>
            {CURRENCIES.map((code) => <option key={code} value={code}>{code}</option>)}
          </select>
          <select className="lang-select" value={lang} onChange={(e) => changeLanguage(e.target.value)} aria-label="Language">
            {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
          </select>

          <div className="menu" ref={menuRef}>
            <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={t.menu}>
              <span className="burger" aria-hidden="true">☰</span>
              <span className="avatar" aria-hidden="true">{user ? user.name.charAt(0).toUpperCase() : '👤'}</span>
            </button>
            {menuOpen && (
              <div className="menu-list">
                {user ? (
                  <>
                    <div className="menu-user">{user.name}</div>
                    <button onClick={() => go('#/trips')}>{t.tripsTab}</button>
                    <button onClick={() => go('#/favorites')}>{t.favoritesTab}</button>
                    <button onClick={() => go('#/profile')}>{t.profileTab}</button>
                  </>
                ) : (
                  <>
                    <button className="strong" onClick={() => { setMenuOpen(false); openAuth(); }}>{t.register}</button>
                    <button onClick={() => { setMenuOpen(false); openAuth(); }}>{t.login}</button>
                  </>
                )}
                <hr />
                <button onClick={() => go('#/quiz')}>{t.quizTab}</button>
                <button onClick={() => go('#/circuit')}>{t.circuitTab}</button>
                <button onClick={() => go('#/compare')}>{t.compareTab}</button>
                {user && (
                  <>
                    <hr />
                    <button onClick={() => { setMenuOpen(false); logout(); }}>{t.logout}</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
