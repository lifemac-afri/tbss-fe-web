import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const BLOG_CATEGORIES = ['All', 'General', 'News', 'Tips', 'Reviews', 'Community'];

const CategoryTabs = ({ active, onChange }) => (
  <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
    {BLOG_CATEGORIES.map((cat) => (
      <button
        key={cat}
        onClick={() => onChange(cat)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors
          ${active === cat ? 'bg-[#F46B03] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      >
        {cat}
      </button>
    ))}
  </div>
);

const ArticleCard = ({ article }) => {
  const authorName = article.author
    ? [article.author.first_name, article.author.last_name].filter(Boolean).join(' ') || article.author.username
    : 'TBSS Team';
  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-[16/9] overflow-hidden bg-gray-100">
        {article.hero_image ? (
          <img src={article.hero_image} alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50">
            <span className="text-4xl">📖</span>
          </div>
        )}
      </div>
      <div className="p-5">
        <span className="inline-block text-xs font-semibold text-[#F46B03] bg-orange-50 rounded-full px-3 py-1 mb-3">
          {article.category_display || article.category}
        </span>
        <h3 className="font-bold text-gray-900 text-base mb-2 group-hover:text-[#F46B03] transition-colors line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="text-xs text-gray-400">{authorName} · {dateStr} · {article.read_time_minutes} min read</p>
      </div>
    </Link>
  );
};

const FeaturedArticleCard = ({ article }) => {
  const authorName = article.author
    ? [article.author.first_name, article.author.last_name].filter(Boolean).join(' ') || article.author.username
    : 'TBSS Team';
  const dateStr = article.published_at
    ? new Date(article.published_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row"
    >
      <div className="lg:w-1/2 aspect-[16/9] lg:aspect-auto lg:min-h-[260px] overflow-hidden bg-gray-100">
        {article.hero_image ? (
          <img src={article.hero_image} alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50">
            <span className="text-5xl">📖</span>
          </div>
        )}
      </div>
      <div className="flex-1 p-6 lg:p-8 flex flex-col justify-center">
        <span className="inline-block text-xs font-semibold text-[#F46B03] bg-orange-50 rounded-full px-3 py-1 mb-3 self-start">
          Featured · {article.category_display || article.category}
        </span>
        <h2 className="font-bold text-gray-900 text-xl mb-3 group-hover:text-[#F46B03] transition-colors leading-snug line-clamp-3">
          {article.title}
        </h2>
        <p className="text-sm text-gray-400">{authorName} · {dateStr} · {article.read_time_minutes} min read</p>
      </div>
    </Link>
  );
};

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-[16/9] bg-gray-100" />
    <div className="p-5 space-y-2">
      <div className="h-4 bg-gray-100 rounded w-1/4" />
      <div className="h-4 bg-gray-100 rounded w-3/4" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
  </div>
);

const BlogPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (activeCategory !== 'All') params.set('category', activeCategory);
    params.set('page_size', 24);

    fetch(`/api/blog/?${params.toString()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setArticles(list);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load articles.');
        setLoading(false);
      });
  }, [activeCategory, retryKey]);

  const [featured, ...rest] = articles;

  return (
    <>
      <Helmet>
        <title>Literary Hub — TBSS</title>
        <meta name="description" content="Book reviews, author interviews, reading lists and industry news from Ghana's leading bookstore." />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Literary Hub</h1>
            <p className="text-gray-500 text-sm">Reviews, insights, and stories for passionate readers</p>
          </div>

          <div className="mb-8">
            <CategoryTabs active={activeCategory} onChange={(cat) => { setActiveCategory(cat); }} />
          </div>

          {loading ? (
            <div className="space-y-8">
              <SkeletonCard />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
                {/* Desk surface */}
                <rect x="15" y="118" width="150" height="7" rx="3.5" fill="#E5E7EB"/>
                <rect x="25" y="125" width="8" height="22" rx="2" fill="#D1D5DB"/>
                <rect x="147" y="125" width="8" height="22" rx="2" fill="#D1D5DB"/>
                {/* Laptop body */}
                <rect x="50" y="78" width="80" height="42" rx="4" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1.5"/>
                <rect x="54" y="82" width="72" height="33" rx="2" fill="#E5E7EB"/>
                {/* Screen content - glitched lines */}
                <rect x="60" y="88" width="40" height="3" rx="1.5" fill="#9CA3AF" opacity="0.5"/>
                <rect x="60" y="94" width="28" height="3" rx="1.5" fill="#9CA3AF" opacity="0.3"/>
                <rect x="60" y="100" width="35" height="3" rx="1.5" fill="#9CA3AF" opacity="0.4"/>
                {/* Glitch / error bar */}
                <rect x="94" y="88" width="22" height="18" rx="2" fill="#FEE2E2"/>
                <text x="105" y="101" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#EF4444">!</text>
                {/* Laptop base */}
                <path d="M42 120 Q45 118 50 118 L130 118 Q135 118 138 120 L145 122 Q135 124 90 124 Q45 124 35 122 Z" fill="#D1D5DB"/>
                {/* Coffee mug */}
                <rect x="140" y="96" width="22" height="24" rx="4" fill="#FED7AA"/>
                <path d="M162 104 Q168 104 168 110 Q168 116 162 116" stroke="#F97316" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <rect x="143" y="99" width="16" height="3" rx="1.5" fill="#F97316" opacity="0.3"/>
                {/* Steam from coffee */}
                <path d="M147 93 Q149 88 147 84" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                <path d="M152 92 Q154 87 152 83" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                {/* Notebook */}
                <rect x="18" y="90" width="28" height="30" rx="3" fill="#C7D2FE"/>
                <rect x="21" y="94" width="22" height="2.5" rx="1" fill="#6366F1" opacity="0.4"/>
                <rect x="21" y="99" width="16" height="2" rx="1" fill="#6366F1" opacity="0.3"/>
                <rect x="21" y="104" width="19" height="2" rx="1" fill="#6366F1" opacity="0.3"/>
                <rect x="21" y="109" width="13" height="2" rx="1" fill="#6366F1" opacity="0.3"/>
                {/* Wifi crossed */}
                <circle cx="90" cy="50" r="18" fill="#FEF2F2"/>
                <path d="M82 54 Q90 46 98 54" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <path d="M85 58 Q90 53 95 58" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" fill="none"/>
                <circle cx="90" cy="62" r="2" fill="#EF4444"/>
                <line x1="84" y1="44" x2="96" y2="56" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <h3 className="text-gray-800 font-bold text-lg mb-1">Couldn't load articles</h3>
              <p className="text-gray-400 text-sm mb-5 max-w-xs">The Literary Hub couldn't connect right now. Check your connection or try again shortly.</p>
              <button
                onClick={() => setRetryKey((k) => k + 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F46B03] hover:bg-[#C15300] text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
              >
                Try again
              </button>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
                {/* Desk surface */}
                <rect x="15" y="118" width="150" height="7" rx="3.5" fill="#E5E7EB"/>
                <rect x="25" y="125" width="8" height="22" rx="2" fill="#D1D5DB"/>
                <rect x="147" y="125" width="8" height="22" rx="2" fill="#D1D5DB"/>
                {/* Open notebook - blank */}
                <rect x="44" y="68" width="92" height="52" rx="5" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>
                <line x1="90" y1="70" x2="90" y2="118" stroke="#E5E7EB" strokeWidth="1"/>
                {/* Left page - faint ruled lines */}
                <rect x="50" y="80" width="34" height="2" rx="1" fill="#F3F4F6"/>
                <rect x="50" y="86" width="28" height="2" rx="1" fill="#F3F4F6"/>
                <rect x="50" y="92" width="32" height="2" rx="1" fill="#F3F4F6"/>
                <rect x="50" y="98" width="24" height="2" rx="1" fill="#F3F4F6"/>
                <rect x="50" y="104" width="30" height="2" rx="1" fill="#F3F4F6"/>
                {/* Right page - blank with pencil */}
                <rect x="96" y="80" width="34" height="2" rx="1" fill="#F3F4F6"/>
                <rect x="96" y="86" width="28" height="2" rx="1" fill="#F3F4F6"/>
                {/* Pencil resting on right page */}
                <g transform="translate(96, 94) rotate(-20)">
                  <rect width="4" height="28" rx="1" fill="#FCD34D"/>
                  <polygon points="0,28 4,28 2,34" fill="#FBBF24"/>
                  <rect width="4" height="4" rx="0.5" fill="#FCA5A5"/>
                  <rect x="0.5" y="1" width="3" height="24" rx="0.5" fill="#FDE68A" opacity="0.6"/>
                </g>
                {/* Small star/sparkles */}
                <circle cx="30" cy="52" r="2" fill="#FCD34D" opacity="0.6"/>
                <circle cx="148" cy="60" r="2" fill="#FCD34D" opacity="0.5"/>
                <circle cx="155" cy="45" r="1.5" fill="#FCD34D" opacity="0.4"/>
                {/* Tag above notebook */}
                <rect x="56" y="34" width="68" height="26" rx="8" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5"/>
                <text x="90" y="52" textAnchor="middle" fontSize="9" fontWeight="600" fill="#F97316">No articles yet</text>
              </svg>
              <h3 className="text-gray-800 font-bold text-lg mb-1">Nothing here yet</h3>
              <p className="text-gray-400 text-sm max-w-xs">
                {activeCategory !== 'All'
                  ? `No articles in the "${activeCategory}" category yet. Try a different tab.`
                  : 'No articles published yet. Check back soon for fresh reads!'}
              </p>
            </div>
          ) : (
            <>
              {featured && (
                <div className="mb-8">
                  <FeaturedArticleCard article={featured} />
                </div>
              )}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rest.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogPage;
