import { useLayoutEffect } from 'react';
import { Helmet } from 'react-helmet-async';

let publishedArticleCount = 0;
let siteDefaults = [];

// Keep the static shell metadata for no-JS visitors. While a resolved
// article is mounted, its metadata should be the only matching head tags.
function useArticleMetadata(type, url) {
  useLayoutEffect(() => {
    if (type !== 'article' || !url) return undefined;
    if (publishedArticleCount === 0) {
      siteDefaults = [...document.head.querySelectorAll('[data-site-seo-default]')];
      siteDefaults.forEach(tag => tag.remove());
    }
    publishedArticleCount += 1;
    return () => {
      publishedArticleCount -= 1;
      if (publishedArticleCount === 0) {
        document.head.append(...siteDefaults);
        siteDefaults = [];
      }
    };
  }, [type, url]);
}

export default function SEO({ title, description, image, name = "Junda United FC", type = "website", url, publishedTime }) {
  useArticleMetadata(type, url);

  return (
    <Helmet>
      {/* 1. Standard metadata tags */}
      <title>{`${title} | ${name}`}</title>
      <meta name="description" content={description} />
      
      {/* 2. OpenGraph tags (For crisp Link Previews on WhatsApp, Facebook, LinkedIn) */}
      <meta property="og:title" content={`${title} | ${name}`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={name} />
      {url && <link rel="canonical" href={url} />}
      {url && <meta property="og:url" content={url} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      
      {/* 🎯 NEW: This tells WhatsApp which photo to show */}
      {image && <meta property="og:image" content={image} />} 
      
      {/* 3. Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | ${name}`} />
      <meta name="twitter:description" content={description} />
      
      {/* 🎯 NEW: Twitter photo tag */}
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
}