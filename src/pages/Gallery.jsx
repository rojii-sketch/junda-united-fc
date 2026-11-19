import { X } from 'lucide-react';
import Modal from '../components/ui/Modal';
import PublicHero from '../components/ui/PublicHero';
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import SEO from '../components/SEO';
import { fetchJson } from '../api';
import { getCloudinarySrcSet, transformCloudinaryUrl } from '../utils/cloudinary';

function isImage(item) {
  return item.type !== 'video';
}

export default function Gallery() {
  const [selectedImage, setSelectedImage] = React.useState(null);
  const [gallery, setGallery] = React.useState([]);
  const [status, setStatus] = React.useState('loading');
  const [retryCount, setRetryCount] = React.useState(0);
  const shouldReduceMotion = useReducedMotion();

  React.useEffect(() => {
    const controller = new AbortController();

    fetchJson('/gallery', controller.signal)
      .then(data => {
        setGallery(data);
        setStatus('success');
      })
      .catch(error => {
        if (error.name === 'AbortError') return;
        console.error('Error retrieving gallery:', error);
        setStatus('error');
      });

    return () => controller.abort();
  }, [retryCount]);

  if (status === 'loading') {
    return <PageMessage message="Loading the club gallery..." />;
  }

  if (status === 'error') {
    return (
      <PageMessage
        message="Unable to load the club gallery."
        onRetry={() => {
          setStatus('loading');
          setRetryCount(count => count + 1);
        }}
      />
    );
  }

  return (
    <div className="public-ui public-gallery">
      <SEO
        title="Club Gallery"
        description="Matchdays, training sessions, academy activity, and community moments from Junda United FC."
      />
      <motion.div
        className="public-gallery__watermark"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.96 }}
        animate={{ opacity: 0.08, scale: 1 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8, ease: 'easeOut' }}
        aria-hidden="true"
      />

      <main className="public-container public-gallery__container">
        <PublicHero title="Club gallery" description="Matchdays, training, academy activity and community moments." />

        {gallery.length === 0 ? (
          <section className="public-gallery__empty public-glass" aria-labelledby="gallery-empty-heading">
            <h2 id="gallery-empty-heading">No gallery media yet</h2>
            <p>Media records are currently being prepared. Check back shortly for new club moments.</p>
          </section>
        ) : (
          <section className="public-gallery__grid" aria-label="Club gallery media">
            {gallery.map(item => (
              <MediaCard
                key={item._id}
                item={item}
                onOpenImage={setSelectedImage}
              />
            ))}
          </section>
        )}

        {selectedImage && <ImageLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />}
      </main>
    </div>
  );
}

function MediaCard({ item, onOpenImage }) {
  const image = isImage(item);

  return (
    <figure className="public-gallery__card public-glass">
      <div className="public-gallery__media">
        <span className="public-gallery__media-badge" aria-hidden="true">
          {image ? 'Image' : 'Video'}
        </span>
        {image ? (
          <GalleryThumbnail item={item} onOpen={onOpenImage} />
        ) : (
          <video
            src={item.url}
            controls
            muted
            loop
            preload="none"
            playsInline
            aria-label={item.caption || 'Junda United FC gallery video'}
          />
        )}
      </div>
      {item.caption && <figcaption className="public-gallery__caption">{item.caption}</figcaption>}
    </figure>
  );
}

function GalleryThumbnail({ item, onOpen }) {
  const [isReady, setIsReady] = React.useState(
    () => typeof IntersectionObserver === 'undefined'
  );
  const [hasError, setHasError] = React.useState(false);
  const containerRef = React.useRef(null);

  React.useEffect(() => {
    if (isReady || typeof IntersectionObserver === 'undefined') return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsReady(true);
        observer.disconnect();
      },
      { rootMargin: '400px 0px' }
    );

    const container = containerRef.current;
    if (container) observer.observe(container);

    return () => observer.disconnect();
  }, [isReady]);

  return (
    <div ref={containerRef} className="public-gallery__thumbnail">
      {!isReady && <div className="public-gallery__placeholder" aria-hidden="true">Loading image</div>}
      {isReady && !hasError && (
        <button
          type="button"
          className="public-gallery__image-trigger"
          onClick={() => onOpen(item)}
          aria-label={`Open image${item.caption ? `: ${item.caption}` : ''}`}
        >
          <img
            src={transformCloudinaryUrl(item.url, 'f_auto,q_auto,w_600,c_limit')}
            srcSet={getCloudinarySrcSet(item.url, [320, 480, 640]) || undefined}
            sizes="(max-width: 640px) calc(100vw - 2rem), (max-width: 1024px) calc((100vw - 3rem) / 2), 360px"
            alt={item.caption || 'Junda United Club Asset'}
            loading="lazy"
            decoding="async"
            onError={() => setHasError(true)}
          />
        </button>
      )}
      {isReady && hasError && (
        <div className="public-gallery__media-fallback" role="img" aria-label="Image unavailable">
          Image unavailable
        </div>
      )}
    </div>
  );
}

function ImageLightbox({ image, onClose }) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <Modal className="public-gallery__lightbox" label="Club image viewer" onClose={onClose}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <button type="button" className="public-gallery__lightbox-close" aria-label="Close image viewer" onClick={onClose}>
        <X size={24} aria-hidden="true" />
      </button>
      <figure className="public-gallery__lightbox-content">
        {hasError ? <p className="public-gallery__media-fallback">Image unavailable</p> : (
          <img src={transformCloudinaryUrl(image.url, 'f_auto,q_auto,w_1600,c_limit')}
            alt={image.caption || 'Junda United club gallery image'} onError={() => setHasError(true)} />
        )}
        {image.caption && <figcaption>{image.caption}</figcaption>}
      </figure>
    </Modal>
  );
}

function PageMessage({ message, onRetry }) {
  return (
    <main className="public-ui public-gallery public-gallery__state-page">
      <div className="public-container">
        <section className="public-gallery__state public-glass" role={onRetry ? 'alert' : 'status'}>
          <span className="public-gallery__eyebrow">Junda United FC Gallery</span>
          <h1>{message}</h1>
          {onRetry && (
            <button type="button" className="public-gallery__retry" onClick={onRetry}>
              Try again
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
