import api from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Bookmark, ChevronRight, Star, Share2, RotateCcw, Truck, Shield } from 'lucide-react';
import BookCard from '../../components/BookCard';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { normalizeProduct } from '../../lib/normalizeProduct';

const StarRating = ({ rating, size = 16 }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} size={size} className="fill-[#F46B03] text-[#F46B03]" />
      ))}
      {half && <span style={{ fontSize: size, lineHeight: 1, color: '#F46B03' }}>★</span>}
      {Array.from({ length: empty }).map((_, i) => (
        <Star key={`e${i}`} size={size} className="text-gray-300" />
      ))}
    </div>
  );
};

const FORMAT_MULTIPLIERS = { Paperback: 1, Hardcover: 1.22, eBook: 0.58 };

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [book, setBook] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFormat, setSelectedFormat] = useState('Paperback');
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { isAuthenticated } = useAuth();

  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) {
      setReviewError('Please select a star rating.');
      return;
    }
    setReviewSubmitting(true);
    setReviewError('');
    try {
      const res = await api.post('/api/reviews/', {
        product: book.id,
        rating: reviewRating,
        comment: reviewComment
      });
      if (!res.ok) {
        let errData = {};
        try { errData = await res.json(); } catch {}
        throw new Error(errData.non_field_errors?.[0] || errData.detail || 'Failed to submit review.');
      }
      setReviewSuccess(true);
      setReviewRating(0);
      setReviewComment('');
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewSubmitting(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    api.get(`/api/products/${id}/`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const normalized = normalizeProduct(data);
        setBook(normalized);
        setSelectedFormat(normalized.tag || 'Paperback');
        const rel = (data.related_products || []).map(normalizeProduct);
        setRelated(rel.slice(0, 5));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message.includes('404') ? 'not_found' : 'error');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-10 animate-pulse">
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="aspect-[3/4] bg-gray-100 rounded-2xl" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-100 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="h-4 bg-gray-100 rounded w-1/4" />
            <div className="h-10 bg-gray-100 rounded w-1/3 mt-4" />
            <div className="space-y-2 mt-4">
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded" />
              <div className="h-3 bg-gray-100 rounded w-4/5" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-6xl">🔍</p>
        <h1 className="text-2xl font-bold font-poppins text-gray-900">Product not found</h1>
        <p className="text-gray-500 text-sm">We couldn't find the product you're looking for.</p>
        <button
          onClick={() => navigate('/shop')}
          className="mt-2 px-6 py-2.5 bg-[#F46B03] text-white rounded-full font-semibold text-sm hover:bg-[#C15300] transition-colors"
        >
          Browse the Shop
        </button>
      </div>
    );
  }

  const formats = [
    { label: 'Paperback', price: Math.round(book.price * FORMAT_MULTIPLIERS.Paperback) },
    { label: 'Hardcover', price: Math.round(book.price * FORMAT_MULTIPLIERS.Hardcover) },
    { label: 'eBook', price: Math.round(book.price * FORMAT_MULTIPLIERS.eBook) },
  ];
  const activeFormat = formats.find((f) => f.label === selectedFormat) || formats[0];
  const displayPrice = activeFormat.price;
  const displayOldPrice = book.oldPrice ? Math.round(book.oldPrice * (FORMAT_MULTIPLIERS[selectedFormat] || 1)) : null;
  const saved = isInWishlist(book.id);

  const stockColors = {
    'In-stock': 'bg-green-50 text-green-700 border border-green-200',
    'Out of stock': 'bg-red-50 text-red-600 border border-red-200',
    'Pre-Order': 'bg-blue-50 text-blue-700 border border-blue-200',
  };

  const handleAddToCart = () => {
    if (book.stockStatus === 'Out of stock') return;
    const bookForCart = { ...book, price: displayPrice, tag: selectedFormat };
    addToCart(bookForCart, qty);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#F46B03] transition-colors">Home</Link>
          <ChevronRight size={14} className="text-gray-300" />
          <Link to="/shop" className="hover:text-[#F46B03] transition-colors">Shop</Link>
          {book.genre && (
            <>
              <ChevronRight size={14} className="text-gray-300" />
              <Link to={`/shop?genre=${book.genreSlug}`} className="hover:text-[#F46B03] transition-colors">{book.genre}</Link>
            </>
          )}
          <ChevronRight size={14} className="text-gray-300" />
          <span className="text-gray-800 font-medium line-clamp-1 max-w-[200px]">{book.title}</span>
        </nav>

        {/* Main detail */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cover */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-xl bg-white">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-orange-50 text-[#F46B03]">
                    <BookIcon />
                  </div>
                )}
              </div>
              {/* Quick actions */}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => toggleWishlist(book)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border font-medium text-sm transition-colors ${
                    saved
                      ? 'bg-orange-50 border-[#F46B03] text-[#F46B03]'
                      : 'border-gray-200 text-gray-600 hover:border-[#F46B03] hover:text-[#F46B03]'
                  }`}
                >
                  <Bookmark size={16} className={saved ? 'fill-[#F46B03] text-[#F46B03]' : ''} />
                  {saved ? 'Saved' : 'Wishlist'}
                </button>
                <button
                  onClick={() => navigator.share?.({ title: book.title, url: window.location.href })}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:border-[#F46B03] hover:text-[#F46B03] transition-colors"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Category / genre tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {book.category && (
                <span className="text-xs font-semibold bg-orange-50 text-[#F46B03] rounded-full px-3 py-1">{book.category}</span>
              )}
              {book.genre && (
                <span className="text-xs font-semibold bg-blue-50 text-blue-600 rounded-full px-3 py-1">{book.genre}</span>
              )}
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 font-poppins mb-1">{book.title}</h1>
            {book.author && (
              <p className="text-gray-500 text-sm mb-3">by <span className="text-gray-700 font-medium">{book.author}</span></p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <StarRating rating={book.rating} size={15} />
              <span className="font-bold text-sm text-gray-700">{book.rating.toFixed(1)}</span>
              <span className="text-gray-400 text-sm">({book.reviews} reviews)</span>
            </div>

            {/* Stock status */}
            <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full mb-5 ${stockColors[book.stockStatus] || stockColors['In-stock']}`}>
              {book.stockStatus}
            </span>

            {/* Format selector */}
            <div className="mb-5">
              <p className="text-sm font-semibold text-gray-700 mb-2">Format</p>
              <div className="flex gap-2 flex-wrap">
                {formats.map((f) => (
                  <button
                    key={f.label}
                    onClick={() => setSelectedFormat(f.label)}
                    className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                      selectedFormat === f.label
                        ? 'border-[#F46B03] bg-orange-50 text-[#F46B03]'
                        : 'border-gray-200 text-gray-600 hover:border-[#F46B03]'
                    }`}
                  >
                    {f.label} · ₵{f.price}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-5">
              <span className="text-3xl font-bold text-gray-900">₵{displayPrice}</span>
              {displayOldPrice && (
                <span className="text-lg text-gray-400 line-through">₵{displayOldPrice}</span>
              )}
              {book.discount && (
                <span className="text-sm font-semibold text-[#E11D48] bg-red-50 px-2 py-0.5 rounded-full">{book.discount}</span>
              )}
            </div>

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold">−</button>
                <span className="w-10 text-center font-semibold text-sm">{qty}</span>
                <button onClick={() => setQty((q) => q + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors text-lg font-bold">+</button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={book.stockStatus === 'Out of stock'}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all ${
                  book.stockStatus === 'Out of stock'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : addedToCart
                    ? 'bg-green-500 text-white'
                    : 'bg-[#F46B03] hover:bg-[#C15300] text-white active:scale-95'
                }`}
              >
                <ShoppingCart size={18} />
                {addedToCart ? 'Added to cart!' : book.stockStatus === 'Out of stock' ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { icon: <Truck size={16} />, text: 'Free delivery over ₵200' },
                { icon: <RotateCcw size={16} />, text: '30-day returns' },
                { icon: <Shield size={16} />, text: 'Secure checkout' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 bg-white rounded-xl border border-gray-100 p-3 text-center">
                  <span className="text-[#F46B03]">{item.icon}</span>
                  <p className="text-[11px] text-gray-500 leading-tight">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {book.description && (
              <div className="mb-6">
                <h3 className="font-bold text-gray-900 mb-2">About this book</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{book.description}</p>
              </div>
            )}

            {/* Book details table */}
            <div className="bg-white rounded-xl border border-gray-100 p-4">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Book Details</h3>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {book.isbn && <><dt className="text-gray-500">ISBN</dt><dd className="font-medium text-gray-700">{book.isbn}</dd></>}
                {book.genre && <><dt className="text-gray-500">Genre</dt><dd className="font-medium text-gray-700">{book.genre}</dd></>}
                {book.category && <><dt className="text-gray-500">Category</dt><dd className="font-medium text-gray-700">{book.category}</dd></>}
                <dt className="text-gray-500">Format</dt><dd className="font-medium text-gray-700">{selectedFormat}</dd>
              </dl>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 font-poppins mb-6">Customer Reviews</h2>
          
          <div className="flex flex-col lg:flex-row gap-10">
            {/* Reviews List */}
            <div className="flex-1 space-y-6">
              {book.reviews?.length > 0 ? (
                book.reviews.map((rev) => (
                  <div key={rev.id} className="border-b border-gray-50 pb-5 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500">
                        {rev.user_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-semibold text-gray-800 text-sm">{rev.user_name}</span>
                      <span className="text-gray-400 text-xs ml-auto">
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <StarRating rating={rev.rating} size={14} />
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{rev.comment}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <p className="text-gray-500 text-sm">No reviews yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </div>

            {/* Review Form */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                <h3 className="font-bold text-gray-800 mb-4">Write a Review</h3>
                {!isAuthenticated ? (
                  <p className="text-sm text-gray-600">
                    Please <Link to="/login" className="text-[#F46B03] font-semibold hover:underline">log in</Link> to share your thoughts on this book.
                  </p>
                ) : reviewSuccess ? (
                  <div className="text-center p-4 border border-green-200 bg-white rounded-xl">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Shield size={20} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">Review Submitted!</p>
                    <p className="text-xs text-gray-500 mt-1">Your review is currently pending moderation by our team.</p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1.5">Your Rating</p>
                      <div className="flex items-center gap-1 text-[#F46B03]">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setReviewHover(star)}
                            onMouseLeave={() => setReviewHover(0)}
                            onClick={() => setReviewRating(star)}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star size={22} className={star <= (reviewHover || reviewRating) ? "fill-current" : "text-gray-300"} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600 mb-1.5">Your Review</p>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="What did you think of the book?"
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 bg-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F46B03]/30 focus:border-[#F46B03]"
                      />
                    </div>
                    {reviewError && <p className="text-xs text-red-500 font-medium">{reviewError}</p>}
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="w-full py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
                    >
                      {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related books */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 font-poppins mb-5">You might also like</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {related.map((b) => (
                <BookCard key={b.id} {...b} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

export default BookDetailPage;
