import React from 'react';
import { X, Play, Pause, Trash, Copy, Terminal, ArrowUpRight } from 'lucide-react';
import { useCron } from '../context/CronContext';
import { StatusBadge } from './StatusBadge';

export const CronJobDrawer: React.FC = () => {
  const { selectedJobForDrawer, setSelectedJobForDrawer, runJobNow, toggleJobStatus, deleteCronJob, executionLogs, setSelectedLogForDrawer, showToast } = useCron();

  if (!selectedJobForDrawer) return null;

  const job = selectedJobForDrawer;
  const jobLogs = executionLogs.filter(log => log.jobId === job.id || log.jobName === job.name);

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(job.command || job.webhookUrl || '');
    showToast('Command copied to clipboard', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10 w-full sm:w-auto">
        <div className="w-full sm:w-screen sm:max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {job.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <StatusBadge status={job.status} size="sm" />
                  <span className="text-xs text-slate-400">• {job.category || 'General'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedJobForDrawer(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Quick Action Bar */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => runJobNow(job.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Run Now
              </button>

              <button
                onClick={() => toggleJobStatus(job.id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
              >
                <Pause className="w-3.5 h-3.5" />
                {job.status === 'paused' ? 'Resume' : 'Pause'}
              </button>

              <button
                onClick={() => {
                  deleteCronJob(job.id);
                }}
                className="p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                title="Delete Job"
              >
                <Trash className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Description
              </label>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {job.description || 'No description provided.'}
              </p>
            </div>

            {/* Schedule Info */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Cron Expression</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                  {job.schedule}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 font-medium">Human Schedule</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {job.humanSchedule}
                </p>
              </div>
            </div>

            {/* Command / Webhook Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {job.commandType === 'webhook' ? 'Webhook Endpoint' : 'Target Command'}
                </label>
                <button
                  onClick={handleCopyCommand}
                  className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </button>
              </div>
              <div className="p-3 bg-slate-950 text-slate-200 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800 break-all leading-relaxed">
                {job.command || job.webhookUrl}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400">Success Rate</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {job.successRate}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400">Total Runs</span>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {job.executionCount.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400">Last Execution</span>
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
                  {job.lastRun || 'Never'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <span className="text-xs text-slate-400">Next Scheduled Run</span>
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                  {job.nextRun}
                </div>
              </div>
            </div>

            {/* Advanced Metadata */}
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex justify-between">
                <span>Timezone:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{job.timezone}</span>
              </div>
              <div className="flex justify-between">
                <span>Timeout:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{job.timeoutSeconds}s</span>
              </div>
              <div className="flex justify-between">
                <span>Max Retries:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{job.maxRetries}</span>
              </div>
              <div className="flex justify-between">
                <span>Created Date:</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{job.createdAt}</span>
              </div>
            </div>

            {/* Execution History Timeline */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recent Runs
                </h4>
                <span className="text-xs text-slate-400">{jobLogs.length} logged</span>
              </div>

              {jobLogs.length > 0 ? (
                <div className="space-y-2">
                  {jobLogs.slice(0, 5).map(log => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLogForDrawer(log)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <StatusBadge status={log.status} showDot size="sm" />
                        <div>
                          <div className="text-xs font-mono font-medium text-slate-800 dark:text-slate-200">
                            {log.duration}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {log.startedAt}
                          </div>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No execution logs captured yet.</p>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right">
            <button
              onClick={() => setSelectedJobForDrawer(null)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Close Drawer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
