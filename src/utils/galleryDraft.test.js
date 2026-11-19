import assert from 'node:assert/strict';
import test from 'node:test';
import { changeGalleryType, emptyGalleryDraft, galleryPayload, rememberGalleryUpload } from './galleryDraft.js';

test('produces the existing API payload for uploaded images and typed video URLs', () => {
  const image = { ...emptyGalleryDraft, url: 'https://example.test/photo.png', urlType: 'image', caption: 'Matchday' };
  assert.deepEqual(galleryPayload(image), { type: 'image', url: image.url, caption: 'Matchday' });

  const video = { ...changeGalleryType(image, 'video'), url: ' https://example.test/media/123 ', urlType: 'video' };
  assert.deepEqual(galleryPayload(video), { type: 'video', url: 'https://example.test/media/123', caption: 'Matchday' });
});

test('clears incompatible sources and rejects mismatched or unsupported payloads', () => {
  const image = { ...emptyGalleryDraft, url: 'https://example.test/photo.png', urlType: 'image' };
  assert.equal(changeGalleryType(image, 'image'), image);
  const switched = changeGalleryType(image, 'video');
  assert.equal(switched.url, '');
  assert.equal(switched.urlType, null);
  assert.throws(() => galleryPayload(switched), /Enter a video URL/);
  assert.throws(() => galleryPayload({ ...image, type: 'video' }), /Enter a video URL/);
  assert.throws(() => galleryPayload({ ...image, url: 'file:///photo.png' }), /http/);
});

test('known uploads keep their media type after manual re-entry', () => {
  const uploads = new Map();
  rememberGalleryUpload(uploads, 'https://example.test/asset/123', 'image');
  rememberGalleryUpload(uploads, 'https://example.test/asset/456', 'video');

  const pastedImage = { ...emptyGalleryDraft, type: 'video', urlType: 'video', url: 'https://example.test/asset/123#preview' };
  assert.throws(() => galleryPayload(pastedImage, uploads), /uploaded image/);
  const pastedVideo = { ...emptyGalleryDraft, urlType: 'image', url: 'https://example.test/asset/456' };
  assert.throws(() => galleryPayload(pastedVideo, uploads), /uploaded video/);
  assert.deepEqual(galleryPayload({ ...pastedImage, type: 'image', urlType: 'image' }, uploads),
    { type: 'image', url: pastedImage.url, caption: '' });
  assert.equal(galleryPayload(pastedImage, new Map()).type, 'video');
});
