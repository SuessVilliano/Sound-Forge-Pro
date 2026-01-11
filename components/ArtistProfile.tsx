import React, { useState, useRef, useEffect } from 'react';
import { 
    Edit2, Camera, Share2, MapPin, Globe, Save, X, Link as LinkIcon, 
    Music, Users, Shield, ShoppingBag, Play, Mail, MessageCircle, 
    CheckCircle2, Image as ImageIcon, Send, MoreHorizontal, Calendar, 
    Headphones, TrendingUp, Video, Mic2, Star, DollarSign, ArrowLeft,
    Zap, Plus, Trash2, CalendarCheck, RefreshCw, LogOut, Radio, Palette, Layout, Type as TypeIcon, Eye, Check, Sparkles,
    Moon, Sun, ArrowRight, ChevronRight
} from 'lucide-react';
import { User, Track, TourDate } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
// Import VIEWS to allow navigation from the profile
import { VIEWS } from '../constants';

interface ArtistProfileProps {
  user: User | null;
  onNavigate?: (view: string) => void;
  isPublic?: boolean; 
  onBack?: () => void;
}

const MOCK_PHOTOS = [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
];

export const ArtistProfile: React.FC<ArtistProfileProps> = ({ user, onNavigate, isPublic = false, onBack }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.photoURL || null);
  const [banner, setBanner] = useState<string | null>(null);
  
  // Design State
  const [config, setConfig] = useState(user?.profileConfig || {
      theme: 'dark' as const,
      accentColor: '#06b6d4',
      fontStyle: 'sans' as const,
      sections: [
          { id: 'bio', visible: true, order: 0 },
          { id: 'tracks', visible: true, order: 1 },
          { id: 'photos', visible: true, order: 2 },
          { id: 'tour', visible: true, order: 3 }
      ]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'avatar' | 'banner' | null>(null);
  const { playTrack } = usePlayer();
  
  const [profile, setProfile] = useState({
    stageName: user?.displayName || 'New Artist',
    bio: user?.bio || 'Electronic producer and vocalist blurring the lines between analog warmth and digital precision.',
    genre: 'Indie Pop / Electronic',
    location: user?.location || 'Los Angeles, CA',
    managementEmail: 'mgmt@soundmerge.club',
  });

  const [socials, setSocials] = useState({
      instagram: user?.socialLinks?.instagram || '',
      twitter: user?.socialLinks?.twitter || '',
      youtube: user?.socialLinks?.youtube || '',
      website: user?.socialLinks?.website || '',
      spotify: user?.socialLinks?.spotify || '',
      appleMusic: user?.socialLinks?.appleMusic || '',
      soundcloud: user?.socialLinks?.soundcloud || '',
      tiktok: user?.socialLinks?.tiktok || ''
  });

  const [tourDates, setTourDates] = useState<TourDate[]>(user?.tourDates || []);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
      if (user) {
          setProfile(prev => ({
              ...prev,
              stageName: user.displayName,
              bio: user.bio || prev.bio,
              location: user.location || prev.location
          }));
          setAvatar(user.photoURL);
          if (user.socialLinks) setSocials({ ...socials, ...user.socialLinks } as any);
          if (user.tourDates) setTourDates(user.tourDates);
          if (user.profileConfig) setConfig(user.profileConfig);
      }
  }, [user]);

  useEffect(() => {
      if (user) {
          const unsubscribe = dataService.subscribeToTracks(user.uid, (data: any[]) => {
              const mapped = data.map(d => ({
                  id: d.id,
                  title: d.title,
                  artist: d.artist || profile.stageName,
                  image: d.image || d.imageUrl,
                  audioUrl: d.audioUrl,
                  videoUrl: d.videoUrl,
                  duration: d.duration || '3:00',
                  plays: d.plays || 0,
                  earnings: d.earnings || 0,
                  bpm: d.bpm,
                  key: d.key,
                  mood_tags: d.mood_tags || []
              }));
              setTracks(mapped);
          });
          return () => unsubscribe();
      }
  }, [user, profile.stageName]);

  const handleSave = async () => {
    try {
        await authService.updateUserProfile({
            displayName: profile.stageName,
            bio: profile.bio,
            location: profile.location,
            photoURL: avatar || undefined,
            socialLinks: socials,
            tourDates: tourDates,
            profileConfig: config
        });
        setIsEditing(false);
        window.dispatchEvent(new CustomEvent('sf-notification', { 
            detail: { title: 'Site Published', message: 'Your professional profile has been updated on the ledger.', type: 'success' } 
        }));
    } catch (e) {
        alert("Failed to save changes");
    }
  };

  const handleShare = async () => {
      const shareUrl = `${window.location.origin}/artist/${user?.uid}`;
      if (navigator.share) {
          try { await navigator.share({ title: profile.stageName, url: shareUrl }); } catch (err) {}
      } else {
          navigator.clipboard.writeText(shareUrl);
          alert("Link copied!");
      }
  };

  const handleUploadClick = (target: 'avatar' | 'banner') => {
    setUploadTarget(target);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (uploadTarget === 'avatar') setAvatar(result);
        if (uploadTarget === 'banner') setBanner(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateSectionVisibility = (id: string) => {
      setConfig({
          ...config,
          sections: config.sections.map(s => s.id === id ? { ...s, visible: !s.visible } : s)
      });
  };

  const getThemeClasses = () => {
      switch(config.theme) {
          case 'light': return 'bg-white text-slate-900';
          case 'cyber': return 'bg-black font-mono';
          case 'minimal': return 'bg-slate-50 text-slate-600';
          default: return 'bg-slate-950 text-white';
      }
  };

  const getFontClass = () => {
      if (config.theme === 'cyber') return 'font-mono';
      if (config.fontStyle === 'serif') return 'font-serif';
      if (config.fontStyle === 'mono') return 'font-mono';
      return 'font-sans';
  };

  const getAccentStyles = () => ({
      '--accent-color': config.accentColor,
      '--accent-bg': `${config.accentColor}1A`, // 10% opacity hex
      '--accent-border': `${config.accentColor}33`, // 20% opacity hex
  } as React.CSSProperties);

  function addTourDate() {
      setTourDates([...tourDates, { date: new Date().toISOString().split('T')[0], venue: 'New Venue', city: 'City, State', status: 'Announced', ticketLink: '' }]);
  }

  function removeTourDate(index: number) {
      const newDates = [...tourDates];
      newDates.splice(index, 1);
      setTourDates(newDates);
  }

  const updateTourDate = (index: number, field: keyof TourDate, value: string) => {
      const newDates = [...tourDates];
      newDates[index] = { ...newDates[index], [field]: value };
      setTourDates(newDates);
  };

  return (
    <div className={`flex min-h-screen ${getThemeClasses()} ${getFontClass()} overflow-hidden transition-colors duration-500`} style={getAccentStyles()}>
      
      {/* --- BUILDER SIDEBAR --- */}
      {isEditing && !isPublic && (
          <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-8 shrink-0 custom-scrollbar animate-in slide-in-from-left duration-300 z-50">
              <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter italic">
                        <Palette className="w-5 h-5 text-indigo-500" /> Site Builder
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Institutional Node Editing</p>
                  </div>
                  <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-red-500 transition-colors p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-10">
                  {/* Theme Selector */}
                  <section>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Master Visual Logic</label>
                      <div className="grid grid-cols-2 gap-3">
                          {[
                              { id: 'dark', label: 'Obsidian', icon: Moon },
                              { id: 'light', label: 'Ivory', icon: Sun },
                              { id: 'cyber', label: 'Protocol', icon: Zap },
                              { id: 'minimal', label: 'Raw', icon: Layout }
                          ].map(t => (
                              <button 
                                key={t.id} 
                                onClick={() => setConfig({...config, theme: t.id as any})}
                                className={`flex flex-col items-center gap-2 p-4 rounded-2xl text-[10px] font-black uppercase border-2 transition-all ${config.theme === t.id ? 'border-indigo-500 bg-indigo-500/5 text-indigo-600 dark:text-indigo-400 shadow-lg' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400'}`}
                              >
                                  <t.icon className="w-5 h-5" />
                                  {t.label}
                              </button>
                          ))}
                      </div>
                  </section>

                  {/* Accent Color */}
                  <section>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Identity Accent</label>
                      <div className="flex flex-wrap gap-3">
                          {['#06b6d4', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#ec4899', '#ffffff', '#6366f1'].map(c => (
                              <button 
                                key={c}
                                onClick={() => setConfig({...config, accentColor: c})}
                                className={`w-10 h-10 rounded-xl border-4 transition-all hover:scale-110 shadow-lg ${config.accentColor === c ? 'border-white dark:border-slate-400 scale-110 rotate-12' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                              />
                          ))}
                      </div>
                  </section>

                  {/* Typography */}
                  <section>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Character Type</label>
                      <div className="space-y-2">
                          {(['sans', 'serif', 'mono'] as const).map(f => (
                              <button 
                                key={f} 
                                onClick={() => setConfig({...config, fontStyle: f})}
                                className={`w-full text-left px-5 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-2 ${config.fontStyle === f ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 border-transparent shadow-xl' : 'bg-slate-50 dark:bg-slate-950 text-slate-400 border-slate-100 dark:border-slate-800'}`}
                              >
                                  {f} Module
                              </button>
                          ))}
                      </div>
                  </section>

                  {/* Section Controls */}
                  <section>
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Modular Layout</label>
                      <div className="space-y-3">
                          {config.sections.map(s => (
                              <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                  <div className="flex items-center gap-3">
                                      <Layout className="w-4 h-4 text-slate-400" />
                                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">{s.id}</span>
                                  </div>
                                  <button 
                                    onClick={() => updateSectionVisibility(s.id)}
                                    className={`w-10 h-5 rounded-full p-1 transition-all ${s.visible ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-800'}`}
                                  >
                                      <div className={`w-3 h-3 bg-white rounded-full transition-transform ${s.visible ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </section>

                  <div className="pt-6">
                    <button 
                        onClick={handleSave}
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        <Globe className="w-4 h-4" /> Authorize & Publish
                    </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- PREVIEW AREA --- */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

        {/* Hero Section */}
        <div className="relative h-[500px] md:h-[650px] overflow-hidden group">
            <div className="absolute inset-0 bg-slate-900">
                {banner ? <img src={banner} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-slate-950"></div>}
                {/* Custom Gradient overlay using accent variable */}
                <div 
                    className="absolute inset-0 bg-gradient-to-t from-[var(--theme-bg)] via-transparent to-transparent opacity-90"
                    style={{ '--theme-bg': config.theme === 'light' ? '#ffffff' : '#020617' } as any}
                ></div>
            </div>

            <div className="absolute top-8 left-8 flex gap-3 z-30">
                {isPublic && onBack && (
                    <button onClick={onBack} className="bg-black/50 hover:bg-black/70 text-white px-6 py-2.5 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/10">
                        <ArrowLeft className="w-4 h-4" /> Exit Node
                    </button>
                )}
                {!isPublic && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="bg-[var(--accent-color)] text-slate-950 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:scale-105 transition-all">
                        <Edit2 className="w-4 h-4" /> Initialize Site Builder
                    </button>
                )}
                {isEditing && (
                    <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full backdrop-blur-md text-[10px] font-black uppercase tracking-widest border border-green-500/30 flex items-center gap-2 animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5" /> Live Signal Preview
                    </div>
                )}
            </div>

            <div className="absolute bottom-0 left-0 w-full p-8 md:p-20 flex flex-col md:flex-row items-end gap-10 z-10">
                <div className="relative group/avatar">
                    <div className="w-44 h-44 md:w-64 md:h-64 rounded-[2.5rem] overflow-hidden border-8 border-white/5 shadow-2xl bg-slate-900 relative">
                        <img src={avatar || ''} className="w-full h-full object-cover" />
                        {config.theme === 'cyber' && (
                            <div className="absolute inset-0 border-4 border-[var(--accent-color)] opacity-20 pointer-events-none"></div>
                        )}
                    </div>
                    {isEditing && (
                        <button onClick={() => handleUploadClick('avatar')} className="absolute inset-0 bg-black/70 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-black text-[10px] uppercase tracking-widest gap-2 backdrop-blur-sm">
                            <Camera className="w-8 h-8 text-[var(--accent-color)]" /> Ingest Image
                        </button>
                    )}
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                        {isEditing ? (
                            <input 
                                value={profile.stageName} 
                                onChange={e => setProfile({...profile, stageName: e.target.value})}
                                className="bg-transparent border-b-2 border-white/10 text-5xl md:text-8xl font-black focus:border-[var(--accent-color)] outline-none w-full uppercase tracking-tighter italic transition-colors"
                            />
                        ) : (
                            <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8]" style={{ color: config.theme === 'cyber' ? 'var(--accent-color)' : undefined }}>
                                {profile.stageName}
                            </h1>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-8 font-black uppercase tracking-[0.2em] text-[10px] opacity-60">
                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[var(--accent-color)]" /> {profile.location}</span>
                        <span className="flex items-center gap-2"><Music className="w-4 h-4 text-[var(--accent-color)]" /> {profile.genre}</span>
                        <span className="flex items-center gap-2" style={{ color: 'var(--accent-color)' }}><Star className="w-4 h-4 fill-current" /> Identity Verified</span>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button onClick={() => setShowChat(true)} className="px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl flex items-center gap-3 hover:scale-105 active:scale-95" style={{ backgroundColor: 'var(--accent-color)', color: config.theme === 'light' ? 'white' : 'black' }}>
                        <Mail className="w-5 h-5" /> Connect Hub
                    </button>
                    <button onClick={handleShare} className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all shadow-xl">
                        <Share2 className="w-6 h-6 text-slate-400" />
                    </button>
                </div>
            </div>
        </div>

        {/* Dynamic Sections */}
        <div className="max-w-7xl mx-auto px-8 md:px-20 py-24 space-y-32">
            {config.sections.filter(s => s.visible).sort((a, b) => a.order - b.order).map(section => (
                <div key={section.id} className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                    
                    {section.id === 'bio' && (
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 items-start">
                            <div className="md:col-span-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30 mb-6 italic">Operational Dossier</h3>
                                <div className="w-20 h-1.5" style={{ backgroundColor: 'var(--accent-color)' }}></div>
                            </div>
                            <div className="md:col-span-8">
                                {isEditing ? (
                                    <textarea 
                                        value={profile.bio} 
                                        onChange={e => setProfile({...profile, bio: e.target.value})}
                                        className="w-full bg-slate-900/50 border-2 border-white/5 rounded-[2.5rem] p-10 text-xl leading-relaxed focus:border-[var(--accent-color)] outline-none h-64 shadow-inner"
                                    />
                                ) : (
                                    <p className="text-2xl md:text-3xl font-medium leading-relaxed opacity-90 tracking-tight" style={{ color: config.theme === 'cyber' ? 'var(--accent-color)' : undefined }}>{profile.bio}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {section.id === 'tracks' && (
                        <div className="space-y-12">
                             <div className="flex justify-between items-end border-b-2 border-white/5 pb-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30 italic">On-Chain Discography</h3>
                                {/* Fixed undefined setActiveTab by using onNavigate prop and VIEWS constant */}
                                <button onClick={() => onNavigate?.(VIEWS.MY_MUSIC)} className="text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2" style={{ color: 'var(--accent-color)' }}>Access Ledger <ArrowRight className="w-3 h-3"/></button>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {tracks.slice(0, 4).map(track => (
                                    <div key={track.id} className="group flex items-center gap-8 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:border-[var(--accent-color)] transition-all cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-[var(--accent-bg)]" onClick={() => playTrack(track)}>
                                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 shadow-2xl border border-white/10">
                                            <img src={track.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <Play className="w-10 h-10 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-black text-xl truncate uppercase tracking-tighter" style={{ color: config.theme === 'cyber' ? 'var(--accent-color)' : undefined }}>{track.title}</h4>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40">{track.plays.toLocaleString()} Signals</span>
                                                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)]">Institutional Node</span>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono opacity-20 group-hover:opacity-100 transition-opacity">{track.duration}</div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {section.id === 'photos' && (
                        <div className="space-y-12">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30 italic">Visual Corpus</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {MOCK_PHOTOS.map((src, i) => (
                                    <div key={i} className="aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl hover:scale-[1.03] transition-transform duration-700 cursor-pointer border border-white/5 group relative">
                                        <img src={src} className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700" />
                                        <div className="absolute inset-0 border-2 border-white/10 group-hover:border-[var(--accent-color)] transition-colors rounded-[2rem]"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {section.id === 'tour' && (
                        <div className="space-y-12">
                             <div className="flex justify-between items-end border-b-2 border-white/5 pb-6">
                                <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-30 italic">Live Deployments</h3>
                                {isEditing && (
                                    <button 
                                        onClick={addTourDate} 
                                        className="text-[10px] font-black uppercase tracking-widest bg-white/5 px-6 py-2.5 rounded-full hover:bg-white/10 transition-all flex items-center gap-2 border border-white/10"
                                    >
                                        <Plus className="w-4 h-4 text-[var(--accent-color)]" /> Append Show
                                    </button>
                                )}
                             </div>
                             <div className="rounded-[3rem] border border-white/5 overflow-hidden bg-white/5 shadow-2xl">
                                {tourDates.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {tourDates.map((date, i) => (
                                            <div key={i} className="p-8 md:p-12 hover:bg-white/5 transition-all group">
                                                {isEditing ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Signal Date</label>
                                                            <input 
                                                                type="date"
                                                                value={date.date}
                                                                onChange={(e) => updateTourDate(i, 'date', e.target.value)}
                                                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--accent-color)] outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Venue Node</label>
                                                            <input 
                                                                value={date.venue}
                                                                onChange={(e) => updateTourDate(i, 'venue', e.target.value)}
                                                                placeholder="Venue Name"
                                                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--accent-color)] outline-none font-bold"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">City Hub</label>
                                                            <input 
                                                                value={date.city}
                                                                onChange={(e) => updateTourDate(i, 'city', e.target.value)}
                                                                placeholder="City, State"
                                                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--accent-color)] outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Ticket Access</label>
                                                            <input 
                                                                value={date.ticketLink || ''}
                                                                onChange={(e) => updateTourDate(i, 'ticketLink', e.target.value)}
                                                                placeholder="URL Protocol"
                                                                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-[var(--accent-color)] outline-none font-mono"
                                                            />
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <select 
                                                                value={date.status}
                                                                onChange={(e) => updateTourDate(i, 'status', e.target.value)}
                                                                className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-3 text-[10px] font-black uppercase text-white focus:border-[var(--accent-color)] outline-none appearance-none"
                                                            >
                                                                <option>Announced</option>
                                                                <option>Selling Fast</option>
                                                                <option>Sold Out</option>
                                                                <option>Cancelled</option>
                                                            </select>
                                                            <button onClick={() => removeTourDate(i)} className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                                                                <Trash2 className="w-5 h-5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                                                        <div className="flex items-center gap-10 mb-4 md:mb-0">
                                                            <div className="text-center w-20">
                                                                <div className="text-[10px] uppercase font-black opacity-30 tracking-[0.2em]">{new Date(date.date).toLocaleString('default', { month: 'short' })}</div>
                                                                <div className="text-4xl font-black italic tracking-tighter" style={{ color: config.theme === 'cyber' ? 'var(--accent-color)' : undefined }}>{new Date(date.date).getDate() || '??'}</div>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-2xl font-black uppercase tracking-tight italic">{date.venue}</h4>
                                                                <p className="text-xs opacity-40 font-bold uppercase tracking-[0.2em] mt-1">{date.city}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-8">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 transition-opacity" style={{ color: date.status === 'Sold Out' ? '#ef4444' : 'var(--accent-color)' }}>{date.status}</span>
                                                            <a 
                                                                href={date.ticketLink || '#'} 
                                                                target="_blank" 
                                                                rel="noreferrer"
                                                                className={`px-12 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.2em] transition-all text-center min-w-[200px] border-2 ${date.status === 'Sold Out' ? 'border-white/5 text-white/20 cursor-not-allowed pointer-events-none' : 'border-white/10 hover:border-[var(--accent-color)] hover:bg-[var(--accent-bg)]'}`}
                                                                style={{ color: date.status !== 'Sold Out' ? 'var(--accent-color)' : undefined }}
                                                            >
                                                                {date.status === 'Sold Out' ? 'Access Revoked' : 'Authorize Tickets'}
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center text-slate-500 font-black uppercase tracking-[0.3em] opacity-20 italic">No Active Deployments Located.</div>
                                )}
                             </div>
                        </div>
                    )}

                </div>
            ))}

            {/* Footer Connect */}
            <div className="pt-32 border-t-2 border-white/5 text-center">
                 <div className="inline-block p-4 rounded-full bg-[var(--accent-bg)] border border-[var(--accent-border)] mb-12">
                    <Sparkles className="w-8 h-8" style={{ color: 'var(--accent-color)' }} />
                 </div>
                 <h2 className="text-6xl md:text-9xl font-black mb-16 tracking-tighter italic leading-none" style={{ color: config.theme === 'cyber' ? 'var(--accent-color)' : undefined }}>OPERATIONAL SYNC.</h2>
                 <div className="flex flex-wrap justify-center gap-6 mb-24">
                    {[
                        { link: socials.spotify, icon: Music, label: 'Spotify' },
                        { link: socials.instagram, icon: ImageIcon, label: 'Instagram' },
                        { link: socials.youtube, icon: Video, label: 'YouTube' },
                        { link: socials.twitter, icon: Send, label: 'X Node' },
                        { link: socials.tiktok, icon: Radio, label: 'TikTok' }
                    ].map((soc, i) => soc.link ? (
                        <a key={i} href={soc.link} className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 hover:border-[var(--accent-color)] hover:bg-[var(--accent-bg)] transition-all group shadow-2xl">
                            <soc.icon className="w-10 h-10 text-slate-500 group-hover:scale-110 transition-all" style={{ color: config.theme === 'cyber' ? 'var(--accent-color)' : undefined }} />
                        </a>
                    ) : null)}
                 </div>
                 <div className="space-y-4">
                    <p className="text-[10px] font-black opacity-30 uppercase tracking-[0.4em]">Verified On-Chain Signal #{user?.uid.slice(0, 8)}</p>
                    <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--accent-color)' }}>© 2025 {profile.stageName} • Sound Merge Infrastructure</p>
                 </div>
            </div>
        </div>
      </div>

      {/* MODALS */}
      {showChat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
              <div className="bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/10">
                  <div className="p-10 bg-slate-800/50 flex justify-between items-center border-b border-white/5">
                      <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-3xl bg-slate-700 overflow-hidden border-2 border-[var(--accent-color)] shadow-2xl">
                              <img src={avatar || ''} className="w-full h-full object-cover" />
                          </div>
                          <div>
                              <h4 className="text-xl font-black text-white uppercase tracking-tight italic">{profile.stageName} Hub</h4>
                              <p className="text-[10px] text-green-400 font-black uppercase tracking-[0.2em] mt-1 animate-pulse">Sync Active Now</p>
                          </div>
                      </div>
                      <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white p-3 bg-slate-800 rounded-full transition-colors"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-12 space-y-8">
                      <p className="text-sm text-slate-400 text-center leading-relaxed font-medium">Interested in a high-fidelity collaboration, booking, or licensing voice IP? Send a direct data request.</p>
                      <textarea className="w-full bg-slate-950 border border-white/5 rounded-[2rem] p-6 text-white focus:border-[var(--accent-color)] outline-none h-44 shadow-inner resize-none font-medium" placeholder="Brief your request..." />
                      <button className="w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl transition-all hover:scale-[1.02] active:scale-95" style={{ backgroundColor: 'var(--accent-color)', color: config.theme === 'light' ? 'white' : 'black' }}>Dispatch Message</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};