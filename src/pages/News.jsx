// src/pages/News.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

export default function News({ news }) {
  
  // 🎯 1. The Smart Share Logic
  const handleShare = async (e, articleId, articleTitle) => {
    e.preventDefault(); // 🛑 Crucial: Stops the click from triggering the <Link> wrapper
    
    const articleUrl = `${window.location.origin}/news/${articleId}`;

    if (navigator.share) {
      // Mobile: Native share menu
      try {
        await navigator.share({
          title: articleTitle,
          text: `Check out this update from Junda United FC!\n\n${articleTitle}`,
          url: articleUrl,
        });
      } catch (error) {
        console.log('User cancelled share');
      }
    } else {
      // Desktop: Fallback to WhatsApp Web
      const message = `Check out this update from Junda United FC!\n\n${articleTitle}\n${articleUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  // Reusable style for the "Glass" transparent effect
  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  };

  if (news.length === 0) {
    return (
      <div style={{ position: 'relative', minHeight: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', padding: '4rem 1rem', overflow: 'hidden' }}>
        <SEO 
          title="News & Updates" 
          description="Latest match reports, club announcements, and squad news from Junda United FC."
        />
        {/* Background Watermark */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
          animate={{ opacity: 0.15, scale: 1, x: '-50%', y: '-50%' }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            width: '85vw',
            maxWidth: '800px',
            height: '85vh',
            backgroundImage: 'url("/junda-logo.png")', 
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            zIndex: 0,
            pointerEvents: 'none'
          }}
        />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '800px', margin: '4rem auto', ...glassStyle, padding: '3rem', borderRadius: '16px' }}>
          <h2 style={{ color: '#fff', fontSize: '1.8rem', marginBottom: '0.5rem' }}>No news posted yet.</h2>
          <p style={{ color: '#94a3b8' }}>Check back later for match updates and official announcements from Junda United FC!</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: '#f8fafc', 
      padding: '4rem 1rem',
      overflow: 'hidden'
    }}>
      <SEO 
        title="News & Updates" 
        description="Latest match reports, club announcements, and squad news from Junda United FC."
      />
      
      {/* 🎯 Club Logo Background Watermark */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
        animate={{ opacity: 0.15, scale: 1, x: '-50%', y: '-50%' }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          width: '85vw',
          maxWidth: '800px',
          height: '85vh',
          backgroundImage: 'url("/junda-logo.png")', 
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HERO HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem', ...glassStyle, padding: '2.5rem 1rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: '800', letterSpacing: '0.02em', color: '#fff' }}>LATEST CLUB NEWS</h1>
          <p style={{ margin: '0', fontSize: '1.1rem', color: '#94a3b8', fontWeight: '500' }}>Stay up to date with fixtures, match reports, and announcements from Junda United FC.</p>
        </div>

        {/* NEWS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {news.map((item) => (
            <Link to={`/news/${item._id}`} key={item._id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
              <div style={{ ...glassStyle, borderRadius: '12px', overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                   onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)'; }}
                   onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)'; }}
              >
                {item.imageUrl && (
                  <div style={{ width: '100%', height: '200px', overflow: 'hidden', backgroundColor: 'rgba(15, 23, 42, 0.5)' }}>
                    <img src={item.imageUrl} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: '1' }}>
                  <span style={{ fontSize: '0.8rem', color: '#60a5fa', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'inline-block' }}>{item.date}</span>
                  <h3 style={{ margin: '0 0 0.75rem 0', color: '#fff', fontSize: '1.25rem', lineHeight: '1.4' }}>{item.title}</h3>
                  
                  <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5', flex: '1', marginBottom: '1.5rem' }}>
                    {item.content.length > 120 ? `${item.content.substring(0, 120)}...` : item.content}
                  </p>
                  
                  {/* Footer link and button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      Read Full Article →
                    </span>
                    
                    <button 
                      onClick={(e) => handleShare(e, item._id, item.title)}
                      style={{
                        backgroundColor: 'rgba(15, 23, 42, 0.6)',
                        color: '#f8fafc',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.6)'}
                    >
                      🔗 Share
                    </button>
                  </div>

                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </div>
  );
}