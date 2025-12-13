
import React from 'react';
import { Music2, LogOut, PanelLeftClose, PanelLeft, X } from 'lucide-react';
import { NAVIGATION_ITEMS, APP_NAME, VIEWS } from '../constants';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    currentView, setCurrentView, isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse, onLogout 
}) => {
  
  // Common classes
  const baseClasses = `bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-50 transition-all duration-300`;
  const widthClass = isCollapsed ? 'w-20' : 'w-64';
  const mobileTransform = isMobileOpen ? 'translate-x-0' : '-translate-x-full';
  // Desktop: always visible, width changes. Mobile: width fixed (64), transform toggles.
  const visibilityClasses = `md:translate-x-0 ${mobileTransform}`;

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`${baseClasses} ${widthClass} ${visibilityClasses}`}>
        {/* Header */}
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-200 dark:border-slate-800`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-400 to-teal-500 p-2 rounded-lg shrink-0">
              <Music2 className="text-slate-950 w-6 h-6" />
            </div>
            {!isCollapsed && (
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">{APP_NAME}</span>
            )}
          </div>
          {/* Mobile Close Button */}
          <button className="md:hidden text-slate-500" onClick={() => setIsMobileOpen(false)}>
              <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                    setCurrentView(item.id);
                    setIsMobileOpen(false);
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                  {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                </div>
                
                {!isCollapsed && (
                    <div className="flex gap-2">
                        {item.badge && (
                        <span className="bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold px-2 py-0.5 rounded-full">
                            {item.badge}
                        </span>
                        )}
                        {item.new && (
                        <span className="bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            New
                        </span>
                        )}
                        {item.ai && (
                        <span className="bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                            AI
                        </span>
                        )}
                    </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button 
            onClick={toggleCollapse}
            className={`hidden md:flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} w-full py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>

          <button 
            onClick={onLogout}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-full py-2`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          {!isCollapsed && <p className="text-xs text-slate-400 dark:text-slate-600 mt-2 text-center">v2.5.0 • SoundForge Pro</p>}
        </div>
      </div>
    </>
  );
};
