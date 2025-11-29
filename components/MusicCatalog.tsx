import React, { useState } from 'react';
import { Search, Filter, Play, Heart, Download, Share2, MoreHorizontal, Music } from 'lucide-react';
import { Track } from '../types';

interface MusicCatalogProps {
  onPlayTrack: (track: Track) => void;
}

// Mock Catalog Data
const CATALOG: Track[] = [
    { id: 'c1', title: 'Midnight City', artist: 'Neon Dreams', bpm: 128, key: 'Am', mood_tags: ['Synthwave', 'Driving'], duration: '3:45', plays: 152000, earnings: 0, image: 'https://picsum.photos/300/300?random=10', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', licenseType: 'sync-ready' },
    { id: 'c2', title: 'Golden Hour', artist: 'Solar Beats', bpm: 95, key: 'C', mood_tags: ['Chill', 'Lo-Fi'], duration: '2:30', plays: 89000, earnings: 0, image: 'https://picsum.photos/300/300?random=11', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', licenseType: 'exclusive' },
    { id: 'c3', title: 'Cyber War', artist: 'Glitch Mob', bpm: 140, key: 'Dm', mood_tags: ['Dark', 'Industrial'], duration: '4:10', plays: 45000, earnings: 0, image: 'https://picsum.photos/300/300?random=12', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', licenseType: 'non-exclusive' },
    { id: 'c4', title: 'Ocean Breeze', artist: 'Acoustic Soul', bpm: 85, key: 'G', mood_tags: ['Acoustic', 'Happy'], duration: '3:15', plays: 67000, earnings: 0, image: 'https://picsum.photos/300/300?random=13', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', licenseType: 'sync-ready' },
];

export const MusicCatalog: React.FC<MusicCatalogProps> = ({ onPlayTrack }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredTracks = CATALOG.filter(t => 
    (filter === 'all' || t.licenseType === filter) &&
    (t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Music Catalog</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Discover sync-ready tracks from top AI artists.</p>
            </div>
            
            <div className="flex gap-2">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search tracks..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 w-64"
                    />
                </div>
                <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <Filter className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                </button>
            </div>
        </div>

        {/* Featured / Trending */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl p-8 relative overflow-hidden group cursor-pointer">
                <div className="relative z-10">
                    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white mb-4 inline-block">Trending Now</span>
                    <h2 className="text-3xl font-bold text-white mb-2">Cyberpunk Collection</h2>
                    <p className="text-purple-200 mb-6">Dark, gritty, and futuristic synthwave tracks.</p>
                    <button className="bg-white text-purple-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-purple-100 transition-colors">Explore</button>
                </div>
                <img src="https://picsum.photos/600/400?random=20" className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" alt="Featured" />
            </div>
            <div className="bg-gradient-to-br from-cyan-900 to-teal-900 rounded-2xl p-8 relative overflow-hidden group cursor-pointer">
                <div className="relative z-10">
                    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white mb-4 inline-block">New Arrivals</span>
                    <h2 className="text-3xl font-bold text-white mb-2">Lo-Fi Beats</h2>
                    <p className="text-cyan-200 mb-6">Chill vibes for study and relaxation.</p>
                    <button className="bg-white text-teal-900 px-6 py-2 rounded-full font-bold text-sm hover:bg-teal-100 transition-colors">Explore</button>
                </div>
                <img src="https://picsum.photos/600/400?random=21" className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" alt="Featured" />
            </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'sync-ready', 'exclusive', 'non-exclusive'].map(f => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all ${
                        filter === f 
                        ? 'bg-cyan-500 text-slate-950' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                >
                    {f.replace('-', ' ')}
                </button>
            ))}
        </div>

        {/* Track List */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <th className="py-4 pl-6 w-12">#</th>
                            <th className="py-4">Title</th>
                            <th className="py-4">Artist</th>
                            <th className="py-4">Tags</th>
                            <th className="py-4">BPM/Key</th>
                            <th className="py-4 text-right pr-6">Duration</th>
                            <th className="py-4 w-12"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTracks.map((track, i) => (
                            <tr key={track.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 last:border-0">
                                <td className="py-3 pl-6 text-slate-500 text-sm">
                                    <span className="group-hover:hidden">{i + 1}</span>
                                    <button onClick={() => onPlayTrack(track)} className="hidden group-hover:block text-cyan-500">
                                        <Play className="w-4 h-4 fill-current" />
                                    </button>
                                </td>
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        <img src={track.image} alt={track.title} className="w-10 h-10 rounded-md object-cover bg-slate-800" />
                                        <span className="font-bold text-slate-900 dark:text-white text-sm">{track.title}</span>
                                    </div>
                                </td>
                                <td className="py-3 text-slate-600 dark:text-slate-300 text-sm">{track.artist}</td>
                                <td className="py-3">
                                    <div className="flex gap-1">
                                        {track.mood_tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full text-slate-500">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="py-3 text-slate-500 text-sm">{track.bpm} • {track.key}</td>
                                <td className="py-3 text-right pr-6 text-slate-500 text-sm font-mono">{track.duration}</td>
                                <td className="py-3 pr-4">
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button className="text-slate-400 hover:text-red-500"><Heart className="w-4 h-4" /></button>
                                        <button className="text-slate-400 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};