import ClubCrest from '../components/ui/ClubCrest';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import NewsDate from '../components/news/NewsDate';
import NewsImage from '../components/news/NewsImage';
import NewsShare from '../components/news/NewsShare';
import useNewsCollection from '../components/news/useNewsCollection';
import { articlePath, newsExcerpt } from '../utils/newsEditorial';
import './Editorial.css';

export default function News() {
  const { articles, status, retry } = useNewsCollection();
  const [featured, ...latest] = articles;

  return (
    <main className="editorial">
      <SEO title="News & Updates" description="Match reports, club announcements, and stories from Junda United FC." />
      <header className="editorial-masthead">
        <div className="editorial-shell editorial-masthead__inner">
          <div>
            <p className="editorial-kicker">Junda United FC</p>
            <h1>Club News</h1>
            <p className="editorial-masthead__intro">Match reports, announcements and stories from the club.</p>
            <Link to="/fixtures" className="editorial-masthead__link">Match Centre <ArrowRight size={18} aria-hidden="true" /></Link>
          </div>
          <ClubCrest width={164} />
        </div>
      </header>

      <div className="editorial-shell editorial-feed" aria-busy={status === 'loading'}>
        {status === 'loading' && <p className="editorial-state" role="status">Loading the latest club news…</p>}
        {status === 'error' && (
          <div className="editorial-state">
            <p role="alert">Unable to load club news.</p>
            <button className="editorial-action" type="button" onClick={retry}>Try again</button>
          </div>
        )}
        {status === 'success' && !featured && (
          <section className="editorial-state" aria-labelledby="news-empty">
            <h2 id="news-empty">No news posted yet</h2>
            <p>Check back for club announcements and match reports.</p>
          </section>
        )}
        {featured && <StoryCard article={featured} featured />}
        {latest.length > 0 && (
          <section aria-labelledby="latest-news-heading">
            <h2 id="latest-news-heading" className="editorial-section-heading">Latest news</h2>
            <div className="editorial-grid">
              {latest.map(article => <StoryCard key={article._id} article={article} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function StoryCard({ article, featured = false }) {
  const Heading = featured ? 'h2' : 'h3';
  return (
    <article className={`editorial-story${featured ? ' editorial-story--featured' : ''}`}>
      <div className="editorial-story__visual">
        <NewsImage url={article.imageUrl} variant={featured ? 'feature' : 'card'} />
      </div>
      <div className="editorial-story__body">
        {featured && <p className="editorial-kicker">Featured story</p>}
        <NewsDate value={article.date} />
        <Heading><Link className="editorial-story__headline" to={articlePath(article._id)}>{article.title}</Link></Heading>
        <p className="editorial-story__excerpt">{newsExcerpt(article.content, featured ? 220 : 130)}</p>
        <div className="editorial-story__actions">
          <span className="editorial-story__read" aria-hidden="true">
            Read story <ArrowRight size={17} />
          </span>
          <NewsShare article={article} />
        </div>
      </div>
    </article>
  );
}
