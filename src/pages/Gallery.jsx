import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import Modal from '../components/ui/Modal';
import PublicHero from '../components/ui/PublicHero';
import React from 'react';
import SEO from '../components/SEO';
import { fetchJson } from '../api';
import GalleryPhoto from '../components/ui/GalleryPhoto';
import './Gallery.css';

function isImage(item) {
  return item.type !== 'video';
}

export default function Gallery() {
  const [selectedImageId, setSelectedImageId] = React.useState(null);
  const [gallery, setGallery] = React.useState([]);
  const [status, setStatus] = React.useState('loading');
  const [retryCount, setRetryCount] = React.useState(0);
  const photos = gallery.filter(isImage);
  const selectedIndex = photos.findIndex(item => item._id === selectedImageId);

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
      <main className="public-container public-gallery__container">
        <PublicHero title="Club gallery" description="Matchdays, training, academy activity and community moments." />

        {gallery.length === 0 ? (
          <section className="public-gallery__empty public-glass" aria-labelledby="gallery-empty-heading">
            <h2 id="gallery-empty-heading">No gallery media yet</h2>
            <p>Check back for photos and videos from the club.</p>
          </section>
        ) : (
          <section className="public-gallery__grid" aria-label="Club gallery media">
            {gallery.map(item => (
              <MediaCard
                key={item._id}
                item={item}
                onOpenImage={setSelectedImageId}
              />
            ))}
          </section>
        )}

        {selectedIndex >= 0 && (
          <ImageLightbox photos={photos} index={selectedIndex} onSelect={setSelectedImageId}
            onClose={() => setSelectedImageId(null)} />
        )}
      </main>
    </div>
  );
}

function MediaCard({ item, onOpenImage }) {
  const image = isImage(item);

  return (
    <figure className="public-gallery__card">
      <div className="public-gallery__media">
        {image ? (
          <>
            <button type="button" className="public-gallery__image-trigger"
              onClick={event => {
                event.currentTarget.focus({ preventScroll: true });
                onOpenImage(item._id);
              }}
              aria-label={`Open image${item.caption ? `: ${item.caption}` : ''}`}>
              <Expand size={18} aria-hidden="true" />
            </button>
            <GalleryPhoto key={item.url} url={item.url} alt="" width={640} widths={[320, 480, 640, 960]}
              sizes="(max-width: 540px) calc(100vw - 2rem), (max-width: 960px) calc((100vw - 3rem) / 2), 380px" />
          </>
        ) : (
          <>
            <span className="public-gallery__media-badge" aria-hidden="true">Video</span>
            <video src={item.url} controls muted loop preload="none" playsInline
              aria-label={item.caption || 'Junda United FC gallery video'} />
          </>
        )}
      </div>
      {item.caption && <figcaption className="public-gallery__caption">{item.caption}</figcaption>}
    </figure>
  );
}

function ImageLightbox({ photos, index, onSelect, onClose }) {
  const image = photos[index];
  const canNavigate = photos.length > 1;
  const [failedPhotoIds, setFailedPhotoIds] = React.useState(() => new Set());

  function rememberFailure(failed) {
    setFailedPhotoIds(current => {
      const next = new Set(current);
      if (failed) next.add(image._id);
      else next.delete(image._id);
      return next;
    });
  }

  function move(direction) {
    onSelect(photos[(index + direction + photos.length) % photos.length]._id);
  }

  return (
    <Modal className="public-gallery__lightbox" label="Club image viewer" onClose={onClose}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}
      onKeyDown={event => {
        if (!canNavigate || !['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        // Image retry controls are replaced on navigation. Keep focus on a
        // persistent viewer control when an arrow key is pressed from them.
        if (event.target.closest('.gallery-photo')) {
          event.currentTarget.querySelector('.public-gallery__lightbox-close')?.focus();
        }
        move(event.key === 'ArrowLeft' ? -1 : 1);
      }}>
      <header className="public-gallery__viewer-header">
        <p className="public-gallery__image-count" role="status" aria-atomic="true">
          <span aria-hidden="true">{index + 1} / {photos.length}</span>
          <span className="public-gallery__sr-only">
            Photo {index + 1} of {photos.length}{image.caption ? `: ${image.caption}` : ''}
          </span>
        </p>
        <button type="button" className="public-gallery__viewer-button public-gallery__lightbox-close"
          aria-label="Close image viewer" onClick={onClose}>
          <X size={24} aria-hidden="true" />
        </button>
      </header>
      <figure className="public-gallery__lightbox-content">
        <GalleryPhoto key={image._id} url={image.url} alt={image.caption || 'Junda United club gallery photo'}
          rememberedFailure={failedPhotoIds.has(image._id)} onFailureChange={rememberFailure}
          width={1600} widths={[640, 960, 1600, 2400]} sizes="(max-width: 680px) 95vw, min(94vw, 90rem)" eager />
        {image.caption && <figcaption tabIndex={0}>{image.caption}</figcaption>}
      </figure>
      {canNavigate && (
        <div className="public-gallery__viewer-nav" role="group" aria-label="Photo navigation">
          <button type="button" className="public-gallery__viewer-button" onClick={() => move(-1)}>
            <ChevronLeft size={20} aria-hidden="true" /> Previous photo
          </button>
          <button type="button" className="public-gallery__viewer-button" onClick={() => move(1)}>
            Next photo <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      )}
    </Modal>
  );
}

function PageMessage({ message, onRetry }) {
  return (
    <main className="public-ui public-gallery public-gallery__state-page">
      <div className="public-container">
        <section className="public-gallery__state public-glass" role={onRetry ? 'alert' : 'status'}>
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
