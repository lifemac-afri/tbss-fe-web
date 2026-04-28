import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Minus, Plus, Zap } from 'lucide-react';
import { useCart } from '../context/CartContext';
import paperbackIcon from '../assets/icons/paperback.svg';
import hardcoverIcon from '../assets/icons/hardcover.svg';

const AddToCartModal = () => {
  const navigate = useNavigate();
  const { cartModalBook, closeAddToCartModal, addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (cartModalBook) {
      setQty(1);
      setAdded(false);
    }
  }, [cartModalBook]);

  useEffect(() => {
    if (!cartModalBook) return;
    const onKey = (e) => { if (e.key === 'Escape') closeAddToCartModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [cartModalBook, closeAddToCartModal]);

  if (!cartModalBook) return null;

  const book = cartModalBook;
  const lineTotal = book.price * qty;

  const handleAdd = () => {
    addToCart(book, qty);
    setAdded(true);
    setTimeout(() => {
      closeAddToCartModal();
    }, 700);
  };

  const handleBuyNow = () => {
    closeAddToCartModal();
    navigate('/checkout', { 
      state: { 
        buyNowItem: { 
          ...book, 
          quantity: qty,
          productId: book.id 
        } 
      } 
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeAddToCartModal}
      />

      {/* Modal card */}
      <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden z-10 animate-slide-up">

        {/* Drag handle (mobile) */}
        <div className="sm:hidden flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900 font-poppins">Add to Cart</h2>
          <button
            onClick={closeAddToCartModal}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Book info */}
        <div className="flex gap-4 px-5 py-4 border-b border-gray-100">
          <div className="w-16 h-22 rounded-xl overflow-hidden flex-shrink-0 shadow-md bg-gray-100" style={{ height: '88px', width: '64px' }}>
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 font-poppins line-clamp-2 leading-snug">
              {book.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-xs text-gray-400">{book.tag}</span>
              {book.discount && (
                <span className="text-[10px] font-bold text-[#E11D48] bg-red-50 px-1.5 py-0.5 rounded">
                  {book.discount}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-1.5">
              <span className="text-lg font-bold text-gray-900">₵{book.price}</span>
              {book.oldPrice && (
                <span className="text-xs text-gray-400 line-through">₵{book.oldPrice}</span>
              )}
            </div>
          </div>
        </div>

        {/* Quantity selector */}
        <div className="px-5 py-5">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Quantity</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setQty(q => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="w-12 text-center text-base font-bold text-gray-900">{qty}</span>
              <button
                onClick={() => setQty(q => q + 1)}
                className="w-11 h-11 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="flex-1 text-right">
              <p className="text-xs text-gray-400">Subtotal</p>
              <p className="text-xl font-bold text-gray-900">
                <span className="text-base font-normal">₵</span>{lineTotal}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-6 flex gap-3">
          <button
            onClick={handleBuyNow}
            className="flex-1 h-12 rounded-xl border-2 border-gray-100 flex items-center justify-center gap-2 text-[#F46B03] text-sm font-bold hover:bg-orange-50 hover:border-orange-100 transition-all active:scale-95"
          >
            <Zap size={16} fill="currentColor" />
            Buy Now
          </button>
          <button
            onClick={handleAdd}
            disabled={added}
            className={`flex-1 h-12 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-white transition-all duration-300 ${
              added
                ? 'bg-green-500 scale-95'
                : 'bg-[#F46B03] hover:bg-[#C15300] active:scale-95 shadow-md'
            }`}
          >
            <ShoppingCart size={17} />
            {added ? 'Added!' : `Add ${qty > 1 ? `${qty} ` : ''}to Cart`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddToCartModal;
