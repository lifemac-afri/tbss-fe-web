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
    api.patch(path, body).then((r) => r.json()),
  []);

  const put = useCallback((path, body) =>
    api.put(path, body).then((r) => r.json()),
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
