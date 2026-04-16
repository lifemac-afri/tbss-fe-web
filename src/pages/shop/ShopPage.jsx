import api from '../../lib/api';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronRight, LayoutGrid, List, Search } from 'lucide-react';
import BookCard from '../../components/BookCard';
import BookListCard from '../../components/BookListCard';
import { normalizeProduct } from '../../lib/normalizeProduct';
import SEO from '../../components/SEO';

const sortOptions = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'top-rated', label: 'Top Rated' },
];

const PRICE_MIN = 0;
const PRICE_MAX = 1000;
const PAGE_SIZE = 12;

const Stars = ({ count, total = 5 }) => (
  <span className="flex items-center gap-0.5">
    {Array.from({ length: total }).map((_, i) => (
      <svg key={i} viewBox="0 0 20 20" className={`w-4 h-4 ${i < count ? 'fill-[#F46B03]' : 'fill-gray-200'}`}>
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </span>
);

const RadioOption = ({ name, value, checked, onChange, label, children }) => (
  <label className="flex items-center gap-2.5 cursor-pointer py-0.5 group">
    <span className="relative flex-shrink-0 w-4 h-4">
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span className={`block w-4 h-4 rounded-full border-2 transition-colors ${checked ? 'border-[#F46B03] bg-white' : 'border-gray-300 bg-white group-hover:border-gray-400'}`} />
      {checked && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-[#F46B03]" />
        </span>
      )}
    </span>
    {children || (
      <span className={`text-sm transition-colors ${checked ? 'text-[#F46B03] font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>
        {label}
      </span>
    )}
  </label>
);

const FilterCard = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
    <h4 className="font-bold text-gray-900 text-sm mb-3">{title}</h4>
    {children}
  </div>
);

const DualRangeSlider = ({ min, max, step, value, onChange }) => {
  const [minVal, maxVal] = value;
  const pct = (v) => ((v - min) / (max - min)) * 100;
  return (
    <div className="relative h-6 flex items-center select-none" style={{ touchAction: 'none' }}>
      <div className="absolute left-0 right-0 h-[3px] bg-gray-200 rounded-full" />
      <div
        className="absolute h-[3px] bg-[#F46B03] rounded-full pointer-events-none"
        style={{ left: `${pct(minVal)}%`, width: `${pct(maxVal) - pct(minVal)}%` }}
      />
      <input type="range" min={min} max={max} step={step} value={minVal}
        onChange={(e) => { const v = Math.min(Number(e.target.value), maxVal - step); onChange([v, maxVal]); }}
        className="absolute w-full h-[3px] appearance-none bg-transparent cursor-pointer range-thumb-orange pointer-events-none"
        style={{ zIndex: minVal > max / 2 ? 5 : 3 }}
      />
      <input type="range" min={min} max={max} step={step} value={maxVal}
        onChange={(e) => { const v = Math.max(Number(e.target.value), minVal + step); onChange([minVal, v]); }}
        className="absolute w-full h-[3px] appearance-none bg-transparent cursor-pointer range-thumb-orange pointer-events-none"
        style={{ zIndex: 4 }}
      />
    </div>
  );
};

const FilterSidebar = ({
  genres,
  selectedGenre, setSelectedGenre,
  subGenres, selectedSubGenre, setSelectedSubGenre,
  priceRange, setPriceRange,
  selectedRating, setSelectedRating,
  selectedStock, setSelectedStock,
}) => (
  <div className="space-y-3 pb-8">
    <FilterCard title="Genre">
      <div className="space-y-2">
        {genres.map((g) => (
          <RadioOption key={g.id} name="genre" value={g.slug}
            checked={selectedGenre === g.slug}
            onChange={() => { setSelectedGenre(g.slug === selectedGenre ? '' : g.slug); setSelectedSubGenre(''); }}
            label={g.name}
          />
        ))}
      </div>
    </FilterCard>

    {selectedGenre && subGenres.length > 0 && (
      <FilterCard title="Sub-genre">
        <div className="space-y-2">
          {subGenres.map((sg) => (
            <RadioOption key={sg.id} name="sub_genre" value={sg.slug}
              checked={selectedSubGenre === sg.slug}
              onChange={() => setSelectedSubGenre(sg.slug === selectedSubGenre ? '' : sg.slug)}
              label={sg.name}
            />
          ))}
        </div>
      </FilterCard>
    )}

    <FilterCard title="Price">
      <div className="flex items-center gap-2 mb-4">
        <input type="number" value={priceRange[0]} min={PRICE_MIN} max={priceRange[1] - 5}
          onChange={(e) => setPriceRange([Math.max(PRICE_MIN, Number(e.target.value)), priceRange[1]])}
          className="w-[72px] text-sm text-center border border-gray-300 rounded-lg px-2 py-1.5 outline-none focus:border-[#F46B03] font-medium text-gray-700"
        />
        <span className="text-gray-400 text-sm">—</span>
        <input type="number" value={priceRange[1]} min={priceRange[0] + 5} max={PRICE_MAX}
          onChange={(e) => setPriceRange([priceRange[0], Math.min(PRICE_MAX, Number(e.target.value))])}
          className="w-[72px] text-sm text-center border border-gray-300 rounded-lg px-2 py-1.5 outline-none focus:border-[#F46B03] font-medium text-gray-700"
        />
      </div>
      <DualRangeSlider min={PRICE_MIN} max={PRICE_MAX} step={5} value={priceRange} onChange={setPriceRange} />
    </FilterCard>

    <FilterCard title="Rating">
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((r) => (
          <RadioOption key={r} name="rating" value={r}
            checked={selectedRating === r}
            onChange={() => setSelectedRating(r === selectedRating ? 0 : r)}
          >
            <Stars count={r} />
          </RadioOption>
        ))}
      </div>
    </FilterCard>

    <FilterCard title="Availability">
      <div className="space-y-2">
        {['In-stock', 'Out of stock'].map((s) => (
          <RadioOption key={s} name="stock" value={s}
            checked={selectedStock === s}
            onChange={() => setSelectedStock(s === selectedStock ? '' : s)}
            label={s}
          />
        ))}
      </div>
    </FilterCard>
  </div>
);

const ShopPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sort, setSort] = useState('relevance');
  const [viewMode, setViewMode] = useState('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [searchText, setSearchText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [selectedSubGenre, setSelectedSubGenre] = useState('');
  const [priceRange, setPriceRange] = useState([PRICE_MIN, PRICE_MAX]);
  const [selectedRating, setSelectedRating] = useState(0);
  const [selectedStock, setSelectedStock] = useState('');

  const [genres, setGenres] = useState([]);
  const [subGenres, setSubGenres] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const query = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';
  const genreParam = searchParams.get('genre') || '';
  const subGenreParam = searchParams.get('sub_genre') || '';
  const sortParam = searchParams.get('sort') || '';

  const debounceRef = useRef(null);

  useEffect(() => {
    if (sortParam === 'bestsellers') setSort('relevance');
    else if (sortParam === 'new') setSort('relevance');
    else if (sortParam === 'deals') setSort('relevance');
    else if (sortParam === 'great-reads') setSort('relevance');
    else if (sortParam === 'newest') setSort('newest');
    else if (sortParam) setSort(sortParam);
  }, [sortParam]);

  useEffect(() => {
    api.get('/api/genres/')
      .then((r) => r.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setGenres(list);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (genreParam) {
      setSelectedGenre(genreParam);
    } else {
      setSelectedGenre('');
    }
    setSelectedSubGenre(subGenreParam || '');
    setPage(1);
  }, [genreParam, subGenreParam]);

  useEffect(() => {
    if (!selectedGenre) { setSubGenres([]); return; }
    api.get(`/api/sub-genres/?genre=${selectedGenre}`)
      .then((r) => r.json())
      .then((data) => setSubGenres(Array.isArray(data) ? data : data.results || []))
      .catch(() => setSubGenres([]));
  }, [selectedGenre]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    const searchQuery = searchText.trim() || query;
    if (searchQuery) params.set('search', searchQuery);
    if (selectedGenre) params.set('genre', selectedGenre);
    if (selectedSubGenre) params.set('sub_genre', selectedSubGenre);
    if (categoryParam) params.set('category', categoryParam);
    if (priceRange[0] > PRICE_MIN) params.set('min_price', priceRange[0]);
    if (priceRange[1] < PRICE_MAX) params.set('max_price', priceRange[1]);
    if (selectedStock === 'In-stock') params.set('in_stock', 'true');
    if (selectedStock === 'Out of stock') params.set('in_stock', 'false');
    if (sort === 'price-asc') params.set('ordering', 'price');
    else if (sort === 'price-desc') params.set('ordering', '-price');
    else if (sort === 'newest') params.set('ordering', '-created_at');
    else if (sort === 'top-rated') params.set('ordering', '-average_rating');

    if (sortParam === 'bestsellers') params.set('is_bestseller', 'true');
    else if (sortParam === 'new') params.set('is_new_release', 'true');
    else if (sortParam === 'deals') params.set('is_todays_deal', 'true');
    else if (sortParam === 'great-reads') params.set('is_great_read', 'true');

    params.set('page', page);
    params.set('page_size', PAGE_SIZE);

    api.get(`/api/products/?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const raw = Array.isArray(data) ? data : data.results || [];
        let normalized = raw.map(normalizeProduct);
        if (selectedRating > 0) {
          normalized = normalized.filter((p) => p.rating >= selectedRating);
        }
        setProducts(normalized);
        setTotal(data.count || normalized.length);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load products. Please try again.');
        setLoading(false);
      });
  }, [searchText, query, selectedGenre, selectedSubGenre, categoryParam, priceRange, selectedStock, sort, sortParam, page, selectedRating]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(fetchProducts, 350);
    return () => clearTimeout(debounceRef.current);
  }, [fetchProducts]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const clearAllFilters = () => {
    setSelectedGenre('');
    setSelectedSubGenre('');
    setPriceRange([PRICE_MIN, PRICE_MAX]);
    setSelectedRating(0);
    setSelectedStock('');
    setPage(1);
  };

  const activeFilterCount = [
    selectedGenre,
    selectedSubGenre,
    selectedRating > 0 ? 'rating' : '',
    selectedStock,
    priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX ? 'price' : '',
  ].filter(Boolean).length;

  const categoryLabel = categoryParam === 'games' ? 'Games' : categoryParam === 'stationery' ? 'Stationeries' : '';
  const activeGenreName = genres.find((g) => g.slug === selectedGenre)?.name || genreParam || '';
  const pageTitle = query
    ? `Results for "${query}"`
    : categoryLabel
    ? categoryLabel
    : activeGenreName
    ? activeGenreName
    : sortParam === 'bestsellers'
    ? 'Bestsellers'
    : sortParam === 'new'
    ? 'New Releases'
    : sortParam === 'deals'
    ? "Today's Deals"
    : sortParam === 'great-reads'
    ? 'Great Reads'
    : sortParam === 'newest'
    ? 'New Arrivals'
    : 'All Books';

  const activeSubGenreName = subGenres.find((sg) => sg.slug === selectedSubGenre)?.name || '';

  const sidebarProps = {
    genres,
    selectedGenre,
    setSelectedGenre: (v) => { setSelectedGenre(v); setPage(1); },
    subGenres,
    selectedSubGenre,
    setSelectedSubGenre: (v) => { setSelectedSubGenre(v); setPage(1); },
    priceRange,
    setPriceRange: (v) => { setPriceRange(v); setPage(1); },
    selectedRating,
    setSelectedRating: (v) => { setSelectedRating(v); setPage(1); },
    selectedStock,
    setSelectedStock: (v) => { setSelectedStock(v); setPage(1); },
  };

  return (
    <>
      <style>{`
        .range-thumb-orange::-webkit-slider-thumb {
          -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%;
          background: #F46B03; cursor: pointer; border: 2px solid white;
          box-shadow: 0 1px 4px rgba(244,107,3,0.4);
          pointer-events: auto;
        }
        .range-thumb-orange::-moz-range-thumb {
          width: 18px; height: 18px; border-radius: 50%;
          background: #F46B03; cursor: pointer; border: 2px solid white;
          box-shadow: 0 1px 4px rgba(244,107,3,0.4);
          pointer-events: auto;
        }
        .sidebar-scroll::-webkit-scrollbar { width: 0; }
        .sidebar-scroll { scrollbar-width: none; }
      `}</style>

      <div className="bg-white min-h-screen">
        <SEO 
          title={pageTitle}
          description={`Browse our collection of ${pageTitle.toLowerCase()}. High-quality educational materials and books from TorchBearers Ghana.`}
          canonicalUrl="/shop"
        />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
            <Link to="/" className="hover:text-[#F46B03] transition-colors">Home</Link>
            <ChevronRight size={14} className="text-gray-300" />
            {activeGenreName ? (
              <>
                <Link to="/shop" className="hover:text-[#F46B03] transition-colors">Shop</Link>
                <ChevronRight size={14} className="text-gray-300" />
                <span className="text-gray-800 font-medium">{activeGenreName}</span>
              </>
            ) : (
              <span className="text-gray-800 font-medium">Shop</span>
            )}
          </nav>

          <div className="flex gap-6 items-start">
            {/* Sidebar — Desktop */}
            <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto sidebar-scroll">
              <div className="sticky top-0 z-10 bg-white pb-3">
                <button
                  onClick={() => setFiltersOpen(false)}
                  className="w-full bg-[#F46B03] hover:bg-[#C15300] transition-colors text-white font-bold text-base py-3.5 px-5 rounded-xl text-center shadow-sm"
                >
                  Narrow your search
                </button>
              </div>
              <FilterSidebar {...sidebarProps} />
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Active Filter Chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedGenre && (
                    <button onClick={() => { setSelectedGenre(''); setSelectedSubGenre(''); setPage(1); }}
                      className="inline-flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 bg-gray-100 hover:bg-gray-200 text-[#F46B03] rounded-lg transition-colors text-sm font-semibold font-poppins">
                      {activeGenreName} <X size={10} strokeWidth={2.5} />
                    </button>
                  )}
                  {selectedSubGenre && (
                    <button onClick={() => { setSelectedSubGenre(''); setPage(1); }}
                      className="inline-flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 bg-orange-50 hover:bg-orange-100 text-[#F46B03] rounded-lg transition-colors text-sm font-semibold font-poppins border border-orange-200">
                      {activeSubGenreName} <X size={10} strokeWidth={2.5} />
                    </button>
                  )}
                  {selectedRating > 0 && (
                    <button onClick={() => { setSelectedRating(0); setPage(1); }}
                      className="inline-flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 bg-gray-100 hover:bg-gray-200 text-[#F46B03] rounded-lg transition-colors text-sm font-semibold font-poppins">
                      {selectedRating}★ & up <X size={10} strokeWidth={2.5} />
                    </button>
                  )}
                  {selectedStock && (
                    <button onClick={() => { setSelectedStock(''); setPage(1); }}
                      className="inline-flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 bg-gray-100 hover:bg-gray-200 text-[#F46B03] rounded-lg transition-colors text-sm font-semibold font-poppins">
                      {selectedStock} <X size={10} strokeWidth={2.5} />
                    </button>
                  )}
                  {(priceRange[0] > PRICE_MIN || priceRange[1] < PRICE_MAX) && (
                    <button onClick={() => { setPriceRange([PRICE_MIN, PRICE_MAX]); setPage(1); }}
                      className="inline-flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 bg-gray-100 hover:bg-gray-200 text-[#F46B03] rounded-lg transition-colors text-sm font-semibold font-poppins">
                      ₵{priceRange[0]}–₵{priceRange[1]} <X size={10} strokeWidth={2.5} />
                    </button>
                  )}
                  <button onClick={clearAllFilters}
                    className="inline-flex items-center gap-1.5 h-9 px-3 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium">
                    Clear all
                  </button>
                </div>
              )}

              {/* Title + Search + Sort + View controls */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 font-poppins">{pageTitle}</h1>
                  {!loading && (
                    <p className="text-sm text-gray-500 mt-0.5">
                      {total} {total === 1 ? 'result' : 'results'}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Search */}
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
                      placeholder="Search books…"
                      className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white outline-none focus:border-[#F46B03] w-44"
                    />
                  </div>

                  {/* Mobile filter button */}
                  <button
                    onClick={() => setFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 h-9 px-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-[#F46B03] transition-colors"
                  >
                    <SlidersHorizontal size={15} />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#F46B03] text-white text-[10px] flex items-center justify-center font-bold">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>

                  {/* Sort */}
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); setPage(1); }}
                    className="h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white text-gray-700 outline-none focus:border-[#F46B03] cursor-pointer"
                  >
                    {sortOptions.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>

                  {/* View toggle */}
                  <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-1">
                    <button onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-[#F46B03] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                      <LayoutGrid size={15} />
                    </button>
                    <button onClick={() => setViewMode('list')}
                      className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#F46B03] text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                      <List size={15} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product Grid / List */}
              {loading ? (
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4'
                  : 'space-y-3'}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className={`bg-white rounded-xl border border-gray-100 animate-pulse ${viewMode === 'grid' ? 'p-3' : 'p-4 flex gap-4'}`}>
                      <div className={`bg-gray-100 rounded-lg ${viewMode === 'grid' ? 'aspect-[3/4.2] mb-3' : 'w-20 h-28 flex-shrink-0'}`} />
                      <div className={viewMode === 'list' ? 'flex-1 space-y-2' : 'space-y-2'}>
                        <div className="h-4 bg-gray-100 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-4 bg-gray-100 rounded w-1/4 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <svg width="160" height="140" viewBox="0 0 160 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6 opacity-90">
                    {/* Shelf */}
                    <rect x="10" y="108" width="140" height="8" rx="4" fill="#E5E7EB"/>
                    <rect x="4" y="112" width="152" height="4" rx="2" fill="#D1D5DB"/>
                    {/* Book 1 - tilted */}
                    <g transform="translate(22,52) rotate(-8)">
                      <rect width="26" height="56" rx="3" fill="#FED7AA"/>
                      <rect x="3" y="6" width="20" height="3" rx="1.5" fill="#F97316" opacity="0.6"/>
                      <rect x="3" y="12" width="14" height="2" rx="1" fill="#F97316" opacity="0.4"/>
                    </g>
                    {/* Book 2 */}
                    <rect x="52" y="52" width="24" height="56" rx="3" fill="#BFDBFE"/>
                    <rect x="55" y="58" width="18" height="3" rx="1.5" fill="#3B82F6" opacity="0.6"/>
                    <rect x="55" y="64" width="12" height="2" rx="1" fill="#3B82F6" opacity="0.4"/>
                    {/* Book 3 - tilted other way */}
                    <g transform="translate(78,50) rotate(5)">
                      <rect width="22" height="60" rx="3" fill="#D9F99D"/>
                      <rect x="3" y="6" width="16" height="3" rx="1.5" fill="#65A30D" opacity="0.6"/>
                      <rect x="3" y="12" width="10" height="2" rx="1" fill="#65A30D" opacity="0.4"/>
                    </g>
                    {/* Disconnected plug icon */}
                    <circle cx="118" cy="50" r="20" fill="#FEF2F2"/>
                    <path d="M110 50 L126 50" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="3 3"/>
                    <circle cx="109" cy="50" r="3" fill="#EF4444"/>
                    <circle cx="127" cy="50" r="3" fill="#EF4444"/>
                    <path d="M107 45 L107 55" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M129 45 L129 55" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                    {/* Stars/sparkles */}
                    <circle cx="30" cy="30" r="2" fill="#FCD34D" opacity="0.7"/>
                    <circle cx="50" cy="20" r="1.5" fill="#FCD34D" opacity="0.5"/>
                    <circle cx="140" cy="80" r="2" fill="#FCD34D" opacity="0.6"/>
                  </svg>
                  <h3 className="text-gray-800 font-bold text-lg mb-1">Couldn't load products</h3>
                  <p className="text-gray-400 text-sm mb-5 max-w-xs">The shop couldn't connect right now. Check your connection or try again in a moment.</p>
                  <button
                    onClick={fetchProducts}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F46B03] hover:bg-[#C15300] text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
                  >
                    Try again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                  <svg width="180" height="150" viewBox="0 0 180 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
                    {/* Shelf */}
                    <rect x="15" y="118" width="150" height="8" rx="4" fill="#E5E7EB"/>
                    <rect x="8" y="122" width="164" height="4" rx="2" fill="#D1D5DB"/>
                    {/* Book 1 */}
                    <rect x="28" y="62" width="22" height="56" rx="3" fill="#FED7AA"/>
                    <rect x="31" y="70" width="16" height="3" rx="1.5" fill="#F97316" opacity="0.5"/>
                    <rect x="31" y="76" width="10" height="2" rx="1" fill="#F97316" opacity="0.3"/>
                    {/* Book 2 - taller */}
                    <rect x="54" y="52" width="26" height="66" rx="3" fill="#C7D2FE"/>
                    <rect x="57" y="60" width="20" height="3" rx="1.5" fill="#6366F1" opacity="0.5"/>
                    <rect x="57" y="66" width="14" height="2" rx="1" fill="#6366F1" opacity="0.3"/>
                    <rect x="57" y="71" width="16" height="2" rx="1" fill="#6366F1" opacity="0.3"/>
                    {/* Book 3 - leaning */}
                    <g transform="translate(84,56) rotate(4)">
                      <rect width="20" height="62" rx="3" fill="#BBF7D0"/>
                      <rect x="3" y="8" width="14" height="3" rx="1.5" fill="#16A34A" opacity="0.5"/>
                      <rect x="3" y="14" width="9" height="2" rx="1" fill="#16A34A" opacity="0.3"/>
                    </g>
                    {/* Book 4 - short */}
                    <rect x="108" y="82" width="18" height="36" rx="3" fill="#FDE68A"/>
                    <rect x="111" y="88" width="12" height="2.5" rx="1.5" fill="#D97706" opacity="0.5"/>
                    <rect x="111" y="93" width="8" height="2" rx="1" fill="#D97706" opacity="0.3"/>
                    {/* Book 5 - leaning other way */}
                    <g transform="translate(128,62) rotate(-6)">
                      <rect width="20" height="56" rx="3" fill="#FBCFE8"/>
                      <rect x="3" y="8" width="14" height="2.5" rx="1.5" fill="#EC4899" opacity="0.5"/>
                      <rect x="3" y="13" width="9" height="2" rx="1" fill="#EC4899" opacity="0.3"/>
                    </g>
                    {/* Magnifying glass */}
                    <circle cx="90" cy="28" r="16" fill="#F3F4F6" stroke="#E5E7EB" strokeWidth="2"/>
                    <circle cx="90" cy="28" r="10" fill="white" stroke="#D1D5DB" strokeWidth="1.5"/>
                    <line x1="97" y1="35" x2="104" y2="43" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"/>
                    <path d="M86 28 Q90 22 94 28" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                    {/* Question mark inside lens */}
                    <text x="90" y="33" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#9CA3AF">?</text>
                  </svg>
                  <h3 className="text-gray-800 font-bold text-lg mb-1">No books found</h3>
                  <p className="text-gray-400 text-sm mb-5 max-w-xs">
                    {activeFilterCount > 0
                      ? 'No results match your current filters. Try broadening your search.'
                      : 'Nothing here yet. Try a different category or check back soon.'}
                  </p>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F46B03] hover:bg-[#C15300] text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.map((book) => (
                    <BookCard key={book.id} {...book} />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((book) => (
                    <BookListCard key={book.id} {...book} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!loading && totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#F46B03] disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-colors"
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                    const p = start + i;
                    return p <= totalPages ? (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                          p === page
                            ? 'bg-[#F46B03] text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:border-[#F46B03]'
                        }`}
                      >
                        {p}
                      </button>
                    ) : null;
                  })}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="h-9 px-4 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#F46B03] disabled:opacity-40 disabled:cursor-not-allowed bg-white transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
          <div className="relative ml-auto w-80 max-w-full h-full bg-white overflow-y-auto shadow-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 text-base">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>
            <FilterSidebar {...sidebarProps} />
            <div className="sticky bottom-0 bg-white pt-3 pb-2">
              <button onClick={() => setFiltersOpen(false)}
                className="w-full bg-[#F46B03] hover:bg-[#C15300] text-white font-bold py-3 rounded-xl transition-colors">
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShopPage;
