import assert from 'node:assert/strict';
import test from 'node:test';
import { galleryImageSources, galleryRetryUrl } from './galleryMedia.js';

test('gallery photos use responsive Cloudinary limits without cropping', () => {
  const url = 'https://res.cloudinary.com/demo/image/upload/v1/portrait.jpg';
  const sources = galleryImageSources(url, 640, [320, 640]);
  assert.equal(sources.src, 'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640,c_limit/v1/portrait.jpg');
  assert.equal(sources.srcSet, [
    'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_320,c_limit/v1/portrait.jpg 320w',
    'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640,c_limit/v1/portrait.jpg 640w'
  ].join(', '));
});

test('gallery photos preserve supplied URLs when responsive transforms cannot be safely added', () => {
  for (const url of [
    '/club/portrait.jpg',
    'https://photos.example.test/res.cloudinary.com/demo/image/upload/portrait.jpg',
    'https://res.cloudinary.com/demo/image/upload/w_640,c_fill/portrait.jpg',
    'https://res.cloudinary.com/demo/image/upload/s--abCD__12--/portrait.jpg',
    'https://res.cloudinary.com/demo/video/upload/match.mp4'
  ]) {
    assert.deepEqual(galleryImageSources(url, 640, [320, 640]), { src: url });
  }
});

test('retry bypasses cached failures for safe Cloudinary URLs, preserving responsive variants', () => {
  const url = 'https://res.cloudinary.com/demo/image/upload/v1/portrait.jpg';
  assert.equal(galleryRetryUrl(url, 'attempt-2'), url + '?_junda_retry=attempt-2');
  const sources = galleryImageSources(url, 640, [320, 640], 'attempt-2');
  assert.match(sources.src, /w_640,c_limit\/v1\/portrait\.jpg\?_junda_retry=attempt-2$/);
  assert.ok(sources.srcSet.split(', ').every(candidate => candidate.includes('?_junda_retry=attempt-2 ')));
});

test('retry preserves signed, query-bearing and non-Cloudinary sources verbatim', () => {
  for (const url of [
    'https://res.cloudinary.com/demo/image/upload/s--abCD__12--/portrait.jpg',
    'https://res.cloudinary.com/demo/image/upload/v1/portrait.jpg?__cld_token__=test',
    'https://photos.example.test/portrait.jpg'
  ]) {
    assert.equal(galleryRetryUrl(url, 'attempt-2'), url);
    assert.deepEqual(galleryImageSources(url, 640, [320, 640], 'attempt-2'), { src: url });
  }
});
