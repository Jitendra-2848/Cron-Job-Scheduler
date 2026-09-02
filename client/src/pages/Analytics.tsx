import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  Clock, 
  Server, 
  Globe, 
  Zap, 
  CheckCircle2, 
  Activity, 
  RefreshCw,
  Cpu,
  FileCheck2,
  Bell
} from 'lucide-react';
import { useCron } from '../context/CronContext';
import { fetchMetrics, type BackendMetrics } from '../services/api';
import { GanttChart } from '../components/GanttChart';
import { requestNotificationPermission } from '../utils/notifications';
import toast from 'react-hot-toast';

export const AnalyticsPage: React.FC = () => {
  const { cronJobs, executionLogs, runJobNow, refreshExecutions } = useCron();
  const [metricsData, setMetricsData] = useState<BackendMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notifGranted, setNotifGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMetrics();
      setMetricsData(data);
      await refreshExecutions();
    } catch (err) {
      console.error('Failed to fetch backend metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) {
      toast.success('Desktop failure alerts enabled!');
    } else {
      toast.error('Notification permission denied');
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // Calculate execution timing statistics
  const totalExecutions = executionLogs.length;
  const successfulExecutions = executionLogs.filter(l => l.status === 'success').length;
  const failedExecutions = executionLogs.filter(l => l.status === 'failed').length;
  // If 0 executions logged, success rate is 0% (not misleading 100%)
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 0;

  // Status code breakdown
  const success2xx = executionLogs.filter(l => l.exitCode >= 200 && l.exitCode < 300).length;
  const error4xx = executionLogs.filter(l => l.exitCode >= 400 && l.exitCode < 500).length;
  const error5xx = executionLogs.filter(l => l.exitCode >= 500 || l.exitCode === -1 || (l.status === 'failed' && l.exitCode < 400)).length;

  // Extract durations (ms)
  const durations = executionLogs
    .map(l => parseInt(l.duration.replace('ms', '')))
    .filter(d => !isNaN(d));

  const avgDuration = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;
  const minDuration = durations.length > 0 ? Math.min(...durations) : 0;
  const maxDuration = durations.length > 0 ? Math.max(...durations) : 0;

  // Endpoint distribution (where jobs run)
  const endpointMap: Record<string, number> = {};
  cronJobs.forEach(job => {
    try {
      const url = job.webhookUrl || job.command;
      const hostname = new URL(url.replace(/^(GET|POST|PUT|DELETE)\s+/, '')).hostname || 'localhost';
      endpointMap[hostname] = (endpointMap[hostname] || 0) + 1;
    } catch {
      endpointMap['Internal Worker'] = (endpointMap['Internal Worker'] || 0) + 1;
    }
  });

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-emerald-500" />
            Full Execution Analytics & Diagnostics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time execution telemetry, status code distributions, latency percentiles, and interactive Gantt charts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {!notifGranted && (
            <button
              onClick={enableNotifications}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-xs transition-colors border border-amber-500/20 cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Failure Push Alerts</span>
            </button>
          )}

          <button
            onClick={loadMetrics}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Telemetry
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Latency</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {avgDuration} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Min: {minDuration}ms &bull; Max: {maxDuration}ms
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Queue Depth Load</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {metricsData?.metrics?.waiting_queue_depth ?? 0} <span className="text-xs font-normal text-slate-400">waiting</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Active concurrency: {metricsData?.metrics?.active_concurrency_load ?? 0}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Success Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {successRate}%
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {successfulExecutions} succeeded &bull; {failedExecutions} failed ({totalExecutions} total)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Worker Pool</span>
            <Server className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Active <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Operational</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            BullMQ + PostgreSQL Engine
          </p>
        </div>
      </div>

      {/* Interactive Gantt Chart Timeline & Full Report Inspector */}
      <GanttChart
        cronJobs={cronJobs}
        executionLogs={executionLogs}
        runJobNow={runJobNow}
      />

      {/* Response Status Code Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <FileCheck2 className="w-5 h-5 text-emerald-500" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              HTTP Response Code Breakdown
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Distribution of response codes from target endpoints across all runs
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">2xx Success Responses</span>
            <div className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-400">{success2xx}</div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-500">200 OK, 201 Created, 204 No Content</p>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-1">
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">4xx Client Errors</span>
            <div className="text-2xl font-extrabold text-amber-700 dark:text-amber-400">{error4xx}</div>
            <p className="text-[11px] text-amber-600 dark:text-amber-500">400 Bad Request, 401 Unauthorized, 404 Not Found</p>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-1">
            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">5xx Server Outages / Timeouts</span>
            <div className="text-2xl font-extrabold text-rose-700 dark:text-rose-400">{error5xx}</div>
            <p className="text-[11px] text-rose-600 dark:text-rose-500">500 Internal Error, 502 Bad Gateway, 504 Timeout</p>
          </div>
        </div>
      </div>

      {/* Execution Locations & Duration Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Where Cron Jobs Run
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Execution target domains and host locations
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Cron Worker Engine
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Primary Task Worker Pool &bull; Webhook Dispatcher
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Active Engine
              </span>
            </div>

            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Target Webhook Hosts
              </h4>
              {Object.keys(endpointMap).length > 0 ? (
                Object.entries(endpointMap).map(([host, count]) => (
                  <div key={host} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-2.5 font-mono text-slate-800 dark:text-slate-200 font-semibold">
                      <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                      <span>{host}</span>
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {count} {count === 1 ? 'job target' : 'job targets'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No external webhooks configured yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Execution Time Analysis */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Execution Time Analysis
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Response latency per cron job execution
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Per-Job Duration Telemetry
            </h4>

            {cronJobs.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                {cronJobs.map(job => {
                  const jobLogs = executionLogs.filter(l => l.jobId === job.id || l.jobName === job.name);
                  const lastLog = jobLogs[0];
                  const durationStr = lastLog ? lastLog.duration : '0ms';

                  return (
                    <div key={job.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {job.name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-400 block mt-0.5">
                          {job.schedule} &bull; {job.webhookUrl || job.command}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-mono font-bold border border-emerald-200 dark:border-emerald-800/60 inline-block">
                          {durationStr}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          Last duration
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs italic">
                No cron jobs available for duration analysis. Create a job to view run times.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsPage;
