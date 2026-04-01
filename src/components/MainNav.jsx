import React from 'react';
import { User } from 'lucide-react';
import logo from '../assets/logo/logo.png';
import cartIcon from '../assets/icons/cart.svg';
import saveIcon from '../assets/icons/save.svg';
import Button from './Button';

const navItems = ['Genre', 'Bestsellers', 'Games', 'Stationeries', 'Blogs', 'Community'];

const MainNav = ({ activeItem, onItemClick }) => {
  return (
    <nav className="w-full bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img src={logo} alt="TBSS Logo" className="h-auto w-auto" />
          </div>

          {/* Nav Items */}
          <div className="flex items-center font-bold gap-8">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => onItemClick?.(item)}
                className={`text-base font-bold transition-colors duration-200 bg-transparent border-none cursor-pointer
                  ${activeItem === item
                    ? 'text-[#F46B03]'
                    : 'text-gray-700 hover:text-[#F46B03]'
                  }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Right side: Cart, User, SignUp */}
          <div className="flex items-center gap-5">
            <button className="bg-transparent border-none cursor-pointer p-1 hover:opacity-70 transition-opacity flex items-center justify-center">
              <img src={cartIcon} alt="Cart" className="w-auto h-auto" />
            </button>
            <button className="bg-transparent border-none cursor-pointer p-1 hover:opacity-70 transition-opacity flex items-center justify-center">
              <img src={saveIcon} alt="Save" className="w-auto h-auto" />
            </button>
            <button className="bg-transparent border-none cursor-pointer p-1 hover:opacity-70 transition-opacity flex items-center justify-center">
              <User size={22} className="text-gray-700" />
            </button>
            <Button variant="solid" className="px-6 py-2 text-sm">
              SignUp
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MainNav;
