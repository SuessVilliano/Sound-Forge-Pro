
import React, { useEffect, useState } from 'react';
import { Search, Filter, TrendingUp, Music, Star, Zap, CheckCircle2, Sliders, PlayCircle, Loader2, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Track } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { RapidApiAgent, BillboardEntry } from '../services/rapidApiService';

export const ARDashboard: React.FC = () => {
  const { playTrack } = usePlayer();
  const [chartData, setChartData] = useState<BillboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Real Billboard Data on Mount
  useEffect(() => {
      const loadCharts = async () => {
          setLoading(true);
          // Try to fetch real data
          const realData = await RapidApiAgent.getBillboardHot100();
          
          if (realData && realData.length > 0) {
              setChartData(realData);
          } else {
              // Fallback Mock if API Rate Limited or Fails
              setChartData([
                  { rank: 1, title: "Cruel Summer", artist: "Taylor Swift", image: "https://charts-static.billboard.com/img/2019/09/taylor-swift-90f-cruel-summer-155x155.jpg", last_week: 1, peak_position: 1, weeks_on_chart: 20 },
                  { rank: 2, title: "Paint The Town Red", artist: "Doja Cat", image: "https://charts-static.billboard.com/img/2023/08/doja-cat-87d-paint-the-town-red-155x155.jpg", last_week: 3, peak_position: 2, weeks_on_chart: 8 },
                  { rank: 3, title: "Snooze", artist: "SZA", image: "https://charts-static.billboard.com/img/2022/12/sza-59z-snooze-155x155.jpg", last_week: 2, peak_position: 2, weeks_on_chart: 42 }
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
            {/* Main Chart Feed */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-red-500" /> Real-Time Billboard Hot 100
                    </h3>
                    <div className="flex gap-2">
                        <button className="text-xs flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300">
                            <Sliders className="w-3 h-3" /> Filters
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-500">
                        <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                        <p className="text-xs">Fetching RapidAPI Billboard Data...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {chartData.map((item) => (
                            <div 
                                key={item.rank} 
                                className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center gap-4 hover:border-purple-500/50 transition-all cursor-pointer group"
                            >
                                <div className="text-2xl font-bold text-slate-300 w-8 text-center">{item.rank}</div>
                                
                                <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 shadow-md">
                                    <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base truncate">{item.title}</h4>
                                    <p className="text-slate-500 text-sm truncate">{item.artist}</p>
                                    <div className="flex gap-4 mt-2 text-xs text-slate-400">
                                        <span className="flex items-center gap-1">
                                            {getRankChangeIcon(item.rank, item.last_week)}
                                            {item.last_week === 0 ? '' : `Prev: ${item.last_week}`}
                                        </span>
                                        <span>Peak: {item.peak_position}</span>
                                        <span>Weeks: {item.weeks_on_chart}</span>
                                    </div>
                                </div>

                                <button className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-purple-500 transition-colors">
                                    <Search className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Saved Searches & Alerts */}
            <div className="lg:col-span-1">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 h-full">
                    <h3 className="text-lg font-bold text-white mb-4">A&R Alerts</h3>
                    <div className="space-y-3">
                        {['Energetic Pop for Ads', 'Cinematic Strings', 'Indie Folk Female Vocals', 'Dark Trap Beats'].map((s, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <Search className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm text-slate-300">{s}</span>
                                </div>
                                <span className="bg-purple-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">3 New</span>
                            </div>
                        ))}
                    </div>
                    
                    <button className="w-full mt-6 py-3 border border-dashed border-slate-700 rounded-lg text-slate-400 text-sm font-bold hover:text-white hover:border-slate-500 transition-colors flex items-center justify-center gap-2">
                        <Search className="w-4 h-4" /> Create Alert
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};
