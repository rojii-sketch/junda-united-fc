import { useState } from 'react';
import NewsDate from '../news/NewsDate';
import NewsImage from '../news/NewsImage';
import { newsParagraphs } from '../../utils/newsEditorial';

export default function AdminNewsPreview({ draft }) {
  const [open, setOpen] = useState(false);

  return (
    <details className="admin-news-preview" onToggle={event => setOpen(event.currentTarget.open)}>
      <summary>Preview article</summary>
      {open && (
        <article className="admin-news-preview__article" aria-label="Article draft preview">
          <NewsDate value={draft.date} />
          <h4>{draft.title.trim() || 'Untitled article'}</h4>
          <NewsImage url={draft.imageUrl} alt="Cover image preview" />
          {newsParagraphs(draft.content).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </article>
      )}
    </details>
  );
}
