// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="club-footer" style={{ background: '#1a202c', color: '#edf2f7', paddingTop: '4rem', paddingBottom: '2rem', marginTop: '5rem', borderTop: '4px solid #2b6cb0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2.5rem' }}>
        
        {/* BRAND COLUMN */}
        <div>
          <h3 style={{ color: '#fff', margin: '0 0 1rem 0', fontSize: '1.4rem', letterSpacing: '0.05em' }}>JUNDA UNITED FC</h3>
          <p style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Empowering youth talents across Mombasa County through elite football development, structural integrity, and deep community heritage.
          </p>
        </div>

        {/* CLUB NAVIGATION */}
        <div>
          <h4 style={{ color: '#2b6cb0', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: '1.2rem' }}>The Club</h4>
          <ul style={{ listStyle: 'none', padding: '0', margin: '0', fontSize: '0.95rem' }}>
            <li style={{ marginBottom: '0.6rem' }}><Link to="/" style={{ color: '#cbd5e0', textDecoration: 'none' }}>Latest News</Link></li>
            <li style={{ marginBottom: '0.6rem' }}><Link to="/squad" style={{ color: '#cbd5e0', textDecoration: 'none' }}>First Team Roster</Link></li>
            <li style={{ marginBottom: '0.6rem' }}><Link to="/gallery" style={{ color: '#cbd5e0', textDecoration: 'none' }}>Media Gallery</Link></li>
            <li style={{ marginBottom: '0.6rem' }}><Link to="/admin" style={{ color: '#cbd5e0', textDecoration: 'none' }}>Staff Portal</Link></li>
          </ul>
        </div>

        {/* MATCHDAY / FAN ZONE */}
        <div>
          <h4 style={{ color: '#2b6cb0', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: '1.2rem' }}>Matchday Hub</h4>
          <p style={{ color: '#cbd5e0', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>**Home Ground:** Junda Grounds, Mishomoroni</p>
          <p style={{ color: '#cbd5e0', fontSize: '0.9rem', margin: '0 0 0.5rem 0' }}>**Matches:** Coast Regional League fixtures</p>
          <span style={{ display: 'inline-block', marginTop: '0.5rem', padding: '0.25rem 0.75rem', background: '#2b6cb0', color: '#fff', fontSize: '0.75rem', borderRadius: '4px', fontWeight: 'bold' }}>
            #UpUnited
          </span>
        </div>

        {/* PARTNERS / COMMUNITY INTEGRATION */}
        <div>
          <h4 style={{ color: '#2b6cb0', textTransform: 'uppercase', fontSize: '0.85rem', letterSpacing: '0.1em', marginBottom: '1.2rem' }}>Community Pride</h4>
          <p style={{ color: '#a0aec0', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Interested in partnering or sponsoring Junda United FC initiatives? Reach out directly via our executive management desk.
          </p>
        </div>

      </div>

      {/* LOWER CREDITS STRIP */}
      <div style={{ maxWidth: '1200px', margin: '3rem auto 0 auto', padding: '1.5rem 1.5rem 0 1.5rem', borderTop: '1px solid #2d3748', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#718096' }}>
        <p style={{ margin: '0.5rem 0' }}>&copy; {currentYear} Junda United Football Club. All Rights Reserved.</p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Mombasa, Kenya</span>
          <span>Official Team Platform</span>
        </div>
      </div>
    </footer>
  );
}