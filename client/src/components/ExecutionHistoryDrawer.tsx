import React from 'react';
import { X, Copy, Terminal } from 'lucide-react';
import { useCron } from '../context/CronContext';
import { StatusBadge } from './StatusBadge';

export const ExecutionHistoryDrawer: React.FC = () => {
  const { selectedLogForDrawer, setSelectedLogForDrawer, showToast } = useCron();

  if (!selectedLogForDrawer) return null;

  const log = selectedLogForDrawer;

  const handleCopyLogs = () => {
    const text = log.logs.join('\n');
    navigator.clipboard.writeText(text);
    showToast('Logs copied to clipboard', 'info');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/40 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  Execution Output
                </h2>
                <p className="text-xs font-mono text-slate-400">
                  {log.id} • {log.jobName}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedLogForDrawer(null)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Details Bar */}
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-800/30 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400">Status:</span>
              <div className="mt-1">
                <StatusBadge status={log.status} />
              </div>
            </div>
            <div>
              <span className="text-slate-400">Duration:</span>
              <div className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                {log.duration}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Started At:</span>
              <div className="mt-1 font-mono text-slate-700 dark:text-slate-300 text-[11px]">
                {log.startedAt}
              </div>
            </div>
            <div>
              <span className="text-slate-400">Exit Code:</span>
              <div className="mt-1 font-mono">
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  log.exitCode === 0
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : log.exitCode === -1
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                }`}>
                  {log.exitCode}
                </span>
              </div>
            </div>
          </div>

          {/* Log Window */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Terminal Logs
                </span>
                <button
                  onClick={handleCopyLogs}
                  className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                >
                  <Copy className="w-3 h-3" />
                  Copy Logs
                </button>
              </div>

              {/* Monospace Terminal Frame */}
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs text-slate-200 space-y-1.5 overflow-x-auto shadow-inner leading-relaxed">
                {log.logs.map((line, idx) => {
                  let textClass = 'text-slate-300';
                  if (line.includes('ERROR') || line.includes('FATAL')) textClass = 'text-rose-400 font-semibold';
                  if (line.includes('WARN')) textClass = 'text-amber-300';
                  if (line.includes('SUCCESS')) textClass = 'text-emerald-400 font-semibold';
                  if (line.includes('IN_PROGRESS')) textClass = 'text-blue-400';

                  return (
                    <div key={idx} className="flex items-start gap-3 hover:bg-slate-900/60 px-1 py-0.5 rounded">
                      <span className="text-slate-600 select-none text-[10px] w-5 text-right shrink-0 pt-0.5">
                        {idx + 1}
                      </span>
                      <span className={`break-all ${textClass}`}>
                        {line}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Target Command */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Executed Command
              </span>
              <div className="mt-1 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono text-slate-800 dark:text-slate-200 break-all">
                {log.command}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-right">
            <button
              onClick={() => setSelectedLogForDrawer(null)}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            >
              Close Log Viewer
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
