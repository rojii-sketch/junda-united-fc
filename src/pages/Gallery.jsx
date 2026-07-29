// src/pages/Gallery.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Gallery({ gallery = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);

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
        <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ color: '#fff', fontSize: '2.5rem', marginBottom: '0.5rem' }}>Junda United Club Gallery</h2>
          <p style={{ color: '#94a3b8' }}>Captured moments from matchdays, training sessions, and community engagement events.</p>
        </header>

        {gallery.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: '#94a3b8' }}>
            <p style={{ fontSize: '1.2rem' }}>🖼️ Media records are currently spinning up or empty.</p>
          </div>
        ) : (
          <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {gallery.map(item => (
              <div 
                key={item._id} 
                className="gallery-card" 
                style={{ 
                  background: 'rgba(30, 41, 59, 0.4)', 
                  backdropFilter: 'blur(8px)',
                  WebkitBackdropFilter: 'blur(8px)',
                  borderRadius: '12px', 
                  overflow: 'hidden', 
                  border: '1px solid rgba(255, 255, 255, 0.05)', 
                  boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                  transition: 'transform 0.2s' 
                }}
              >
                
                <div 
                  className="media-wrapper" 
                  style={{ width: '100%', height: '220px', background: '#000', overflow: 'hidden', cursor: item.type === 'image' ? 'pointer' : 'default' }}
                  onClick={() => {
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
                    <p style={{ margin: '0', color: '#e2e8f0', fontSize: '0.95rem', fontWeight: '500', lineHeight: '1.4' }}>
                      {item.caption}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* LIGHTBOX MODAL OVERLAY */}
        <AnimatePresence>
          {selectedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
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

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
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
    </div>
  );
}