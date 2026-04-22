import React, { useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import paperbackIcon from '../assets/icons/paperback.svg';
import hardcoverIcon from '../assets/icons/hardcover.svg';
import bookmarkIcon from '../assets/icons/bookmark.svg';
import bookmarkActiveIcon from '../assets/icons/bookmark_active.svg';

const BookCard = ({
  id,
  title,
  author,
  rating,
  reviews,
  price,
  oldPrice,
  discount,
  tag = "Paperback",
  coverImage = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=387&auto=format&fit=crop",
  stockStatus,
  ...rest
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { openAddToCartModal, cartItems, openCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const book = { id, title, author, rating, reviews, price, oldPrice, discount, tag, coverImage, stockStatus, ...rest };
  const wishlisted = isInWishlist(id);
  const inCart = cartItems.some((item) => item.id === id);

  const goToDetail = () => { if (id) navigate(`/books/${id}`); };

  const handleCartBtn = (e) => {
    e.stopPropagation();
    if (stockStatus === 'Out of stock') return;
    if (inCart) {
      openCart();
    } else {
      openAddToCartModal(book);
    }
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(book);
  };

  return (
    <div
      className="group relative w-full max-w-[260px] bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={goToDetail}
    >
      {/* Discount ribbon — positioned relative to the entire card */}
      {(discount || (oldPrice && parseFloat(oldPrice) > parseFloat(price))) && (
        <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden z-30 pointer-events-none">
          <div className="absolute top-[10px] left-[-22px] w-[80px] bg-[#E11D48] text-white text-[10px] font-bold py-0.5 text-center -rotate-45 shadow-sm">
            {discount || (() => {
              const pct = Math.round((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice) * 100);
              return `${pct}% OFF`;
            })()}
          </div>
        </div>
      )}
      <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden mb-3 bg-gray-50">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />


        {/* Out of stock overlay */}
        {stockStatus === 'Out of stock' && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="text-xs font-bold text-white bg-black/60 px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}

        {/*
          Bookmark button — the SVG files (bookmark.svg / bookmark_active.svg) each include
          their own 22×22 circular background, so we display them directly at natural size
          with no extra wrapper background. Always visible when wishlisted; fades in on hover.
        */}
        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-2 right-2 z-20 transition-opacity duration-200 active:scale-90
            ${wishlisted ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        >
          <img
            src={wishlisted ? bookmarkActiveIcon : bookmarkIcon}
            alt={wishlisted ? 'Saved' : 'Save'}
            className="w-[22px] h-[22px]"
          />
        </button>
      </div>

      {/* Text content */}
      <div className="space-y-1">
        <div className="h-[2.5rem] flex items-start">
          <h3 className={`font-bold text-base leading-tight transition-colors duration-300 font-poppins line-clamp-2 ${isHovered ? 'text-[#1C25F2]' : 'text-black'}`}>
            {title}
          </h3>
        </div>
        <p className="text-[12px] text-gray-500 font-poppins h-[1rem]">{author}</p>

        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center gap-1">
            <span className="text-[#F46B03] text-sm">★</span>
            <span className="font-bold text-[12px]">{rating}</span>
            <span className="text-gray-400 text-[11px]">({reviews})</span>
          </div>
          <img src={tag === 'Hardcover' ? hardcoverIcon : paperbackIcon} alt={tag} className="h-4 w-auto" />
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-lg font-bold font-poppins flex items-center text-black">
              <span className="text-base mr-0.5 font-normal">₵</span>{price}
            </span>
            {oldPrice && (
              <span className="text-[12px] text-gray-400 line-through -mt-1">₵{oldPrice}</span>
            )}
          </div>

          {/*
            Cart button:
            - Out of stock → muted gray, disabled
            - Already in cart → solid green with checkmark, click opens cart
            - Default → orange with cart icon, click opens add-to-cart modal
          */}
          <button
            onClick={handleCartBtn}
            disabled={stockStatus === 'Out of stock'}
            aria-label={inCart ? 'View in cart' : 'Add to cart'}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all duration-200 active:scale-95 shadow-md ${
              stockStatus === 'Out of stock'
                ? 'bg-gray-300 cursor-not-allowed'
                : inCart
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-[#F46B03] hover:bg-[#C15300]'
            }`}
          >
            {inCart
              ? <Check size={17} strokeWidth={3} />
              : <ShoppingCart size={17} />
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
