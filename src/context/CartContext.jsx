import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';
import { DEFAULT_COVER, resolveImageUrl } from '../lib/normalizeProduct';

const CartContext = createContext(null);

// coverImage / tag stay null when the API omits them, so loadCart can fall back to what the UI already knows.
function normalizeItem(item) {
  const rawImage = resolveImageUrl(item.product_image || item.product_cover_image || item.image || item.coverImage || item.product?.image || item.product?.coverImage || item.product?.cover_image);

  const tag = item.product_tag || item.tag || item.format || item.product_format || item.product?.tag || item.product?.format || item.cover_type || item.binding || null;

  return {
    id: item.id,
    productId: item.product?.id ?? item.product ?? item.productId ?? item.id,
    title: item.product_name || item.product?.title || item.title || null,
    price: parseFloat(item.product_price || item.price || item.product?.price || 0),
    quantity: item.quantity || 1,
    subtotal: parseFloat(item.subtotal || 0),
    coverImage: rawImage,
    author: item.product_author || item.author || item.product?.author || '',
    tag: tag,
    stock_quantity: typeof item.product_stock_quantity === 'number'
      ? item.product_stock_quantity
      : typeof item.stock_quantity === 'number'
        ? item.stock_quantity
        : typeof item.stock === 'number'
          ? item.stock
          : typeof item.product?.stock_quantity === 'number'
            ? item.product.stock_quantity
            : typeof item.product?.stock === 'number'
              ? item.product.stock
              : 99,
  };
}

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartModalBook, setCartModalBook] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const hasSynced = useRef(false);

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const loadCart = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await api.get('/api/cart/items/');
      if (!res.ok) return;
      const data = await res.json();
      const items = (data.items || []).map(normalizeItem);
      setCartItems((prev) => items.map((item) => {
        const known = prev.find((p) => String(p.productId) === String(item.productId));
        return {
          ...item,
          title: item.title || known?.title || 'Unknown',
          coverImage: item.coverImage || known?.coverImage || DEFAULT_COVER,
          author: item.author || known?.author || '',
          tag: item.tag || known?.tag || 'Paperback',
        };
      }));
      if (data.id) setCartId(data.id);
    } catch {} finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
    hasSynced.current = true;
  }, [isAuthenticated, loadCart]);

  const isInCart = useCallback(
    (productId) => cartItems.some((i) => String(i.productId) === String(productId)),
    [cartItems]
  );

  const addToCart = useCallback(async (product, qty = 1) => {
    const existing = cartItems.find((i) => String(i.productId) === String(product.id));

    const maxAllowed = typeof product.stock_quantity === 'number'
      ? product.stock_quantity
      : typeof product.stock === 'number'
        ? product.stock
        : 99;

    if (existing) {
      const itemMax = typeof existing.stock_quantity === 'number' ? existing.stock_quantity : maxAllowed;
      const newQty = Math.min(existing.quantity + qty, itemMax);
      setCartItems((prev) => prev.map((i) => i.id === existing.id ? { ...i, quantity: newQty } : i));
      if (!String(existing.id).startsWith('temp_')) {
        try {
          await api.patch(`/api/cart/items/${existing.id}/`, { quantity: newQty });
        } catch {}
      }
      return;
    }

    const cappedQty = Math.min(qty, maxAllowed);
    // Optimistic line item carries the same title/cover the user just saw; loadCart keeps them if the API omits them.
    const optimistic = {
      id: `temp_${Date.now()}`,
      productId: product.id,
      title: product.title,
      price: parseFloat(product.price || 0),
      quantity: cappedQty,
      coverImage: resolveImageUrl(product.coverImage || product.image || product.product_image) || DEFAULT_COVER,
      author: product.author || '',
      tag: product.tag || product.product_tag || product.format || product.product_format || 'Paperback',
      stock_quantity: maxAllowed,
    };
    setCartItems((prev) => [...prev, optimistic]);
    try {
      const res = await api.post('/api/cart/items/', { product: product.id, quantity: cappedQty });
      if (res.ok) {
        await loadCart();
      }
    } catch {}
  }, [cartItems, loadCart]);

  const removeFromCart = useCallback(async (itemId) => {
    const item = cartItems.find((i) => i.id === itemId);
    setCartItems((prev) => prev.filter((i) => i.id !== itemId));
    if (item?.id && !String(item.id).startsWith('temp_')) {
      try {
        await api.del(`/api/cart/items/${item.id}/`);
      } catch {}
    }
  }, [cartItems]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) { removeFromCart(itemId); return; }
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) return;
    const maxAllowed = typeof item.stock_quantity === 'number' ? item.stock_quantity : 99;
    const cappedQuantity = Math.min(quantity, maxAllowed);
    setCartItems((prev) =>
      prev.map((i) => i.id === itemId ? { ...i, quantity: cappedQuantity } : i)
    );
    if (item?.id && !String(item.id).startsWith('temp_')) {
      try {
        await api.patch(`/api/cart/items/${item.id}/`, { quantity: cappedQuantity });
      } catch {}
    }
  }, [cartItems, removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const openAddToCartModal = useCallback((book) => setCartModalBook(book), []);
  const closeAddToCartModal = useCallback(() => setCartModalBook(null), []);

  const value = {
    cartItems,
    cartId,
    cartCount,
    cartTotal,
    isCartOpen,
    cartModalBook,
    isSyncing,
    isInCart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    openAddToCartModal,
    closeAddToCartModal,
    refreshCart: loadCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

export default CartContext;
