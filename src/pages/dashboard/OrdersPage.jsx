import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Package, Truck, CheckCircle, XCircle, Clock, MapPin } from 'lucide-react';
import api from '../../lib/api';

const statusConfig = {
  pending:          { label: 'Awaiting Payment', color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  paid:             { label: 'Paid',             color: 'bg-green-50 text-green-700 border-green-100',  dot: 'bg-green-500' },
  processing:       { label: 'Processing',       color: 'bg-blue-50 text-blue-700 border-blue-100',    dot: 'bg-blue-500'  },
  shipped:          { label: 'Dispatched',        color: 'bg-amber-50 text-amber-700 border-amber-100', dot: 'bg-amber-500' },
  ready_for_pickup: { label: 'Ready for Pickup', color: 'bg-purple-50 text-purple-700 border-purple-100', dot: 'bg-purple-500' },
  delivered:        { label: 'Delivered',         color: 'bg-green-50 text-green-700 border-green-100', dot: 'bg-green-500' },
  cancelled:        { label: 'Cancelled',         color: 'bg-red-50 text-red-600 border-red-100',      dot: 'bg-red-400'   },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] || statusConfig.processing;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const StatusIcon = ({ status }) => {
  if (status === 'delivered')        return <CheckCircle size={18} className="text-green-500" />;
  if (status === 'cancelled')        return <XCircle size={18} className="text-red-400" />;
  if (status === 'shipped')          return <Truck size={18} className="text-amber-500" />;
  if (status === 'pending')          return <Clock size={18} className="text-yellow-500" />;
  return <Package size={18} className="text-blue-500" />;
};

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);
  const itemCount = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
  const total = parseFloat(order.total_amount || 0);
  const dateStr = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : '';

  const addr = order.shipping_address || {};
  const hasAddress = addr.name || addr.street || addr.city;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      {/* Header row */}
      <div
        className="flex items-center justify-between p-4 lg:p-5 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <StatusIcon status={order.status} />
          <div className="min-w-0">
            <p className="font-semibold text-gray-800 text-sm font-mono truncate">
              #{String(order.id).slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {dateStr} · {itemCount} item{itemCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
          <StatusBadge status={order.status} />
          <span className="font-bold text-gray-800 text-sm hidden sm:block">₵{total.toFixed(2)}</span>
          {expanded
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />
          }
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 lg:p-5 space-y-5">

          {/* Pending payment notice */}
          {order.status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex items-start gap-2 text-sm text-yellow-800">
              <Clock size={16} className="flex-shrink-0 mt-0.5" />
              <span>This order is awaiting payment confirmation. If you completed payment, it will update automatically.</span>
            </div>
          )}

          {/* Items */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Items</p>
            {(order.items || []).map((item, i) => (
              <div key={item.id || i} className="flex items-center gap-3">
                <div className="w-12 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.product_image ? (
                    <img
                      src={item.product_image}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={16} className="text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {item.product_name || 'Item'}
                  </p>
                  {item.product_tag && (
                    <p className="text-xs text-gray-400">{item.product_tag}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity || 1}</p>
                </div>
                <p className="text-sm font-bold text-gray-800 flex-shrink-0">
                  ₵{parseFloat(item.subtotal || 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₵{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="border-t border-gray-200 pt-1.5 flex justify-between text-sm font-bold text-gray-800">
              <span>Total</span>
              <span>₵{total.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery address */}
          {hasAddress && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin size={12} /> Delivery Address
              </p>
              <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 space-y-0.5">
                {addr.name    && <p className="font-semibold">{addr.name}</p>}
                {addr.phone   && <p className="text-gray-500">{addr.phone}</p>}
                {addr.street  && <p>{addr.street}</p>}
                {(addr.city || addr.region) && (
                  <p>{[addr.city, addr.region].filter(Boolean).join(', ')}</p>
                )}
              </div>
            </div>
          )}

          {/* Cancellation reason */}
          {order.cancellation_reason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-sm text-red-700">
              <p className="font-semibold mb-0.5">Cancellation reason</p>
              <p>{order.cancellation_reason}</p>
            </div>
          )}

          {/* Tracking link */}
          {order.tracking_url && (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-[#F46B03] hover:underline font-medium"
            >
              <Truck size={14} /> Track your order
            </a>
          )}
        </div>
      )}
    </div>
  );
};

const FILTER_OPTIONS = [
  { label: 'All',             value: 'all'             },
  { label: 'Awaiting Payment',value: 'pending'         },
  { label: 'Paid',            value: 'paid'            },
  { label: 'Processing',      value: 'processing'      },
  { label: 'Dispatched',      value: 'shipped'         },
  { label: 'Delivered',       value: 'delivered'       },
  { label: 'Cancelled',       value: 'cancelled'       },
];

const OrdersPage = () => {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [filter, setFilter]   = useState('all');

  useEffect(() => {
    setLoading(true);
    api.get('/api/orders/')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        setOrders(list);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load orders. Please try again.');
        setLoading(false);
      });
  }, []);

  const filtered = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  // Only show filter tabs that have at least one order (plus All)
  const activeTabs = FILTER_OPTIONS.filter(
    f => f.value === 'all' || orders.some(o => o.status === f.value)
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">My Orders</h2>
        <p className="text-sm text-gray-500 mt-1">
          {loading ? 'Loading…' : `${orders.length} order${orders.length !== 1 ? 's' : ''} placed`}
        </p>
      </div>

      {/* Filter tabs — only show tabs that have orders */}
      {!loading && orders.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {activeTabs.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                filter === f.value
                  ? 'bg-[#F46B03] text-white border-[#F46B03]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#F46B03] hover:text-[#F46B03]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 animate-pulse flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-red-500 mb-2">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Package size={36} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {filter === 'all' ? 'No orders placed yet' : `No ${statusConfig[filter]?.label.toLowerCase() || filter} orders`}
          </p>
          {filter === 'all' && (
            <a href="/shop" className="text-sm text-[#F46B03] hover:underline mt-2 block">
              Browse the shop →
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
