import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useCron } from '../context/CronContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useCron();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        let bg = 'bg-slate-900 dark:bg-slate-800 text-white border-slate-700';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;

        if (toast.type === 'error') {
          bg = 'bg-rose-950 text-rose-100 border-rose-800';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        } else if (toast.type === 'info') {
          bg = 'bg-slate-900 text-slate-100 border-slate-700';
          icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl border shadow-xl ${bg} animate-slide-up transition-all`}
          >
            <div className="flex items-center gap-3 pr-2">
              {icon}
              <span className="text-xs font-medium leading-snug">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
