// src/components/Navbar.jsx
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import clubLogo from '../assets/logo.png'; // Imports the local logo file

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // 🎯 Helper function to smooth-scroll down to the standings table element
  const scrollToStandings = () => {
    setIsOpen(false); // Close mobile menu on click
    // Give the page a tiny fraction of a second to load the route first
    setTimeout(() => {
      const element = document.getElementById('standings');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Glassmorphism styling matching your other pages
  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.85)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  };

  return (
    <nav className="navbar" style={{ 
      position: 'sticky', 
      top: 0, 
      zIndex: 1000, 
      ...glassStyle,
      padding: '0.75rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Brand Logo & Title */}
        <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={clubLogo} alt="Junda United FC Logo" className="club-logo-img" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
          <h1 style={{ fontSize: '1.2rem', margin: 0, color: '#fff', fontWeight: '800', letterSpacing: '0.03em' }}>Junda United FC</h1>
        </div>

        {/* Desktop Links */}
        <div className="nav-links desktop-links" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            News
          </NavLink>
          
          <NavLink to="/fixtures" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            Fixtures
          </NavLink>

          <NavLink 
            to="/fixtures" 
            onClick={scrollToStandings}
            className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
          >
            Standings
          </NavLink>

          <NavLink to="/gallery" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            Gallery
          </NavLink>
          
          <NavLink to="/squad" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            Squad
          </NavLink>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="hamburger-btn"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            fontSize: '1.5rem',
            padding: '0.4rem 0.6rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'none', // Controlled via media queries below
          }}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? '✕' : '☰'}
        </button>

      </div>

      {/* Mobile Dropdown Menu Links */}
      {isOpen && (
        <div className="nav-links mobile-links" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          padding: '1rem 0 0.5rem 0',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          marginTop: '0.75rem',
          width: '100%',
        }}>
          <NavLink to="/" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            News
          </NavLink>
          <NavLink to="/fixtures" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            Fixtures
          </NavLink>
          <NavLink to="/fixtures" onClick={scrollToStandings} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            Standings
          </NavLink>
          <NavLink to="/gallery" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            Gallery
          </NavLink>
          <NavLink to="/squad" onClick={() => setIsOpen(false)} className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
            Squad
          </NavLink>
        </div>
      )}

      {/* Responsive Media Query Helper */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-links { display: none !important; }
          .hamburger-btn { display: block !important; }
          .mobile-links .nav-item {
            display: block;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            background: rgba(15, 23, 42, 0.5);
            text-decoration: none;
            color: #cbd5e1;
            font-weight: 600;
          }
          .mobile-links .nav-item.active {
            background: rgba(59, 130, 246, 0.3);
            color: #fff;
          }
        }
      `}</style>
    </nav>
  );
}