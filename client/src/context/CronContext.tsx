import React, { createContext, useContext, useState } from 'react';
import type { CronJob, ExecutionLog, SystemService, UserProfile } from '../types/cron';

const INITIAL_CRON_JOBS: CronJob[] = [
  {
    id: 'cron-1',
    name: 'Database Backup',
    description: 'Automated nightly dump of PostgreSQL primary database to AWS S3 bucket',
    schedule: '0 0 * * *',
    humanSchedule: 'Every day at midnight (00:00 AM)',
    commandType: 'command',
    command: 'pg_dump -U admin -h db.prod.internal -d app_db | gzip > /backups/db_$(date +%Y%m%d).sql.gz && aws s3 cp /backups/ s3://cronmaster-backups/ --recursive',
    status: 'active',
    lastRun: 'Today, 12:00 AM',
    lastRunStatus: 'success',
    nextRun: 'Tomorrow, 12:00 AM',
    createdAt: '2026-01-15',
    category: 'Infrastructure',
    timeoutSeconds: 3600,
    maxRetries: 3,
    timezone: 'UTC',
    executionCount: 218,
    successRate: 99.5
  },
  {
    id: 'cron-2',
    name: 'Send Daily Reports',
    description: 'Generate and email PDF analytics reports to executive team and stakeholders',
    schedule: '0 9 * * 1-5',
    humanSchedule: 'Monday through Friday at 09:00 AM',
    commandType: 'command',
    command: 'node scripts/generate_daily_report.js --env=production --email-all',
    status: 'active',
    lastRun: 'Today, 09:00 AM',
    lastRunStatus: 'success',
    nextRun: 'Tomorrow, 09:00 AM',
    createdAt: '2026-02-01',
    category: 'Analytics',
    timeoutSeconds: 600,
    maxRetries: 2,
    timezone: 'America/New_York',
    executionCount: 142,
    successRate: 100
  },
  {
    id: 'cron-3',
    name: 'Cleanup Temp Files',
    description: 'Remove cached images, temporary upload directories, and old session locks',
    schedule: '*/30 * * * *',
    humanSchedule: 'Every 30 minutes',
    commandType: 'command',
    command: 'find /tmp/uploads -type f -mmin +60 -delete && redis-cli eval "return redis.call(\'del\', unpack(redis.call(\'keys\', \'temp:*\')))" 0',
    status: 'running',
    lastRun: '15 mins ago',
    lastRunStatus: 'running',
    nextRun: 'In 15 minutes',
    createdAt: '2026-02-10',
    category: 'Maintenance',
    timeoutSeconds: 300,
    maxRetries: 1,
    timezone: 'UTC',
    executionCount: 1420,
    successRate: 98.8
  },
  {
    id: 'cron-4',
    name: 'API Health Check',
    description: 'Ping edge microservices, measure response times, and alert PagerDuty on error',
    schedule: '*/5 * * * *',
    humanSchedule: 'Every 5 minutes',
    commandType: 'webhook',
    webhookUrl: 'https://api.cronmaster.dev/v1/health/ping-all-services',
    command: 'curl -X POST https://api.cronmaster.dev/v1/health/ping-all-services -H "Authorization: Bearer secret_token"',
    status: 'failed',
    lastRun: '3 mins ago',
    lastRunStatus: 'failed',
    nextRun: 'In 2 minutes',
    createdAt: '2026-01-20',
    category: 'Monitoring',
    timeoutSeconds: 60,
    maxRetries: 3,
    timezone: 'UTC',
    executionCount: 8940,
    successRate: 94.2
  },
  {
    id: 'cron-5',
    name: 'User Data Synchronization',
    description: 'Sync Stripe customer subscription statuses into local PostgreSQL database',
    schedule: '0 */2 * * *',
    humanSchedule: 'Every 2 hours',
    commandType: 'command',
    command: 'python -m workers.stripe_sync --batch-size=500',
    status: 'active',
    lastRun: '1 hour ago',
    lastRunStatus: 'success',
    nextRun: 'In 1 hour',
    createdAt: '2026-03-01',
    category: 'Integrations',
    timeoutSeconds: 1200,
    maxRetries: 2,
    timezone: 'UTC',
    executionCount: 380,
    successRate: 99.2
  },
  {
    id: 'cron-6',
    name: 'Elasticsearch Index Optimization',
    description: 'Trigger force-merge and index rollup on historical log indices',
    schedule: '0 3 * * 0',
    humanSchedule: 'Every Sunday at 03:00 AM',
    commandType: 'command',
    command: 'curl -X POST "localhost:9200/*-2026.*/_forcemerge?max_num_segments=1"',
    status: 'paused',
    lastRun: '5 days ago',
    lastRunStatus: 'success',
    nextRun: 'Sunday, 03:00 AM',
    createdAt: '2026-02-15',
    category: 'Database',
    timeoutSeconds: 7200,
    maxRetries: 1,
    timezone: 'UTC',
    executionCount: 24,
    successRate: 100
  }
];

