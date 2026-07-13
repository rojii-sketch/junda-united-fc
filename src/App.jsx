// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ArticleDetail from './pages/ArticleDetail';
import News from './pages/News';
import Gallery from './pages/Gallery';
import Admin from './pages/Admin';
import './App.css';
import Players from './pages/Squad';
const API_BASE = import.meta.env.PROD 
  ? "https://junda-united-fc.onrender.com/api" 
  : "http://localhost:5000/api";
export default function App() {
  // 1. Initialize State with empty arrays (Waiting for Cloud Data)
  const [news, setNews] = useState([]);
  const [players, setPlayers] = useState([]);
  const [gallery, setGallery] = useState([]);

  const API_BASE = "http://localhost:5000/api";

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
      {/* Your Navbar stays visible on every single page layout */}
      <Navbar /> 

      {/* The Routes container controls which component renders based on the URL */}
      <Routes>
        <Route path="/" element={<News news={news} />} />
        <Route path="/gallery" element={<Gallery gallery={gallery} />} />
        <Route path="/squad" element={<Players players={players} />} />
        
        {/* Pass API_BASE down to Admin so its forms can send POST and DELETE network requests */}
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
              API_BASE={API_BASE}
            />
          } 
        />
        
        {/* DYNAMIC ROUTE FOR DETAILED ARTICLES */}
        <Route path="/news/:id" element={<ArticleDetail news={news} />} />
      </Routes>
    </BrowserRouter>
  );
}