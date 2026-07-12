// src/pages/Gallery.jsx
export default function Gallery({ gallery }) {
  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Club Media Gallery</h2>
        <p>Browse match day actions, behind-the-scenes clips, and training sessions.</p>
      </header>

      {gallery.length === 0 ? (
        <p className="no-data-msg">No media assets uploaded yet.</p>
      ) : (
        <div className="gallery-grid">
          {gallery.map((item) => (
            <div key={item.id} className="gallery-card">
              <div className="media-container">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt={item.caption || "Club Photo"} 
                    className="gallery-media" 
                    loading="lazy"
                  />
                ) : (
                  <video 
                    src={item.url} 
                    controls 
                    className="gallery-media"
                    preload="metadata"
                  />
                )}
              </div>
              {item.caption && (
                <div className="gallery-caption">
                  <p>{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}