import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { fetchJson } from '../api';
import { getCloudinarySrcSet, transformCloudinaryUrl } from '../utils/cloudinary';

export default function News() {
  const [news, setNews] = React.useState([]);
  const [status, setStatus] = React.useState('loading');
  const [retryCount, setRetryCount] = React.useState(0);

  React.useEffect(() => {
    const controller = new AbortController();

    fetchJson('/news', controller.signal)
      .then(data => {
        setNews(data);
        setStatus('success');
      })
      .catch(requestError => {
        if (requestError.name === 'AbortError') return;
        console.error('Error retrieving news:', requestError);
        setStatus('error');
      });

    return () => controller.abort();
  }, [retryCount]);

  if (status === 'loading') {
    return <PageMessage message="Loading the latest club news..." />;
  }

  if (status === 'error') {
    return (
      <PageMessage
        message="Unable to load club news."
        onRetry={() => {
          setStatus('loading');
          setRetryCount(count => count + 1);
        }}
      />
    );
  }

  const handleShare = async (articleId, articleTitle) => {
    const articleUrl = `${window.location.origin}/news/${articleId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: articleTitle,
          text: `Check out this update from Junda United FC!\n\n${articleTitle}`,
          url: articleUrl,
        });
      } catch {
        console.log('User cancelled share');
      }
    } else {
      const message = `Check out this update from Junda United FC!\n\n${articleTitle}\n${articleUrl}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  if (news.length === 0) {
    return (
      <div className="public-ui public-news">
        <SEO
          title="News & Updates"
          description="Latest match reports, club announcements, and squad news from Junda United FC."
        />
        <ClubWatermark />
        <div className="public-container public-news__empty-container">
          <div className="public-news__empty public-glass">
            <span className="public-news__eyebrow">Junda United FC</span>
            <h1 className="public-news__empty-title">No news posted yet.</h1>
            <p>Check back later for match updates and official announcements from Junda United FC.</p>
          </div>
        </div>
      </div>
    );
  }

  const featuredArticle = getFeaturedArticle(news);
  const remainingArticles = news.filter(item => item._id !== featuredArticle._id);

  return (
    <div className="public-ui public-news">
      <SEO
        title="News & Updates"
        description="Latest match reports, club announcements, and squad news from Junda United FC."
      />
      <ClubWatermark />

      <main className="public-container public-news__container">
        <header className="public-news__header public-glass">
          <span className="public-news__eyebrow">Junda United FC</span>
          <h1 className="public-news__heading">Latest Club News</h1>
          <p className="public-news__intro">
            Match reports, club announcements, and stories from around Junda United FC.
          </p>
        </header>

        <section className="public-news__featured-section" aria-labelledby="featured-story-heading">
          <div className="public-news__section-label">
            <span>Featured story</span>
          </div>
          <article className="public-news__featured public-glass">
            <Link
              to={`/news/${featuredArticle._id}`}
              className="public-news__featured-link"
              aria-labelledby="featured-story-heading"
            >
              <ArticleImage
                item={featuredArticle}
                className="public-news__featured-media"
                sizes="(max-width: 768px) calc(100vw - 2rem), 55vw"
                widths={[480, 768, 1000]}
                eager
              />
              <div className="public-news__featured-content">
                <ArticleMeta item={featuredArticle} />
                <h2 id="featured-story-heading" className="public-news__featured-title">
                  {featuredArticle.title}
                </h2>
                <p className="public-news__featured-excerpt">
                  {getExcerpt(featuredArticle.content, 220)}
                </p>
                <span className="public-news__read-more">Read story <span aria-hidden="true">→</span></span>
              </div>
            </Link>
            <div className="public-news__featured-actions">
              <button
                type="button"
                className="public-news__share"
                onClick={() => handleShare(featuredArticle._id, featuredArticle.title)}
              >
                <span aria-hidden="true">🔗</span> Share story
              </button>
            </div>
          </article>
        </section>

        {remainingArticles.length > 0 && (
          <section className="public-news__articles-section" aria-labelledby="more-stories-heading">
            <div className="public-news__section-heading-row">
              <div>
                <span className="public-news__eyebrow">From the club</span>
                <h2 id="more-stories-heading" className="public-news__section-heading">
                  More stories
                </h2>
              </div>
            </div>

            <div className="public-news__grid">
              {remainingArticles.map(item => (
                <article className="public-news__card public-glass" key={item._id}>
                  <Link to={`/news/${item._id}`} className="public-news__card-link">
                    <ArticleImage
                      item={item}
                      className="public-news__card-media"
                      sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc((100vw - 3rem) / 2), 360px"
                      widths={[320, 480, 640]}
                    />
                    <div className="public-news__card-content">
                      <ArticleMeta item={item} />
                      <h3 className="public-news__card-title">{item.title}</h3>
                      <p className="public-news__card-excerpt">
                        {getExcerpt(item.content, 120)}
                      </p>
                      <span className="public-news__read-more">Read story <span aria-hidden="true">→</span></span>
                    </div>
                  </Link>
                  <div className="public-news__card-actions">
                    <button
                      type="button"
                      className="public-news__share"
                      onClick={() => handleShare(item._id, item.title)}
                    >
                      <span aria-hidden="true">🔗</span> Share
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function getFeaturedArticle(articles) {
  return articles.reduce((latest, article) => {
    const latestDate = Date.parse(latest.date);
    const articleDate = Date.parse(article.date);

    if (Number.isNaN(articleDate)) return latest;
    if (Number.isNaN(latestDate) || articleDate > latestDate) return article;
    return latest;
  }, articles[0]);
}

function getExcerpt(content, limit) {
  if (typeof content !== 'string') return '';
  return content.length > limit ? `${content.substring(0, limit)}...` : content;
}

function ArticleMeta({ item }) {
  return (
    <div className="public-news__meta">
      <span>{item.date || 'Junda United FC'}</span>
    </div>
  );
}

function ArticleImage({ item, className, sizes, widths, eager = false }) {
  if (!item.imageUrl) {
    return (
      <div className={`${className} public-news__media-placeholder`} aria-hidden="true">
        <span>Junda United FC</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={transformCloudinaryUrl(item.imageUrl, `f_auto,q_auto,w_${widths[widths.length - 1]},c_limit`)}
        srcSet={getCloudinarySrcSet(item.imageUrl, widths) || undefined}
        sizes={sizes}
        alt={item.title}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    </div>
  );
}

function ClubWatermark() {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <motion.div
      className="public-news__watermark"
      initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 0.1, scale: 1 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
      aria-hidden="true"
    />
  );
}

function PageMessage({ message, onRetry }) {
  return (
    <div className="public-ui public-news public-news__status-page">
      <div className="public-container">
        <div className="public-news__status public-glass">
          <p>{message}</p>
          {onRetry && (
            <button type="button" className="public-news__retry" onClick={onRetry}>
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
