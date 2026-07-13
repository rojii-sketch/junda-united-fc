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
import Players from './pages/Squad';
import FixturesPage from './pages/FixturesPage'; // 🎯 We'll create this public page next!

const API_BASE = import.meta.env.PROD 
  ? "https://junda-united-fc.onrender.com/api" 
  : "http://localhost:5000/api";

export default function App() {
  // 1. Initialize State with empty arrays (Waiting for Cloud Data)
  const [news, setNews] = useState([]);
  const [fixtures, setFixtures] = useState([]); // ✓ State declared perfectly
  const [players, setPlayers] = useState([]);
  const [gallery, setGallery] = useState([]);

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

        // 🎯 FIX 1: Fetch Fixtures data from cloud database
        const fixturesRes = await fetch(`${API_BASE}/fixtures`);
        if (fixturesRes.ok) {
          const fixturesData = await fixturesRes.json();
          setFixtures(fixturesData);
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
        
        {/* 🎯 FIX 2: Public Route to view the fixture lineup */}
        <Route path="/fixtures" element={<FixturesPage fixtures={fixtures} />} />
        
        {/* 🎯 FIX 3: Pass fixture hooks to Admin so forms can trigger updates */}
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