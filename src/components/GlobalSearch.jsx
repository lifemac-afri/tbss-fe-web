import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { normalizeProduct } from '../lib/normalizeProduct';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const doSearch = useCallback((q) => {
    setSearching(true);
    api.get(`/api/products/?search=${encodeURIComponent(q)}&page_size=7`)
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        const normalized = list.map(normalizeProduct);
        setResults(normalized);
        setOpen(normalized.length > 0);
        setSearching(false);
      })
      .catch(() => {
        setResults([]);
        setOpen(false);
        setSearching(false);
      });
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, doSearch]);

  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (book) => {
    navigate(`/books/${book.id}`);
    setQuery('');
    setOpen(false);
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setOpen(false);
    inputRef.current?.focus();
  };

  const stockColor = (status) => {
    if (status === 'In-stock') return 'text-green-600';
    if (status === 'Out of stock') return 'text-red-500';
    return 'text-blue-500';
  };

  return (
    <div className="bg-white border-b border-gray-100 py-4 px-4">
      <div className="relative w-full max-w-2xl mx-auto" ref={containerRef}>
        <form onSubmit={handleSubmit}>
          <div className="relative flex items-center">
            {searching ? (
              <Loader2
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F46B03] pointer-events-none z-10 animate-spin"
              />
            ) : (
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
              />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length > 0 && setOpen(true)}
              placeholder="Search books, authors, genres..."
              className="w-full h-12 pl-11 pr-24 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-800 outline-none focus:border-[#F46B03] focus:bg-white focus:shadow-md transition-all duration-200"
            />
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-[84px] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 px-4 bg-[#F46B03] hover:bg-[#C15300] text-white text-sm font-semibold rounded-full transition-colors duration-200"
            >
              Search
            </button>
          </div>
        </form>

        {open && (
          <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <div className="px-4 py-2.5 border-b border-gray-50">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {results.map((book) => (
              <button
                key={book.id}
                onClick={() => handleSelect(book)}
                className="w-full flex items-center gap-3.5 px-4 py-3 hover:bg-orange-50 transition-colors text-left border-b border-gray-50 last:border-0 group"
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-9 object-cover rounded-lg flex-shrink-0 shadow-sm"
                  style={{ height: '52px', width: '36px' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#F46B03] transition-colors">
                    {book.title}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{book.author}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {book.genre && (
                      <span className="text-[10px] bg-orange-100 text-[#F46B03] font-medium px-2 py-0.5 rounded-full">
                        {book.genre}
                      </span>
                    )}
                    <span className={`text-[10px] font-medium ${stockColor(book.stockStatus)}`}>
                      {book.stockStatus}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-gray-900">₵{book.price}</p>
                  {book.oldPrice && (
                    <p className="text-[11px] text-gray-400 line-through">₵{book.oldPrice}</p>
                  )}
                </div>
              </button>
            ))}

            <button
              onClick={handleSubmit}
              className="w-full px-4 py-3 text-sm text-[#F46B03] font-semibold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2 border-t border-gray-100"
            >
              <Search size={13} />
              See all results for &quot;{query}&quot;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
