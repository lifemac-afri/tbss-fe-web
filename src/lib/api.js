const TOKEN_KEY = 'tbss_access_token';

let _accessToken = sessionStorage.getItem(TOKEN_KEY) || null;
let _refreshing = null;

function setToken(token) {
  _accessToken = token;
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

function getToken() {
  return _accessToken;
}

async function refreshAccessToken() {
  if (_refreshing) return _refreshing;
  _refreshing = fetch('/api/auth/token/refresh/', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  })
    .then(async (res) => {
      if (!res.ok) {
        setToken(null);
        return null;
      }
      const data = await res.json();
      setToken(data.access);
      return data.access;
    })
    .catch(() => {
      setToken(null);
      return null;
    })
    .finally(() => {
      _refreshing = null;
    });
  return _refreshing;
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  let res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers,
  });

  if (res.status === 401 && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(path, {
        ...options,
        credentials: 'include',
        headers,
      });
    }
  }

  return res;
}

const api = {
  setToken,
  getToken,
  refreshAccessToken,

  async get(path) {
    return request(path, { method: 'GET' });
  },

  async post(path, body) {
    return request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  async patch(path, body) {
    return request(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  async put(path, body) {
    return request(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  },

  async del(path) {
    return request(path, { method: 'DELETE' });
  },

  async json(path, options = {}) {
    const res = await request(path, options);
    if (!res.ok) {
      let errData = {};
      try { errData = await res.json(); } catch {}
      const err = new Error(errData.detail || errData.error || 'Request failed');
      err.status = res.status;
      err.data = errData;
      throw err;
    }
    if (res.status === 204) return null;
    return res.json();
  },
};

export default api;
