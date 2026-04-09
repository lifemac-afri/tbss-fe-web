import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import bookmarkIcon from '../assets/icons/bookmark.svg';
import bookmarkActiveIcon from '../assets/icons/bookmark_active.svg';
import { ShoppingCart, Check, TrendingUp, Loader2 } from 'lucide-react';
import api from '../lib/api';
import { normalizeProduct } from '../lib/normalizeProduct';

const RankBadge = ({ rank }) => {
  if (rank === 1) return <span className="text-xl">🥇</span>;
  if (rank === 2) return <span className="text-xl">🥈</span>;
  if (rank === 3) return <span className="text-xl">🥉</span>;
  return <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center text-sm font-bold">{rank}</span>;
};

const BestsellerRow = ({ book, rank }) => {
  const { openAddToCartModal, cartItems, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const wishlisted = isInWishlist(book.id);
  const inCart = cartItems.some((i) => i.id === book.id);

  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-shadow group">
      <div className="flex-shrink-0 flex items-center justify-center w-8">
        <RankBadge rank={rank} />
      </div>

      <Link to={`/books/${book.id}`} className="flex-shrink-0">
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-12 h-16 sm:w-14 sm:h-20 object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
        />
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/books/${book.id}`}>
          <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-1 hover:text-[#1C25F2] transition-colors">
            {book.title}
          </h3>
        </Link>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{book.author}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="flex items-center gap-1 text-xs">
            <span className="text-[#F46B03]">★</span>
            <span className="font-semibold text-gray-700">{book.rating}</span>
            <span className="text-gray-400">({book.reviews})</span>
          </span>
          {book.genre && (
            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{book.genre}</span>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
        <div className="text-right hidden sm:block">
          <p className="font-bold text-gray-900 text-base">₵{book.price}</p>
          {book.oldPrice && <p className="text-xs text-gray-400 line-through">₵{book.oldPrice}</p>}
        </div>

        <button
          onClick={() => toggleWishlist(book)}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save'}
        >
          <img src={wishlisted ? bookmarkActiveIcon : bookmarkIcon} alt="bookmark" className="w-[22px] h-[22px]" />
        </button>

        <button
          onClick={() => inCart ? openCart() : openAddToCartModal(book)}
          className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all active:scale-95 shadow-sm ${
            inCart ? 'bg-green-500 hover:bg-green-600' : 'bg-[#F46B03] hover:bg-[#C15300]'
          }`}
        >
          {inCart ? <Check size={16} strokeWidth={3} /> : <ShoppingCart size={16} />}
        </button>
      </div>
    </div>
  );
};

const BestsellersPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/products/?ordering=-average_rating,-review_count&page_size=12')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        setBooks(list.map(normalizeProduct));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={22} className="text-[#F46B03]" />
          <h1 className="text-3xl font-aclonica text-gray-900">Bestsellers</h1>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          The most-loved reads in our community — ranked by ratings and reader reviews.
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 size={32} className="animate-spin text-[#F46B03]" />
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-24 text-gray-400">No books found.</div>
      ) : (
        <>
          {/* Top 3 hero cards */}
          {books.length >= 3 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {books.slice(0, 3).map((book, i) => (
                <Link
                  key={book.id}
                  to={`/books/${book.id}`}
                  className={`relative rounded-2xl overflow-hidden border-2 group ${
                    i === 0 ? 'border-yellow-400' : i === 1 ? 'border-gray-300' : 'border-amber-600'
                  }`}
                >
                  <img src={book.coverImage} alt={book.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <RankBadge rank={i + 1} />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm line-clamp-1">{book.title}</p>
                    <p className="text-white/70 text-xs">{book.author}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-white text-xs">★ {book.rating} ({book.reviews})</span>
                      <span className="text-white font-bold text-sm">₵{book.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Ranked list */}
          <div className="space-y-2">
            {books.map((book, i) => (
              <BestsellerRow key={book.id} book={book} rank={i + 1} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BestsellersPage;
