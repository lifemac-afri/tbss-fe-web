import React, { useState } from 'react';
import { Bookmark, Eye } from 'lucide-react';
import cartIcon from '../assets/icons/cartoutline.svg';
import paperbackIcon from '../assets/icons/paperback.svg';

const BookCard = ({ 
  title = "Nearly All The Men In Lagos Are Mad",
  author = "Damilare Kuku",
  rating = 4.3,
  reviews = 271,
  price = 145,
  tag = "Paperback",
  coverImage = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=387&auto=format&fit=crop"
}) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group w-full max-w-[240px] bg-white rounded-xl border border-gray-100 p-3 shadow-sm hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4.2] rounded-xl overflow-hidden mb-3 bg-gray-50">
        <img 
          src={coverImage} 
          alt={title}
          className="w-full h-full object-cover"
        />
        
        {/* Overlay Icons */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 group-hover:opacity-100 transition-opacity duration-300">
          <button className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <Bookmark size={14} className="text-gray-700" />
          </button>
          <button className="w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors shadow-sm">
            <Eye size={14} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Book Info */}
      <div className="space-y-1">
        <div className="h-[2.5rem] flex items-start">
          <h3 className={`font-bold text-base leading-tight transition-colors duration-300 font-poppins line-clamp-2
            ${isHovered ? 'text-[#1E40AF]' : 'text-black'}`}>
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
          <img src={paperbackIcon} alt={tag} className="h-3.5 w-auto" />
        </div>

        {/* Price and Cart */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xl font-bold font-poppins flex items-center">
            <span className="text-lg mr-0.5">₵</span>
            {price}
          </span>
          <button className="transition-transform duration-200 active:scale-95">
            <img src={cartIcon} alt="Add to cart" className="w-14 h-14" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
