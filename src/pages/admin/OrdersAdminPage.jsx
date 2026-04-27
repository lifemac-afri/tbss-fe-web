import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../components/admin/Pagination';

const DJANGO_STATUSES = ['pending', 'paid', 'processing', 'shipped', 'ready_for_pickup', 'delivered', 'cancelled', 'failed'];
const statusColors = {
  pending: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-amber-100 text-amber-700',
  ready_for_pickup: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
  failed: 'bg-gray-100 text-gray-600',
};

const statusLabel = {
  pending: 'Pending',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  ready_for_pickup: 'Ready for Pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed: 'Failed',
};

export default function OrdersAdminPage() {
  const { get, patch } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusCounts, setStatusCounts] = useState({});
  const PAGE_SIZE = 20;
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkExtra, setBulkExtra] = useState('');
  const [submittingIds, setSubmittingIds] = useState(new Set());

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
    if (search) params.set('search', search);
    if (statusFilter !== 'All') params.set('status', statusFilter);
    get(`/api/cart/admin/orders/?${params}`)
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        const count = Array.isArray(data) ? list.length : (data.count || list.length);
        setOrders(list);
        setTotalCount(count);
        if (data.status_counts) setStatusCounts(data.status_counts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [get, page, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    let extra = {};
    if (newStatus === 'cancelled') {
      const reason = window.prompt('Enter cancellation reason:');
      if (!reason) return;
      extra.cancellation_reason = reason;
    } else if (newStatus === 'shipped') {
      const url = window.prompt('Enter tracking URL (optional):');
      if (url) extra.tracking_url = url;
    }

    setSubmittingIds(prev => new Set(prev).add(orderId));
    setUpdating(orderId);
    try {
      const result = await patch(`/api/cart/admin/orders/${orderId}/status/`, { 
        status: newStatus,
        ...extra
      });
      if (statusFilter !== 'All') {
        fetchOrders();
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { 
          ...o, 
          status: result.new_status || newStatus,
          tracking_url: extra.tracking_url || o.tracking_url,
          cancellation_reason: extra.cancellation_reason || o.cancellation_reason
        } : o));
      }
    } catch (err) {
      console.error("Status update failed", err);
    }
    setUpdating(null);
    setSubmittingIds(prev => {
        const next = new Set(prev);
        next.delete(orderId);
        return next;
    });
  };

  const handleBulkStatusChange = async () => {
    if (!bulkStatus || selectedIds.length === 0) return;
    
    const extra = {};
    if (bulkStatus === 'cancelled') {
        if (!bulkExtra) { alert('Cancellation reason is required'); return; }
        extra.cancellation_reason = bulkExtra;
    } else if (bulkStatus === 'shipped') {
        extra.tracking_url = bulkExtra;
    }

    setLoading(true);
    try {
      await patch(`/api/cart/admin/orders/bulk-status/`, {
        order_ids: selectedIds,
        status: bulkStatus,
        ...extra
      });
      fetchOrders();
      setSelectedIds([]);
      setBulkStatus('');
      setBulkExtra('');
    } catch (err) {
      console.error("Bulk update failed", err);
      setLoading(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === orders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(orders.map(o => o.id));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const getCustomerName = (order) => {
    if (order.user_name) return order.user_name;
    if (order.user__username) return order.user__username;
    if (order.user?.username) return order.user.username;
    return 'Customer';
  };

  const getCustomerEmail = (order) => {
    if (order.user_email) return order.user_email;
    if (order.user__email) return order.user__email;
    if (order.user?.email) return order.user.email;
    return '';
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount} total orders</p>
        </div>
        <button onClick={fetchOrders} disabled={loading} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30" title="Refresh">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <button
          onClick={() => handleFilterChange('All')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
            statusFilter === 'All' ? 'bg-[#F46B03] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          All <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === 'All' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{totalCount}</span>
        </button>
        {DJANGO_STATUSES.filter(s => statusCounts[s] > 0).map(s => (
          <button
            key={s}
            onClick={() => handleFilterChange(s)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === s ? 'bg-[#F46B03] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {statusLabel[s]} <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === s ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>{statusCounts[s]}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <input
          placeholder="Search by order ID, customer name or email…"
          value={search}
          onChange={handleSearchChange}
          className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-[#F46B03] transition-colors"
        />
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-gray-900 text-white rounded-2xl p-4 mb-4 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">{selectedIds.length} orders selected</span>
            <button 
              onClick={() => setSelectedIds([])}
              className="text-xs text-gray-400 hover:text-white underline"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={bulkStatus}
              onChange={e => { setBulkStatus(e.target.value); setBulkExtra(''); }}
              className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus:border-[#F46B03] transition-colors"
            >
              <option value="">Update Status...</option>
              {DJANGO_STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
            </select>
            {(bulkStatus === 'cancelled' || bulkStatus === 'shipped') && (
              <input 
                placeholder={bulkStatus === 'cancelled' ? 'Reason for cancelling...' : 'Tracking URL...'}
                value={bulkExtra}
                onChange={e => setBulkExtra(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus:border-[#F46B03] transition-colors min-w-[180px]"
              />
            )}
            <button
              onClick={handleBulkStatusChange}
              disabled={!bulkStatus || loading}
              className="bg-[#F46B03] hover:bg-[#e06202] disabled:opacity-50 text-white px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            >
              Apply to Selected
            </button>
          </div>
        </div>
      )}

      {/* Table Header with Select All */}
      <div className="bg-white rounded-t-2xl border-x border-t border-gray-100 px-5 py-3 flex items-center gap-4">
        <input 
          type="checkbox"
          checked={orders.length > 0 && selectedIds.length === orders.length}
          onChange={toggleSelectAll}
          className="w-4 h-4 rounded border-gray-300 text-[#F46B03] focus:ring-[#F46B03]"
        />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select All Orders on Page</span>
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {loading && (
          <div className="flex items-center justify-center h-48 bg-white rounded-2xl border border-gray-100">
            <div className="w-8 h-8 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!loading && orders.map(order => (
          <div key={order.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {/* Order header */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/60 transition-colors"
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
            >
              <div className="flex items-center gap-4">
                <input 
                  type="checkbox"
                  checked={selectedIds.includes(order.id)}
                  onChange={() => toggleSelectOne(order.id)}
                  onClick={e => e.stopPropagation()}
                  className="w-4 h-4 rounded border-gray-300 text-[#F46B03] focus:ring-[#F46B03]"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm font-mono">#{String(order.id).slice(0, 8).toUpperCase()}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {statusLabel[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{getCustomerName(order)} · {getCustomerEmail(order)}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-gray-900">₵{parseFloat(order.total_amount || 0).toFixed(2)}</p>
                  <p className="text-xs text-gray-400">{formatDate(order.created_at)}</p>
                </div>
                {/* Status dropdown */}
                <select
                  value={order.status}
                  onChange={e => { e.stopPropagation(); handleStatusChange(order.id, e.target.value); }}
                  onClick={e => e.stopPropagation()}
                  disabled={submittingIds.has(order.id)}
                  className={`border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus:border-[#F46B03] transition-colors disabled:opacity-50 bg-white ${submittingIds.has(order.id) ? 'cursor-not-allowed text-gray-400' : ''}`}
                >
                  {DJANGO_STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
                {submittingIds.has(order.id) && (
                  <div className="w-4 h-4 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin ml-[-32px] mr-[16px]" />
                )}
                <svg
                  width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                  className={`text-gray-400 transition-transform ${expanded === order.id ? 'rotate-180' : ''}`}
                >
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === order.id && (
              <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/40">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {order.shipping_address && (
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Delivery Address</p>
                      <p className="text-sm text-gray-700">{order.shipping_address.street || order.shipping_address.address_line_1}</p>
                      <p className="text-sm text-gray-700">{order.shipping_address.city}{order.shipping_address.region ? `, ${order.shipping_address.region}` : ''}</p>
                      <p className="text-sm text-gray-500">{order.shipping_address.phone}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Order Info</p>
                    <p className="text-sm text-gray-700">Date: {formatDate(order.created_at)}</p>
                    <p className="text-sm font-bold text-gray-900">Total: ₵{parseFloat(order.total_amount || 0).toFixed(2)}</p>
                    {order.tracking_url && (
                      <a href={order.tracking_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#F46B03] hover:underline">Track shipment →</a>
                    )}
                  </div>
                </div>
                <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Items</p>
                <div className="space-y-2">
                  {(order.items || []).map((item, i) => (
                    <div key={item.id || i} className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-gray-100">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{item.product_name || 'Item'}</p>
                        <p className="text-xs text-gray-400">Qty: {item.quantity || item.qty || 1}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ₵{((item.quantity || item.qty || 1) * parseFloat(item.price_at_purchase || 0)).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Status History Timeline */}
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-3 text-left">Status History</p>
                  <div className="space-y-4">
                    {(order.audit_logs || []).length > 0 ? (
                      order.audit_logs.map((log, idx) => (
                        <div key={log.id || idx} className="relative pl-6 pb-4 last:pb-0 text-left">
                          {/* Timeline Line */}
                          {idx !== (order.audit_logs.length - 1) && (
                            <div className="absolute left-[7px] top-[14px] bottom-0 w-[2px] bg-gray-100" />
                          )}
                          {/* Timeline Dot */}
                          <div className="absolute left-0 top-[6px] w-[14px] h-[14px] rounded-full border-2 border-[#F46B03] bg-white flex items-center justify-center">
                            <div className="w-[6px] h-[6px] rounded-full bg-[#F46B03]" />
                          </div>
                          
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${statusColors[log.old_status] || 'bg-gray-100'}`}>
                                    {statusLabel[log.old_status] || log.old_status}
                                  </span>
                                  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-300">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                  </svg>
                                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${statusColors[log.new_status] || 'bg-gray-100'}`}>
                                    {statusLabel[log.new_status] || log.new_status}
                                  </span>
                                </div>
                                {log.notes && <p className="text-xs text-gray-600 mt-1 italic">"{log.notes}"</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-gray-500 font-medium">{log.changed_by_name}</p>
                              <p className="text-[9px] text-gray-400">{new Date(log.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic text-left">No history records found for this order.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {!loading && orders.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            No orders found
          </div>
        )}
        {!loading && totalPages > 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 mt-1">
            <Pagination page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} onPage={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
