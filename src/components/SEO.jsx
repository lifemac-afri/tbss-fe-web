import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, ogImage, ogType, canonicalUrl, price, currency = 'GHS' }) => {
  const siteTitle = "Torchbearers Books and Stationery Services";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = "Ghana's leading bookshop and reading community. High-quality textbooks, stationery, and a vibrant community of readers.";
  const defaultKeywords = "bookshop, reading community, books ghana, stationery, stationery services, education";
  const defaultOgType = "website";
  const siteUrl = "https://tbssgh.com";

  // Ensure ogImage is an absolute URL for social crawlers (WhatsApp, Twitter, Facebook)
  let resolvedOgImage = ogImage || "/og.png";
  if (resolvedOgImage && !resolvedOgImage.startsWith('http://') && !resolvedOgImage.startsWith('https://')) {
    const origin = typeof window !== 'undefined' ? window.location.origin : siteUrl;
    resolvedOgImage = `${origin}${resolvedOgImage.startsWith('/') ? '' : '/'}${resolvedOgImage}`;
  }

  const currentUrl = typeof window !== 'undefined'
    ? window.location.href
    : `${siteUrl}${canonicalUrl || ''}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      {canonicalUrl && <link rel="canonical" href={`${siteUrl}${canonicalUrl}`} />}

      {/* Open Graph / Facebook / WhatsApp */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={resolvedOgImage} />
      <meta property="og:image:secure_url" content={resolvedOgImage} />
      <meta property="og:type" content={ogType || defaultOgType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteTitle} />

      {price && <meta property="product:price:amount" content={String(price)} />}
      {price && <meta property="product:price:currency" content={currency} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={resolvedOgImage} />
      <meta name="twitter:url" content={currentUrl} />
    </Helmet>
  );
};

export default SEO;

