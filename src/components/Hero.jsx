import React from 'react';
import heroImage from '../assets/img/hero.png';

const Hero = () => {
  return (
    <section className="w-full bg-white pt-2 pb-12 md:pb-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20">
          {/* Text Content */}
          <div className="text-left max-w-xl">
            <h1 className="text-4xl md:text-6xl font-aclonica leading-[1.1] tracking-tight text-black">
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
      </div>
    </section>
  );
};

export default Hero;
