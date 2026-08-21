import React from 'react';

export type StatusType = 'active' | 'running' | 'paused' | 'failed' | 'disabled' | 'success' | 'pending';

interface StatusBadgeProps {
  status: StatusType | string;
  showDot?: boolean;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, showDot = true, size = 'md' }) => {
  const normalized = (status || '').toLowerCase();

  let bgClass = 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  let dotClass = 'bg-gray-500';

  if (normalized === 'active' || normalized === 'success') {
    bgClass = 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
    dotClass = 'bg-emerald-500';
  } else if (normalized === 'running') {
    bgClass = 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
    dotClass = 'bg-blue-500 animate-pulse';
  } else if (normalized === 'failed') {
    bgClass = 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
    dotClass = 'bg-rose-500';
  } else if (normalized === 'paused' || normalized === 'warning') {
    bgClass = 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
    dotClass = 'bg-amber-500';
  } else if (normalized === 'disabled') {
    bgClass = 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    dotClass = 'bg-slate-400';
  }

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${padding} ${bgClass} transition-colors`}>
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      )}
      <span className="capitalize">{status}</span>
    </span>
  );
};
