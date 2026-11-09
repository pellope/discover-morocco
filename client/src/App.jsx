import { useEffect, useState } from 'react';
import { api, getToken, setToken } from './api.js';
import { getT, errorText } from './i18n.js';
import Header from './components/Header.jsx';
import AuthModal from './components/AuthModal.jsx';
import Home from './components/Home.jsx';
import CityPage from './components/CityPage.jsx';
import MyTrips from './components/MyTrips.jsx';
import Favorites from './components/Favorites.jsx';
import Credits from './components/Credits.jsx';
import Footer from './components/Footer.jsx';

const LANG_KEY = 'dm_lang';

// Navigation par l'adresse : #/ , #/city/Fes , #/trips , #/favorites
function parseRoute() {
  const [page = '', id] = window.location.hash.replace(/^#\/?/, '').split('/');
  return { page: page || 'home', id: id ? decodeURIComponent(id) : null };
}

export default function App() {
  const [lang, setLang] = useState(() => localStorage.getItem(LANG_KEY) || 'fr');
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

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem(LANG_KEY, lang);
  }, [lang]);

  useEffect(() => {
    const onHashChange = () => { setRoute(parseRoute()); window.scrollTo(0, 0); };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

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
  useEffect(() => {
    let cancelled = false;
    api.destinations(search ?? {})
      .then(({ destinations: list }) => { if (!cancelled) { setDestinations(list); setLoadError(null); } })
      .catch((err) => { if (!cancelled) setLoadError(err.code); });
    return () => { cancelled = true; };
  }, [search]);

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
  const needsAccount = (route.page === 'trips' || route.page === 'favorites') && !user;

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
        destination={destinations.find((d) => d.id === route.id)}
        search={search}
        category={category}
        user={user}
        requireAuth={() => setAuthOpen(true)}
      />
    );
  } else if (route.page === 'trips') {
    page = <MyTrips t={t} lang={lang} destinations={destinations} />;
  } else if (route.page === 'favorites') {
    page = <Favorites {...shared} destinations={destinations} />;
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
        changeLanguage={changeLanguage}
        openAuth={() => setAuthOpen(true)}
        logout={logout}
      />
      <main className="main">{page}</main>
      <Footer t={t} />
      {authOpen && <AuthModal t={t} lang={lang} onAuthenticated={onAuthenticated} onClose={() => setAuthOpen(false)} />}
    </>
  );
}
