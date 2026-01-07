import React, { useState, useEffect } from 'react';
import { Music2, LogOut, PanelLeftClose, PanelLeft, X, Star, History, List, AlertCircle, Trophy, HelpCircle, Shield } from 'lucide-react';
import { NAVIGATION_ITEMS, APP_NAME, MOCK_STATS, VIEWS } from '../constants';
import { authService } from '../services/authService';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (v: boolean) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  onLogout: () => void;
  onOpenHelp: () => void;
}

type FilterMode = 'all' | 'favorites' | 'recent';

export const Sidebar: React.FC<SidebarProps> = ({ 
    currentView, setCurrentView, isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse, onLogout, onOpenHelp 
}) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('sf_favorites');
          return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });
  
  const [recents, setRecents] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('sf_recents');
          return saved ? JSON.parse(saved) : ['dashboard'];
      } catch (e) { return ['dashboard']; }
  });

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
      localStorage.setItem('sf_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
      localStorage.setItem('sf_recents', JSON.stringify(recents));
  }, [recents]);

  const handleNavigation = (id: string) => {
      setRecents(prev => {
          const filtered = prev.filter(item => item !== id);
          return [id, ...filtered].slice(0, 7);
      });
      setCurrentView(id);
      setIsMobileOpen(false);
  };

  const allowedItems = NAVIGATION_ITEMS.filter(item => !item.adminOnly || currentUser?.isAdmin);
  let displayItems = allowedItems;
  if (filterMode === 'favorites') displayItems = allowedItems.filter(item => favorites.includes(item.id));
  else if (filterMode === 'recent') displayItems = recents.map(id => allowedItems.find(item => item.id === id)).filter(item => !!item) as typeof NAVIGATION_ITEMS;

  const xpPercent = Math.min(100, Math.max(0, (MOCK_STATS.xp / MOCK_STATS.nextLevelXp) * 100));

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[49] md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <div className={`bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-[50] transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-200 dark:border-slate-800 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-400 to-teal-500 p-2 rounded-lg shrink-0">
              <Music2 className="text-slate-950 w-6 h-6" />
            </div>
            {!isCollapsed && <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">{APP_NAME}</span>}
          </div>
          <button className="md:hidden text-slate-500" onClick={() => setIsMobileOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        {!isCollapsed && (
            <div className="px-4 pt-4 pb-2">
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                    <button onClick={() => setFilterMode('all')} className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${filterMode === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><List className="w-4 h-4" /></button>
                    <button onClick={() => setFilterMode('favorites')} className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${filterMode === 'favorites' ? 'bg-white dark:bg-slate-700 text-yellow-500' : 'text-slate-500 hover:text-slate-700'}`}><Star className="w-4 h-4" /></button>
                    <button onClick={() => setFilterMode('recent')} className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${filterMode === 'recent' ? 'bg-white dark:bg-slate-700 text-cyan-600' : 'text-slate-500 hover:text-slate-700'}`}><History className="w-4 h-4" /></button>
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-hide">
          {displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs text-center px-4">
                  <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
                  {filterMode === 'favorites' ? "No favorites yet." : "No recent history."}
              </div>
          ) : (
              displayItems.map((item) => {
                const isActive = currentView === item.id;
                const Icon = item.icon;
                return (
                  <button key={item.id} onClick={() => handleNavigation(item.id)} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-lg transition-all duration-200 group relative ${isActive ? 'bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 group-hover:text-slate-700'}`} />
                      {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap truncate">{item.label}</span>}
                    </div>
                  </button>
                );
              })
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {!isCollapsed && (
              <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1.5"><Trophy className="w-3 h-3 text-yellow-500" /><span className="text-xs font-bold text-slate-700 dark:text-slate-200">Merge Rep</span></div>
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">{MOCK_STATS.artistLevel}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${xpPercent}%` }}></div>
                  </div>
              </div>
          )}

          <button onClick={toggleCollapse} className={`hidden md:flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} w-full py-2 text-slate-500 hover:text-white transition-colors mb-2`}>
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>

          <button onClick={onOpenHelp} className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} text-slate-500 hover:text-white transition-colors w-full py-2 mb-2`}>
            <HelpCircle className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Help</span>}
          </button>

          <button onClick={onLogout} className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} text-slate-500 hover:text-white transition-colors w-full py-2`}>
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
          </button>
          {!isCollapsed && <p className="text-xs text-slate-400 dark:text-slate-600 mt-2 text-center">v2.5.0 • Sound Merge</p>}
        </div>
      </div>
    </>
  );
};