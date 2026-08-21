export type CronStatus = 'active' | 'running' | 'paused' | 'failed' | 'disabled';

export type ExecutionStatus = 'success' | 'failed' | 'running' | 'pending';

export interface CronJob {
  id: string;
  name: string;
  description: string;
  schedule: string; // e.g. "0 0 * * *"
  humanSchedule: string; // e.g. "Every day at midnight"
  commandType: 'command' | 'webhook';
  command: string;
  webhookUrl?: string;
  status: CronStatus;
  lastRun?: string;
  lastRunStatus?: ExecutionStatus;
  nextRun: string;
  createdAt: string;
  category?: string;
  timeoutSeconds: number;
  maxRetries: number;
  timezone: string;
  executionCount: number;
  successRate: number;
}

export interface ExecutionLog {
  id: string;
  jobId: string;
  jobName: string;
  startedAt: string;
  finishedAt?: string;
  duration: string;
  status: ExecutionStatus;
  exitCode: number;
  command: string;
  logs: string[];
}

export interface SystemService {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  latency: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar: string;
  phone: string;
  timezone: string;
  twoFactorEnabled: boolean;
  joinedDate: string;
}
