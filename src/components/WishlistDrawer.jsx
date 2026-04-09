import React from 'react';
import { X, Trash2, ShoppingCart, Bookmark, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const WishlistDrawer = () => {
  const { isWishlistOpen, closeWishlist, wishlistItems, wishlistCount, removeFromWishlist } = useWishlist();
  const { openAddToCartModal } = useCart();
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isWishlistOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55]"
          onClick={closeWishlist}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-full max-w-[420px] bg-white z-[56] flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isWishlistOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Bookmark size={20} className="text-[#F46B03]" fill="#F46B03" />
            <h2 className="text-base font-bold text-gray-900 font-poppins">
              Wishlist
              {isAuthenticated && wishlistCount > 0 && (
                <span className="ml-2 text-sm font-semibold text-gray-400">
                  ({wishlistCount} item{wishlistCount !== 1 ? 's' : ''})
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={closeWishlist}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Not logged in gate */}
        {!isAuthenticated ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
              <Bookmark size={36} className="text-[#F46B03]" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 font-poppins">Sign in to view your wishlist</p>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                Your saved items will appear here. Sign in to keep them safe across all your devices.
              </p>
            </div>
            <Link to="/login" onClick={closeWishlist} className="w-full">
              <Button variant="solid" className="w-full rounded-full flex items-center justify-center gap-2">
                <LogIn size={16} />
                Sign In to View Wishlist
              </Button>
            </Link>
            <Link to="/register" onClick={closeWishlist} className="text-sm text-[#F46B03] hover:underline font-medium">
              Create a free account
            </Link>
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center">
              <Bookmark size={36} className="text-[#F46B03]" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900 font-poppins">Your wishlist is empty</p>
              <p className="text-sm text-gray-400 mt-1">Save items you love using the bookmark icon</p>
            </div>
            <button
              onClick={closeWishlist}
              className="mt-2 px-6 py-2.5 bg-[#F46B03] text-white rounded-full font-semibold text-sm hover:bg-[#C15300] transition-colors"
            >
              Browse Shop
            </button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto py-2">
              {wishlistItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 px-5 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Cover */}
                  <Link to={`/books/${item.id}`} onClick={closeWishlist} className="flex-shrink-0">
                    <div className="rounded-xl overflow-hidden shadow-md bg-gray-100" style={{ width: '60px', height: '84px' }}>
                      <img
                        src={item.coverImage}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/books/${item.id}`} onClick={closeWishlist} className="block">
                      <h4 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-[#F46B03] transition-colors font-poppins">
                        {item.title}
                      </h4>
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">{item.author}</p>
                    <p className="text-sm font-bold text-gray-900 mt-2">₵{item.price}</p>
                    <button
                      onClick={() => { openAddToCartModal(item); closeWishlist(); }}
                      className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#F46B03] hover:text-[#C15300] transition-colors"
                    >
                      <ShoppingCart size={13} />
                      Add to Cart
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromWishlist(item.id)}
                    className="self-start mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-100 bg-white px-5 pt-4 pb-6">
              <p className="text-xs text-gray-400 text-center mb-3">
                {wishlistCount} saved item{wishlistCount !== 1 ? 's' : ''}
              </p>
              <button
                onClick={closeWishlist}
                className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1.5"
              >
                Continue Browsing
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default WishlistDrawer;
