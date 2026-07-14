// src/pages/Squad.jsx
import React from 'react';

export default function Squad({ players = [] }) {
  // 🎯 Grouping players by category and role based on the new database schema
  const firstTeam = players.filter(p => p.role === 'player' && (p.squadCategory === 'First Team' || !p.squadCategory));
  const under17 = players.filter(p => p.role === 'player' && p.squadCategory === 'Under 17');
  const under13 = players.filter(p => p.role === 'player' && p.squadCategory === 'Under 13');
  const coachingStaff = players.filter(p => p.role === 'coach');

  // Helper placeholder fallback if no image was uploaded
  const placeholderImg = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop";

  // 🎯 Reusable component for rendering a professional grid of players with their stats
  const PlayerGrid = ({ roster }) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem', marginBottom: '4rem' }}>
      {roster.map(player => (
        <div key={player._id} style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          
          {/* Photo Header */}
          <div style={{ height: '280px', background: '#f1f5f9', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
            <img src={player.image || placeholderImg} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            
            {/* Jersey Number Overlay */}
            {player.jerseyNumber && (
              <div style={{ position: 'absolute', top: '15px', right: '15px', background: '#1d4ed8', color: '#fff', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: '1.4rem', fontWeight: '900', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                {player.jerseyNumber}
              </div>
            )}
          </div>

          {/* Player Info & Stats Block */}
          <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem', color: '#0f172a', fontWeight: '800' }}>{player.name}</h3>
            <p style={{ margin: '0 0 1rem 0', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{player.position}</p>
            
            {/* Extended Profile Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Age</div>
                <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>{player.age || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Apps</div>
                <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>{player.appearances || 0}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Goals</div>
                <div style={{ fontSize: '0.95rem', color: '#0f172a', fontWeight: '700' }}>{player.goals || 0}</div>
              </div>
            </div>

            {/* Player Bio */}
            {player.bio && <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: '1.5' }}>{player.bio}</p>}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="page-container" style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '4rem', background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', padding: '3rem 1rem', borderRadius: '16px' }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', fontWeight: '800' }}>CLUB ROSTER</h1>
        <p style={{ margin: '0', color: '#94a3b8', fontSize: '1.1rem' }}>First Team and Youth Academy Squads</p>
      </div>

      {/* FIRST TEAM */}
      {firstTeam.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b', borderBottom: '3px solid #2563eb', paddingBottom: '0.5rem', marginBottom: '2rem' }}>First Team</h2>
          <PlayerGrid roster={firstTeam} />
        </>
      )}

      {/* UNDER 17 ACADEMY */}
      {under17.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b', borderBottom: '3px solid #10b981', paddingBottom: '0.5rem', marginBottom: '2rem' }}>Under 17 Academy</h2>
          <PlayerGrid roster={under17} />
        </>
      )}

      {/* UNDER 13 ACADEMY */}
      {under13.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b', borderBottom: '3px solid #f59e0b', paddingBottom: '0.5rem', marginBottom: '2rem' }}>Under 13 Academy</h2>
          <PlayerGrid roster={under13} />
        </>
      )}

      {/* COACHING STAFF */}
      {coachingStaff.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.8rem', color: '#1e293b', borderBottom: '3px solid #64748b', paddingBottom: '0.5rem', marginBottom: '2rem' }}>Coaching & Staff</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {coachingStaff.map(coach => (
              <div key={coach._id} style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', overflow: 'hidden', flexShrink: 0 }}>
                  <img src={coach.image || placeholderImg} alt={coach.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem', color: '#0f172a' }}>{coach.name}</h3>
                  <p style={{ margin: 0, color: '#64748b', fontWeight: '600' }}>{coach.position}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* EMPTY STATE */}
      {players.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
          Roster updates are currently being processed. Check back shortly.
        </div>
      )}
    </div>
  );
}