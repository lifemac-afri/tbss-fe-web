import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { TourProvider, useTour } from '@reactour/tour';
import { useAuth } from '../context/AuthContext';
import { useRealtime } from '../context/RealtimeContext';
import AdminTourController from '../components/AdminTourController';
import { adminSteps } from '../tours/adminSteps';

import logo from '../assets/logo/logo.png';

const tourStyles = {
  popover: (base) => ({
    ...base,
    borderRadius: '16px',
    padding: '20px 24px 16px',
    maxWidth: '340px',
    boxShadow: '0 20px 60px -10px rgba(0,0,0,0.2)',
  }),
  badge: (base) => ({ ...base, background: '#F46B03', fontFamily: 'Poppins, sans-serif' }),
  dot: (base, state) => ({
    ...base,
    background: state?.current ? '#F46B03' : '#e5e7eb',
    width: 7,
    height: 7,
  }),
  close: (base) => ({ ...base, color: '#9ca3af' }),
};

function TourStartButton() {
  const { setIsOpen, setCurrentStep } = useTour();
  return (
    <button
      onClick={() => { setCurrentStep(0); setIsOpen(true); }}
      title="Start guided tour"
      className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-[#F46B03] border border-gray-200 hover:border-[#F46B03] rounded-xl px-3 py-2 transition-all"
    >
      <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" />
      </svg>
      Tour
    </button>
  );
}

// ... (NAV and AccessDenied stay same, skipping for brevity in thought but tool expects full ReplacementContent)
// Wait, I should not skip. I'll provide the full content or use multi_replace.
// I'll use replace_file_content for the imports and then another for the body.
// Actually, I'll just do it in one go to be safe with the state.

// superAdminOnly: true  →  hidden from nav + blocked for non-superadmins
const NAV = [
  {
    to: '/admin', label: 'Overview', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
    )
  },
  {
    to: '/admin/products', label: 'Products', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
    )
  },
  {
    to: '/admin/shelf-locator', label: 'Shelf Locator', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" /><path d="M4 6V18" /><path d="M20 6V18" /></svg>
    )
  },
  {
    to: '/admin/genres', label: 'Genres', superAdminOnly: true, icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h7" /></svg>
    )
  },
  {
    to: '/admin/orders', label: 'Orders', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 12h6M9 16h4" /></svg>
    )
  },
  {
    to: '/admin/reviews', label: 'Reviews', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
    )
  },
  {
    to: '/admin/customers', label: 'Customers', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )
  },
  {
    to: '/admin/blog', label: 'Blog / CMS', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
    )
  },
  {
    to: '/admin/reading-plans', label: 'Reading Plans', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
    )
  },
  {
    to: '/admin/book-clubs', label: 'Book Clubs', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    )
  },
  {
    to: '/admin/deals', label: 'Deals & Promotions', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
    )
  },
  {
    to: '/admin/sections', label: 'Homepage Sections', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="4" rx="1" /><rect x="3" y="10" width="11" height="4" rx="1" /><rect x="3" y="17" width="7" height="4" rx="1" /></svg>
    )
  },
  {
    to: '/admin/newsletter', label: 'Newsletter', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
    )
  },
  {
    to: '/admin/settings', label: 'Settings', icon: (
      <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    )
  },
];

// Routes non-superadmins cannot access at all
const SUPERADMIN_ONLY_ROUTES = ['/admin/genres'];

