import React from 'react';
import { Link } from 'react-router-dom';
import booksplit from '../assets/icons/booksplit.png';
import bookcom from '../assets/icons/bookcom.png';
import Button from './Button';

const CommunityBanner = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto bg-black rounded-3xl overflow-hidden relative flex flex-col md:flex-row items-center md:items-stretch min-h-[360px]">
        {/* Background Image - hidden on mobile */}
        <div className="absolute inset-0 hidden md:flex justify-end items-center pointer-events-none">
          <img src={booksplit} alt="" className="h-auto w-auto object-contain" aria-hidden="true" />
        </div>

        {/* Text Section */}
        <div className="relative z-10 px-8 md:px-0 md:pl-16 py-12 md:py-12 flex-1 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl text-white font-aclonica mb-3 leading-tight tracking-tight">
            What Readers Are Loving
          </h2>
          <p className="text-gray-400 font-poppins mb-8 text-sm md:text-base font-light max-w-md mx-auto md:mx-0">
            Join a community of readers discovering and sharing books they love.
          </p>
          <div className="flex justify-center md:justify-start">
            <Link to="/community">
              <Button variant="solid" className="px-10 py-3.5 rounded-full">
                Join the Community
              </Button>
            </Link>
          </div>
        </div>

        {/* Visual Section */}
        <div className="relative z-10 pb-12 md:pb-10 px-8 my-10 md:px-0 md:pr-16 flex flex-col items-center justify-center gap-6 max-w-sm md:max-w-xs w-full">
          <img src={bookcom} alt="Community readers" className="w-auto h-auto object-contain max-h-[220px]" />
          <div className="bg-[#D9D9D9] w-full h-auto rounded-full flex items-center justify-center p-6 shadow-inner">
            <p className="text-gray-600 text-sm text-center font-poppins">
              "Reading is dreaming with open eyes."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunityBanner;
