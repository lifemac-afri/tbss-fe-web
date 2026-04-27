import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, BookOpen, Users, ChevronRight, AlertCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/Badge';
import api from '../../lib/api';

const statusVariant = {
  pending:          'warning',
  paid:             'success',
  processing:       'info',
  shipped:          'warning',
  ready_for_pickup: 'info',
  delivered:        'success',
  cancelled:        'danger',
  failed:           'danger',
};

const statusLabel = {
  pending:          'Awaiting Payment',
  paid:             'Paid',
  processing:       'Processing',
  shipped:          'Dispatched',
  ready_for_pickup: 'Ready for Pickup',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
  failed:           'Payment Failed',
};

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const firstName = currentUser?.first_name || currentUser?.name?.split(' ')[0] || 'Reader';
  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders/')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        setRecentOrders(list.slice(0, 3));
        setOrdersLoading(false);
      })
      .catch(() => setOrdersLoading(false));
  }, []);

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          Hello, {firstName} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back to your reading world.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingBag size={18} className="text-[#F46B03]" /> Recent Orders
            </h2>
            <Link to="/dashboard/orders" className="text-xs text-[#F46B03] hover:underline flex items-center gap-1">
              View all <ChevronRight size={12} />
            </Link>
          </div>
          {ordersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-gray-50 animate-pulse">
                  <div className="space-y-1">
                    <div className="h-4 w-24 bg-gray-100 rounded" />
                    <div className="h-3 w-32 bg-gray-100 rounded" />
                  </div>
                  <div className="h-4 w-16 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag size={28} className="mx-auto text-gray-200 mb-2" />
              <p className="text-sm text-gray-400">No orders yet</p>
              <Link to="/shop" className="text-sm text-[#F46B03] hover:underline mt-1 block">Browse the shop →</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentOrders.map((order) => {
                const itemCount = (order.items || []).reduce((s, i) => s + (i.quantity || 1), 0);
                const needsPayment = order.status === 'pending' || order.status === 'failed';
                return (
                  <div key={order.id} className="py-3 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 font-mono">#{String(order.id).slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-400">{formatDate(order.created_at)} · {itemCount} item{itemCount !== 1 ? 's' : ''}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-900">₵{parseFloat(order.total_amount || 0).toFixed(2)}</span>
                        <Badge variant={statusVariant[order.status] || 'default'}>
                          {statusLabel[order.status] || order.status}
                        </Badge>
                      </div>
                    </div>
                    {needsPayment && (
                      <div className={`mt-2 flex items-center justify-between rounded-xl px-3 py-2 ${order.status === 'failed' ? 'bg-red-50' : 'bg-yellow-50'}`}>
                        <span className="flex items-center gap-1.5 text-xs text-gray-600">
                          {order.status === 'failed'
                            ? <AlertCircle size={13} className="text-red-500" />
                            : <Clock size={13} className="text-yellow-500" />
                          }
                          {order.status === 'failed' ? 'Payment failed' : 'Payment pending'}
                        </span>
                        <button
                          onClick={() => navigate('/dashboard/orders')}
                          className="text-xs font-semibold text-[#F46B03] hover:underline"
                        >
                          Pay Now →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-[#F46B03]" /> Reading Plans
            </h2>
            <p className="text-sm text-gray-400 mb-4">No active reading plan. Let us create a personalised plan for you.</p>
            <Link to="/services/reading-plan" className="block text-center text-sm font-semibold text-[#F46B03] border border-[#F46B03] rounded-full py-2 hover:bg-primary-50 transition-colors">
              Request a Plan
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Users size={18} className="text-[#F46B03]" /> Book Clubs
            </h2>
            <p className="text-sm text-gray-400 mb-4">You haven't joined any book clubs yet.</p>
            <Link to="/community/book-clubs" className="block text-center text-sm font-semibold text-[#F46B03] border border-[#F46B03] rounded-full py-2 hover:bg-primary-50 transition-colors">
              Browse Clubs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
