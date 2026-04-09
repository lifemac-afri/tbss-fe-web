import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';

const statusColors = {
  active: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
  suspended: 'bg-red-100 text-red-600',
};

function normalizeClub(c) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    status: c.status || (c.is_active ? 'active' : 'suspended'),
    featured: c.featured,
    currentBook: c.current_book || '',
    members: c.member_count ?? 0,
    membersActual: c.member_count_actual ?? 0,
    nextMeeting: c.next_meeting || '',
    meetingLink: c.meeting_link || '',
    heroImage: c.image || '',
    createdAt: c.created_at,
  };
}

function denormalizeClub(form) {
  return {
    name: form.name,
    description: form.description,
    status: form.status,
    featured: form.featured,
    current_book: form.currentBook,
    member_count: Number(form.members) || 0,
    next_meeting: form.nextMeeting || null,
    meeting_link: form.meetingLink,
    image: form.heroImage,
    is_active: form.status === 'active',
  };
}

const emptyForm = {
  name: '', description: '', status: 'active', featured: false,
  currentBook: '', members: '', nextMeeting: '', meetingLink: '', heroImage: '',
};

export default function BookClubsAdminPage() {
  const { get, post, put, del } = useAdmin();
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filter, setFilter] = useState('All');
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      try {
        let results = [];
        let url = '/api/admin/book-clubs/?page_size=100';
        while (url) {
          const data = await get(url);
          if (Array.isArray(data)) {
            results = results.concat(data);
            url = null;
          } else {
            results = results.concat(data.results || []);
            url = data.next ? data.next.replace(/^https?:\/\/[^/]+/, '') : null;
          }
        }
        setClubs(results.map(normalizeClub));
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, []);

  const openEdit = (c) => { setShowAdd(false); setSelected(c); setForm({ ...c }); };
  const openAdd = () => { setSelected(null); setForm({ ...emptyForm }); setShowAdd(true); };
  const closePanel = () => { setSelected(null); setShowAdd(false); setForm({}); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (showAdd) {
        const created = await post('/api/admin/book-clubs/', denormalizeClub(form));
        setClubs(prev => [normalizeClub(created), ...prev]);
      } else {
        const updated = await put(`/api/admin/book-clubs/${selected.id}/`, denormalizeClub(form));
        setClubs(prev => prev.map(c => c.id === updated.id ? normalizeClub(updated) : c));
        setSelected(normalizeClub(updated));
      }
      closePanel();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    await del(`/api/admin/book-clubs/${id}/`);
    setClubs(prev => prev.filter(c => c.id !== id));
    setDeleteConfirm(null);
    closePanel();
  };

  const handleQuickStatus = async (club, newStatus) => {
    const updated = await put(`/api/admin/book-clubs/${club.id}/`, denormalizeClub({ ...club, status: newStatus }));
    const norm = normalizeClub(updated);
    setClubs(prev => prev.map(c => c.id === norm.id ? norm : c));
    if (selected?.id === club.id) { setSelected(norm); setForm(norm); }
  };

  const handleToggleFeatured = async (club) => {
    const updated = await put(`/api/admin/book-clubs/${club.id}/`, denormalizeClub({ ...club, featured: !club.featured }));
    const norm = normalizeClub(updated);
    setClubs(prev => prev.map(c => c.id === norm.id ? norm : c));
    if (selected?.id === club.id) { setSelected(norm); setForm(norm); }
  };

  const f = (key) => (e) =>
    setForm(prev => ({ ...prev, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const filtered = clubs.filter(c => filter === 'All' || c.status === filter);

  const panelOpen = showAdd || selected !== null;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Clubs</h1>
          <p className="text-sm text-gray-500 mt-1">
            {clubs.length} clubs · {clubs.filter(c => c.status === 'pending').length} pending approval
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#F46B03] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#C15300] transition-colors"
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Club
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-4">
        {[
          ['All', clubs.length],
          ['active', clubs.filter(c => c.status === 'active').length],
          ['pending', clubs.filter(c => c.status === 'pending').length],
          ['suspended', clubs.filter(c => c.status === 'suspended').length],
        ].map(([label, count]) => (
          <button
            key={label}
            onClick={() => setFilter(label)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors capitalize ${filter === label ? 'bg-[#F46B03] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {label === 'All' ? 'All' : label.charAt(0).toUpperCase() + label.slice(1)}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === label ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* Scrollable club list */}
        <div className="lg:col-span-1 h-[calc(100vh-220px)] overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="flex items-center justify-center h-40 bg-white rounded-2xl border border-gray-100">
              <div className="w-7 h-7 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">No clubs found</div>
          ) : filtered.map(club => (
            <button
              key={club.id}
              onClick={() => openEdit(club)}
              className={`w-full text-left bg-white rounded-2xl border p-4 transition-all ${selected?.id === club.id ? 'border-[#F46B03] ring-1 ring-[#F46B03]/30' : 'border-gray-100 hover:border-gray-200'}`}
            >
              {club.heroImage && (
                <img src={club.heroImage} alt="" className="w-full h-24 object-cover rounded-xl mb-3" onError={e => e.target.style.display = 'none'} />
              )}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-semibold text-gray-900 text-sm">{club.name}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 capitalize ${statusColors[club.status] || 'bg-gray-100 text-gray-500'}`}>{club.status}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                  {club.membersActual || club.members} members
                </span>
                {club.featured && <span className="text-orange-600 font-medium">★ Featured</span>}
              </div>
              {club.currentBook && <p className="text-xs text-gray-400 mt-1.5 truncate">Reading: {club.currentBook}</p>}
              {club.nextMeeting && <p className="text-xs text-gray-400 mt-0.5">Next: {new Date(club.nextMeeting).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
            </button>
          ))}
        </div>

        {/* Sticky detail / edit panel */}
        <div className="lg:col-span-2 sticky top-0 h-screen overflow-y-auto">
          {!panelOpen ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center h-80 text-gray-400 text-sm gap-3">
              <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="opacity-30"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Select a book club to manage, or add a new one
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              {/* Header with quick actions */}
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">{showAdd ? 'New Book Club' : form.name}</h2>
                {!showAdd && (
                  <div className="flex gap-2 flex-wrap">
                    {form.status === 'pending' && (
                      <button onClick={() => handleQuickStatus(selected, 'active')} className="text-xs font-medium px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors">Approve</button>
                    )}
                    {form.status === 'active' && (
                      <button onClick={() => handleQuickStatus(selected, 'suspended')} className="text-xs font-medium px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Suspend</button>
                    )}
                    {form.status === 'suspended' && (
                      <button onClick={() => handleQuickStatus(selected, 'active')} className="text-xs font-medium px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors">Reinstate</button>
                    )}
                    <button
                      onClick={() => handleToggleFeatured(selected)}
                      className={`text-xs font-medium px-3 py-1.5 rounded-xl transition-colors ${form.featured ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {form.featured ? '★ Featured' : '☆ Feature'}
                    </button>
                    <button onClick={() => setDeleteConfirm(selected)} className="text-xs font-medium px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors">Delete</button>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Club Name *</label>
                  <input value={form.name || ''} onChange={f('name')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Status</label>
                  <select value={form.status || 'active'} onChange={f('status')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Current Book</label>
                  <input value={form.currentBook || ''} onChange={f('currentBook')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Next Meeting Date</label>
                  <input type="date" value={form.nextMeeting || ''} onChange={f('nextMeeting')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Member Count</label>
                  <input type="number" value={form.members || ''} onChange={f('members')} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Zoom / Meeting Link</label>
                  <input value={form.meetingLink || ''} onChange={f('meetingLink')} placeholder="https://zoom.us/j/..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Hero Image URL</label>
                  <input value={form.heroImage || ''} onChange={f('heroImage')} placeholder="https://..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03]" />
                  {form.heroImage && (
                    <img src={form.heroImage} alt="" className="mt-2 h-24 w-full object-cover rounded-xl" onError={e => e.target.style.display = 'none'} />
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Description</label>
                  <textarea value={form.description || ''} onChange={f('description')} rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03] resize-none" />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="featured-cb" checked={form.featured || false} onChange={f('featured')} className="w-4 h-4 accent-[#F46B03]" />
                  <label htmlFor="featured-cb" className="text-sm text-gray-700 font-medium">Featured club (shown prominently)</label>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button onClick={closePanel} className="px-6 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name}
                  className="flex-1 bg-[#F46B03] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#C15300] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving…' : showAdd ? 'Create Club' : 'Save Changes'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-2">Delete Book Club?</h3>
            <p className="text-center text-sm text-gray-500 mb-6">"{deleteConfirm.name}" will be permanently removed.</p>
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
