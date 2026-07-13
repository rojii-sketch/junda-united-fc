// src/components/StandingsTable.jsx
import React from 'react';

// 🎯 FIX 1: Accept the standings prop passed from FixturesPage or News
export default function StandingsTable({ standings = [] }) {
  
  // 🎯 FIX 2: Check if there's no data yet, show loading instead of crashing
  if (standings.length === 0) {
    return (
      <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '3rem', textAlign: 'center', color: '#64748b' }}>
        ⏳ Loading official league standings from the cloud...
      </div>
    );
  }

  return (
    <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', overflowX: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '0.75rem' }}>
        <div>
          <h3 style={{ margin: '0', color: '#0f172a', fontSize: '1.3rem', fontWeight: '800' }}>FKF MOMBASA COUNTY LEAGUE</h3>
          <p style={{ margin: '0.2rem 0 0 0', color: '#64748b', fontSize: '0.85rem', fontWeight: '500' }}>Official Standings — Group D Campaign</p>
        </div>
        <span style={{ background: '#ecfdf5', color: '#065f46', fontSize: '0.75rem', fontWeight: 'bold', padding: '0.35rem 0.75rem', borderRadius: '20px' }}>
          Live Updates Active
        </span>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.95rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#475569', fontWeight: '700', fontSize: '0.85rem', textTransform: 'uppercase' }}>
            <th style={{ padding: '0.75rem 0.5rem' }}>Pos</th>
            <th style={{ padding: '0.75rem 1rem' }}>Club</th>
            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>P</th>
            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>W</th>
            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>D</th>
            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>L</th>
            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>GD</th>
            <th style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>Pts</th>
            <th style={{ padding: '0.75rem 1rem', textAlign: 'center', minWidth: '130px' }}>Form</th>
          </tr>
        </thead>
        <tbody>
          {/* 🎯 FIX 3: Map over the LIVE standings array instead of the hardcoded one */}
          {standings.map((team) => {
            // Add safety check in case a team name is missing
            const teamName = team.name || "Unknown Team";
            const isJunda = teamName.includes('Junda United');
            const gd = (team.gf || 0) - (team.ga || 0);

            return (
              <tr 
                key={team._id || team.rank} 
                style={{ 
                  borderBottom: '1px solid #e2e8f0', 
                  background: isJunda ? '#f0fdf4' : 'transparent',
                  fontWeight: isJunda ? '700' : '500',
                  color: isJunda ? '#166534' : '#1e293b',
                  transition: 'background 0.2s'
                }}
              >
                <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold', color: team.rank <= 2 ? '#2563eb' : '#64748b' }}>
                  {team.rank}
                </td>
                
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isJunda && <span>🛡️</span>}
                    {teamName}
                  </div>
                </td>
                
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>{team.p}</td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#10b981' }}>{team.w}</td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#64748b' }}>{team.d}</td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#ef4444' }}>{team.l}</td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', fontWeight: 'bold', color: gd > 0 ? '#10b981' : gd < 0 ? '#ef4444' : '#64748b' }}>
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', fontWeight: '800', fontSize: '1.05rem', color: isJunda ? '#166534' : '#0f172a' }}>
                  {team.pts}
                </td>

                <td style={{ padding: '1rem', display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                  {(team.form || []).map((f, idx) => (
                    <span 
                      key={idx} 
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: '20px', 
                        height: '20px', 
                        borderRadius: '50%', 
                        fontSize: '0.7rem', 
                        fontWeight: 'bold',
                        color: '#fff',
                        background: f === 'W' ? '#10b981' : f === 'D' ? '#64748b' : '#ef4444' 
                      }}
                    >
                      {f}
                    </span>
                  ))}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <div style={{ marginTop: '1rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem', color: '#64748b', lineHeight: '1.4' }}>
        ⚠️ **Notice:** **Mombasa Kings FC** has been officially removed from the league directory index following corporate regulatory disqualification by the FKF disciplinary council. All records, goal metrics, and previous head-to-head allocations involving the club have been expunged from the standing matrices.
      </div>
    </div>
  );
}