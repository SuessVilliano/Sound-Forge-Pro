
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, Upload, Menu, Sun, Moon, Crown, LogOut, User as UserIcon, Settings, CreditCard, X, Loader2, Music, Play, Wallet, Zap, Plus, Swords, CheckCircle2, MessageSquare, AlertCircle, TrendingUp, Globe, Star } from 'lucide-react';
import { User, Track } from '../types';
import { searchArtists } from '../services/chartmetricService';
import { RapidApiAgent } from '../services/rapidApiService'; 
import { usePlayer } from '../contexts/PlayerContext';
import { useWallet } from '../contexts/WalletContext';

interface HeaderProps {
  onMenuClick?: () => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  user: User | null;
  onUpgrade: () => void;
  onLogout: () => void;
  onNavigate: (view: string) => void;
  onUpload: () => void;
  onArtistSelect?: (artistId: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, theme, toggleTheme, user, onUpgrade, onLogout, onNavigate, onUpload, onArtistSelect }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const { walletAddress, isConnecting, connectTipLink, connectPhantom, disconnectWallet, walletType, tokenPrices } = useWallet();
  const { playTrack } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) setShowProfileMenu(false);
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) setShowResults(false);
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) setShowWalletMenu(false);
      if (quickActionRef.current && !quickActionRef.current.contains(event.target as Node)) setShowQuickActions(false);
      if (notifyRef.current && !notifyRef.current.contains(event.target as Node)) setShowNotifications(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (query.length < 2) { setShowResults(false); return; }
      
      setIsSearching(true);
      setShowResults(true);
      
      searchTimeoutRef.current = window.setTimeout(async () => {
          try {
              // 1. Get Live Search results from Agent (Spotify + Billboard Chart Mix)
              const globalResults = await RapidApiAgent.globalSearch(query);
              
              // 2. Get Chartmetric Artist metadata if available
              const cmArtists = await searchArtists(query);
              
              // Merge results
              const merged = [...globalResults];
              cmArtists.forEach(a => {
                  if (!merged.find(m => m.artist?.toLowerCase() === a.name.toLowerCase() || m.name?.toLowerCase() === a.name.toLowerCase())) {
                      merged.push({ ...a, artist: a.name, source: 'Chartmetric' });
                  }
              });

              setSearchResults(merged);
          } catch (error) { 
              console.error(error); 
          } finally { 
              setIsSearching(false); 
          }
      }, 400);
  };

  const handleResultClick = (result: any) => {
      setShowResults(false);
      setSearchQuery('');
      
      if (result.rank) {
          // If it's a chart entry, route to A&R Dashboard
          onNavigate('ar-dashboard');
      } else if (result.source === 'Chartmetric') {
          // If it's a Chartmetric artist, route to Analytics
          onArtistSelect?.(result.id);
          onNavigate('analytics');
      } else {
          // Default to profile/search view
          onNavigate('profile');
      }
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between transition-colors duration-200">
      
      <div className="flex items-center gap-6">
         <button onClick={onMenuClick} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden">
             <Menu className="w-6 h-6" />
         </button>

         <div className="hidden lg:flex items-center gap-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 overflow-hidden max-w-[280px]">
            <div className="flex items-center gap-1.5 animate-in slide-in-from-left duration-700">
                {tokenPrices.slice(0, 3).map(token => (
                    <div key={token.symbol} className="flex items-center gap-1 px-2 border-r border-slate-200 dark:border-slate-800 last:border-0">
                        <span className="text-[10px] font-black text-slate-500 uppercase">{token.symbol}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white">${token.price.toFixed(2)}</span>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* GLOBAL LIVE SEARCH */}
      <div className="relative w-96 hidden md:block" ref={searchRef}>
        <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isSearching ? 'text-cyan-500' : 'text-slate-400'}`} />
        <input 
          type="text" 
          value={searchQuery}
          onFocus={() => searchQuery.length >= 2 && setShowResults(true)}
          onChange={handleSearchChange}
          placeholder="Search Live Billboard & Spotify..." 
          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 dark:focus:ring-white/10 transition-all placeholder:text-slate-500"
        />
        {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-3 h-3 animate-spin text-cyan-500" /></div>}
        
        {showResults && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[600px] overflow-y-auto animate-in slide-in-from-top-2 duration-200 custom-scrollbar">
                {searchResults.length > 0 ? (
                    <div className="py-2">
                        <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 sticky top-0 z-10 backdrop-blur-sm">
                            Neural Discovery Results ({searchResults.length})
                        </div>
                        {searchResults.map((res, idx) => (
                            <button 
                                key={idx}
                                onClick={() => handleResultClick(res)}
                                className="w-full flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-100 dark:border-slate-800 last:border-0 transition-colors group"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="relative shrink-0">
                                        <img src={res.image || res.image_url} className="w-10 h-10 rounded-lg object-cover bg-slate-800" alt={res.title || res.name} />
                                        {res.rank && (
                                            <div className="absolute -top-1.5 -left-1.5 bg-red-600 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white dark:border-slate-900">
                                                {res.rank}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-left min-w-0">
                                        <div className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-cyan-500">{res.title || res.name}</div>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-[10px] text-slate-500 truncate">{res.artist || 'Artist'}</span>
                                            {res.trending && (
                                                <span className="flex items-center gap-0.5 text-[8px] font-black text-pink-500 uppercase tracking-tighter">
                                                    <TrendingUp className="w-2 h-2" /> Trending
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{res.source}</span>
                                    {res.is_verified && <CheckCircle2 className="w-3 h-3 text-cyan-500" />}
                                </div>
                            </button>
                        ))}
                        <div className="p-4 text-center border-t border-slate-100 dark:border-slate-800">
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">End of Deep Results</p>
                        </div>
                    </div>
                ) : !isSearching && searchQuery.length >= 2 && (
                    <div className="p-8 text-center text-slate-500 animate-in fade-in">
                        <AlertCircle className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium">No matches found on Billboard or Spotify.</p>
                        <p className="text-[10px] mt-1 opacity-50 uppercase tracking-widest">Global Scan Complete</p>
                    </div>
                )}
            </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative" ref={quickActionRef}>
            <button onClick={() => setShowQuickActions(!showQuickActions)} className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-cyan-500 hover:text-white transition-all shadow-sm">
                <Plus className="w-5 h-5" />
            </button>
            {showQuickActions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95">
                    <button onClick={() => { onUpload(); setShowQuickActions(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Upload className="w-4 h-4 text-cyan-500" /> New Upload
                    </button>
                    <button onClick={() => { onNavigate('studio'); setShowQuickActions(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Music className="w-4 h-4 text-purple-500" /> AI Studio Session
                    </button>
                </div>
            )}
        </div>

        <div className="relative" ref={walletRef}>
            {walletAddress ? (
                <button onClick={() => setShowWalletMenu(!showWalletMenu)} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-full transition-colors text-xs font-bold text-slate-900 dark:text-slate-200 shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </button>
            ) : (
                <button onClick={() => setShowWalletMenu(!showWalletMenu)} disabled={isConnecting} className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-indigo-500/20">
                    Connect Ledger
                </button>
            )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-full bg-slate-800 border-2 border-white dark:border-slate-800 overflow-hidden shadow-lg group-hover:border-cyan-500 transition-all">
                {user?.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white font-bold">{user?.displayName?.[0]}</div>}
            </div>
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 py-2">
                <button onClick={() => { onNavigate('profile'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <UserIcon className="w-4 h-4 text-slate-400" /> Artist Profile
                </button>
                <button onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800">
                    <Settings className="w-4 h-4 text-slate-400" /> Studio Config
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                <button onClick={onLogout} className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10">
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
