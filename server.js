import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const API_BASE = process.env.VITE_API_URL || 'https://tbssgh.com';

// Enable trust proxy so req.protocol properly detects HTTPS behind reverse proxies
app.set('trust proxy', true);

// List of social media and link preview crawler user agents
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

export function isCrawler(userAgent = '') {
  if (!userAgent) return false;
  const lower = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some((bot) => lower.includes(bot));
}

// Helper to escape HTML characters in meta content
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Function to inject meta tags into index.html content
export async function injectBookMetaTags(html, bookId, host, protocol = 'https') {
  let book = null;

  try {
    const res = await fetch(`${API_BASE}/api/products/${encodeURIComponent(bookId)}/`);
    if (res.ok) {
      book = await res.json();
    }
  } catch (err) {
    console.error(`[Crawler Middleware] Failed to fetch product ${bookId}:`, err.message);
  }

  if (!book) return html;

  const siteTitle = "Torchbearers Books and Stationery Services";
  const bookTitle = book.title || 'Book Details';
  const authorText = book.author ? `by ${book.author}` : '';
  const priceText = book.price ? `₵${book.price}` : '';

  const title = escapeHtml(`${bookTitle} ${authorText} | ${siteTitle}`);
  let descRaw = `${bookTitle} ${authorText} ${priceText ? `- ${priceText}. ` : ''}${book.description || ''}`;
  descRaw = descRaw.trim().substring(0, 200);
  const description = escapeHtml(descRaw);

  let rawCover = book.image || book.coverImage || book.product_image || book.cover_image || book.product_cover_image || null;
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
  const pageUrl = escapeHtml(`${protocol}://${host}/books/${bookId}`);

  let imageType = 'image/jpeg';
  if (coverImage.endsWith('.png')) imageType = 'image/png';
  else if (coverImage.endsWith('.webp')) imageType = 'image/webp';
  else if (coverImage.endsWith('.svg')) imageType = 'image/svg+xml';

  let modifiedHtml = html;

  // Replace <title> and basic meta tags
  modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);
  modifiedHtml = modifiedHtml.replace(/<meta name="title" content=".*?"\s*\/?>/gi, `<meta name="title" content="${title}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta name="description" content=".*?"\s*\/?>/gi, `<meta name="description" content="${description}" />`);

  // Open Graph
  modifiedHtml = modifiedHtml.replace(/<meta property="og:site_name" content=".*?"\s*\/?>/gi, `<meta property="og:site_name" content="${siteTitle}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta property="og:title" content=".*?"\s*\/?>/gi, `<meta property="og:title" content="${title}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta property="og:description" content=".*?"\s*\/?>/gi, `<meta property="og:description" content="${description}" />`);

  const ogImageReplacement = `<meta property="og:image" content="${safeCoverImage}" />
    <meta property="og:image:secure_url" content="${safeCoverImage}" />
    <meta property="og:image:type" content="${imageType}" />`;

  modifiedHtml = modifiedHtml.replace(/<meta property="og:image" content=".*?"\s*\/?>/gi, ogImageReplacement);
  modifiedHtml = modifiedHtml.replace(/<meta property="og:url" content=".*?"\s*\/?>/gi, `<meta property="og:url" content="${pageUrl}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta property="og:type" content=".*?"\s*\/?>/gi, `<meta property="og:type" content="product" /><meta property="product:price:amount" content="${book.price || ''}" /><meta property="product:price:currency" content="GHS" />`);

  // Twitter
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

  return modifiedHtml;
}

const distPath = path.join(__dirname, 'dist');
const indexHtmlPath = fs.existsSync(path.join(distPath, 'index.html'))
  ? path.join(distPath, 'index.html')
  : path.join(__dirname, 'index.html');

// Middleware for social crawler and book route link preview interception
app.use(async (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const isBookRoute = req.path.startsWith('/books/');

  if (isBookRoute || isCrawler(userAgent)) {
    let bookId = null;
    if (isBookRoute) {
      bookId = req.path.split('/')[2];
    }

    if (bookId) {
      try {
        const rawHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
        const host = req.get('host') || 'tbssgh.com';
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
        const html = await injectBookMetaTags(rawHtml, bookId, host, protocol);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(html);
      } catch (err) {
        console.error('[Crawler Middleware Error]:', err);
      }
    }
  }

  next();
});

// Route handler explicitly for /books/:id
app.get('/books/:id', async (req, res) => {
  try {
    const rawHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
    const host = req.get('host') || 'tbssgh.com';
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const html = await injectBookMetaTags(rawHtml, req.params.id, host, protocol);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch {
    res.sendFile(indexHtmlPath);
  }
});

// Serve static assets from dist
app.use(express.static(distPath));

// Fallback to SPA index.html for all other routes
app.use((req, res) => {
  res.sendFile(indexHtmlPath);
});

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

export default app;
