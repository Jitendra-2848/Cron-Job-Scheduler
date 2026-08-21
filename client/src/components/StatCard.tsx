import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  trendUp = true,
  icon,
  iconBgColor = 'bg-emerald-50 dark:bg-emerald-950/40',
  iconColor = 'text-emerald-600 dark:text-emerald-400'
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {value}
          </h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
      </div>

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={`font-semibold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                trendUp
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
              }`}
            >
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
