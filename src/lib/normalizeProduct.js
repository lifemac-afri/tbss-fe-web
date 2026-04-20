export function normalizeProduct(p) {
  const stockQty = parseInt(p.stock_quantity ?? p.stock ?? 0, 10);
  return {
    id: p.id,
    title: p.title || 'Unknown',
    author: p.author || '',
    slug: p.slug || '',
    description: p.description || '',
    price: parseFloat(p.price || 0),
    oldPrice: p.old_price ? parseFloat(p.old_price) : null,
    discount: (() => {
      const price = parseFloat(p.price || 0);
      const old = p.old_price ? parseFloat(p.old_price) : null;
      if (old && old > price) {
        return `${Math.round((old - price) / old * 100)}% OFF`;
      }
      return p.discount || null;
    })(),
    stock_quantity: stockQty,
    stockStatus: stockQty > 0 ? 'In-stock' : 'Out of stock',
    coverImage: p.image || p.coverImage || null,
    isbn: p.isbn || '',
    genre: p.genre_name || p.genre?.name || '',
    genreSlug: p.genre?.slug || p.genre_slug || '',
    rating: parseFloat(p.average_rating || p.rating || 0),
    reviews: parseInt(p.review_count || (!Array.isArray(p.reviews) ? p.reviews : 0) || 0, 10),
    reviewList: Array.isArray(p.reviews) ? p.reviews : [],
    tag: p.tag || 'Paperback',
    created_at: p.created_at || null,
    is_active: p.is_active !== false,
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
