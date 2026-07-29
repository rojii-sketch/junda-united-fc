import React from 'react';
import { useParams, Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

export default function PlayerProfile({ players }) {
  const { id } = useParams();
  const player = players.find(p => p._id === id);

  if (!player) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a', color: '#fff' }}>
        <motion.h2 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ repeat: Infinity, duration: 1, direction: "alternate" }}
        >
          Loading Player Profile...
        </motion.h2>
      </div>
    );
  }

  const placeholderImg = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=500&auto=format&fit=crop";

  // Reusable style for the "Glass" transparent effect on the data cards
  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.4)', // Semi-transparent dark blue
    backdropFilter: 'blur(8px)',         // Blurs the background logo behind the card
    WebkitBackdropFilter: 'blur(8px)',   // Safari support
    border: '1px solid rgba(255, 255, 255, 0.05)', // Subtle glowing edge
  };

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', // Keeps the base dark
      color: '#f8fafc', 
      padding: '4rem 1rem',
      overflow: 'hidden'
    }}>
      <SEO title={`${player.name} - Profile`} description={`Official player profile for ${player.name}, Junda United FC.`} />

      {/* 🎯 ANIMATION 1: The Background Logo is now centered, larger, and fixed in place */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
        animate={{ opacity: 0.15, scale: 1, x: '-50%', y: '-50%' }} // Increased opacity slightly
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          position: 'fixed', // Stays in place even if the user scrolls
          top: '50%',
          left: '50%',
          width: '85vw', // Responsive width based on screen size
          maxWidth: '800px',
          height: '85vh',
          // 🎯 UPDATED: Points exactly to the logo in your public folder
          backgroundImage: 'url("/junda-logo.png")', 
          backgroundSize: 'contain',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto' }}>
        
        <Link to="/squad" style={{ color: '#60a5fa', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block', fontWeight: 'bold' }}>
          ← Back to Squad
        </Link>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '4rem', 
          alignItems: 'start' 
        }}>
          
          {/* ANIMATION 2: Player Photo slides in smoothly from the left */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ 
              borderRadius: '16px', 
              overflow: 'hidden', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <img 
              src={player.image || player.imageUrl || placeholderImg} 
              alt={player.name} 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'cover' }} 
            />
          </motion.div>

          {/* ANIMATION 3: Player Details slide up from the bottom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
          >
            {/* Header: Name and Number */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', borderBottom: '2px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '3rem', margin: 0, color: '#fff', lineHeight: '1.1' }}>{player.name}</h1>
              {player.jerseyNumber && (
                <span style={{ fontSize: '3rem', color: '#3b82f6', fontWeight: '900' }}>#{player.jerseyNumber}</span>
              )}
            </div>

            {/* Stats Grid - 🎯 Applied Glassmorphism styling */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div style={{ ...glassStyle, padding: '1rem', borderRadius: '8px' }}>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Position</span>
                <strong style={{ fontSize: '1.2rem', color: '#e2e8f0' }}>{player.position || 'N/A'}</strong>
              </div>
              <div style={{ ...glassStyle, padding: '1rem', borderRadius: '8px' }}>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Age</span>
                <strong style={{ fontSize: '1.2rem', color: '#e2e8f0' }}>{player.age || '-'}</strong>
              </div>
              <div style={{ ...glassStyle, padding: '1rem', borderRadius: '8px' }}>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Appearances</span>
                <strong style={{ fontSize: '1.2rem', color: '#e2e8f0' }}>{player.appearances || '0'}</strong>
              </div>
              <div style={{ ...glassStyle, padding: '1rem', borderRadius: '8px' }}>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Goals</span>
                <strong style={{ fontSize: '1.2rem', color: '#e2e8f0' }}>{player.goals || '0'}</strong>
              </div>
            </div>

            {/* Biography - 🎯 Applied Glassmorphism styling */}
            {player.bio && (
              <div style={{ ...glassStyle, padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid #3b82f6' }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#fff' }}>About the Player</h3>
                <p style={{ color: '#cbd5e1', lineHeight: '1.7', margin: 0, fontSize: '1.05rem', whiteSpace: 'pre-wrap' }}>
                  {player.bio}
                </p>
              </div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}