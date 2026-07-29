// src/pages/Squad.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Squad({ players = [] }) {
  // Grouping players by category and role based on the new database schema
  const firstTeam = players.filter(p => p.role === 'player' && (p.squadCategory === 'First Team' || !p.squadCategory));
  const under17 = players.filter(p => p.role === 'player' && p.squadCategory === 'Under 17');
  const under13 = players.filter(p => p.role === 'player' && p.squadCategory === 'Under 13');
  const coachingStaff = players.filter(p => p.role === 'coach');

  // Helper placeholder fallback if no image was uploaded
  const placeholderImg = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop";

  // Reusable style for the "Glass" transparent effect on the cards
  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.4)', // Semi-transparent dark blue
    backdropFilter: 'blur(8px)',         // Blurs the background logo behind the card
    WebkitBackdropFilter: 'blur(8px)',   // Safari support
    border: '1px solid rgba(255, 255, 255, 0.05)', // Subtle glowing edge
  };

  // Reusable component for rendering a professional grid of players with their stats
  const PlayerGrid = ({ roster }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
      {roster.map(player => (
        <Link 
          to={`/squad/${player._id}`} 
          key={player._id} 
          style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
        >
          <div 
            style={{ 
              ...glassStyle,
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)', 
              display: 'flex', 
              flexDirection: 'column',
              height: '100%',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease'
            }}
            onMouseOver={e => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 12px 25px rgba(0,0,0,0.4)';
            }}
            onMouseOut={e => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }}
          >
            
            {/* Photo Header - 🎯 Fixed image cropping with objectFit cover and objectPosition top */}
            <div style={{ height: '280px', background: '#000', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
              <img 
                src={player.image || placeholderImg} 
                alt={player.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} 
              />
              
              {/* Jersey Number Overlay */}
              {player.jerseyNumber && (
                <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#2563eb', color: '#fff', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.4rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                  {player.jerseyNumber}
                </div>
              )}
            </div>

            {/* Player Info & Stats Block */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem', color: '#fff', fontWeight: '800' }}>{player.name}</h3>
              <p style={{ margin: '0 0 1rem 0', color: '#60a5fa', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{player.position}</p>
              
              {/* Extended Profile Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Age</div>
                  <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: '700' }}>{player.age || '-'}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Apps</div>
                  <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: '700' }}>{player.appearances || 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 'bold' }}>Goals</div>
                  <div style={{ fontSize: '0.95rem', color: '#e2e8f0', fontWeight: '700' }}>{player.goals || 0}</div>
                </div>
              </div>

              {/* Player Bio */}
              {player.bio && <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.5' }}>{player.bio}</p>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: '#f8fafc', 
      padding: '4rem 1rem',
      overflow: 'hidden'
    }}>
      
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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '4rem', ...glassStyle, padding: '3rem 1rem', borderRadius: '16px' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: '800', color: '#fff' }}>CLUB ROSTER</h1>
          <p style={{ margin: '0', color: '#94a3b8', fontSize: '1.1rem' }}>First Team and Youth Academy Squads</p>
        </div>

        {/* FIRST TEAM */}
        {firstTeam.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', borderBottom: '3px solid #3b82f6', paddingBottom: '0.5rem', marginBottom: '2rem' }}>First Team</h2>
            <PlayerGrid roster={firstTeam} />
          </>
        )}

        {/* UNDER 17 ACADEMY */}
        {under17.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', borderBottom: '3px solid #10b981', paddingBottom: '0.5rem', marginBottom: '2rem' }}>Under 17 Academy</h2>
            <PlayerGrid roster={under17} />
          </>
        )}

        {/* UNDER 13 ACADEMY */}
        {under13.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', borderBottom: '3px solid #f59e0b', paddingBottom: '0.5rem', marginBottom: '2rem' }}>Under 13 Academy</h2>
            <PlayerGrid roster={under13} />
          </>
        )}

        {/* COACHING STAFF */}
        {coachingStaff.length > 0 && (
          <>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', borderBottom: '3px solid #64748b', paddingBottom: '0.5rem', marginBottom: '2rem' }}>Coaching & Staff</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
              {coachingStaff.map(coach => (
                <div key={coach._id} style={{ ...glassStyle, borderRadius: '12px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#000', overflow: 'hidden', flexShrink: 0 }}>
                    <img src={coach.image || placeholderImg} alt={coach.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: '#fff' }}>{coach.name}</h3>
                    <p style={{ margin: 0, color: '#94a3b8', fontWeight: '600' }}>{coach.position}</p>
                    
                    {coach.contact && (
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#60a5fa', fontWeight: 'bold' }}>
                        ✉️ {coach.contact}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* EMPTY STATE */}
        {players.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
            Roster updates are currently being processed. Check back shortly.
          </div>
        )}
      </div>
    </div>
  );
}