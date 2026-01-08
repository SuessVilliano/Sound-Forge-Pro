import React, { useState, useEffect } from 'react';
/* Added Loader2 to the lucide-react imports */
import { Play, Search, Plus, MoreHorizontal, Clock, Download, Trash2, Music, Heart, Filter, Loader2 } from 'lucide-react';
import { Track, User } from '../types';
import { dataService } from '../services/dataService';
import { usePlayer } from '../contexts/PlayerContext';

interface MyMusicProps {
  user: User;
  setShowUploadModal: (show: boolean) => void;
}

export const MyMusic: React.FC<MyMusicProps> = ({ user, setShowUploadModal }) => {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const { playTrack } = usePlayer();

  // Favorites State with persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('sf_track_favorites');
          return saved ? JSON.parse(saved) : [];
      } catch {
          return [];
      }
  });

  // Persist to LocalStorage whenever favorites change
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

    // Listen for custom event from other components (Player, Catalog)
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoritesUpdated', syncFavoritesFromStorage);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('favoritesUpdated', syncFavoritesFromStorage);
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = dataService.subscribeToTracks(user.uid, (data) => {
        setTracks(data);
        setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const handleSaveDemo = async () => {
      const newTrack = {
          id: `gen_${Date.now()}`,
          title: `Demo Creation ${tracks.length + 1}`,
          artist: user.displayName || 'Artist',
          bpm: 128,
          key: 'Cm',
          mood_tags: ['Demo', 'AI'],
          duration: '2:45',
          plays: 0,
          earnings: 0,
          image: `https://picsum.photos/300/300?random=${Date.now()}`,
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
          type: 'song',
          createdAt: new Date().toISOString(),
          status: 'completed'
      };
      await dataService.saveTrack(user.uid, newTrack as any);
  };

  const handleDelete = async (id: string) => {
      if(confirm('Are you sure you want to delete this track?')) {
          await dataService.deleteTrack(id);
      }
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setFavorites(prev => {
          const isFavorited = prev.includes(id);
          const next = isFavorited ? prev.filter(fav => fav !== id) : [...prev, id];
          // We set it to storage immediately to minimize race conditions 
          localStorage.setItem('sf_track_favorites', JSON.stringify(next));
          // Notify other components (Catalog, Player)
          window.dispatchEvent(new Event('favoritesUpdated'));
          return next;
      });
  };

  const filteredTracks = tracks.filter(t => 
      (filter === 'all' || (filter === 'generated' && t.type === 'song') || (filter === 'uploaded' && !t.type)) &&
      (t.title?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">My Library</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your uploads, AI generations, and masters.</p>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-2 border rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${showFilters ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <Filter className="w-4 h-4" /> Filter
                </button>
                <button 
                    onClick={() => setShowUploadModal(true)}
                    className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
                >
                    <Plus className="w-4 h-4" /> Upload Track
                </button>
            </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
            <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-top-4">
                <div className="flex gap-2 overflow-x-auto">
                    {['all', 'uploaded', 'generated'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                                filter === f 
                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Filter tracks..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-cyan-500 w-full sm:w-64 text-slate-900 dark:text-white"
                    />
                </div>
            </div>
        )}

        {/* Track List */}
        <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm min-h-[400px]">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                    <span className="text-xs font-black uppercase tracking-widest">Syncing Library...</span>
                </div>
            ) : filteredTracks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-slate-500">
                    <Music className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-lg font-bold text-slate-400 uppercase tracking-tighter">Library Empty</p>
                    <p className="text-sm mt-1">Upload a track or generate one in AI Studio.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">
                                <th className="py-4 pl-6 w-12">#</th>
                                <th className="py-4">Track Details</th>
                                <th className="py-4">Date Added</th>
                                <th className="py-4">Stats</th>
                                <th className="py-4 text-right pr-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredTracks.map((track, i) => (
                                <tr key={track.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="py-4 pl-6 text-slate-500 font-mono text-xs">
                                        <span className="group-hover:hidden">{i + 1}</span>
                                        <button onClick={() => playTrack(track)} className="hidden group-hover:block text-cyan-500">
                                            <Play className="w-4 h-4 fill-current" />
                                        </button>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden shrink-0 relative group/img cursor-pointer" onClick={() => playTrack(track)}>
                                                <img src={track.image || track.imageUrl} alt={track.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 hidden group-hover/img:flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-white fill-white" />
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-slate-900 dark:text-white text-sm">{track.title}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                                    <span>{track.artist}</span>
                                                    {track.bpm && <span>• {track.bpm} BPM</span>}
                                                    {track.key && <span>• {track.key}</span>}
                                                </div>
                                                <div className="flex gap-1 mt-1.5">
                                                    {track.mood_tags?.map((tag: string) => (
                                                        <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 border border-slate-200 dark:border-slate-700 font-bold uppercase tracking-tight">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(track.createdAt || Date.now()).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="text-xs text-slate-500">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Play className="w-3 h-3" /> {track.plays || 0} plays
                                            </div>
                                            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                <span>$</span> {track.earnings || 0} earned
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 pr-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={(e) => toggleFavorite(e, track.id)}
                                                className={`p-2 rounded-lg transition-colors ${favorites.includes(track.id) ? 'text-red-500 hover:bg-red-500/10' : 'text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
                                                title={favorites.includes(track.id) ? "Remove from Favorites" : "Add to Favorites"}
                                            >
                                                <Heart className={`w-4 h-4 ${favorites.includes(track.id) ? 'fill-current' : ''}`} />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-cyan-500 hover:bg-cyan dark:hover:bg-cyan-900/20 rounded-lg transition-colors">
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(track.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    </div>
  );
};
