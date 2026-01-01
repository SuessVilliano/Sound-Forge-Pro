
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, ChevronDown, Upload, Menu, Sun, Moon, Crown, LogOut, User as UserIcon, Settings, CreditCard, X, Loader2, Music, Play, Wallet } from 'lucide-react';
import { User, Track } from '../types';
import { searchArtists, searchTracks, ChartmetricArtist, ChartmetricTrackResult } from '../services/chartmetricService';
import { RapidApiAgent } from '../services/rapidApiService'; // Import the robust fallback agent
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
    { id: 1, title: "New Opportunity Match", desc: "Your track 'Neon' fits a new car ad brief.", time: "2m ago", unread: true },
    { id: 2, title: "Royalty Payment", desc: "You received $1,240.50 from DistroKid.", time: "1h ago", unread: false },
    { id: 3, title: "Analysis Complete", desc: "Mastering for 'Summer Breeze' is ready.", time: "3h ago", unread: false },
    { id: 4, title: "Voice License Request", desc: "Ubisoft wants to license your voice clone.", time: "1d ago", unread: true }
];

export const Header: React.FC<HeaderProps> = ({ onMenuClick, theme, toggleTheme, user, onUpgrade, onLogout, onNavigate, onUpload, onArtistSelect }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showWalletMenu, setShowWalletMenu] = useState(false);
  
  // Wallet State
  const { walletAddress, isConnecting, connectTipLink, connectPhantom, disconnectWallet, walletType } = useWallet();

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [artistResults, setArtistResults] = useState<ChartmetricArtist[]>([]);
  const [trackResults, setTrackResults] = useState<ChartmetricTrackResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const walletRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  const { playTrack } = usePlayer();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
      if (walletRef.current && !walletRef.current.contains(event.target as Node)) {
        setShowWalletMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      
      if (query.length < 2) {
          setArtistResults([]);
          setTrackResults([]);
          setShowResults(false);
          return;
      }

      setIsSearching(true);
      setShowResults(true);

      // Debounce search
      searchTimeoutRef.current = window.setTimeout(async () => {
          try {
              // Try Chartmetric first
              const [artists, tracks] = await Promise.all([
                  searchArtists(query),
                  searchTracks(query)
              ]);
              
              if (artists.length > 0 || tracks.length > 0) {
                  setArtistResults(artists);
                  setTrackResults(tracks);
              } else {
                  // Fallback to RapidAPI simulation if CM fails/empty
                  const fallbackTracks = await RapidApiAgent.searchSpotify(query);
                  // Map fallback tracks to result format
                  const mapped = fallbackTracks.map(t => ({
                      id: parseInt(t.id) || Date.now(), 
                      name: t.title,
                      artist_names: [t.artist],
                      image_url: t.image,
                      code2: ''
                  }));
                  setTrackResults(mapped as any);
                  setArtistResults([]); 
              }
          } catch (error) {
              console.error("Search failed", error);
          } finally {
              setIsSearching(false);
          }
      }, 500);
  };

  const handleSelectArtist = (artist: ChartmetricArtist) => {
      setSearchQuery('');
      setShowResults(false);
      if (onArtistSelect) {
          onArtistSelect(artist.id);
      }
      onNavigate('analytics');
  };

  const handleSelectTrack = (trackResult: ChartmetricTrackResult) => {
      setSearchQuery('');
      setShowResults(false);
      
      // Convert to app Track type for player
      const track: Track = {
          id: `cm_${trackResult.id}`,
          title: trackResult.name,
          artist: trackResult.artist_names[0],
          image: trackResult.image_url,
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Mock audio as CM search doesn't provide it
          bpm: 120, // Default placeholder
          key: 'C',
          mood_tags: [],
          duration: '3:00',
          plays: 0,
          earnings: 0
      };

      playTrack(track);
  };

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between transition-colors duration-200">
      
      <div className="flex items-center gap-3 md:hidden">
         <button onClick={onMenuClick} className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
             <Menu className="w-6 h-6" />
         </button>
      </div>

      {/* Search */}
      <div className="relative w-96 hidden md:block" ref={searchRef}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 w-4 h-4" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search artists & tracks..." 
          className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full py-2 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-slate-500 dark:placeholder:text-slate-600"
        />
        {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            </div>
        )}
        
        {/* Search Results Dropdown */}
        {showResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden z-50 max-h-[500px] overflow-y-auto">
                {(artistResults.length > 0 || trackResults.length > 0) ? (
                    <div>
                        {/* Artists Section */}
                        {artistResults.length > 0 && (
                            <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                                <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">Artists</div>
                                <ul>
                                    {artistResults.map(artist => (
                                        <li 
                                            key={artist.id} 
                                            onClick={() => handleSelectArtist(artist)}
                                            className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            <img src={artist.image_url} alt={artist.name} className="w-10 h-10 rounded-full object-cover bg-slate-800" />
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 dark:text-white">{artist.name}</p>
                                                <p className="text-xs text-slate-500">{artist.code2 || 'Artist'}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Tracks Section */}
                        {trackResults.length > 0 && (
                            <div>
                                <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">Tracks</div>
                                <ul>
                                    {trackResults.map(track => (
                                        <li 
                                            key={track.id} 
                                            onClick={() => handleSelectTrack(track)}
                                            className="flex items-center gap-3 p-3 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            <img src={track.image_url} alt={track.name} className="w-10 h-10 rounded-md object-cover bg-slate-800" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{track.name}</p>
                                                <p className="text-xs text-slate-500 truncate">{track.artist_names.join(', ')}</p>
                                            </div>
                                            <div className="p-2 text-cyan-500 opacity-0 group-hover:opacity-100">
                                                <Play className="w-3 h-3 fill-current" />
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    !isSearching && searchQuery.length >= 2 && (
                        <div className="p-4 text-center text-sm text-slate-500">No results found</div>
                    )
                )}
            </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        
        {/* Wallet Connection */}
        <div className="relative" ref={walletRef}>
            {walletAddress ? (
                <button 
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors text-xs font-bold text-slate-900 dark:text-slate-200"
                >
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
                </button>
            ) : (
                <button 
                    onClick={() => setShowWalletMenu(!showWalletMenu)}
                    disabled={isConnecting}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-full text-xs font-bold hover:shadow-lg transition-all"
                >
                    {isConnecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wallet className="w-3 h-3" />}
                    Connect Wallet
                </button>
            )}

            {/* Wallet Dropdown */}
            {showWalletMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {!walletAddress ? (
                        <div className="p-2">
                            <div className="px-3 py-2 text-xs font-bold text-slate-500 uppercase">Select Wallet</div>
                            <button 
                                onClick={() => { connectTipLink(); setShowWalletMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 rounded-lg transition-colors"
                            >
                                <img src="https://tiplink.io/favicon.ico" className="w-4 h-4 rounded-full" /> TipLink (Google)
                            </button>
                            <button 
                                onClick={() => { connectPhantom(); setShowWalletMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 rounded-lg transition-colors"
                            >
                                <img src="https://phantom.app/img/phantom-logo.svg" className="w-4 h-4" /> Phantom
                            </button>
                        </div>
                    ) : (
                        <div className="p-2">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                                <p className="text-xs text-slate-500 mb-1">Connected with {walletType}</p>
                                <p className="text-sm font-bold truncate">{walletAddress}</p>
                            </div>
                            <button 
                                onClick={() => { disconnectWallet(); setShowWalletMenu(false); }}
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 rounded-lg transition-colors"
                            >
                                <LogOut className="w-3 h-3" /> Disconnect
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>

        <button 
          onClick={toggleTheme}
          className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:block"
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

        <button 
          onClick={onUpload}
          className="hidden md:flex bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-full text-sm font-semibold items-center gap-2 transition-colors"
        >
          <Upload className="w-4 h-4" />
          <span>Upload</span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full transition-colors ${showNotifications ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                    <button className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline">Mark all read</button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                    {MOCK_NOTIFICATIONS.map((notif) => (
                        <div key={notif.id} className={`p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer ${notif.unread ? 'bg-cyan-50/50 dark:bg-cyan-900/10' : ''}`}>
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-sm font-bold ${notif.unread ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300'}`}>{notif.title}</span>
                                {notif.unread && <span className="w-2 h-2 rounded-full bg-cyan-500"></span>}
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{notif.desc}</p>
                            <span className="text-[10px] text-slate-400 mt-2 block">{notif.time}</span>
                        </div>
                    ))}
                </div>
                <div className="p-3 text-center border-t border-slate-200 dark:border-slate-800">
                    <button className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">View All Activity</button>
                </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative pl-4 border-l border-slate-200 dark:border-slate-800" ref={profileRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 overflow-hidden ring-2 ring-white dark:ring-slate-800 shadow-sm">
                {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs">
                        {user?.displayName?.[0] || 'U'}
                    </div>
                )}
            </div>
            <div className="hidden lg:block text-left">
                <p className="text-sm font-medium text-slate-900 dark:text-white leading-none">{user?.displayName || 'Artist'}</p>
                <div className="flex items-center gap-1 mt-0.5">
                    <p className="text-xs text-slate-500 capitalize">{user?.plan} Plan</p>
                    {user?.plan !== 'free' && <Crown className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 lg:hidden">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.displayName}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                
                <div className="py-1">
                    <button 
                        onClick={() => { onNavigate('profile'); setShowProfileMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                    >
                        <UserIcon className="w-4 h-4 text-slate-400" /> My Profile
                    </button>
                    <button 
                        onClick={() => { onNavigate('settings'); setShowProfileMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                    >
                        <Settings className="w-4 h-4 text-slate-400" /> Account Settings
                    </button>
                    <button 
                        onClick={() => { onUpgrade(); setShowProfileMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors"
                    >
                        <CreditCard className="w-4 h-4 text-slate-400" /> Billing & Plans
                    </button>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                <button 
                    onClick={() => { onLogout(); setShowProfileMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors"
                >
                    <LogOut className="w-4 h-4" /> Sign Out
                </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
