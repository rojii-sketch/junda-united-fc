// src/App.jsx
import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';

import Navbar from './components/Navbar';
import News from './pages/News';
import Footer from './components/Footer';
import './App.css';
import { API_BASE, fetchJson } from './api';

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

      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          <Route path="/" element={<News />} />
          <Route path="/gallery" element={<Gallery />} />

          {/* SQUAD ROUTES */}
          <Route path="/squad" element={<Players />} />
          <Route path="/squad/:id" element={<PlayerProfile />} />

          {/* MATCH CENTRE */}
          <Route path="/fixtures" element={<FixturesPage />} />

          {/* ADMIN PANEL */}
          <Route path="/admin" element={<AdminRoute />} />

          {/* INDIVIDUAL NEWS ARTICLE */}
          <Route path="/news/:id" element={<ArticleDetail />} />
        </Routes>
      </Suspense>

      {/* Bottom Brand Anchor */}
      <Footer />
      <Analytics />
    </BrowserRouter>
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
    standings: []
  });
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(sessionStorage.getItem('junda_jwt'))
  );
  const [collectionStatuses, setCollectionStatuses] = useState({
    news: 'idle',
    players: 'idle',
    gallery: 'idle',
    fixtures: 'idle',
    standings: 'idle'
  });
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setData({
        news: [],
        players: [],
        gallery: [],
        fixtures: [],
        standings: []
      });
      setCollectionStatuses({
        news: 'idle',
        players: 'idle',
        gallery: 'idle',
        fixtures: 'idle',
        standings: 'idle'
      });
      return undefined;
    }

    const controller = new AbortController();
    setCollectionStatuses({
      news: 'loading',
      players: 'loading',
      gallery: 'loading',
      fixtures: 'loading',
      standings: 'loading'
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
      API_BASE={API_BASE}
      collectionStatuses={collectionStatuses}
      onRetryData={() => setRetryCount(count => count + 1)}
      onAuthChange={authenticated => {
        setIsAuthenticated(authenticated);
        if (authenticated) setRetryCount(count => count + 1);
      }}
    />
  );
}
