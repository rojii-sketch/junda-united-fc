import { useEffect, useState } from 'react';
import GalleryPhoto from '../ui/GalleryPhoto';

function imagePreviewUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch {
    return '';
  }
}

export default function AdminGalleryPreview({ url, type, uploadedType, isUploading }) {
  const source = imagePreviewUrl(url);
  const [settledSource, setSettledSource] = useState('');
  const mismatch = uploadedType && uploadedType !== type;

  useEffect(() => {
    if (!source || mismatch || type !== 'image') return undefined;
    const timer = setTimeout(() => setSettledSource(source), 350);
    return () => clearTimeout(timer);
  }, [source, mismatch, type]);

  let feedback;
  if (isUploading) feedback = 'Uploading image…';
  else if (!source && url.trim()) feedback = 'Enter a valid HTTP or HTTPS media URL.';
  else if (mismatch) feedback = `This is an uploaded ${uploadedType}. Change the media type or enter a different URL.`;
  else if (source) feedback = uploadedType ? 'Source: uploaded image.' : 'Source: pasted media URL.';

  if (!feedback) return null;
  return (
    <div className="admin-gallery-preview">
      <p id="gallery-preview-feedback" role="status">{feedback}</p>
      {type === 'image' && source && source === settledSource && !mismatch && !isUploading && (
        <figure className="admin-gallery-preview__frame">
          <GalleryPhoto key={source} url={source} alt="Gallery image preview"
            width={480} widths={[320, 480, 640]} sizes="(max-width: 540px) 85vw, 24rem" eager />
        </figure>
      )}
    </div>
  );
}
