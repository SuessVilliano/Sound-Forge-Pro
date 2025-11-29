
import React from 'react';
import { Bell, Search, ChevronDown, Upload, Menu, Sun, Moon, Crown } from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  onMenuClick?: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: User | null;
  onUpgrade: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, theme, toggleTheme, user, onUpgrade }) => {
  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between transition-colors duration-200">
      
      <div className="flex items-center gap-3 md:hidden">
         <button onClick={onMenuClick} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
             <Menu className="w-6 h-6" />
         </button>
      </div>

      {/* Search */}
      <div className="relative w-96 hidden md:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
        <input 
          type="text" 
          placeholder="Search tracks, briefs, or artists..." 
          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500 dark:placeholder:text-slate-600"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Pro Upgrade Button - Only show if free */}
        {user?.plan === 'free' && (
            <button 
                onClick={onUpgrade}
                className="hidden md:flex bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white px-4 py-2 rounded-full text-sm font-bold items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
                <Crown className="w-4 h-4" />
                <span>Go Pro</span>
            </button>
        )}

        <button className="hidden md:flex bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-full text-sm font-semibold items-center gap-2 transition-colors">
          <Upload className="w-4 h-4" />
          <span>Upload</span>
        </button>

        <div className="relative cursor-pointer">
          <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </div>

        <div className="flex items-center gap-3 border-l border-slate-200 dark:border-slate-800 pl-6">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 overflow-hidden ring-2 ring-white dark:ring-slate-800">
            {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                    {user?.displayName?.[0] || 'U'}
                </div>
            )}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-slate-900 dark:text-white leading-none">{user?.displayName || 'Artist'}</p>
            <div className="flex items-center gap-1 mt-0.5">
                <p className="text-xs text-slate-500 capitalize">{user?.plan} Plan</p>
                {user?.plan !== 'free' && <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </header>
  );
};
