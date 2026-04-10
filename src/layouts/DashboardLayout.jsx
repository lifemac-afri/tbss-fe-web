import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Bookmark, BookOpen,
  User, Bell, Settings, LogOut, ChevronRight, Menu, X
} from 'lucide-react';
import logo from '../assets/logo/logo.png';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  { icon: ShoppingBag, label: 'My Orders', href: '/dashboard/orders' },
  { icon: Bookmark, label: 'Wishlist', href: '/dashboard/wishlist' },
  { icon: BookOpen, label: 'Book Clubs', href: '/dashboard/book-clubs' },
  { icon: BookOpen, label: 'Reading Plans', href: '/dashboard/reading-plans' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
  { icon: Settings, label: 'Account Settings', href: '/dashboard/account' },
];

const DashboardLayout = () => {
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useRealtime();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile ? 'w-64' : 'w-64 hidden lg:flex'} flex-col bg-white border-r border-gray-100 min-h-screen`}>
      <div className="p-5 border-b border-gray-100">
        <Link to="/">
          <img src={logo} alt="TBSS" className="h-8 w-auto" />
        </Link>
      </div>

      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F46B03] flex items-center justify-center text-white font-semibold">
            {(currentUser?.first_name?.[0] || 'U').toUpperCase() + (currentUser?.last_name?.[0] || '').toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{`${currentUser?.first_name || ''} ${currentUser?.last_name || ''}`.trim()}</p>
            <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-primary-50 text-[#F46B03]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span>{item.label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <Link
          to="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 mb-1"
        >
          <ShoppingBag size={18} />
          Back to Shop
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-white font-poppins">
      <Sidebar />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <Sidebar mobile />
          <div className="flex-1 bg-black/40" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-100 h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-base font-semibold text-gray-800 ml-2 lg:ml-0">
            {navItems.find((i) => i.href === location.pathname)?.label || 'Dashboard'}
          </h1>
          <Link to="/dashboard/notifications" className="relative p-1.5 text-gray-500 hover:text-gray-700">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] px-[3px] bg-[#F46B03] rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Link>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
