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
  Clock,
  Edit,
  X,
  Save
} from 'lucide-react';
import { useCron } from '../context/CronContext';
import { StatusBadge } from '../components/StatusBadge';
import { parseCronExpression } from '../utils/cronParser';
import type { CronJob, CronStatus } from '../types/cron';

type DetailTab = 'overview' | 'executions' | 'configuration';

export const CronJobs: React.FC = () => {
  const navigate = useNavigate();
  const { cronJobs, runJobNow, toggleJobStatus, deleteCronJob, updateCronJob, executionLogs, showToast, refreshJobs } = useCron();

  // Selected job for detailed view
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<DetailTab>('overview');

  // Edit Job Modal State
  const [editingJob, setEditingJob] = useState<CronJob | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editSchedule, setEditSchedule] = useState('');
  const [editEndpoint, setEditEndpoint] = useState('');
  const [editMethod, setEditMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [editPayloadStr, setEditPayloadStr] = useState('{}');
  const [editStatus, setEditStatus] = useState<CronStatus>('active');
  const [editRetries, setEditRetries] = useState(3);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'nextRun'>('name');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedJob = useMemo(() => {
    return cronJobs.find((j) => j.id === activeJobId) || null;
  }, [cronJobs, activeJobId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshJobs();
    setIsRefreshing(false);
    showToast('Cron jobs refreshed from server', 'info');
  };

  const handleOpenEditModal = (job: CronJob) => {
    setEditingJob(job);
    setEditName(job.name);
    setEditDescription(job.description || '');
    setEditSchedule(job.schedule);
    setEditEndpoint(job.webhookUrl || job.command.replace(/^(GET|POST|PUT|DELETE)\s+/, ''));
    setEditMethod((job.method as any) || 'GET');
    setEditPayloadStr(job.payload ? JSON.stringify(job.payload, null, 2) : '{}');
    setEditStatus(job.status);
    setEditRetries(job.maxRetries || 3);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    if (!editName.trim()) {
      showToast('Job name is required', 'error');
      return;
    }

    let parsedPayload: any = {};
    if (editMethod !== 'GET' && editMethod !== 'DELETE' && editPayloadStr.trim()) {
      try {
        parsedPayload = JSON.parse(editPayloadStr);
      } catch {
        showToast('Invalid JSON in Request Body payload', 'error');
        return;
      }
    }

    setIsSavingEdit(true);
    try {
      await updateCronJob(editingJob.id, {
        name: editName,
        description: editDescription,
        schedule: editSchedule,
        webhookUrl: editEndpoint,
        method: editMethod,
        payload: parsedPayload,
        status: editStatus,
        maxRetries: editRetries,
      });
      setEditingJob(null);
      showToast('Cron job updated successfully!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update job', 'error');
    } finally {
      setIsSavingEdit(false);
    }
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

  // If a job is selected, show detail view
  if (selectedJob) {
    const job = selectedJob;

    return (
      <div className="space-y-6 animate-fade-in pb-12 max-w-5xl">
        
        {/* Back navigation */}
        <button
          onClick={() => setActiveJobId(null)}
          className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
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

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => runJobNow(job.id)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Run Now
            </button>
            <button
              onClick={() => handleOpenEditModal(job)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Job
            </button>
            <button
              onClick={() => toggleJobStatus(job.id)}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              {job.status === 'paused' ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={() => {
                deleteCronJob(job.id);
                setActiveJobId(null);
              }}
              className="px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-100/50 transition-colors cursor-pointer"
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
              className={`pb-2.5 font-bold uppercase tracking-wider transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                detailTab === tab
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Panels */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-xs transition-colors shadow-xs">
          
          {detailTab === 'overview' && (() => {
            const thisJobLogs = executionLogs.filter(l => l.jobId === job.id || l.jobName === job.name);
            const totalThisExecs = thisJobLogs.length;
            const successThisExecs = thisJobLogs.filter(l => l.status === 'success').length;
            const realSuccessRate = totalThisExecs > 0 ? Math.round((successThisExecs / totalThisExecs) * 100) : 0;
            const lastLogThis = thisJobLogs[0];
            const lastExecTime = lastLogThis ? lastLogThis.startedAt : 'Never executed';
            const nextExecTime = job.nextRun || 'In scheduled window';
            const endpointStr = `${job.method || 'GET'} ${job.webhookUrl || job.command.replace(/^(GET|POST|PUT|DELETE)\s+/, '')}`;

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 leading-relaxed">
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      Cron Schedule
                    </span>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-lg font-bold text-emerald-700 dark:text-emerald-400">
                        {job.schedule}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        ({job.humanSchedule})
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                      HTTP Target Endpoint
                    </span>
                    <span className="font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg block mt-1 text-slate-800 dark:text-slate-200 break-all font-semibold">
                      {endpointStr}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Next Execution
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-1 font-mono text-[11px]">
                        {nextExecTime}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Last Execution
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 block mt-1 font-mono text-[11px]">
                        {lastExecTime}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Success Rate
                      </span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block mt-1">
                        {realSuccessRate}%
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                        Total Executions
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 block mt-1">
                        {totalThisExecs}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {detailTab === 'executions' && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Job execution logs
              </h4>
              {jobLogs.length > 0 ? (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="px-4 py-2.5">Time</th>
                        <th className="px-4 py-2.5">Duration</th>
                        <th className="px-4 py-2.5">Status</th>
                        <th className="px-4 py-2.5 text-right">Exit Code</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                      {jobLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{log.startedAt}</td>
                          <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-300">{log.duration}</td>
                          <td className="px-4 py-2.5">
                            <span className={`inline-flex items-center gap-1 font-semibold ${
                              log.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
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
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Timezone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{job.timezone}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Execution Timeout</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{job.timeoutSeconds} seconds</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Retry Attempts</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{job.maxRetries}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Webhook Method</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{job.method || 'GET'}</span>
              </div>
            </div>
          )}

        </div>

        {/* Render Edit Modal if opened */}
        {editingJob && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Cron Job</h3>
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Job Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Endpoint URL *</label>
                  <input
                    type="url"
                    required
                    value={editEndpoint}
                    onChange={(e) => setEditEndpoint(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">HTTP Method</label>
                    <select
                      value={editMethod}
                      onChange={(e) => setEditMethod(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                      <option value="PUT">PUT</option>
                      <option value="DELETE">DELETE</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                    >
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="disabled">Disabled</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cron Expression *</label>
                  <input
                    type="text"
                    required
                    value={editSchedule}
                    onChange={(e) => setEditSchedule(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-1">
                    {parseCronExpression(editSchedule)}
                  </span>
                </div>

                {(editMethod === 'POST' || editMethod === 'PUT') && (
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">JSON Payload Body</label>
                    <textarea
                      rows={4}
                      value={editPayloadStr}
                      onChange={(e) => setEditPayloadStr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-emerald-500"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingJob(null)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEdit}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

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
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0 shadow-xs cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Cron Job
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 text-xs shadow-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search jobs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filter options */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto justify-end">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="active">Active</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
            >
              <option value="name">Sort: Name</option>
            </select>
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0 cursor-pointer"
            title="Refresh list"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

      </div>

      {/* Table Listing */}
      {filteredJobs.length > 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-colors shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider text-slate-400 select-none">
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Schedule</th>
                  <th className="px-6 py-3.5">Next Run</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
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
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-3.5">
                      <span className="font-bold text-slate-900 dark:text-white block hover:text-emerald-600">
                        {job.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal truncate max-w-[240px] block">
                        {job.description}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="font-mono text-[11px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                        {job.schedule}
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-slate-500 dark:text-slate-400 font-semibold font-mono text-[11px]">
                      {job.nextRun || 'Managed by Scheduler'}
                    </td>

                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          job.status === 'active' ? 'bg-emerald-500' :
                          job.status === 'running' ? 'bg-indigo-500 animate-pulse' :
                          job.status === 'paused' ? 'bg-slate-400' : 'bg-rose-500'
                        }`} />
                        <span className="capitalize text-slate-700 dark:text-slate-300 font-bold">
                          {job.status}
                        </span>
                      </span>
                    </td>

                    <td className="px-6 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditModal(job)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Job"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => runJobNow(job.id)}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
                          title="Run Now"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => toggleJobStatus(job.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3.5 shadow-xs">
          <Clock className="w-8 h-8 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">No cron jobs found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Create your first scheduled task to start automating your backend execution workload.
          </p>
          <button
            onClick={() => navigate('/create-cron')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
          >
            + Create Cron Job
          </button>
        </div>
      )}

      {/* Render Edit Modal if opened in list view */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Cron Job</h3>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Job Name *</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Endpoint URL *</label>
                <input
                  type="url"
                  required
                  value={editEndpoint}
                  onChange={(e) => setEditEndpoint(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">HTTP Method</label>
                  <select
                    value={editMethod}
                    onChange={(e) => setEditMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                  >
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">Cron Expression *</label>
                <input
                  type="text"
                  required
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-emerald-500"
                />
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block mt-1">
                  {parseCronExpression(editSchedule)}
                </span>
              </div>

              {(editMethod === 'POST' || editMethod === 'PUT') && (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">JSON Payload Body</label>
                  <textarea
                    rows={4}
                    value={editPayloadStr}
                    onChange={(e) => setEditPayloadStr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-slate-900 dark:text-white text-xs focus:outline-hidden focus:border-emerald-500"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingEdit}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingEdit ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CronJobs;