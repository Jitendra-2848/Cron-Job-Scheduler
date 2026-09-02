import React, { useState, useMemo } from 'react';
import { Search, Filter } from 'lucide-react';
import { useCron } from '../context/CronContext';
import { Pagination } from '../components/Pagination';

export const HistoryPage: React.FC = () => {
  const { executionLogs } = useCron();
  
  // Selected log ID for detail preview panel
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const selectedLog = useMemo(() => {
    return executionLogs.find(l => l.id === selectedLogId) || null;
  }, [executionLogs, selectedLogId]);

  const filteredLogs = useMemo(() => {
    return executionLogs.filter((log) => {
      const matchesQuery =
        log.jobName.toLowerCase().includes(query.toLowerCase()) ||
        log.command.toLowerCase().includes(query.toLowerCase()) ||
        log.id.toLowerCase().includes(query.toLowerCase());

      if (statusFilter === 'all') return matchesQuery;
      return matchesQuery && log.status.toLowerCase() === statusFilter.toLowerCase();
    });
  }, [executionLogs, query, statusFilter]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-5xl text-xs">
      
      {/* Page Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Execution history for all cron jobs.
        </p>
      </div>

      {/* Two Column Layout: Table on Left / Selected Log Details on Right (or full detail block below) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Table & Filters Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-3 rounded border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-855 text-xs focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-slate-650 dark:text-slate-350 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Status: All</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="running">Running</option>
                </select>
              </div>
            </div>
          </div>

          {/* Clean table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">TIME</th>
                    <th className="px-4 py-3">JOB</th>
                    <th className="px-4 py-3">DURATION</th>
                    <th className="px-4 py-3">STATUS</th>
                    <th className="px-4 py-3">TRIGGER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/65 font-medium">
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLogId(log.id)}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-850/50 cursor-pointer transition-colors ${
                          selectedLogId === log.id ? 'bg-[#E8F8F2] dark:bg-emerald-950/20' : ''
                        }`}
                      >
                        <td className="px-4 py-3 text-slate-500 font-mono">
                          {log.startedAt.split(' ')[1] || log.startedAt}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                          {log.jobName}
                        </td>
                        <td className="px-4 py-3 text-slate-700 dark:text-slate-350">
                          {log.duration}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 font-bold ${
                            log.status === 'success' ? 'text-emerald-600' : 'text-rose-600'
                          }`}>
                            ● {log.status === 'success' ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-450 dark:text-slate-500 font-semibold">
                          Scheduled
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                        No execution history recorded yet. Run a cron job to generate logs.
                      </td>
                    </tr>
                  )}
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

        {/* Right Column: Execution Details Panel */}
        <div>
          {selectedLog ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 space-y-4 animate-fade-in">
              <div className="border-b border-slate-100 dark:border-slate-850 pb-2 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Execution details
                  </h4>
                  <span className="font-mono text-[11px] text-slate-400">{selectedLog.id}</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  selectedLog.status === 'success'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                }`}>
                  ● {selectedLog.status === 'success' ? 'Success' : 'Failed'}
                </span>
              </div>

              {/* Execution details parameters */}
              <div className="space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Started At</span>
                  <span className="font-mono font-semibold text-slate-850 dark:text-slate-200">{selectedLog.startedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Execution Time</span>
                  <span className="font-semibold text-slate-850 dark:text-slate-200">{selectedLog.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Trigger Type</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-350">Scheduler</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">HTTP Code</span>
                  <span className={`font-bold font-mono ${selectedLog.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {selectedLog.exitCode > 0 ? `${selectedLog.exitCode} ${selectedLog.status === 'success' ? 'OK' : 'Error'}` : (selectedLog.status === 'success' ? '200 OK' : 'Failed')}
                  </span>
                </div>
              </div>

              {/* Request & Response payload info */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    Target Endpoint
                  </span>
                  <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 break-all block mt-1">
                    {selectedLog.command}
                  </span>
                </div>
              </div>

              {/* Dark Log Viewer */}
              <div className="space-y-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Console Output Logs
                </span>
                <div className="bg-slate-950 rounded border border-slate-850 p-3 font-mono text-[11px] text-slate-200 space-y-1 overflow-x-auto leading-relaxed shadow-inner max-h-48">
                  {selectedLog.logs.map((logLine, idx) => (
                    <div key={idx} className="whitespace-pre-wrap break-all">
                      {logLine}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-md p-6 text-center text-slate-400 italic">
              Select an execution row from the table to view stdout logs and network triggers.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default HistoryPage;