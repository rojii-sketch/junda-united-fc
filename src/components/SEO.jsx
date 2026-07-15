import { Helmet } from 'react-helmet-async';

export default function SEO({ title, description, name = "Junda United FC", type = "website" }) {
  return (
    <Helmet>
      {/* 1. Standard metadata tags */}
      <title>{title} | {name}</title>
      <meta name="description" content={description} />
      
      {/* 2. OpenGraph tags (For crisp Link Previews on WhatsApp, Facebook, LinkedIn) */}
      <meta property="og:title" content={`${title} | ${name}`} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={name} />
      
      {/* 3. Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${title} | ${name}`} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}