import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CronJob, ExecutionLog, SystemService, UserProfile, CronStatus } from '../types/cron';
import { fetchJobs, createJob, updateJob, deleteJob, fetchMeUser, fetchExecutions, triggerJobRun, type BackendJob, type BackendExecution } from '../services/api';
import { parseCronExpression } from '../utils/cronParser';

const INITIAL_EXECUTION_LOGS: ExecutionLog[] = [];

const INITIAL_SYSTEM_STATUS: SystemService[] = [
  { name: 'Scheduler Engine', status: 'operational', latency: '4ms' },
  { name: 'API Gateway', status: 'operational', latency: '12ms' },
  { name: 'System Database', status: 'operational', latency: '2ms' },
  { name: 'Task Worker Engine', status: 'operational', latency: '18ms' }
];

const INITIAL_USER: UserProfile = {
  name: 'User',
  email: 'user@cronmaster.dev',
  role: 'Developer',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  phone: '',
  timezone: 'UTC',
  twoFactorEnabled: false,
  joinedDate: '2025'
};

interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface CronContextType {
  cronJobs: CronJob[];
  executionLogs: ExecutionLog[];
  systemServices: SystemService[];
  user: UserProfile;
  searchModalOpen: boolean;
  setSearchModalOpen: (open: boolean) => void;
  selectedJobForDrawer: CronJob | null;
  setSelectedJobForDrawer: (job: CronJob | null) => void;
  selectedLogForDrawer: ExecutionLog | null;
  setSelectedLogForDrawer: (log: ExecutionLog | null) => void;
  toasts: ToastItem[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  addCronJob: (jobData: any) => Promise<void>;
  updateCronJob: (id: string, jobData: Partial<CronJob>) => Promise<void>;
  deleteCronJob: (id: string) => Promise<void>;
  toggleJobStatus: (id: string) => Promise<void>;
  runJobNow: (id: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
  refreshExecutions: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const CronContext = createContext<CronContextType | undefined>(undefined);

function mapBackendToCronJob(bj: BackendJob): CronJob {
  const human = parseCronExpression(bj.cron_expression);
  return {
    id: String(bj.id),
    name: bj.name,
    description: `HTTP Endpoint: ${bj.method || 'GET'} ${bj.url}`,
    schedule: bj.cron_expression,
    humanSchedule: human,
    commandType: 'webhook',
    command: `${bj.method || 'GET'} ${bj.url}`,
    webhookUrl: bj.url,
    method: bj.method || 'GET',
    payload: bj.payload,
    status: (bj.status as CronStatus) || 'active',
    nextRun: bj.next_run_at ? new Date(bj.next_run_at).toLocaleString() : 'Managed by Scheduler',
    createdAt: bj.created_at ? new Date(bj.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: 'Distributed Webhook',
    timeoutSeconds: 10,
    maxRetries: bj.retries ?? 3,
    timezone: 'Asia/Kolkata',
    executionCount: 0,
    successRate: 0,
  };
}

function mapBackendToExecutionLog(be: BackendExecution): ExecutionLog {
  const startedAt = be.created_at ? new Date(be.created_at).toISOString().replace('T', ' ').substring(0, 19) : new Date().toISOString().replace('T', ' ').substring(0, 19);
  return {
    id: String(be.id),
    jobId: String(be.job_id),
    jobName: be.job_name || `Job #${be.job_id}`,
    startedAt: startedAt,
    finishedAt: startedAt,
    duration: `${be.response_time_ms ?? 0}ms`,
    status: be.status === 'success' ? 'success' : 'failed',
    exitCode: be.response_code ?? (be.status === 'success' ? 200 : 500),
    command: `${be.method || 'GET'} ${be.url || ''}`,
    logs: [
      `[${startedAt}] ${be.status.toUpperCase()} HTTP ${be.response_code ?? 0} (Latency: ${be.response_time_ms ?? 0}ms)`,
      be.response_body ? `Response: ${be.response_body}` : '',
      be.error_message ? `Error: ${be.error_message}` : ''
    ].filter(Boolean)
  };
}

export const CronProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cronJobs, setCronJobs] = useState<CronJob[]>([]);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>(INITIAL_EXECUTION_LOGS);
  const [systemServices] = useState<SystemService[]>(INITIAL_SYSTEM_STATUS);
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [selectedJobForDrawer, setSelectedJobForDrawer] = useState<CronJob | null>(null);
  const [selectedLogForDrawer, setSelectedLogForDrawer] = useState<ExecutionLog | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const refreshExecutions = async () => {
    try {
      const backendExecs = await fetchExecutions();
      setExecutionLogs(backendExecs.map(mapBackendToExecutionLog));
    } catch (err: any) {
      console.error('Failed to load executions from API:', err);
    }
  };

  const refreshJobs = async () => {
    try {
      const backendJobs = await fetchJobs();
      setCronJobs(backendJobs.map(mapBackendToCronJob));
      await refreshExecutions();
    } catch (err: any) {
      console.error('Failed to load jobs from API:', err);
    }
  };

  useEffect(() => {
    refreshJobs();
    refreshExecutions();

    fetchMeUser()
      .then((data) => {
        if (data && data.user) {
          setUser((prev) => ({
            ...prev,
            name: data.user.username || data.user.name || 'Developer',
            email: data.user.email || 'user@cronmaster.dev',
          }));
        }
      })
      .catch(() => {
        // Unauthenticated or fallback
      });
  }, []);

  const addCronJob = async (jobData: any) => {
    try {
      const res = await createJob({
        name: jobData.name,
        url: jobData.webhookUrl || jobData.command || 'https://httpbin.org/get',
        method: jobData.method || 'GET',
        cron_expression: jobData.schedule || '* * * * *',
        payload: jobData.payload || {},
        retries: jobData.maxRetries || 3,
      });
      await refreshJobs();
      const msg = res?.message || `Cron job "${jobData.name}" created successfully!`;
      showToast(msg, 'success');
    } catch (err: any) {
      showToast(err.message || 'Error creating cron job', 'error');
    }
  };

  const updateCronJob = async (id: string, jobData: Partial<CronJob>) => {
    try {
      const res = await updateJob(id, {
        name: jobData.name,
        url: jobData.webhookUrl || jobData.command,
        method: jobData.method,
        payload: jobData.payload,
        cron_expression: jobData.schedule,
        status: jobData.status,
      });
      await refreshJobs();
      const msg = res?.message || 'Cron job updated successfully!';
      showToast(msg, 'info');
    } catch (err: any) {
      showToast(err.message || 'Error updating job', 'error');
    }
  };

  const deleteCronJob = async (id: string) => {
    try {
      const target = cronJobs.find(j => j.id === id);
      const res = await deleteJob(id);
      await refreshJobs();
      if (selectedJobForDrawer?.id === id) {
        setSelectedJobForDrawer(null);
      }
      const msg = res?.message || `Deleted cron job "${target?.name || id}"`;
      showToast(msg, 'info');
    } catch (err: any) {
      showToast(err.message || 'Error deleting job', 'error');
    }
  };

  const toggleJobStatus = async (id: string) => {
    const target = cronJobs.find(j => j.id === id);
    if (!target) return;
    const nextStatus = target.status === 'paused' || target.status === 'disabled' ? 'active' : 'paused';
    await updateCronJob(id, { status: nextStatus });
  };

  const runJobNow = async (id: string) => {
    const target = cronJobs.find(j => j.id === id);
    if (!target) return;

    showToast(`Triggering execution for "${target.name}"...`, 'info');

    try {
      const result = await triggerJobRun(id);
      await refreshExecutions();
      const exec = result.data;
      const isOk = exec?.status === 'success';
      showToast(`Run for "${target.name}" completed with status ${exec?.response_code || (isOk ? 200 : 500)}`, isOk ? 'success' : 'error');
    } catch (err: any) {
      showToast(err.message || `Failed to run "${target.name}"`, 'error');
      await refreshExecutions();
    }
  };

  const updateUserProfile = (profileData: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...profileData }));
    showToast('Profile settings saved successfully!', 'success');
  };

  return (
    <CronContext.Provider value={{
      cronJobs,
      executionLogs,
      systemServices,
      user,
      searchModalOpen,
      setSearchModalOpen,
      selectedJobForDrawer,
      setSelectedJobForDrawer,
      selectedLogForDrawer,
      setSelectedLogForDrawer,
      toasts,
      showToast,
      removeToast,
      addCronJob,
      updateCronJob,
      deleteCronJob,
      toggleJobStatus,
      runJobNow,
      refreshJobs,
      refreshExecutions,
      updateUserProfile
    }}>
      {children}
    </CronContext.Provider>
  );
};

export const useCron = (): CronContextType => {
  const context = useContext(CronContext);
  if (!context) {
    throw new Error('useCron must be used within a CronProvider');
  }
  return context;
};
