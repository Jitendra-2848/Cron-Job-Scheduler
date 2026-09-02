const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getAuthToken(): string | null {
  return localStorage.getItem('cronmaster_token');
}

export function setAuthToken(token: string | null) {
  if (token) {
    localStorage.setItem('cronmaster_token', token);
  } else {
    localStorage.removeItem('cronmaster_token');
  }
}

function getHeaders(customHeaders: Record<string, string> = {}) {
  const token = getAuthToken();
  const headers: Record<string, string> = { ...customHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export interface BackendJob {
  id: number | string;
  name: string;
  url: string;
  method?: string;
  cron_expression: string;
  payload?: any;
  retries?: number;
  status?: string;
  next_run_at?: string;
  created_at?: string;
}

export interface BackendMetrics {
  status: string;
  timestamp: string;
  metrics: {
    waiting_queue_depth: number;
    active_concurrency_load: number;
    failed_job_count: number;
    completed_job_count: number;
    delayed_job_count: number;
  };
}

export async function loginUser(username: string, password: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Login failed');
  }
  if (data.accessToken) {
    setAuthToken(data.accessToken);
  }
  return data;
}

export async function registerUser(username: string, password: string, email?: string): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password, email }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  if (data.accessToken) {
    setAuthToken(data.accessToken);
  }
  return data;
}

export async function logoutUser(): Promise<any> {
  setAuthToken(null);
  const res = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
  });
  return await res.json().catch(() => ({}));
}

export async function fetchMeUser(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  return await res.json();
}

export async function updateUserProfileApi(data: { name?: string; email?: string; username?: string; avatar?: string }): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(json.message || 'Failed to update profile');
  }
  return json;
}

export async function fetchJobs(): Promise<BackendJob[]> {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data || [];
}

export async function fetchJobById(id: string | number): Promise<BackendJob> {
  const res = await fetch(`${API_BASE_URL}/job/${id}`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch job ${id}: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data;
}

export async function createJob(jobData: {
  name: string;
  url: string;
  method?: string;
  cron_expression: string;
  payload?: any;
  retries?: number;
}): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/job`, {
    method: 'POST',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(jobData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create job: ${res.statusText}`);
  }
  return await res.json();
}

export async function updateJob(
  id: string | number,
  jobData: Partial<{
    name: string;
    url: string;
    method: string;
    cron_expression: string;
    payload: any;
    retries: number;
    status: string;
  }>
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/job/${id}`, {
    method: 'PUT',
    headers: getHeaders({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(jobData),
  });
  if (!res.ok) {
    throw new Error(`Failed to update job ${id}: ${res.statusText}`);
  }
  return await res.json();
}

export async function deleteJob(id: string | number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/job/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete job ${id}: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchMetrics(): Promise<BackendMetrics> {
  const res = await fetch(`${API_BASE_URL}/metrics`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch metrics: ${res.statusText}`);
  }
  return await res.json();
}

export interface BackendExecution {
  id: number | string;
  job_id: number | string;
  job_name?: string;
  url?: string;
  method?: string;
  status: 'success' | 'failed' | 'running';
  response_code: number | null;
  response_body: string | null;
  response_time_ms: number;
  error_message: string | null;
  attempt_number: number;
  created_at: string;
}

export async function fetchExecutions(): Promise<BackendExecution[]> {
  const res = await fetch(`${API_BASE_URL}/executions`, {
    headers: getHeaders(),
    credentials: 'include',
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch executions: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data || [];
}

export async function triggerJobRun(id: string | number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/job/${id}/run`, {
    method: 'POST',
    headers: getHeaders(),
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Failed to run job ${id}`);
  }
  return data;
}
