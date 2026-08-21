import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ArrowRight, Terminal } from 'lucide-react';
import { useCron } from '../context/CronContext';
import { StatusBadge } from './StatusBadge';

export const RecentJobs: React.FC = () => {
  const { cronJobs, setSelectedJobForDrawer, runJobNow } = useCron();
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Recent Cron Jobs
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor your latest scheduled job configurations and statuses
          </p>
        </div>

        <button
          onClick={() => navigate('/cron-jobs')}
          className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
        >
          View all
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-6 py-3.5">Job Name</th>
              <th className="px-6 py-3.5">Schedule</th>
              <th className="px-6 py-3.5">Next Run</th>
              <th className="px-6 py-3.5">Last Run</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {cronJobs.slice(0, 5).map((job) => (
              <tr
                key={job.id}
                onClick={() => setSelectedJobForDrawer(job)}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {job.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[200px]">
                        {job.description}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    {job.schedule}
                  </span>
                </td>

                <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                  {job.nextRun}
                </td>

                <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                  {job.lastRun || 'Never'}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={job.status} />
                </td>

                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => runJobNow(job.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                    title="Run Now"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
