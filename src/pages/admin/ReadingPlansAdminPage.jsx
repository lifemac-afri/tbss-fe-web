import React, { useCallback, useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../components/admin/Pagination';

const STATUS_LABELS = { pending: 'Pending', processing: 'Processing', ready: 'Ready', rejected: 'Rejected' };
const statusColors = {
  pending:    'bg-amber-100 text-amber-700',
  processing: 'bg-blue-100 text-blue-700',
  ready:      'bg-green-100 text-green-700',
  rejected:   'bg-red-100 text-red-700',
};

const PAGE_SIZE = 20;

export default function ReadingPlansAdminPage() {
  const { get, patch } = useAdmin();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const normalizeRequest = (r) => ({
    ...r,
    userName: r.user_name || r.user?.username || r.userName || 'Unknown',
    userEmail: r.user_email || r.user?.email || r.userEmail || '',
    goal: r.additional_notes || r.goal || '',
    genres: r.genre_preference ? r.genre_preference.split(',').map(g => g.trim()) : (r.genres || []),
    adminResponse: r.admin_response || r.adminResponse || '',
    submittedAt: r.created_at || r.submittedAt,
  });

  const fetchRequests = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
    if (filter !== 'All') params.set('status', filter);
    get(`/api/admin/reading-plans/?${params}`).then(data => {
      const list = Array.isArray(data) ? data : (data.results || []);
      const count = Array.isArray(data) ? list.length : (data.count || list.length);
      setRequests(list.map(normalizeRequest));
      setTotalCount(count);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [get, page, filter]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
    setSelected(null);
  };

  const openRequest = (r) => { setSelected(r); setNotes(r.adminResponse || ''); };

  const handleRespond = async () => {
    setSaving(true);
    try {
      const updated = await patch(`/api/admin/reading-plans/${selected.id}/`, { status: 'ready', admin_response: notes });
      const norm = normalizeRequest(updated);
      setRequests(prev => prev.map(r => r.id === norm.id ? norm : r));
      setSelected(norm);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkPending = async () => {
    setSaving(true);
    try {
      const updated = await patch(`/api/admin/reading-plans/${selected.id}/`, { status: 'pending' });
      const norm = normalizeRequest(updated);
      setRequests(prev => prev.map(r => r.id === norm.id ? norm : r));
      setSelected(norm);
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reading Plan Requests</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount} {filter === 'All' ? 'total' : STATUS_LABELS[filter]?.toLowerCase() || filter} requests</p>
        </div>
        <button onClick={fetchRequests} disabled={loading} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30" title="Refresh">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {['All', 'pending', 'ready'].map(key => (
          <button
            key={key}
            onClick={() => handleFilterChange(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${filter === key ? 'bg-[#F46B03] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {key === 'All' ? 'All' : STATUS_LABELS[key]}
            {filter === key && (
              <span className="text-xs px-1.5 py-0.5 rounded-full bg-white/20 text-white">{totalCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 items-start">
        {/* Scrollable list column */}
        <div className="lg:col-span-1 flex flex-col gap-0">
          <div className="space-y-3">
            {loading && (
              <div className="flex items-center justify-center h-40 bg-white rounded-2xl border border-gray-100">
                <div className="w-7 h-7 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!loading && requests.map(r => (
              <button
                key={r.id}
                onClick={() => openRequest(r)}
                className={`w-full text-left bg-white rounded-2xl border p-4 transition-all ${selected?.id === r.id ? 'border-[#F46B03] ring-1 ring-[#F46B03]/30' : 'border-gray-100 hover:border-gray-200'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-gray-900 text-sm">{r.userName}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[r.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[r.status] || r.status}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{r.userEmail}</p>
                <p className="text-xs text-gray-600 line-clamp-2">{r.goal}</p>
                <p className="text-xs text-gray-400 mt-2">{formatDate(r.submittedAt)}</p>
              </button>
            ))}
            {!loading && requests.length === 0 && (
              <div className="text-center py-12 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">No requests found</div>
            )}
          </div>
          {totalPages > 1 && (
            <div className="mt-3 bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <Pagination page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} onPage={(p) => { setPage(p); setSelected(null); }} />
            </div>
          )}
        </div>

        {/* Sticky detail panel */}
        <div className="lg:col-span-2 sticky top-0 h-screen overflow-y-auto">
          {!selected ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex items-center justify-center h-80 text-gray-400 text-sm">
              Select a request to view details
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 text-lg">{selected.userName}</h2>
                  <p className="text-sm text-gray-400">{selected.userEmail} · {formatDate(selected.submittedAt)}</p>
                </div>
                <span className={`text-sm font-medium px-3 py-1.5 rounded-xl ${statusColors[selected.status] || 'bg-gray-100 text-gray-600'}`}>{STATUS_LABELS[selected.status] || selected.status}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Reading Goal</p>
                  <p className="text-sm text-gray-700">{selected.goal}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Genres</p>
                  <div className="flex flex-wrap gap-1">
                    {selected.genres?.map(g => (
                      <span key={g} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{g}</span>
                    ))}
                  </div>
                </div>
                {selected.frequency && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Frequency</p>
                    <p className="text-sm text-gray-700">{selected.frequency}</p>
                  </div>
                )}
                {selected.time && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Reading Time / Day</p>
                    <p className="text-sm text-gray-700">{selected.time}</p>
                  </div>
                )}
                {selected.budget && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Budget</p>
                    <p className="text-sm text-gray-700">{selected.budget}</p>
                  </div>
                )}
                {selected.notes && (
                  <div className="bg-gray-50 rounded-xl p-4 sm:col-span-2">
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Additional Notes</p>
                    <p className="text-sm text-gray-700">{selected.notes}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Response / Recommended Plan</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={5}
                  placeholder="Enter the personalised reading plan, book recommendations, notes for the customer, etc."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F46B03] resize-none"
                />
              </div>

              <div className="flex gap-3">
                {selected.status === 'pending' ? (
                  <button
                    onClick={handleRespond}
                    disabled={saving}
                    className="flex-1 bg-[#F46B03] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#C15300] transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Mark as Responded'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={async () => { setSaving(true); try { const u = normalizeRequest(await patch(`/api/admin/reading-plans/${selected.id}/`, { admin_response: notes })); setRequests(prev => prev.map(r => r.id === u.id ? u : r)); setSelected(u); } finally { setSaving(false); } }}
                      disabled={saving}
                      className="flex-1 bg-[#F46B03] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#C15300] transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Update Response'}
                    </button>
                    <button
                      onClick={handleMarkPending}
                      className="px-4 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Reopen
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
