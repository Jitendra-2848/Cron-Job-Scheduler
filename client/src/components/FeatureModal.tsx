import React from 'react';
import { ShieldAlert, X, Sparkles, CheckCircle } from 'lucide-react';

interface FeatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  description?: string;
  featureName?: string;
}

export const FeatureModal: React.FC<FeatureModalProps> = ({
  isOpen,
  onClose,
  featureName = "Two-Factor Authentication (2FA)",
  description = "This advanced security feature is currently being integrated and will be enabled in the upcoming CronMaster release."
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative space-y-5 animate-slide-up">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Glow Badge */}
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500 dark:text-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <ShieldAlert className="w-7 h-7" />
        </div>

        {/* Header Text */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Coming Soon
            </span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {featureName}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
            {description}
          </p>
        </div>

        {/* Release Checklist Preview */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>TOTP Authenticator App Integration</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Backup Recovery Security Keys</span>
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Enforced Multi-Factor Admin Policies</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-[0.99] cursor-pointer"
        >
          Got It, Thanks!
        </button>
      </div>
    </div>
  );
};
