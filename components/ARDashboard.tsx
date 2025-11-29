import React from 'react';
import { Search, Filter, TrendingUp, Music, Star, Zap, CheckCircle2, Sliders, PlayCircle } from 'lucide-react';
import { Track } from '../types';

interface ARDashboardProps {
  onPlayTrack: (track: Track) => void;
}

export const ARDashboard: React.FC<ARDashboardProps> = ({ onPlayTrack }) => {
  return (
    <div className="space-y-8 pb-24">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                    <Zap className="w-3 h-3" /> A&R Pro Suite
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">Discovery Dashboard</h1>
                <p className="text-slate-400">
                    Find the next breakout hit before it charts. AI-powered A&R signals, similarity search, and sync-ready filtering.
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
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Recommendations</h3>
                    <div className="flex gap-2">
                        <button className="text-xs flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg text-slate-600 dark:text-slate-300">
                            <Sliders className="w-3 h-3" /> Filters
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((_, i) => (
                        <div key={i} className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex gap-4 hover:border-cyan-500/50 transition-all cursor-pointer group">
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                <img src={`https://picsum.photos/200/200?random=${i + 30}`} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <PlayCircle className="w-10 h-10 text-white" />
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-lg">Neon Heartbreak</h4>
                                        <p className="text-slate-500 text-sm">Artist: <span className="text-cyan-600 dark:text-cyan-400">Midnight Vibe</span></p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-green-500 font-bold text-sm">98% Match</div>
                                        <div className="text-xs text-slate-500">Brief: Car Commercial</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mb-3">
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 rounded">Pop</span>
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 rounded">Upbeat</span>
                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded border border-green-200 dark:border-green-800">Clearable</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-slate-100 dark:border-slate-800">
                                    <div className="text-xs text-slate-400 flex gap-4">
                                        <span>Plays: 45k</span>
                                        <span>TikTok: +15%</span>
                                    </div>
                                    <button className="text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:underline">View Rights Holder</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="lg:col-span-1">
                <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 h-full">
                    <h3 className="text-lg font-bold text-white mb-4">Saved Searches</h3>
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