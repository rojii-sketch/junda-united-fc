import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function News({ news }) {
  
  // 🎯 1. The Smart Share Logic
  const handleShare = async (e, articleId, articleTitle) => {
    e.preventDefault(); // 🛑 Crucial: Stops the click from triggering the <Link> wrapper
    
    const articleUrl = `${window.location.origin}/news/${articleId}`;

    if (navigator.share) {
      // Mobile: Native share menu
      try {
        await navigator.share({
          title: articleTitle,
          text: `Check out this update from Junda United FC!\n\n${articleTitle}`,
          url: articleUrl,
        });
      } catch (error) {
        console.log('User cancelled share');
      }
    } else {
      // Desktop: Fallback to WhatsApp Web
      const message = `Check out this update from Junda United FC!\n\n${articleTitle}\n${articleUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  if (news.length === 0) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>No news posted yet.</h2>
        <p>Check back later for match updates and official announcements from Junda United FC!</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <SEO 
        title="News & Updates" 
        description="Latest match reports, club announcements, and squad news from Junda United FC."
      />
      <header className="page-header">
        <h2>Latest Club News</h2>
        <p>Stay up to date with fixtures, match reports, and announcements from Junda United FC.</p>
      </header>

      <div className="news-grid">
        {news.map((item) => (
          <Link to={`/news/${item._id}`} key={item._id} className="news-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="news-card">
              {item.imageUrl && (
                <div className="news-card-img-container">
                  <img src={item.imageUrl} alt={item.title} />
                </div>
              )}
              <div className="news-card-body" style={{ padding: '1.25rem' }}>
                <span className="subtext">{item.date}</span>
                <h3 style={{ margin: '0.5rem 0', color: '#1a202c' }}>{item.title}</h3>
                
                <p style={{ color: '#4a5568', fontSize: '0.95rem' }}>
                  {item.content.length > 120 ? `${item.content.substring(0, 120)}...` : item.content}
                </p>
                
                {/* 🎯 2. Flexbox container for the footer link and button */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginTop: '1rem' 
                }}>
                  <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.9rem' }}>
                    Read Full Article →
                  </span>
                  
                  {/* 🎯 3. The actual share button */}
                  <button 
                    onClick={(e) => handleShare(e, item._id, item.title)}
                    style={{
                      backgroundColor: '#f3f4f6',
                      color: '#1f2937',
                      border: '1px solid #d1d5db',
                      padding: '0.4rem 0.8rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  >
                    🔗 Share
                  </button>
                </div>

              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}