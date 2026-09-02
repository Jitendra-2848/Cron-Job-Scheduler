const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export const api = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      credentials: 'include',
    });
    console.log(endpoint);
    console.log(res);
    const data = await res.json().catch(() => ({}));
    console.log(data)
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
