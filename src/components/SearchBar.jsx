import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SearchBar = ({ onSearch, placeholder = 'Search books, authors, genres...', className = '' }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  return (
    <div className={`w-full bg-white pt-3 pb-8 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="flex justify-center">
          <div className="relative w-[70%]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholder}
              className="w-full h-11 pl-10 pr-4 rounded-full border border-gray-300 bg-white text-sm text-gray-800 outline-none transition-colors duration-200 focus:border-[#F46B03]"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;
