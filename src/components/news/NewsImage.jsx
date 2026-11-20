import ClubCrest from '../ui/ClubCrest';
import { useState } from 'react';
import { galleryImageSources } from '../../utils/galleryMedia';
import { newsImageUrl } from '../../utils/newsEditorial';

const cardWidths = [320, 480, 640, 800];
const leadWidths = [480, 800, 1200, 1600];

export default function NewsImage({ url, alt = '', variant = 'card' }) {
  const [failure, setFailure] = useState(null);
  const original = newsImageUrl(url, window.location.origin);
  const lead = variant === 'feature' || variant === 'article';
  const optimized = original && galleryImageSources(original, lead ? 1200 : 640, lead ? leadWidths : cardWidths);
  const useOriginal = failure?.url === original && failure?.stage === 'optimized';
  const showFallback = !original || (failure?.url === original && failure?.stage === 'original');
  const sources = useOriginal ? { src: original } : optimized;
  const sizes = variant === 'article'
    ? '(max-width: 1040px) calc(100vw - 2rem), 960px'
    : variant === 'feature'
      ? '(max-width: 760px) calc(100vw - 2rem), (max-width: 1200px) 58vw, 670px'
      : '(max-width: 560px) calc(100vw - 2rem), (max-width: 960px) 48vw, 375px';

  return (
    <div className={`news-image news-image--${variant}${showFallback ? ' news-image--fallback' : ''}`}>
      {showFallback ? (
        <ClubCrest width={96} loading={lead ? 'eager' : 'lazy'} />
      ) : (
        <img key={sources.src} {...sources} sizes={sources.srcSet ? sizes : undefined}
          alt={alt} loading={lead ? 'eager' : 'lazy'} fetchPriority={lead ? 'high' : undefined}
          decoding="async" referrerPolicy="no-referrer"
          onError={() => setFailure({ url: original, stage: sources.src !== original ? 'optimized' : 'original' })} />
      )}
    </div>
  );
}
