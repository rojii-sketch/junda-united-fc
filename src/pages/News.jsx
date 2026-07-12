// src/pages/News.jsx
import { Link } from 'react-router-dom';

export default function News({ news }) {
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
      <header className="page-header">
        <h2>Latest Club News</h2>
        <p>Stay up to date with fixtures, match reports, and announcements from Junda United FC.</p>
      </header>

      <div className="news-grid">
        {news.map((item) => (
          /* 👇 THE WHOLE CARD IS NOW A HOVERABLE LINK */
          <Link to={`/news/${item.id}`} key={item.id} className="news-card-link" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div className="news-card">
              {item.imageUrl && (
                <div className="news-card-img-container">
                  <img src={item.imageUrl} alt={item.title} />
                </div>
              )}
              <div className="news-card-body" style={{ padding: '1.25rem' }}>
                <span className="subtext">{item.date}</span>
                <h3 style={{ margin: '0.5rem 0', color: '#1a202c' }}>{item.title}</h3>
                
                {/* Clean excerpt teaser: Shows the first 120 characters followed by an ellipsis */}
                <p style={{ color: '#4a5568', fontSize: '0.95rem' }}>
                  {item.content.length > 120 ? `${item.content.substring(0, 120)}...` : item.content}
                </p>
                
                <span style={{ color: 'var(--primary-color)', fontWeight: 'bold', fontSize: '0.9rem', display: 'inline-block', marginTop: '0.5rem' }}>
                  Read Full Article →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}