import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, Minus, Plus, ArrowLeft, ChevronRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import paperbackIcon from '../assets/icons/paperback.svg';
import hardcoverIcon from '../assets/icons/hardcover.svg';


const CartPage = () => {
  const { cartItems, cartCount, cartTotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const delivery = 30;
  const grandTotal = cartTotal + (cartTotal > 0 ? delivery : 0);

  return (
    <div className="min-h-screen bg-white pb-32">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={18} className="text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-[#F46B03]" />
            <h1 className="text-lg font-bold text-gray-900 font-poppins">
              Your Cart
              {cartCount > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-400">({cartCount})</span>
              )}
            </h1>
          </div>
        </div>
      </div>


      <div className="max-w-lg mx-auto px-4 pt-4">
        {cartItems.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center text-center pt-16 px-4">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
              <ShoppingBag size={42} className="text-[#F46B03]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Your cart is empty</h2>
            <p className="text-sm text-gray-500 mb-8">Add some books to get started</p>
            <Link to="/shop">
              <button className="px-8 py-3 bg-[#F46B03] text-white rounded-full font-semibold text-sm hover:bg-[#C15300] transition-colors">
                Browse Books
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Items */}
            <div className="space-y-3 mb-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm"
                >
                  {/* Cover */}
                  <Link to={`/books/${item.id}`} className="flex-shrink-0">
                    <div className="rounded-xl overflow-hidden shadow-md bg-gray-100" style={{ width: '72px', height: '100px' }}>
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/books/${item.id}`}>
                      <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#F46B03] transition-colors font-poppins">
                        {item.title}
                      </h3>
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

                    <div className="flex items-center justify-between mt-3">
                      {/* Qty controls */}
                      <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors active:bg-gray-200"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-9 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-9 h-9 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors active:bg-gray-200"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">₵{item.price * item.quantity}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 font-poppins">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({cartCount} item{cartCount !== 1 ? 's' : ''})</span>
                  <span className="font-semibold text-gray-700">₵{cartTotal}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery</span>
                  <span className="font-semibold text-gray-700">₵{delivery}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-gray-100 text-base">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-gray-900">₵{grandTotal}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky checkout button */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 shadow-xl">
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-4 bg-[#F46B03] hover:bg-[#C15300] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-md text-base active:scale-[0.98]"
            >
              Proceed to Checkout · ₵{grandTotal}
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
