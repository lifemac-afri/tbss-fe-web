import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api, { API_BASE } from '../lib/api';

const AuthContext = createContext(null);

const USER_KEY = 'tbss_user';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  });
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!currentUser;
  const isAdmin = currentUser?.is_staff === true;
  const isSuperAdmin = currentUser?.is_superuser === true;

  const _setUser = (user) => {
    setCurrentUser(user);
    if (user) sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    else sessionStorage.removeItem(USER_KEY);
  };

  useEffect(() => {
    const handleExpired = () => { _setUser(null); api.setToken(null); };
    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, []);

  useEffect(() => {
    const token = api.getToken();
    if (!token && !currentUser) {
      setIsLoading(false);
      return;
    }
    if (!token && currentUser) {
      api.refreshAccessToken().then((newToken) => {
        if (newToken) {
          api.get('/api/users/me/').then((r) => r.ok ? r.json() : null).then((user) => {
            if (user) _setUser(user);
            else _setUser(null);
          }).finally(() => setIsLoading(false));
        } else {
          _setUser(null);
          setIsLoading(false);
        }
      });
      return;
    }
    api.get('/api/users/me/')
      .then((r) => r.ok ? r.json() : null)
      .then((user) => { if (user) _setUser(user); else _setUser(null); })
      .catch(() => _setUser(null))
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async ({ email, password }) => {
    setIsLoading(true);
    try {
      const res = await fetch(API_BASE + '/api/auth/login/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.detail || data.non_field_errors?.[0] || 'Login failed' };
      }
      api.setToken(data.access);
      const profileRes = await api.get('/api/users/me/');
      const user = profileRes.ok ? await profileRes.json() : { email };
      _setUser(user);
      return { success: true, user };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithToken = useCallback((user, token) => {
    api.setToken(token);
    _setUser(user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout/', {});
    } catch {}
    api.setToken(null);
    _setUser(null);
  }, []);

  const register = useCallback(async ({ name, email, password }) => {
    try {
      const parts = (name || '').trim().split(' ');
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ') || '';
      const username = email;
      const res = await fetch(API_BASE + '/api/auth/register/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, first_name, last_name }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.detail || data.email?.[0] || data.username?.[0] || data.password?.[0] || data.error || 'Registration failed';
        return { success: false, error: msg };
      }
      return { success: true, previewUrl: data.previewUrl || '' };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const resendVerification = useCallback(async (email) => {
    try {
      const res = await fetch(API_BASE + '/api/auth/resend-verification/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      return { success: res.ok, previewUrl: data.previewUrl || '' };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    try {
      const res = await fetch(API_BASE + '/api/auth/forgot-password/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return { success: res.ok };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const resetPassword = useCallback(async ({ token, password }) => {
    try {
      const res = await fetch(API_BASE + '/api/auth/reset-password/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      return { success: res.ok, error: data.detail };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const verifyEmail = useCallback(async (token) => {
    try {
      const res = await fetch(API_BASE + `/api/auth/verify-email/?token=${encodeURIComponent(token)}`, {
        credentials: 'include',
      });
      const data = await res.json();
      return { success: res.ok, error: data.detail };
    } catch {
      return { success: false, error: 'Network error. Please try again.' };
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    try {
      const res = await api.patch('/api/users/me/', updates);
      const data = await res.json();
      if (!res.ok) return { success: false, error: data.detail || 'Update failed' };
      _setUser(data);
      return { success: true, user: data };
    } catch {
      return { success: false, error: 'Network error.' };
    }
  }, []);

  const changePassword = useCallback(async ({ oldPassword, newPassword }) => {
    try {
      const res = await api.post('/api/users/me/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
      });
      const data = await res.json();
      return { success: res.ok, error: data.detail };
    } catch {
      return { success: false, error: 'Network error.' };
    }
  }, []);

  const getAccessToken = useCallback(() => api.getToken(), []);

  const value = {
    currentUser,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isLoading,
    login,
    loginWithToken,
    logout,
    register,
    resendVerification,
    forgotPassword,
    resetPassword,
    verifyEmail,
    updateProfile,
    changePassword,
    getAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
