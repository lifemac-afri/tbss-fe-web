import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, TrendingDown, ShoppingBag, Users, Package,
  AlertTriangle, BookOpen, Mail, ArrowUpRight, Clock, RefreshCw,
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

// ── Colour palette ────────────────────────────────────────────────────────────
const BRAND = '#F46B03';
const BRAND_LIGHT = '#FEF3EA';
const STATUS_COLORS = {
  pending:         { bg: 'bg-blue-50',   text: 'text-blue-700',   dot: '#3B82F6', pie: '#60A5FA' },
  paid:            { bg: 'bg-green-50',  text: 'text-green-700',  dot: '#10B981', pie: '#34D399' },
  processing:      { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: '#6366F1', pie: '#818CF8' },
  shipped:         { bg: 'bg-amber-50',  text: 'text-amber-700',  dot: '#F59E0B', pie: '#FCD34D' },
  ready_for_pickup:{ bg: 'bg-purple-50', text: 'text-purple-700', dot: '#8B5CF6', pie: '#A78BFA' },
  delivered:       { bg: 'bg-teal-50',   text: 'text-teal-700',   dot: '#14B8A6', pie: '#2DD4BF' },
  cancelled:       { bg: 'bg-red-50',    text: 'text-red-600',    dot: '#EF4444', pie: '#F87171' },
  failed:          { bg: 'bg-gray-50',   text: 'text-gray-500',   dot: '#9CA3AF', pie: '#D1D5DB' },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const ghc = (v) =>
  `₵${Number(v).toLocaleString('en-GH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

const fmt = (v) => `₵${Number(v).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Tooltip ───────────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label, currency = true }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2.5 text-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {currency ? fmt(p.value) : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, subUp, icon: Icon, iconColor = BRAND, iconBg = BRAND_LIGHT, loading }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: iconBg }}>
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        {loading ? (
          <div className="space-y-2">
            <div className="h-7 w-24 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
            {sub && (
              <p className={`text-xs mt-1 font-medium flex items-center gap-1 ${subUp === true ? 'text-green-600' : subUp === false ? 'text-red-500' : 'text-gray-400'}`}>
                {subUp === true && <TrendingUp size={11} />}
                {subUp === false && <TrendingDown size={11} />}
                {sub}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Panel wrapper ─────────────────────────────────────────────────────────────
function Panel({ title, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between mb-5">
          {title && <h2 className="font-semibold text-gray-900 text-sm">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function Skeleton({ className }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AdminOverviewPage() {
  const { get } = useAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const data = await get('/api/v1/admin/dashboard');
      if (data?.detail) setError(data.detail);
      else setStats(data);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (error) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-red-500 text-sm">{error}</p>
    </div>
  );

  const {
    sales_today = 0,
    sales_this_month = 0,
    sales_trend_pct,
    pending_orders = 0,
    low_stock_count = 0,
    low_stock_products = [],
    pending_reading_plans = 0,
    active_club_members = 0,
    total_orders = 0,
    total_products = 0,
    total_users = 0,
    newsletter_subscribers = 0,
    revenue_by_day = [],
    revenue_by_month = [],
    order_status_breakdown = [],
    top_products = [],
    recent_orders = [],
  } = stats || {};

  const trendLabel = sales_trend_pct != null
    ? `${sales_trend_pct > 0 ? '+' : ''}${sales_trend_pct}% vs last month`
    : 'No prior month data';

  // Only show the last 14 days labels in the area chart to avoid crowding
  const dayChartData = revenue_by_day.map((d, i) => ({
    ...d,
    label: i % 5 === 0 ? d.label : '',
    fullLabel: d.label,
  }));

  // Pie chart colors
  const pieData = order_status_breakdown.map((s) => ({
    name: s.status.replace(/_/g, ' '),
    value: s.count,
    color: STATUS_COLORS[s.status]?.pie || '#D1D5DB',
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {new Date().toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-800 border border-gray-200 rounded-xl px-3 py-2 transition-colors"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* ── Alert banners ── */}
      {!loading && (pending_orders > 0 || low_stock_count > 0 || pending_reading_plans > 0) && (
        <div className="flex flex-wrap gap-2">
          {pending_orders > 0 && (
            <Link to="/admin/orders" className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-100 transition-colors">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              {pending_orders} orders need fulfilment
              <ArrowUpRight size={12} />
            </Link>
          )}
          {low_stock_count > 0 && (
            <Link to="/admin/products" className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-red-100 transition-colors">
              <AlertTriangle size={13} />
              {low_stock_count} products low on stock
              <ArrowUpRight size={12} />
            </Link>
          )}
          {pending_reading_plans > 0 && (
            <Link to="/admin/reading-plans" className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold px-4 py-2 rounded-xl hover:bg-orange-100 transition-colors">
              <Clock size={13} />
              {pending_reading_plans} reading plan{pending_reading_plans > 1 ? 's' : ''} pending
              <ArrowUpRight size={12} />
            </Link>
          )}
        </div>
      )}

      {/* ── KPI Cards — Row 1 ── */}
      <div data-tour="overview-stats" className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard loading={loading} label="Revenue This Month" value={ghc(sales_this_month)}
          sub={trendLabel} subUp={sales_trend_pct != null ? sales_trend_pct > 0 : undefined}
          icon={TrendingUp} iconColor="#F46B03" iconBg="#FEF3EA" />
        <StatCard loading={loading} label="Sales Today" value={ghc(sales_today)}
          sub={`${pending_orders} pending`}
          icon={ShoppingBag} iconColor="#3B82F6" iconBg="#EFF6FF" />
        <StatCard loading={loading} label="Total Orders" value={total_orders.toLocaleString()}
          sub="All time"
          icon={Package} iconColor="#8B5CF6" iconBg="#F5F3FF" />
        <StatCard loading={loading} label="Total Users" value={total_users.toLocaleString()}
          sub="Active accounts"
          icon={Users} iconColor="#10B981" iconBg="#ECFDF5" />
        <StatCard loading={loading} label="Products Listed" value={total_products.toLocaleString()}
          sub={low_stock_count > 0 ? `${low_stock_count} low stock` : 'All stocked'}
          subUp={low_stock_count === 0 ? true : false}
          icon={BookOpen} iconColor="#F59E0B" iconBg="#FFFBEB" />
        <StatCard loading={loading} label="Subscribers" value={newsletter_subscribers.toLocaleString()}
          sub="Newsletter"
          icon={Mail} iconColor="#EC4899" iconBg="#FDF2F8" />
      </div>

      {/* ── Revenue Area Chart (30 days) ── */}
      <Panel
        title="Revenue — Last 30 Days"
        action={
          <span className="text-xs text-gray-400 font-medium bg-gray-50 px-3 py-1 rounded-full">
            {ghc(sales_this_month)} this month
          </span>
        }
      >
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : revenue_by_day.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dayChartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BRAND} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: '#9CA3AF' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `₵${v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}`}
                width={52}
              />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                name="Revenue"
                stroke={BRAND}
                strokeWidth={2.5}
                fill="url(#revGradient)"
                dot={false}
                activeDot={{ r: 5, fill: BRAND, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-56 flex items-center justify-center text-sm text-gray-400">No revenue data yet</div>
        )}
      </Panel>

      {/* ── Row: Monthly bar + Order status pie ── */}
      <div data-tour="overview-charts" className="grid lg:grid-cols-5 gap-6">

        {/* Monthly Revenue Bar */}
        <Panel title="Monthly Revenue (6 months)" className="lg:col-span-3">
          {loading ? (
            <Skeleton className="h-52 w-full" />
          ) : revenue_by_month.length > 0 ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={revenue_by_month} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₵${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                  width={50}
                />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#FEF3EA' }} />
                <Bar dataKey="revenue" name="Revenue" fill={BRAND} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">No data yet</div>
          )}
        </Panel>

        {/* Order Status Donut */}
        <Panel title="Order Status" className="lg:col-span-2">
          {loading ? (
            <Skeleton className="h-52 w-full" />
          ) : pieData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={170}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={52}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 w-full mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
                    <span className="text-[11px] text-gray-500 capitalize truncate">{entry.name}</span>
                    <span className="text-[11px] font-bold text-gray-700 ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-gray-400">No orders yet</div>
          )}
        </Panel>
      </div>

      {/* ── Row: Top products + Recent orders ── */}
      <div className="grid lg:grid-cols-5 gap-6">

        {/* Top Products Horizontal Bar */}
        <Panel title="Top Products by Revenue" className="lg:col-span-2">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : top_products.length > 0 ? (
            <div className="space-y-3">
              {top_products.map((p, i) => {
                const maxRev = top_products[0]?.revenue || 1;
                const pct = Math.round((p.revenue / maxRev) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-xs font-medium text-gray-700 truncate max-w-[70%]">{p.title}</p>
                      <p className="text-xs font-bold text-gray-900 flex-shrink-0">{ghc(p.revenue)}</p>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, background: BRAND, opacity: 0.7 + (0.3 * (5 - i) / 5) }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">{p.units} unit{p.units !== 1 ? 's' : ''} sold</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">No sales data yet</div>
          )}
        </Panel>

        {/* Recent Orders */}
        <Panel
          title="Recent Orders"
          action={
            <Link to="/admin/orders" className="text-xs text-[#F46B03] hover:underline font-medium flex items-center gap-1">
              View all <ArrowUpRight size={12} />
            </Link>
          }
          className="lg:col-span-3"
        >
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : recent_orders.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-sm text-gray-400">No orders yet</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recent_orders.map((order) => {
                const sc = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                const dateStr = order.created_at
                  ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
                  : '';
                return (
                  <div key={order.id} className="flex items-center justify-between py-2.5 gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900 font-mono">
                        #{String(order.id).slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[11px] text-gray-400 truncate">
                        {order.user__email || order.user__username} · {dateStr}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${sc.bg} ${sc.text}`}>
                        {order.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs font-bold text-gray-900 w-20 text-right">
                        {fmt(order.total_amount || 0)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      {/* ── Low Stock Panel ── */}
      {(loading || low_stock_products.length > 0) && (
        <Panel
          title="Low Stock Alert"
          action={
            <Link to="/admin/products" className="text-xs text-[#F46B03] hover:underline font-medium flex items-center gap-1">
              Manage products <ArrowUpRight size={12} />
            </Link>
          }
        >
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              {low_stock_products.map((p) => (
                <div key={p.id} className={`rounded-xl border p-3 ${p.stock_quantity === 0 ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'}`}>
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight mb-2">{p.title}</p>
                  <div className="flex items-center justify-between">
                    {p.isbn && <p className="text-[10px] text-gray-400 font-mono">{p.isbn}</p>}
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ml-auto ${p.stock_quantity === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                      {p.stock_quantity === 0 ? 'Out' : `${p.stock_quantity} left`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>
      )}

    </div>
  );
}
