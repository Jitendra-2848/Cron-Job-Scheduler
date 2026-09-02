import React, { useState } from 'react';
import type { CronJob, ExecutionLog } from '../types/cron';
import { 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  X, 
  Copy, 
  Check, 
  Clock, 
  Globe, 
  FileText,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('all');
  const [inspectedLog, setInspectedLog] = useState<ExecutionLog | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter jobs based on dropdown selection
  const filteredJobs = selectedJobFilter === 'all' 
    ? cronJobs 
    : cronJobs.filter(j => j.id === selectedJobFilter);

  const jobRows = filteredJobs.map((job) => {
    const logs = executionLogs.filter(l => l.jobId === job.id || l.jobName === job.name);
    return {
      job,
      logs
    };
  });

  const handleCopyResponseBody = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Response copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-500" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Execution Gantt Timeline & Report
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click any execution bar to view the full response report and payload diagnostics
          </p>
        </div>

        {/* Controls: Filter by Specific Job & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Specific Job Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedJobFilter}
              onChange={(e) => setSelectedJobFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Cron Jobs</option>
              {cronJobs.map(job => (
                <option key={job.id} value={job.id}>{job.name}</option>
              ))}
            </select>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs font-semibold select-none border-l border-slate-200 dark:border-slate-800 pl-3">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block shadow-xs" />
              <span>Success</span>
            </div>
            <div className="flex items-center gap-1 text-rose-600 dark:text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500 inline-block shadow-xs" />
              <span>Failed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Matrix Table */}
      {jobRows.length > 0 ? (
        <div className="space-y-4">
          {/* Time Ruler Axis */}
          <div className="flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="w-48 sm:w-64 shrink-0 px-2">Job & Target</div>
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
                <div className="flex-1 relative h-10 bg-slate-100/70 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center px-2 overflow-hidden gap-1.5">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex justify-between pointer-events-none opacity-20 dark:opacity-10 px-4">
                    <div className="w-px h-full bg-slate-400" />
                    <div className="w-px h-full bg-slate-400" />
                    <div className="w-px h-full bg-slate-400" />
                    <div className="w-px h-full bg-slate-400" />
                  </div>

                  {logs.length > 0 ? (
                    logs.slice(0, 5).map((log, idx) => {
                      const durationMs = parseInt(log.duration.replace('ms', '')) || 80;
                      const widthPct = Math.min(100, Math.max(14, (durationMs / 500) * 100));
                      const isSuccess = log.status === 'success';
                      const isInspected = inspectedLog?.id === log.id;

                      return (
                        <button
                          key={log.id || idx}
                          type="button"
                          onClick={() => setInspectedLog(log)}
                          style={{ width: `${widthPct}%` }}
                          className={`h-7 rounded-lg shadow-sm transition-all duration-200 cursor-pointer flex items-center justify-between px-2 text-[10px] font-mono font-bold text-white relative z-10 ${
                            isInspected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-[1.02]' : ''
                          } ${
                            isSuccess
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400'
                              : log.status === 'running'
                              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse'
                              : 'bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-400 hover:to-pink-400'
                          }`}
                        >
                          <span className="truncate">{log.duration}</span>
                          {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                        </button>
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

          {/* Persistent Full Report Panel (Opens on Click) */}
          {inspectedLog && (
            <div className="p-5 rounded-2xl bg-slate-900 text-white text-xs space-y-4 shadow-2xl animate-fade-in border border-slate-700/80 relative">
              {/* Close Button */}
              <button
                onClick={() => setInspectedLog(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Close Report"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h4 className="font-bold text-sm text-white">
                  Full Execution Diagnostic Report &mdash; {inspectedLog.jobName}
                </h4>
              </div>

              {/* Grid Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Status Code</span>
                  <div className="flex items-center gap-1.5 font-bold font-mono">
                    <span className={inspectedLog.status === 'success' ? 'text-emerald-400' : 'text-rose-400'}>
                      {inspectedLog.exitCode > 0 ? `${inspectedLog.exitCode} ${inspectedLog.status === 'success' ? 'OK' : 'Error'}` : inspectedLog.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Duration</span>
                  <div className="flex items-center gap-1.5 font-bold font-mono text-white">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{inspectedLog.duration}</span>
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Timestamp</span>
                  <div className="font-mono text-[11px] text-slate-300">
                    {inspectedLog.startedAt}
                  </div>
                </div>

                <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Target Endpoint</span>
                  <div className="flex items-center gap-1 font-mono text-[11px] text-slate-300 truncate" title={inspectedLog.command}>
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{inspectedLog.command}</span>
                  </div>
                </div>
              </div>

              {/* Execution Logs / Full Response Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Response Payload & Output Logs
                  </span>
                  <button
                    onClick={() => handleCopyResponseBody(inspectedLog.logs.join('\n'))}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-slate-300 transition-colors"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied' : 'Copy Output'}</span>
                  </button>
                </div>

                <div className="bg-slate-950 rounded-xl border border-slate-800 p-3.5 font-mono text-[11px] text-slate-200 space-y-1.5 overflow-x-auto leading-relaxed max-h-56 shadow-inner">
                  {inspectedLog.logs.map((logLine, idx) => (
                    <div key={idx} className="whitespace-pre-wrap break-all">
                      {logLine}
                    </div>
                  ))}
                </div>
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
