// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { motion } from 'framer-motion'; // 🎯 NEW: Imported Framer motion for the Splash Screen

import Navbar from './components/Navbar';
import ArticleDetail from './pages/ArticleDetail';
import News from './pages/News';
import Footer from './components/Footer';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import './App.css';
import Players from './pages/Squad';
import FixturesPage from './pages/FixturesPage'; 
import PlayerProfile from './pages/PlayerProfile'; 

const API_BASE = import.meta.env.PROD 
  ? "https://junda-united-fc.onrender.com/api" 
  : "http://localhost:5000/api";

export default function App() {
  // 1. Initialize State 
  const [news, setNews] = useState([]);
  const [fixtures, setFixtures] = useState([]); 
  const [players, setPlayers] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [standings, setStandings] = useState([]); 
  
  // 🎯 NEW: Global Loading State
  const [isAppLoading, setIsAppLoading] = useState(true);

  // 2. Fetch all collections from MongoDB Atlas when the website mounts
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        // Fetch News Articles
        const newsRes = await fetch(`${API_BASE}/news`);
        if (newsRes.ok) {
          const newsData = await newsRes.json();
          setNews(newsData);
        }

        // Fetch Fixtures 
        const fixturesRes = await fetch(`${API_BASE}/fixtures`);
        if (fixturesRes.ok) {
          const fixturesData = await fixturesRes.json();
          setFixtures(fixturesData);
        }

        // Fetch Standings
        const standingsRes = await fetch(`${API_BASE}/standings`);
        if (standingsRes.ok) {
          const standingsData = await standingsRes.json();
          setStandings(standingsData);
        }

        // Fetch Players
        const playersRes = await fetch(`${API_BASE}/players`);
        if (playersRes.ok) {
          const playersData = await playersRes.json();
          setPlayers(playersData);
        }

        // Fetch Gallery
        const galleryRes = await fetch(`${API_BASE}/gallery`);
        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          setGallery(galleryData);
        }
      } catch (error) {
        console.error("❌ Error retrieving records from cloud database:", error);
      } finally {
        // 🎯 Turn off the loading screen whether the fetch succeeds OR fails
        setIsAppLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // 🎯 NEW: The Global Splash Screen
  if (isAppLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#fff' }}>
        
        {/* Pulsing Club Badge */}
        <motion.img
          src="/junda-logo.png"
          alt="Junda United Badge"
          initial={{ scale: 0.85, opacity: 0.7 }}
          animate={{ scale: 1.05, opacity: 1 }}
          transition={{ repeat: Infinity, duration: 1.2, direction: 'alternate', ease: 'easeInOut' }}
          style={{ width: '180px', marginBottom: '2rem' }}
        />
        
        {/* Fading Title */}
        <motion.h2 
          initial={{ opacity: 0.3 }} 
          animate={{ opacity: 1 }} 
          transition={{ repeat: Infinity, duration: 1.2, direction: "alternate" }}
          style={{ margin: 0, letterSpacing: '3px', fontSize: '1.5rem', fontWeight: '800' }}
        >
          JUNDA UNITED FC
        </motion.h2>
        
        {/* Context Text for the User */}
        <p style={{ color: '#64748b', marginTop: '1rem', fontSize: '0.95rem', fontWeight: '500' }}>
          Warming up the stadium servers...
        </p>
      </div>
    );
  }

  // 🎯 Once data is loaded, render the actual app
  return (
    <BrowserRouter>
      {/* Top Header Strip */}
      <Navbar /> 

      <Routes>
        <Route path="/" element={<News news={news} />} />
        <Route path="/gallery" element={<Gallery gallery={gallery} />} />
        
        {/* SQUAD ROUTES */}
        <Route path="/squad" element={<Players players={players} />} />
        <Route path="/squad/:id" element={<PlayerProfile players={players} />} />
        
        {/* MATCH CENTRE */}
        <Route path="/fixtures" element={<FixturesPage fixtures={fixtures} standings={standings} />} />
        
        {/* ADMIN PANEL */}
        <Route 
          path="/admin" 
          element={
            <Admin 
              news={news} 
              setNews={setNews} 
              players={players} 
              setPlayers={setPlayers} 
              gallery={gallery} 
              setGallery={setGallery}
              fixtures={fixtures}
              setFixtures={setFixtures} 
              standings={standings}
              setStandings={setStandings}
              API_BASE={API_BASE}
            />
          } 
        />
        
        {/* INDIVIDUAL NEWS ARTICLE */}
        <Route path="/news/:id" element={<ArticleDetail news={news} />} />
      </Routes>

      {/* Bottom Brand Anchor */}
      <Footer />
      <Analytics />
    </BrowserRouter>
  );
}