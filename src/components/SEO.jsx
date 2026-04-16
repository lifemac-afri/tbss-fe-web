import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, ogImage, ogType, canonicalUrl }) => {
  const siteTitle = "Torchbearers Books and Stationery Services";
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = "Ghana's leading bookshop and reading community. High-quality textbooks, stationery, and a vibrant community of readers.";
  const defaultKeywords = "bookshop, reading community, books ghana, school supplies, stationery";
  const defaultOgImage = "/og.png";
  const defaultOgType = "website";
  const siteUrl = "https://tbssgh.com";

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />
      {canonicalUrl && <link rel="canonical" href={`${siteUrl}${canonicalUrl}`} />}

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:type" content={ogType || defaultOgType} />
      <meta property="og:url" content={`${siteUrl}${canonicalUrl || ''}`} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || defaultDescription} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />
    </Helmet>
  );
};

export default SEO;
