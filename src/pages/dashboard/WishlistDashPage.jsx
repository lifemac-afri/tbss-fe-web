import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bookmark, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';

const WishlistDashPage = () => {
  const { wishlistItems, toggleWishlist } = useWishlist();
  const { openAddToCartModal, cartItems } = useCart();
  const navigate = useNavigate();

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Wishlist</h2>
          <p className="text-sm text-gray-500 mt-1">Items you've saved for later</p>
        </div>
        <div className="mt-12 text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Bookmark size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">Your wishlist is empty</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">Save items you love and come back to them later.</p>
          <button
            onClick={() => navigate('/shop')}
            className="px-6 py-2 bg-[#F46B03] text-white rounded-full text-sm font-semibold hover:bg-[#C15300] transition-colors"
          >
            Browse Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Wishlist</h2>
        <p className="text-sm text-gray-500 mt-1">{wishlistItems.length} saved item{wishlistItems.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="space-y-3">
        {wishlistItems.map((book) => {
          const inCart = cartItems.some((c) => c.id === book.id);
          return (
            <div
              key={book.id}
              className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm"
            >
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-14 h-20 object-cover rounded-xl flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => navigate(`/books/${book.id}`)}
              />
              <div className="flex-1 min-w-0">
                <p
                  className="font-semibold text-gray-800 text-sm line-clamp-1 cursor-pointer hover:text-[#1C25F2] transition-colors"
                  onClick={() => navigate(`/books/${book.id}`)}
                >
                  {book.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-base font-bold text-gray-800">₵{book.price}</span>
                  {book.oldPrice && (
                    <span className="text-xs text-gray-400 line-through">₵{book.oldPrice}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => inCart ? navigate('/cart') : openAddToCartModal(book)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    inCart
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-[#F46B03] text-white hover:bg-[#C15300]'
                  }`}
                >
                  <ShoppingCart size={13} />
                  {inCart ? 'In Cart' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => toggleWishlist(book)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-red-500 border border-red-100 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistDashPage;
