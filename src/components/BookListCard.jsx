import React from 'react';
import { Bookmark, ShoppingCart, Star } from 'lucide-react';
import paperbackIcon from '../assets/icons/paperback.svg';
import hardcoverIcon from '../assets/icons/hardcover.svg';

const BookListCard = ({
  title,
  author,
  rating,
  reviews,
  price,
  oldPrice,
  discount,
  tag,
  genre,
  inStock,
  stockStatus,
  coverImage,
}) => {
  const isInStock = inStock !== undefined ? inStock : stockStatus === 'In-stock';
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 p-4 flex gap-4">
      {/* Cover */}
      <div className="relative w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden bg-gray-50">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {(discount || (oldPrice && parseFloat(oldPrice) > parseFloat(price))) && (
          <span className="absolute top-1.5 left-1.5 bg-[#E11D48] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
            {discount || `${Math.round((parseFloat(oldPrice) - parseFloat(price)) / parseFloat(oldPrice) * 100)}% OFF`}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 font-poppins text-sm leading-snug group-hover:text-[#1C25F2] transition-colors line-clamp-2">
                {title}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">{author}</p>
            </div>
            <button className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-50 hover:bg-orange-50 flex items-center justify-center transition-colors">
              <Bookmark size={14} className="text-gray-400 hover:text-[#F46B03]" />
            </button>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-[#F46B03] fill-[#F46B03]" />
              <span className="text-xs font-bold text-gray-800">{rating}</span>
              <span className="text-xs text-gray-400">({reviews})</span>
            </div>
            <div className="flex items-center gap-1">
              <img
                src={tag === 'Hardcover' ? hardcoverIcon : paperbackIcon}
                alt={tag}
                className="h-3.5 w-auto"
              />
              <span className="text-xs text-gray-500">{tag}</span>
            </div>
            {genre && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{genre}</span>
            )}
            {!isInStock && (
              <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium">Out of stock</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900 font-poppins">
              <span className="text-sm font-normal">₵</span>{price}
            </span>
            {oldPrice && (
              <span className="text-sm text-gray-400 line-through">₵{oldPrice}</span>
            )}
          </div>
          <button
            disabled={!isInStock}
            className="flex items-center gap-2 bg-[#F46B03] hover:bg-[#C15300] disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors active:scale-95"
          >
            <ShoppingCart size={14} />
            {isInStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookListCard;
