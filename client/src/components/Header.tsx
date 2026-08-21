import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Search, 
  Bell, 
  Sun, 
  Moon, 
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

export const Header: React.FC<HeaderProps> = ({ collapsed, setCollapsed, setMobileOpen }) => {
  const { isDark, toggleTheme } = useTheme();
  const { setSearchModalOpen, user } = useCron();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  // Compute breadcrumbs and page title based on active path
  const path = location.pathname;
  let pageGroup = 'Dashboard';
  let pageTitle = 'Home Overview';

  if (path === '/cron-jobs') {
    pageGroup = 'Management';
    pageTitle = 'Cron Jobs';
  } else if (path === '/create-cron') {
    pageGroup = 'Management';
    pageTitle = 'Create Cron Job';
  } else if (path === '/history') {
    pageGroup = 'Management';
    pageTitle = 'Execution History';
  } else if (path === '/profile') {
    pageGroup = 'Account';
    pageTitle = 'User Profile';
  } else if (path === '/settings') {
    pageGroup = 'Account';
    pageTitle = 'System Settings';
  }

  const notifications = [
    {
      id: 1,
      title: 'API Health Check failed',
      desc: 'Ping response delay exceeded 2500ms limit',
      time: '3 mins ago',
      unread: true,
      type: 'error'
    },
    {
      id: 2,
      title: 'Database Backup completed',
      desc: 'Exported 1.4 GB archive to S3 bucket',
      time: '12:00 AM',
      unread: false,
      type: 'success'
    },
    {
      id: 3,
      title: 'Daily Report dispatched',
      desc: 'Sent PDF summary to 24 executive subscribers',
      time: '9:00 AM',
      unread: false,
      type: 'info'
    }
  ];

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-4 sm:px-6 flex items-center justify-between transition-colors">
      
      {/* Left Navigation Details */}
      <div className="flex items-center gap-3">
        {/* Toggle Hamburger button */}
        <button
          onClick={() => {
            if (window.innerWidth < 1024) {
              setMobileOpen(true);
            } else {
              setCollapsed(!collapsed);
            }
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          <span className="text-slate-400 dark:text-slate-500 font-medium hidden sm:inline">
            {pageGroup}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:inline" />
          <span className="font-bold text-slate-900 dark:text-white tracking-tight">
            {pageTitle}
          </span>
        </div>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Search Trigger Button */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 text-xs transition-colors"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden sm:inline text-slate-500 dark:text-slate-400 font-normal">
            Search cron jobs...
          </span>
          <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-500 dark:text-slate-400 shadow-2xs">
            ⌘ K
          </span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white">Notifications</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  1 Unread
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                {notifications.map(n => (
                  <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-3">
                    <div className={`p-1.5 rounded-lg shrink-0 h-fit mt-0.5 ${
                      n.type === 'error' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                    }`}>
                      {n.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{n.title}</p>
                        <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">{n.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-200 dark:border-slate-800 text-center bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
        </button>

        {/* User Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-emerald-500/50 transition-all shrink-0 ml-1"
          title="User Profile"
        >
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </button>

      </div>

    </header>
  );
};
