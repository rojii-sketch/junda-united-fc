// src/pages/FixturesPage.jsx
import React from 'react';

export default function FixturesPage({ fixtures }) {
  // Separate matches dynamically into Upcoming and Completed sections
  const upcomingMatches = fixtures.filter(m => m.status === 'Upcoming' || !m.status);
  const completedMatches = fixtures.filter(m => m.status === 'Completed');

  return (
    <div className="page-container" style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1rem', minHeight: '80vh' }}>
      
      {/* HERO HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '3.5rem', background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: '#fff', padding: '2.5rem 1rem', borderRadius: '16px', boxShadow: '0 4px 20px rgba(37,99,235,0.15)' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: '800', letterSpacing: '0.02em' }}>MATCH CENTRE</h1>
        <p style={{ margin: '0', fontSize: '1.1rem', color: '#bfdbfe', fontWeight: '500' }}>Follow Junda United FC’s Journey Across the Campaign</p>
      </div>

      {/* 🗓️ SECTION 1: UPCOMING FIXTURES */}
      <section style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.6rem', color: '#1e293b', borderLeft: '5px solid #2563eb', paddingLeft: '0.75rem', marginBottom: '1.5rem', letterSpacing: '0.03em' }}>
          Upcoming Fixtures
        </h2>
        
        {upcomingMatches.length === 0 ? (
          <div style={{ background: '#f8fafc', padding: '2.5rem', textAlign: 'center', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            No upcoming matches scheduled at the moment. Check back soon for updates from management!
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {upcomingMatches.map((match) => (
              <div key={match._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                
                {/* Match Identity & Date */}
                <div style={{ minWidth: '180px' }}>
                  <span style={{ display: 'inline-block', background: match.isHomeMatch ? '#dbeafe' : '#f1f5f9', color: match.isHomeMatch ? '#1e40af' : '#475569', fontSize: '0.75rem', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                    {match.isHomeMatch ? '🏠 Home' : '🚌 Away'}
                  </span>
                  <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '1.1rem' }}>{match.matchDate}</div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.15rem' }}>⏰ Kickoff: {match.kickoffTime}</div>
                </div>

                {/* Match Up Visual Banner */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1rem 0', flex: '1', justifyContent: 'center', minWidth: '280px' }}>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b', textAlign: 'right', width: '40%' }}>Junda United</div>
                  <div style={{ background: '#f1f5f9', color: '#1e3a8a', padding: '0.4rem 1rem', borderRadius: '20px', fontWeight: '800', fontSize: '0.9rem', letterSpacing: '0.05em' }}>VS</div>
                  <div style={{ fontWeight: '800', fontSize: '1.2rem', color: '#1e293b', textAlign: 'left', width: '40%' }}>{match.opponent}</div>
                </div>

                {/* Location Venue Details */}
                <div style={{ textAlign: 'right', minWidth: '160px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>📍 Stadium / Venue</div>
                  <div style={{ fontWeight: '600', color: '#334155', fontSize: '0.95rem', marginTop: '0.15rem' }}>{match.venue}</div>
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* 🏆 SECTION 2: RECENT RESULTS */}
      <section>
        <h2 style={{ fontSize: '1.6rem', color: '#1e293b', borderLeft: '5px solid #10b981', paddingLeft: '0.75rem', marginBottom: '1.5rem', letterSpacing: '0.03em' }}>
          Latest Results
        </h2>

        {completedMatches.length === 0 ? (
          <div style={{ background: '#f8fafc', padding: '2.5rem', textAlign: 'center', borderRadius: '12px', border: '1px dashed #cbd5e1', color: '#64748b' }}>
            No match results recorded in the portal yet.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.25rem' }}>
            {completedMatches.map((match) => {
              const isWin = match.jundaScore > match.opponentScore;
              const isDraw = match.jundaScore === match.opponentScore;
              
              return (
                <div key={match._id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden' }}>
                  
                  {/* Left Outcome Badge Indicator */}
                  <div style={{ position: 'absolute', left: '0', top: '0', bottom: '0', width: '5px', background: isWin ? '#10b981' : isDraw ? '#64748b' : '#ef4444' }} />

                  {/* Date and Location Context */}
                  <div style={{ minWidth: '150px', paddingLeft: '0.5rem' }}>
                    <div style={{ fontWeight: '600', color: '#475569', fontSize: '0.9rem' }}>{match.matchDate}</div>
                    <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.15rem' }}>{match.venue}</div>
                  </div>

                  {/* Scoreboard Block */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', margin: '1rem 0', flex: '1', justifyContent: 'center', minWidth: '300px' }}>
                    <div style={{ fontWeight: '700', fontSize: '1.15rem', color: '#0f172a', textAlign: 'right', width: '35%' }}>Junda United</div>
                    
                    {/* Floating Center Score Banner */}
                    <div style={{ display: 'flex', alignItems: 'center', background: '#0f172a', color: '#fff', borderRadius: '6px', padding: '0.4rem 1.2rem', gap: '0.75rem', fontWeight: '800', fontSize: '1.25rem', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                      <span style={{ color: isWin ? '#10b981' : '#fff' }}>{match.jundaScore}</span>
                      <span style={{ color: '#475569', fontSize: '0.9rem' }}>-</span>
                      <span>{match.opponentScore}</span>
                    </div>

                    <div style={{ fontWeight: '700', fontSize: '1.15rem', color: '#0f172a', textAlign: 'left', width: '35%' }}>{match.opponent}</div>
                  </div>

                  {/* Outcome Win/Loss Text Label */}
                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <span style={{ display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em', background: isWin ? '#ecfdf5' : isDraw ? '#f1f5f9' : '#fef2f2', color: isWin ? '#065f46' : isDraw ? '#334155' : '#991b1b' }}>
                      {isWin ? '🏆 Victory' : isDraw ? '🤝 Draw' : 'Defeat'}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}