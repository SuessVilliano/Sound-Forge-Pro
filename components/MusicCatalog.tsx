
import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, Heart, Download, Edit3, Music, Scissors, Plus, Trash2, Clock, Save, ArrowUpDown, DollarSign, ListFilter, Tag, FileText, Check, Youtube, Video } from 'lucide-react';
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
        earnings: 1250.45, 
        image: 'https://picsum.photos/300/300?random=10', 
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 
        videoUrl: 'https://www.youtube.com/watch?v=L_jWHffIx5E',
        licenseType: 'sync-ready', 
        genre: 'Electronic',
        syncPoints: [
            { time: '0:00', label: 'Intro', description: 'Atmospheric synth pad start' },
            { time: '0:45', label: 'Drop', description: 'Heavy bass enters' }
        ]
    },
    { id: 'c2', title: 'Golden Hour', artist: 'Solar Beats', bpm: 95, key: 'C', mood_tags: ['Chill', 'Lo-Fi'], duration: '2:30', plays: 89000, earnings: 450.20, image: 'https://picsum.photos/300/300?random=11', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', licenseType: 'exclusive', genre: 'Hip Hop', syncPoints: [] },
    { id: 'c3', title: 'Cyber War', artist: 'Glitch Mob', bpm: 140, key: 'Dm', mood_tags: ['Dark', 'Industrial'], duration: '4:10', plays: 45000, earnings: 890.00, image: 'https://picsum.photos/300/300?random=12', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', licenseType: 'non-exclusive', genre: 'Electronic', syncPoints: [] },
    { id: 'c4', title: 'Ocean Breeze', artist: 'Acoustic Soul', bpm: 85, key: 'G', mood_tags: ['Acoustic', 'Happy'], duration: '3:15', plays: 67000, earnings: 320.50, image: 'https://picsum.photos/300/300?random=13', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', licenseType: 'sync-ready', genre: 'Acoustic', syncPoints: [] },
    { id: 'c5', title: 'Summer Love', artist: 'The Starlets', bpm: 120, key: 'F', mood_tags: ['Fun', 'Summer'], duration: '3:10', plays: 12000, earnings: 50.10, image: 'https://picsum.photos/300/300?random=14', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', licenseType: 'sync-ready', genre: 'Pop', syncPoints: [] },
    { id: 'c6', title: 'Gritty Road', artist: 'Black Rebel', bpm: 145, key: 'E', mood_tags: ['Distorted', 'Heavy'], duration: '2:50', plays: 3000, earnings: 10.05, image: 'https://picsum.photos/300/300?random=15', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', licenseType: 'non-exclusive', genre: 'Rock', syncPoints: [] },
];

const GENRES = ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'Acoustic'];
const LICENSES = ['exclusive', 'non-exclusive', 'sync-ready'];

export const MusicCatalog: React.FC = () => {
  // Initialize tracks by merging static catalog with persisted play counts
  const [tracks, setTracks] = useState<CatalogTrack[]>(() => {
      const savedPlays = dataService.getCatalogPlays();
      return INITIAL_CATALOG.map((t, index) => ({
          ...t,
          plays: t.plays + (savedPlays[t.id] || 0),
          syncPoints: t.syncPoints || [],
          createdAt: t.createdAt || new Date(Date.now() - (index * 86400000 * 5)).toISOString()
      }));
  });

  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('all'); // License/Status Filter
  const [genreFilter, setGenreFilter] = useState('all'); // Genre Filter
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'plays' | 'earnings'>('newest');
  
  // Expanded Row State
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'sync'>('details');
  
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

  // Persist to LocalStorage whenever favorites change AND dispatch event
  useEffect(() => {
      localStorage.setItem('sf_track_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Sync across tabs and same-window components
  useEffect(() => {
    const syncFavoritesFromStorage = () => {
        try {
            const saved = localStorage.getItem('sf_track_favorites');
            const newFavorites = saved ? JSON.parse(saved) : [];
            setFavorites(newFavorites);
        } catch (error) {
            console.error('Error syncing favorites', error);
        }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'sf_track_favorites') {
        syncFavoritesFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoritesUpdated', syncFavoritesFromStorage);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('favoritesUpdated', syncFavoritesFromStorage);
    };
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setFavorites(prev => {
          const isFavorited = prev.includes(id);
          const next = isFavorited ? prev.filter(fav => fav !== id) : [...prev, id];
          localStorage.setItem('sf_track_favorites', JSON.stringify(next));
          window.dispatchEvent(new Event('favoritesUpdated'));
          return next;
      });
  };

  const handlePlay = (track: CatalogTrack) => {
      playTrack(track);
      dataService.incrementPlayCount(track.id);
      
      const newEarnings = (track.earnings || 0) + 0.004;
      
      setTracks(prev => prev.map(t => 
          t.id === track.id ? { ...t, plays: t.plays + 1, earnings: newEarnings } : t
      ));
  };

  const toggleExpanded = (e: React.MouseEvent, id: string, tab: 'details' | 'sync') => {
      e.stopPropagation();
      if (expandedTrackId === id && activeTab === tab) {
          setExpandedTrackId(null);
      } else {
          setExpandedTrackId(id);
          setActiveTab(tab);
      }
  };

  const handleUpdateTrack = (id: string, field: keyof CatalogTrack, value: any) => {
      setTracks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
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
    
    if (filter === 'favorites') {
        return favorites.includes(t.id) && matchesSearch && matchesGenre;
    }
    
    const matchesLicense = filter === 'all' || t.licenseType === filter;
    return matchesLicense && matchesSearch && matchesGenre;
  });

  const sortedTracks = [...filteredTracks].sort((a, b) => {
      switch (sortMode) {
          case 'newest':
              return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
          case 'oldest':
              return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
          case 'plays':
              return b.plays - a.plays;
          case 'earnings':
              return b.earnings - a.earnings;
          default:
              return 0;
      }
  });

  return (
    <div className="space-y-8 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Music Catalog</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Discover sync-ready tracks and videos from top AI artists.</p>
            </div>
            
            <div className="flex gap-2 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Search tracks..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 w-64 shadow-sm"
                    />
                </div>
                
                <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select
                        value={sortMode}
                        onChange={(e) => setSortMode(e.target.value as any)}
                        className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-8 text-sm focus:outline-none focus:border-cyan-500 cursor-pointer text-slate-700 dark:text-slate-300 shadow-sm font-bold"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="plays">Most Plays</option>
                        <option value="earnings">Top Earnings</option>
                    </select>
                </div>

                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`p-2.5 rounded-full border transition-all ${showFilters ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-cyan-500'}`}
                    title="Toggle Advanced Filters"
                >
                    <Filter className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Filter Controls Area */}
        {showFilters && (
            <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-top-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Usage Rights</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['all', 'favorites', 'sync-ready', 'exclusive', 'non-exclusive'].map(f => (
                            <button 
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all flex items-center gap-2 border ${
                                    filter === f 
                                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                                {f === 'favorites' && <Heart className={`w-3.5 h-3.5 ${filter === f ? 'fill-current' : ''}`} />}
                                {f.replace('-', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Musical Style</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide items-center">
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
            </div>
        )}

        {/* Track List */}
        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                            <th className="py-4 pl-6 w-12">#</th>
                            <th className="py-4">Title</th>
                            <th className="py-4">Genre</th>
                            <th className="py-4">BPM/Key</th>
                            <th className="py-4 text-right">Plays</th>
                            <th className="py-4 text-right">Earnings</th>
                            <th className="py-4 text-right pr-6">Duration</th>
                            <th className="py-4 w-28 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTracks.length > 0 ? (
                            sortedTracks.map((track, i) => {
                                const isFav = favorites.includes(track.id);
                                const isExpanded = expandedTrackId === track.id;
                                const hasVideo = !!track.videoUrl;
                                
                                return (
                                    <React.Fragment key={track.id}>
                                        <tr className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 ${isExpanded ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                                            <td className="py-3 pl-6 text-slate-500 text-sm">
                                                <span className="group-hover:hidden font-mono">{i + 1}</span>
                                                <button onClick={() => handlePlay(track)} className="hidden group-hover:block text-cyan-500">
                                                    <Play className="w-4 h-4 fill-current" />
                                                </button>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative">
                                                        <img src={track.image} alt={track.title} className="w-10 h-10 rounded-md object-cover bg-slate-800" />
                                                        {hasVideo && (
                                                            <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow-sm border border-slate-900" title="Video available">
                                                                <Video className="w-2.5 h-2.5" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-slate-900 dark:text-white text-sm block">{track.title}</span>
                                                        <span className="text-xs text-slate-500 dark:text-slate-400">{track.artist}</span>
                                                        <div className="flex gap-1 mt-1">
                                                            {track.mood_tags.slice(0,2).map(tag => (
                                                                <span key={tag} className="text-[9px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase tracking-tight">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 text-slate-600 dark:text-slate-300 text-sm font-bold">{track.genre}</td>
                                            <td className="py-3 text-slate-500 text-sm font-mono">{track.bpm} • {track.key}</td>
                                            <td className="py-3 text-right text-slate-600 dark:text-slate-300 text-sm font-mono">
                                                {track.plays.toLocaleString()}
                                            </td>
                                            <td className="py-3 text-right text-green-600 dark:text-green-400 text-sm font-mono font-bold">
                                                ${track.earnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td className="py-3 text-right pr-6 text-slate-500 text-sm font-mono">
                                                {track.duration}
                                            </td>
                                            <td className="py-3 pr-6">
                                                <div className={`flex items-center justify-end gap-2 transition-opacity ${isFav || isExpanded ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                                    <button 
                                                        onClick={(e) => toggleExpanded(e, track.id, 'sync')}
                                                        className={`p-2 rounded-lg transition-colors ${isExpanded && activeTab === 'sync' ? 'text-cyan-500 bg-cyan-500/10' : 'text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                        title="Sync Points Editor"
                                                    >
                                                        <Scissors className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => toggleExpanded(e, track.id, 'details')}
                                                        className={`p-2 rounded-lg transition-colors ${isExpanded && activeTab === 'details' ? 'text-purple-500 bg-purple-500/10' : 'text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                        title="Edit Track Details"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
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
                                        
                                        {/* Expanded Editor Row */}
                                        {isExpanded && (
                                            <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800">
                                                <td colSpan={8} className="p-4">
                                                    <div className="bg-white dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-inner">
                                                        {/* Tabs */}
                                                        <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 mb-4 pb-2">
                                                            <button 
                                                                onClick={() => setActiveTab('details')}
                                                                className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${activeTab === 'details' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                                            >
                                                                Track Details
                                                            </button>
                                                            <button 
                                                                onClick={() => setActiveTab('sync')}
                                                                className={`text-xs font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors ${activeTab === 'sync' ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                                                            >
                                                                Sync Points
                                                            </button>
                                                        </div>

                                                        {/* DETAILS TAB */}
                                                        {activeTab === 'details' && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                                                <div className="space-y-4">
                                                                    <div>
                                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Track Title</label>
                                                                        <input 
                                                                            type="text" 
                                                                            value={track.title}
                                                                            onChange={(e) => handleUpdateTrack(track.id, 'title', e.target.value)}
                                                                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Artist Name</label>
                                                                        <input 
                                                                            type="text" 
                                                                            value={track.artist}
                                                                            onChange={(e) => handleUpdateTrack(track.id, 'artist', e.target.value)}
                                                                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                                                            <Youtube className="w-3 h-3 text-red-500" /> YouTube Video Link
                                                                        </label>
                                                                        <input 
                                                                            type="text" 
                                                                            value={track.videoUrl || ''}
                                                                            onChange={(e) => handleUpdateTrack(track.id, 'videoUrl', e.target.value)}
                                                                            placeholder="https://www.youtube.com/watch?v=..."
                                                                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 font-mono"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="space-y-4">
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Genre</label>
                                                                            <select 
                                                                                value={track.genre}
                                                                                onChange={(e) => handleUpdateTrack(track.id, 'genre', e.target.value)}
                                                                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                                                            >
                                                                                {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                                                            </select>
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">License Type</label>
                                                                            <select 
                                                                                value={track.licenseType}
                                                                                onChange={(e) => handleUpdateTrack(track.id, 'licenseType', e.target.value as any)}
                                                                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                                                            >
                                                                                {LICENSES.map(l => <option key={l} value={l}>{l.replace('-', ' ')}</option>)}
                                                                            </select>
                                                                        </div>
                                                                    </div>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">BPM</label>
                                                                            <input 
                                                                                type="number" 
                                                                                value={track.bpm}
                                                                                onChange={(e) => handleUpdateTrack(track.id, 'bpm', parseInt(e.target.value))}
                                                                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Key</label>
                                                                            <input 
                                                                                type="text" 
                                                                                value={track.key}
                                                                                onChange={(e) => handleUpdateTrack(track.id, 'key', e.target.value)}
                                                                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex items-center gap-1">
                                                                            <Tag className="w-3 h-3" /> Mood Tags
                                                                        </label>
                                                                        <input 
                                                                            type="text" 
                                                                            value={track.mood_tags.join(', ')}
                                                                            onChange={(e) => handleUpdateTrack(track.id, 'mood_tags', e.target.value.split(',').map(s => s.trim()))}
                                                                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                                                        />
                                                                    </div>
                                                                    
                                                                    <div className="flex justify-end pt-2">
                                                                        <button 
                                                                            onClick={() => setExpandedTrackId(null)}
                                                                            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-md text-xs font-bold transition-colors shadow-sm"
                                                                        >
                                                                            <Check className="w-3 h-3" /> Save Changes
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* SYNC TAB */}
                                                        {activeTab === 'sync' && (
                                                            <div className="animate-in fade-in">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                                        <Clock className="w-4 h-4 text-cyan-500" /> Cue Points
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
                                <td colSpan={8} className="py-12 text-center text-slate-500">
                                    {filter === 'favorites' ? (
                                        <div className="flex flex-col items-center">
                                            <Heart className="w-12 h-12 mb-4 opacity-20" />
                                            <p className="font-bold text-slate-400 uppercase tracking-tighter">No favorites found</p>
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
