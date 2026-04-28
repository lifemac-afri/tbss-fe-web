import api from '../lib/api';
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, ChevronDown, Bookmark, 
  LayoutGrid, Star, Gamepad2, PenTool, 
  BookOpen, Users, LogIn, UserPlus, 
  LogOut, Settings, LayoutDashboard 
} from 'lucide-react';
import logo from '../assets/logo/logo.png';
import cartIcon from '../assets/icons/cart.svg';
import Button from './Button';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const navItems = ['Books', 'Bestsellers', 'Games', 'Stationeries', 'Blogs', 'Community'];

const navItemIcons = {
  Books: LayoutGrid,
  Bestsellers: Star,
  Games: Gamepad2,
  Stationeries: PenTool,
  Blogs: BookOpen,
  Community: Users,
};

const navRoutes = {
  Bestsellers: '/bestsellers',
  Games: '/shop?genre=games',
  Stationeries: '/shop?genre=stationery',
  Blogs: '/blog',
  Community: '/community',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const MainNav = ({ activeItem, onItemClick }) => {
  const { isAuthenticated, currentUser, logout } = useAuth();
  const { cartCount, openCart } = useCart();
  const { wishlistCount, openWishlist } = useWishlist();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const [mobileGenreOpen, setMobileGenreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [genres, setGenres] = useState([]);
  const [hoveredGenre, setHoveredGenre] = useState(null);
  const [subGenres, setSubGenres] = useState([]);
  const genreRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (genreRef.current && !genreRef.current.contains(e.target)) { setGenreOpen(false); setHoveredGenre(null); setSubGenres([]); }
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    api.get('/api/genres/')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        setGenres(list);
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!hoveredGenre) { setSubGenres([]); return; }
    api.get(`/api/sub-genres/?genre=${hoveredGenre.slug}`)
      .then(r => r.json())
      .then(data => setSubGenres(Array.isArray(data) ? data : (data.results || [])))
      .catch(() => setSubGenres([]));
  }, [hoveredGenre]);

  const handleNavClick = (item) => {
    if (item === 'Books') { setGenreOpen((prev) => !prev); onItemClick?.(item); return; }
    setGenreOpen(false);
    onItemClick?.(item);
    if (navRoutes[item]) navigate(navRoutes[item]);
  };

  const handleGenreSelect = (slug) => {
    setGenreOpen(false);
    setHoveredGenre(null);
    setSubGenres([]);
    navigate(slug ? `/shop?genre=${slug}` : '/shop');
  };

  const handleSubGenreSelect = (genreSlug, subSlug) => {
    setGenreOpen(false);
    setHoveredGenre(null);
    setSubGenres([]);
    navigate(`/shop?genre=${genreSlug}&sub_genre=${subSlug}`);
  };

  const firstName = currentUser?.first_name || '';

  return (
    <nav className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">

          {/* Logo */}
          <div className="flex-1 flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img src={logo} alt="TBSS Logo" className="h-10 w-auto" />
            </Link>
          </div>

          {/* Nav items — centred, desktop only */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navItems.map((item) => {
              if (item === 'Books') {
                return (
                  <div key="Books" className="relative" ref={genreRef}>
                    <button
                      onClick={() => handleNavClick('Books')}
                      className={`flex items-center gap-1 text-sm font-bold transition-colors duration-200 bg-transparent border-none cursor-pointer whitespace-nowrap
                        ${activeItem === 'Books' ? 'text-[#F46B03]' : 'text-gray-700 hover:text-[#F46B03]'}`}
                    >
                      Books
                      <ChevronDown size={15} className={`transition-transform duration-200 ${genreOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {genreOpen && (
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 flex overflow-hidden transition-all"
                        style={{ width: hoveredGenre && subGenres.length > 0 ? 480 : 240 }}
                      >
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l border-t border-gray-100 rotate-45 rounded-sm" />
                        <div className="w-60 flex-shrink-0 p-4">
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Browse Books</p>
                          <button
                            onClick={() => handleGenreSelect(null)}
                            onMouseEnter={() => setHoveredGenre(null)}
                            className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-[#F46B03] transition-colors"
                          >
                            All Books
                          </button>
                          {genres.map((g) => (
                            <button
                              key={g.slug}
                              onClick={() => handleGenreSelect(g.slug)}
                              onMouseEnter={() => setHoveredGenre(g)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group
                                ${hoveredGenre?.slug === g.slug ? 'bg-orange-50 text-[#F46B03]' : 'text-gray-700 hover:bg-orange-50 hover:text-[#F46B03]'}`}
                            >
                              {g.name}
                              <ChevronDown size={12} className="-rotate-90 opacity-30 group-hover:opacity-80 transition-opacity" />
                            </button>
                          ))}
                        </div>
                        {hoveredGenre && subGenres.length > 0 && (
                          <div className="w-56 border-l border-gray-100 p-4 bg-gray-50/60">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">{hoveredGenre.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {subGenres.map((sg) => (
                                <button
                                  key={sg.slug}
                                  onClick={() => handleSubGenreSelect(hoveredGenre.slug, sg.slug)}
                                  className="px-2.5 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 hover:border-[#F46B03] hover:text-[#F46B03] transition-colors"
                                >
                                  {sg.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <button
                  key={item}
                  onClick={() => handleNavClick(item)}
                  className={`text-sm font-bold transition-colors duration-200 bg-transparent border-none cursor-pointer whitespace-nowrap
                    ${activeItem === item ? 'text-[#F46B03]' : 'text-gray-700 hover:text-[#F46B03]'}`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex-1 flex items-center justify-end gap-3">

            {/* ── Cart ──────────────────────────────────────── */}
            {/* Mobile: link to page */}
            <Link to="/cart" className="lg:hidden relative p-1 hover:opacity-70 transition-opacity" aria-label="Cart">
              <img src={cartIcon} alt="Cart" className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F46B03] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </Link>
            {/* Desktop: open drawer */}
            <button onClick={openCart} className="hidden lg:flex relative p-1 hover:opacity-70 transition-opacity" aria-label="Cart">
              <img src={cartIcon} alt="Cart" className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F46B03] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </button>

            {/* ── Wishlist ───────────────────────────────────── */}
            {/* Mobile: link to page */}
            <Link to="/wishlist" className="lg:hidden relative p-1 hover:opacity-70 transition-opacity" aria-label="Wishlist">
              <Bookmark size={22} className={isAuthenticated && wishlistCount > 0 ? 'text-[#F46B03] fill-[#F46B03]' : 'text-gray-600'} />
              {isAuthenticated && wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F46B03] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </Link>
            {/* Desktop: open drawer */}
            <button onClick={openWishlist} className="hidden lg:flex relative p-1 hover:opacity-70 transition-opacity" aria-label="Wishlist">
              <Bookmark size={22} className={isAuthenticated && wishlistCount > 0 ? 'text-[#F46B03] fill-[#F46B03]' : 'text-gray-600'} />
              {isAuthenticated && wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F46B03] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistCount > 9 ? '9+' : wishlistCount}
                </span>
              )}
            </button>

            {/* ── Auth area ─────────────────────────────────── */}
            {isAuthenticated ? (
              /* Logged in — avatar + greeting + dropdown */
              <div className="hidden lg:flex items-center gap-2.5 relative" ref={profileRef}>
                {console.log(currentUser)}
                {/* Greeting */}
                <div className="text-right leading-none">
                  <p className="text-[10px] text-gray-400 font-medium">{getGreeting()}</p>
                  <p className="text-sm font-bold text-gray-900 truncate max-w-[100px]">{firstName}</p>
                </div>

                {/* Avatar */}
                <button
                  onClick={() => setProfileOpen((p) => !p)}
                  className="w-9 h-9 rounded-full bg-[#F46B03] text-white text-sm font-bold hover:opacity-80 transition-opacity flex items-center justify-center shadow-sm"
                  aria-label="Account"
                >
                  {(currentUser?.first_name?.[0] || 'U').toUpperCase() + (currentUser?.last_name?.[0] || '').toUpperCase()}
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 py-2 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-bold text-gray-900 truncate">{currentUser?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
                    </div>
                    <Link to="/dashboard" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-[#F46B03] hover:bg-orange-50 transition-colors">My Dashboard</Link>
                    <Link to="/dashboard/orders" onClick={() => setProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:text-[#F46B03] hover:bg-orange-50 transition-colors">My Orders</Link>
                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button onClick={() => { logout(); setProfileOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in — Sign In button only */
              <Link to="/login" className="hidden lg:block">
                <Button variant="solid" size="sm" className="rounded-full px-5">Sign In</Button>
              </Link>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#F46B03] transition-colors shadow-sm bg-gray-50 rounded-lg"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex overflow-hidden">
          <div className="w-80 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col pt-8 overflow-y-auto animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between px-6 mb-8">
              <img src={logo} alt="TBSS Logo" className="h-9 w-auto" />
              <button 
                onClick={() => setMobileOpen(false)} 
                className="p-2.5 rounded-full bg-gray-50 text-gray-500 hover:text-[#F46B03] hover:bg-orange-50 transition-all border border-gray-100"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* User info if logged in */}
            {isAuthenticated && (
              <div className="mx-6 mb-8 p-4 bg-gradient-to-br from-orange-50 to-white rounded-3xl flex items-center gap-4 border border-orange-100 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-[#F46B03] text-white font-bold text-base flex items-center justify-center flex-shrink-0 shadow-lg shadow-orange-200">
                  {currentUser?.first_name?.[0]?.toUpperCase() || 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-0.5">{getGreeting()}</p>
                  <p className="text-base font-bold text-gray-900 truncate font-poppins">{firstName}</p>
                </div>
              </div>
            )}

            <nav className="flex-1 px-6 space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-4 px-1">Navigation Menu</p>
              {navItems.map((item) => {
                const Icon = navItemIcons[item];
                const isActive = activeItem === item;
                if (item === 'Books') {
                  const isGenreActive = mobileGenreOpen || isActive;
                  return (
                    <div key="Books" className="mb-1">
                      <button
                        onClick={() => setMobileGenreOpen((p) => !p)}
                        className={`w-full flex items-center justify-between py-3.5 px-4 rounded-2xl text-base font-bold transition-all
                          ${isGenreActive ? 'bg-orange-50 text-[#F46B03]' : 'text-gray-700 hover:bg-gray-50'}`}
                      >
                        <div className="flex items-center gap-3">
                          {Icon && <Icon size={20} className={isGenreActive ? 'text-[#F46B03]' : 'text-gray-400'} />}
                          <span className="font-poppins">{item}</span>
                        </div>
                        <ChevronDown size={18} className={`transition-transform duration-300 ${mobileGenreOpen ? 'rotate-180' : ''} opacity-40`} />
                      </button>
                      {mobileGenreOpen && (
                        <div className="mt-1 ml-4 pl-7 border-l-2 border-orange-50 py-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          <button
                            onClick={() => { handleGenreSelect(null); setMobileOpen(false); }}
                            className="w-full text-left py-2.5 text-sm text-gray-500 font-medium hover:text-[#F46B03] transition-colors font-poppins"
                          >
                            All Categories
                          </button>
                          {genres.map((g) => (
                            <button
                              key={g.slug}
                              onClick={() => { handleGenreSelect(g.slug); setMobileOpen(false); }}
                              className="w-full text-left py-2.5 text-sm font-medium text-gray-600 hover:text-[#F46B03] transition-colors font-poppins flex items-center gap-2"
                            >
                              <span className="w-1 h-1 rounded-full bg-gray-200" />
                              {g.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }
                return (
                  <button
                    key={item}
                    onClick={() => { handleNavClick(item); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 py-3.5 px-4 rounded-2xl text-base font-bold transition-all font-poppins
                      ${isActive ? 'bg-orange-50 text-[#F46B03]' : 'text-gray-700 hover:bg-gray-50 hover:text-[#F46B03]'}`}
                  >
                    {Icon && <Icon size={20} className={isActive ? 'text-[#F46B03]' : 'text-gray-400'} />}
                    {item}
                  </button>
                );
              })}
            </nav>

            {/* Auth Section */}
            <div className="px-6 pb-12 pt-6 border-t border-gray-100 flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                    <Button variant="solid" className="w-full rounded-2xl p-6 shadow-xl shadow-orange-100 flex items-center justify-center gap-3 font-bold group">
                      <LayoutDashboard size={20} className="group-hover:scale-110 transition-transform" />
                      My Dashboard
                    </Button>
                  </Link>
                  <button 
                    onClick={() => { logout(); setMobileOpen(false); }} 
                    className="w-full flex items-center justify-center gap-2.5 py-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100"
                  >
                    <LogOut size={18} />
                    Sign Out Account
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1 px-1">My Account</p>
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="w-full">
                    <Button variant="solid" className="w-full rounded-2xl p-6 shadow-xl shadow-orange-100 flex items-center justify-center gap-3 font-bold group">
                      <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileOpen(false)} className="w-full">
                    <Button variant="outline" className="w-full rounded-2xl p-6 border-2 border-gray-100 hover:border-[#F46B03] hover:text-[#F46B03] flex items-center justify-center gap-3 font-bold transition-all bg-white">
                      <UserPlus size={20} />
                      Create Account
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          {/* Backdrop */}
          <div className="flex-1 bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-300" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </nav>
  );
};

export default MainNav;
