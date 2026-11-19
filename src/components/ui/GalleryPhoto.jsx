import { useState } from 'react';
import { Image, ImageOff } from 'lucide-react';
import { galleryImageSources, galleryRetryUrl } from '../../utils/galleryMedia';
import './GalleryPhoto.css';

export default function GalleryPhoto({
  url, alt, width, widths, sizes, eager = false, rememberedFailure, onFailureChange
}) {
  const [retryKey, setRetryKey] = useState('');
  const [useOriginal, setUseOriginal] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [localFailure, setLocalFailure] = useState(false);
  const failed = rememberedFailure ?? localFailure;
  const setFailed = onFailureChange ?? setLocalFailure;
  const original = galleryRetryUrl(url, retryKey);
  const optimized = galleryImageSources(url, width, widths, retryKey);

  function handleError() {
    if (!useOriginal && optimized.src !== original) {
      setUseOriginal(true);
    } else {
      setFailed(true);
    }
  }

  return (
    <div className="gallery-photo" tabIndex={-1}>
      {!failed && (
        <img key={useOriginal ? 'original' : 'optimized'} {...(useOriginal ? { src: original } : optimized)}
          className={loaded ? 'gallery-photo__image is-loaded' : 'gallery-photo__image'}
          sizes={!useOriginal && optimized.srcSet ? sizes : undefined}
          alt={alt} loading={eager ? 'eager' : 'lazy'} decoding="async" referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)} onError={handleError} />
      )}
      {!loaded && !failed && (
        <div className="gallery-photo__state" aria-hidden="true"><Image size={26} /></div>
      )}
      {failed && (
        <div className="gallery-photo__state">
          <ImageOff size={24} aria-hidden="true" />
          <span role="status">Image unavailable</span>
          <button type="button" onClick={event => {
            event.currentTarget.closest('.gallery-photo')?.focus();
            setRetryKey(globalThis.crypto?.randomUUID?.() ?? String(Date.now()));
            setUseOriginal(false);
            setLoaded(false);
            setFailed(false);
          }}>Retry image</button>
        </div>
      )}
    </div>
  );
}
