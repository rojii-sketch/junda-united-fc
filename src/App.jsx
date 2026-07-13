// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import ArticleDetail from './pages/ArticleDetail';
import News from './pages/News';
import Footer from './components/Footer';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import './App.css';
import Standing from './models/Standing.js'; // 🎯 CRITICAL: Ensure '.js' is included!
import Players from './pages/Squad';
import FixturesPage from './pages/FixturesPage'; 

const API_BASE = import.meta.env.PROD 
  ? "https://junda-united-fc.onrender.com/api" 
  : "http://localhost:5000/api";

export default function App() {
  // 1. Initialize State with empty arrays (Waiting for Cloud Data)
  const [news, setNews] = useState([]);
  const [fixtures, setFixtures] = useState([]); 
  const [players, setPlayers] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [standings, setStandings] = useState([]); // 🎯 NEW: Dynamic Standings state tracking node

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

        // Fetch Fixtures data from cloud database
        const fixturesRes = await fetch(`${API_BASE}/fixtures`);
        if (fixturesRes.ok) {
          const fixturesData = await fixturesRes.json();
          setFixtures(fixturesData);
        }

        // 🎯 NEW: Fetch dynamic live standings rows from backend
        const standingsRes = await fetch(`${API_BASE}/standings`);
        if (standingsRes.ok) {
          const standingsData = await standingsRes.json();
          setStandings(standingsData);
        }

        // Fetch Players/Squad
        const playersRes = await fetch(`${API_BASE}/players`);
        if (playersRes.ok) {
          const playersData = await playersRes.json();
          setPlayers(playersData);
        }

        // Fetch Gallery Assets
        const galleryRes = await fetch(`${API_BASE}/gallery`);
        if (galleryRes.ok) {
          const galleryData = await galleryRes.json();
          setGallery(galleryData);
        }
      } catch (error) {
        console.error("❌ Error retrieving records from cloud database:", error);
      }
    };

    fetchAllData();
  }, []);

  return (
    <BrowserRouter>
      {/* Top Header Strip */}
      <Navbar /> 

      <Routes>
        <Route path="/" element={<News news={news} />} />
        <Route path="/gallery" element={<Gallery gallery={gallery} />} />
        <Route path="/squad" element={<Players players={players} />} />
        
        {/* 🎯 UPDATE: Pass live standings down to the public Match Centre screen */}
        <Route path="/fixtures" element={<FixturesPage fixtures={fixtures} standings={standings} />} />
        
        {/* 🎯 UPDATE: Pass standing hooks to Admin so submission inputs affect data */}
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
        
        <Route path="/news/:id" element={<ArticleDetail news={news} />} />
      </Routes>

      {/* Bottom Brand Anchor */}
      <Footer />
      <Analytics />
    </BrowserRouter>
  );
}