// src/App.jsx
import { lazy, Suspense, useState, useEffect, useLayoutEffect, useRef } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
  useNavigationType
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';

import './PublicChrome.css';
import Navbar from './components/Navbar';
import News from './pages/News';
import Footer from './components/Footer';
import './App.css';
import { API_BASE, fetchJson } from './api';
import PageTransition from './components/PageTransition';

const ArticleDetail = lazy(() => import('./pages/ArticleDetail'));
const Gallery = lazy(() => import('./pages/Gallery'));
const Admin = lazy(() => import('./pages/Admin'));
const Players = lazy(() => import('./pages/Squad'));
const FixturesPage = lazy(() => import('./pages/FixturesPage'));
const PlayerProfile = lazy(() => import('./pages/PlayerProfile'));

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Analytics />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isPublic = location.pathname.replace(/\/+$/, '').toLowerCase() !== '/admin';
  const isFirstNavigation = useRef(true);
  const publicContent = useRef(null);

  useEffect(() => {
    if (isFirstNavigation.current) {
      isFirstNavigation.current = false;
      if (!location.hash) {
        window.scrollTo(0, 0);
      }
      return;
    }

    if (navigationType === 'POP') return;

    if (!location.hash) {
      window.scrollTo(0, 0);
      publicContent.current?.focus({ preventScroll: true });
    }
  }, [location.pathname, location.hash, location.key, navigationType]);

  return (
    <>
      {isPublic && <><a className="ui-skip" href="#public-content">Skip to content</a><Navbar /></>}
      <div ref={isPublic ? publicContent : undefined} id={isPublic ? 'public-content' : undefined} tabIndex={isPublic ? -1 : undefined}>
        <AnimatePresence>
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PublicPage><News /></PublicPage>} />
            <Route path="/gallery" element={<PublicPage><Gallery /></PublicPage>} />
            <Route path="/squad" element={<PublicPage><Players /></PublicPage>} />
            <Route path="/squad/:id" element={<PublicPage><PlayerProfile /></PublicPage>} />
            <Route path="/fixtures" element={<PublicPage><FixturesPage /></PublicPage>} />
            <Route path="/news/:id" element={<PublicPage><ArticleDetail /></PublicPage>} />
            <Route path="/admin" element={<Suspense fallback={<RouteLoadingFallback />}><AdminRoute /></Suspense>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AnimatePresence>
      </div>
      {isPublic && <Footer />}
    </>
  );
}

function PublicPage({ children }) {
  return <PageTransition><Suspense fallback={<RouteLoadingFallback />}>{children}</Suspense></PageTransition>;
}

function NotFound() {
  return (
    <main className="public-ui club-not-found">
      <div className="public-container">
        <h1>Page not found</h1>
        <p>Find club news, fixtures and updates from the homepage.</p>
        <Link to="/" className="club-public-action">Back to club news</Link>
      </div>
    </main>
  );
}

function RouteLoadingFallback() {
  return (
    <main className="page-container" style={{ textAlign: 'center', marginTop: '5rem' }}>
      <p role="status">Loading page…</p>
    </main>
  );
}

const collectionPaths = {
  news: '/news', players: '/players', gallery: '/gallery', fixtures: '/fixtures',
  standings: '/standings', standingsTables: '/standings-tables'
};
const collectionNames = Object.keys(collectionPaths);
const collectionState = status => Object.fromEntries(collectionNames.map(name => [name, status]));

function AdminRoute() {
  const [data, setData] = useState(() => collectionState([]));
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(sessionStorage.getItem('junda_jwt'))
  );
  const [collectionStatuses, setCollectionStatuses] = useState(() => collectionState(isAuthenticated ? 'loading' : 'idle'));
  const [retryCount, setRetryCount] = useState(0);
  const [sessionVersion, setSessionVersion] = useState(0);
  const currentSession = useRef(0);
  const adminRouteMounted = useRef(false);
  useLayoutEffect(() => {
    adminRouteMounted.current = true;
    return () => { adminRouteMounted.current = false; };
  }, []);
  const [sessionNotice, setSessionNotice] = useState(null);

  const updateCollection = (name, value) => {
    if (!adminRouteMounted.current || currentSession.current !== sessionVersion) return;
    setData(current => ({ ...current, [name]: typeof value === 'function' ? value(current[name]) : value }));
  };

  const changeAuth = (authenticated, notice = null, token = null) => {
    if (!adminRouteMounted.current || currentSession.current !== sessionVersion) return;
    if (authenticated) sessionStorage.setItem('junda_jwt', token);
    else sessionStorage.removeItem('junda_jwt');
    currentSession.current += 1;
    setSessionVersion(currentSession.current);
    setSessionNotice(notice);
    setIsAuthenticated(authenticated);
    setCollectionStatuses(collectionState(authenticated ? 'loading' : 'idle'));
    if (!authenticated) setData(collectionState([]));
  };

  const adminRequest = async (path, options) => {
    if (!adminRouteMounted.current || currentSession.current !== sessionVersion) {
      throw new DOMException('The admin session has ended.', 'AbortError');
    }
    const token = sessionStorage.getItem('junda_jwt');
    if (!token) throw new DOMException('The admin session has ended.', 'AbortError');
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    if (typeof options?.body === 'string') headers.set('Content-Type', 'application/json');

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    // The API uses 401 for invalid or expired credentials and 403 for
    // insufficient privileges. changeAuth also guards against late 401s.
    if (response.status === 401) {
      changeAuth(false, { kind: 'error', text: 'Your session has expired. Sign in again to continue.' });
    }
    return response;
  };

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const controller = new AbortController();

    let isCurrentRequest = true;
    const loadCollection = (collectionName, path) => {
      fetchJson(path, controller.signal)
        .then(collectionData => {
          if (!isCurrentRequest || controller.signal.aborted || currentSession.current !== sessionVersion) return;
          setData(current => ({ ...current, [collectionName]: collectionData }));
          setCollectionStatuses(current => ({ ...current, [collectionName]: 'success' }));
        })
        .catch(requestError => {
          if (!isCurrentRequest || requestError.name === 'AbortError' || currentSession.current !== sessionVersion) return;
          console.error(`Error retrieving admin ${collectionName}:`, requestError);
          setCollectionStatuses(current => ({ ...current, [collectionName]: 'error' }));
        });
    };

    Object.entries(collectionPaths).forEach(([name, path]) => loadCollection(name, path));

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [isAuthenticated, retryCount, sessionVersion]);

  return (
    <Admin
      key={sessionVersion}
      sessionNotice={sessionNotice}
      news={data.news}
      setNews={value => updateCollection('news', value)}
      players={data.players}
      setPlayers={value => updateCollection('players', value)}
      gallery={data.gallery}
      setGallery={value => updateCollection('gallery', value)}
      fixtures={data.fixtures}
      setFixtures={value => updateCollection('fixtures', value)}
      standings={data.standings}
      setStandings={value => updateCollection('standings', value)}
      standingsTables={data.standingsTables}
      setStandingsTables={value => updateCollection('standingsTables', value)}
      standingsTablesStatus={collectionStatuses.standingsTables}
      API_BASE={API_BASE}
      adminRequest={adminRequest}
      collectionStatuses={collectionStatuses}
      onRetryData={() => {
        setCollectionStatuses(collectionState('loading'));
        setRetryCount(count => count + 1);
      }}
      onAuthChange={changeAuth}
    />
  );
}
