// src/App.jsx
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigationType
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';

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
      {/* Top Header Strip */}
      <Navbar /> 

      <AppRoutes />

      {/* Bottom Brand Anchor */}
      <Footer />
      <Analytics />
    </BrowserRouter>
  );
}

function AppRoutes() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const isFirstNavigation = useRef(true);

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
    }
  }, [location.pathname, location.hash, navigationType]);

  return (
    <AnimatePresence>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={<PageTransition><News /></PageTransition>}
        />

        <Route
          path="/gallery"
          element={
            <PageTransition>
              <Suspense fallback={<RouteLoadingFallback />}>
                <Gallery />
              </Suspense>
            </PageTransition>
          }
        />

        {/* SQUAD ROUTES */}
        <Route
          path="/squad"
          element={
            <PageTransition>
              <Suspense fallback={<RouteLoadingFallback />}>
                <Players />
              </Suspense>
            </PageTransition>
          }
        />
        <Route
          path="/squad/:id"
          element={
            <PageTransition>
              <Suspense fallback={<RouteLoadingFallback />}>
                <PlayerProfile />
              </Suspense>
            </PageTransition>
          }
        />

        {/* MATCH CENTRE */}
        <Route
          path="/fixtures"
          element={
            <PageTransition>
              <Suspense fallback={<RouteLoadingFallback />}>
                <FixturesPage />
              </Suspense>
            </PageTransition>
          }
        />

        {/* ADMIN PANEL */}
        <Route path="/admin" element={<AdminRoute />} />

        {/* INDIVIDUAL NEWS ARTICLE */}
        <Route
          path="/news/:id"
          element={
            <PageTransition>
              <Suspense fallback={<RouteLoadingFallback />}>
                <ArticleDetail />
              </Suspense>
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function RouteLoadingFallback() {
  return (
    <div className="page-container" style={{ textAlign: 'center', marginTop: '5rem' }}>
      <p>Loading page...</p>
    </div>
  );
}

function AdminRoute() {
  const [data, setData] = useState({
    news: [],
    players: [],
    gallery: [],
    fixtures: [],
    standings: [],
    standingsTables: []
  });
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(sessionStorage.getItem('junda_jwt'))
  );
  const [collectionStatuses, setCollectionStatuses] = useState({
    news: 'idle',
    players: 'idle',
    gallery: 'idle',
    fixtures: 'idle',
    standings: 'idle',
    standingsTables: 'idle'
  });
  const [retryCount, setRetryCount] = useState(0);

  const getAuthHeaders = (isJson = true) => {
    const headers = { 'Authorization': `Bearer ${sessionStorage.getItem('junda_jwt') || ''}` };
    if (isJson) headers['Content-Type'] = 'application/json';
    return headers;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setData({
        news: [],
        players: [],
        gallery: [],
        fixtures: [],
        standings: [],
        standingsTables: []
      });
      setCollectionStatuses({
        news: 'idle',
        players: 'idle',
        gallery: 'idle',
        fixtures: 'idle',
        standings: 'idle',
        standingsTables: 'idle'
      });
      return undefined;
    }

    const controller = new AbortController();
    setCollectionStatuses({
      news: 'loading',
      players: 'loading',
      gallery: 'loading',
      fixtures: 'loading',
      standings: 'loading',
      standingsTables: 'loading'
    });

    let isCurrentRequest = true;
    const loadCollection = (collectionName, path) => {
      fetchJson(path, controller.signal)
        .then(collectionData => {
          if (!isCurrentRequest || controller.signal.aborted) return;
          setData(current => ({ ...current, [collectionName]: collectionData }));
          setCollectionStatuses(current => ({ ...current, [collectionName]: 'success' }));
        })
        .catch(requestError => {
          if (!isCurrentRequest || requestError.name === 'AbortError') return;
          console.error(`Error retrieving admin ${collectionName}:`, requestError);
          setCollectionStatuses(current => ({ ...current, [collectionName]: 'error' }));
        });
    };

    loadCollection('news', '/news');
    loadCollection('players', '/players');
    loadCollection('gallery', '/gallery');
    loadCollection('fixtures', '/fixtures');
    loadCollection('standings', '/standings');
    loadCollection('standingsTables', '/standings-tables');

    return () => {
      isCurrentRequest = false;
      controller.abort();
    };
  }, [isAuthenticated, retryCount]);

  return (
    <Admin
      news={data.news}
      setNews={value => setData(current => ({ ...current, news: typeof value === 'function' ? value(current.news) : value }))}
      players={data.players}
      setPlayers={value => setData(current => ({ ...current, players: typeof value === 'function' ? value(current.players) : value }))}
      gallery={data.gallery}
      setGallery={value => setData(current => ({ ...current, gallery: typeof value === 'function' ? value(current.gallery) : value }))}
      fixtures={data.fixtures}
      setFixtures={value => setData(current => ({ ...current, fixtures: typeof value === 'function' ? value(current.fixtures) : value }))}
      standings={data.standings}
      setStandings={value => setData(current => ({ ...current, standings: typeof value === 'function' ? value(current.standings) : value }))}
      standingsTables={data.standingsTables}
      setStandingsTables={value => setData(current => ({ ...current, standingsTables: typeof value === 'function' ? value(current.standingsTables) : value }))}
      standingsTablesStatus={collectionStatuses.standingsTables}
      API_BASE={API_BASE}
      adminAuthHeaders={getAuthHeaders}
      collectionStatuses={collectionStatuses}
      onRetryData={() => setRetryCount(count => count + 1)}
      onAuthChange={authenticated => {
        setIsAuthenticated(authenticated);
        if (authenticated) setRetryCount(count => count + 1);
      }}
    />
  );
}
