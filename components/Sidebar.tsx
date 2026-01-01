
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
  // Persistence State with SAFE Parsing
  const [favorites, setFavorites] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('sf_favorites');
          return saved ? JSON.parse(saved) : [];
      } catch (e) {
          console.warn("Failed to parse favorites", e);
          return [];
      }
  });
  
  const [recents, setRecents] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('sf_recents');
          return saved ? JSON.parse(saved) : ['dashboard'];
      } catch (e) {
          console.warn("Failed to parse recents", e);
          return ['dashboard'];
      }
  });

  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  
  // Get current user for admin check
  const currentUser = authService.getCurrentUser();

  // Init check: If we have favorites, default to favorites view to show "Customized" experience
  useEffect(() => {
      if (favorites.length > 0 && filterMode === 'all') {
          // Optional: You could default to favorites here, but 'all' is usually safer for navigation
          // setFilterMode('favorites'); 
      }
  }, []);

  // Persist effects
  useEffect(() => {
      localStorage.setItem('sf_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
      localStorage.setItem('sf_recents', JSON.stringify(recents));
  }, [recents]);

  // Actions
  const toggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setFavorites(prev => 
          prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
      );
  };

  const handleNavigation = (id: string) => {
      // Add to recents (Max 7, unique)
      setRecents(prev => {
          const filtered = prev.filter(item => item !== id);
          return [id, ...filtered].slice(0, 7);
      });
      
      setCurrentView(id);
      setIsMobileOpen(false);
  };

  // Filter Logic
  // 1. Filter out Admin-only items if user is not admin
  const allowedItems = NAVIGATION_ITEMS.filter(item => {
      if (item.adminOnly && !currentUser?.isAdmin) return false;
      return true;
  });

  let displayItems = allowedItems;

  if (filterMode === 'favorites') {
      displayItems = allowedItems.filter(item => favorites.includes(item.id));
  } else if (filterMode === 'recent') {
      // Map recents to actual items to preserve order of recents
      displayItems = recents
          .map(id => allowedItems.find(item => item.id === id))
          .filter(item => item !== undefined) as typeof NAVIGATION_ITEMS;
  }

  // XP Calculation
  const xpPercent = Math.min(100, Math.max(0, (MOCK_STATS.xp / MOCK_STATS.nextLevelXp) * 100));

  // Common classes
  const baseClasses = `bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-[50] transition-all duration-300`;
  const widthClass = isCollapsed ? 'w-20' : 'w-64';
  const mobileTransform = isMobileOpen ? 'translate-x-0' : '-translate-x-full';
  const visibilityClasses = `md:translate-x-0 ${mobileTransform}`;

  return (
    <>
      {/* Mobile Overlay - z-[49] to sit just below the sidebar */}
      {isMobileOpen && (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[49] md:hidden"
            onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`${baseClasses} ${widthClass} ${visibilityClasses}`}>
        {/* Header */}
        <div className={`h-16 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-200 dark:border-slate-800 shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-400 to-teal-500 p-2 rounded-lg shrink-0">
              <Music2 className="text-slate-950 w-6 h-6" />
            </div>
            {!isCollapsed && (
                <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">{APP_NAME}</span>
            )}
          </div>
          <button className="md:hidden text-slate-500" onClick={() => setIsMobileOpen(false)}>
              <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar (Only visible when expanded) */}
        {!isCollapsed && (
            <div className="px-4 pt-4 pb-2">
                <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setFilterMode('all')}
                        className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${filterMode === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="All Items"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setFilterMode('favorites')}
                        className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${filterMode === 'favorites' ? 'bg-white dark:bg-slate-700 text-yellow-500 dark:text-yellow-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="Favorites"
                    >
                        <Star className="w-4 h-4" fill={filterMode === 'favorites' ? "currentColor" : "none"} />
                    </button>
                    <button 
                        onClick={() => setFilterMode('recent')}
                        className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${filterMode === 'recent' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        title="Recent"
                    >
                        <History className="w-4 h-4" />
                    </button>
                </div>
            </div>
        )}

        {/* Nav Items */}
        <div className="flex-1 overflow-y-auto py-2 px-3 space-y-1 scrollbar-hide">
          {displayItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400 text-xs text-center px-4">
                  <AlertCircle className="w-6 h-6 mb-2 opacity-50" />
                  {filterMode === 'favorites' ? "No favorites yet. Star items to see them here." : "No recent history."}
              </div>
          ) : (
              displayItems.map((item) => {
                const isActive = currentView === item.id;
                const isFav = favorites.includes(item.id);
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-lg transition-all duration-200 group relative ${
                      isActive 
                        ? 'bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-500 dark:text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`} />
                      {!isCollapsed && <span className="text-sm font-medium whitespace-nowrap truncate">{item.label}</span>}
                    </div>
                    
                    {!isCollapsed && (
                        <div className="flex items-center gap-2">
                            {/* Star Button (Visible on Hover or if Fav) */}
                            <div 
                                onClick={(e) => toggleFavorite(e, item.id)}
                                className={`p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-all ${isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                                <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-yellow-400 text-yellow-400' : 'text-slate-400'}`} />
                            </div>

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
                        </div>
                    )}
                  </button>
                );
              })
          )}

          {/* ADMIN LINK */}
          {currentUser?.isAdmin && (
              <button
                onClick={() => handleNavigation(VIEWS.ADMIN)}
                title={isCollapsed ? "Admin" : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-3'} py-2.5 rounded-lg transition-all duration-200 group mt-4 border border-slate-200 dark:border-slate-800 ${
                  currentView === VIEWS.ADMIN
                    ? 'bg-slate-200 dark:bg-slate-800 text-red-600 dark:text-red-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-red-500'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Shield className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span className="text-sm font-bold whitespace-nowrap">Admin Panel</span>}
                </div>
              </button>
          )}
        </div>

        {/* Footer / XP & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
          
          {/* XP Bar */}
          {!isCollapsed && (
              <div className="mb-4">
                  <div className="flex justify-between items-center mb-1.5">
                      <div className="flex items-center gap-1.5">
                          <Trophy className="w-3 h-3 text-yellow-500" />
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Artist Level</span>
                      </div>
                      <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">{MOCK_STATS.artistLevel}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-1">
                      <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${xpPercent}%` }}
                      ></div>
                  </div>
                  <div className="text-[10px] text-slate-400 text-right font-mono">
                      {MOCK_STATS.xp} / {MOCK_STATS.nextLevelXp} XP
                  </div>
              </div>
          )}

          <button 
            onClick={toggleCollapse}
            className={`hidden md:flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} w-full py-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors mb-2`}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
            {!isCollapsed && <span className="text-sm font-medium">Collapse</span>}
          </button>

          <button 
            onClick={onOpenHelp}
            className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 px-3'} text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors w-full py-2 mb-2`}
            title="Help & Support"
          >
            <HelpCircle className="w-5 h-5" />
            {!isCollapsed && <span className="text-sm font-medium">Help</span>}
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
