// src/pages/Gallery.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Gallery({ gallery = [] }) {
  // 🎯 NEW: State to track which image is currently selected for the lightbox
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="page-container" style={{ position: 'relative' }}>
      <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2>Junda United Club Gallery</h2>
        <p>Captured moments from matchdays, training sessions, and community engagement events.</p>
      </header>

      {gallery.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: '#a0aec0' }}>
          <p style={{ fontSize: '1.2rem' }}>🖼️ Media records are currently spinning up or empty.</p>
        </div>
      ) : (
        <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {gallery.map(item => (
            <div 
              key={item._id} 
              className="gallery-card" 
              style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', overflow: 'hidden', border: '1px solid #edf2f7', transition: 'transform 0.2s' }}
            >
              
              {/* Render structural layout based on data asset media type */}
              <div 
                className="media-wrapper" 
                style={{ width: '100%', height: '220px', background: '#000', overflow: 'hidden', cursor: item.type === 'image' ? 'pointer' : 'default' }}
                onClick={() => {
                  // 🎯 Open lightbox only if it's an image
                  if (item.type === 'image') {
                    setSelectedImage(item);
                  }
                }}
              >
                {item.type === 'video' ? (
                  <video 
                    src={item.url} 
                    controls 
                    muted 
                    loop 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                  />
                ) : (
                  <img 
                    src={item.url} 
                    alt={item.caption || "Junda United Club Asset"} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block', transition: 'transform 0.3s ease' }} 
                    loading="lazy"
                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
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

      {/* 🎯 LIGHTBOX MODAL OVERLAY */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)} // Click anywhere outside to close
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem'
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedImage(null)}
              style={{
                position: 'absolute',
                top: '2rem',
                right: '2rem',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#fff',
                fontSize: '1.5rem',
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
            >
              ✕
            </button>

            {/* Expanded Image Container */}
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image itself
              style={{ maxWidth: '90vw', maxHeight: '80vh', textAlign: 'center' }}
            >
              <img 
                src={selectedImage.url} 
                alt={selectedImage.caption || "Junda United Zoomed Asset"} 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '75vh', 
                  objectFit: 'contain', 
                  borderRadius: '12px',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
                }} 
              />
              {selectedImage.caption && (
                <p style={{ color: '#e2e8f0', marginTop: '1.25rem', fontSize: '1.1rem', fontWeight: '500' }}>
                  {selectedImage.caption}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}