import { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../components/admin/Pagination';

const roleColors = { admin: 'bg-orange-100 text-orange-700', customer: 'bg-blue-100 text-blue-700' };
const statusColors = { active: 'bg-green-100 text-green-700', suspended: 'bg-red-100 text-red-600', pending: 'bg-gray-100 text-gray-600' };

export default function UsersAdminPage() {
  const { get, put, del } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const PAGE_SIZE = 20;

  const normalizeUser = (u) => ({
    ...u,
    name: [u.first_name, u.last_name].filter(Boolean).join(' ') || u.username || u.name || 'Unknown',
    email: u.email || '',
    role: u.is_staff ? 'admin' : 'customer',
    status: u.is_active !== false ? 'active' : 'suspended',
    isVerified: u.is_email_verified ?? u.isVerified ?? u.is_active ?? false,
    createdAt: u.date_joined || u.created_at || u.createdAt,
  });

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, page_size: PAGE_SIZE, is_staff: 'false' });
    if (search) params.set('search', search);
    get(`/api/admin/users/?${params}`).then(data => {
      const list = Array.isArray(data) ? data : (data.results || []);
      const count = Array.isArray(data) ? list.length : (data.count || list.length);
      setUsers(list.map(normalizeUser));
      setTotalCount(count);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [get, page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdate = async (userId, patch) => {
    setUpdating(userId);
    const djangoPatch = {};
    if (patch.status !== undefined) djangoPatch.is_active = patch.status === 'active';
    const updated = await put(`/api/admin/users/${userId}/`, djangoPatch);
    setUsers(prev => prev.map(u => u.id === updated.id ? normalizeUser(updated) : u));
    setUpdating(null);
  };

  const handleDelete = async (userId) => {
    setUpdating(userId);
    try {
      await del(`/api/admin/users/${userId}/`);
      fetchUsers(); // Re-fetch to update the list since deletion is soft-delete/anonymization
    } finally {
      setDeleteConfirm(null);
      setUpdating(null);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount} registered customers</p>
        </div>
        <button onClick={fetchUsers} disabled={loading} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30" title="Refresh">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <input
          placeholder="Search by name or email…"
          value={search}
          onChange={handleSearchChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#F46B03] transition-colors"
        />
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
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">User</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Role</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Verified</th>
                  <th className="px-3 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Joined</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F46B03]/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-[#F46B03]">{initials(user.name)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}>{user.role}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[user.status] || 'bg-gray-100 text-gray-600'}`}>{user.status}</span>
                    </td>
                    <td className="px-3 py-3.5">
                      {user.isVerified ? (
                        <span className="text-green-500">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                        </span>
                      ) : (
                        <span className="text-gray-300">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-gray-500 text-xs">{formatDate(user.createdAt)}</td>
                    <td className="px-5 py-3.5 text-right">
                      {user.role !== 'admin' && (
                        <div className="flex items-center justify-end gap-2">
                          {user.status === 'suspended' ? (
                            <button
                              onClick={() => handleUpdate(user.id, { status: 'active' })}
                              disabled={updating === user.id}
                              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                            >
                              Reinstate
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUpdate(user.id, { status: 'suspended' })}
                              disabled={updating === user.id}
                              className="text-xs font-medium px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors disabled:opacity-50"
                            >
                              Suspend
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteConfirm(user)}
                            disabled={updating === user.id}
                            className="text-xs font-medium px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                            title="Delete user"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                      {user.role === 'admin' && <span className="text-xs text-gray-300 italic">Protected</span>}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan="6" className="text-center py-12 text-gray-400 text-sm">No users found</td></tr>
                )}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} onPage={setPage} />
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="22" height="22" fill="none" stroke="#EF4444" strokeWidth="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" /></svg>
            </div>
            <h3 className="text-center font-bold text-gray-900 mb-2">Delete Account?</h3>
            <p className="text-center text-sm text-gray-500 mb-6">
              This will anonymize <strong>{deleteConfirm.name}</strong>'s data and deactivate the account. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                disabled={updating === deleteConfirm.id}
                className="flex-1 bg-red-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {updating === deleteConfirm.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
