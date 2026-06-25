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

    const maxAllowed = typeof product.stock_quantity === 'number'
      ? product.stock_quantity
      : typeof product.stock === 'number'
        ? product.stock
        : 99;

    if (isAuthenticated) {
      if (existingIdx >= 0) {
        const item = cartItems[existingIdx];
        const itemMax = typeof item.stock_quantity === 'number' ? item.stock_quantity : maxAllowed;
        const newQty = Math.min(item.quantity + qty, itemMax);
        setCartItems((prev) =>
          prev.map((i, idx) => idx === existingIdx ? { ...i, quantity: newQty } : i)
        );
        try {
          await api.patch(`/api/cart/items/${item.id}/`, { quantity: newQty });
        } catch {}
      } else {
        const cappedQty = Math.min(qty, maxAllowed);
        const optimistic = {
          id: `temp_${Date.now()}`,
          productId: product.id,
          title: product.title,
          price: parseFloat(product.price || 0),
          quantity: cappedQty,
          coverImage: product.coverImage || product.image || null,
          author: product.author || '',
          stock_quantity: maxAllowed,
        };
        setCartItems((prev) => [...prev, optimistic]);
        try {
          const res = await api.post('/api/cart/items/', { product: product.id, quantity: cappedQty });
          if (res.ok) {
            await loadCart();
          }
        } catch {}
      }
    } else {
      setCartItems((prev) => {
        const existing = prev.find((i) => (i.productId || i.id) === product.id);
        if (existing) {
          const itemMax = typeof existing.stock_quantity === 'number' ? existing.stock_quantity : maxAllowed;
          const newQty = Math.min(existing.quantity + qty, itemMax);
          return prev.map((i) =>
            (i.productId || i.id) === product.id ? { ...i, quantity: newQty } : i
          );
        }
        const cappedQty = Math.min(qty, maxAllowed);
        return [...prev, {
          id: product.id,
          productId: product.id,
          title: product.title,
          price: parseFloat(product.price || 0),
          quantity: cappedQty,
          coverImage: product.coverImage || product.image || null,
          author: product.author || '',
          stock_quantity: maxAllowed,
        }];
      });
      try {
        const cappedQty = Math.min(qty, maxAllowed);
        await api.post('/api/cart/items/', { product: product.id, quantity: cappedQty });
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
    if (!item) return;
    const maxAllowed = typeof item.stock_quantity === 'number' ? item.stock_quantity : 99;
    const cappedQuantity = Math.min(quantity, maxAllowed);
    setCartItems((prev) =>
      prev.map((i) => (i.id === itemId || i.productId === itemId) ? { ...i, quantity: cappedQuantity } : i)
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
