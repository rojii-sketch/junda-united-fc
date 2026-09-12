// src/pages/ArticleDetail.jsx
import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { fetchJson } from '../api';
import { getCloudinarySrcSet, transformCloudinaryUrl } from '../utils/cloudinary';

export default function ArticleDetail() {
  const { id } = useParams();
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchJson('/news', controller.signal)
      .then(data => {
        setNews(data);
        setStatus('success');
      })
      .catch(error => {
        if (error.name === 'AbortError') return;
        console.error('Error retrieving article:', error);
        setStatus('error');
      });

    return () => controller.abort();
  }, [retryCount]);

  const article = news.find(item => item._id === id);

  if (status === 'loading') {
    return <DetailMessage message="Loading article..." />;
  }

  if (status === 'error') {
    return (
      <DetailMessage
        message="Unable to load this article."
        onRetry={() => {
          setStatus('loading');
          setRetryCount(count => count + 1);
        }}
      />
    );
  }

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
          <div 
            className="full-article-image-wrapper" 
            style={{ 
              maxWidth: '500px',          
              margin: '0 auto 2rem auto', 
              borderRadius: '12px', 
              overflow: 'hidden', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              border: '1px solid #e2e8f0',
              background: '#f7fafc'
            }}
          >
            <img 
              src={transformCloudinaryUrl(article.imageUrl, 'f_auto,q_auto,w_1000,c_limit')}
              srcSet={getCloudinarySrcSet(article.imageUrl, [480, 768, 1000]) || undefined}
              sizes="(max-width: 500px) calc(100vw - 2rem), 500px"
              alt={article.title} 
              style={{ 
                width: '100%', 
                height: '350px',          
                display: 'block', 
                objectFit: 'contain',     
                padding: '0.5rem'         
              }} 
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

function DetailMessage({ message, onRetry }) {
  return (
    <div className="page-container" style={{ textAlign: 'center', marginTop: '5rem' }}>
      <p>{message}</p>
      {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
    </div>
  );
}