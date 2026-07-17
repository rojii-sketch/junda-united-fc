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
            
            <li>
              <a href="https://web.facebook.com/profile.php?id=100063770437523&sk=directory_links" target="_blank" rel="noopener noreferrer" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }} onMouseOver={e => e.target.style.color='#fff'} onMouseOut={e => e.target.style.color='#94a3b8'}>
                {/* 🎯 Inserted the Facebook SVG Icon here */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
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