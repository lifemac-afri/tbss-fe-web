import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/img/hero.png';
import Button from './Button';

const Hero = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-[300px] md:min-h-[440px] gap-8 md:gap-10 lg:gap-20 py-8 md:py-10">
      <div className="text-center md:text-left max-w-xl lg:max-w-2xl px-4 md:px-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-aclonica leading-tight tracking-tight text-black">
          <span className='whitespace-nowrap'>Discover Your Next</span>
          <span className="block text-[#F46B03]">Great Read.</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base lg:text-lg font-poppins text-gray-500 font-light mb-8 mx-auto md:mx-0 leading-relaxed max-w-lg lg:max-w-xl">
          Build a library that grows with you, one meaningful book at a time. Explore thousands of titles across every genre.
        </p>
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
          <Link to="/shop">
            <Button variant="solid" size="lg" className="rounded-full px-8">
              Shop Now
            </Button>
          </Link>
          <Link to="/community">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Join Community
            </Button>
          </Link>
        </div>
      </div>
      <div className="flex justify-center flex-shrink-0 w-full md:w-auto px-6 md:px-0">
        <img
          src={heroImage}
          alt="Hero Books"
          className="w-full max-w-[260px] sm:max-w-[300px] md:max-w-[320px] lg:max-w-none lg:h-auto lg:max-h-[500px] object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  );
};

export default Hero;
