import React from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/img/hero.png';
import Button from './Button';

const Hero = () => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-evenly gap-10 md:gap-20 pb-10">
      <div className="text-left max-w-xl">
        <h1 className="text-5xl md:text-6xl font-aclonica leading-[1.1] tracking-tight text-black">
          <span className="whitespace-nowrap">Discover Your Next</span>
          <span className="block text-[#F46B03]">Favourite Book.</span>
        </h1>
        <p className="text-sm md:text-base font-poppins text-gray-500 font-light max-w-md mt-3 mb-6">
          Build your personal library, one great book at a time. Browse thousands of titles across every genre.
        </p>
        <div className="flex items-center gap-4">
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
      <div className="flex justify-center">
        <img
          src={heroImage}
          alt="Hero Books"
          className="w-auto h-auto max-h-[340px] md:max-h-[500px] object-contain drop-shadow-2xl"
        />
      </div>
    </div>
  );
};

export default Hero;
