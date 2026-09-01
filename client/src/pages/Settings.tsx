import React, { useState } from 'react';
import { 
  Bell, 
  Sun, 
  Cpu, 
  Globe, 
  Save, 
  Moon, 
  Monitor 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCron } from '../context/CronContext';
import { FeatureModal } from '../components/FeatureModal';

type Tab = 'general' | 'notifications' | 'appearance' | 'scheduler';

const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const { showToast } = useCron();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [modalFeature, setModalFeature] = useState<{ isOpen: boolean; name: string; desc: string }>({
    isOpen: false,
    name: '',
    desc: ''
  });

  // Form State
  const [timezone, setTimezone] = useState('UTC');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD HH:mm:ss');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [failedAlerts, setFailedAlerts] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  const [defaultRetries, setDefaultRetries] = useState(3);
  const [defaultTimeout, setDefaultTimeout] = useState(300);
  const [maxConcurrent, setMaxConcurrent] = useState(10);

  const handleSaveSettings = () => {
    showToast('System settings saved successfully!', 'success');
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Globe },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Sun },
    { id: 'scheduler', label: 'Scheduler Engine', icon: Cpu }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure global environment preferences, notification routing, and scheduler parameters.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`flex items-center gap-2 pb-3 text-xs font-semibold tracking-wide transition-all border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
        
        {/* GENERAL TAB */}
        {activeTab === 'general' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                General Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Set default timezone and localized display formats
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Default Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Date Format
                </label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm font-medium focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss (ISO 8601)</option>
                  <option value="MM/DD/YYYY hh:mm A">MM/DD/YYYY hh:mm A (US Standard)</option>
                  <option value="DD/MM/YYYY HH:mm">DD/MM/YYYY HH:mm (EU Standard)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === 'notifications' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Notification Routing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Configure alert triggers and weekly email summaries
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Email Notifications
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Receive critical status updates via email
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEmailAlerts(!emailAlerts);
                    setModalFeature({
                      isOpen: true,
                      name: "Email Alert Routing",
                      desc: "Automated SMTP & Webhook email notifications are under active integration for the upcoming CronMaster release."
                    });
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    emailAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    emailAlerts ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Failed Job Alerts
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Immediately alert when a job returns non-zero exit code
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFailedAlerts(!failedAlerts)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    failedAlerts ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    failedAlerts ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Weekly Digest Reports
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Send executive summary report every Monday morning
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWeeklyReports(!weeklyReports);
                    setModalFeature({
                      isOpen: true,
                      name: "Weekly Digest & Reporting",
                      desc: "Weekly executive summary PDF & email exports will be available in the upcoming CronMaster v1.1 release."
                    });
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    weeklyReports ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    weeklyReports ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* APPEARANCE TAB */}
        {activeTab === 'appearance' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Interface Theme
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize visual appearance mode for CronMaster
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all text-center ${
                  theme === 'light'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Sun className="w-6 h-6" />
                <span className="text-xs font-bold">Light Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all text-center ${
                  theme === 'dark'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Moon className="w-6 h-6" />
                <span className="text-xs font-bold">Dark Mode</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all text-center ${
                  theme === 'system'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                <Monitor className="w-6 h-6" />
                <span className="text-xs font-bold">System Preference</span>
              </button>
            </div>
          </div>
        )}

        {/* SCHEDULER TAB */}
        {activeTab === 'scheduler' && (
          <div className="space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Scheduler Engine Configuration
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Tune worker concurrency limits and default timeout thresholds
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Default Retry Count
                </label>
                <input
                  type="number"
                  value={defaultRetries}
                  onChange={(e) => setDefaultRetries(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Execution Timeout (s)
                </label>
                <input
                  type="number"
                  value={defaultTimeout}
                  onChange={(e) => setDefaultTimeout(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Max Concurrent Jobs
                </label>
                <input
                  type="number"
                  value={maxConcurrent}
                  onChange={(e) => setMaxConcurrent(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white text-sm focus:outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Bar */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
          >
            <Save className="w-4 h-4" />
            Save Settings
          </button>
        </div>

      </div>

      <FeatureModal
        isOpen={modalFeature.isOpen}
        onClose={() => setModalFeature(prev => ({ ...prev, isOpen: false }))}
        featureName={modalFeature.name}
        description={modalFeature.desc}
      />

    </div>
  );
};

export default Settings;