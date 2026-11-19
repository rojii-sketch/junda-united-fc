import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { articlePath } from '../../utils/newsEditorial';

export default function NewsShare({ article, full = false }) {
  const [feedback, setFeedback] = useState('');
  const url = new URL(articlePath(article._id), window.location.origin).href;

  async function share() {
    setFeedback('');
    if (navigator.share) {
      try {
        await navigator.share({ title: article.title, url });
        setFeedback('Article shared.');
        return;
      } catch (error) {
        if (error.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setFeedback('Article link copied.');
    } catch {
      setFeedback(full ? 'Could not copy the link. Use the address bar or share on WhatsApp.' : 'Could not copy the link. Open the story to share its address.');
    }
  }

  return (
    <div className="editorial-share">
      <div className="editorial-share__actions">
        <button type="button" className="editorial-action" onClick={share}
          aria-label={full ? undefined : `Share: ${article.title}`}>
          <Link2 size={18} aria-hidden="true" /> {full ? 'Share article' : 'Share'}
        </button>
        {full && (
          <a className="editorial-action" target="_blank" rel="noopener noreferrer"
            href={`https://wa.me/?text=${encodeURIComponent(`${article.title}\n${url}`)}`}>
            Share on WhatsApp
          </a>
        )}
      </div>
      <p className="editorial-share__feedback" role="status">{feedback}</p>
    </div>
  );
}
