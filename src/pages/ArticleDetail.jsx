import { ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import NewsDate from '../components/news/NewsDate';
import NewsImage from '../components/news/NewsImage';
import NewsShare from '../components/news/NewsShare';
import useNewsCollection from '../components/news/useNewsCollection';
import { articlePath, newsExcerpt, newsImageUrl, newsParagraphs, publicationDate, relatedNews } from '../utils/newsEditorial';
import './Editorial.css';

const officialSite = 'https://junda-united-fc.vercel.app';
const defaultDescription = 'The latest news and updates from Junda United FC.';

export default function ArticleDetail() {
  const { id } = useParams();
  const { articles, status, retry } = useNewsCollection();
  const article = articles.find(item => item._id === id);

  if (!article) {
    const loading = status === 'loading';
    const error = status === 'error';
    const title = loading ? 'Loading article…' : error ? 'Unable to load this article.' : 'Article not found';
    return (
      <main className="editorial">
        <SEO title={title} description={defaultDescription} />
        <div className="editorial-shell editorial-feed">
          <section className="editorial-state" role={loading ? 'status' : error ? 'alert' : undefined}>
            <h1>{title}</h1>
            {!loading && <div className="editorial-share__actions">
              {error && <button className="editorial-action" type="button" onClick={retry}>Try again</button>}
              <BackToNews />
            </div>}
          </section>
        </div>
      </main>
    );
  }

  const body = newsParagraphs(article.content);
  const related = relatedNews(articles, article._id);
  const canonical = new URL(articlePath(article._id), officialSite).href;
  const image = newsImageUrl(article.imageUrl, officialSite) || `${officialSite}/junda-logo.webp`;

  return (
    <main className="editorial">
      <SEO title={article.title} description={newsExcerpt(article.content, 160) || defaultDescription}
        image={image} type="article" url={canonical} publishedTime={publicationDate(article.date).dateTime} />
      <article>
        <header className="editorial-article-header">
          <div className="editorial-shell editorial-article-header__inner">
            <BackToNews />
            <p className="editorial-kicker">Junda United FC News</p>
            <h1>{article.title}</h1>
            <NewsDate value={article.date} />
          </div>
        </header>
        <div className="editorial-shell editorial-article">
          <figure className="editorial-article__hero">
            <NewsImage url={article.imageUrl} alt={`Cover image for ${article.title}`} variant="article" />
          </figure>
          <div className="editorial-article__reading">
            <div className="editorial-prose">{body.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            <NewsShare article={article} full />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="editorial-shell editorial-related" aria-labelledby="related-news-heading">
          <h2 id="related-news-heading" className="editorial-section-heading">More club news</h2>
          <ul className="editorial-related__list">
            {related.map(item => (
              <li key={item._id}>
                <NewsDate value={item.date} />
                <h3><Link to={articlePath(item._id)}>{item.title}</Link></h3>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function BackToNews() {
  return <Link to="/" className="editorial-back"><ArrowLeft size={18} aria-hidden="true" /> Back to club news</Link>;
}
