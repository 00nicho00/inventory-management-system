import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  FolderTree,
  ArrowLeftRight,
  Database,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Products', path: '/products', icon: Boxes },
  { name: 'Categories', path: '/categories', icon: FolderTree },
  { name: 'Inventory Movements', path: '/inventory', icon: ArrowLeftRight },
];

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  return (
    <aside
      className={`bg-slate-900 text-white flex flex-col shrink-0 min-h-screen border-r border-slate-800 transition-all duration-300 ease-in-out relative ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo & Collapse Toggle */}
      <div
        className={`h-16 flex items-center border-b border-slate-800/80 transition-all duration-300 ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-6'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-900/30 shrink-0">
            <Boxes className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="animate-in fade-in duration-200">
              <h1 className="text-sm font-black tracking-wide uppercase bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent truncate">
                StockPulse
              </h1>
              <p className="text-[10px] text-emerald-400 font-medium truncate">Inventory Suite</p>
            </div>
          )}
        </div>

        {/* Floating / Embedded Toggle Button */}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Collapse Sidebar"
            aria-label="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className={`flex-1 py-6 space-y-1.5 transition-all duration-300 ${isCollapsed ? 'px-2.5' : 'px-3'}`}>
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            Management
          </div>
        )}
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.name : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-sm font-medium transition-all group ${
                  isCollapsed ? 'justify-center py-3 px-0' : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
              </div>
            </NavLink>
          );
        })}
      </div>

      {/* Footer Info / Collapsed Toggle Indicator */}
      <div className={`p-3 border-t border-slate-800/80 transition-all duration-300 ${isCollapsed ? 'text-center' : ''}`}>
        {isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            className="w-full p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 text-emerald-400 hover:text-emerald-300 flex items-center justify-center transition-colors shadow-xs"
            title="Expand Sidebar"
            aria-label="Expand Sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-1">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">Database Engine</span>
            </div>
            <p className="text-[11px] text-emerald-400/90 font-medium leading-tight">
              PostgreSQL 16 (.NET 10)
            </p>
          </div>
        )}
      </div>
    </aside>
  );
};
