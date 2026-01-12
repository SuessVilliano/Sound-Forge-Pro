
import React, { useState, useRef, useEffect } from 'react';
import { 
    Edit2, Camera, Share2, MapPin, Globe, Save, X, Link as LinkIcon, 
    Music, Users, Shield, ShoppingBag, Play, Mail, MessageCircle, 
    CheckCircle2, Image as ImageIcon, Send, MoreHorizontal, Calendar, 
    Headphones, TrendingUp, Video, Mic2, Star, DollarSign, ArrowLeft,
    Zap, Plus, Trash2, CalendarCheck, RefreshCw, LogOut, Radio, Palette, Layout, Type as TypeIcon, Eye, Check, Sparkles,
    Moon, Sun, ArrowRight, ChevronRight, Twitter, Instagram, Youtube, Facebook, Linkedin
} from 'lucide-react';
import { User, Track, TourDate } from '../types';
import { usePlayer } from '../contexts/PlayerContext';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
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
  const [avatar, setAvatar] = useState<string | null>(user?.photoURL || null);
  const [banner, setBanner] = useState<string | null>(null);
  
  // Design State
  const [config, setConfig] = useState(user?.profileConfig || {
      theme: 'dark',
      accentColor: '#06b6d4',
      fontStyle: 'sans',
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
          sections: config.sections.map((s: any) => s.id === id ? { ...s, visible: !s.visible } : s)
      });
  };

  const getThemeClasses = () => {
      switch(config.theme) {
          case 'light': return 'bg-white text-slate-900';
          case 'cyber': return 'bg-black font-mono text-green-400';
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

  const isSectionVisible = (id: string) => {
      return config.sections.find((s: any) => s.id === id)?.visible;
  };

  return (
    <div className={`flex flex-col md:flex-row min-h-screen ${getThemeClasses()} ${getFontClass()} overflow-hidden transition-colors duration-500`} style={getAccentStyles()}>
      
      {/* --- BUILDER SIDEBAR --- */}
      {isEditing && !isPublic && (
          <div className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto p-8 shrink-0 custom-scrollbar animate-in slide-in-from-left duration-300 z-50">
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
                          {config.sections.map((s: any) => (
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
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        Publish Changes
                    </button>
                  </div>
              </div>
          </div>
      )}

      {/* --- MAIN PROFILE CANVAS --- */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative">
          
          {/* Top Navigation */}
          {!isPublic && (
              <div className="absolute top-6 right-6 z-40 flex items-center gap-3">
                  <button onClick={onBack} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all text-white"><ArrowLeft className="w-5 h-5" /></button>
                  {!isEditing && (
                      <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-full hover:bg-slate-200 transition-all shadow-xl flex items-center gap-2">
                          <Edit2 className="w-4 h-4" /> Edit Profile
                      </button>
                  )}
                  <button onClick={handleShare} className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all text-white"><Share2 className="w-5 h-5" /></button>
              </div>
          )}

          {/* Hero Header */}
          <div className="relative h-96 w-full group">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10"></div>
              {banner ? (
                  <img src={banner} className="w-full h-full object-cover" />
              ) : (
                  <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-700">
                      <ImageIcon className="w-20 h-20" />
                  </div>
              )}
              
              {isEditing && (
                  <button 
                    onClick={() => handleUploadClick('banner')}
                    className="absolute top-6 left-6 z-30 bg-black/50 text-white px-4 py-2 rounded-full backdrop-blur font-bold text-xs flex items-center gap-2 hover:bg-black/70 transition-all"
                  >
                      <Camera className="w-4 h-4" /> Change Cover
                  </button>
              )}

              <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 z-20 flex flex-col md:flex-row items-end gap-8">
                  <div className="relative">
                      <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white/10 overflow-hidden shadow-2xl relative bg-slate-900">
                          <img src={avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.stageName)}&background=random`} className="w-full h-full object-cover" />
                          {isEditing && (
                              <button 
                                onClick={() => handleUploadClick('avatar')}
                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-all"
                              >
                                  <Camera className="w-8 h-8 text-white" />
                              </button>
                          )}
                      </div>
                      <div className="absolute bottom-2 right-2 bg-blue-500 text-white p-1.5 rounded-full border-4 border-black" title="Verified Artist">
                          <Check className="w-3 h-3" />
                      </div>
                  </div>
                  
                  <div className="flex-1 mb-2">
                      <h1 
                        className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-2 italic"
                        contentEditable={isEditing}
                        onBlur={(e) => setProfile({...profile, stageName: e.currentTarget.textContent || ''})}
                        suppressContentEditableWarning={true}
                      >
                          {profile.stageName}
                      </h1>
                      <div className="flex flex-wrap items-center gap-4 text-white/80 font-bold text-sm">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                          <span>•</span>
                          <span className="uppercase tracking-widest">{profile.genre}</span>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      {socials.instagram && <a href={`https://instagram.com/${socials.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all text-white"><Instagram className="w-5 h-5" /></a>}
                      {socials.twitter && <a href={`https://twitter.com/${socials.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all text-white"><Twitter className="w-5 h-5" /></a>}
                      {socials.youtube && <a href="#" className="p-3 bg-white/10 backdrop-blur rounded-full hover:bg-white/20 transition-all text-white"><Youtube className="w-5 h-5" /></a>}
                      <button className="px-8 py-3 bg-white text-slate-900 font-black uppercase tracking-widest rounded-full hover:scale-105 transition-all shadow-xl">Follow</button>
                  </div>
              </div>
          </div>

          <div className="max-w-7xl mx-auto p-8 md:p-16 space-y-20">
              
              {/* BIO SECTION */}
              {isSectionVisible('bio') && (
                  <section className="max-w-4xl">
                      <h3 className="text-sm font-black opacity-50 uppercase tracking-[0.3em] mb-6 border-b border-current pb-2 w-fit">Biography</h3>
                      <p 
                        className="text-xl md:text-3xl leading-relaxed font-medium opacity-90"
                        contentEditable={isEditing}
                        onBlur={(e) => setProfile({...profile, bio: e.currentTarget.textContent || ''})}
                        suppressContentEditableWarning={true}
                      >
                          {profile.bio}
                      </p>
                  </section>
              )}

              {/* TRACKS SECTION */}
              {isSectionVisible('tracks') && (
                  <section>
                      <div className="flex items-center justify-between mb-8">
                          <h3 className="text-sm font-black opacity-50 uppercase tracking-[0.3em] border-b border-current pb-2 w-fit">Latest Releases</h3>
                          <button className="text-xs font-bold uppercase tracking-widest hover:opacity-70 transition-opacity flex items-center gap-2">View Discography <ArrowRight className="w-4 h-4" /></button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {tracks.length > 0 ? tracks.map(track => (
                              <div key={track.id} className="group relative aspect-square bg-slate-900 rounded-[2rem] overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all">
                                  <img src={track.image || track.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                                  <div className="absolute bottom-0 left-0 w-full p-6">
                                      <h4 className="text-white font-black text-2xl uppercase tracking-tighter mb-1 truncate">{track.title}</h4>
                                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest">{track.duration} • {track.genre || 'Single'}</p>
                                  </div>
                                  <button 
                                    onClick={() => playTrack(track)}
                                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                      <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/30">
                                          <Play className="w-8 h-8 text-white fill-white ml-1" />
                                      </div>
                                  </button>
                              </div>
                          )) : (
                              <div className="col-span-full py-12 text-center border-2 border-dashed border-current opacity-30 rounded-[2rem]">
                                  <Music className="w-12 h-12 mx-auto mb-4" />
                                  <p className="font-bold">No tracks published yet.</p>
                              </div>
                          )}
                      </div>
                  </section>
              )}

              {/* PHOTOS SECTION */}
              {isSectionVisible('photos') && (
                  <section>
                      <h3 className="text-sm font-black opacity-50 uppercase tracking-[0.3em] mb-8 border-b border-current pb-2 w-fit">Visual Gallery</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-96">
                          {MOCK_PHOTOS.map((url, i) => (
                              <div key={i} className={`rounded-2xl overflow-hidden relative group ${i === 0 ? 'col-span-2 row-span-2' : ''}`}>
                                  <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors"></div>
                              </div>
                          ))}
                      </div>
                  </section>
              )}

              {/* TOUR SECTION */}
              {isSectionVisible('tour') && (
                  <section>
                      <div className="flex items-center justify-between mb-8">
                          <h3 className="text-sm font-black opacity-50 uppercase tracking-[0.3em] border-b border-current pb-2 w-fit">Tour Dates</h3>
                          {isEditing && <button onClick={addTourDate} className="text-xs font-bold uppercase tracking-widest hover:opacity-70 flex items-center gap-2"><Plus className="w-4 h-4" /> Add Date</button>}
                      </div>

                      <div className="space-y-4">
                          {tourDates.map((date, i) => (
                              <div key={i} className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-2xl border border-current/10 hover:bg-current/5 transition-colors group">
                                  <div className="text-center md:text-left min-w-[80px]">
                                      <div className="text-xs font-black opacity-60 uppercase tracking-widest">{new Date(date.date).toLocaleString('default', { month: 'short' })}</div>
                                      <div className="text-3xl font-black">{new Date(date.date).getDate()}</div>
                                  </div>
                                  <div className="flex-1 text-center md:text-left">
                                      {isEditing ? (
                                          <div className="flex flex-col gap-2">
                                              <input value={date.venue} onChange={e => updateTourDate(i, 'venue', e.target.value)} className="bg-transparent border-b border-current/20 font-black text-xl outline-none" />
                                              <input value={date.city} onChange={e => updateTourDate(i, 'city', e.target.value)} className="bg-transparent border-b border-current/20 text-sm opacity-60 font-bold outline-none" />
                                          </div>
                                      ) : (
                                          <>
                                              <div className="text-xl font-black uppercase tracking-tight">{date.venue}</div>
                                              <div className="text-sm font-bold opacity-60 uppercase tracking-widest">{date.city}</div>
                                          </>
                                      )}
                                  </div>
                                  <div className="flex items-center gap-4">
                                      {isEditing ? (
                                          <button onClick={() => removeTourDate(i)} className="p-3 rounded-full hover:bg-red-500/10 text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
                                      ) : (
                                          <button className="px-8 py-3 rounded-full border-2 border-current font-black uppercase text-[10px] tracking-widest hover:bg-current hover:text-white dark:hover:text-black transition-all">
                                              {date.status === 'Sold Out' ? 'Sold Out' : 'Get Tickets'}
                                          </button>
                                      )}
                                  </div>
                              </div>
                          ))}
                          {tourDates.length === 0 && (
                              <div className="text-center py-10 opacity-50 italic font-medium">No upcoming tour dates announced.</div>
                          )}
                      </div>
                  </section>
              )}

              {/* FOOTER */}
              <footer className="pt-20 border-t border-current/10 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-current rounded-xl flex items-center justify-center text-white dark:text-black">
                          <Music className="w-5 h-5" />
                      </div>
                      <span className="font-black uppercase tracking-widest text-xs">Powered by Sound Merge</span>
                  </div>
                  <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
                      <a href="#" className="hover:opacity-50 transition-opacity">Contact Management</a>
                      <a href="#" className="hover:opacity-50 transition-opacity">Press Kit</a>
                      <a href="#" className="hover:opacity-50 transition-opacity">Privacy Policy</a>
                  </div>
              </footer>
          </div>
      </div>
      
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
    </div>
  );
};
