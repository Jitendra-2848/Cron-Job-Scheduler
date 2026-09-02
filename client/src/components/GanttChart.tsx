import React, { useState } from 'react';
import type { CronJob, ExecutionLog } from '../types/cron';
import { Play, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';

interface GanttChartProps {
  cronJobs: CronJob[];
  executionLogs: ExecutionLog[];
  runJobNow?: (id: string) => Promise<void>;
}

export const GanttChart: React.FC<GanttChartProps> = ({
  cronJobs,
  executionLogs,
  runJobNow
}) => {
  const [hoveredLog, setHoveredLog] = useState<ExecutionLog | null>(null);

  // Parse logs or create visual representation for active jobs
  const jobRows = cronJobs.map((job) => {
    const logs = executionLogs.filter(l => l.jobId === job.id || l.jobName === job.name);
    return {
      job,
      logs
    };
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Job Execution Gantt Timeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Horizontal execution duration and latency alignment per job
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold select-none">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block shadow-xs" />
            <span>Success</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <span className="w-3 h-3 rounded bg-rose-500 inline-block shadow-xs" />
            <span>Failed</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <span className="w-3 h-3 rounded bg-indigo-500 animate-pulse inline-block shadow-xs" />
            <span>Running</span>
          </div>
        </div>
      </div>

      {/* Gantt Matrix Table */}
      {jobRows.length > 0 ? (
        <div className="space-y-4">
          {/* Time Ruler Axis */}
          <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="w-48 sm:w-64 shrink-0 px-2">Job Name & Schedule</div>
            <div className="flex-1 flex justify-between px-4 font-mono">
              <span>0ms</span>
              <span>100ms</span>
              <span>250ms</span>
              <span>500ms</span>
              <span>1000ms+</span>
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {jobRows.map(({ job, logs }) => (
              <div key={job.id} className="py-3 flex flex-col sm:flex-row sm:items-center gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors">
                {/* Left Job Info */}
                <div className="w-48 sm:w-64 shrink-0 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[160px]">
                      {job.name}
                    </span>
                    {runJobNow && (
                      <button
                        onClick={() => runJobNow(job.id)}
                        className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                        title="Trigger Execution"
                      >
                        <Play className="w-3 h-3 fill-current" />
                      </button>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 block truncate">
                    {job.schedule} &bull; {job.webhookUrl || job.command}
                  </span>
                </div>

                {/* Right Timeline Bar Container */}
                <div className="flex-1 relative h-9 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center px-2 overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20 dark:opacity-10 px-4">
                    <div className="w-px h-full bg-slate-400" />
                    <div className="w-px h-full bg-slate-400" />
                    <div className="w-px h-full bg-slate-400" />
                    <div className="w-px h-full bg-slate-400" />
                  </div>

                  {logs.length > 0 ? (
                    logs.slice(0, 3).map((log, idx) => {
                      const durationMs = parseInt(log.duration.replace('ms', '')) || 80;
                      // Calculate width percentage relative to 500ms max scale
                      const widthPct = Math.min(100, Math.max(12, (durationMs / 500) * 100));
                      const isSuccess = log.status === 'success';

                      return (
                        <div
                          key={log.id || idx}
                          onMouseEnter={() => setHoveredLog(log)}
                          onMouseLeave={() => setHoveredLog(null)}
                          style={{ width: `${widthPct}%` }}
                          className={`h-6 rounded-lg shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-between px-2 text-[10px] font-mono font-bold text-white relative z-10 ${
                            isSuccess
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400'
                              : log.status === 'running'
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse'
                              : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400'
                          }`}
                        >
                          <span className="truncate">{log.duration}</span>
                          {isSuccess ? <CheckCircle2 className="w-3 h-3 shrink-0" /> : <AlertTriangle className="w-3 h-3 shrink-0" />}
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full text-center text-[11px] text-slate-400 italic font-mono">
                      No executions logged yet. Run job to populate Gantt timeline.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Hover Tooltip Details */}
          {hoveredLog && (
            <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-1.5 shadow-xl animate-fade-in border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">{hoveredLog.jobName}</span>
                <span className="font-mono text-[10px] text-slate-400">{hoveredLog.startedAt}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-300 text-[11px]">
                <span>Duration: <strong className="text-white">{hoveredLog.duration}</strong></span>
                <span>Status: <strong className={hoveredLog.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>{hoveredLog.status}</strong></span>
                <span>Target: <code className="text-slate-300 font-mono">{hoveredLog.command}</code></span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-8 text-center border border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs italic">
          No cron jobs available to render Gantt timeline graph.
        </div>
      )}
    </div>
  );
};
