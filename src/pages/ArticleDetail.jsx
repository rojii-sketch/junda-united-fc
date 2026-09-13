import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import { fetchJson } from '../api';
import { getCloudinarySrcSet, transformCloudinaryUrl } from '../utils/cloudinary';

export default function ArticleDetail() {
  const { id } = useParams();
  const [news, setNews] = useState([]);
  const [status, setStatus] = useState('loading');
  const [retryCount, setRetryCount] = useState(0);
  const [shareStatus, setShareStatus] = useState('');

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
      <div className="public-ui public-article">
        <SEO
          title="Article Not Found"
          description="The requested Junda United FC news article could not be found."
        />
        <main className="public-container public-article__state-page">
          <section className="public-article__state public-glass" aria-labelledby="article-not-found-heading">
            <span className="public-article__eyebrow">Junda United FC News</span>
            <h1 id="article-not-found-heading">Article not found</h1>
            <p>The post you are looking for might have been removed by an administrator.</p>
            <Link to="/" className="public-article__back-link">
              Back to News Feed
            </Link>
          </section>
        </main>
      </div>
    );
  }

  const description = getDescription(article.content);
  const articleImage = article.imageUrl
    ? transformCloudinaryUrl(article.imageUrl, 'f_auto,q_auto,w_1000,c_limit')
    : undefined;
  const dateTime = getDateTimeValue(article.date);

  const handleShare = async () => {
    const articleUrl = `${window.location.origin}/news/${article._id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: `Check out this update from Junda United FC!\n\n${article.title}`,
          url: articleUrl,
        });
        setShareStatus('Article shared.');
      } catch (error) {
        if (error.name !== 'AbortError') {
          setShareStatus('Unable to share this article.');
        }
      }
      return;
    }

    const message = `Check out this update from Junda United FC!\n\n${article.title}\n${articleUrl}`;
    const shareWindow = window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
    setShareStatus(shareWindow ? 'Opening WhatsApp to share this article.' : 'Unable to open sharing options.');
  };

  return (
    <div className="public-ui public-article">
      <SEO
        title={article.title}
        description={description}
        image={articleImage}
        type="article"
      />

      <main className="public-container public-article__container">
        <Link to="/" className="public-article__back-link">
          <span aria-hidden="true">←</span> Back to Latest News
        </Link>

        <article className="public-article__article">
          <header className="public-article__header public-glass">
            <span className="public-article__eyebrow">Junda United FC News</span>
            <div className="public-article__meta">
              {dateTime ? (
                <time dateTime={dateTime}>Published: {article.date}</time>
              ) : (
                <span>Published: {article.date}</span>
              )}
            </div>
            <h1>{article.title}</h1>
          </header>

          {article.imageUrl && (
            <figure className="public-article__hero">
              <img
                src={articleImage}
                srcSet={getCloudinarySrcSet(article.imageUrl, [480, 768, 1000]) || undefined}
                sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc(100vw - 3rem), 900px"
                alt={article.title}
                loading="eager"
                decoding="async"
              />
            </figure>
          )}

          <div className="public-article__body">
            <div className="public-article__content">{article.content}</div>
            <div className="public-article__actions">
              <button type="button" className="public-article__share" onClick={handleShare}>
                <span aria-hidden="true">🔗</span> Share article
              </button>
              {shareStatus && (
                <span className="public-article__share-status" role="status">
                  {shareStatus}
                </span>
              )}
            </div>
          </div>
        </article>
      </main>
    </div>
  );
}

function getDescription(content) {
  if (typeof content !== 'string') return 'Latest news and updates from Junda United FC.';
  const normalizedContent = content.replace(/\s+/g, ' ').trim();
  return normalizedContent.length > 160
    ? `${normalizedContent.slice(0, 157)}...`
    : normalizedContent || 'Latest news and updates from Junda United FC.';
}

function getDateTimeValue(value) {
  if (typeof value !== 'string' || !value.trim()) return null;

  const trimmedValue = value.trim();
  const dayMonthYear = trimmedValue.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dayMonthYear) {
    const [, day, month, year] = dayMonthYear;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (
      date.getFullYear() !== Number(year)
      || date.getMonth() !== Number(month) - 1
      || date.getDate() !== Number(day)
    ) {
      return null;
    }
    return date.toISOString().slice(0, 10);
  }

  const parsedTime = Date.parse(trimmedValue);
  return Number.isNaN(parsedTime) ? null : new Date(parsedTime).toISOString();
}

function DetailMessage({ message, onRetry }) {
  return (
    <div className="public-ui public-article public-article__state-page">
      <div className="public-container">
        <section className="public-article__state public-glass" aria-live={onRetry ? 'assertive' : 'polite'}>
          <span className="public-article__eyebrow">Junda United FC News</span>
          <h1>{message}</h1>
          {onRetry && (
            <button type="button" className="public-article__retry" onClick={onRetry}>
              Try again
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
