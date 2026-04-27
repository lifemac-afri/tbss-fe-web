import React, { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../components/admin/Pagination';

const SECTIONS = [
  {
    key: 'is_bestseller',
    label: 'Bestsellers',
    description: 'Top-selling books featured prominently on the homepage.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    color: 'amber',
    bgClass: 'bg-amber-50 border-amber-200',
    headerClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700',
    activeClass: 'border-amber-400 ring-1 ring-amber-300/60',
  },
  {
    key: 'is_new_release',
    label: 'New Releases',
    description: 'Recently published books shown in the New Releases section.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        <line x1="12" y1="7" x2="12" y2="13"/><line x1="9" y1="10" x2="15" y2="10"/>
      </svg>
    ),
    color: 'blue',
    bgClass: 'bg-blue-50 border-blue-200',
    headerClass: 'bg-blue-500',
    badgeClass: 'bg-blue-100 text-blue-700',
    activeClass: 'border-blue-400 ring-1 ring-blue-300/60',
  },
  {
    key: 'is_todays_deal',
    label: "Today's Deals",
    description: 'Discounted or promotional items shown in the Deals section.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
    ),
    color: 'green',
    bgClass: 'bg-green-50 border-green-200',
    headerClass: 'bg-green-500',
    badgeClass: 'bg-green-100 text-green-700',
    activeClass: 'border-green-400 ring-1 ring-green-300/60',
  },
  {
    key: 'is_great_read',
    label: 'Great Reads',
    description: 'Editor-picked books and staff recommendations.',
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    ),
    color: 'purple',
    bgClass: 'bg-purple-50 border-purple-200',
    headerClass: 'bg-purple-500',
    badgeClass: 'bg-purple-100 text-purple-700',
    activeClass: 'border-purple-400 ring-1 ring-purple-300/60',
  },
];

export default function SectionsAdminPage() {
  const { get, patch } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(SECTIONS[0].key);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState({});
  const [filterMode, setFilterMode] = useState('all');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      let results = [];
      let url = '/api/admin/products/?page_size=100';
      while (url) {
        const data = await get(url);
        results = results.concat(Array.isArray(data) ? data : (data.results || []));
        url = (!Array.isArray(data) && data.next) ? data.next.replace(/^https?:\/\/[^/]+/, '') : null;
      }
      setProducts(results);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const section = SECTIONS.find(s => s.key === activeSection);

  const toggleSection = async (product, sectionKey, value) => {
    setSaving(prev => ({ ...prev, [product.id]: true }));
    try {
      const updated = await patch(`/api/admin/products/${product.id}/`, { [sectionKey]: value });
      setProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
    } catch {
      // silent
    } finally {
      setSaving(prev => ({ ...prev, [product.id]: false }));
    }
  };

  const inSection = products.filter(p => p[activeSection]);
  const notInSection = products.filter(p => !p[activeSection]);

  const filterProducts = (list) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(p => p.title?.toLowerCase().includes(q) || p.author?.toLowerCase().includes(q));
  };

  const displayList = filterMode === 'in'
    ? filterProducts(inSection)
    : filterMode === 'out'
    ? filterProducts(notInSection)
    : filterProducts(products);

  useEffect(() => setPage(1), [search, filterMode, activeSection]);
  const totalPages = Math.ceil(displayList.length / PAGE_SIZE);
  const paginated = displayList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const colorMap = {
    amber: { toggle: 'bg-amber-500', hover: 'hover:bg-amber-600', remove: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
    blue: { toggle: 'bg-blue-500', hover: 'hover:bg-blue-600', remove: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
    green: { toggle: 'bg-green-500', hover: 'hover:bg-green-600', remove: 'bg-green-100 text-green-700 hover:bg-green-200' },
    purple: { toggle: 'bg-purple-500', hover: 'hover:bg-purple-600', remove: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  };
  const c = colorMap[section.color];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Homepage Sections</h1>
          <p className="text-sm text-gray-500 mt-1">Control which products appear in each section on the storefront homepage</p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30" title="Refresh">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>

      {/* Section tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {SECTIONS.map(s => {
          const count = products.filter(p => p[s.key]).length;
          const isActive = activeSection === s.key;
          return (
            <button
              key={s.key}
              onClick={() => { setActiveSection(s.key); setSearch(''); setFilterMode('all'); }}
              className={`text-left p-4 rounded-2xl border-2 transition-all ${isActive ? s.activeClass + ' bg-white' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${isActive ? s.headerClass + ' text-white' : 'bg-gray-100 text-gray-400'}`}>
                {s.icon}
              </div>
              <p className={`text-sm font-bold ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>{s.label}</p>
              <p className={`text-xs mt-0.5 font-medium ${isActive ? 'text-gray-500' : 'text-gray-400'}`}>{count} product{count !== 1 ? 's' : ''}</p>
            </button>
          );
        })}
      </div>

      {/* Active section panel */}
      <div className="bg-white rounded-2xl border border-gray-100">
        {/* Panel header */}
        <div className={`p-5 rounded-t-2xl border-b border-gray-100 ${section.bgClass}`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0 ${section.headerClass}`}>
              {section.icon}
            </div>
            <div>
              <h2 className="font-bold text-gray-900">{section.label}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
            </div>
            <div className="ml-auto flex-shrink-0">
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${section.badgeClass}`}>
                {inSection.length} active
              </span>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-3 p-4 border-b border-gray-50">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#F46B03]"
          />
          <div className="flex rounded-xl overflow-hidden border border-gray-200">
            {[
              { id: 'all', label: `All (${products.length})` },
              { id: 'in', label: `In section (${inSection.length})` },
              { id: 'out', label: `Not in (${notInSection.length})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterMode(tab.id)}
                className={`px-3 py-2 text-xs font-medium transition-colors ${filterMode === tab.id ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product list */}
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-7 h-7 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">
            {search ? 'No products match your search' : filterMode === 'in' ? `No products in ${section.label} yet` : 'No products found'}
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {paginated.map(product => {
              const isIn = !!product[activeSection];
              const isSaving = saving[product.id];
              return (
                <div key={product.id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isIn ? 'bg-gray-50/50' : 'bg-white hover:bg-gray-50/30'}`}>
                  {/* Book cover */}
                  {product.image ? (
                    <img src={product.image} alt="" className="w-9 h-12 object-cover rounded-lg flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                  ) : (
                    <div className="w-9 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-300"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{product.title}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {product.author && <span className="text-xs text-gray-400">{product.author}</span>}
                      {product.category_name && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">{product.category_name}</span>
                      )}
                      <span className="text-xs font-semibold text-gray-700">₵{product.price}</span>
                    </div>
                  </div>

                  {/* Section badges for other sections */}
                  <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                    {SECTIONS.filter(s => s.key !== activeSection && product[s.key]).map(s => (
                      <span key={s.key} className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.badgeClass}`}>{s.label}</span>
                    ))}
                  </div>

                  {/* Toggle button */}
                  <button
                    onClick={() => toggleSection(product, activeSection, !isIn)}
                    disabled={isSaving}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isSaving ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' :
                      isIn
                        ? c.remove
                        : `${c.toggle} text-white ${c.hover}`
                    }`}
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isIn ? (
                      <>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        Remove
                      </>
                    ) : (
                      <>
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add
                      </>
                    )}
                  </button>
                </div>
              );
            })}
            <Pagination page={page} totalPages={totalPages} totalCount={displayList.length} pageSize={PAGE_SIZE} onPage={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