const INITIAL_EXECUTION_LOGS: ExecutionLog[] = [
  {
    id: 'exec-1001',
    jobId: 'cron-1',
    jobName: 'Database Backup',
    startedAt: '2026-08-21 00:00:01',
    finishedAt: '2026-08-21 00:04:12',
    duration: '4m 11s',
    status: 'success',
    exitCode: 0,
    command: 'pg_dump -U admin -h db.prod.internal -d app_db | gzip > /backups/db_20260821.sql.gz',
    logs: [
      '[00:00:01] INFO  Starting Database Backup process...',
      '[00:00:02] INFO  Connecting to PostgreSQL primary db.prod.internal:5432',
      '[00:00:03] INFO  Locking tables for consistent snapshot',
      '[00:01:45] INFO  Exported 14,290,102 rows across 84 tables',
      '[00:02:10] INFO  Compressing archive using gzip (Compression ratio: 4.8x)',
      '[00:03:30] INFO  Uploading /backups/db_20260821.sql.gz (1.4 GB) to s3://cronmaster-backups/',
      '[00:04:11] INFO  S3 Upload completed successfully. ETag: "a4f89d38c11e7"',
      '[00:04:12] SUCCESS Job finished with exit code 0.'
    ]
  },
  {
    id: 'exec-1002',
    jobId: 'cron-2',
    jobName: 'Send Daily Reports',
    startedAt: '2026-08-21 09:00:00',
    finishedAt: '2026-08-21 09:01:23',
    duration: '1m 23s',
    status: 'success',
    exitCode: 0,
    command: 'node scripts/generate_daily_report.js --env=production',
    logs: [
      '[09:00:00] INFO  Fetching daily metrics from ClickHouse DB...',
      '[09:00:15] INFO  Processed 1,492,000 telemetry events',
      '[09:00:45] INFO  Rendering PDF templates (Executive Summary & Conversion Funnel)',
      '[09:01:10] INFO  Sending email via SendGrid API to 24 recipients',
      '[09:01:23] SUCCESS All report emails queued successfully.'
    ]
  },
  {
    id: 'exec-1003',
    jobId: 'cron-4',
    jobName: 'API Health Check',
    startedAt: '2026-08-21 14:20:00',
    finishedAt: '2026-08-21 14:20:15',
    duration: '15s',
    status: 'failed',
    exitCode: 1,
    command: 'curl -X POST https://api.cronmaster.dev/v1/health/ping-all-services',
    logs: [
      '[14:20:00] INFO  Initiating edge HTTP health ping...',
      '[14:20:02] WARN  Service auth-service response delay > 2500ms',
      '[14:20:10] ERROR Service billing-service returned HTTP 503 Service Unavailable',
      '[14:20:14] ERROR Health check assertion failed: 1/12 microservices un-healthy',
      '[14:20:15] FATAL Triggered alert on PagerDuty (Incident #PD-8492). Exit code 1.'
    ]
  },
  {
    id: 'exec-1004',
    jobId: 'cron-3',
    jobName: 'Cleanup Temp Files',
    startedAt: '2026-08-21 14:30:00',
    duration: 'Running (45s)',
    status: 'running',
    exitCode: -1,
    command: 'find /tmp/uploads -type f -mmin +60 -delete',
    logs: [
      '[14:30:00] INFO  Scanning directory /tmp/uploads...',
      '[14:30:15] INFO  Found 4,120 stale files matching pattern',
      '[14:30:45] IN_PROGRESS Deleting orphaned media cache chunks...'
    ]
  },
  {
    id: 'exec-1005',
    jobId: 'cron-5',
    jobName: 'User Data Synchronization',
    startedAt: '2026-08-21 13:00:00',
    finishedAt: '2026-08-21 13:02:10',
    duration: '2m 10s',
    status: 'success',
    exitCode: 0,
    command: 'python -m workers.stripe_sync --batch-size=500',
    logs: [
      '[13:00:00] INFO  Starting Stripe customer sync batch...',
      '[13:01:00] INFO  Processed batch 1/4 (500 customers)',
      '[13:02:00] INFO  Processed batch 2/4 (348 customers)',
      '[13:02:10] SUCCESS Synced 848 customer records without errors.'
    ]
  }
];

