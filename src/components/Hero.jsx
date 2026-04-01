import React from 'react';
import heroImage from '../assets/img/hero.png';

const Hero = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-evenly gap-10 md:gap-20 pb-10">
      {/* Text Content */}
      <div className="text-left max-w-xl">
        <h1 className="text-5xl md:text-6xl font-aclonica leading-[1.1] tracking-tight text-black">
          <span className="whitespace-nowrap">Discover Your Next</span>
          <span className="block text-[#F46B03]">Favourite Book.</span>
        </h1>
        <p className="text-sm md:text-base font-poppins text-gray-500 font-light max-w-md">
          Build your personal library, one great book at a time.
        </p>
      </div>

      {/* Image Content */}
      <div className="flex justify-center">
        <img
          src={heroImage}
          alt="Hero Books"
          className="w-auto h-auto max-h-[300px] md:max-h-[400px] object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  );
};

export default Hero;
