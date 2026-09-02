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

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const { theme, setTheme } = useTheme();
  const { setSearchModalOpen, user } = useCron();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const path = location.pathname;
  let pageTitle = 'Overview';

  if (path === '/cron-jobs') {
    pageTitle = 'Cron Jobs';
  } else if (path === '/create-cron') {
    pageTitle = 'Create Cron Job';
  } else if (path === '/history') {
    pageTitle = 'Execution History';
  } else if (path === '/analytics') {
    pageTitle = 'Analytics';
  } else if (path === '/profile') {
    pageTitle = 'User Profile';
  } else if (path === '/settings') {
    pageTitle = 'Settings';
  }

  const notifications: any[] = [];

  const toggleTheme = () => {
    if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('dark');
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-20 px-3 sm:px-6 flex items-center justify-between transition-colors">
      
      {/* Left Navigation & Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Toggle Hamburger button for Mobile */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          aria-label="Open Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm font-medium truncate">
          <span className="text-slate-500 dark:text-slate-400">
            CronMaster
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 shrink-0" />
          <span className="text-slate-900 dark:text-white font-semibold truncate">
            {pageTitle}
          </span>
        </div>

        {/* Mobile Page Title Indicator */}
        <span className="sm:hidden text-xs font-bold text-slate-900 dark:text-white truncate">
          {pageTitle}
        </span>
      </div>

      {/* Right Toolbar Action Items */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        
        {/* Search Trigger Input Button */}
        <button
          onClick={() => setSearchModalOpen(true)}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 text-xs transition-colors cursor-pointer"
          title="Search jobs (⌘K)"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="hidden md:inline text-slate-500 dark:text-slate-400 font-medium">
            Search jobs...
          </span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-400 font-normal">
            ⌘ K
          </kbd>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <span className="font-semibold text-xs text-slate-800 dark:text-white">Notifications</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div key={n.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex gap-2.5">
                      <div className={`p-1.5 rounded-lg shrink-0 h-fit mt-0.5 ${
                        n.type === 'error' ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
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

        {/* Quick Theme Toggle (Light / Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-emerald-500/30 transition-all shrink-0 cursor-pointer"
          title="User Profile"
        >
          <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
        </button>

      </div>

    </header>
  );
};

export default Header;
