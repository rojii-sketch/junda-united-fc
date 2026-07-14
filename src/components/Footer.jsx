// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: '#0f172a', color: '#f8fafc', padding: '3rem 1rem 1.5rem 1rem', marginTop: '4rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', borderBottom: '1px solid #334155', paddingBottom: '2rem', marginBottom: '1.5rem' }}>
        
        {/* Brand Column */}
        <div>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.4rem', color: '#bfdbfe' }}>Junda United FC</h3>
          <p style={{ color: '#94a3b8', lineHeight: '1.6', fontSize: '0.9rem' }}>
            Pride of Mishomoroni. Forging talent, discipline, and community spirit on and off the pitch.
          </p>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '0.05em' }}>Explore</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <li><Link to="/" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='#94a3b8'}>Club News</Link></li>
            <li><Link to="/fixtures" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='#94a3b8'}>Match Centre</Link></li>
            <li><Link to="/squad" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='#94a3b8'}>First Team Squad</Link></li>
            <li><Link to="/gallery" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='#94a3b8'}>Media Gallery</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '0.05em' }}>Contact Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            <li>📍 Junda Grounds, Mishomoroni</li>
            <li>📧 jundaunited6@gmail.com</li>
            <li>📞 +254 798 924 762</li>
          </ul>
        </div>

        {/* 🎯 NEW: Social Media Column */}
        <div>
          <h4 style={{ margin: '0 0 1rem 0', color: '#fff', textTransform: 'uppercase', fontSize: '0.95rem', letterSpacing: '0.05em' }}>Follow Us</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            
            {/*YOUR_FACEBOOK_LINK_HERE with your actual URL (e.g. "https://facebook.com/jundaunited") */}
            <li>
              <a href="https://web.facebook.com/profile.php?id=100063770437523&sk=directory_links" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='#94a3b8'}>
                📘 Facebook
              </a>
            </li>

            {/* YOUR_X_LINK_HERE with your actual URL 
            <li>
              <a href="YOUR_X_LINK_HERE" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='#94a3b8'}>
                𝕏 X (Twitter)
              </a>
            </li>
            */}
            {/* Replace YOUR_INSTAGRAM_LINK_HERE with your actual URL 
            <li>
              <a href="YOUR_INSTAGRAM_LINK_HERE" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='#94a3b8'}>
                📸 Instagram
              </a>
            </li>
            */}
          </ul>
        </div>
      </div>

      <div style={{ textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>
        &copy; {year} Junda United Football Club. All rights reserved.
      </div>
    </footer>
  );
}