import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../components/admin/Pagination';

// ─── Inline price editor ──────────────────────────────────────────────────────
function InlinePrice({ value, onSave, placeholder = '—', prefix = '₵' }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  const start = () => {
    setDraft(value || '');
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = () => {
    setEditing(false);
    const num = parseFloat(draft);
    if (!isNaN(num) && num >= 0) {
      onSave(num.toFixed(2));
    } else if (draft === '' || draft === '0') {
      onSave(null);
    }
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="w-24 border border-[#F46B03] rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 outline-none bg-orange-50"
        placeholder="0.00"
        type="number"
        step="0.01"
        min="0"
      />
    );
  }

  return (
    <button
      onClick={start}
      className="group flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-[#F46B03] transition-colors"
      title="Click to edit"
    >
      {value ? `${prefix}${Number(value).toFixed(2)}` : <span className="text-gray-300 font-normal">{placeholder}</span>}
      <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="opacity-0 group-hover:opacity-60 transition-opacity flex-shrink-0">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    </button>
  );
}

// ─── Per-row % discount applier ──────────────────────────────────────────────
function InlineDiscountApplier({ product, onApply, saving }) {
  const [editing, setEditing] = useState(false);
  const [pct, setPct] = useState('');
  const inputRef = useRef(null);

  const open = () => { setPct(''); setEditing(true); setTimeout(() => inputRef.current?.focus(), 0); };

  const apply = () => {
    const p = parseFloat(pct);
    if (isNaN(p) || p <= 0 || p >= 100) return;
    const base = product.old_price ? parseFloat(product.old_price) : parseFloat(product.price);
    onApply({ price: (base * (1 - p / 100)).toFixed(2), old_price: base.toFixed(2) });
    setEditing(false);
  };

  if (!editing) {
    return (
      <button onClick={open} disabled={saving} className="text-[10px] font-semibold text-indigo-500 hover:text-indigo-700 transition-colors disabled:opacity-40">
        Set % off
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <input
        ref={inputRef}
        type="number" min="1" max="99"
        value={pct}
        onChange={e => setPct(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') apply(); if (e.key === 'Escape') setEditing(false); }}
        className="w-14 border border-[#F46B03] rounded-lg px-2 py-0.5 text-sm font-semibold outline-none bg-orange-50"
        placeholder="20"
      />
      <span className="text-xs text-gray-500">%</span>
      <button onClick={apply} className="text-xs bg-[#F46B03] text-white px-2 py-0.5 rounded-lg font-semibold">✓</button>
      <button onClick={() => setEditing(false)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
    </div>
  );
}

// ─── Section toggle pill ──────────────────────────────────────────────────────
const SECTION_CONFIG = {
  is_bestseller: { short: 'BS', label: 'Bestseller', on: 'bg-amber-100 text-amber-700 border-amber-200', off: 'bg-gray-100 text-gray-400 border-gray-200' },
  is_new_release: { short: 'NR', label: 'New Release', on: 'bg-blue-100 text-blue-700 border-blue-200', off: 'bg-gray-100 text-gray-400 border-gray-200' },
  is_todays_deal: { short: 'TD', label: "Today's Deal", on: 'bg-green-100 text-green-700 border-green-200', off: 'bg-gray-100 text-gray-400 border-gray-200' },
  is_great_read: { short: 'GR', label: 'Great Read', on: 'bg-purple-100 text-purple-700 border-purple-200', off: 'bg-gray-100 text-gray-400 border-gray-200' },
};

function SectionPill({ sectionKey, active, onToggle, saving }) {
  const cfg = SECTION_CONFIG[sectionKey];
  return (
    <button
      onClick={onToggle}
      disabled={saving}
      title={cfg.label}
      className={`text-xs font-bold px-2 py-0.5 rounded-full border transition-all ${active ? cfg.on : cfg.off} ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
    >
      {cfg.short}
    </button>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  const colors = {
    orange: 'bg-orange-50 border-orange-100 text-orange-600',
    green: 'bg-green-50 border-green-100 text-green-600',
    blue: 'bg-blue-50 border-blue-100 text-blue-600',
    purple: 'bg-purple-50 border-purple-100 text-purple-600',
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm font-semibold mt-0.5 opacity-80">{label}</p>
      {sub && <p className="text-xs opacity-60 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function DealsAdminPage() {
  const { get, patch } = useAdmin();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkSaving, setBulkSaving] = useState(false);
  const [bulkPct, setBulkPct] = useState('');
  const PAGE_SIZE = 20;

  // Global stats fetched independently of pagination
  const [stats, setStats] = useState({ all: 0, deals: 0, sale: 0, bestsellers: 0, new: 0, great: 0, avgDiscount: 0 });

  const fetchStats = useCallback(() => {
    Promise.all([
      get('/api/admin/products/?page_size=1').then(d => ({ all: d.count || 0 })).catch(() => ({})),
      get('/api/admin/products/?page_size=1&is_todays_deal=true').then(d => ({ deals: d.count || 0 })).catch(() => ({})),
      get('/api/admin/products/?page_size=1&on_sale=true').then(d => ({ sale: d.count || 0 })).catch(() => ({})),
      get('/api/admin/products/?page_size=1&is_bestseller=true').then(d => ({ bestsellers: d.count || 0 })).catch(() => ({})),
      get('/api/admin/products/?page_size=1&is_new_release=true').then(d => ({ new: d.count || 0 })).catch(() => ({})),
      get('/api/admin/products/?page_size=1&is_great_read=true').then(d => ({ great: d.count || 0 })).catch(() => ({})),
      (async () => {
        try {
          let allSaleItems = [];
          let url = '/api/admin/products/?page_size=100&on_sale=true';
          while (url) {
            const d = await get(url);
            allSaleItems = allSaleItems.concat(d.results || (Array.isArray(d) ? d : []));
            url = d.next ? d.next.replace(/^https?:\/\/[^/]+/, '') : null;
          }
          const withDiscount = allSaleItems.filter(p => p.old_price && parseFloat(p.old_price) > parseFloat(p.price));
          const avg = withDiscount.length
            ? Math.round(withDiscount.reduce((sum, p) => sum + ((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100, 0) / withDiscount.length)
            : 0;
          return { avgDiscount: avg };
        } catch { return {}; }
      })(),
    ]).then(results => {
      setStats(prev => ({ ...prev, ...Object.assign({}, ...results) }));
    });
  }, [get]);

  const TAB_PARAM_MAP = {
    deals: 'is_todays_deal=true',
    sale: 'on_sale=true',
    bestsellers: 'is_bestseller=true',
    new: 'is_new_release=true',
    great: 'is_great_read=true',
  };

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
    if (search) params.set('search', search);
    if (tab !== 'all' && TAB_PARAM_MAP[tab]) {
      const [key, val] = TAB_PARAM_MAP[tab].split('=');
      params.set(key, val);
    }
    get(`/api/admin/products/?${params}`).then(data => {
      const list = Array.isArray(data) ? data : (data.results || []);
      const count = Array.isArray(data) ? list.length : (data.count || list.length);
      setProducts(list);
      setTotalCount(count);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [get, page, search, tab]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleTabChange = (newTab) => { setTab(newTab); setPage(1); setSelectedIds(new Set()); };
  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); setSelectedIds(new Set()); };

  const toggleSelect = (id) => setSelectedIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  const toggleSelectAll = () => setSelectedIds(
    selectedIds.size === products.length ? new Set() : new Set(products.map(p => p.id))
  );
  const clearSelection = () => setSelectedIds(new Set());

  const bulkUpdate = async (fields) => {
    setBulkSaving(true);
    for (const id of [...selectedIds]) {
      try {
        const updated = await patch(`/api/admin/products/${id}/`, fields);
        setProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      } catch {}
    }
    setBulkSaving(false);
    fetchStats();
  };

  const bulkToggleSection = (key) => {
    const selected = products.filter(p => selectedIds.has(p.id));
    const allOn = selected.length > 0 && selected.every(p => p[key]);
    bulkUpdate({ [key]: !allOn });
  };

  const bulkApplyDiscount = async (pct) => {
    const p = parseFloat(pct);
    if (isNaN(p) || p <= 0 || p >= 100) return;
    setBulkSaving(true);
    for (const id of [...selectedIds]) {
      const product = products.find(pr => pr.id === id);
      if (!product) continue;
      const base = product.old_price ? parseFloat(product.old_price) : parseFloat(product.price);
      try {
        const updated = await patch(`/api/admin/products/${id}/`, {
          price: (base * (1 - p / 100)).toFixed(2),
          old_price: base.toFixed(2),
        });
        setProducts(prev => prev.map(pr => pr.id === updated.id ? { ...pr, ...updated } : pr));
      } catch {}
    }
    setBulkSaving(false);
    setBulkPct('');
    fetchStats();
  };

  const sectionAllOn = (key) => {
    const selected = products.filter(p => selectedIds.has(p.id));
    return selected.length > 0 && selected.every(p => p[key]);
  };

  const updateProduct = async (id, fields) => {
    setSaving(prev => ({ ...prev, [id]: true }));
    try {
      const updated = await patch(`/api/admin/products/${id}/`, fields);
      if (tab !== 'all') {
        fetchProducts();
      } else {
        setProducts(prev => prev.map(p => p.id === updated.id ? { ...p, ...updated } : p));
      }
      fetchStats();
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const discountPct = (p) => {
    if (!p.old_price || parseFloat(p.old_price) <= parseFloat(p.price)) return null;
    return Math.round(((parseFloat(p.old_price) - parseFloat(p.price)) / parseFloat(p.old_price)) * 100);
  };

  const TABS = [
    { id: 'all', label: 'All Products', count: stats.all },
    { id: 'deals', label: "Today's Deals", count: stats.deals },
    { id: 'sale', label: 'On Sale', count: stats.sale },
    { id: 'bestsellers', label: 'Bestsellers', count: stats.bestsellers },
    { id: 'new', label: 'New Releases', count: stats.new },
    { id: 'great', label: 'Great Reads', count: stats.great },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals & Promotions</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage sale prices, discounts, and homepage section placement — all in one place.
            Click any price to edit it inline.
          </p>
        </div>
        <button onClick={() => { fetchStats(); fetchProducts(); }} disabled={loading} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30" title="Refresh">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Today's Deals" value={stats.deals} sub="in Deals section" color="orange" />
        <StatCard label="Products On Sale" value={stats.sale} sub="with compare price" color="green" />
        <StatCard label="Avg. Discount" value={stats.avgDiscount ? `${stats.avgDiscount}%` : '—'} sub="across sale items" color="blue" />
        <StatCard label="Bestsellers" value={stats.bestsellers} sub="in Bestsellers section" color="purple" />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${tab === t.id ? 'bg-[#F46B03] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <input
          value={search}
          onChange={handleSearchChange}
          placeholder="Search by title or author…"
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#F46B03]"
        />
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 flex-wrap bg-gray-900 text-white rounded-2xl px-4 py-3 mb-4">
          <span className="text-sm font-semibold shrink-0">{selectedIds.size} selected</span>
          <button onClick={clearSelection} className="text-xs text-gray-400 hover:text-white transition-colors shrink-0">Clear</button>
          <div className="w-px h-5 bg-gray-600 shrink-0" />
          <span className="text-xs text-gray-400 shrink-0">Toggle for all:</span>
          {Object.entries(SECTION_CONFIG).map(([key, cfg]) => {
            const allOn = sectionAllOn(key);
            return (
              <button
                key={key}
                onClick={() => bulkToggleSection(key)}
                disabled={bulkSaving}
                title={`${allOn ? 'Remove from' : 'Add to'} ${cfg.label} for all selected`}
                className={`text-xs font-bold px-2.5 py-1 rounded-full border transition-all disabled:opacity-40 ${allOn ? cfg.on + ' opacity-100' : 'bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600'}`}
              >
                {allOn ? `− ${cfg.short}` : `+ ${cfg.short}`}
              </button>
            );
          })}
          <div className="w-px h-5 bg-gray-600 shrink-0" />
          <div className="flex items-center gap-1.5 shrink-0">
            <input
              type="number" min="1" max="99"
              value={bulkPct}
              onChange={e => setBulkPct(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && bulkApplyDiscount(bulkPct)}
              placeholder="20"
              disabled={bulkSaving}
              className="w-14 bg-gray-800 border border-gray-600 rounded-lg px-2 py-1 text-sm font-semibold text-white outline-none focus:border-[#F46B03] placeholder-gray-500 disabled:opacity-40"
            />
            <span className="text-gray-400 text-sm">%</span>
            <button
              onClick={() => bulkApplyDiscount(bulkPct)}
              disabled={bulkSaving || !bulkPct}
              className="text-xs bg-[#F46B03] hover:bg-[#C15300] text-white font-semibold px-3 py-1 rounded-lg transition-colors disabled:opacity-40"
            >
              Apply discount
            </button>
          </div>
          {bulkSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 mb-3 px-1">
        <p className="text-xs text-gray-400 font-medium">Section badges — click to toggle:</p>
        {Object.entries(SECTION_CONFIG).map(([key, cfg]) => (
          <span key={key} className={`text-xs font-bold px-2 py-0.5 rounded-full border ${cfg.on}`}>{cfg.short} = {cfg.label}</span>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left bg-gray-50/60">
                  <th className="pl-4 pr-2 py-3.5">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 accent-[#F46B03] cursor-pointer"
                      checked={products.length > 0 && selectedIds.size === products.length}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Product</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <span className="flex flex-col">
                      <span>Checkout Price</span>
                      <span className="text-gray-300 font-normal normal-case tracking-normal text-[10px]">what customers pay</span>
                    </span>
                  </th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    <span className="flex flex-col">
                      <span>Was / Original</span>
                      <span className="text-gray-300 font-normal normal-case tracking-normal text-[10px]">shown as strikethrough</span>
                    </span>
                  </th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Discount</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Sections</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const pct = discountPct(p);
                  const isSaving = saving[p.id];
                  return (
                    <tr key={p.id} className={`border-b border-gray-50 transition-colors ${selectedIds.has(p.id) ? 'bg-orange-50/40' : p.is_todays_deal ? 'bg-green-50/30' : 'hover:bg-gray-50/40'}`}>
                      <td className="pl-4 pr-2 py-3.5">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 accent-[#F46B03] cursor-pointer"
                          checked={selectedIds.has(p.id)}
                          onChange={() => toggleSelect(p.id)}
                        />
                      </td>
                      {/* Product */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          {isSaving && (
                            <div className="w-3 h-3 border border-[#F46B03] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                          )}
                          {p.image ? (
                            <img src={p.image} alt="" className="w-9 h-12 object-cover rounded-lg flex-shrink-0" onError={e => e.target.style.display = 'none'} />
                          ) : (
                            <div className="w-9 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-300"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-48">{p.title}</p>
                            <p className="text-xs text-gray-400 truncate">{p.author || p.category_name}</p>
                          </div>
                        </div>
                      </td>

                      {/* Regular price (current selling price) */}
                      <td className="px-3 py-3.5">
                        <InlinePrice
                          value={p.price}
                          onSave={val => updateProduct(p.id, { price: val })}
                          placeholder="Set price"
                        />
                      </td>

                      {/* Was / original price (compare-at) */}
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col gap-0.5">
                          <InlinePrice
                            value={p.old_price}
                            onSave={val => updateProduct(p.id, { old_price: val })}
                            placeholder="Set original price"
                          />
                          {p.old_price && (
                            <button
                              onClick={() => updateProduct(p.id, { old_price: null })}
                              className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors text-left"
                            >
                              Clear strikethrough
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Discount % + End Deal */}
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col gap-1.5">
                          <InlineDiscountApplier
                            product={p}
                            onApply={fields => updateProduct(p.id, fields)}
                            saving={isSaving}
                          />
                          {pct !== null ? (
                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full self-start">
                              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
                              {pct}% off
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                          {p.old_price && parseFloat(p.old_price) > parseFloat(p.price) && (
                            <button
                              onClick={() => updateProduct(p.id, {
                                price: parseFloat(p.old_price).toFixed(2),
                                old_price: null,
                                is_todays_deal: false,
                              })}
                              disabled={isSaving}
                              title={`Restore price to ₵${parseFloat(p.old_price).toFixed(2)} and end deal`}
                              className="flex items-center gap-1 text-[10px] font-semibold text-amber-600 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2 py-1 rounded-lg transition-colors self-start disabled:opacity-50"
                            >
                              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
                              End deal → ₵{parseFloat(p.old_price).toFixed(2)}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Section badges */}
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {Object.keys(SECTION_CONFIG).map(key => (
                            <SectionPill
                              key={key}
                              sectionKey={key}
                              active={!!p[key]}
                              onToggle={() => updateProduct(p.id, { [key]: !p[key] })}
                              saving={isSaving}
                            />
                          ))}
                        </div>
                      </td>

                      {/* Stock */}
                      <td className="px-3 py-3.5">
                        <InlinePrice
                          value={p.stock_quantity}
                          onSave={val => updateProduct(p.id, { stock_quantity: Math.max(0, parseInt(val) || 0) })}
                          placeholder="0"
                          prefix=""
                        />
                      </td>
                    </tr>
                  );
                })}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-16 text-gray-400 text-sm">
                      {search ? 'No products match your search' : 'No products in this view'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} onPage={setPage} />
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <p className="text-xs font-semibold text-amber-700 mb-1.5">How pricing & deals work</p>
        <ul className="text-xs text-amber-600 space-y-1">
          <li>• <strong>Checkout Price</strong> — the price customers actually pay. Lower this to put a product on sale.</li>
          <li>• <strong>Was / Original Price</strong> — displayed as a strikethrough next to the sale price, so customers can see the saving. Set this to the original full price before the discount.</li>
          <li>• The <strong>discount badge</strong> (e.g. "38% OFF") appears automatically on the product card whenever the original price is higher than the checkout price.</li>
          <li>• <strong>End deal</strong> — one click restores the checkout price back to the original price, clears the strikethrough, and removes the product from Today's Deals.</li>
          <li>• Click any price or stock number to edit it inline. Changes save immediately.</li>
        </ul>
      </div>
    </div>
  );
}
