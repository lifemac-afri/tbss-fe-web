import { API_BASE } from './api';

export const DEFAULT_COVER = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=387&auto=format&fit=crop";

export function normalizeProduct(p) {
  const price = parseFloat(p.price || p.product_price || 0);
  const oldPrice = p.old_price ? parseFloat(p.old_price) : (p.oldPrice ? parseFloat(p.oldPrice) : null);
  const stockQty = parseInt(p.stock_quantity ?? p.stock ?? 0, 10);
  
  let rawImage = p.image || p.coverImage || p.product_image || p.cover_image || p.product_cover_image || null;
  if (rawImage && typeof rawImage === 'string') {
    if (!rawImage.startsWith('http://') && !rawImage.startsWith('https://') && !rawImage.startsWith('data:')) {
      const baseUrl = API_BASE || '';
      if (baseUrl) {
        rawImage = `${baseUrl}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`;
      }
    }
  } else {
    rawImage = DEFAULT_COVER;
  }

  const tag = p.tag || p.product_tag || p.format || p.product_format || p.cover_type || p.binding || 'Paperback';

  return {
    id: p.id,
    title: p.title || 'Unknown',
    author: p.author || '',
    slug: p.slug || '',
    description: p.description || '',
    price: price,
    oldPrice: oldPrice,
    discount: (() => {
      if (oldPrice && oldPrice > price) {
        return `${Math.round((oldPrice - price) / oldPrice * 100)}% OFF`;
      }
      return p.discount || null;
    })(),
    stock_quantity: stockQty,
    stockStatus: stockQty > 0 ? 'In-stock' : 'Out of stock',
    coverImage: rawImage,
    isbn: p.isbn || '',
    genre: p.genre_name || p.genre?.name || '',
    genreSlug: p.genre?.slug || p.genre_slug || '',
    rating: parseFloat(p.average_rating || p.rating || 0),
    reviews: parseInt(p.review_count || (!Array.isArray(p.reviews) ? p.reviews : 0) || 0, 10),
    reviewList: Array.isArray(p.reviews) ? p.reviews : [],
    tag: tag,
    created_at: p.created_at || null,
    is_active: p.is_active !== false,
    metaTitle: p.meta_title || '',
    metaDescription: p.meta_description || '',
    seoKeywords: p.seo_keywords || '',
  };
}

export function normalizeOrder(o) {
  return {
    id: String(o.id),
    status: capitalizeStatus(o.status),
    date: o.created_at ? new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '',
    total_amount: parseFloat(o.total_amount || 0),
    delivery: 15,
    items: (o.items || []).map((item) => ({
      id: item.id,
      title: item.product_name || 'Item',
      author: '',
      qty: item.quantity,
      price: parseFloat(item.price_at_purchase || item.product_price || 0),
      coverImage: item.image || null,
    })),
    trackingUrl: o.tracking_url || null,
    shipping_method: o.shipping_method || 'Standard Delivery',
    cancellation_reason: o.cancellation_reason || null,
  };
}

function capitalizeStatus(status) {
  const map = {
    pending: 'Processing',
    paid: 'Paid',
    processing: 'Processing',
    shipped: 'Dispatched',
    ready_for_pickup: 'Ready for Pickup',
    delivered: 'Delivered',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  return map[status] || status;
}
