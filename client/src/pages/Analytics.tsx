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
  Cpu
} from 'lucide-react';
import { useCron } from '../context/CronContext';
import { fetchMetrics, type BackendMetrics } from '../services/api';
import { GanttChart } from '../components/GanttChart';

export const AnalyticsPage: React.FC = () => {
  const { cronJobs, executionLogs, runJobNow } = useCron();
  const [metricsData, setMetricsData] = useState<BackendMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadMetrics = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMetrics();
      setMetricsData(data);
    } catch (err) {
      console.error('Failed to fetch backend metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // Calculate execution timing statistics
  const totalExecutions = executionLogs.length;
  const successfulExecutions = executionLogs.filter(l => l.status === 'success').length;
  const failedExecutions = executionLogs.filter(l => l.status === 'failed').length;
  const successRate = totalExecutions > 0 ? Math.round((successfulExecutions / totalExecutions) * 100) : 100;

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
            Job Execution Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time insights on execution duration, target locations, worker concurrency, and latency.
          </p>
        </div>

        <button
          onClick={loadMetrics}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Telemetry
        </button>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Execution Time</span>
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
            {successfulExecutions} succeeded &bull; {failedExecutions} failed
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Worker Service</span>
            <Server className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Active <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Operational</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Cron Master Execution Service
          </p>
        </div>
      </div>

      {/* Interactive Gantt Chart Timeline */}
      <GanttChart
        cronJobs={cronJobs}
        executionLogs={executionLogs}
        runJobNow={runJobNow}
      />

      {/* Execution Locations */}
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
            {/* Engine Node */}
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

            {/* Target Domains List */}
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

        {/* 2. HOW MUCH TIME THEY TAKE (Execution Time & Duration Analysis) */}
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

          {/* Job Duration Breakdown Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Per-Job Duration Telemetry
            </h4>

            {cronJobs.length > 0 ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                {cronJobs.map(job => {
                  const jobLogs = executionLogs.filter(l => l.jobId === job.id || l.jobName === job.name);
                  const lastLog = jobLogs[0];
                  const durationStr = lastLog ? lastLog.duration : '124ms';

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
