import React, { useState } from 'react';
import { Bookmark, Eye, ShoppingCart } from 'lucide-react';
import paperbackIcon from '../assets/icons/paperback.svg';
import hardcoverIcon from '../assets/icons/hardcover.svg';

const BookCard = ({
  title = "Nearly All The Men In Lagos Are Mad",
  author = "Damilare Kuku",
  rating = 4.3,
  reviews = 271,
  price = 145,
  oldPrice,
  discount,
  tag = "Paperback",
  coverImage = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=387&auto=format&fit=crop"
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group w-full max-w-[260px] bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden mb-3 bg-gray-50">
        <img
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Discount Ribbon */}
        {discount && (
          <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden z-10">
            <div className="absolute top-[10px] left-[-22px] w-[80px] bg-[#E11D48] text-white text-[10px] font-bold py-0.5 text-center -rotate-45 shadow-sm">
              {discount}
            </div>
          </div>
        )}

        {/* Overlay Icons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 group-hover:opacity-100 transition-opacity duration-300 z-10">
          <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <Bookmark size={15} className="text-gray-700" />
          </button>
          <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <Eye size={15} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Book Info */}
      <div className="space-y-1">
        <div className="h-[2.5rem] flex items-start">
          <h3 className={`font-bold text-base leading-tight transition-colors duration-300 font-poppins line-clamp-2
            ${isHovered ? 'text-[#1C25F2]' : 'text-black'}`}>
            {title}
          </h3>
        </div>
        <p className="text-[12px] text-gray-500 font-poppins h-[1rem]">
          {author}
        </p>

        {/* Rating and Tag */}
        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center gap-1">
            <span className="text-[#F46B03] text-sm">★</span>
            <span className="font-bold text-[12px]">{rating}</span>
            <span className="text-gray-400 text-[11px]">({reviews})</span>
          </div>
          <img 
            src={tag === 'Hardcover' ? hardcoverIcon : paperbackIcon} 
            alt={tag} 
            className="h-4 w-auto" 
          />
        </div>

        {/* Price and Cart */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex flex-col">
            <span className="text-lg font-bold font-poppins flex items-center text-black">
              <span className="text-base mr-0.5 font-normal">₵</span>
              {price}
            </span>
            {oldPrice && (
              <span className="text-[12px] text-gray-400 line-through -mt-1">
                ₵{oldPrice}
              </span>
            )}
          </div>
          <button className="w-9 h-9 rounded-full bg-[#F46B03] hover:bg-[#E06002] flex items-center justify-center text-white transition-all duration-200 active:scale-95 shadow-md">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
