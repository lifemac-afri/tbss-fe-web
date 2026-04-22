import React from 'react';
import { X, Trash2, ShoppingBag, Minus, Plus, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import paperbackIcon from '../assets/icons/paperback.svg';
import hardcoverIcon from '../assets/icons/hardcover.svg';

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    isCartOpen, closeCart,
    cartItems, cartCount, cartTotal,
    updateQuantity, removeFromCart,
    openAddToCartModal,
  } = useCart();

  const delivery = 30;
  const grandTotal = cartTotal + (cartTotal > 0 ? delivery : 0);

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[56] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#F46B03]" />
            <h2 className="text-base font-bold text-gray-900 font-poppins">
              Your Cart
              {cartCount > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-400">({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
              )}
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>


        {/* Empty state */}
        {cartItems.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
              <ShoppingBag size={36} className="text-[#F46B03]" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 font-poppins">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">Add some books to get started</p>
            </div>
            <button
              onClick={closeCart}
              className="mt-2 px-6 py-2.5 bg-[#F46B03] text-white rounded-full font-semibold text-sm hover:bg-[#C15300] transition-colors"
            >
              Browse Books
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto py-2">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 px-5 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Cover */}
                  <Link
                    to={`/books/${item.id}`}
                    onClick={closeCart}
                    className="flex-shrink-0"
                  >
                    <div
                      className="rounded-xl overflow-hidden shadow-md bg-gray-100"
                      style={{ width: '60px', height: '84px' }}
                    >
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/books/${item.id}`}
                      onClick={closeCart}
                      className="block"
                    >
                      <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#F46B03] transition-colors font-poppins">
                        {item.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{item.author}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <img
                        src={item.tag === 'Hardcover' ? hardcoverIcon : paperbackIcon}
                        alt={item.tag}
                        className="h-3 w-auto"
                      />
                      <span className="text-[10px] text-gray-400">{item.tag}</span>
                    </div>

                    {/* Price + Qty controls */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-7 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="text-sm font-bold text-gray-900">
                        ₵{item.price * item.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="self-start mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-100 bg-white px-5 pt-4 pb-6">
              {/* Order summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                  <span className="font-semibold text-gray-700">₵{cartTotal}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Delivery</span>
                  <span className="font-semibold text-gray-700">₵{delivery}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-lg text-gray-900">₵{grandTotal}</span>
                </div>
              </div>

              {/* Checkout button */}
              <button
                onClick={() => { closeCart(); navigate('/checkout'); }}
                className="w-full h-13 py-3.5 bg-[#F46B03] hover:bg-[#C15300] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md text-sm"
              >
                Proceed to Checkout
                <ChevronRight size={16} />
              </button>

              <button
                onClick={closeCart}
                className="w-full mt-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors py-1.5"
              >
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
