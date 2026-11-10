import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import { getT, errorText, setCurrency } from './i18n.js';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AuthModal from './components/AuthModal.jsx';
import Home from './components/Home.jsx';
import CityPage from './components/CityPage.jsx';
import CircuitPage from './components/CircuitPage.jsx';
import MyTrips from './components/MyTrips.jsx';
import TripPage from './components/TripPage.jsx';
import Favorites from './components/Favorites.jsx';
import Compare from './components/Compare.jsx';
import Quiz from './components/Quiz.jsx';
import Profile from './components/Profile.jsx';
import SharedTrip from './components/SharedTrip.jsx';
import Credits from './components/Credits.jsx';

const stored = (key, fallback) => {
  try { return localStorage.getItem(key) || fallback; } catch { return fallback; }
};
const prefersDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches;

// Navigation par l'adresse : #/ , #/city/Fes , #/trip/12 , #/shared/<jeton> …
function parseRoute() {
  const [page = '', id] = window.location.hash.replace(/^#\/?/, '').split('/');
  return { page: page || 'home', id: id ? decodeURIComponent(id) : null };
}

const ACCOUNT_PAGES = ['trips', 'trip', 'favorites', 'profile'];

export default function App() {
  const [lang, setLang] = useState(() => stored('dm_lang', 'fr'));
  const [theme, setTheme] = useState(() => stored('dm_theme', prefersDark() ? 'dark' : 'light'));
  const [currency, setCurrencyState] = useState(() => stored('dm_currency', 'MAD'));
  const [config, setConfig] = useState(null);
  const [route, setRoute] = useState(parseRoute);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(getToken()));
  const [favorites, setFavorites] = useState([]);
  const [destinations, setDestinations] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [search, setSearch] = useState(null); // { budget, days, people } ou null
  const [category, setCategory] = useState(null);
  const [authOpen, setAuthOpen] = useState(false);
  const t = getT(lang);

  // La devise est appliquée avant l'affichage : tous les montants passent par formatMoney.
  setCurrency(currency, config?.rates);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('dm_lang', lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('dm_theme', theme);
  }, [theme]);

  useEffect(() => { localStorage.setItem('dm_currency', currency); }, [currency]);

  useEffect(() => {
    const onHashChange = () => { setRoute(parseRoute()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => { api.config().then(setConfig).catch(() => {}); }, []);

  // Au chargement, retrouver l'utilisateur à partir du jeton enregistré.
  useEffect(() => {
    if (!getToken()) return;
    api.me()
      .then(({ user: u }) => setUser(u))
      .catch((err) => { if (err.status === 401) setToken(null); })
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    api.favorites().then(({ favorites: list }) => setFavorites(list)).catch(() => {});
  }, [user]);

  // La liste des destinations vient du serveur, triée selon la recherche en cours.
  const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let cancelled = false;
    api.destinations(search ?? {})
      .then(({ destinations: list }) => { if (!cancelled) { setDestinations(list); setLoadError(null); } })
      .catch((err) => { if (!cancelled) setLoadError(err.code); });
    return () => { cancelled = true; };
  }, [search, reloadKey]);

  function changeLanguage(code) {
    setLang(code);
    if (user) api.setLanguage(code).catch(() => {});
  }

  function onAuthenticated({ user: u, token }) {
    setToken(token);
    setUser(u);
    setAuthOpen(false);
  }

  function logout() {
    setToken(null);
    setUser(null);
    window.location.hash = '#/';
  }

  async function toggleFavorite(id) {
    if (!user) { setAuthOpen(true); return; }
    const isFavorite = favorites.includes(id);
    try {
      const { favorites: list } = isFavorite ? await api.removeFavorite(id) : await api.addFavorite(id);
      setFavorites(list);
    } catch { /* le cœur reste dans son état précédent */ }
  }

  const shared = { t, lang, favorites, toggleFavorite };
  const planning = { t, lang, user, search, requireAuth: () => setAuthOpen(true) };
  const needsAccount = ACCOUNT_PAGES.includes(route.page) && !user;

  let page;
  if (checking) {
    page = <p className="muted">{t.loading}</p>;
  } else if (loadError && !destinations) {
    page = <p className="error" role="alert">{errorText(t, loadError)}</p>;
  } else if (!destinations) {
    page = <p className="muted">{t.loading}</p>;
  } else if (needsAccount) {
    page = (
      <div className="empty">
        <p>{t.authReason}</p>
        <button className="btn-primary inline" onClick={() => setAuthOpen(true)}>{t.login}</button>
      </div>
    );
  } else if (route.page === 'city') {
    page = (
      <CityPage
        key={route.id}
        {...shared}
        {...planning}
        destination={destinations.find((d) => d.id === route.id)}
        category={category}
        onReviewed={() => setReloadKey((k) => k + 1)}
      />
    );
  } else if (route.page === 'circuit') {
    page = <CircuitPage {...planning} destinations={destinations} />;
  } else if (route.page === 'trips') {
    page = <MyTrips t={t} lang={lang} destinations={destinations} />;
  } else if (route.page === 'trip') {
    page = <TripPage key={route.id} t={t} lang={lang} id={route.id} destinations={destinations} />;
  } else if (route.page === 'favorites') {
    page = <Favorites {...shared} destinations={destinations} />;
  } else if (route.page === 'compare') {
    page = <Compare t={t} lang={lang} destinations={destinations} search={search} />;
  } else if (route.page === 'quiz') {
    page = <Quiz {...shared} destinations={destinations} />;
  } else if (route.page === 'profile') {
    page = <Profile t={t} user={user} setUser={setUser} logout={logout} />;
  } else if (route.page === 'shared') {
    page = <SharedTrip key={route.id} t={t} lang={lang} token={route.id} destinations={destinations} />;
  } else if (route.page === 'credits') {
    page = <Credits t={t} lang={lang} destinations={destinations} />;
  } else {
    page = <Home {...shared} user={user} destinations={destinations} search={search} setSearch={setSearch} category={category} setCategory={setCategory} />;
  }

  return (
    <>
      <Header
        t={t}
        lang={lang}
        user={user}
        theme={theme}
        toggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        currency={currency}
        setCurrency={setCurrencyState}
        changeLanguage={changeLanguage}
        openAuth={() => setAuthOpen(true)}
        logout={logout}
      />
      <main className="main">{page}</main>
      <Footer t={t} />
      {authOpen && (
        <AuthModal t={t} lang={lang} googleClientId={config?.googleClientId} onAuthenticated={onAuthenticated} onClose={() => setAuthOpen(false)} />
      )}
    </>
  );
}
