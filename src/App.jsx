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
  const [status, setStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      fetchJson('/news', controller.signal),
      fetchJson('/players', controller.signal),
      fetchJson('/gallery', controller.signal),
      fetchJson('/fixtures', controller.signal),
      fetchJson('/standings', controller.signal)
    ])
      .then(([news, players, gallery, fixtures, standings]) => {
        setData({ news, players, gallery, fixtures, standings });
        setStatus('success');
      })
      .catch((requestError) => {
        if (requestError.name === 'AbortError') return;
        console.error('Error retrieving admin records:', requestError);
        setStatus('error');
      });

    return () => controller.abort();
  }, [retryCount]);

  if (status === 'loading') {
    return <RouteMessage message="Loading admin records..." />;
  }

  if (status === 'error') {
    return (
      <RouteMessage
        message="Unable to load admin records."
        action={() => {
          setStatus('loading');
          setRetryCount(count => count + 1);
        }}
      />
    );
  }

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
    />
  );
}

function RouteMessage({ message, action }) {
  return (
    <div className="page-container" style={{ textAlign: 'center', marginTop: '5rem' }}>
      <p>{message}</p>
      {action && (
        <button type="button" className="submit-btn" onClick={action}>
          Try again
        </button>
      )}
    </div>
  );
}