function AccessDenied() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-5"> 
        <svg width="28" height="28" fill="none" stroke="#F46B03" strokeWidth="1.8" viewBox="0 0 24 24">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
      <p className="text-sm text-gray-500 max-w-xs mb-6">
        This section is only available to Superadmins. Contact your administrator if you need access.
      </p>
      <button
        onClick={() => navigate('/admin')}
        className="px-5 py-2.5 bg-[#F46B03] text-white text-sm font-semibold rounded-xl hover:bg-[#C15300] transition-colors"
      >
        Back to Overview
      </button>
    </div>
  );
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifRef = useRef(null);
  const { currentUser, isSuperAdmin, logout } = useAuth();
  const { unreadCount, liveNotifications, markAllRead, loading: notifsLoading } = useRealtime();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  // Filter sidebar nav based on role
  const visibleNav = NAV.filter(item => isSuperAdmin || !item.superAdminOnly);

  // Check if current route is off-limits
  const isBlocked = !isSuperAdmin && SUPERADMIN_ONLY_ROUTES.some(r => location.pathname.startsWith(r));

  // Derive display name + role badge
  const displayName = [currentUser?.first_name, currentUser?.last_name].filter(Boolean).join(' ') || currentUser?.email || 'Admin';
  const roleBadge = isSuperAdmin ? { label: 'Superadmin', cls: 'bg-purple-500/20 text-purple-200' } : { label: 'Admin', cls: 'bg-orange-500/20 text-orange-200' };

  const formatTime = (dateStr) => {
    try {
      const now = new Date();
      const date = new Date(dateStr);
      const diff = Math.floor((now - date) / 1000);
      if (diff < 60) return 'Just now';
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return date.toLocaleDateString();
    } catch (_) { return ''; }
  };

  return (
    <TourProvider steps={adminSteps} styles={tourStyles} showBadge showDots padding={{ mask: 6 }}>
      <AdminTourController />
    <div className="flex h-screen bg-[#F8F7F5] overflow-hidden font-poppins">
      {/* Sidebar */}
      <aside data-tour="admin-sidebar" className={`${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 bg-black flex flex-col transition-all duration-200`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${!sidebarOpen ? 'justify-center' : ''}`}>
          <div className="px-1 py-1 bg-white rounded-lg flex items-center justify-center flex-shrink-0 w-full">
            <img src={logo} alt="TBSS" className="h-10 w-auto object-contain" />
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {visibleNav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 mx-2 rounded-xl mb-0.5 transition-colors text-sm font-medium ${isActive
                  ? 'bg-[#F46B03] text-white'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
                } ${!sidebarOpen ? 'justify-center px-0' : ''}`
              }
              title={!sidebarOpen ? label : undefined}
            >
              <span className="flex-shrink-0">{icon}</span>
              {sidebarOpen && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User + role + logout */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-[#F46B03] rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {displayName[0]?.toUpperCase() || 'A'}
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-white text-xs font-semibold truncate">{displayName}</p>
                <p className="text-white/40 text-xs truncate">{currentUser?.email}</p>
              </div>
            </div>
            <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide mb-2 ${roleBadge.cls}`}>
              {roleBadge.label}
            </span>
            <button onClick={handleLogout} className="w-full text-left text-xs text-white/50 hover:text-red-400 transition-colors py-1 block">
              Sign out
            </button>
          </div>
        )}
        {!sidebarOpen && (
          <button onClick={handleLogout} className="p-4 text-white/40 hover:text-red-400 transition-colors flex justify-center border-t border-white/10" title="Sign out">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
          </button>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between flex-shrink-0 relative">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(v => !v)}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <TourStartButton />
            <a href="/" target="_blank" rel="noopener noreferrer" className="text-xs text-[#F46B03] hover:underline font-medium">
              View Storefront ↗
            </a>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                data-tour="notifications-bell"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all active:scale-95"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#F46B03] text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-[11px] text-[#F46B03] hover:underline font-semibold"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto">
                    {notifsLoading && liveNotifications.length === 0 ? (
                      <div className="p-10 text-center text-gray-400 text-sm">Loading...</div>
                    ) : liveNotifications.length === 0 ? (
                      <div className="p-10 text-center text-gray-400">
                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="opacity-20"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                        </div>
                        <p className="text-xs">No recent notifications</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {liveNotifications.map((notif, i) => (
                          <div 
                            key={notif.id || i} 
                            className={`p-4 transition-colors ${!notif.is_read ? 'bg-orange-50/30' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                {notif.title}
                              </p>
                              <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
                                {formatTime(notif.created_at)}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {notif.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
                    <button className="text-[11px] text-gray-500 font-medium hover:text-gray-900 transition-colors">
                      View all alert history
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {isBlocked ? <AccessDenied /> : <Outlet />}
        </main>
      </div>
    </div>
    </TourProvider>
  );
}
