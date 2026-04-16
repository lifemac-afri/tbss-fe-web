import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import api from '../../lib/api';
import Pagination from '../../components/admin/Pagination';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dbkhlw7jn';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'tbss_gh';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const STOCK_STATUS = ['In-stock', 'Low-stock', 'Out-of-stock'];

const stockColor = {
  'In-stock': 'bg-green-100 text-green-700',
  'Low-stock': 'bg-amber-100 text-amber-700',
  'Out-of-stock': 'bg-red-100 text-red-600',
};

const emptyForm = {
  title: '', author: '', category: '', genre: '', price: '', oldPrice: '',
  stock: '', tag: 'Paperback', featured: false, coverImage: '', description: '',
  publisher: '', pages: '', language: 'English', isbn: '',
};

async function uploadToCloudinary(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'tbss/products');

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', CLOUDINARY_URL);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error('Upload error'));
    xhr.send(formData);
  });
}

function ImageUploader({ value, onChange }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10 MB.'); return; }
    setError('');
    setUploading(true);
    setProgress(0);
    try {
      const result = await uploadToCloudinary(file, setProgress);
      onChange(result.secure_url);
    } catch (e) {
      setError('Upload failed. Check Cloudinary preset settings.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="space-y-2">
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 h-40">
          <img src={value} alt="Product" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="px-3 py-1.5 bg-white text-gray-800 text-xs font-semibold rounded-lg hover:bg-gray-100"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-3 py-1.5 bg-red-500 text-white text-xs font-semibold rounded-lg hover:bg-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${uploading ? 'border-[#F46B03]/50 bg-orange-50' : 'border-gray-200 hover:border-[#F46B03]/60 hover:bg-orange-50/50'}`}
        >
          {uploading ? (
            <>
              <div className="w-8 h-8 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-[#F46B03] font-medium">Uploading… {progress}%</p>
              <div className="w-32 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-[#F46B03] transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <>
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-300"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <p className="text-xs text-gray-500">Drop image here or <span className="text-[#F46B03] font-medium">click to upload</span></p>
              <p className="text-xs text-gray-400">JPG, PNG, WebP · max 10 MB</p>
            </>
          )}
        </div>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-gray-100" />
        <span className="text-xs text-gray-400">or paste URL</span>
        <div className="h-px flex-1 bg-gray-100" />
      </div>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="https://res.cloudinary.com/..."
        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]"
      />
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFile(e.target.files[0])} />
    </div>
  );
}

function BulkUploadModal({ onClose, onImported }) {
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const downloadTemplate = async () => {
    const res = await api.get('/api/admin/products/bulk-upload/');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tbss_product_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/api/admin/products/bulk-upload/', formData);
      const data = await res.json();
      if (res.ok || res.status === 207) {
        setResult(data);
        if (data.created > 0) onImported();
      } else {
        setError(data.detail || 'Upload failed.');
      }
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const REQUIRED = ['title', 'price', 'stock_quantity', 'category'];
  const OPTIONAL = ['author', 'description', 'old_price', 'genre', 'sub_genre', 'tag', 'is_featured', 'is_bestseller', 'is_new_release', 'image', 'publisher', 'pages', 'language', 'isbn'];

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900">Bulk Import Products</h2>
            <p className="text-xs text-gray-400 mt-0.5">Categories, genres and sub-genres are created automatically from names</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Step 1 — Template */}
          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <svg width="20" height="20" fill="none" stroke="#1C25F2" strokeWidth="2" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="18"/><line x1="15" y1="15" x2="12" y2="18"/></svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-800 mb-0.5">Step 1 — Download the template</p>
              <p className="text-xs text-blue-600 mb-2">
                Use category, genre, and sub_genre <strong>names</strong> — they will be created automatically if they don't exist yet. Upload cover images to Cloudinary first and paste URLs in the <code className="bg-blue-100 px-1 rounded">image</code> column.
              </p>
              <button onClick={downloadTemplate} className="text-xs font-semibold text-blue-700 underline hover:text-blue-900">
                Download tbss_product_template.csv ↓
              </button>
            </div>
          </div>

          {/* Columns reference */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Required columns</p>
              <div className="flex flex-wrap gap-1.5">
                {REQUIRED.map(col => (
                  <span key={col} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-mono">{col}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-700 mb-1.5">Optional columns</p>
              <div className="flex flex-wrap gap-1.5">
                {OPTIONAL.map(col => (
                  <span key={col} className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-mono">{col}</span>
                ))}
              </div>
            </div>
            <div className="border-t border-gray-200 pt-3">
              <p className="text-xs text-gray-500 leading-relaxed">
                <span className="font-semibold text-gray-700">Auto-creation:</span> If <code className="bg-gray-200 px-1 rounded text-[11px]">category</code>, <code className="bg-gray-200 px-1 rounded text-[11px]">genre</code>, or <code className="bg-gray-200 px-1 rounded text-[11px]">sub_genre</code> names don't exist in the database, they will be created automatically. Matching is case-insensitive (e.g. "fiction" matches "Fiction").
              </p>
            </div>
          </div>

          {/* Step 2 — File upload */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">Step 2 — Upload your filled CSV</p>
            <div
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${file ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-[#F46B03]/50 hover:bg-orange-50/50'}`}
            >
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <svg width="16" height="16" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span className="text-sm font-medium text-green-700">{file.name}</span>
                  <button onClick={e => { e.stopPropagation(); setFile(null); setResult(null); }} className="text-gray-400 hover:text-gray-600 ml-2">✕</button>
                </div>
              ) : (
                <>
                  <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="mx-auto text-gray-300 mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <p className="text-sm text-gray-500">Click to select your <span className="font-medium">.csv</span> file</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={e => { setFile(e.target.files[0]); setResult(null); }} />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3">{error}</p>}

          {result && (
            <div className={`rounded-xl p-4 space-y-3 ${result.errors?.length > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
              <p className="font-semibold text-sm">
                {result.created > 0
                  ? `✅ ${result.created} product${result.created > 1 ? 's' : ''} imported successfully`
                  : '⚠️ No products were imported'}
              </p>

              {/* Auto-created taxonomy */}
              {(result.new_categories?.length > 0 || result.new_genres?.length > 0 || result.new_sub_genres?.length > 0) && (
                <div className="bg-white/60 rounded-lg p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-gray-700">Auto-created during import:</p>
                  {result.new_categories?.length > 0 && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium text-orange-700">Categories:</span> {result.new_categories.join(', ')}
                    </p>
                  )}
                  {result.new_genres?.length > 0 && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium text-blue-700">Genres:</span> {result.new_genres.join(', ')}
                    </p>
                  )}
                  {result.new_sub_genres?.length > 0 && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium text-purple-700">Sub-genres:</span> {result.new_sub_genres.join(', ')}
                    </p>
                  )}
                </div>
              )}

              {result.errors?.length > 0 && (
                <div className="space-y-1 max-h-36 overflow-y-auto">
                  <p className="text-xs font-semibold text-amber-800">{result.errors.length} row{result.errors.length > 1 ? 's' : ''} failed:</p>
                  {result.errors.map((e, i) => (
                    <p key={i} className="text-xs text-amber-700">Row {e.row} ({e.title || 'unknown'}): {e.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Close</button>
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="flex-1 bg-[#F46B03] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#C15300] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {loading ? <><div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />Importing…</> : 'Import Products'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsAdminPage() {
  const { get, post, put, del } = useAdmin();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showBulk, setShowBulk] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  const normalizeProduct = (p) => ({
    ...p,
    author: p.author || '',
    coverImage: p.image || p.coverImage || '',
    stock: p.stock_quantity ?? p.stock ?? 0,
    stockStatus: (p.stock_quantity ?? p.stock ?? 0) === 0 ? 'Out-of-stock' : ((p.stock_quantity ?? p.stock ?? 0) <= 5 ? 'Low-stock' : 'In-stock'),
    featured: p.is_featured ?? p.featured ?? false,
    oldPrice: p.old_price || p.oldPrice || '',
    genre: p.genre_name || p.genre || '',
    category: p.category_name || p.category || '',
    tag: p.tag || '',
    categoryId: p.category ?? '',
    genreId: p.genre ?? '',
  });

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
    if (search) params.set('search', search);
    if (catFilter !== 'All') params.set('category_name', catFilter);
    if (stockFilter === 'Out-of-stock') params.set('stock_status', 'out');
    else if (stockFilter === 'Low-stock') params.set('stock_status', 'low');
    else if (stockFilter === 'In-stock') params.set('stock_status', 'in');
    get(`/api/admin/products/?${params}`).then(data => {
      const list = Array.isArray(data) ? data : (data.results || []);
      const count = Array.isArray(data) ? list.length : (data.count || list.length);
      setProducts(list.map(normalizeProduct));
      setTotalCount(count);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [get, page, search, catFilter, stockFilter]);

  const loadProducts = fetchProducts;

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    get('/api/admin/categories/?page_size=200').then(data => {
      setCategories(Array.isArray(data) ? data : (data.results || []));
    });
    get('/api/admin/genres/?page_size=200').then(data => {
      setGenres(Array.isArray(data) ? data : (data.results || []));
    });
  }, []);

  const selectedCatId = categories.find(c => c.name === form.category)?.id;
  const filteredGenres = genres.filter(g => g.category?.id === selectedCatId || g.category === selectedCatId);

  const openAdd = () => {
    const defaultCat = categories[0]?.name || '';
    setForm({ ...emptyForm, category: defaultCat });
    setModal('add');
  };
  const openEdit = (p) => { setForm({ ...emptyForm, ...p, coverImage: p.coverImage || '' }); setModal(p); };
  const closeModal = () => { setModal(null); setSaving(false); };

  const handleSave = async () => {
    setSaving(true);
    const catId = categories.find(c => c.name === form.category)?.id;
    const genreId = genres.find(g => g.name === form.genre)?.id || null;

    const payload = {
      title: form.title,
      author: form.author,
      description: form.description,
      price: Number(form.price) || 0,
      old_price: form.oldPrice ? Number(form.oldPrice) : null,
      stock_quantity: Number(form.stock) || 0,
      image: form.coverImage,
      isbn: form.isbn,
      publisher: form.publisher,
      pages: form.pages ? Number(form.pages) : null,
      language: form.language || 'English',
      is_featured: form.featured,
      is_active: true,
      tag: form.tag,
      ...(catId && { category: catId }),
      ...(genreId && { genre: genreId }),
    };

    try {
      if (modal === 'add') {
        await post('/api/admin/products/', payload);
        fetchProducts();
      } else {
        const updated = await put(`/api/admin/products/${modal.id}/`, payload);
        if (search || catFilter !== 'All' || stockFilter !== 'All') {
          fetchProducts();
        } else {
          setProducts(prev => prev.map(p => p.id === updated.id ? normalizeProduct(updated) : p));
        }
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await del(`/api/admin/products/${id}/`);
    setDeleteConfirm(null);
    fetchProducts();
  };

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };
  const handleCatFilterChange = (e) => { setCatFilter(e.target.value); setPage(1); };
  const handleStockFilterChange = (e) => { setStockFilter(e.target.value); setPage(1); };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const catColor = Object.fromEntries(
    categories.map((c, i) => [c.name, ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-teal-100 text-teal-700', 'bg-pink-100 text-pink-700'][i % 4]])
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount} products</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchProducts} disabled={loading} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30" title="Refresh">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
          </button>
          <button
            onClick={() => setShowBulk(true)}
            className="flex items-center gap-2 border border-gray-200 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Bulk Import
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#F46B03] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#C15300] transition-colors"
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Search by title or author…"
          value={search}
          onChange={handleSearchChange}
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#F46B03]"
        />
        <select value={catFilter} onChange={handleCatFilterChange} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F46B03]">
          <option value="All">All Categories</option>
          {categories.map(c => <option key={c.id}>{c.name}</option>)}
        </select>
        <select value={stockFilter} onChange={handleStockFilterChange} className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F46B03]">
          <option value="All">All Stock</option>
          {STOCK_STATUS.map(s => <option key={s}>{s}</option>)}
        </select>
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
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Product</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Price</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Stock</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Featured</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {p.coverImage ? (
                          <img src={p.coverImage} alt="" className="w-9 h-12 object-cover rounded-lg flex-shrink-0" onError={e => { e.target.style.display = 'none'; }} />
                        ) : (
                          <div className="w-9 h-12 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="text-gray-300"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 truncate max-w-48">{p.title}</p>
                          <p className="text-xs text-gray-400">{p.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${catColor[p.category] || 'bg-gray-100 text-gray-600'}`}>{p.category}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="font-semibold text-gray-900">₵{p.price}</span>
                      {p.oldPrice && <span className="text-xs text-gray-400 line-through ml-1">₵{p.oldPrice}</span>}
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`font-semibold ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-amber-600' : 'text-gray-700'}`}>{p.stock}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${stockColor[p.stockStatus] || 'bg-gray-100 text-gray-600'}`}>{p.stockStatus}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      {p.featured ? (
                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700">Featured</span>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-[#F46B03] transition-colors p-1" title="Edit">
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(p)} className="text-gray-400 hover:text-red-500 transition-colors p-1" title="Delete">
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr><td colSpan="7" className="text-center py-12 text-gray-400 text-sm">No products found</td></tr>
                )}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} onPage={setPage} />
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modal !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-gray-900 text-lg">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Title *</label>
                <input value={form.title} onChange={f('title')} placeholder="Product title" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Author / Brand</label>
                <input value={form.author} onChange={f('author')} placeholder="Author or brand" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Category *</label>
                <select value={form.category} onChange={f('category')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              {filteredGenres.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Genre</label>
                  <select value={form.genre} onChange={f('genre')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]">
                    <option value="">Select genre</option>
                    {filteredGenres.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Tag / Format</label>
                <select value={form.tag} onChange={f('tag')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]">
                  {['Paperback', 'Hardcover', 'E-book', 'Board Game', 'Dice Game', 'Card Game', 'Journal', 'Planner', 'Other'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Price (₵) *</label>
                <input type="number" value={form.price} onChange={f('price')} placeholder="0.00" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Old / Compare Price (₵)</label>
                <input type="number" value={form.oldPrice || ''} onChange={f('oldPrice')} placeholder="Optional" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Stock Quantity *</label>
                <input type="number" value={form.stock} onChange={f('stock')} placeholder="0" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
              </div>
              <div className="flex items-center gap-3 pt-5">
                <input type="checkbox" id="featured-prod" checked={form.featured} onChange={f('featured')} className="w-4 h-4 accent-[#F46B03]" />
                <label htmlFor="featured-prod" className="text-sm text-gray-700 font-medium">Featured product</label>
              </div>

              {/* Cloudinary Image Uploader */}
              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Cover Image</label>
                <ImageUploader value={form.coverImage} onChange={url => setForm(prev => ({ ...prev, coverImage: url }))} />
              </div>

              <div className="col-span-2">
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Description</label>
                <textarea value={form.description} onChange={f('description')} rows={3} placeholder="Short product description…" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03] resize-none" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Publisher</label>
                <input value={form.publisher || ''} onChange={f('publisher')} placeholder="Publisher name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Pages</label>
                <input type="number" value={form.pages || ''} onChange={f('pages')} placeholder="Number of pages" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Language</label>
                <input value={form.language || 'English'} onChange={f('language')} placeholder="English" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">ISBN</label>
                <input value={form.isbn || ''} onChange={f('isbn')} placeholder="978-..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={closeModal} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.price}
                className="flex-1 bg-[#F46B03] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#C15300] disabled:opacity-50"
              >
                {saving ? 'Saving…' : modal === 'add' ? 'Add Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showBulk && (
        <BulkUploadModal
          onClose={() => setShowBulk(false)}
          onImported={() => { loadProducts(); }}
        />
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-center text-sm text-gray-500 mb-6">"{deleteConfirm.title}" will be permanently removed.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm.id)} className="flex-1 bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
