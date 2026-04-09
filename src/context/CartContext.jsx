import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

function normalizeItem(item) {
  return {
    id: item.id,
    productId: item.product,
    title: item.product_name || item.title || 'Unknown',
    price: parseFloat(item.product_price || item.price || 0),
    quantity: item.quantity || 1,
    subtotal: parseFloat(item.subtotal || 0),
    coverImage: item.image || item.coverImage || null,
    author: item.author || '',
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
      setCartItems(items);
      if (data.id) setCartId(data.id);
    } catch {} finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    loadCart();
    hasSynced.current = true;
  }, [isAuthenticated, loadCart]);

  const addToCart = useCallback(async (product, qty = 1) => {
    const existingIdx = cartItems.findIndex((i) => i.productId === product.id || i.id === product.id);

    if (isAuthenticated) {
      if (existingIdx >= 0) {
        const item = cartItems[existingIdx];
        const newQty = item.quantity + qty;
        setCartItems((prev) =>
          prev.map((i, idx) => idx === existingIdx ? { ...i, quantity: newQty } : i)
        );
        try {
          await api.patch(`/api/cart/items/${item.id}/`, { quantity: newQty });
        } catch {}
      } else {
        const optimistic = {
          id: `temp_${Date.now()}`,
          productId: product.id,
          title: product.title,
          price: parseFloat(product.price || 0),
          quantity: qty,
          coverImage: product.coverImage || product.image || null,
          author: product.author || '',
        };
        setCartItems((prev) => [...prev, optimistic]);
        try {
          const res = await api.post('/api/cart/items/', { product: product.id, quantity: qty });
          if (res.ok) {
            await loadCart();
          }
        } catch {}
      }
    } else {
      setCartItems((prev) => {
        const existing = prev.find((i) => (i.productId || i.id) === product.id);
        if (existing) {
          return prev.map((i) =>
            (i.productId || i.id) === product.id ? { ...i, quantity: i.quantity + qty } : i
          );
        }
        return [...prev, {
          id: product.id,
          productId: product.id,
          title: product.title,
          price: parseFloat(product.price || 0),
          quantity: qty,
          coverImage: product.coverImage || product.image || null,
          author: product.author || '',
        }];
      });
      try {
        await api.post('/api/cart/items/', { product: product.id, quantity: qty });
      } catch {}
    }
  }, [isAuthenticated, cartItems, loadCart]);

  const removeFromCart = useCallback(async (itemId) => {
    const item = cartItems.find((i) => i.id === itemId || i.productId === itemId);
    setCartItems((prev) => prev.filter((i) => i.id !== itemId && i.productId !== itemId));
    if (item?.id && !String(item.id).startsWith('temp_')) {
      try {
        await api.del(`/api/cart/items/${item.id}/`);
      } catch {}
    }
  }, [cartItems]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) { removeFromCart(itemId); return; }
    const item = cartItems.find((i) => i.id === itemId || i.productId === itemId);
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId || i.productId === itemId) ? { ...i, quantity } : i)
    );
    if (item?.id && !String(item.id).startsWith('temp_')) {
      try {
        await api.patch(`/api/cart/items/${item.id}/`, { quantity });
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
