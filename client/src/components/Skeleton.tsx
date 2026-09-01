import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = "w-full h-4" }) => {
  return (
    <div
      className={`bg-slate-200 dark:bg-slate-800/60 animate-pulse rounded-xl ${className}`}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-6 h-6 rounded-lg" />
      </div>
      <Skeleton className="w-32 h-8" />
      <Skeleton className="w-48 h-3" />
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden p-4 space-y-3">
      <Skeleton className="w-full h-8 rounded-lg" />
      {Array.from({ length: rows }).map((_, idx) => (
        <Skeleton key={idx} className="w-full h-10 rounded-lg" />
      ))}
    </div>
  );
};
