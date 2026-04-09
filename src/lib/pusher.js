/**
 * Pusher client factory.
 * Returns null when VITE_PUSHER_KEY is not set (dev mode without credentials).
 * Uses a custom authorizer so the fresh Bearer token is sent on every auth call.
 */
import Pusher from 'pusher-js';
import api from './api';

let _instance = null;

export function getPusherClient() {
  const key = import.meta.env.VITE_PUSHER_KEY;
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER || 'mt1';

  if (!key) return null;
  if (_instance) return _instance;

  _instance = new Pusher(key, {
    cluster,
    forceTLS: true,
    authorizer: (channel) => ({
      authorize: async (socketId, callback) => {
        try {
          const res = await api.post('/api/pusher/auth/', {
            socket_id: socketId,
            channel_name: channel.name,
          });
          if (!res.ok) throw new Error(`Auth ${res.status}`);
          const data = await res.json();
          callback(null, data);
        } catch (err) {
          callback(err, null);
        }
      },
    }),
  });

  return _instance;
}

export function disconnectPusher() {
  if (_instance) {
    _instance.disconnect();
    _instance = null;
  }
}
