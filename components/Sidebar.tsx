
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[49] md:hidden" onClick={() => setIsMobileOpen(false)} />
      )}

      <div className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-[50] transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'} ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}`}>
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-200 dark:border-slate-800 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-500 to-teal-500 p-2 rounded-lg shrink-0 shadow-sm">
              <Music2 className="text-white w-6 h-6" />
            </div>
            {!isCollapsed && <span className="font-black text-lg tracking-tighter uppercase text-slate-900 dark:text-white whitespace-nowrap">{APP_NAME}</span>}
          </div>
          <button className="md:hidden text-slate-400 hover:text-slate-600" onClick={() => setIsMobileOpen(false)}><X className="w-5 h-5" /></button>
        </div>

        {!isCollapsed && (
            <div className="px-4 pt-4 pb-2">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button onClick={() => setFilterMode('all')} className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${filterMode === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}><List className="w-4 h-4" /></button>
                    <button onClick={() => setFilterMode('favorites')} className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${filterMode === 'favorites' ? 'bg-white dark:bg-slate-700 text-yellow-500 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}><Star className="w-4 h-4" /></button>
                    <button onClick={() => setFilterMode('recent')} className={`flex-1 flex items-center justify-center py-2 rounded-lg transition-all ${filterMode === 'recent' ? 'bg-white dark:bg-slate-700 text-cyan-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}><History className="w-4 h-4" /></button>
                </div>
            </div>
        )}

        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 custom-scrollbar">
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
                  <button key={item.id} onClick={() => handleNavigation(item.id)} className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-xl transition-all duration-200 group relative ${isActive ? 'bg-slate-100 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 group-hover:text-slate-700'}`} />
                      {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap truncate tracking-tight">{item.label}</span>}
                    </div>
                    {!isCollapsed && item.ai && <span className="text-[8px] font-black uppercase text-purple-500 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded ml-2">AI</span>}
                  </button>
                );
              })
          )}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          {!isCollapsed && (
              <div className="mb-4 bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-500" /><span className="text-[10px] font-black uppercase text-slate-700 dark:text-slate-200 tracking-wider">Merge Rep</span></div>
                      <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400">{MOCK_STATS.artistLevel}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: `${xpPercent}%` }}></div>
                  </div>
              </div>
          )}

          <button onClick={toggleCollapse} className={`hidden md:flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} w-full py-2.5 rounded-xl text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all mb-1`}>
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            {!isCollapsed && <span className="text-sm font-bold">Collapse</span>}
          </button>

          <button onClick={onOpenHelp} className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} text-slate-500 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all w-full py-2.5 mb-1`}>
            <HelpCircle className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-bold">Support</span>}
          </button>

          <button onClick={onLogout} className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all w-full py-2.5`}>
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-bold">Sign Out</span>}
          </button>
          {!isCollapsed && <p className="text-[9px] font-black uppercase text-slate-400 dark:text-slate-600 mt-4 text-center tracking-widest">Sound Merge v2.5</p>}
        </div>
      </div>
    </>
  );
};
