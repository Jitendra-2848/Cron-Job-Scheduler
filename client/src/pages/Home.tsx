import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Terminal, RefreshCw } from 'lucide-react';
import { useCron } from '../context/CronContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { cronJobs, executionLogs, setSelectedJobForDrawer } = useCron();
  
  const [syncTime, setSyncTime] = useState(12);

  // Auto-increment sync timer for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTime((prev) => (prev >= 59 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalJobs = cronJobs.length;
  const activeJobs = cronJobs.filter(j => j.status === 'active' || j.status === 'running').length;
  const runningJobs = cronJobs.filter(j => j.status === 'running').length;
  const failedJobs = cronJobs.filter(j => j.status === 'failed').length;

  const totalExecs = executionLogs.length;
  const successfulExecs = executionLogs.filter(l => l.status === 'success').length;
  const failedExecs = executionLogs.filter(l => l.status === 'failed').length;
  const successRate = totalExecs > 0 ? Math.round((successfulExecs / totalExecs) * 100) : 100;

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Home Overview
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
            <span className="text-slate-350 dark:text-slate-750">|</span>
            <button 
              onClick={() => setSyncTime(0)}
              className="flex items-center gap-1 hover:text-emerald-600 font-semibold cursor-pointer"
            >
              Last synced {syncTime}s ago
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/create-cron')}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create Cron Job
        </button>
      </div>

      {/* 2. Metrics Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-slate-800 grid grid-cols-2 sm:grid-cols-4 select-none shadow-xs">
        <div className="p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Cron Jobs
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {totalJobs}
          </span>
        </div>

        <div className="p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Active Jobs
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {activeJobs}
          </span>
        </div>

        <div className="p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Running
          </span>
          <span className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {runningJobs}
          </span>
        </div>

        <div className="p-4 flex flex-col justify-center">
          <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Failed
          </span>
          <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {failedJobs}
          </span>
        </div>
      </div>

      {/* 3. Double-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Cron Jobs */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              RECENT CRON JOBS
            </h3>
            <button 
              onClick={() => navigate('/cron-jobs')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              View all &rarr;
            </button>
          </div>

          {cronJobs.length > 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden shadow-xs">
              {cronJobs.slice(0, 5).map((job) => {
                const jobLogs = executionLogs.filter(l => l.jobId === job.id || l.jobName === job.name);
                const lastLog = jobLogs[0];
                const lastRunText = lastLog ? lastLog.startedAt.split(' ')[1] || 'Just now' : 'No runs yet';

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobForDrawer(job)}
                    className="px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block hover:text-emerald-600">
                          {job.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 mt-0.5 block">
                          {job.schedule}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Status</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                          {job.status}
                        </span>
                      </div>

                      <div className="text-right hidden sm:block">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Last run</span>
                        <span className="font-semibold text-slate-500 dark:text-slate-400">
                          {lastRunText}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${
                            job.status === 'active' ? 'bg-emerald-500' :
                            job.status === 'running' ? 'bg-indigo-500 animate-pulse' :
                            job.status === 'paused' ? 'bg-slate-400' : 'bg-rose-500'
                          }`} />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400 text-xs space-y-3">
              <p>No cron jobs created yet.</p>
              <button
                onClick={() => navigate('/create-cron')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                + Create First Cron Job
              </button>
            </div>
          )}
        </div>

        {/* Right Column: System Status & Execution Summary */}
        <div className="space-y-6">
          
          {/* System Status Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              SYSTEM STATUS
            </h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 text-xs shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Scheduler Engine</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Worker Service</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Primary Database</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">API Gateway</span>
                <span className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Operational
                </span>
              </div>
            </div>
          </div>

          {/* Execution Summary Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              EXECUTION SUMMARY
            </h3>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs shadow-xs">
              <span className="text-[10px] font-bold text-slate-400 block mb-3 uppercase tracking-wider">
                REAL-TIME TELEMETRY OVERVIEW
              </span>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Successful Executions</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{successfulExecs}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Failed Executions</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{failedExecs}</span>
                </div>
                <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2.5">
                  <span className="text-slate-600 dark:text-slate-400 font-semibold">Overall Success Rate</span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{successRate}%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default Home;