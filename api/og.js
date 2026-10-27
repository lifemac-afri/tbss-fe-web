import fs from 'fs';
import path from 'path';

const API_BASE = process.env.VITE_API_URL || 'https://tbssgh.com';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

const CRAWLER_USER_AGENTS = [
  'facebookexternalhit',
  'facebot',
  'whatsapp',
  'twitterbot',
  'telegrambot',
  'linkedinbot',
  'slackbot',
  'discordbot',
  'googlebot',
  'bingbot',
  'applebot',
  'pinterest',
  'skypeuripreview',
  'outbrain',
  'yahoo! slurp',
  'embedly',
  'vkshare',
  'quora link preview',
  'curl',
  'wget',
  'python-requests'
];

function isCrawler(userAgent = '') {
  if (!userAgent) return false;
  const lower = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some((bot) => lower.includes(bot));
}

export default async function handler(req, res) {
  const { id } = req.query;
  const userAgent = req.headers['user-agent'] || '';
  const host = req.headers['host'] || 'tbssgh.com';
  const protocol = req.headers['x-forwarded-proto'] || 'https';

  // Extract book ID or slug from request query or URL path
  let bookId = id;
  if (!bookId && req.url) {
    const parts = req.url.split('?')[0].split('/');
    bookId = parts[parts.length - 1];
  }

  let book = null;
  if (bookId) {
    try {
      const apiRes = await fetch(`${API_BASE}/api/products/${encodeURIComponent(bookId)}/`);
      if (apiRes.ok) {
        book = await apiRes.json();
      }
    } catch (err) {
      console.error('[OG API] Failed to fetch book:', err.message);
    }
  }

  const siteTitle = "Torchbearers Books and Stationery Services";
  const bookTitle = book?.title || 'Book Details';
  const authorText = book?.author ? `by ${book.author}` : '';
  const priceText = book?.price ? `₵${book.price}` : '';

  const title = escapeHtml(`${bookTitle} ${authorText} | ${siteTitle}`);
  let rawDesc = `${bookTitle} ${authorText} ${priceText ? `- ${priceText}. ` : ''}${book?.description || ''}`;
  rawDesc = rawDesc.trim().substring(0, 200);
  const description = escapeHtml(rawDesc);

  let rawCover = book ? (book.image || book.coverImage || book.product_image || book.cover_image || book.product_cover_image || null) : null;
  let coverImage = `${protocol}://${host}/og.png`;

  if (rawCover && typeof rawCover === 'string') {
    if (rawCover.startsWith('http://') || rawCover.startsWith('https://')) {
      coverImage = rawCover;
    } else {
      const base = API_BASE.startsWith('http') ? API_BASE : `${protocol}://${host}`;
      coverImage = `${base}${rawCover.startsWith('/') ? '' : '/'}${rawCover}`;
    }
  }

  if (!host.includes('localhost') && coverImage.startsWith('http://')) {
    coverImage = coverImage.replace('http://', 'https://');
  }

  const safeCoverImage = escapeHtml(coverImage);
  const pageUrl = escapeHtml(`${protocol}://${host}/books/${bookId || ''}`);

  let imageType = 'image/jpeg';
  if (coverImage.endsWith('.png')) imageType = 'image/png';
  else if (coverImage.endsWith('.webp')) imageType = 'image/webp';
  else if (coverImage.endsWith('.svg')) imageType = 'image/svg+xml';

  // Read index.html if available to preserve full SPA scripts
  let htmlTemplate = '';
  try {
    const indexPath = path.join(process.cwd(), 'dist', 'index.html');
    if (fs.existsSync(indexPath)) {
      htmlTemplate = fs.readFileSync(indexPath, 'utf-8');
    } else {
      const devIndexPath = path.join(process.cwd(), 'index.html');
      if (fs.existsSync(devIndexPath)) {
        htmlTemplate = fs.readFileSync(devIndexPath, 'utf-8');
      }
    }
  } catch {}

  if (htmlTemplate) {
    let modifiedHtml = htmlTemplate;
    modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);
    modifiedHtml = modifiedHtml.replace(/<meta name="title" content=".*?"\s*\/?>/gi, `<meta name="title" content="${title}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta name="description" content=".*?"\s*\/?>/gi, `<meta name="description" content="${description}" />`);

    modifiedHtml = modifiedHtml.replace(/<meta property="og:site_name" content=".*?"\s*\/?>/gi, `<meta property="og:site_name" content="${siteTitle}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="og:title" content=".*?"\s*\/?>/gi, `<meta property="og:title" content="${title}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="og:description" content=".*?"\s*\/?>/gi, `<meta property="og:description" content="${description}" />`);

    const ogImageTags = `<meta property="og:image" content="${safeCoverImage}" />
    <meta property="og:image:secure_url" content="${safeCoverImage}" />
    <meta property="og:image:type" content="${imageType}" />`;

    modifiedHtml = modifiedHtml.replace(/<meta property="og:image" content=".*?"\s*\/?>/gi, ogImageTags);
    modifiedHtml = modifiedHtml.replace(/<meta property="og:url" content=".*?"\s*\/?>/gi, `<meta property="og:url" content="${pageUrl}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="og:type" content=".*?"\s*\/?>/gi, `<meta property="og:type" content="product" /><meta property="product:price:amount" content="${book?.price || ''}" /><meta property="product:price:currency" content="GHS" />`);

    modifiedHtml = modifiedHtml.replace(/<meta property="twitter:card" content=".*?"\s*\/?>/gi, `<meta name="twitter:card" content="summary_large_image" />`);
    modifiedHtml = modifiedHtml.replace(/<meta name="twitter:card" content=".*?"\s*\/?>/gi, `<meta name="twitter:card" content="summary_large_image" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="twitter:title" content=".*?"\s*\/?>/gi, `<meta name="twitter:title" content="${title}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta name="twitter:title" content=".*?"\s*\/?>/gi, `<meta name="twitter:title" content="${title}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="twitter:description" content=".*?"\s*\/?>/gi, `<meta name="twitter:description" content="${description}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta name="twitter:description" content=".*?"\s*\/?>/gi, `<meta name="twitter:description" content="${description}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="twitter:image" content=".*?"\s*\/?>/gi, `<meta name="twitter:image" content="${safeCoverImage}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta name="twitter:image" content=".*?"\s*\/?>/gi, `<meta name="twitter:image" content="${safeCoverImage}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta property="twitter:url" content=".*?"\s*\/?>/gi, `<meta name="twitter:url" content="${pageUrl}" />`);
    modifiedHtml = modifiedHtml.replace(/<meta name="twitter:url" content=".*?"\s*\/?>/gi, `<meta name="twitter:url" content="${pageUrl}" />`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
    return res.status(200).send(modifiedHtml);
  }

  // Fallback standalone HTML meta page for crawlers
  const fallbackHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />
    
    <!-- Open Graph / WhatsApp / Facebook -->
    <meta property="og:type" content="product" />
    <meta property="og:site_name" content="${siteTitle}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${safeCoverImage}" />
    <meta property="og:image:secure_url" content="${safeCoverImage}" />
    <meta property="og:image:type" content="${imageType}" />
    <meta property="og:url" content="${pageUrl}" />
    ${book?.price ? `<meta property="product:price:amount" content="${book.price}" /><meta property="product:price:currency" content="GHS" />` : ''}

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${safeCoverImage}" />
    <meta name="twitter:url" content="${pageUrl}" />

  </head>
  <body>
    <p>Redirecting to <a href="${pageUrl}">${title}</a>...</p>
  </body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=600, s-maxage=600');
  return res.status(200).send(fallbackHtml);
}
