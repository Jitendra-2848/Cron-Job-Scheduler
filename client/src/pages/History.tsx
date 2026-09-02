import React, { useState, useMemo } from 'react';
import { Search, Filter, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useCron } from '../context/CronContext';
import { Pagination } from '../components/Pagination';

export const HistoryPage: React.FC = () => {
  const { executionLogs } = useCron();
  
  // Selected log ID for detail preview panel (defaults to first log if present)
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  const selectedLog = useMemo(() => {
    if (selectedLogId) {
      return executionLogs.find(l => l.id === selectedLogId) || null;
    }
    return filteredLogs[0] || null;
  }, [executionLogs, selectedLogId, filteredLogs]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-6xl text-xs">
      
      {/* Page Title */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Execution History
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Detailed audit logs and response diagnostics for every webhook trigger.
        </p>
      </div>

      {/* Two Column Layout: Table on Left / Selected Log Details on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Table & Filters Column */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Filters Bar */}
          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-xs">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search logs..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-semibold text-slate-700 dark:text-slate-300 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">Status: All</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="running">Running</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono text-[11px]">
                  {paginatedLogs.length > 0 ? (
                    paginatedLogs.map((log) => {
                      const isSelected = selectedLog?.id === log.id;
                      return (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedLogId(log.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/30'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {log.startedAt}
                          </td>
                          <td className="px-4 py-3 font-sans font-bold text-slate-900 dark:text-white">
                            <span className="truncate block max-w-[140px] sm:max-w-[200px]">{log.jobName}</span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">
                            {log.duration}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 font-semibold ${
                                log.status === 'success'
                                  ? 'text-emerald-600 dark:text-emerald-400'
                                  : 'text-rose-600 dark:text-rose-400'
                              }`}
                            >
                              {log.status === 'success' ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <AlertTriangle className="w-3.5 h-3.5" />
                              )}
                              <span>{log.status}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 italic">
                        No execution records found matching filter.
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
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-xs animate-fade-in sticky top-4">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Execution Details
                  </h4>
                  <span className="font-mono text-[10px] text-slate-400">{selectedLog.jobName}</span>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  selectedLog.status === 'success'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                }`}>
                  {selectedLog.status === 'success' ? 'Success' : 'Failed'}
                </span>
              </div>

              {/* Execution details parameters */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Started At</span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-slate-200">{selectedLog.startedAt}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Execution Time</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedLog.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Trigger Type</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-300">HTTP Webhook</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">HTTP Code</span>
                  <span className={`font-bold font-mono ${selectedLog.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {selectedLog.exitCode > 0 ? `${selectedLog.exitCode} ${selectedLog.status === 'success' ? 'OK' : 'Error'}` : (selectedLog.status === 'success' ? '200 OK' : 'Failed')}
                  </span>
                </div>
              </div>

              {/* Request & Response payload info */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Target Endpoint
                </span>
                <span className="font-mono text-[11px] font-bold text-slate-700 dark:text-slate-300 break-all block p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  {selectedLog.command}
                </span>
              </div>

              {/* Console / Response Output Logs */}
              <div className="space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-3">
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Response Output & Logs</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-3 font-mono text-[11px] text-slate-800 dark:text-slate-200 space-y-1 overflow-x-auto leading-relaxed max-h-48 shadow-inner">
                  {selectedLog.logs.map((logLine: string, idx: number) => (
                    <div key={idx} className="whitespace-pre-wrap break-all">
                      {logLine}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-slate-400 italic shadow-xs">
              Select an execution row from the table to view stdout logs and network triggers.
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default HistoryPage;