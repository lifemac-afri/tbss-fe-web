import React, { createContext, useContext, useCallback } from 'react';
import api from '../lib/api';

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  const get = useCallback((path) =>
    api.get(path).then((r) => r.json()),
  []);

  const post = useCallback((path, body) =>
    api.post(path, body).then((r) => r.json()),
  []);

  const patch = useCallback((path, body) =>
    api.patch(path, body).then(async (r) => {
      const data = await r.json();
      if (!r.ok) {
        const err = new Error(data?.detail || data?.error || 'Request failed');
        err.data = data;
        err.status = r.status;
        throw err;
      }
      return data;
    }),
  []);

  const put = useCallback((path, body) =>
    api.put(path, body).then(async (r) => {
      const data = await r.json();
      if (!r.ok) {
        const err = new Error(data?.detail || data?.error || 'Request failed');
        err.data = data;
        err.status = r.status;
        throw err;
      }
      return data;
    }),
  []);

  const del = useCallback((path) =>
    api.del(path).then((r) => r.status === 204 ? {} : r.json()),
  []);

  return (
    <AdminContext.Provider value={{ get, post, patch, put, del }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}
