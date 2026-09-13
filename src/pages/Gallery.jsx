import React from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
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
  const triggerRef = React.useRef(null);
  const closeButtonRef = React.useRef(null);
  const previousImageRef = React.useRef(null);
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

  React.useEffect(() => {
    if (selectedImage) {
      previousImageRef.current = selectedImage;
      closeButtonRef.current?.focus();
      return undefined;
    }

    if (previousImageRef.current) {
      triggerRef.current?.focus();
      previousImageRef.current = null;
    }

    return undefined;
  }, [selectedImage]);

  React.useEffect(() => {
    if (!selectedImage) return undefined;

    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const openImage = (item, event) => {
    triggerRef.current = event.currentTarget;
    setSelectedImage(item);
  };

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
        <header className="public-gallery__header public-glass">
          <span className="public-gallery__eyebrow">Junda United FC</span>
          <h1>Club gallery</h1>
          <p>Matchdays, training sessions, academy activity, and community moments from around the club.</p>
        </header>

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
                onOpenImage={openImage}
              />
            ))}
          </section>
        )}

        <AnimatePresence>
          {selectedImage && (
            <ImageLightbox
              image={selectedImage}
              closeButtonRef={closeButtonRef}
              onClose={() => setSelectedImage(null)}
              shouldReduceMotion={shouldReduceMotion}
            />
          )}
        </AnimatePresence>
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
          onClick={event => onOpen(item, event)}
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

function ImageLightbox({ image, closeButtonRef, onClose, shouldReduceMotion }) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <motion.div
      className="public-gallery__lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Junda United FC image viewer"
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={shouldReduceMotion ? undefined : { opacity: 0 }}
      onClick={onClose}
    >
      <button
        ref={closeButtonRef}
        type="button"
        className="public-gallery__lightbox-close"
        aria-label="Close image viewer"
        onClick={onClose}
      >
        <span aria-hidden="true">✕</span>
      </button>
      <motion.figure
        className="public-gallery__lightbox-content"
        initial={shouldReduceMotion ? false : { scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={shouldReduceMotion ? undefined : { scale: 0.96, opacity: 0 }}
        onClick={event => event.stopPropagation()}
      >
        {!hasError ? (
          <img
            src={transformCloudinaryUrl(image.url, 'f_auto,q_auto,w_1600,c_limit')}
            alt={image.caption || 'Junda United Club Asset'}
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="public-gallery__media-fallback" role="img" aria-label="Image unavailable">
            Image unavailable
          </div>
        )}
        {image.caption && (
          <figcaption id="gallery-lightbox-caption">{image.caption}</figcaption>
        )}
      </motion.figure>
    </motion.div>
  );
}

function PageMessage({ message, onRetry }) {
  return (
    <div className="public-ui public-gallery public-gallery__state-page">
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
    </div>
  );
}
