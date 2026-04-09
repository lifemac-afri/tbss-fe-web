import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../components/admin/Pagination';

const CATEGORIES = ['Book Reviews', 'Author Interviews', 'Reading Lists', 'Industry News'];
const statusColors = { published: 'bg-green-100 text-green-700', draft: 'bg-gray-100 text-gray-600' };

const emptyForm = { title: '', slug: '', category: 'Book Reviews', author: '', status: 'draft', date: new Date().toISOString().split('T')[0], readTime: '', excerpt: '', image: '', body: '' };

export default function BlogAdminPage() {
  const { get, post, put, del } = useAdmin();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 15;
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  const normalizePost = (p) => ({
    ...p,
    image: p.cover_image || p.image || '',
    body: p.content || p.body || '',
    readTime: p.read_time || p.readTime || '',
    date: p.published_at ? p.published_at.split('T')[0] : (p.created_at ? p.created_at.split('T')[0] : p.date || ''),
    author: p.author_name || p.author || '',
    excerpt: p.excerpt || '',
    category: p.category || 'Book Reviews',
    status: p.status || 'draft',
    views: p.views || p.view_count || 0,
  });

  const toDjangoPayload = (f) => ({
    title: f.title,
    slug: f.slug,
    content: f.body,
    excerpt: f.excerpt,
    cover_image: f.image,
    author: f.author,
    status: f.status,
    category: f.category,
    read_time: f.readTime,
    published_at: f.status === 'published' ? (f.date || new Date().toISOString().split('T')[0]) : null,
  });

  const fetchPosts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
    if (search) params.set('search', search);
    if (statusFilter !== 'All') params.set('status', statusFilter);
    get(`/api/admin/blog/?${params}`).then(data => {
      const list = Array.isArray(data) ? data : (data.results || []);
      const count = Array.isArray(data) ? list.length : (data.count || list.length);
      setPosts(list.map(normalizePost));
      setTotalCount(count);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [get, page, search, statusFilter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const openAdd = () => { setForm(emptyForm); setActiveTab('basic'); setModal('add'); };
  const openEdit = (p) => { setForm({ ...emptyForm, ...p }); setActiveTab('basic'); setModal(p); };
  const closeModal = () => { setModal(null); setSaving(false); };

  const handleSave = async () => {
    setSaving(true);
    const payload = toDjangoPayload(form);
    if (modal === 'add') {
      await post('/api/admin/blog/', payload);
      fetchPosts();
    } else {
      const updated = await put(`/api/admin/blog/${modal.id}/`, payload);
      if (statusFilter !== 'All' && updated.status !== statusFilter.toLowerCase()) {
        fetchPosts();
      } else {
        setPosts(prev => prev.map(p => p.id === updated.id ? normalizePost(updated) : p));
      }
    }
    setSaving(false);
    closeModal();
  };

  const handleDelete = async (id) => {
    await del(`/api/admin/blog/${id}/`);
    setPosts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
  };

  const f = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleStatusFilterChange = (s) => {
    setStatusFilter(s);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog / CMS</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount} posts</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-[#F46B03] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#C15300] transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Post
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Search by title or author…"
          value={search}
          onChange={handleSearchChange}
          className="flex-1 min-w-48 border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#F46B03]"
        />
        {['All', 'published', 'draft'].map(s => (
          <button
            key={s}
            onClick={() => handleStatusFilterChange(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${statusFilter === s ? 'bg-[#F46B03] text-white' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {s === 'All' ? 'All' : s === 'published' ? 'Published' : 'Drafts'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48"><div className="w-8 h-8 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Post</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Views</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="w-12 h-9 object-cover rounded-lg flex-shrink-0" onError={e => { e.target.style.display='none'; }} />
                        <div>
                          <p className="font-medium text-gray-900 max-w-64 truncate">{p.title}</p>
                          <p className="text-xs text-gray-400">by {p.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-xs text-gray-600">{p.category}</td>
                    <td className="px-3 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${statusColors[p.status] || 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
                    </td>
                    <td className="px-3 py-3.5 text-gray-600">{p.views?.toLocaleString() || 0}</td>
                    <td className="px-3 py-3.5 text-gray-500 text-xs">{p.date}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {p.status === 'draft' && (
                          <button
                            onClick={async () => {
                              const updated = await put(`/api/admin/blog/${p.id}/`, toDjangoPayload({ ...p, status: 'published', date: new Date().toISOString().split('T')[0] }));
                              setPosts(prev => prev.map(x => x.id === updated.id ? normalizePost(updated) : x));
                            }}
                            className="text-xs font-medium px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors"
                          >
                            Publish
                          </button>
                        )}
                        {p.status === 'published' && (
                          <button
                            onClick={async () => {
                              const updated = await put(`/api/admin/blog/${p.id}/`, toDjangoPayload({ ...p, status: 'draft' }));
                              setPosts(prev => prev.map(x => x.id === updated.id ? normalizePost(updated) : x));
                            }}
                            className="text-xs font-medium px-3 py-1.5 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            Unpublish
                          </button>
                        )}
                        <button onClick={() => openEdit(p)} className="text-gray-400 hover:text-[#F46B03] transition-colors p-1">
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button onClick={() => setDeleteConfirm(p)} className="text-gray-400 hover:text-red-500 transition-colors p-1">
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-12 text-gray-400 text-sm">No posts found</td></tr>
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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="font-bold text-gray-900 text-lg">{modal === 'add' ? 'New Post' : 'Edit Post'}</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-6">
              {['basic', 'content'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${activeTab === tab ? 'border-[#F46B03] text-[#F46B03]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {tab === 'basic' ? 'Details' : 'Content'}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === 'basic' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Title *</label>
                    <input value={form.title} onChange={f('title')} placeholder="Post title" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Slug</label>
                    <input value={form.slug} onChange={f('slug')} placeholder="url-slug (auto-generated if blank)" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Author</label>
                    <input value={form.author} onChange={f('author')} placeholder="Author name" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Category</label>
                    <select value={form.category} onChange={f('category')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]">
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Status</label>
                    <select value={form.status} onChange={f('status')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Publish Date</label>
                    <input type="date" value={form.date} onChange={f('date')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Read Time</label>
                    <input value={form.readTime} onChange={f('readTime')} placeholder="5 min read" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Cover Image URL</label>
                    <input value={form.image} onChange={f('image')} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Excerpt</label>
                    <textarea value={form.excerpt} onChange={f('excerpt')} rows={2} placeholder="Short preview shown in blog listings…" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03] resize-none" />
                  </div>
                </div>
              )}
              {activeTab === 'content' && (
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Body (HTML supported)</label>
                  <textarea
                    value={form.body}
                    onChange={f('body')}
                    rows={18}
                    placeholder="<p>Write your article content here. HTML tags are supported for rich formatting.</p>"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono outline-none focus:border-[#F46B03] resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-2">HTML is rendered on the blog article page. Use &lt;h2&gt;, &lt;p&gt;, &lt;em&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;li&gt; tags.</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white rounded-b-2xl">
              <button onClick={closeModal} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.title} className="flex-1 bg-[#F46B03] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#C15300] transition-colors disabled:opacity-50">
                {saving ? 'Saving…' : modal === 'add' ? 'Create Post' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-2">Delete Post?</h3>
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
