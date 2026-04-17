import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';

const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const ACTION_COLORS = {
  'order.': 'bg-blue-50 text-blue-700',
  'user.': 'bg-purple-50 text-purple-700',
  'staff.': 'bg-orange-50 text-orange-700',
  'product.': 'bg-green-50 text-green-700',
};

const actionColor = (action) => {
  for (const [prefix, cls] of Object.entries(ACTION_COLORS)) {
    if (action.startsWith(prefix)) return cls;
  }
  return 'bg-gray-100 text-gray-600';
};

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [actionFilter, setActionFilter] = useState('');
  const PAGE_SIZE = 30;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
      if (actionFilter) params.set('action', actionFilter);
      const res = await api.get(`/api/admin/audit-logs/?${params}`);
      const data = await res.json();
      setLogs(data.results || data);
      setTotalCount(data.count || (data.results || data).length);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-sm text-gray-500 mt-1">Every admin action recorded, newest first.</p>
        </div>
        <input
          placeholder="Filter by action…"
          value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F46B03] transition-colors w-52"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">No audit log entries found.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map(log => (
              <div key={log.id}>
                <button
                  onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors text-left"
                >
                  {/* Action badge */}
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide flex-shrink-0 ${actionColor(log.action)}`}>
                    {log.action}
                  </span>

                  {/* Object */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{log.object_repr}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      by <span className="font-medium text-gray-600">{log.admin?.name || 'System'}</span>
                      {log.ip_address && <span> · {log.ip_address}</span>}
                    </p>
                  </div>

                  {/* Time */}
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDate(log.created_at)}</span>

                  {/* Chevron */}
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    className={`text-gray-300 flex-shrink-0 transition-transform ${expanded === log.id ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {expanded === log.id && (
                  <div className="px-6 pb-4 bg-gray-50/40 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      {log.before && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Before</p>
                          <pre className="text-xs bg-white border border-gray-100 rounded-xl p-3 overflow-x-auto text-gray-700 font-mono">
                            {JSON.stringify(log.before, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.after && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">After</p>
                          <pre className="text-xs bg-white border border-gray-100 rounded-xl p-3 overflow-x-auto text-gray-700 font-mono">
                            {JSON.stringify(log.after, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">{totalCount} entries</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Previous
              </button>
              <span className="px-3 py-1.5 text-xs text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
