import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const API_BASE = process.env.VITE_API_URL || 'https://tbssgh.com';

const fallbackBooks = [
  {
    id: 1,
    title: "How Rich People Think",
    author: "Steve Siebold",
    price: 145,
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=387&auto=format&fit=crop",
    description: "Explore the stark differences between the mental approach of the wealthy and the middle class. Steve Siebold breaks down 21 ways the rich see and think about money differently."
  },
  {
    id: 2,
    title: "The Temporary Roomie",
    author: "Sarah Adams",
    price: 145,
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=400&auto=format&fit=crop",
    description: "When Sadie agrees to move in with Dr. Joshua Gibson temporarily, she expects it to be simple. A warm, funny, and romantic novel."
  },
  {
    id: 3,
    title: "The Subtle Art of Not Giving A Fuck",
    author: "Mark Manson",
    price: 145,
    coverImage: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=400&auto=format&fit=crop",
    description: "Mark Manson argues that the key to living a good life is choosing what truly matters. A refreshing, counterintuitive guide."
  },
  {
    id: 4,
    title: "Educated",
    author: "Tara Westover",
    price: 145,
    coverImage: "https://images.unsplash.com/photo-1512591050681-17c1693fa111?q=80&w=400&auto=format&fit=crop",
    description: "Tara Westover grew up in the mountains of Idaho with survivalist parents. A powerful memoir about education and self-reinvention."
  },
  {
    id: 6,
    title: "Atomic Habits",
    author: "James Clear",
    price: 220,
    coverImage: "https://images.unsplash.com/photo-1581447100595-37710ca14fbe?q=80&w=400&auto=format&fit=crop",
    description: "Tiny changes, remarkable results. James Clear reveals how small daily habits compound into life-changing transformation."
  }
];

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
  } catch (e) {
    // API network error or offline fallback
  }

  if (!book) {
    book = fallbackBooks.find((b) => String(b.id) === String(bookId));
  }

  if (!book) return html;

  const siteTitle = "Torchbearers Books and Stationery Services";
  const title = escapeHtml(book.title ? `${book.title} ${book.author ? `by ${book.author}` : ''} | ${siteTitle}` : siteTitle);
  const rawDesc = `${book.title} ${book.author ? `by ${book.author}` : ''} - ₵${book.price || ''}. ${book.description || ''}`.substring(0, 200);
  const description = escapeHtml(rawDesc);

  let coverImage = book.coverImage || book.image || '/og.png';
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
  } catch (err) {
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
