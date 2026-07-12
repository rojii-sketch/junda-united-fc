// src/pages/Squad.jsx
import React from 'react';

export default function Squad({ players = [] }) {
  // Filter members dynamically by their database classification tags
  const coaches = players.filter(p => p.role === 'coach');
  const firstTeam = players.filter(p => p.role === 'player');
  const supportStaff = players.filter(p => p.role === 'staff');

  // Helper placeholder fallback if no image was uploaded
  const placeholderImg = "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=300&auto=format&fit=crop";

  return (
    <div className="page-container">
      <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2>Junda United Club Roster</h2>
        <p>Meet the players, technical bench, and management guiding our squad forward.</p>
      </header>

      {/* 📋 TECHNICAL BENCH SECTION */}
      {coaches.length > 0 && (
        <section className="squad-section" style={{ marginBottom: '4rem' }}>
          <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#2b6cb0' }}>
            Technical Bench & Leadership
          </h3>
          <div className="squad-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
            {coaches.map(member => (
              <div key={member._id} className="squad-card" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', textAlign: 'center', border: '1px solid #edf2f7' }}>
                <img src={member.image || placeholderImg} alt={member.name} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ margin: '0.25rem 0' }}>{member.name}</h4>
                  <p style={{ margin: '0', color: '#718096', fontSize: '0.9rem', fontWeight: '500' }}>{member.position}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ⚽ FIRST TEAM PLAYERS SECTION */}
      <section className="squad-section" style={{ marginBottom: '4rem' }}>
        <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#2b6cb0' }}>
          First Team Roster
        </h3>
        {firstTeam.length === 0 ? (
          <p style={{ color: '#a0aec0', italic: 'true' }}>No active squad players registered in database collection yet.</p>
        ) : (
          <div className="squad-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
            {firstTeam.map(player => (
              <div key={player._id} className="squad-card" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', position: 'relative', border: '1px solid #edf2f7' }}>
                {player.jerseyNumber && (
                  <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(43, 108, 176, 0.9)', color: '#fff', padding: '0.25rem 0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    #{player.jerseyNumber}
                  </div>
                )}
                <img src={player.image || placeholderImg} alt={player.name} style={{ width: '100%', height: '260px', objectFit: 'cover' }} />
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                  <h4 style={{ margin: '0.25rem 0' }}>{player.name}</h4>
                  <p style={{ margin: '0', color: '#4a5568', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{player.position}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 💼 SUPPORT STAFF SECTION */}
      {supportStaff.length > 0 && (
        <section className="squad-section">
          <h3 style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1.5rem', color: '#2b6cb0' }}>
            Medical & Support Operations
          </h3>
          <div className="squad-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '2rem' }}>
            {supportStaff.map(member => (
              <div key={member._id} className="squad-card" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', textAlign: 'center', border: '1px solid #edf2f7' }}>
                <img src={member.image || placeholderImg} alt={member.name} style={{ width: '100%', height: '240px', objectFit: 'cover' }} />
                <div style={{ padding: '1rem' }}>
                  <h4 style={{ margin: '0.25rem 0' }}>{member.name}</h4>
                  <p style={{ margin: '0', color: '#718096', fontSize: '0.9rem' }}>{member.position}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}