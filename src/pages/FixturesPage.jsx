// src/pages/FixturesPage.jsx
import React from 'react';
import StandingsTable from '../components/StandingsTable';
import { motion } from 'framer-motion';

export default function FixturesPage({ fixtures, standings }) {
  const upcomingMatches = fixtures.filter(m => m.status === 'Upcoming' || !m.status);
  const completedMatches = fixtures.filter(m => m.status === 'Completed');

  // Reusable style for the "Glass" transparent effect
  const glassStyle = {
    background: 'rgba(30, 41, 59, 0.4)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  };

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

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HERO HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem', ...glassStyle, padding: '2.5rem 1rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: '800', letterSpacing: '0.02em', color: '#fff' }}>MATCH CENTRE</h1>
          <p style={{ margin: '0', fontSize: '1.1rem', color: '#94a3b8', fontWeight: '500' }}>Follow Junda United FC’s Journey Across the Campaign</p>
        </div>

        {/* 🗓️ SECTION 1: UPCOMING FIXTURES */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#fff', borderLeft: '5px solid #3b82f6', paddingLeft: '0.75rem', marginBottom: '1.5rem', letterSpacing: '0.03em' }}>
            Upcoming Fixtures
          </h2>
          
          {upcomingMatches.length === 0 ? (
            <div style={{ ...glassStyle, padding: '2.5rem', textAlign: 'center', borderRadius: '12px', color: '#94a3b8' }}>
              No upcoming matches scheduled at the moment. Check back soon for updates from management!
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {upcomingMatches.map((match) => (
                <div key={match._id} style={{ ...glassStyle, borderRadius: '12px', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  
                  {/* Match Identity & Date */}
                  <div style={{ minWidth: '180px' }}>
                    <span style={{ display: 'inline-block', background: match.isHomeMatch ? 'rgba(59, 130, 246, 0.2)' : 'rgba(100, 116, 139, 0.2)', color: match.isHomeMatch ? '#60a5fa' : '#94a3b8', fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                      {match.isHomeMatch ? '🏠 Home' : '🚌 Away'}
                    </span>
                    <div style={{ fontWeight: '700', color: '#fff', fontSize: '1.1rem' }}>{match.matchDate}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.15rem' }}>⏰ Kickoff: {match.kickoffTime}</div>
                  </div>

                  {/* Match Up Visual Banner */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1rem 0', flex: '1', justifyContent: 'center', minWidth: '280px' }}>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#e2e8f0', textAlign: 'right', width: '40%' }}>Junda United</div>
                    <div style={{ background: 'rgba(15, 23, 42, 0.6)', color: '#60a5fa', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.05em', border: '1px solid rgba(255,255,255,0.05)' }}>VS</div>
                    <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#e2e8f0', textAlign: 'left', width: '40%' }}>{match.opponent}</div>
                  </div>

                  {/* Location Venue Details */}
                  <div style={{ textAlign: 'right', minWidth: '160px' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: '500' }}>📍 Stadium / Venue</div>
                    <div style={{ fontWeight: '600', color: '#cbd5e1', fontSize: '0.95rem', marginTop: '0.15rem' }}>{match.venue}</div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </section>

        {/* 🏆 SECTION 2: RECENT RESULTS */}
        <section style={{ marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#fff', borderLeft: '5px solid #10b981', paddingLeft: '0.75rem', marginBottom: '1.5rem', letterSpacing: '0.03em' }}>
            Latest Results
          </h2>

          {completedMatches.length === 0 ? (
            <div style={{ ...glassStyle, padding: '2.5rem', textAlign: 'center', borderRadius: '12px', color: '#94a3b8' }}>
              No match results recorded in the portal yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1.25rem' }}>
              {completedMatches.map((match) => {
                const isWin = match.jundaScore > match.opponentScore;
                const isDraw = match.jundaScore === match.opponentScore;
                
                return (
                  <div key={match._id} style={{ ...glassStyle, borderRadius: '12px', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', position: 'relative', overflow: 'hidden' }}>
                    
                    {/* Left Outcome Badge Indicator */}
                    <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '5px', background: isWin ? '#10b981' : isDraw ? '#64748b' : '#ef4444' }} />

                    {/* Date and Location Context */}
                    <div style={{ minWidth: '150px', paddingLeft: '0.5rem' }}>
                      <div style={{ fontWeight: '600', color: '#cbd5e1', fontSize: '0.9rem' }}>{match.matchDate}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.15rem' }}>{match.venue}</div>
                    </div>

                    {/* Scoreboard Block */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1rem 0', flex: '1', justifyContent: 'center', minWidth: '300px' }}>
                      <div style={{ fontWeight: '700', fontSize: '1.15rem', color: '#e2e8f0', textAlign: 'right', width: '35%' }}>Junda United</div>
                      
                      {/* Floating Center Score Banner */}
                      <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.8)', color: '#fff', borderRadius: '6px', padding: '0.4rem 1.2rem', gap: '0.75rem', fontWeight: '800', fontSize: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
                        <span style={{ color: isWin ? '#10b981' : '#fff' }}>{match.jundaScore}</span>
                        <span style={{ color: '#64748b', fontSize: '0.9rem' }}>-</span>
                        <span>{match.opponentScore}</span>
                      </div>

                      <div style={{ fontWeight: '700', fontSize: '1.15rem', color: '#e2e8f0', textAlign: 'left', width: '35%' }}>{match.opponent}</div>
                    </div>

                    {/* Outcome Win/Loss Text Label */}
                    <div style={{ textAlign: 'right', minWidth: '120px' }}>
                      <span style={{ display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', background: isWin ? 'rgba(16, 185, 129, 0.2)' : isDraw ? 'rgba(100, 116, 139, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: isWin ? '#34d399' : isDraw ? '#cbd5e1' : '#f87171', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {isWin ? '🏆 Victory' : isDraw ? '🤝 Draw' : 'Defeat'}
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 🎯 Standings Section */}
        <section id="standings" style={{ marginTop: '4rem', scrollMarginTop: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#fff', borderLeft: '5px solid #3b82f6', paddingLeft: '0.75rem', marginBottom: '1.5rem', letterSpacing: '0.03em' }}>
            League Standings
          </h2>
          <StandingsTable standings={standings} />
        </section>

      </div>
    </div>
  );
}