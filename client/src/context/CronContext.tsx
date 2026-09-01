import React, { createContext, useContext, useEffect, useState } from 'react';
import type { CronJob, ExecutionLog, SystemService, UserProfile, CronStatus } from '../types/cron';
import { fetchJobs, createJob, updateJob, deleteJob, fetchMeUser, type BackendJob } from '../services/api';

const INITIAL_EXECUTION_LOGS: ExecutionLog[] = [];

const INITIAL_SYSTEM_STATUS: SystemService[] = [
  { name: 'Scheduler Engine', status: 'operational', latency: '4ms' },
  { name: 'API Gateway', status: 'operational', latency: '12ms' },
  { name: 'Primary PostgreSQL Database', status: 'operational', latency: '2ms' },
  { name: 'BullMQ Worker Cluster', status: 'operational', latency: '18ms' }
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
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const CronContext = createContext<CronContextType | undefined>(undefined);

function mapBackendToCronJob(bj: BackendJob): CronJob {
  return {
    id: String(bj.id),
    name: bj.name,
    description: `HTTP Endpoint: ${bj.method || 'GET'} ${bj.url}`,
    schedule: bj.cron_expression,
    humanSchedule: bj.cron_expression,
    commandType: 'webhook',
    command: `${bj.method || 'GET'} ${bj.url}`,
    webhookUrl: bj.url,
    status: (bj.status as CronStatus) || 'active',
    nextRun: 'Managed by Scheduler',
    createdAt: bj.created_at ? new Date(bj.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: 'Distributed Webhook',
    timeoutSeconds: 10,
    maxRetries: bj.retries ?? 3,
    timezone: 'Asia/Kolkata',
    executionCount: 1,
    successRate: 100,
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

  const refreshJobs = async () => {
    try {
      const backendJobs = await fetchJobs();
      setCronJobs(backendJobs.map(mapBackendToCronJob));
    } catch (err: any) {
      console.error('Failed to load jobs from API:', err);
    }
  };

  useEffect(() => {
    refreshJobs();

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
      await createJob({
        name: jobData.name,
        url: jobData.webhookUrl || jobData.command || 'https://httpbin.org/get',
        method: jobData.method || 'GET',
        cron_expression: jobData.schedule || '* * * * *',
        payload: jobData.payload || {},
        retries: jobData.maxRetries || 3,
      });
      await refreshJobs();
      showToast(`Cron job "${jobData.name}" created successfully on backend!`, 'success');
    } catch (err: any) {
      showToast(`Error creating job: ${err.message}`, 'error');
    }
  };

  const updateCronJob = async (id: string, jobData: Partial<CronJob>) => {
    try {
      await updateJob(id, {
        name: jobData.name,
        url: jobData.webhookUrl || jobData.command,
        cron_expression: jobData.schedule,
        status: jobData.status,
      });
      await refreshJobs();
      showToast('Cron job updated successfully', 'info');
    } catch (err: any) {
      showToast(`Error updating job: ${err.message}`, 'error');
    }
  };

  const deleteCronJob = async (id: string) => {
    try {
      const target = cronJobs.find(j => j.id === id);
      await deleteJob(id);
      await refreshJobs();
      if (selectedJobForDrawer?.id === id) {
        setSelectedJobForDrawer(null);
      }
      showToast(`Deleted cron job "${target?.name || id}"`, 'info');
    } catch (err: any) {
      showToast(`Error deleting job: ${err.message}`, 'error');
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

    showToast(`Triggering manual run for "${target.name}"...`, 'info');

    const startTime = Date.now();
    const newExecId = `exec-${Date.now()}`;
    const targetUrl = target.webhookUrl || target.command.replace(/^(GET|POST|PUT|DELETE)\s+/, '');

    const newLog: ExecutionLog = {
      id: newExecId,
      jobId: target.id,
      jobName: target.name,
      startedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      duration: 'Running...',
      status: 'running',
      exitCode: -1,
      command: targetUrl,
      logs: [
        `[${new Date().toLocaleTimeString()}] INFO Manual execution triggered by user`,
        `[${new Date().toLocaleTimeString()}] INFO Dispatching request to ${targetUrl}...`
      ]
    };

    setExecutionLogs(prev => [newLog, ...prev]);

    try {
      const res = await fetch(targetUrl);
      const durationMs = Date.now() - startTime;
      const statusText = res.ok ? 'success' : 'failed';

      setExecutionLogs(prev => prev.map(log => {
        if (log.id === newExecId) {
          return {
            ...log,
            finishedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            duration: `${durationMs}ms`,
            status: statusText,
            exitCode: res.status,
            logs: [
              ...log.logs,
              `[${new Date().toLocaleTimeString()}] INFO HTTP ${res.status} ${res.statusText}`,
              `[${new Date().toLocaleTimeString()}] ${res.ok ? 'SUCCESS' : 'ERROR'} Execution finished.`
            ]
          };
        }
        return log;
      }));

      showToast(`Manual run for "${target.name}" finished with status ${res.status}`, res.ok ? 'success' : 'error');
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      setExecutionLogs(prev => prev.map(log => {
        if (log.id === newExecId) {
          return {
            ...log,
            finishedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            duration: `${durationMs}ms`,
            status: 'failed',
            exitCode: 500,
            logs: [
              ...log.logs,
              `[${new Date().toLocaleTimeString()}] ERROR ${err.message}`
            ]
          };
        }
        return log;
      }));

      showToast(`Manual run for "${target.name}" failed: ${err.message}`, 'error');
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
