import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronDown, CheckCircle, XCircle, Trash2, Edit, X, Shield, ShieldAlert, Star } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../components/Toast';

const StarRating = ({ rating, size = 16 }) => {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={size} className={i < rating ? "fill-[#F46B03] text-[#F46B03]" : "text-gray-300"} />
      ))}
    </div>
  );
};

export default function ReviewsAdminPage() {
  const { showToast } = useToast();
  
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Pagination & Filter State
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending', 'approved'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [activeReview, setActiveReview] = useState(null);
  const [modalStatus, setModalStatus] = useState(false);
  const [modalNote, setModalNote] = useState('');
  const [modalSaving, setModalSaving] = useState(false);

    const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/admin/reviews/?ordering=-created_at&page=${page}&page_size=20`;
      if (statusFilter === 'pending') url += '&is_approved=false';
      if (statusFilter === 'approved') url += '&is_approved=true';
      
      const res = await api.get(url);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      
      const data = await res.json();
      if (data.results) {
        setReviews(data.results);
        setTotalPages(data.total_pages || Math.ceil(data.count / 20) || 1);
        setTotalItems(data.count || 0);
      } else {
        const arr = Array.isArray(data) ? data : [];
        setReviews(arr);
        setTotalPages(1);
        setTotalItems(arr.length);
      }
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, showToast]);

  useEffect(() => {
    fetchReviews();
    setSelectedIds(new Set());
  }, [fetchReviews]);

  // Bulk Approve
  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Approve ${selectedIds.size} reviews?`)) return;
    
    try {
      const parentIds = Array.from(selectedIds);
      const res = await api.post('/api/admin/reviews/bulk-approve/', { ids: parentIds });
      if (!res.ok) throw new Error('Bulk approval failed');
      
      showToast('success', `Approved ${parentIds.length} reviews`);
      fetchReviews();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Review Modal Handlers
  const handleOpenModal = (review) => {
    setActiveReview(review);
    setModalStatus(review.is_approved);
    setModalNote(review.moderation_note || '');
    setModalOpen(true);
  };
  
  const handleSaveModal = async () => {
    if (!activeReview) return;
    setModalSaving(true);
    try {
      const res = await api.patch(`/api/admin/reviews/${activeReview.id}/`, {
        is_approved: modalStatus,
        moderation_note: modalNote
      }, {
        headers: { 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error('Failed to save review moderation');
      
      showToast('success', 'Review moderation updated');
      setModalOpen(false);
      fetchReviews();
    } catch (err) {
      showToast('error', err.message);
    } finally {
      setModalSaving(false);
    }
  };

  // Delete Handler
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this review?')) return;
    try {
      const res = await api.delete(`/api/admin/reviews/${id}/`);
      if (!res.ok) throw new Error('Failed to delete review');
      showToast('success', 'Review deleted successfully');
      fetchReviews();
    } catch (err) {
      showToast('error', err.message);
    }
  };

  // Checkbox handlers
  const handleToggleAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(reviews.map(r => r.id)));
    } else {
      setSelectedIds(new Set());
    }
  };
  
  const handleToggleOne = (id) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-poppins text-gray-900">Review Moderation</h1>
          <p className="text-sm text-gray-500 mt-1">Approve and manage customer reviews</p>
        </div>
        <button onClick={fetchReviews} disabled={loading} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30 self-start sm:self-auto" title="Refresh">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>

      <div data-tour="reviews-list" className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="text-sm border-gray-200 rounded-lg px-3 py-2 bg-gray-50 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
            </select>
            
                        <button
              onClick={handleBulkApprove}
              disabled={selectedIds.size === 0}
              className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                selectedIds.size > 0 
                  ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle size={16} />
              Bulk Approve {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 w-10">
                  <input
                    type="checkbox"
                    className="rounded text-[#F46B03] focus:ring-[#F46B03]/30"
                    checked={reviews.length > 0 && selectedIds.size === reviews.length}
                    onChange={handleToggleAll}
                  />
                </th>
                <th className="px-6 py-4 text-xs tracking-wider uppercase">Product & Rating</th>
                <th className="px-6 py-4 text-xs tracking-wider uppercase">Reviewer</th>
                <th className="px-6 py-4 text-xs tracking-wider uppercase w-1/3">Comment</th>
                <th className="px-6 py-4 text-xs tracking-wider uppercase">Status</th>
                <th className="px-6 py-4 text-xs tracking-wider uppercase">Date</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-400">Loading reviews...</td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    No {statusFilter !== 'all' ? statusFilter : ''} reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((rev) => (
                  <tr key={rev.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(rev.id)}
                        onChange={() => handleToggleOne(rev.id)}
                        className="rounded text-[#F46B03] focus:ring-[#F46B03]/30"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 truncate max-w-[200px]" title={rev.product_title}>
                        {rev.product_title}
                      </div>
                      <div className="mt-1">
                        <StarRating rating={rev.rating} size={12} />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 font-medium">{rev.user_name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 truncate max-w-[250px] whitespace-normal line-clamp-2" title={rev.comment}>
                        {rev.comment}
                      </div>
                      {rev.moderation_note && (
                        <div className="text-xs text-red-500 mt-1 flex items-center gap-1 font-medium bg-red-50 px-2 py-0.5 rounded-full inline-flex">
                          <ShieldAlert size={10} /> Note added
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {rev.is_approved ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle size={14} /> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
                          <Shield size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleOpenModal(rev)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 border border-blue-200"
                        >
                          <Edit size={14} /> Moderate
                        </button>
                        <button
                          onClick={() => handleDelete(rev.id)}
                          className="px-3 py-1.5 bg-gray-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors flex items-center justify-center gap-1 border border-gray-200 border-dashed"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm">
          <span className="text-sm text-gray-500">
            Showing page <span className="font-medium text-gray-900">{page}</span> of <span className="font-medium text-gray-900">{totalPages}</span> ({totalItems} total reviews)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Moderation Modal  */}
      {modalOpen && activeReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <Shield className="text-[#F46B03]" size={20} />
                Moderate Review
              </h2>
              <button 
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-5 space-y-5">
              {/* Context */}
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-sm">
                <div className="mb-3 border-b border-gray-200 pb-3">
                  <span className="text-gray-500 font-medium">Product:</span>
                  <span className="ml-2 font-bold text-gray-900">{activeReview.product_title}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                      {activeReview.user_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="font-semibold text-gray-800">{activeReview.user_name}</span>
                  </div>
                  <StarRating rating={activeReview.rating} size={14} />
                </div>
                <p className="text-gray-700 leading-relaxed italic bg-white p-3 rounded-lg border border-gray-100">
                  "{activeReview.comment}"
                </p>
              </div>

              {/* Moderation Controls */}
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-12 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300 ease-in-out ${modalStatus ? 'bg-green-500' : ''}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${modalStatus ? 'translate-x-6' : ''}`} />
                  </div>
                  <input type="checkbox" className="hidden" checked={modalStatus} onChange={(e) => setModalStatus(e.target.checked)} />
                  <div>
                    <span className="font-semibold text-gray-800 text-sm">Approve Review</span>
                    <p className="text-xs text-gray-500">Toggling this will recalculate the product rating instantly.</p>
                  </div>
                </label>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                    <ShieldAlert size={14} className="text-gray-400" />
                    Internal Moderation Note (Optional)
                  </label>
                  <textarea
                    value={modalNote}
                    onChange={(e) => setModalNote(e.target.value)}
                    placeholder="E.g., Violates guidelines, spam..."
                    className="w-full text-sm border-gray-200 rounded-xl px-3 py-2 bg-white focus:ring-2 focus:ring-[#F46B03]/30 focus:border-[#F46B03] outline-none transition-all"
                    rows={3}
                  />
                  <p className="text-xs text-gray-400 mt-1.5">This note is only visible to admins.</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                disabled={modalSaving}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                disabled={modalSaving}
                className="px-5 py-2 text-sm font-semibold text-white bg-gray-900 rounded-xl hover:bg-black transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {modalSaving ? 'Saving...' : 'Save Decision'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
