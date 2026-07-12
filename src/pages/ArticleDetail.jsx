// src/pages/ArticleDetail.jsx
import { useParams, Link } from 'react-router-dom';

export default function ArticleDetail({ news }) {
  const { id } = useParams();
  
  // Find the exact article matching the URL parameter
  const article = news.find(item => item.id === id);

  if (!article) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: '5rem' }}>
        <h3>Article Not Found</h3>
        <p>The post you are looking for might have been removed by an administrator.</p>
        <Link to="/" className="submit-btn" style={{ display: 'inline-block', width: 'auto', padding: '0.5rem 1.5rem' }}>
          Back to News Feed
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      <Link to="/" style={{ color: 'var(--primary-color)', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block', marginBottom: '1.5rem' }}>
        ← Back to Latest News
      </Link>
      
      <article className="full-article">
        <span className="subtext" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Published: {article.date}
        </span>
        <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0 1.5rem 0', color: '#1a202c', lineHeight: '1.2' }}>
          {article.title}
        </h1>
        
        {article.imageUrl && (
          <div className="full-article-image-wrapper" style={{ marginBottom: '2rem', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }} 
            />
          </div>
        )}
        
        <div className="full-article-content" style={{ fontSize: '1.15rem', lineHeight: '1.8', color: '#2d3748', whiteSpace: 'pre-wrap' }}>
          {article.content}
        </div>
      </article>
    </div>
  );
}