// src/pages/Gallery.jsx
import React from 'react';

export default function Gallery({ gallery = [] }) {
  return (
    <div className="page-container">
      <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2>Junda United Club Gallery</h2>
        <p>Captured moments from matchdays, training sessions, and community engagement events.</p>
      </header>

      {gallery.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#a0aec0' }}>
          <p style={{ fontSize: '1.2rem' }}>🖼️ Media records are currently spinning up or empty.</p>
          <p style={{ fontSize: '0.9rem' }}>Upload some assets in your admin panel to light up this page!</p>
        </div>
      ) : (
        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {gallery.map(item => (
            <div key={item._id} className="gallery-card" style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #edf2f7', transition: 'transform 0.2s' }}>
              
              {/* Render structural layout based on data asset media type */}
              <div className="media-wrapper" style={{ width: '100%', height: '220px', background: '#000', overflow: 'hidden' }}>
                {item.type === 'video' ? (
                  <video 
                    src={item.url} 
                    controls 
                    muted 
                    loop 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <img 
                    src={item.url} 
                    alt={item.caption || "Junda United Club Asset"} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    loading="lazy"
                  />
                )}
              </div>

              {item.caption && (
                <div style={{ padding: '1rem' }}>
                  <p style={{ margin: '0', color: '#2d3748', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>
                    {item.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}