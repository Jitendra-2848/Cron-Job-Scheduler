import React from 'react';
import { Clock, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No cron jobs yet",
  description = "Create your first scheduled task and let CronMaster handle the rest.",
  actionText = "Create Cron Job",
  onAction
}) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto shadow-xs my-8">
      <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800/60 shadow-inner">
        <Clock className="w-8 h-8" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
        {description}
      </p>

      <button
        onClick={onAction || (() => navigate('/create-cron'))}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        {actionText}
      </button>
    </div>
  );
};
