const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '';

function getHeaders(customHeaders: Record<string, string> = {}) {
  const token = localStorage.getItem('cronmaster_token');
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || `Request failed with status ${res.status}`);
      err.response = { status: res.status, data };
      throw err;
    }
    return { status: res.status, data };
  },
  post: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || `Request failed with status ${res.status}`);
      err.response = { status: res.status, data };
      throw err;
    }
    return { status: res.status, data };
  },
  put: async (endpoint: string, body: any) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || `Request failed with status ${res.status}`);
      err.response = { status: res.status, data };
      throw err;
    }
    return { status: res.status, data };
  },
  delete: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(),
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err: any = new Error(data.message || `Request failed with status ${res.status}`);
      err.response = { status: res.status, data };
      throw err;
    }
    return { status: res.status, data };
  },
};
