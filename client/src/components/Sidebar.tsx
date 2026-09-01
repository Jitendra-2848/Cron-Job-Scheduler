import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Clock, 
  PlusCircle, 
  History, 
  BarChart3,
  User, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Layers, 
  X
} from 'lucide-react';
import { useCron } from '../context/CronContext';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) => {
  const { user } = useCron();
  const location = useLocation();

  const navGroups = [
    {
      group: 'OVERVIEW',
      items: [
        { name: 'Home', path: '/home', icon: LayoutDashboard }
      ]
    },
    {
      group: 'JOBS',
      items: [
        { name: 'Cron Jobs', path: '/cron-jobs', icon: Clock },
        { name: 'Create Cron', path: '/create-cron', icon: PlusCircle }
      ]
    },
    {
      group: 'MONITORING',
      items: [
        { name: 'History', path: '/history', icon: History },
        { name: 'Analytics', path: '/analytics', icon: BarChart3 }
      ]
    },
    {
      group: 'ACCOUNT',
      items: [
        { name: 'Profile', path: '/profile', icon: User },
        { name: 'Settings', path: '/settings', icon: Settings }
      ]
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 select-none transition-all duration-150">
      
      {/* Sidebar Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
           <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-white font-bold shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 dark:text-white tracking-tight text-sm leading-tight">
                CronMaster
              </span>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Cron Management
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Desktop Collapse toggle button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-5 h-5 m-1" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {group.group}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || (item.path === '/home' && location.pathname === '/');

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={() => {
                      return `
                        relative flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all duration-150 group rounded-md
                        ${isActive
                          ? 'bg-[#E8F8F2] dark:bg-emerald-950/40 text-[#087F5B] dark:text-emerald-400 font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                        }
                        ${collapsed ? 'justify-center px-1 py-2' : ''}
                      `;
                    }}
                    title={collapsed ? item.name : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#087F5B] dark:bg-emerald-500 rounded-r-full" />
                    )}
                    <Icon className="w-4.5 h-4.5 shrink-0" />
                    {!collapsed && <span>{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* System Status Panel (at the bottom of Sidebar) */}
      {!collapsed && (
        <div className="mx-2.5 my-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-md border border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>System Operational</span>
          </div>
        </div>
      )}

      {/* Sidebar Footer User Info */}
      <div className="p-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <NavLink
          to="/profile"
          onClick={() => setMobileOpen(false)}
          className={`flex items-center gap-3 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          {!collapsed && (
            <div className="flex flex-col min-w-0 flex-1 text-xs">
              <span className="font-semibold text-slate-800 dark:text-slate-200 truncate leading-snug">
                {user.name}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate leading-none">
                {user.email}
              </span>
            </div>
          )}
        </NavLink>
      </div>

    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 shrink-0 transition-all duration-150 z-30 ${
          collapsed ? 'w-[72px]' : 'w-[250px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex animate-fade-in">
          <div
            className="fixed inset-0 bg-slate-950/30 backdrop-blur-2xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-[250px] max-w-full h-full z-10 animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
export default Sidebar;