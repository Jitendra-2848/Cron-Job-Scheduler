import React, { useState } from 'react';
import { History as HistoryIcon, CheckCircle2, XCircle, Clock, Terminal, Search, Filter } from 'lucide-react';
import { useCron } from '../context/CronContext';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';

const HistoryPage: React.FC = () => {
  const { executionLogs, setSelectedLogForDrawer } = useCron();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredLogs = executionLogs.filter((log) => {
    const matchesQuery =
      log.jobName.toLowerCase().includes(query.toLowerCase()) ||
      log.command.toLowerCase().includes(query.toLowerCase()) ||
      log.id.toLowerCase().includes(query.toLowerCase());

    if (statusFilter === 'all') return matchesQuery;
    return matchesQuery && log.status.toLowerCase() === statusFilter.toLowerCase();
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const totalExecutions = executionLogs.length;
  const successCount = executionLogs.filter(l => l.status === 'success').length;
  const failedCount = executionLogs.filter(l => l.status === 'failed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Execution History
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Track every cron job execution, view exit codes, and inspect live stdout logs.
        </p>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Executions"
          value={totalExecutions.toLocaleString()}
          subtitle="All captured logs"
          icon={<HistoryIcon className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Successful Executions"
          value={successCount.toLocaleString()}
          subtitle={`${((successCount / (totalExecutions || 1)) * 100).toFixed(1)}% success rate`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/40"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Failed Executions"
          value={failedCount.toLocaleString()}
          subtitle="Requires attention"
          icon={<XCircle className="w-5 h-5" />}
          iconBgColor="bg-rose-50 dark:bg-rose-950/40"
          iconColor="text-rose-600 dark:text-rose-400"
        />

        <StatCard
          title="Average Duration"
          value="1.8s"
          subtitle="Fast response time"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-blue-50 dark:bg-blue-950/40"
          iconColor="text-blue-600 dark:text-blue-400"
        />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search logs by job or command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent font-medium text-slate-700 dark:text-slate-200 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Logs</option>
              <option value="success">Successful</option>
              <option value="failed">Failed</option>
              <option value="running">Running</option>
            </select>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-6 py-3.5">Job Name</th>
                <th className="px-6 py-3.5">Started At</th>
                <th className="px-6 py-3.5">Duration</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Exit Code</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {paginatedLogs.map((log) => (
                <tr
                  key={log.id}
                  onClick={() => setSelectedLogForDrawer(log)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                          {log.jobName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-400">
                          {log.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 font-mono text-slate-600 dark:text-slate-300">
                    {log.startedAt}
                  </td>

                  <td className="px-6 py-4 text-slate-700 dark:text-slate-200 font-medium">
                    {log.duration}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={log.status} />
                  </td>

                  <td className="px-6 py-4 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.exitCode === 0
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : log.exitCode === -1
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    }`}>
                      {log.exitCode}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedLogForDrawer(log)}
                      className="px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 font-semibold text-[11px] transition-colors"
                    >
                      View Logs
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={filteredLogs.length}
          itemsPerPage={itemsPerPage}
        />
      </div>

    </div>
  );
};

export default HistoryPage;