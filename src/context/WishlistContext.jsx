import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

function normalizeWishlistItem(entry) {
  const p = entry.product || entry;
  return {
    id: p.id,
    wishlistEntryId: entry.id,
    title: p.title || entry.title || 'Unknown',
    price: parseFloat(p.price || entry.price || 0),
    coverImage: p.image || entry.coverImage || null,
    author: p.author || entry.author || '',
    average_rating: p.average_rating || 0,
    in_stock: entry.in_stock !== false,
    addedAt: entry.created_at || Date.now(),
  };
}

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  const loadWishlist = useCallback(async () => {
    if (!isAuthenticated) { setWishlistItems([]); return; }
    try {
      const res = await api.get('/api/wishlist/');
      if (!res.ok) return;
      const data = await res.json();
      const items = (data.results || data || []).map(normalizeWishlistItem);
      setWishlistItems(items);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => {
    loadWishlist();
  }, [isAuthenticated, loadWishlist]);

  const wishlistCount = wishlistItems.length;

  const isInWishlist = useCallback(
    (bookId) => wishlistItems.some((item) => item.id === bookId),
    [wishlistItems]
  );

  const toggleWishlist = useCallback(async (book) => {
    const alreadyIn = wishlistItems.some((item) => item.id === book.id);
    if (alreadyIn) {
      setWishlistItems((prev) => prev.filter((item) => item.id !== book.id));
      if (isAuthenticated) {
        try { await api.del(`/api/wishlist/${book.id}/`); } catch {}
      }
    } else {
      const optimistic = {
        id: book.id,
        title: book.title,
        price: parseFloat(book.price || 0),
        coverImage: book.coverImage || book.image || null,
        author: book.author || '',
        addedAt: Date.now(),
      };
      setWishlistItems((prev) => [...prev, optimistic]);
      if (isAuthenticated) {
        try {
          const res = await api.post('/api/wishlist/', { product_id: book.id });
          if (res.ok) await loadWishlist();
        } catch {}
      }
    }
  }, [wishlistItems, isAuthenticated, loadWishlist]);

  const removeFromWishlist = useCallback(async (bookId) => {
    setWishlistItems((prev) => prev.filter((item) => item.id !== bookId));
    if (isAuthenticated) {
      try { await api.del(`/api/wishlist/${bookId}/`); } catch {}
    }
  }, [isAuthenticated]);

  const openWishlist = useCallback(() => setIsWishlistOpen(true), []);
  const closeWishlist = useCallback(() => setIsWishlistOpen(false), []);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        isWishlistOpen,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        openWishlist,
        closeWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export default WishlistContext;
