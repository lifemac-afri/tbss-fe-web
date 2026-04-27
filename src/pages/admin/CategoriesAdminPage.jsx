import React, { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

function Spinner() {
  return <div className="w-7 h-7 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />;
}

function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg width="22" height="22" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
        </div>
        <h3 className="text-center font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-center text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50">Cancel</button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-600">Delete</button>
        </div>
      </div>
    </div>
  );
}

const EditIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6"/>
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
  </svg>
);

export default function CategoriesAdminPage() {
  const { get, post, put, del } = useAdmin();

  const [categories, setCategories] = useState([]);
  const [genres, setGenres] = useState([]);
  const [subGenres, setSubGenres] = useState([]);

  const [loadingCats, setLoadingCats] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingSubGenres, setLoadingSubGenres] = useState(false);

  const [selectedCat, setSelectedCat] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState(null);

  const [catForm, setCatForm] = useState({ name: '' });
  const [editingCat, setEditingCat] = useState(null);
  const [savingCat, setSavingCat] = useState(false);
  const [deleteCat, setDeleteCat] = useState(null);

  const [genreForm, setGenreForm] = useState({ name: '' });
  const [editingGenre, setEditingGenre] = useState(null);
  const [savingGenre, setSavingGenre] = useState(false);
  const [deleteGenre, setDeleteGenre] = useState(null);

  const [subGenreForm, setSubGenreForm] = useState({ name: '' });
  const [editingSubGenre, setEditingSubGenre] = useState(null);
  const [savingSubGenre, setSavingSubGenre] = useState(false);
  const [deleteSubGenre, setDeleteSubGenre] = useState(null);

  const fetchCategories = useCallback(() => {
    setLoadingCats(true);
    get('/api/admin/categories/?page_size=200').then(data => {
      const list = Array.isArray(data) ? data : (data.results || []);
      setCategories(list);
      setLoadingCats(false);
    }).catch(() => setLoadingCats(false));
  }, [get]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const loadGenres = (catId) => {
    setLoadingGenres(true);
    setSelectedGenre(null);
    setSubGenres([]);
    get(`/api/admin/genres/?category=${catId}&page_size=200`).then(data => {
      const list = Array.isArray(data) ? data : (data.results || []);
      setGenres(list);
      setLoadingGenres(false);
    }).catch(() => setLoadingGenres(false));
  };

  const loadSubGenres = (genreId) => {
    setLoadingSubGenres(true);
    get(`/api/admin/sub-genres/?genre=${genreId}&page_size=200`).then(data => {
      const list = Array.isArray(data) ? data : (data.results || []);
      setSubGenres(list);
      setLoadingSubGenres(false);
    }).catch(() => setLoadingSubGenres(false));
  };

  const selectCategory = (cat) => {
    setSelectedCat(cat);
    setEditingGenre(null);
    setEditingSubGenre(null);
    setGenreForm({ name: '' });
    setSubGenreForm({ name: '' });
    loadGenres(cat.id);
  };

  const selectGenre = (genre) => {
    setSelectedGenre(genre);
    setEditingSubGenre(null);
    setSubGenreForm({ name: '' });
    loadSubGenres(genre.id);
  };

  // --- Category CRUD ---
  const handleSaveCat = async () => {
    setSavingCat(true);
    try {
      if (editingCat) {
        const updated = await put(`/api/admin/categories/${editingCat.id}/`, catForm);
        setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
        if (selectedCat?.id === updated.id) setSelectedCat(updated);
      } else {
        const created = await post('/api/admin/categories/', catForm);
        setCategories(prev => [...prev, created]);
      }
      setCatForm({ name: '' });
      setEditingCat(null);
    } finally {
      setSavingCat(false);
    }
  };

  const startEditCat = (cat) => { setEditingCat(cat); setCatForm({ name: cat.name }); };
  const cancelEditCat = () => { setEditingCat(null); setCatForm({ name: '' }); };

  const handleDeleteCat = async () => {
    await del(`/api/admin/categories/${deleteCat.id}/`);
    setCategories(prev => prev.filter(c => c.id !== deleteCat.id));
    if (selectedCat?.id === deleteCat.id) { setSelectedCat(null); setGenres([]); setSelectedGenre(null); setSubGenres([]); }
    setDeleteCat(null);
  };

  // --- Genre CRUD ---
  const handleSaveGenre = async () => {
    setSavingGenre(true);
    try {
      if (editingGenre) {
        const updated = await put(`/api/admin/genres/${editingGenre.id}/`, { name: genreForm.name, category: selectedCat.id });
        setGenres(prev => prev.map(g => g.id === updated.id ? updated : g));
        if (selectedGenre?.id === updated.id) setSelectedGenre(updated);
      } else {
        const created = await post('/api/admin/genres/', { name: genreForm.name, category: selectedCat.id });
        setGenres(prev => [...prev, created]);
        setCategories(prev => prev.map(c => c.id === selectedCat.id ? { ...c, genre_count: c.genre_count + 1 } : c));
      }
      setGenreForm({ name: '' });
      setEditingGenre(null);
    } finally {
      setSavingGenre(false);
    }
  };

  const startEditGenre = (g) => { setEditingGenre(g); setGenreForm({ name: g.name }); };
  const cancelEditGenre = () => { setEditingGenre(null); setGenreForm({ name: '' }); };

  const handleDeleteGenre = async () => {
    await del(`/api/admin/genres/${deleteGenre.id}/`);
    setGenres(prev => prev.filter(g => g.id !== deleteGenre.id));
    setCategories(prev => prev.map(c => c.id === selectedCat.id ? { ...c, genre_count: Math.max(0, c.genre_count - 1) } : c));
    if (selectedGenre?.id === deleteGenre.id) { setSelectedGenre(null); setSubGenres([]); }
    setDeleteGenre(null);
  };

  // --- Sub-genre CRUD ---
  const handleSaveSubGenre = async () => {
    setSavingSubGenre(true);
    try {
      if (editingSubGenre) {
        const updated = await put(`/api/admin/sub-genres/${editingSubGenre.id}/`, { name: subGenreForm.name, genre: selectedGenre.id });
        setSubGenres(prev => prev.map(sg => sg.id === updated.id ? updated : sg));
      } else {
        const created = await post('/api/admin/sub-genres/', { name: subGenreForm.name, genre: selectedGenre.id });
        setSubGenres(prev => [...prev, created]);
        setGenres(prev => prev.map(g => g.id === selectedGenre.id ? { ...g, sub_genre_count: (g.sub_genre_count || 0) + 1 } : g));
        setSelectedGenre(prev => prev ? { ...prev, sub_genre_count: (prev.sub_genre_count || 0) + 1 } : prev);
      }
      setSubGenreForm({ name: '' });
      setEditingSubGenre(null);
    } finally {
      setSavingSubGenre(false);
    }
  };

  const startEditSubGenre = (sg) => { setEditingSubGenre(sg); setSubGenreForm({ name: sg.name }); };
  const cancelEditSubGenre = () => { setEditingSubGenre(null); setSubGenreForm({ name: '' }); };

  const handleDeleteSubGenre = async () => {
    await del(`/api/admin/sub-genres/${deleteSubGenre.id}/`);
    setSubGenres(prev => prev.filter(sg => sg.id !== deleteSubGenre.id));
    setGenres(prev => prev.map(g => g.id === selectedGenre.id ? { ...g, sub_genre_count: Math.max(0, (g.sub_genre_count || 1) - 1) } : g));
    setSelectedGenre(prev => prev ? { ...prev, sub_genre_count: Math.max(0, (prev.sub_genre_count || 1) - 1) } : prev);
    setDeleteSubGenre(null);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories, Genres & Sub-genres</h1>
          <p className="text-sm text-gray-500 mt-1">Three-level hierarchy: click a category to see its genres, click a genre to manage sub-genres</p>
        </div>
        <button onClick={fetchCategories} disabled={loadingCats} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30" title="Refresh">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Column 1: Categories ── */}
        <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col min-h-0 flex-1">
            <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7"/></svg>
              Categories
            </h2>
            <div className="flex gap-2 mb-4">
              <input
                value={catForm.name}
                onChange={e => setCatForm({ name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && catForm.name && handleSaveCat()}
                placeholder={editingCat ? `Rename "${editingCat.name}"` : 'New category…'}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F46B03]"
              />
              {editingCat && (
                <button onClick={cancelEditCat} className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">✕</button>
              )}
              <button
                onClick={handleSaveCat}
                disabled={!catForm.name || savingCat}
                className="px-4 py-2 bg-[#F46B03] text-white text-sm font-semibold rounded-xl hover:bg-[#C15300] disabled:opacity-40 transition-colors"
              >
                {savingCat ? '…' : editingCat ? 'Save' : 'Add'}
              </button>
            </div>

            {loadingCats ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">No categories yet</p>
            ) : (
              <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0">
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => selectCategory(cat)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${selectedCat?.id === cat.id ? 'bg-[#F46B03]/10 border border-[#F46B03]/30' : 'hover:bg-gray-50 border border-transparent'}`}
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{cat.name}</p>
                      <p className="text-xs text-gray-400">{cat.genre_count} genres · {cat.product_count} products</p>
                    </div>
                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                      <button onClick={() => startEditCat(cat)} className="p-1.5 text-gray-400 hover:text-[#F46B03] rounded-lg hover:bg-orange-50 transition-colors" title="Rename"><EditIcon /></button>
                      <button onClick={() => setDeleteCat(cat)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Delete"><TrashIcon /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Column 2: Genres ── */}
        <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col min-h-0 flex-1">
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>
              Genres
              {selectedCat && <span className="text-sm font-normal normal-case text-[#F46B03]">— {selectedCat.name}</span>}
            </h2>
            {!selectedCat ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm gap-3">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="opacity-30"><path d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"/></svg>
                Select a category
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4 mt-4">
                  <input
                    value={genreForm.name}
                    onChange={e => setGenreForm(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && genreForm.name && handleSaveGenre()}
                    placeholder={editingGenre ? `Rename "${editingGenre.name}"` : 'New genre…'}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F46B03]"
                  />
                  {editingGenre && (
                    <button onClick={cancelEditGenre} className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">✕</button>
                  )}
                  <button
                    onClick={handleSaveGenre}
                    disabled={!genreForm.name || savingGenre}
                    className="px-4 py-2 bg-[#F46B03] text-white text-sm font-semibold rounded-xl hover:bg-[#C15300] disabled:opacity-40 transition-colors"
                  >
                    {savingGenre ? '…' : editingGenre ? 'Save' : 'Add'}
                  </button>
                </div>

                {loadingGenres ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : genres.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No genres yet</p>
                ) : (
                  <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0">
                    {genres.map(genre => (
                      <div
                        key={genre.id}
                        onClick={() => selectGenre(genre)}
                        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${selectedGenre?.id === genre.id ? 'bg-[#F46B03]/10 border border-[#F46B03]/30' : 'hover:bg-gray-50 border border-transparent'}`}
                      >
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{genre.name}</p>
                          <p className="text-xs text-gray-400">{genre.sub_genre_count ?? 0} sub-genres · {genre.product_count} products</p>
                        </div>
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button onClick={() => startEditGenre(genre)} className="p-1.5 text-gray-400 hover:text-[#F46B03] rounded-lg hover:bg-orange-50 transition-colors" title="Rename"><EditIcon /></button>
                          <button onClick={() => setDeleteGenre(genre)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Delete"><TrashIcon /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Column 3: Sub-genres ── */}
        <div className="flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col min-h-0 flex-1">
            <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2 text-sm uppercase tracking-wide">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32 2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12m11.32-11.32 2.12-2.12"/></svg>
              Sub-genres
              {selectedGenre && <span className="text-sm font-normal normal-case text-[#F46B03]">— {selectedGenre.name}</span>}
            </h2>
            {!selectedGenre ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-sm gap-3">
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="opacity-30"><circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M4.22 4.22l2.12 2.12m11.32 11.32 2.12 2.12M2 12h3m14 0h3M4.22 19.78l2.12-2.12m11.32-11.32 2.12-2.12"/></svg>
                Select a genre
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-4 mt-4">
                  <input
                    value={subGenreForm.name}
                    onChange={e => setSubGenreForm(prev => ({ ...prev, name: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && subGenreForm.name && handleSaveSubGenre()}
                    placeholder={editingSubGenre ? `Rename "${editingSubGenre.name}"` : 'New sub-genre…'}
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#F46B03]"
                  />
                  {editingSubGenre && (
                    <button onClick={cancelEditSubGenre} className="px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50">✕</button>
                  )}
                  <button
                    onClick={handleSaveSubGenre}
                    disabled={!subGenreForm.name || savingSubGenre}
                    className="px-4 py-2 bg-[#F46B03] text-white text-sm font-semibold rounded-xl hover:bg-[#C15300] disabled:opacity-40 transition-colors"
                  >
                    {savingSubGenre ? '…' : editingSubGenre ? 'Save' : 'Add'}
                  </button>
                </div>

                {loadingSubGenres ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : subGenres.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No sub-genres yet</p>
                ) : (
                  <div className="space-y-1.5 overflow-y-auto flex-1 min-h-0">
                    {subGenres.map(sg => (
                      <div key={sg.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent transition-colors">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{sg.name}</p>
                          <p className="text-xs text-gray-400">{sg.product_count} products</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEditSubGenre(sg)} className="p-1.5 text-gray-400 hover:text-[#F46B03] rounded-lg hover:bg-orange-50 transition-colors" title="Rename"><EditIcon /></button>
                          <button onClick={() => setDeleteSubGenre(sg)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Delete"><TrashIcon /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {deleteCat && (
        <ConfirmModal
          title="Delete Category?"
          message={`"${deleteCat.name}" and all its genres will be removed. Products in this category cannot be deleted if any remain.`}
          onConfirm={handleDeleteCat}
          onCancel={() => setDeleteCat(null)}
        />
      )}
      {deleteGenre && (
        <ConfirmModal
          title="Delete Genre?"
          message={`"${deleteGenre.name}" and all its sub-genres will be removed.${deleteGenre.product_count > 0 ? ` ${deleteGenre.product_count} products will have their genre cleared.` : ''}`}
          onConfirm={handleDeleteGenre}
          onCancel={() => setDeleteGenre(null)}
        />
      )}
      {deleteSubGenre && (
        <ConfirmModal
          title="Delete Sub-genre?"
          message={`"${deleteSubGenre.name}" will be removed.${deleteSubGenre.product_count > 0 ? ` ${deleteSubGenre.product_count} products will have their sub-genre cleared.` : ''}`}
          onConfirm={handleDeleteSubGenre}
          onCancel={() => setDeleteSubGenre(null)}
        />
      )}
    </div>
  );
}
