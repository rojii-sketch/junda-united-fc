// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import News from './pages/News';
import Gallery from './pages/Gallery';
import Squad from './pages/Squad';
import Admin from './pages/Admin';
import './App.css';

// Import our initial mock collections
import { initialNews, initialPlayers, initialGallery } from './data/initialData';

export default function App() {
  // 1. Initialize State (Checks localStorage first; falls back to initialData)
  const [news, setNews] = useState(() => {
    const saved = localStorage.getItem('fc_news');
    return saved ? JSON.parse(saved) : initialNews;
  });

  const [players, setPlayers] = useState(() => {
    const saved = localStorage.getItem('fc_players');
    return saved ? JSON.parse(saved) : initialPlayers;
  });

  const [gallery, setGallery] = useState(() => {
    const saved = localStorage.getItem('fc_gallery');
    return saved ? JSON.parse(saved) : initialGallery;
  });

  // 2. Sync with LocalStorage whenever state arrays change
  useEffect(() => {
    localStorage.setItem('fc_news', JSON.stringify(news));
  }, [news]);

  useEffect(() => {
    localStorage.setItem('fc_players', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('fc_gallery', JSON.stringify(gallery));
  }, [gallery]);

  return (
    <BrowserRouter>
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* 3. Pass data down to public pages as props */}
          <Route path="/" element={<News news={news} />} />
          <Route path="/gallery" element={<Gallery gallery={gallery} />} />
          <Route path="/squad" element={<Squad players={players} />} />
          
          {/* Pass data AND setters to the Admin panel so it can update them */}
          <Route 
            path="/admin" 
            element={
              <Admin 
                news={news} setNews={setNews}
                players={players} setPlayers={setPlayers}
                gallery={gallery} setGallery={setGallery}
              />
            } 
          />
        </Routes>
      </main>
    </BrowserRouter>
  );
}