import React, { useEffect, useState } from 'react';
// Added Plus to the lucide-react imports to fix missing name error on line 292
import { Search, Filter, TrendingUp, Music, Star, Zap, CheckCircle2, Sliders, PlayCircle, Loader2, ArrowUp, ArrowDown, Minus, X, Crown, ChevronRight, AlertCircle, Plus } from 'lucide-react';
import { Track, User } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { RapidApiAgent, BillboardEntry } from '../services/rapidApiService';
import { FEATURED_ARTISTS } from '../constants';

// Extended type for UI filtering
interface ExtendedBillboardEntry extends BillboardEntry {
    genre?: string;
}

const MOCK_GENRES = ['Pop', 'Hip Hop', 'R&B', 'Country', 'Electronic', 'Rock'];

export const ARDashboard: React.FC = () => {
  const { playTrack } = usePlayer();
  const [chartData, setChartData] = useState<ExtendedBillboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering State
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
      trend: 'all', // all, rising, falling, new
      genre: 'all'  // all, pop, hiphop, etc.
  });

  // Fetch Real Billboard Data on Mount
  useEffect(() => {
      const loadCharts = async () => {
          setLoading(true);
          const realData = await RapidApiAgent.getBillboardHot100();
          
          if (realData && realData.length > 0) {
              const enhancedData = realData.map(item => ({
                  ...item,
                  genre: MOCK_GENRES[Math.floor(Math.random() * MOCK_GENRES.length)]
              }));
              setChartData(enhancedData);
          } else {
              setChartData([
                  { rank: 1, title: "Cruel Summer", artist: "Taylor Swift", image: "https://charts-static.billboard.com/img/2019/09/taylor-swift-90f-cruel-summer-155x155.jpg", last_week: 1, peak_position: 1, weeks_on_chart: 20, genre: 'Pop' },
                  { rank: 2, title: "Paint The Town Red", artist: "Doja Cat", image: "https://charts-static.billboard.com/img/2023/08/doja-cat-87d-paint-the-town-red-155x155.jpg", last_week: 3, peak_position: 2, weeks_on_chart: 8, genre: 'Hip Hop' },
                  { rank: 3, title: "Snooze", artist: "SZA", image: "https://charts-static.billboard.com/img/2022/12/sza-59z-snooze-155x155.jpg", last_week: 2, peak_position: 2, weeks_on_chart: 42, genre: 'R&B' }
              ]);
          }
          setLoading(false);
      };
      loadCharts();
  }, []);

  const getRankChangeIcon = (current: number, last: number) => {
      if (last === 0) return <span className="text-blue-400 text-[10px] font-bold">NEW</span>;
      if (current < last) return <ArrowUp className="w-3 h-3 text-green-500" />;
      if (current > last) return <ArrowDown className="w-3 h-3 text-red-500" />;
      return <Minus className="w-3 h-3 text-slate-500" />;
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      const target = e.target as HTMLImageElement;
      // Replace with a high-fidelity placeholder that matches the brand
      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent('Sync')}&background=0f172a&color=334155&size=200`;
      // Optionally hide the broken image and show a themed div, but src replacement is cleaner
  };

  const filteredChart = chartData.filter(item => {
      if (activeFilters.genre !== 'all' && item.genre !== activeFilters.genre) return false;
      if (activeFilters.trend === 'rising') return item.rank < item.last_week && item.last_week !== 0;
      if (activeFilters.trend === 'falling') return item.rank > item.last_week && item.last_week !== 0;
      if (activeFilters.trend === 'new') return item.last_week === 0;
      return true;
  });

  return (
    <div className="space-y-8 pb-24">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    <Zap className="w-3 h-3" /> A&R Pro Suite
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Discovery Dashboard</h1>
                <p className="text-slate-400">
                    Find the next breakout hit before it charts. AI-powered A&R signals, Billboard data, and sync-ready filtering.
                </p>
            </div>
        </div>

        {/* FEATURED SPOTLIGHT CAROUSEL */}
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-amber-400" /> Featured Talent
                </h3>
                <button className="text-xs text-slate-400 hover:text-white flex items-center gap-1">View All <ChevronRight className="w-3 h-3"/></button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {FEATURED_ARTISTS.map((artist) => (
                    <div key={artist.uid} className="bg-slate-800/50 rounded-xl overflow-hidden border border-amber-500/20 group hover:border-amber-500/50 transition-all cursor-pointer relative">
                        <div className="h-24 bg-slate-900 relative">
                            <img 
                                src={artist.photoURL} 
                                alt={artist.displayName} 
                                onError={handleImageError}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" 
                            />
                            <div className="absolute top-2 right-2 bg-amber-500 text-slate-900 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                                Spotlight
                            </div>
                        </div>
                        <div className="p-4 relative">
                            <div className="absolute -top-8 left-4 w-14 h-14 rounded-full border-2 border-slate-900 overflow-hidden bg-slate-800">
                                <img src={artist.photoURL} onError={handleImageError} className="w-full h-full object-cover" />
                            </div>
                            <div className="mt-6">
                                <h4 className="font-bold text-white text-lg">{artist.displayName}</h4>
                                <p className="text-xs text-slate-400 mb-3">{artist.bio?.substring(0, 50)}...</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded capitalize">{artist.role}</span>
                                    {artist.rates?.featureVerse && <span className="text-[10px] bg-green-900/30 text-green-400 border border-green-500/20 px-2 py-0.5 rounded">Feat: ${artist.rates?.featureVerse}</span>}
                                </div>
                                <button className="w-full py-2 bg-white text-slate-900 text-xs font-bold rounded hover:bg-slate-200 transition-colors">
                                    View Profile
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Signals */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
                { label: "Trending on TikTok", val: "12 Tracks", color: "text-pink-500", icon: TrendingUp },
                { label: "High Sync Potential", val: "45 Tracks", color: "text-green-500", icon: CheckCircle2 },
                { label: "Unsigned Gems", val: "8 Artists", color: "text-cyan-500", icon: Star },
                { label: "New Uploads (24h)", val: "156", color: "text-purple-500", icon: Music },
            ].map((s, i) => (
                <div key={i} className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.val}</div>
                        <div className="text-xs text-slate-500">{s.label}</div>
                    </div>
                    <div className={`p-3 rounded-full bg-slate-100 dark:bg-slate-800 ${s.color}`}>
                        <s.icon className="w-5 h-5" />
                    </div>
                </div>
            ))}
        </div>

        {/* Discovery Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center relative">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-500" /> Real-Time Billboard Hot 100
                    </h3>
                    <div className="flex gap-2 relative">
                        <button 
                            onClick={() => setShowFilters(!showFilters)}
                            className={`text-xs flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors border border-transparent ${
                                showFilters 
                                ? 'bg-cyan-500 text-slate-950 shadow-md' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
                            }`}
                        >
                            <Sliders className="w-3 h-3" /> Filters
                        </button>

                        {showFilters && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-30 p-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex justify-between items-center mb-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase">Filter Chart</h4>
                                    <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-white">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1.5 block font-bold">Trend</label>
                                        <select 
                                            value={activeFilters.trend}
                                            onChange={(e) => setActiveFilters({...activeFilters, trend: e.target.value})}
                                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        >
                                            <option value="all">All Trends</option>
                                            <option value="rising">Rising (Rank Up)</option>
                                            <option value="falling">Falling (Rank Down)</option>
                                            <option value="new">New Entries</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-500 mb-1.5 block font-bold">Genre</label>
                                        <select 
                                            value={activeFilters.genre}
                                            onChange={(e) => setActiveFilters({...activeFilters, genre: e.target.value})}
                                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                        >
                                            <option value="all">All Genres</option>
                                            {MOCK_GENRES.map(g => (
                                                <option key={g} value={g}>{g}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                        <p className="text-xs">Fetching RapidAPI Billboard Data...</p>
                    </div>
                ) : filteredChart.length === 0 ? (
                    <div className="h-48 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                        <Filter className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm">No tracks match your filters.</p>
                        <button 
                            onClick={() => setActiveFilters({trend: 'all', genre: 'all'})}
                            className="text-xs text-cyan-500 hover:underline mt-2"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredChart.map((item) => (
                            <div 
                                key={item.rank} 
                                className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/50 transition-all cursor-pointer group"
                            >
                                <div className="text-2xl font-bold text-slate-300 w-8 text-center">{item.rank}</div>
                                
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 shadow-md bg-slate-800">
                                    <img 
                                        src={item.image} 
                                        alt={item.title} 
                                        onError={handleImageError}
                                        className="w-full h-full object-cover transition-opacity duration-300" 
                                    />
                                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-transparent transition-colors"></div>
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base truncate uppercase tracking-tight italic">{item.title}</h4>
                                    <div className="flex items-center gap-2">
                                        <p className="text-slate-500 text-sm truncate font-medium">{item.artist}</p>
                                        {item.genre && (
                                            <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-black uppercase tracking-widest">{item.genre}</span>
                                        )}
                                    </div>
                                    <div className="flex gap-4 mt-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        <span className="flex items-center gap-1">
                                            {getRankChangeIcon(item.rank, item.last_week)}
                                            {item.last_week === 0 ? '' : `Prev: ${item.last_week}`}
                                        </span>
                                        <span>Peak: {item.peak_position}</span>
                                        <span>Weeks: {item.weeks_on_chart}</span>
                                    </div>
                                </div>

                                <button className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-all">
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="lg:col-span-1">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 h-full shadow-inner">
                    <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-tight italic">A&R Pulse Alerts</h3>
                    <div className="space-y-4">
                        {['Energetic Pop for Ads', 'Cinematic Strings', 'Indie Folk Female Vocals', 'Dark Trap Beats'].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl hover:bg-slate-900 transition-all cursor-pointer border border-slate-800/50 hover:border-purple-500/30 group">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                                        <Search className="w-4 h-4 text-purple-400" />
                                    </div>
                                    <span className="text-xs text-slate-300 font-bold uppercase tracking-tight">{s}</span>
                                </div>
                                <span className="bg-purple-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">3 New</span>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-10 py-4 border-2 border-dashed border-slate-800 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white hover:border-slate-500 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-4 h-4" /> Create Search Node
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
