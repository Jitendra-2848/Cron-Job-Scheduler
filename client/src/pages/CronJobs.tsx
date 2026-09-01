import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  RotateCw, 
  ArrowLeft, 
  Play, 
  Pause,
  Clock
} from 'lucide-react';
import { useCron } from '../context/CronContext';
import { StatusBadge } from '../components/StatusBadge';

type DetailTab = 'overview' | 'executions' | 'configuration';

export const CronJobs: React.FC = () => {
  const navigate = useNavigate();
  const { cronJobs, runJobNow, toggleJobStatus, deleteCronJob, executionLogs, showToast } = useCron();

  // Selected job for detailed view (instead of side drawer)
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'nextRun'>('name');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedJob = useMemo(() => {
    return cronJobs.find((j) => j.id === activeJobId) || null;
  }, [cronJobs, activeJobId]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Cron jobs refreshed', 'info');
    }, 500);
  };

  const filteredJobs = useMemo(() => {
    return cronJobs
      .filter((job) => {
        const matchesQuery =
          job.name.toLowerCase().includes(query.toLowerCase()) ||
          job.command.toLowerCase().includes(query.toLowerCase()) ||
          job.schedule.includes(query);

        if (statusFilter === 'all') return matchesQuery;
        return matchesQuery && job.status.toLowerCase() === statusFilter.toLowerCase();
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [cronJobs, query, statusFilter, sortBy]);

  const jobLogs = useMemo(() => {
    if (!selectedJob) return [];
    return executionLogs.filter(log => log.jobId === selectedJob.id || log.jobName === selectedJob.name);
  }, [executionLogs, selectedJob]);

  // If a job is selected, show the MongoDB Atlas style detail view!
  if (selectedJob) {
    const job = selectedJob;

    return (
      <div className="space-y-6 animate-fade-in pb-12 max-w-5xl">
        
        {/* Back navigation */}
        <button
          onClick={() => setActiveJobId(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#0A8F63] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Cron Jobs
        </button>

        {/* Detail Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {job.name}
              </h1>
              <StatusBadge status={job.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {job.description || 'No description provided.'}
            </p>
          </div>

          {/* Action buttons (MongoDB style) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => runJobNow(job.id)}
              className="px-3.5 py-1.5 rounded bg-[#0A8F63] hover:bg-[#08744F] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Now
            </button>
            <button
              onClick={() => toggleJobStatus(job.id)}
              className="px-3.5 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              <Pause className="w-3.5 h-3.5" />
              {job.status === 'paused' ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={() => {
                deleteCronJob(job.id);
                setActiveJobId(null);
              }}
              className="px-3 py-1.5 rounded border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100/50 transition-colors"
            >
              Delete
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 text-xs">
          {(['overview', 'executions', 'configuration'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setDetailTab(tab)}
              className={`pb-2.5 font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                detailTab === tab
                  ? 'border-[#0A8F63] text-[#0A8F63]'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-250'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-6 text-xs transition-colors">
          
          {detailTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Cron Schedule
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded font-bold text-emerald-700 dark:text-emerald-400">
                      {job.schedule}
                    </span>
                    <span className="text-slate-600 dark:text-slate-350 font-medium">
                      ({job.humanSchedule})
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    HTTP Target Endpoint
                  </span>
                  <span className="font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded block mt-1 text-slate-700 dark:text-slate-300 break-all font-semibold">
                    {job.commandType === 'webhook' ? `POST ${job.webhookUrl}` : `RUN COMMAND ${job.command}`}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Next Execution
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-1">
                      In 18 minutes
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Last Execution
                    </span>
                    <span className="text-slate-650 dark:text-slate-355 block mt-1">
                      42 minutes ago
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-850 pt-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Success Rate
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                      {job.successRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Total Executions
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-1">
                      {job.executionCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {detailTab === 'executions' && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Job execution logs
              </h4>
              {jobLogs.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-2">Time</th>
                        <th className="px-4 py-2">Duration</th>
                        <th className="px-4 py-2">Status</th>
                        <th className="px-4 py-2 text-right">Exit Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                      {jobLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 text-slate-500">{log.startedAt}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">{log.duration}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              log.status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                            }`}>
                              ● {log.status}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-800 dark:text-slate-200">{log.exitCode}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-slate-400 italic">No execution logs logged for this job yet.</p>
              )}
            </div>
          )}

          {detailTab === 'configuration' && (
            <div className="space-y-4 max-w-md">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <span className="text-slate-500 font-medium">Timezone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-250">{job.timezone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <span className="text-slate-500 font-medium">Execution Timeout</span>
                <span className="font-semibold text-slate-800 dark:text-slate-250">{job.timeoutSeconds} seconds</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <span className="text-slate-500 font-medium">Retry Attempts</span>
                <span className="font-semibold text-slate-800 dark:text-slate-250">{job.maxRetries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Webhook Headers</span>
                <span className="font-mono text-slate-400 italic">None configured</span>
              </div>
            </div>
          )}

        </div>

      </div>
    );
  }

  // Listing page view
  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl">
      
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Cron Jobs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create, monitor, and manage your scheduled backend tasks.
          </p>
        </div>

        <button
          onClick={() => navigate('/create-cron')}
          className="flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-[#0A8F63] hover:bg-[#08744F] text-white font-semibold text-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          Create Cron Job
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-600 transition-colors"
          />
        </div>

        {/* Filter options */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto justify-end">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-650 dark:text-slate-350 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-650 dark:text-slate-350 focus:outline-hidden cursor-pointer"
            >
              <option value="name">Sort: Name</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850/60 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            title="Refresh list"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Clean Table Listing (No card wrapper around rows) */}
      {filteredJobs.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-bold uppercase tracking-wider text-slate-550 dark:text-slate-400 select-none">
                  <th className="px-6 py-3">NAME</th>
                  <th className="px-6 py-3">SCHEDULE</th>
                  <th className="px-6 py-3">NEXT RUN</th>
                  <th className="px-6 py-3">STATUS</th>
                  <th className="px-6 py-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {filteredJobs.map((job) => (
                  <tr
                    key={job.id}
                    onClick={() => {
                      setActiveJobId(job.id);
                      setDetailTab('overview');
                    }}
                    className="hover:bg-slate-50/75 dark:hover:bg-slate-850/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-slate-900 dark:text-white block hover:text-[#0A8F63]">
                        {job.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal truncate max-w-[240px] block">
                        {job.description}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="font-mono text-[11px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-250 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-350">
                        {job.schedule}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-slate-550 dark:text-slate-400 font-semibold">
                      {job.nextRun || 'Managed by Scheduler'}
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          job.status === 'active' ? 'bg-[#16A34A]' :
                          job.status === 'running' ? 'bg-[#6366F1] animate-pulse' :
                          job.status === 'paused' ? 'bg-slate-400' : 'bg-[#DC2626]'
                        }`} />
                        <span className="capitalize text-slate-700 dark:text-slate-300 font-bold">
                          {job.status}
                        </span>
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => runJobNow(job.id)}
                          className="p-1 rounded text-slate-450 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-50 transition-colors"
                          title="Run Now"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => toggleJobStatus(job.id)}
                          className="p-1 rounded text-slate-455 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-55 transition-colors"
                          title="Pause / Resume"
                        >
                          <Pause className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-10 text-center space-y-3.5">
          <Clock className="w-8 h-8 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No cron jobs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Create your first scheduled task to start automating your backend execution workload.
          </p>
          <button
            onClick={() => navigate('/create-cron')}
            className="px-4 py-2 rounded bg-[#0A8F63] hover:bg-[#08744F] text-white text-xs font-semibold shadow-2xs"
          >
            + Create Cron Job
          </button>
        </div>
      )}

    </div>
  );
};

export default CronJobs;