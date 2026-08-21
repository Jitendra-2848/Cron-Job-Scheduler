import React from 'react';
import { Server, Database, Cpu, Globe } from 'lucide-react';
import { useCron } from '../context/CronContext';

export const SystemStatus: React.FC = () => {
  const { systemServices } = useCron();

  const getIcon = (name: string) => {
    if (name.includes('Scheduler')) return Cpu;
    if (name.includes('API')) return Globe;
    if (name.includes('Database')) return Database;
    return Server;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            System Status
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time infrastructure health monitor
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          100% Operational
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {systemServices.map((service) => {
          const Icon = getIcon(service.name);
          return (
            <div
              key={service.name}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {service.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    Latency: {service.latency}
                  </div>
                </div>
              </div>

              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            </div>
          );
        })}
      </div>
    </div>
  );
};
