import React, { useState } from 'react';

const SearchBar = ({ onSearch, placeholder = 'Search', ...props }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <div className="w-full bg-white pt-3 pb-1">
      <div className="px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="flex justify-center">
          <div className="relative w-[70%]">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full h-11 pl-10 pr-4 rounded-full border border-gray-300 bg-white text-sm text-gray-800 outline-none transition-colors duration-200 focus:border-[#F46B03]"
              {...props}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;
