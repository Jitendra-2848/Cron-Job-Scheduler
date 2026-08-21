import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, History, AlertTriangle, Activity } from 'lucide-react';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Create Cron Job',
      desc: 'Schedule a new automated task',
      icon: PlusCircle,
      path: '/create-cron',
      color: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400'
    },
    {
      label: 'View History',
      desc: 'Inspect execution logs & outputs',
      icon: History,
      path: '/history',
      color: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400'
    },
    {
      label: 'Check Failed Jobs',
      desc: 'Review 1 failing active task',
      icon: AlertTriangle,
      path: '/cron-jobs?filter=failed',
      color: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400'
    },
    {
      label: 'System Status',
      desc: 'All 4 engines operational',
      icon: Activity,
      path: '/settings',
      color: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400'
    }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs transition-colors">
      <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight mb-4">
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              onClick={() => navigate(action.path)}
              className="flex items-start gap-3.5 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-all text-left group"
            >
              <div className={`p-2.5 rounded-xl ${action.color} shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {action.label}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {action.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
