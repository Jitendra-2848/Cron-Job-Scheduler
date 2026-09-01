const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface BackendJob {
  id: number | string;
  name: string;
  url: string;
  method?: string;
  cron_expression: string;
  payload?: any;
  retries?: number;
  status?: string;
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

export async function fetchJobs(): Promise<BackendJob[]> {
  const res = await fetch(`${API_BASE_URL}/jobs`);
  if (!res.ok) {
    throw new Error(`Failed to fetch jobs: ${res.statusText}`);
  }
  const json = await res.json();
  return json.data || [];
}

export async function fetchJobById(id: string | number): Promise<BackendJob> {
  const res = await fetch(`${API_BASE_URL}/job/${id}`);
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  if (!res.ok) {
    throw new Error(`Failed to create job: ${res.statusText}`);
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
    headers: { 'Content-Type': 'application/json' },
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
  });
  if (!res.ok) {
    throw new Error(`Failed to delete job ${id}: ${res.statusText}`);
  }
  return await res.json();
}

export async function fetchMetrics(): Promise<BackendMetrics> {
  const res = await fetch(`${API_BASE_URL}/metrics`);
  if (!res.ok) {
    throw new Error(`Failed to fetch metrics: ${res.statusText}`);
  }
  return await res.json();
}
