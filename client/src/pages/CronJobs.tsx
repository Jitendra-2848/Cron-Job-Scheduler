import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PlusCircle, Search, Filter, RotateCw, ArrowUpDown } from 'lucide-react';
import { useCron } from '../context/CronContext';
import { CronJobTable } from '../components/CronJobTable';
import { Pagination } from '../components/Pagination';
import { EmptyState } from '../components/EmptyState';

const CronJobs: React.FC = () => {
  const navigate = useNavigate();
  const { cronJobs, showToast } = useCron();
  const [searchParams] = useSearchParams();

  const initialFilter = searchParams.get('filter') || 'all';
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilter);
  const [sortBy, setSortBy] = useState<'name' | 'lastRun' | 'nextRun'>('name');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Cron jobs re-synced', 'info');
    }, 600);
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

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage) || 1;
  const paginatedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Cron Jobs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage and monitor all your scheduled tasks in one centralized place.
          </p>
        </div>

        <button
          onClick={() => navigate('/create-cron')}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Create Cron
        </button>
      </div>

      {/* Toolbar Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Filter cron jobs..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center gap-2.5 w-full md:w-auto overflow-x-auto">
          
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="running">Running</option>
              <option value="paused">Paused</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Sort Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="name">Sort by Name</option>
              <option value="lastRun">Sort by Last Run</option>
              <option value="nextRun">Sort by Next Run</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
            title="Refresh jobs list"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

        </div>

      </div>

      {/* Main Table or Empty State */}
      {paginatedJobs.length > 0 ? (
        <div>
          <CronJobTable jobs={paginatedJobs} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredJobs.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      ) : (
        <EmptyState
          title="No cron jobs found"
          description={query ? `No cron jobs matching "${query}". Try clearing filters.` : "Create your first scheduled task to get started."}
          actionText="Create Cron Job"
        />
      )}

    </div>
  );
};

export default CronJobs;