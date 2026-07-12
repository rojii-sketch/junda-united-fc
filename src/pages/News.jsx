// src/pages/News.jsx
export default function News({ news }) {
  // Sort posts by date so the most recent ones show up first
  const sortedNews = [...news].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="page-container">
      <header className="page-header">
        <h2>Latest Club News</h2>
        <p>Stay up to date with match reports, signings, and announcements.</p>
      </header>

      {sortedNews.length === 0 ? (
        <p className="no-data-msg">No news posts available at the moment.</p>
      ) : (
        <div className="news-grid">
          {sortedNews.map((post) => (
            <article key={post.id} className="news-card">
              <div className="news-card-image">
                <img src={post.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"} alt={post.title} />
              </div>
              <div className="news-card-body">
                <span className="news-date">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <h3 className="news-title">{post.title}</h3>
                <p className="news-excerpt">{post.content}</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}