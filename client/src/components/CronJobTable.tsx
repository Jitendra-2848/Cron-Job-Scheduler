import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  Pause, 
  Trash2, 
  MoreVertical, 
  Terminal, 
  History as HistoryIcon,
  Edit,
  CheckSquare,
  Square
} from 'lucide-react';
import type { CronJob } from '../types/cron';
import { useCron } from '../context/CronContext';
import { StatusBadge } from './StatusBadge';

interface CronJobTableProps {
  jobs: CronJob[];
}

export const CronJobTable: React.FC<CronJobTableProps> = ({ jobs }) => {
  const { setSelectedJobForDrawer, runJobNow, toggleJobStatus, deleteCronJob } = useCron();
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelectAll = () => {
    if (selectedIds.length === jobs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(jobs.map(j => j.id));
    }
  };

  const handleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      
      {/* Bulk Action Header Bar (when selected) */}
      {selectedIds.length > 0 && (
        <div className="px-4 sm:px-6 py-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-800 dark:text-emerald-300">
            {selectedIds.length} job(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                selectedIds.forEach(id => runJobNow(id));
                setSelectedIds([]);
              }}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
            >
              Run Selected
            </button>
            <button
              onClick={() => {
                selectedIds.forEach(id => deleteCronJob(id));
                setSelectedIds([]);
              }}
              className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium transition-colors"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3.5 w-10 text-center">
                <button onClick={handleSelectAll} className="text-slate-400 hover:text-slate-600">
                  {selectedIds.length > 0 && selectedIds.length === jobs.length ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Schedule</th>
              <th className="px-6 py-3.5">Command</th>
              <th className="px-6 py-3.5">Last Run</th>
              <th className="px-6 py-3.5">Next Run</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {jobs.map((job) => {
              const isSelected = selectedIds.includes(job.id);
              const isMenuOpen = activeMenuId === job.id;

              return (
                <tr
                  key={job.id}
                  onClick={() => setSelectedJobForDrawer(job)}
                  className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group ${
                    isSelected ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''
                  }`}
                >
                  <td className="px-4 py-4 text-center" onClick={(e) => handleSelectOne(job.id, e)}>
                    <button className="text-slate-400 hover:text-slate-600">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-950/50 dark:group-hover:text-emerald-400 transition-colors shrink-0">
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

                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-mono text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 w-fit">
                        {job.schedule}
                      </span>
                      <span className="text-[11px] text-slate-400 mt-1 truncate max-w-[180px]">
                        {job.humanSchedule}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded truncate max-w-[180px] block border border-slate-200 dark:border-slate-700">
                      {job.command || job.webhookUrl}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                    {job.lastRun || 'Never'}
                  </td>

                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-medium">
                    {job.nextRun}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={job.status} />
                  </td>

                  <td className="px-6 py-4 text-right relative" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => runJobNow(job.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                        title="Run Now"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>

                      <button
                        onClick={() => toggleJobStatus(job.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={job.status === 'paused' ? 'Resume' : 'Pause'}
                      >
                        <Pause className="w-4 h-4" />
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => setActiveMenuId(isMenuOpen ? null : job.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 py-1 text-left animate-fade-in">
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                setSelectedJobForDrawer(job);
                              }}
                              className="w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-400" />
                              View & Edit Details
                            </button>
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                navigate('/history');
                              }}
                              className="w-full px-3 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                              <HistoryIcon className="w-3.5 h-3.5 text-slate-400" />
                              View History
                            </button>
                            <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                            <button
                              onClick={() => {
                                setActiveMenuId(null);
                                deleteCronJob(job.id);
                              }}
                              className="w-full px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete Cron Job
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelectedJobForDrawer(job)}
            className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Terminal className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs text-slate-900 dark:text-white">
                  {job.name}
                </span>
              </div>
              <StatusBadge status={job.status} size="sm" />
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1 text-[11px]">
              <div className="flex justify-between font-mono">
                <span className="text-slate-400">Schedule:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{job.schedule}</span>
              </div>
              <div className="flex justify-between font-mono truncate">
                <span className="text-slate-400">Target:</span>
                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[180px]">{job.command || job.webhookUrl}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-400 text-[11px]">
                Next: {job.nextRun}
              </span>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => runJobNow(job.id)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs"
                >
                  <Play className="w-3 h-3 fill-current" />
                  Run Now
                </button>
                <button
                  onClick={() => toggleJobStatus(job.id)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px]"
                >
                  <Pause className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
