
import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, Heart, Download, Share2, MoreHorizontal, Music, Scissors, Plus, Trash2, Clock, Save } from 'lucide-react';
import { Track } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { dataService } from '../services/dataService';

// Extended Track type locally to include genre for this view
type SyncPoint = {
    time: string;
    label: string;
    description: string;
};

type CatalogTrack = Track & { 
    genre: string;
    syncPoints?: SyncPoint[];
};

// Mock Catalog Data
const INITIAL_CATALOG: CatalogTrack[] = [
    { 
        id: 'c1', 
        title: 'Midnight City', 
        artist: 'Neon Dreams', 
        bpm: 128, 
        key: 'Am', 
        mood_tags: ['Synthwave', 'Driving'], 
        duration: '3:45', 
        plays: 152000, 
        earnings: 0, 
        image: 'https://picsum.photos/300/300?random=10', 
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
        licenseType: 'sync-ready', 
        genre: 'Electronic',
        syncPoints: [
            { time: '0:00', label: 'Intro', description: 'Atmospheric synth pad start' },
            { time: '0:45', label: 'Drop', description: 'Heavy bass enters' }
        ]
    },
    { id: 'c2', title: 'Golden Hour', artist: 'Solar Beats', bpm: 95, key: 'C', mood_tags: ['Chill', 'Lo-Fi'], duration: '2:30', plays: 89000, earnings: 0, image: 'https://picsum.photos/300/300?random=11', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', licenseType: 'exclusive', genre: 'Hip Hop', syncPoints: [] },
    { id: 'c3', title: 'Cyber War', artist: 'Glitch Mob', bpm: 140, key: 'Dm', mood_tags: ['Dark', 'Industrial'], duration: '4:10', plays: 45000, earnings: 0, image: 'https://picsum.photos/300/300?random=12', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', licenseType: 'non-exclusive', genre: 'Electronic', syncPoints: [] },
    { id: 'c4', title: 'Ocean Breeze', artist: 'Acoustic Soul', bpm: 85, key: 'G', mood_tags: ['Acoustic', 'Happy'], duration: '3:15', plays: 67000, earnings: 0, image: 'https://picsum.photos/300/300?random=13', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', licenseType: 'sync-ready', genre: 'Acoustic', syncPoints: [] },
    { id: 'c5', title: 'Summer Love', artist: 'The Starlets', bpm: 120, key: 'F', mood_tags: ['Fun', 'Summer'], duration: '3:10', plays: 12000, earnings: 0, image: 'https://picsum.photos/300/300?random=14', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', licenseType: 'sync-ready', genre: 'Pop', syncPoints: [] },
    { id: 'c6', title: 'Gritty Road', artist: 'Black Rebel', bpm: 145, key: 'E', mood_tags: ['Distorted', 'Heavy'], duration: '2:50', plays: 3000, earnings: 0, image: 'https://picsum.photos/300/300?random=15', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', licenseType: 'non-exclusive', genre: 'Rock', syncPoints: [] },
];

const GENRES = ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'Acoustic'];

export const MusicCatalog: React.FC = () => {
  // Initialize tracks by merging static catalog with persisted play counts
  const [tracks, setTracks] = useState<CatalogTrack[]>(() => {
      const savedPlays = dataService.getCatalogPlays();
      return INITIAL_CATALOG.map(t => ({
          ...t,
          plays: t.plays + (savedPlays[t.id] || 0),
          // Ensure syncPoints exists, defaulting to empty array if missing
          syncPoints: t.syncPoints || []
      }));
  });

  const [filter, setFilter] = useState('all'); // License/Status Filter
  const [genreFilter, setGenreFilter] = useState('all'); // Genre Filter
  const [search, setSearch] = useState('');
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  
  // Favorites State with persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('sf_track_favorites');
          return saved ? JSON.parse(saved) : [];
      } catch {
          return [];
      }
  });

  const { playTrack } = usePlayer();

  // Persist to LocalStorage whenever favorites change
  useEffect(() => {
      localStorage.setItem('sf_track_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sf_track_favorites') {
        try {
          const newFavorites = e.newValue ? JSON.parse(e.newValue) : [];
          setFavorites(newFavorites);
        } catch (error) {
          console.error('Error parsing favorites from storage event', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setFavorites(prev => 
          prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id]
      );
  };

  const handlePlay = (track: CatalogTrack) => {
      playTrack(track);
      dataService.incrementPlayCount(track.id);
      
      // Update local state immediately to reflect the new play count
      setTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, plays: t.plays + 1 } : t
      ));
  };

  const toggleSyncEditor = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setExpandedTrackId(prev => prev === id ? null : id);
  };

  const handleAddSyncPoint = (trackId: string) => {
      setTracks(prev => prev.map(t => {
          if (t.id === trackId) {
              return {
                  ...t,
                  syncPoints: [...(t.syncPoints || []), { time: '0:00', label: 'New Cue', description: '' }]
              };
          }
          return t;
      }));
  };

  const handleUpdateSyncPoint = (trackId: string, index: number, field: keyof SyncPoint, value: string) => {
      setTracks(prev => prev.map(t => {
          if (t.id === trackId) {
              const newPoints = [...(t.syncPoints || [])];
              newPoints[index] = { ...newPoints[index], [field]: value };
              return { ...t, syncPoints: newPoints };
          }
          return t;
      }));
  };

  const handleDeleteSyncPoint = (trackId: string, index: number) => {
      setTracks(prev => prev.map(t => {
          if (t.id === trackId) {
              const newPoints = [...(t.syncPoints || [])];
              newPoints.splice(index, 1);
              return { ...t, syncPoints: newPoints };
          }
          return t;
      }));
  };

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genreFilter === 'all' || t.genre === genreFilter;
    
    // License/Favorites Filter Logic
    if (filter === 'favorites') {
        return favorites.includes(t.id) && matchesSearch && matchesGenre;
    }
    
    const matchesLicense = filter === 'all' || t.licenseType === filter;
    return matchesLicense && matchesSearch && matchesGenre;
  });

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

        <div className="space-y-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {['all', 'favorites', 'sync-ready', 'exclusive', 'non-exclusive'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-full text-sm font-bold capitalize whitespace-nowrap transition-all flex items-center gap-2 ${
                            filter === f 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                    >
                        {f === 'favorites' && <Heart className={`w-3.5 h-3.5 ${filter === f ? 'fill-current' : ''}`} />}
                        {f.replace('-', ' ')}
                    </button>
                ))}
            </div>

            {/* Genre Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setGenreFilter('all')}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                        genreFilter === 'all'
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400'
                        : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500'
                    }`}
                >
                    All Genres
                </button>
                {GENRES.map(g => (
                    <button 
                        key={g}
                        onClick={() => setGenreFilter(g)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                            genreFilter === g 
                            ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                            : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:hover:border-slate-500'
                        }`}
                    >
                        {g}
                    </button>
                ))}
            </div>
        </div>

        {/* Track List */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <th className="py-4 pl-6 w-12">#</th>
                            <th className="py-4">Title</th>
                            <th className="py-4">Genre</th>
                            <th className="py-4">Tags</th>
                            <th className="py-4">BPM/Key</th>
                            <th className="py-4 text-right pr-6">Duration</th>
                            <th className="py-4 w-28 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTracks.length > 0 ? (
                            filteredTracks.map((track, i) => {
                                const isFav = favorites.includes(track.id);
                                const isExpanded = expandedTrackId === track.id;
                                
                                return (
                                    <React.Fragment key={track.id}>
                                        <tr className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                                            <td className="py-3 pl-6 text-slate-500 text-sm">
                                                <span className="group-hover:hidden">{i + 1}</span>
                                                <button onClick={() => handlePlay(track)} className="hidden group-hover:block text-cyan-500">
                                                    <Play className="w-4 h-4 fill-current" />
                                                </button>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <img src={track.image} alt={track.title} className="w-10 h-10 rounded-md object-cover bg-slate-800" />
                                                    <div>
                                                        <span className="font-bold text-slate-900 dark:text-white text-sm block">{track.title}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{track.artist}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-slate-600 dark:text-slate-300 text-sm">{track.genre}</td>
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
                                            <td className="py-3 text-right pr-6 text-slate-500 text-sm font-mono flex flex-col items-end justify-center">
                                                <span>{track.duration}</span>
                                                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                    <Play className="w-2 h-2" /> {track.plays.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-6">
                                                <div className={`flex items-center justify-end gap-2 transition-opacity ${isFav || isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                    <button 
                                                        onClick={(e) => toggleSyncEditor(e, track.id)}
                                                        className={`p-2 rounded-lg transition-colors ${isExpanded ? 'text-cyan-500 bg-cyan-500/10' : 'text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                        title="Sync Points Editor"
                                                    >
                                                        <Scissors className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => toggleFavorite(e, track.id)}
                                                        className={`p-2 rounded-lg transition-colors ${isFav ? 'text-red-500 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                        title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                                                    >
                                                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                                                    </button>
                                                    <button className="p-2 text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                                                        <Download className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        
                                        {/* Sync Points Editor Row */}
                                        {isExpanded && (
                                            <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800">
                                                <td colSpan={7} className="p-4">
                                                    <div className="bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-inner">
                                                        <div className="flex justify-between items-center mb-4">
                                                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                <Clock className="w-4 h-4 text-cyan-500" /> Sync Points & Cues
                                                            </h4>
                                                            <button 
                                                                onClick={() => handleAddSyncPoint(track.id)}
                                                                className="text-xs flex items-center gap-1 bg-cyan-500 hover:bg-cyan-400 text-white px-3 py-1.5 rounded-md transition-colors"
                                                            >
                                                                <Plus className="w-3 h-3" /> Add Point
                                                            </button>
                                                        </div>
                                                        
                                                        {(!track.syncPoints || track.syncPoints.length === 0) ? (
                                                            <div className="text-center py-6 text-slate-400 text-xs border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                                                No sync points defined. Add cues for licensing opportunities.
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-2">
                                                                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 px-2">
                                                                    <div className="col-span-2">Timestamp</div>
                                                                    <div className="col-span-3">Cue Name</div>
                                                                    <div className="col-span-6">Description</div>
                                                                    <div className="col-span-1 text-center">Action</div>
                                                                </div>
                                                                {track.syncPoints.map((point, idx) => (
                                                                    <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                                                        <div className="col-span-2">
                                                                            <input 
                                                                                type="text" 
                                                                                value={point.time}
                                                                                onChange={(e) => handleUpdateSyncPoint(track.id, idx, 'time', e.target.value)}
                                                                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                                                                placeholder="0:00"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-3">
                                                                            <input 
                                                                                type="text" 
                                                                                value={point.label}
                                                                                onChange={(e) => handleUpdateSyncPoint(track.id, idx, 'label', e.target.value)}
                                                                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                                                                placeholder="e.g. Chorus"
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-6">
                                                                            <input 
                                                                                type="text" 
                                                                                value={point.description}
                                                                                onChange={(e) => handleUpdateSyncPoint(track.id, idx, 'description', e.target.value)}
                                                                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm text-slate-600 dark:text-slate-300 focus:outline-none focus:border-cyan-500"
                                                                                placeholder="Description of the cue..."
                                                                            />
                                                                        </div>
                                                                        <div className="col-span-1 text-center">
                                                                            <button 
                                                                                onClick={() => handleDeleteSyncPoint(track.id, idx)}
                                                                                className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        
                                                        {track.syncPoints && track.syncPoints.length > 0 && (
                                                            <div className="mt-4 flex justify-end">
                                                                <button 
                                                                    onClick={() => setExpandedTrackId(null)}
                                                                    className="flex items-center gap-1.5 text-xs font-bold text-green-600 dark:text-green-400 hover:text-green-500"
                                                                >
                                                                    <Save className="w-3 h-3" /> Save Changes
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={7} className="py-12 text-center text-slate-500">
                                    {filter === 'favorites' ? (
                                        <div className="flex flex-col items-center">
                                            <Heart className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-bold text-slate-400">No favorites yet.</p>
                                            <p className="text-xs mt-1">Browse tracks and click the heart icon to save them.</p>
                                        </div>
                                    ) : (
                                        "No tracks found matching your filters."
                                    )}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};
