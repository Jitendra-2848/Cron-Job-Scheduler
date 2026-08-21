import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Play, 
  History, 
  ArrowRight,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { useCron } from '../context/CronContext';
import { StatusBadge } from '../components/StatusBadge';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { cronJobs, runJobNow, setSelectedJobForDrawer } = useCron();
  
  const [syncTime, setSyncTime] = useState(12);

  // Auto increment sync timer for realism
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncTime((prev) => (prev >= 59 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalJobs = cronJobs.length;
  const activeJobs = cronJobs.filter(j => j.status === 'active' || j.status === 'running').length;
  const failedJobs = cronJobs.filter(j => j.status === 'failed').length;

  const handleManualSync = () => {
    setSyncTime(0);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-12">
      
      {/* 1. Hero / Dashboard Welcome Intro with Earthy colors */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-stone-200 dark:border-stone-850 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight">
            Good morning, Jitendra 👋
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-stone-500 dark:text-stone-400">
            <span className="font-semibold text-stone-700 dark:text-stone-300">Your automation is running smoothly today.</span>
            <span className="hidden sm:inline text-stone-300 dark:text-stone-700">|</span>
            <div className="flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 animate-pulse" />
              <span>All systems operational</span>
            </div>
            <span className="hidden sm:inline text-stone-300 dark:text-stone-700">|</span>
            <button 
              onClick={handleManualSync} 
              className="flex items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors font-semibold"
            >
              Last synced {syncTime}s ago
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        <button
          onClick={() => navigate('/create-cron')}
          className="flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-stone-50 dark:text-stone-950 font-bold text-xs shadow-[0_1px_2px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 active:translate-y-0 active:scale-98 transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create Cron Job
        </button>
      </div>

      {/* 2. Visual Hierarchy Statistics Panel (Non-identical Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* STAT 1: TOTAL CRON JOBS */}
        <div className="bg-stone-50/50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Total Cron Jobs
            </p>
            <div className="p-1.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-500">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              {totalJobs < 10 ? `0${totalJobs}` : totalJobs}
            </span>
            <span className="text-[11px] text-stone-500 dark:text-stone-400 font-semibold">
              4 active • 2 paused
            </span>
          </div>
        </div>

        {/* STAT 2: ACTIVE JOBS (With desaturated green Progress Bar) */}
        <div className="bg-stone-50/50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Active Jobs
            </p>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
              67%
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight block">
              {activeJobs < 10 ? `0${activeJobs}` : activeJobs}
            </span>
            {/* Minimal Earthy Progress Bar */}
            <div className="mt-4 w-full bg-stone-200 dark:bg-stone-800 rounded-full h-1">
              <div className="bg-emerald-600 dark:bg-emerald-500 h-1 rounded-full" style={{ width: '67%' }} />
            </div>
          </div>
        </div>

        {/* STAT 3: SUCCESSFUL RUNS (Earthy text-based styling) */}
        <div className="bg-stone-50/50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Successful Runs
            </p>
            <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              1,284
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-1">
              98.6% success rate
            </span>
          </div>
        </div>

        {/* STAT 4: FAILED RUNS (With Terracotta Alarm Indicator) */}
        <div className="bg-stone-50/50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800/80 p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400">
              Failed Runs
            </p>
            <div className="p-1.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
              {failedJobs < 10 ? `0${failedJobs}` : failedJobs}
            </span>
            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold font-mono">
              ↓ 4.2% from last month
            </span>
          </div>
        </div>

      </div>

      {/* 3. Compact Quick Actions row (Flat Matte style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-y border-stone-200/60 dark:border-stone-800/60 py-4 text-xs select-none">
        <div className="font-bold text-stone-400 dark:text-stone-500 tracking-widest uppercase">
          QUICK ACTIONS
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => navigate('/create-cron')}
            className="px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/40 font-bold text-stone-700 dark:text-stone-300 hover:border-emerald-600/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center gap-1.5 shadow-2xs hover:-translate-y-0.5 active:scale-98"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
            Create Job
          </button>
          <button 
            onClick={() => navigate('/cron-jobs')}
            className="px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/40 font-bold text-stone-700 dark:text-stone-300 hover:border-emerald-600/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center gap-1.5 shadow-2xs hover:-translate-y-0.5 active:scale-98"
          >
            <Play className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 fill-current" />
            Run Job
          </button>
          <button 
            onClick={() => navigate('/history')}
            className="px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/40 font-bold text-stone-700 dark:text-stone-300 hover:border-emerald-600/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center gap-1.5 shadow-2xs hover:-translate-y-0.5 active:scale-98"
          >
            <History className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500" />
            View History
          </button>
          <button 
            onClick={() => navigate('/cron-jobs?filter=failed')}
            className="px-3.5 py-2 rounded-lg border border-stone-200 dark:border-stone-850 bg-stone-50/50 dark:bg-stone-900/40 font-bold text-stone-700 dark:text-stone-300 hover:border-rose-600/50 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all flex items-center gap-1.5 shadow-2xs hover:-translate-y-0.5 active:scale-98"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-500" />
            Failed Jobs
          </button>
        </div>
      </div>

      {/* 4. Large Double-Column Centerpiece */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Live Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-stone-50/50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800/80 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-stone-200/60 dark:border-stone-800/60 pb-3 mb-4">
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-widest">
                LIVE ACTIVITY FEED
              </h3>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 dark:bg-rose-500 animate-ping" />
                LIVE
              </span>
            </div>

            {/* Log Feed Entries (Matte Earthy layout) */}
            <div className="space-y-4 text-xs leading-normal">
              
              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-bold text-stone-800 dark:text-stone-200">
                    Database Backup completed
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
                    <span>12:42:08</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">+2.4s</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-bold text-stone-800 dark:text-stone-200">
                    API Health Check completed
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
                    <span>12:40:21</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">+820ms</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0 animate-pulse" />
                <div>
                  <div className="font-bold text-stone-800 dark:text-stone-200">
                    Cleanup Temp Files started
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    12:30:00
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-500 mt-1.5 shrink-0" />
                <div>
                  <div className="font-bold text-stone-800 dark:text-stone-200">
                    Daily Report completed
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-2">
                    <span>12:00:00</span>
                    <span className="font-mono text-emerald-700 dark:text-emerald-400 font-bold">+1.2s</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Column: System Status inline indicator */}
        <div className="lg:col-span-1">
          <div className="bg-stone-50/50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800/80 p-5 shadow-xs h-full flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-widest border-b border-stone-200/60 dark:border-stone-800/60 pb-3">
                SYSTEM HEALTH
              </h3>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Scheduler</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400">API gateway</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Databases</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Operational</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500 dark:text-stone-400">Workers</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-bold">Operational</span>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-stone-200/60 dark:border-stone-800/60 mt-6 text-[10px] text-stone-400 text-center select-none font-bold uppercase tracking-widest">
              ALL SYSTEMS ONLINE
            </div>
          </div>
        </div>

      </div>

      {/* 5. Recent Cron Jobs List (Sleek rows, subtle lines) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-widest">
              Recent Cron Jobs
            </h3>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Monitor your latest scheduled tasks config and next runs
            </p>
          </div>
          <button
            onClick={() => navigate('/cron-jobs')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline transition-all"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* List of Rows */}
        <div className="bg-stone-50/50 dark:bg-stone-900/60 rounded-xl border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-2xs divide-y divide-stone-200/60 dark:divide-stone-800/60 text-xs">
          {cronJobs.slice(0, 4).map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJobForDrawer(job)}
              className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-stone-100/50 dark:hover:bg-stone-850/50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded bg-stone-100 dark:bg-stone-800 text-stone-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors shrink-0">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 dark:text-white group-hover:text-emerald-750 dark:group-hover:text-emerald-400 transition-colors">
                    {job.name}
                  </h4>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    {job.humanSchedule}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-6">
                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-bold uppercase tracking-wider">Next run</span>
                  <span className="font-bold text-stone-700 dark:text-stone-200">
                    {job.name.includes('Backup') ? '1h 24m' : job.name.includes('Health') ? '2m' : job.name.includes('Cleanup') ? '12m' : 'Tomorrow'}
                  </span>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 block font-bold uppercase tracking-wider">Last run</span>
                  <span className="text-stone-500 dark:text-stone-400 font-medium">
                    {job.name.includes('Backup') ? '2h ago' : job.name.includes('Health') ? '3m ago' : job.name.includes('Cleanup') ? '18m ago' : 'Today'}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <StatusBadge status={job.status} />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      runJobNow(job.id);
                    }}
                    className="p-1.5 rounded text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors shrink-0"
                    title="Trigger Manual Run"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Home;