
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, Upload, Menu, Sun, Moon, Crown, LogOut, User as UserIcon, Settings, CreditCard, X, Loader2, Music, Play, Wallet, Zap, Plus, Swords, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { User, Track } from '../types';
import { searchArtists, searchTracks, ChartmetricArtist, ChartmetricTrackResult } from '../services/chartmetricService';
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

const MOCK_NOTIFICATIONS = [
    { id: 1, title: 'New Sync Match', text: 'AI found a match for "Midnight City" with Netflix.', type: 'match', time: '2m ago', read: false },
    { id: 2, title: 'Royalties Received', text: '◎0.45 SOL deposited from SoundExchange.', type: 'payment', time: '1h ago', read: false },
    { id: 3, title: 'VoiceShield Alert', text: 'Unauthorized clone detected on TikTok.', type: 'alert', time: '5h ago', read: true },
];

export const Header: React.FC<HeaderProps> = ({ onMenuClick, theme, toggleTheme, user, onUpgrade, onLogout, onNavigate, onUpload, onArtistSelect }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  const { walletAddress, isConnecting, connectTipLink, connectPhantom, disconnectWallet, walletType, tokenPrices } = useWallet();
  const { playTrack } = usePlayer();

  const [searchQuery, setSearchQuery] = useState('');
  const [artistResults, setArtistResults] = useState<ChartmetricArtist[]>([]);
  const [trackResults, setTrackResults] = useState<ChartmetricTrackResult[]>([]);
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
              const [artists, tracks] = await Promise.all([searchArtists(query), searchTracks(query)]);
              setArtistResults(artists);
              setTrackResults(tracks);
          } catch (error) { console.error(error); } finally { setIsSearching(false); }
      }, 500);
  };

  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between transition-colors duration-200">
      
      <div className="flex items-center gap-6">
         <button onClick={onMenuClick} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white md:hidden">
             <Menu className="w-6 h-6" />
         </button>

         {/* REAL-TIME TOKEN TICKER */}
         <div className="hidden lg:flex items-center gap-4 bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-1.5 overflow-hidden max-w-[280px]">
            <div className="flex items-center gap-1.5 animate-in slide-in-from-left duration-700">
                {tokenPrices.slice(0, 3).map(token => (
                    <div key={token.symbol} className="flex items-center gap-1 px-2 border-r border-slate-200 dark:border-slate-800 last:border-0">
                        <span className="text-[10px] font-black text-slate-500 uppercase">{token.symbol}</span>
                        <span className="text-[10px] font-mono font-bold text-slate-900 dark:text-white">${token.price.toFixed(2)}</span>
                        <span className={`text-[8px] font-bold ${token.percent_change_24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {token.percent_change_24h >= 0 ? '↑' : '↓'}
                        </span>
                    </div>
                ))}
            </div>
         </div>
      </div>

      {/* Search */}
      <div className="relative w-96 hidden md:block" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search metadata, artists, rights..." 
          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500 transition-all"
        />
        {isSearching && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-4 h-4 animate-spin text-cyan-500" /></div>}
        
        {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 max-h-[500px] overflow-y-auto">
                {(artistResults.length > 0 || trackResults.length > 0) ? (
                    <div>
                        {artistResults.length > 0 && (
                            <div className="border-b border-slate-100 dark:border-slate-800">
                                <div className="px-3 py-2 text-[10px] font-black text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50 tracking-widest">Artists</div>
                                <ul>
                                    {artistResults.map(artist => (
                                        <li key={artist.id} onClick={() => { onArtistSelect?.(artist.id); onNavigate('analytics'); setShowResults(false); }} className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                                            <img src={artist.image_url} className="w-8 h-8 rounded-full object-cover" />
                                            <span className="text-sm font-bold">{artist.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : !isSearching && searchQuery.length >= 2 && (
                    <div className="p-4 text-center text-sm text-slate-500">No assets found</div>
                )}
            </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        
        {/* QUICK ACTIONS */}
        <div className="relative" ref={quickActionRef}>
            <button 
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-cyan-500 hover:text-white transition-all shadow-sm"
            >
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
                    <button onClick={() => { onNavigate('battles'); setShowQuickActions(false); }} className="w-full text-left px-4 py-2.5 text-sm font-bold flex items-center gap-3 hover:bg-slate-100 dark:hover:bg-slate-800">
                        <Swords className="w-4 h-4 text-red-500" /> Start Battle
                    </button>
                </div>
            )}
        </div>

        {/* NOTIFICATIONS */}
        <div className="relative" ref={notifyRef}>
            <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all shadow-sm relative"
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                        {unreadCount}
                    </span>
                )}
            </button>
            {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-between items-center">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">Activity Log</h4>
                        <span className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">Real-time</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {MOCK_NOTIFICATIONS.map((n) => (
                            <div key={n.id} className={`p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${!n.read ? 'bg-cyan-500/5' : ''}`}>
                                <div className="flex items-start gap-3">
                                    <div className={`p-2 rounded-lg shrink-0 ${
                                        n.type === 'match' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600' :
                                        n.type === 'payment' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                        'bg-red-100 dark:bg-red-900/30 text-red-600'
                                    }`}>
                                        {n.type === 'match' && <Zap className="w-4 h-4" />}
                                        {n.type === 'payment' && <CreditCard className="w-4 h-4" />}
                                        {/* Added AlertCircle from lucide-react */}
                                        {n.type === 'alert' && <AlertCircle className="w-4 h-4" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{n.title}</h5>
                                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.text}</p>
                                        <span className="text-[10px] text-slate-400 mt-2 block font-mono uppercase">{n.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-950 transition-colors border-t border-slate-100 dark:border-slate-800">
                        View All Notifications
                    </button>
                </div>
            )}
        </div>

        {/* Wallet Connection */}
        <div className="relative" ref={walletRef}>
            {walletAddress ? (
                <button 
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-full transition-colors text-xs font-bold text-slate-900 dark:text-slate-200 shadow-sm"
                >
                    <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </button>
            ) : (
                <button 
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    disabled={isConnecting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-full text-xs font-bold transition-all shadow-lg shadow-indigo-500/20"
                >
                    Connect Ledger
                </button>
            )}
        </div>

        {/* Profile Menu */}
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