const INITIAL_SYSTEM_STATUS: SystemService[] = [
  { name: 'Scheduler Engine', status: 'operational', latency: '4ms' },
  { name: 'API Gateway', status: 'operational', latency: '12ms' },
  { name: 'Primary Database', status: 'operational', latency: '2ms' },
  { name: 'Worker Cluster', status: 'operational', latency: '18ms' }
];

const INITIAL_USER: UserProfile = {
  name: 'Jitendra Kumar',
  email: 'jitendra@cronmaster.dev',
  role: 'DevOps Lead / Admin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  phone: '+1 (555) 234-5678',
  timezone: 'America/New_York (UTC-5)',
  twoFactorEnabled: true,
  joinedDate: 'January 2025'
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
  addCronJob: (job: Omit<CronJob, 'id' | 'createdAt' | 'executionCount' | 'successRate'>) => void;
  updateCronJob: (id: string, jobData: Partial<CronJob>) => void;
  deleteCronJob: (id: string) => void;
  toggleJobStatus: (id: string) => void;
  runJobNow: (id: string) => void;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
}

const CronContext = createContext<CronContextType | undefined>(undefined);

export const CronProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cronJobs, setCronJobs] = useState<CronJob[]>(INITIAL_CRON_JOBS);
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

  const addCronJob = (jobData: Omit<CronJob, 'id' | 'createdAt' | 'executionCount' | 'successRate'>) => {
    const newJob: CronJob = {
      ...jobData,
      id: `cron-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      executionCount: 0,
      successRate: 100
    };
    setCronJobs(prev => [newJob, ...prev]);
    showToast(`Cron job "${newJob.name}" created successfully!`, 'success');
  };

  const updateCronJob = (id: string, jobData: Partial<CronJob>) => {
    setCronJobs(prev => prev.map(job => job.id === id ? { ...job, ...jobData } : job));
    showToast('Cron job updated successfully', 'info');
  };

  const deleteCronJob = (id: string) => {
    const target = cronJobs.find(j => j.id === id);
    setCronJobs(prev => prev.filter(job => job.id !== id));
    if (selectedJobForDrawer?.id === id) {
      setSelectedJobForDrawer(null);
    }
    showToast(`Deleted cron job "${target?.name || id}"`, 'info');
  };

  const toggleJobStatus = (id: string) => {
    setCronJobs(prev => prev.map(job => {
      if (job.id === id) {
        const nextStatus = job.status === 'paused' || job.status === 'disabled' ? 'active' : 'paused';
        showToast(`Job "${job.name}" is now ${nextStatus}`, 'info');
        return { ...job, status: nextStatus };
      }
      return job;
    }));
  };

  const runJobNow = (id: string) => {
    const target = cronJobs.find(j => j.id === id);
    if (!target) return;

    showToast(`Triggering manual run for "${target.name}"...`, 'info');

    // Update job status to running temporarily
    setCronJobs(prev => prev.map(job => {
      if (job.id === id) {
        return { ...job, status: 'running', lastRunStatus: 'running', lastRun: 'Just now' };
      }
      return job;
    }));

    // Add running log entry
    const newExecId = `exec-${Date.now()}`;
    const newLog: ExecutionLog = {
      id: newExecId,
      jobId: target.id,
      jobName: target.name,
      startedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      duration: 'Running...',
      status: 'running',
      exitCode: -1,
      command: target.command || target.webhookUrl || '',
      logs: [
        `[${new Date().toLocaleTimeString()}] INFO  Manual execution triggered by user Jitendra`,
        `[${new Date().toLocaleTimeString()}] INFO  Dispatching command: ${target.command || target.webhookUrl}`,
        `[${new Date().toLocaleTimeString()}] IN_PROGRESS Executing task workload...`
      ]
    };

    setExecutionLogs(prev => [newLog, ...prev]);

    // Simulate completion after 3 seconds
    setTimeout(() => {
      setCronJobs(prev => prev.map(job => {
        if (job.id === id) {
          return {
            ...job,
            status: 'active',
            lastRunStatus: 'success',
            lastRun: 'Just now',
            executionCount: job.executionCount + 1
          };
        }
        return job;
      }));

      setExecutionLogs(prev => prev.map(log => {
        if (log.id === newExecId) {
          return {
            ...log,
            finishedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
            duration: '3.2s',
            status: 'success',
            exitCode: 0,
            logs: [
              ...log.logs,
              `[${new Date().toLocaleTimeString()}] INFO  Task finished execution successfully.`,
              `[${new Date().toLocaleTimeString()}] SUCCESS Execution completed with exit code 0.`
            ]
          };
        }
        return log;
      }));

      showToast(`Manual run for "${target.name}" completed successfully!`, 'success');
    }, 3000);
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
