import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Clock, Terminal, Play, Settings, User, FileText, ArrowRight, X } from 'lucide-react';
import { useCron } from '../context/CronContext';

export const SearchModal: React.FC = () => {
  const { searchModalOpen, setSearchModalOpen, cronJobs, setSelectedJobForDrawer } = useCron();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchModalOpen(!searchModalOpen);
      }
      if (e.key === 'Escape' && searchModalOpen) {
        setSearchModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchModalOpen, setSearchModalOpen]);

  if (!searchModalOpen) return null;

  const filteredJobs = cronJobs.filter(
    j => j.name.toLowerCase().includes(query.toLowerCase()) ||
         j.command.toLowerCase().includes(query.toLowerCase()) ||
         j.schedule.includes(query)
  );

  const pages = [
    { title: 'Dashboard', path: '/home', icon: Clock },
    { title: 'Cron Jobs', path: '/cron-jobs', icon: Terminal },
    { title: 'Create Cron Job', path: '/create-cron', icon: Play },
    { title: 'Execution History', path: '/history', icon: FileText },
    { title: 'User Profile', path: '/profile', icon: User },
    { title: 'System Settings', path: '/settings', icon: Settings }
  ].filter(p => p.title.toLowerCase().includes(query.toLowerCase()));

  const handleSelectPage = (path: string) => {
    setSearchModalOpen(false);
    setQuery('');
    navigate(path);
  };

  const handleSelectJob = (job: typeof cronJobs[0]) => {
    setSearchModalOpen(false);
    setQuery('');
    setSelectedJobForDrawer(job);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header Search Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search cron jobs, commands, or pages..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <span className="hidden sm:inline-block px-2 py-0.5 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </span>
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 space-y-4">
          
          {/* Navigation Pages */}
          {pages.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Navigation
              </p>
              <div className="space-y-1">
                {pages.map((p) => {
                  const Icon = p.icon;
                  return (
                    <button
                      key={p.path}
                      onClick={() => handleSelectPage(p.path)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 dark:group-hover:bg-emerald-950/50 dark:group-hover:text-emerald-400 transition-colors">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-medium">{p.title}</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cron Jobs Results */}
          {filteredJobs.length > 0 && (
            <div>
              <p className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Cron Jobs ({filteredJobs.length})
              </p>
              <div className="space-y-1">
                {filteredJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => handleSelectJob(job)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Terminal className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium truncate text-slate-900 dark:text-white">
                          {job.name}
                        </div>
                        <div className="text-xs font-mono text-slate-400 truncate">
                          {job.schedule} • {job.command}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                      {job.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {pages.length === 0 && filteredJobs.length === 0 && (
            <div className="py-10 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No results found for "{query}"</p>
              <p className="text-xs mt-1 text-slate-500">Try searching for a job name, command, or page</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Use</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">↓</kbd>
            <span>to navigate</span>
          </div>
          <span>CronMaster Command Palette</span>
        </div>

      </div>
    </div>
  );
};
