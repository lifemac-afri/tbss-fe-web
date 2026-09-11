import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const API_BASE = process.env.VITE_API_URL || 'https://tbssgh.com';

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
    const res = await fetch(`${API_BASE}/api/products/${bookId}/`);
    if (res.ok) {
      book = await res.json();
    }
  } catch {
    // API network error or unreachable
  }

  if (!book) return html;

  const siteTitle = "Torchbearers Books and Stationery Services";
  const title = escapeHtml(book.title ? `${book.title} ${book.author ? `by ${book.author}` : ''} | ${siteTitle}` : siteTitle);
  const rawDesc = `${book.title} ${book.author ? `by ${book.author}` : ''} - ₵${book.price || ''}. ${book.description || ''}`.substring(0, 200);
  const description = escapeHtml(rawDesc);

  let coverImage = book.image || book.coverImage || '/og.png';
  if (!coverImage.startsWith('http://') && !coverImage.startsWith('https://')) {
    const baseUrl = `${protocol}://${host}`;
    coverImage = `${baseUrl}${coverImage.startsWith('/') ? '' : '/'}${coverImage}`;
  }
  coverImage = escapeHtml(coverImage);

  const pageUrl = escapeHtml(`${protocol}://${host}/books/${bookId}`);

  // Replace default title and meta tags
  let modifiedHtml = html;

  // Replace <title>
  modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/gi, `<title>${title}</title>`);
  modifiedHtml = modifiedHtml.replace(/<meta name="title" content=".*?" \/>/gi, `<meta name="title" content="${title}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta name="description" content=".*?" \/>/gi, `<meta name="description" content="${description}" />`);

  // Open Graph
  modifiedHtml = modifiedHtml.replace(/<meta property="og:title" content=".*?" \/>/gi, `<meta property="og:title" content="${title}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta property="og:description" content=".*?" \/>/gi, `<meta property="og:description" content="${description}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta property="og:image" content=".*?" \/>/gi, `<meta property="og:image" content="${coverImage}" /><meta property="og:image:secure_url" content="${coverImage}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta property="og:url" content=".*?" \/>/gi, `<meta property="og:url" content="${pageUrl}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta property="og:type" content=".*?" \/>/gi, `<meta property="og:type" content="product" /><meta property="product:price:amount" content="${book.price || ''}" /><meta property="product:price:currency" content="GHS" />`);

  // Twitter
  modifiedHtml = modifiedHtml.replace(/<meta property="twitter:title" content=".*?" \/>/gi, `<meta property="twitter:title" content="${title}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta property="twitter:description" content=".*?" \/>/gi, `<meta property="twitter:description" content="${description}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta property="twitter:image" content=".*?" \/>/gi, `<meta property="twitter:image" content="${coverImage}" />`);
  modifiedHtml = modifiedHtml.replace(/<meta property="twitter:url" content=".*?" \/>/gi, `<meta property="twitter:url" content="${pageUrl}" />`);

  return modifiedHtml;
}

const distPath = path.join(__dirname, 'dist');
const indexHtmlPath = fs.existsSync(path.join(distPath, 'index.html'))
  ? path.join(distPath, 'index.html')
  : path.join(__dirname, 'index.html');

// Route handler for /books/:id
app.get('/books/:id', async (req, res) => {
  try {
    const rawHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
    const host = req.get('host') || 'tbssgh.com';
    const protocol = req.protocol || 'https';
    const html = await injectBookMetaTags(rawHtml, req.params.id, host, protocol);
    res.setHeader('Content-Type', 'text/html');
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
