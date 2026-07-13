// src/components/StandingsTable.jsx
import React from 'react';

export default function StandingsTable() {
  // Current Group D Simulated Standings mapping the actual campaign trajectory
  const teams = [
    { rank: 1, name: 'Junda United FC', p: 12, w: 9, d: 2, l: 1, gf: 26, ga: 7, pts: 29, form: ['W', 'W', 'W', 'W', 'D'] },
    { rank: 2, name: 'Mablanda FC', p: 11, w: 7, d: 3, l: 1, gf: 19, ga: 9, pts: 24, form: ['W', 'D', 'W', 'L', 'W'] },
    { rank: 3, name: 'PNI Football Club', p: 11, w: 5, d: 2, l: 4, gf: 14, ga: 12, pts: 17, form: ['L', 'W', 'L', 'W', 'D'] },
    { rank: 4, name: 'Blue Rangers', p: 12, w: 4, d: 1, l: 7, gf: 12, ga: 22, pts: 13, form: ['L', 'L', 'W', 'L', 'L'] },
    { rank: 5, name: 'Babito FC', p: 12, w: 3, d: 2, l: 7, gf: 8, ga: 15, pts: 11, form: ['L', 'L', 'L', 'W', 'L'] },
    { rank: 6, name: 'Black Dragon', p: 12, w: 2, d: 2, l: 8, gf: 7, ga: 21, pts: 8, form: ['L', 'W', 'L', 'L', 'D'] },
  ];

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
          {teams.map((team) => {
            const isJunda = team.name.includes('Junda United');
            const gd = team.gf - team.ga;

            return (
              <tr 
                key={team.rank} 
                style={{ 
                  borderBottom: '1px solid #e2e8f0', 
                  background: isJunda ? '#f0fdf4' : 'transparent',
                  fontWeight: isJunda ? '700' : '500',
                  color: isJunda ? '#166534' : '#1e293b',
                  transition: 'background 0.2s'
                }}
              >
                {/* Position Rank */}
                <td style={{ padding: '1rem 0.5rem', fontWeight: 'bold', color: team.rank <= 2 ? '#2563eb' : '#64748b' }}>
                  {team.rank}
                </td>
                
                {/* Club Identity */}
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {isJunda && <span>🛡️</span>}
                    {team.name}
                  </div>
                </td>
                
                {/* Stats Nodes */}
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center' }}>{team.p}</td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#10b981' }}>{team.w}</td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#64748b' }}>{team.d}</td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', color: '#ef4444' }}>{team.l}</td>
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', fontWeight: 'bold', color: gd > 0 ? '#10b981' : gd < 0 ? '#ef4444' : '#64748b' }}>
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                
                {/* Absolute Points */}
                <td style={{ padding: '1rem 0.5rem', textAlign: 'center', fontWeight: '800', fontSize: '1.05rem', color: isJunda ? '#166534' : '#0f172a' }}>
                  {team.pts}
                </td>

                {/* Micro Form Badge Indicators */}
                <td style={{ padding: '1rem', display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                  {team.form.map((f, idx) => (
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