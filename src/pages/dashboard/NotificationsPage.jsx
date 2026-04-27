import React, { useState, useEffect, useMemo } from 'react';
import { Bell, Package, BookOpen, Tag } from 'lucide-react';
import api from '../../lib/api';
import { useRealtime } from '../../context/RealtimeContext';

const typeIcon = (type) => {
  if (type === 'order') return <Package size={16} className="text-blue-500" />;
  if (type === 'club') return <BookOpen size={16} className="text-[#F46B03]" />;
  return <Tag size={16} className="text-purple-500" />;
};

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const NotificationsPage = () => {
  const { liveNotifications, unreadCount, markAllRead: ctxMarkAllRead, setInitialUnread } = useRealtime();

  const [apiNotifications, setApiNotifications] = useState([]);
  const [apiUnread, setApiUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/notifications/')
      .then((r) => r.json())
      .then((data) => {
        setApiNotifications(data.results || []);
        const count = data.unread_count || 0;
        setApiUnread(count);
        setInitialUnread(count);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Merge: live notifications first, then API ones (dedup by id)
  const notifications = useMemo(() => {
    const liveIds = new Set(liveNotifications.map((n) => n.id).filter(Boolean));
    const apiFiltered = apiNotifications.filter((n) => !liveIds.has(n.id));
    return [...liveNotifications, ...apiFiltered];
  }, [liveNotifications, apiNotifications]);

  const handleMarkAllRead = async () => {
    const ids = apiNotifications.filter((n) => !n.is_read).map((n) => n.id);
    try {
      if (ids.length > 0) await api.post('/api/notifications/mark-read/', { notification_ids: ids });
    } catch {
      // optimistic
    }
    setApiNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setApiUnread(0);
    ctxMarkAllRead();
  };

  const markRead = async (id) => {
    const isAlreadyRead = notifications.find((n) => n.id === id)?.is_read;
    if (isAlreadyRead) return;
    try {
      await api.post('/api/notifications/mark-read/', { notification_ids: [id] });
    } catch {
      // optimistic
    }
    setApiNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, is_read: true } : n)
    );
    setApiUnread((c) => Math.max(0, c - 1));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
          <p className="text-sm text-gray-500 mt-1">
            {loading
              ? 'Loading…'
              : unreadCount > 0
              ? `${unreadCount} unread`
              : 'All caught up'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-sm text-[#F46B03] font-medium hover:underline flex-shrink-0"
          >
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-start gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Bell size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, idx) => (
            <div
              key={notif.id || `live-${idx}`}
              onClick={() => notif.id && markRead(notif.id)}
              className={`bg-white rounded-2xl border p-4 flex items-start gap-3 cursor-pointer transition-colors hover:bg-gray-50 ${
                notif.is_read ? 'border-gray-100' : 'border-[#F46B03]/20 bg-orange-50/30'
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                notif.is_read ? 'bg-gray-100' : 'bg-orange-100'
              }`}>
                {typeIcon(notif.notification_type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`text-sm font-semibold leading-tight ${notif.is_read ? 'text-gray-700' : 'text-gray-900'}`}>
                    {notif.title || notif.message}
                  </p>
                  {!notif.is_read && (
                    <span className="w-2 h-2 rounded-full bg-[#F46B03] flex-shrink-0 mt-1.5" />
                  )}
                </div>
                {notif.title && notif.message && (
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{notif.message}</p>
                )}
                <p className="text-[10px] text-gray-400 mt-1.5">{timeAgo(notif.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
