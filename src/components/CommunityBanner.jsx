import React from 'react';
import { Link } from 'react-router-dom';
import booksplit from '../assets/icons/booksplit.png';
import bookcom from '../assets/icons/bookcom.png';
import Button from './Button';

const CommunityBanner = () => {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-6xl mx-auto bg-black rounded-3xl overflow-hidden relative flex items-center min-h-[360px]">
        <div className="absolute inset-0 flex justify-end items-center pointer-events-none">
          <img src={booksplit} alt="" className="h-auto w-auto object-contain" aria-hidden="true" />
        </div>
        <div className="relative z-10 pl-10 md:pl-16 py-12 flex-1">
          <h2 className="text-3xl md:text-4xl text-white font-aclonica mb-3 leading-tight tracking-tight">
            What Readers Are Loving
          </h2>
          <p className="text-gray-400 font-poppins mb-8 text-sm md:text-base font-light max-w-md">
            Join a community of readers discovering and sharing books they love.
          </p>
          <Link to="/community">
            <Button variant="solid" className="px-10 py-3.5 rounded-full">
              Join the Community
            </Button>
          </Link>
        </div>
        <div className="relative z-10 pr-10 md:pr-16 py-10 flex flex-col items-center justify-center gap-6 max-w-xs w-full">
          <img src={bookcom} alt="Community readers" className="w-auto h-auto object-contain max-h-[220px]" />
          <div className="bg-[#D9D9D9] w-full h-[140px] rounded-[2rem] flex items-center justify-center p-6 shadow-inner">
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
