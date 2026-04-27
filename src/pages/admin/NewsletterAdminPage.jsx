import React, { useEffect, useState, useCallback } from 'react';
import { Mail, Download, RefreshCw, Users, UserCheck, UserX, Search } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../components/admin/Pagination';

const PAGE_SIZE = 20;

export default function NewsletterAdminPage() {
  const { get } = useAdmin();
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
      if (activeOnly) params.set('active_only', 'true');
      if (search.trim()) params.set('search', search.trim());
      const data = await get(`/api/newsletter/admin/subscribers/?${params}`);
      setSubscribers(data.results || []);
      setTotal(data.count || 0);
      if (data.active_count !== undefined) setActiveCount(data.active_count);
      if (data.inactive_count !== undefined) setInactiveCount(data.inactive_count);
    } finally {
      setLoading(false);
    }
  }, [get, activeOnly, search, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };
  const handleActiveOnlyChange = (e) => { setActiveOnly(e.target.checked); setPage(1); };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const [exporting, setExporting] = useState(false);

  const downloadCSV = async () => {
    setExporting(true);
    try {
      let allSubs = [];
      let url = `/api/newsletter/admin/subscribers/?page_size=500`;
      if (activeOnly) url += '&active_only=true';
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      while (url) {
        const data = await get(url);
        allSubs = allSubs.concat(data.results || (Array.isArray(data) ? data : []));
        url = data.next ? data.next.replace(/^https?:\/\/[^/]+/, '') : null;
      }
      const rows = [['ID', 'Email', 'Subscribed At', 'Active', 'IP Address']];
      allSubs.forEach(s => rows.push([
        s.id,
        s.email,
        new Date(s.subscribed_at).toLocaleString(),
        s.is_active ? 'Yes' : 'No',
        s.ip_address || '',
      ]));
      const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(blobUrl);
    } finally {
      setExporting(false);
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-sm text-gray-500 mt-0.5">People who signed up for email updates</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            onClick={downloadCSV}
            disabled={total === 0 || exporting}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-[#F46B03] text-white rounded-xl hover:bg-[#C15300] transition-colors disabled:opacity-50"
          >
            <Download size={14} className={exporting ? 'animate-bounce' : ''} />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Users, label: 'Total', value: total, color: 'text-gray-900', bg: 'bg-gray-50' },
          { icon: UserCheck, label: 'Active', value: activeCount, color: 'text-green-700', bg: 'bg-green-50' },
          { icon: UserX, label: 'Unsubscribed', value: inactiveCount, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-4 flex items-center gap-3`}>
            <Icon size={20} className={color} />
            <div>
              <p className={`text-xl font-bold ${color}`}>{loading ? '…' : value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by email…"
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-[#F46B03] transition-colors"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={activeOnly}
            onChange={handleActiveOnlyChange}
            className="accent-[#F46B03] w-4 h-4 rounded"
          />
          Active only
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading…</div>
        ) : subscribers.length === 0 ? (
          <div className="py-16 text-center">
            <Mail size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-medium">No subscribers found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Subscribed</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {subscribers.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{(page - 1) * PAGE_SIZE + i + 1}</td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">{s.email}</td>
                      <td className="px-5 py-3.5 text-gray-500">{formatDate(s.subscribed_at)}</td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          s.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${s.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          {s.is_active ? 'Active' : 'Unsubscribed'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs font-mono">{s.ip_address || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={page} totalPages={totalPages} totalCount={total} pageSize={PAGE_SIZE} onPage={setPage} />
          </>
        )}
      </div>
    </div>
  );
}
