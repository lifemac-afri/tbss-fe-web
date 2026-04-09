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
    setUpdating(orderId);
    try {
      const result = await patch(`/api/cart/admin/orders/${orderId}/status/`, { status: newStatus });
      if (statusFilter !== 'All') {
        fetchOrders();
      } else {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: result.new_status || newStatus } : o));
      }
    } catch {
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
    setUpdating(null);
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{totalCount} total orders</p>
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
                  disabled={updating === order.id}
                  className="border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium outline-none focus:border-[#F46B03] transition-colors disabled:opacity-50 bg-white"
                >
                  {DJANGO_STATUSES.map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                </select>
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
