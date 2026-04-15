import React from 'react';
import { ShoppingBag, MapPin, Award } from 'lucide-react';
import logo from '../assets/logo/logo.png';

const RegionalFlyer = ({ stats, productImage }) => {
  if (!stats) return null;

  const { rank, region, product_title } = stats;

  const getRankSuffix = (n) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const rankText = `${rank}${getRankSuffix(rank)}`;

  return (
    <div 
      id="purchase-flyer"
      className="w-[400px] bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-gray-100"
      style={{ aspectRatio: '1/1.2' }}
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#F46B03]/10 rounded-bl-[100px]" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-50/50 rounded-tr-[80px]" />

      <div className="p-8 flex flex-col h-full items-center text-center">
        {/* Logo */}
        <img src={logo} alt="TBSS" className="h-10 w-auto mb-6" />

        {/* Product Image */}
        <div className="relative mb-6">
          <div className="w-32 h-44 bg-gray-100 rounded-2xl overflow-hidden shadow-lg rotate-3">
            <img 
              src={productImage} 
              alt={product_title} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute -bottom-2 -right-4 w-12 h-12 bg-[#F46B03] rounded-full flex items-center justify-center text-white shadow-lg -rotate-12 border-4 border-white">
            <ShoppingBag size={20} />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-100">
            <MapPin size={12} className="text-[#F46B03]" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{region}</span>
          </div>

          <h2 className="text-3xl font-black text-gray-900 leading-tight">
            I AM THE <span className="text-[#F46B03]">{rankText}</span>
          </h2>
          
          <p className="text-sm font-medium text-gray-500 max-w-[240px] mx-auto uppercase tracking-wide">
            PERSON FROM <span className="text-gray-900 font-bold">{region}</span> TO GET <span className="text-gray-900 font-bold">"{product_title}"</span>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 flex items-center gap-4">
          <div className="w-8 h-px bg-gray-200" />
          <div className="flex items-center gap-1.5 text-gray-400">
            <Award size={14} />
            <span className="text-[10px] font-bold tracking-widest uppercase">Verified Purchase · TBSS</span>
          </div>
          <div className="w-8 h-px bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default RegionalFlyer;
