/**
 * RealtimeContext — Pusher-backed real-time events for TBSS.
 *
 * Provides:
 *  - unreadCount       — live unread notification count
 *  - liveNotifications — notifications pushed in this session (newest first)
 *  - markAllRead()     — mark all as read and reset count
 */
import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '../components/Toast';
import { getPusherClient, disconnectPusher } from '../lib/pusher';

const RealtimeContext = createContext(null);

const STATUS_LABELS = {
  pending:          'Awaiting Payment',
  paid:             'Paid',
  processing:       'Processing',
  shipped:          'Dispatched',
  ready_for_pickup: 'Ready for Pickup',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

export const RealtimeProvider = ({ children }) => {
  const { currentUser, isAuthenticated } = useAuth();
  const toast = useToast();

  const [unreadCount, setUnreadCount] = useState(0);
  const [liveNotifications, setLiveNotifications] = useState([]);

  const channelRef = useRef(null);
  const adminChannelRef = useRef(null);

  const addLiveNotification = useCallback((notif) => {
    setLiveNotifications(prev => [notif, ...prev].slice(0, 50));
    setUnreadCount(c => c + 1);
  }, []);

  const markAllRead = useCallback(() => {
    setUnreadCount(0);
    setLiveNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }, []);

  const setInitialUnread = useCallback((count) => {
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) {
      disconnectPusher();
      channelRef.current = null;
      adminChannelRef.current = null;
      return;
    }

    const pusher = getPusherClient();
    if (!pusher) return; // Pusher not configured — graceful no-op

    // ── User private channel ──────────────────────────────────────────────
    const userChannel = `private-user-${currentUser.id}`;
    const channel = pusher.subscribe(userChannel);
    channelRef.current = channel;

    channel.bind('notification.new', (data) => {
      addLiveNotification(data);
      toast.info(data.title || data.message, { duration: 5000 });
    });

    channel.bind('order.status_updated', (data) => {
      const label = STATUS_LABELS[data.new_status] || data.new_status;
      const shortId = String(data.order_id).slice(0, 8).toUpperCase();
      toast.success(`Order #${shortId} → ${label}`, { duration: 6000 });
    });

    // ── Admin channel ─────────────────────────────────────────────────────
    if (currentUser.is_staff) {
      const adminCh = pusher.subscribe('private-admin');
      adminChannelRef.current = adminCh;

      adminCh.bind('order.created', (data) => {
        const shortId = String(data.order_id).slice(0, 8).toUpperCase();
        toast.success(
          `New order #${shortId} — ₵${data.total_amount} from ${data.customer_name}`,
          { duration: 7000 }
        );
      });

      adminCh.bind('stock.low', (data) => {
        toast.warning(
          `Low stock: "${data.product_name}" — only ${data.stock_quantity} left`,
          { duration: 8000 }
        );
      });
    }

    return () => {
      try { pusher.unsubscribe(userChannel); } catch (_) {}
      if (currentUser.is_staff) {
        try { pusher.unsubscribe('private-admin'); } catch (_) {}
      }
      channelRef.current = null;
      adminChannelRef.current = null;
    };
  }, [isAuthenticated, currentUser?.id, currentUser?.is_staff]);

  return (
    <RealtimeContext.Provider value={{ unreadCount, liveNotifications, markAllRead, setInitialUnread }}>
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider');
  return ctx;
};
