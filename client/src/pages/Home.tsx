import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, Clock, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { ExecutionChart } from '../components/ExecutionChart';
import { RecentJobs } from '../components/RecentJobs';
import { QuickActions } from '../components/QuickActions';
import { SystemStatus } from '../components/SystemStatus';
import { useCron } from '../context/CronContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { cronJobs } = useCron();

  const totalJobs = cronJobs.length;
  const activeJobs = cronJobs.filter(j => j.status === 'active' || j.status === 'running').length;
  const failedJobs = cronJobs.filter(j => j.status === 'failed').length;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Good morning, Jitendra 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Here's what's happening with your scheduled jobs today.
          </p>
        </div>

        <button
          onClick={() => navigate('/create-cron')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Create Cron Job
        </button>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Cron Jobs"
          value={totalJobs.toString()}
          trend="12%"
          trendUp={true}
          subtitle="from last month"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Active Jobs"
          value={activeJobs.toString()}
          trend="8%"
          trendUp={true}
          subtitle="from last month"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Successful Runs"
          value="1,284"
          subtitle="98.6% success rate"
          icon={<Sparkles className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Failed Runs"
          value={failedJobs > 0 ? failedJobs.toString() : "17"}
          trend="4.2%"
          trendUp={false}
          subtitle="from last month"
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/40"
          iconColor="text-rose-600 dark:text-rose-400"
        />
      </div>

      {/* Execution Chart Section */}
      <ExecutionChart />

      {/* Recent Cron Jobs Table */}
      <RecentJobs />

      {/* Quick Actions Grid */}
      <QuickActions />

      {/* Infrastructure System Health Card */}
      <SystemStatus />

    </div>
  );
};

export default Home;