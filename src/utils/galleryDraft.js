export const emptyGalleryDraft = { type: 'image', url: '', urlType: null, caption: '' };

export function changeGalleryType(draft, type) {
  if (draft.type === type) return draft;
  return { ...draft, type, url: '', urlType: null };
}

function mediaUrlKey(url) {
  try {
    const parsed = new URL(url);
    parsed.hash = '';
    return parsed.href;
  } catch {
    return null;
  }
}

export function rememberGalleryUpload(uploadedMediaTypes, url, type) {
  const key = mediaUrlKey(url);
  if (key) uploadedMediaTypes.set(key, type);
}

export function getGalleryUploadType(uploadedMediaTypes, url) {
  return uploadedMediaTypes?.get(mediaUrlKey(url));
}

export function galleryPayload(draft, uploadedMediaTypes) {
  const { type, urlType, caption } = draft;
  const url = draft.url.trim();
  if (!url || type !== urlType) {
    throw new Error(type === 'video' ? 'Enter a video URL.' : 'Upload an image or enter an image URL.');
  }
  if (!/^https?:\/\//i.test(url)) {
    throw new Error('Enter a direct media URL starting with https:// or http://.');
  }
  const uploadedType = getGalleryUploadType(uploadedMediaTypes, url);
  if (uploadedType && uploadedType !== type) {
    throw new Error(uploadedType === 'image'
      ? 'This URL belongs to an uploaded image. Select Image or enter a different video URL.'
      : 'This URL belongs to an uploaded video. Select Video or enter a different image URL.');
  }
  return { type, url, caption };
}
