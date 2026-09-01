import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  Monitor,
  ChevronRight, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useCron } from '../context/CronContext';

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const { theme, setTheme } = useTheme();
  const { setSearchModalOpen, user } = useCron();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const path = location.pathname;
  let pageTitle = 'Home Overview';

  if (path === '/cron-jobs') {
    pageTitle = 'Cron Jobs';
  } else if (path === '/create-cron') {
    pageTitle = 'Create Cron Job';
  } else if (path === '/history') {
    pageTitle = 'Execution History';
  } else if (path === '/profile') {
    pageTitle = 'User Profile';
  } else if (path === '/settings') {
    pageTitle = 'System Settings';
  }

  const notifications: any[] = [];

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between transition-colors shadow-none">
      
      {/* Left Navigation Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Toggle Hamburger button for Mobile */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
          <span className="text-slate-500 dark:text-slate-400">
            CronMaster
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <span className="text-slate-900 dark:text-white font-semibold">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Right Toolbar Action Icons */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        
        {/* Search Trigger Input Button */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-400 text-xs transition-colors"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400">
            Search cron jobs...
          </span>
          <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-400 font-normal">
            ⌘ K
          </kbd>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 rounded text-slate-450 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded shadow-lg z-50 overflow-hidden animate-fade-in">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-xs text-slate-800 dark:text-white">Notifications</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors flex gap-2.5">
                      <div className={`p-1.5 rounded shrink-0 h-fit mt-0.5 ${
                        n.type === 'error' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {n.type === 'error' ? <AlertTriangle className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-900 dark:text-white truncate">{n.title}</p>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-1">{n.time}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    No new notifications.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Mode Control: Light (Sun), Dark (Moon), System (Monitor) */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'light'
                ? 'bg-white dark:bg-slate-700 text-amber-500 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Light Mode"
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-white dark:bg-slate-700 text-emerald-400 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="Dark Mode"
          >
            <Moon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'system'
                ? 'bg-white dark:bg-slate-700 text-blue-400 shadow-xs font-semibold'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
            title="System Mode"
          >
            <Monitor className="w-4 h-4" />
          </button>
        </div>

        {/* User Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-emerald-600/30 transition-all shrink-0 ml-1"
          title="User Profile"
        >
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </button>

      </div>

    </header>
  );
};
