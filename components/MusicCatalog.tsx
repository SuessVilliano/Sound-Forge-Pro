import React, { useState, useEffect } from 'react';
import { Search, Filter, Play, Heart, Download, Edit3, Music, Scissors, Plus, Trash2, Clock, Save, ArrowUpDown, DollarSign, ListFilter, Tag, FileText, Check, Youtube, Video, ExternalLink, Users, Database, Sliders, Zap, Loader2, AlertCircle } from 'lucide-react';
import { Track, Contributor } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { dataService } from '../services/dataService';
import { MintNFTModal } from './MintNFTModal';

// Extended Track type locally to include genre for this view
type SyncPoint = {
    time: string;
    label: string;
    description: string;
};

type CatalogTrack = Track & { 
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
        recordLabel: 'Neon Records',
        isrc: 'US-ABC-25-10001',
        contributors: [{ id: '1', name: 'Neon Dreams', role: 'Songwriter' }],
        syncPoints: [
            { time: '0:00', label: 'Intro', description: 'Atmospheric synth pad start' },
            { time: '0:45', label: 'Drop', description: 'Heavy bass enters' }
        ]
    },
    { id: 'c2', title: 'Golden Hour', artist: 'Solar Beats', bpm: 95, key: 'C', mood_tags: ['Chill', 'Lo-Fi'], duration: '2:30', plays: 89000, earnings: 450.20, image: 'https://picsum.photos/300/300?random=11', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', licenseType: 'exclusive', genre: 'Hip Hop', syncPoints: [], contributors: [] },
    { id: 'c3', title: 'Cyber War', artist: 'Glitch Mob', bpm: 140, key: 'Dm', mood_tags: ['Dark', 'Industrial'], duration: '4:10', plays: 45000, earnings: 890.00, image: 'https://picsum.photos/300/300?random=12', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', licenseType: 'non-exclusive', genre: 'Electronic', syncPoints: [], contributors: [] },
];

const GENRES = ['Pop', 'Rock', 'Electronic', 'Hip Hop', 'Acoustic', 'Cinematic'];
const LICENSES = ['exclusive', 'non-exclusive', 'sync-ready'];
const ROLES = ['Songwriter', 'Producer', 'Featured Artist', 'Remixer', 'Mixer', 'Mastering Engineer', 'Composer'] as const;

export const MusicCatalog: React.FC = () => {
  const [tracks, setTracks] = useState<CatalogTrack[]>(() => {
      const savedPlays = dataService.getCatalogPlays();
      return INITIAL_CATALOG.map((t, index) => ({
          ...t,
          plays: t.plays + (savedPlays[t.id] || 0),
          syncPoints: t.syncPoints || [],
          contributors: t.contributors || [],
          createdAt: t.createdAt || new Date(Date.now() - (index * 86400000 * 5)).toISOString()
      }));
  });

  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('all'); 
  const [genreFilter, setGenreFilter] = useState('all'); 
  const [search, setSearch] = useState('');
  const [sortMode, setSortMode] = useState<'newest' | 'oldest' | 'plays' | 'earnings'>('newest');
  const [validatingId, setValidatingId] = useState<string | null>(null);
  
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'details' | 'sync'>('details');
  
  // Mint Modal State
  const [mintTrack, setMintTrack] = useState<CatalogTrack | null>(null);

  const [favorites, setFavorites] = useState<string[]>(() => {
      try {
          const saved = localStorage.getItem('sf_track_favorites');
          return saved ? JSON.parse(saved) : [];
      } catch { return []; }
  });

  const { playTrack } = usePlayer();

  useEffect(() => {
      localStorage.setItem('sf_track_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    const syncFavoritesFromStorage = () => {
        try {
            const saved = localStorage.getItem('sf_track_favorites');
            const newFavorites = saved ? JSON.parse(saved) : [];
            setFavorites(newFavorites);
        } catch (error) { console.error('Error syncing favorites', error); }
    };
    window.addEventListener('storage', (e) => e.key === 'sf_track_favorites' && syncFavoritesFromStorage());
    window.addEventListener('favoritesUpdated', syncFavoritesFromStorage);
    return () => {
        window.removeEventListener('storage', syncFavoritesFromStorage);
        window.removeEventListener('favoritesUpdated', syncFavoritesFromStorage);
    };
  }, []);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      setFavorites(prev => {
          const next = prev.includes(id) ? prev.filter(fav => fav !== id) : [...prev, id];
          localStorage.setItem('sf_track_favorites', JSON.stringify(next));
          window.dispatchEvent(new Event('favoritesUpdated'));
          return next;
      });
  };

  const handlePlay = async (track: CatalogTrack) => {
      const url = track.audioUrl;
      if (!url) return;

      // PRE-FLIGHT HEALTH CHECK
      setValidatingId(track.id);
      try {
          // Check if it's a YouTube link (not directly playable in our custom audio node)
          if (url.includes('youtube.com') || url.includes('youtu.be')) {
              if (track.videoUrl) { window.open(track.videoUrl, '_blank'); return; }
          }
          
          // Fast HEAD check for link stability
          const resp = await fetch(url, { method: 'HEAD' });
          if (!resp.ok) throw new Error("Link unstable");

          playTrack(track);
          dataService.incrementPlayCount(track.id);
          setTracks(prev => prev.map(t => t.id === track.id ? { ...t, plays: t.plays + 1, earnings: t.earnings + 0.004 } : t));
      } catch (e) {
          console.warn("[Catalog] Pre-flight signal unstable. Initializing player-side repair...");
          // Still pass to player; player has its own 'Neural Repair' fallback logic
          playTrack(track);
      } finally {
          setValidatingId(null);
      }
  };

  const toggleExpanded = (e: React.MouseEvent, id: string, tab: 'details' | 'sync') => {
      e.stopPropagation();
      if (expandedTrackId === id && activeTab === tab) setExpandedTrackId(null);
      else { setExpandedTrackId(id); setActiveTab(tab); }
  };

  const handleUpdateTrack = (id: string, field: keyof CatalogTrack, value: any) => {
      setTracks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const addContributor = (id: string) => {
      setTracks(prev => prev.map(t => {
          if (t.id === id) return { ...t, contributors: [...(t.contributors || []), { id: `c_${Date.now()}`, name: '', role: 'Producer' }] };
          return t;
      }));
  };

  const updateContributor = (trackId: string, contribId: string, field: keyof Contributor, value: string) => {
      setTracks(prev => prev.map(t => {
          if (t.id === trackId) {
              return { ...t, contributors: (t.contributors || []).map(c => c.id === contribId ? { ...c, [field]: value } : c) };
          }
          return t;
      }));
  };

  const removeContributor = (trackId: string, contribId: string) => {
    setTracks(prev => prev.map(t => {
        if (t.id === trackId) return { ...t, contributors: (t.contributors || []).filter(c => c.id !== contribId) };
        return t;
    }));
  };

  const handleAddSyncPoint = (trackId: string) => {
      setTracks(prev => prev.map(t => t.id === trackId ? { ...t, syncPoints: [...(t.syncPoints || []), { time: '0:00', label: 'New Cue', description: '' }] } : t));
  };

  const updateSyncPoint = (trackId: string, index: number, field: keyof SyncPoint, value: string) => {
      setTracks(prev => prev.map(t => {
          if (t.id === trackId) {
              const newPoints = [...(t.syncPoints || [])];
              newPoints[index] = { ...newPoints[index], [field]: value };
              return { ...t, syncPoints: newPoints };
          }
          return t;
      }));
  };

  const sortedTracks = tracks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.artist.toLowerCase().includes(search.toLowerCase());
    const matchesGenre = genreFilter === 'all' || t.genre === genreFilter;
    if (filter === 'favorites') return favorites.includes(t.id) && matchesSearch && matchesGenre;
    const matchesLicense = filter === 'all' || t.licenseType === filter;
    return matchesLicense && matchesSearch && matchesGenre;
  }).sort((a, b) => {
      if (sortMode === 'plays') return b.plays - a.plays;
      if (sortMode === 'earnings') return b.earnings - a.earnings;
      if (sortMode === 'oldest') return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  return (
    <div className="space-y-8 pb-24">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Music Ledger</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Verified sync-ready assets and roster-wide catalog discovery.</p>
            </div>
            
            <div className="flex gap-2 items-center">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="text" placeholder="Search tracks..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500 w-64 shadow-sm" />
                </div>
                
                <div className="relative">
                    <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <select value={sortMode} onChange={(e) => setSortMode(e.target.value as any)} className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-10 pr-8 text-sm focus:outline-none focus:border-cyan-500 cursor-pointer text-slate-700 dark:text-slate-300 shadow-sm font-bold">
                        <option value="newest">Newest</option><option value="oldest">Oldest</option><option value="plays">Most Plays</option><option value="earnings">Top Earnings</option>
                    </select>
                </div>

                <button onClick={() => setShowFilters(!showFilters)} className={`p-2.5 rounded-full border transition-all ${showFilters ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-cyan-500'}`}>
                    <Filter className="w-5 h-5" />
                </button>
            </div>
        </div>

        {showFilters && (
            <div className="space-y-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in slide-in-from-top-4">
                <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Usage Rights</label>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['all', 'favorites', 'sync-ready', 'exclusive', 'non-exclusive'].map(f => (
                            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap transition-all flex items-center gap-2 border ${filter === f ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent hover:bg-slate-200 dark:hover:bg-slate-700'}`}>{f === 'favorites' && <Heart className={`w-3.5 h-3.5 ${filter === f ? 'fill-current' : ''}`} />}{f.replace('-', ' ')}</button>
                        ))}
                    </div>
                </div>
            </div>
        )}

        <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-black text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 uppercase tracking-widest">
                            <th className="py-4 pl-6 w-12">#</th>
                            <th className="py-4">Vibe & Title</th>
                            <th className="py-4">Genre</th>
                            <th className="py-4">BPM/Key</th>
                            <th className="py-4 text-right">Engagement</th>
                            <th className="py-4 text-right">Yield</th>
                            <th className="py-4 text-right pr-6">Duration</th>
                            <th className="py-4 w-28 text-right pr-6">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedTracks.map((track, i) => (
                            <React.Fragment key={track.id}>
                                <tr className={`group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800/50 ${expandedTrackId === track.id ? 'bg-slate-50 dark:bg-slate-800/50' : ''}`}>
                                    <td className="py-3 pl-6 text-slate-500 text-sm">
                                        {validatingId === track.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                                        ) : (
                                            <>
                                                <span className="group-hover:hidden font-mono text-[10px]">{i + 1}</span>
                                                <button onClick={() => handlePlay(track)} className="hidden group-hover:block text-cyan-500 transition-transform active:scale-90"><Play className="w-4 h-4 fill-current" /></button>
                                            </>
                                        )}
                                    </td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative shrink-0">
                                                <img src={track.image} alt={track.title} className="w-10 h-10 rounded-lg object-cover bg-slate-800 border border-white/5" />
                                                {track.videoUrl && <div className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 border border-slate-900 shadow-sm"><Video className="w-2.5 h-2.5" /></div>}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-black text-slate-900 dark:text-white text-sm block uppercase tracking-tight truncate">{track.title}</span>
                                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{track.artist}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 text-slate-600 dark:text-slate-300 text-xs font-black uppercase tracking-tighter">{track.genre}</td>
                                    <td className="py-3 text-slate-500 text-[10px] font-mono font-bold">{track.bpm} BPM • {track.key}</td>
                                    <td className="py-3 text-right text-slate-600 dark:text-slate-300 text-xs font-mono">{track.plays.toLocaleString()}</td>
                                    <td className="py-3 text-right text-green-600 dark:text-green-400 text-xs font-mono font-black">${track.earnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    <td className="py-3 text-right pr-6 text-slate-500 text-[10px] font-mono">{track.duration}</td>
                                    <td className="py-3 pr-6">
                                        <div className="flex items-center justify-end gap-1.5 transition-opacity opacity-0 group-hover:opacity-100">
                                            <button onClick={() => setMintTrack(track)} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-500/10" title="Secure on Ledger"><Zap className="w-4 h-4" /></button>
                                            <button onClick={(e) => toggleExpanded(e, track.id, 'sync')} className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-500 hover:bg-slate-100 dark:hover:bg-slate-700"><Scissors className="w-4 h-4" /></button>
                                            <button onClick={(e) => toggleExpanded(e, track.id, 'details')} className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-slate-100 dark:hover:bg-slate-700"><Edit3 className="w-4 h-4" /></button>
                                            <button onClick={(e) => toggleFavorite(e, track.id)} className={`p-1.5 rounded-lg ${favorites.includes(track.id) ? 'text-red-500' : 'text-slate-400 hover:text-red-500'}`}><Heart className={`w-4 h-4 ${favorites.includes(track.id) ? 'fill-current' : ''}`} /></button>
                                        </div>
                                    </td>
                                </tr>
                                
                                {expandedTrackId === track.id && (
                                    <tr className="bg-slate-50 dark:bg-slate-900/30 border-b border-slate-200 dark:border-slate-800">
                                        <td colSpan={8} className="p-4">
                                            <div className="bg-white dark:bg-slate-850 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-inner">
                                                <div className="flex gap-8 border-b border-slate-100 dark:border-slate-800 mb-8 pb-2">
                                                    <button onClick={() => setActiveTab('details')} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-3 border-b-2 transition-all ${activeTab === 'details' ? 'border-purple-500 text-purple-600 dark:text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}>Asset Identity & Metadata</button>
                                                    <button onClick={() => setActiveTab('sync')} className={`text-[10px] font-black uppercase tracking-[0.2em] pb-3 border-b-2 transition-all ${activeTab === 'sync' ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-300'}`}>Sync Cue Markers</button>
                                                </div>

                                                {activeTab === 'details' && (
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in">
                                                        <div className="space-y-8">
                                                            <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Sliders className="w-3.5 h-3.5" /> Registry Core</h4>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Sequence Title</label>
                                                                    <input value={track.title} onChange={e => handleUpdateTrack(track.id, 'title', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-bold outline-none focus:border-purple-500" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Master Node / Label</label>
                                                                    <input value={track.recordLabel || ''} onChange={e => handleUpdateTrack(track.id, 'recordLabel', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-bold outline-none focus:border-purple-500" />
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-6">
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">ISRC Registry Code</label>
                                                                    <input value={track.isrc || ''} onChange={e => handleUpdateTrack(track.id, 'isrc', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-mono focus:border-cyan-500 outline-none" />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Institutional Genre</label>
                                                                    <select value={track.genre} onChange={e => handleUpdateTrack(track.id, 'genre', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white font-black uppercase tracking-tighter">
                                                                        {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <button 
                                                                onClick={() => setMintTrack(track)}
                                                                className="w-full py-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl hover:bg-amber-500 hover:text-slate-950 transition-all flex items-center justify-center gap-3 shadow-lg shadow-amber-500/5"
                                                            >
                                                                <Zap className="w-4 h-4 fill-current" /> Initialize On-Chain Ledger Mint
                                                            </button>
                                                        </div>

                                                        <div className="space-y-8">
                                                            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                                                                <h4 className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Users className="w-3.5 h-3.5" /> Rights Ledger</h4>
                                                                <button onClick={() => addContributor(track.id)} className="text-[8px] font-black uppercase text-cyan-400 hover:text-white transition-colors tracking-widest">Append Credit +</button>
                                                            </div>
                                                            <div className="space-y-3 max-h-56 overflow-y-auto pr-3 custom-scrollbar">
                                                                {(track.contributors || []).map(contrib => (
                                                                    <div key={contrib.id} className="flex gap-3 items-center animate-in slide-in-from-left-2">
                                                                        <input value={contrib.name} onChange={e => updateContributor(track.id, contrib.id, 'name', e.target.value)} placeholder="Legal Name" className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white font-bold" />
                                                                        <select value={contrib.role} onChange={e => updateContributor(track.id, contrib.id, 'role', e.target.value as any)} className="w-40 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-[9px] text-slate-500 font-black uppercase tracking-tighter">
                                                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                                        </select>
                                                                        <button onClick={() => removeContributor(track.id, contrib.id)} className="p-2 bg-slate-900 border border-slate-800 text-slate-700 hover:text-red-500 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <div className="flex justify-end pt-6 border-t border-slate-800/50">
                                                                <button onClick={() => setExpandedTrackId(null)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 transition-all active:scale-95">Commit Registry</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {activeTab === 'sync' && (
                                                    <div className="space-y-6 animate-in fade-in">
                                                        <div className="flex justify-between items-center mb-6">
                                                            <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-3"><Clock className="w-5 h-5 text-cyan-500" /> Synchronization Points</h4>
                                                            <button onClick={() => handleAddSyncPoint(track.id)} className="text-[9px] font-black uppercase bg-cyan-600 text-white px-6 py-2.5 rounded-xl hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20">Mark Sync Point +</button>
                                                        </div>
                                                        <div className="space-y-3">
                                                            {track.syncPoints?.map((point, idx) => (
                                                                <div key={idx} className="grid grid-cols-12 gap-4 items-center bg-slate-900/50 p-4 rounded-2xl border border-white/5">
                                                                    <div className="col-span-2">
                                                                        <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">Timecode</label>
                                                                        <input type="text" value={point.time} onChange={e => updateSyncPoint(track.id, idx, 'time', e.target.value)} className="w-full bg-black border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-cyan-400 font-bold" />
                                                                    </div>
                                                                    <div className="col-span-3">
                                                                         <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">Point Label</label>
                                                                         <input type="text" value={point.label} onChange={e => updateSyncPoint(track.id, idx, 'label', e.target.value)} className="w-full bg-black border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-black uppercase tracking-tight" />
                                                                    </div>
                                                                    <div className="col-span-6">
                                                                         <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">Operational Description</label>
                                                                         <input type="text" value={point.description} onChange={e => updateSyncPoint(track.id, idx, 'description', e.target.value)} className="w-full bg-black border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-medium" />
                                                                    </div>
                                                                    <div className="col-span-1 text-center pt-4">
                                                                        <button className="p-2 text-slate-700 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            {(!track.syncPoints || track.syncPoints.length === 0) && (
                                                                <div className="text-center py-12 text-slate-600 border border-dashed border-slate-800 rounded-2xl">
                                                                    No synchronization markers initialized for this sequence.
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Mint NFT Modal Integration */}
        {mintTrack && (
            <MintNFTModal 
                isOpen={!!mintTrack} 
                onClose={() => setMintTrack(null)} 
                asset={mintTrack} 
                type="music" 
                onSuccess={(data) => {
                    handleUpdateTrack(mintTrack.id, 'blockchainRegistration', {
                        cid: data.mintAddress,
                        timestamp: data.timestamp,
                        network: 'Solana',
                        status: 'secured'
                    });
                }}
            />
        )}
    </div>
  );
};
