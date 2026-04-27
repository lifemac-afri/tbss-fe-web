import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, ShoppingCart, LogIn, ArrowLeft } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const WishlistPage = () => {
  const { wishlistItems, wishlistCount, removeFromWishlist } = useWishlist();
  const { openAddToCartModal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-24">
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
            <Bookmark size={20} className="text-[#F46B03]" fill="#F46B03" />
            <h1 className="text-lg font-bold text-gray-900 font-poppins">
              Wishlist
              {isAuthenticated && wishlistCount > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-400">
                  ({wishlistCount})
                </span>
              )}
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4">
        {/* Not logged in */}
        {!isAuthenticated ? (
          <div className="flex flex-col items-center justify-center text-center pt-16 px-4">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
              <Bookmark size={42} className="text-[#F46B03]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Sign in to view your wishlist</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-8">
              Your saved items will appear here. Sign in to keep them safe and access them from any device.
            </p>
            <Link to="/login" state={{ returnTo: '/wishlist' }} className="w-full">
              <Button variant="solid" className="w-full rounded-full flex items-center justify-center gap-2 py-3">
                <LogIn size={18} />
                Sign In to View Wishlist
              </Button>
            </Link>
            <Link to="/register" className="mt-4 text-sm text-[#F46B03] hover:underline font-medium">
              Create a free account
            </Link>
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center text-center pt-16 px-4">
            <div className="w-24 h-24 rounded-full bg-orange-50 flex items-center justify-center mb-6">
              <Bookmark size={42} className="text-[#F46B03]" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Your wishlist is empty</h2>
            <p className="text-sm text-gray-500 mb-8">
              Tap the bookmark icon on any product to save it here
            </p>
            <Link to="/shop">
              <Button variant="solid" className="rounded-full px-8">Browse Shop</Button>
            </Link>
          </div>
        ) : (
          /* Items */
          <div className="space-y-3 pt-2">
            {wishlistItems.map((item) => (
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
                  <p className="text-base font-bold text-gray-900 mt-2">₵{item.price}</p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => openAddToCartModal(item)}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#F46B03] text-white rounded-xl text-sm font-semibold hover:bg-[#C15300] transition-colors"
                    >
                      <ShoppingCart size={15} />
                      Add to Cart
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
