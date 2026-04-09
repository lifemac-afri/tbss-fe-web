import React from 'react';
import { Link } from 'react-router-dom';
import covImage from '../assets/img/cov.png';

const banners = [
  {
    title: "New",
    subtitle: "Release",
    buttonText: "Shop Now",
    image: covImage,
    bgColor: "bg-[#0A4D4A]",
    href: "/shop?sort=newest",
  },
  {
    title: "Today's",
    subtitle: "Deals",
    buttonText: "Shop Now",
    image: covImage,
    bgColor: "bg-[#8B7D5B]",
    href: "/shop?deals=true",
  },
];

const PromoBanners = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
      {banners.map((banner, index) => (
        <Link
          key={index}
          to={banner.href}
          className={`relative h-[180px] md:h-[220px] rounded-2xl overflow-hidden group cursor-pointer ${banner.bgColor} block`}
        >
          <img
            src={banner.image}
            alt={banner.subtitle}
            className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-multiply group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
          <div className="relative h-full flex flex-col justify-end pb-6 px-6 md:px-8 z-10">
            <p className="text-white font-poppins text-2xl leading-tight">
              <span className="block">{banner.title}</span>
              <span className="block">{banner.subtitle}</span>
            </p>
            <div className="mt-2">
              <span className="inline-block bg-[#BF5000] hover:bg-[#A64500] text-white px-6 py-2 rounded-lg font-poppins transition-colors shadow-lg">
                {banner.buttonText}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default PromoBanners;
