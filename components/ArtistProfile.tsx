
import React, { useState, useRef, useEffect } from 'react';
import { 
    Edit2, Camera, Share2, MapPin, Globe, Save, X, Link as LinkIcon, 
    Music, Users, Shield, ShoppingBag, Play, Mail, MessageCircle, 
    CheckCircle2, Image as ImageIcon, Send, MoreHorizontal, Calendar, 
    Headphones, TrendingUp, Video, Mic2, Star, DollarSign, ArrowLeft,
    Zap, Plus, Trash2, CalendarCheck, RefreshCw, LogOut, Radio, Palette, Layout, Type as TypeIcon, Eye, Check
} from 'lucide-react';
import { User, Track, TourDate } from '../types';
import { VoiceNFTManager } from './VoiceNFTManager';
import { MerchStore } from './MerchStore';
import { usePlayer } from '../contexts/PlayerContext';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';
import { googleCalendarService } from '../services/googleCalendarService';

interface ArtistProfileProps {
  user: User | null;
  onNavigate?: (view: string) => void;
  isPublic?: boolean; 
  onBack?: () => void;
}

const MOCK_PHOTOS = [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
];

export const ArtistProfile: React.FC<ArtistProfileProps> = ({ user, onNavigate, isPublic = false, onBack }) => {
  const [activeTab, setActiveTab] = useState<'epk' | 'music' | 'voice-ip' | 'store'>('epk');
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
      soundcloud: user?.socialLinks?.soundcloud || ''
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
          if (user.socialLinks) setSocials({ ...socials, ...user.socialLinks });
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
          case 'cyber': return 'bg-black text-cyan-400 font-mono';
          case 'minimal': return 'bg-slate-50 text-slate-600';
          default: return 'bg-slate-950 text-white';
      }
  };

  const getFontClass = () => {
      if (config.fontStyle === 'serif') return 'font-serif';
      if (config.fontStyle === 'mono') return 'font-mono';
      return 'font-sans';
  };

  return (
    <div className={`flex min-h-screen ${getThemeClasses()} ${getFontClass()} overflow-hidden`}>
      
      {/* --- BUILDER SIDEBAR (Only in Edit Mode) --- */}
      {isEditing && !isPublic && (
          <div className="w-80 border-r border-slate-800 bg-slate-900 overflow-y-auto p-6 shrink-0 custom-scrollbar animate-in slide-in-from-left duration-300">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2"><Palette className="w-5 h-5 text-cyan-500" /> Site Builder</h2>
                  <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              <div className="space-y-8">
                  {/* Theme Selector */}
                  <section>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Master Theme</label>
                      <div className="grid grid-cols-2 gap-2">
                          {['dark', 'light', 'cyber', 'minimal'].map(t => (
                              <button 
                                key={t} 
                                onClick={() => setConfig({...config, theme: t as any})}
                                className={`px-3 py-2 rounded-lg text-xs font-bold capitalize border-2 transition-all ${config.theme === t ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-slate-800 bg-slate-950 text-slate-500'}`}
                              >
                                  {t}
                              </button>
                          ))}
                      </div>
                  </section>

                  {/* Accent Color */}
                  <section>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Accent Color</label>
                      <div className="flex flex-wrap gap-2">
                          {['#06b6d4', '#8b5cf6', '#f43f5e', '#10b981', '#f59e0b', '#ffffff'].map(c => (
                              <button 
                                key={c}
                                onClick={() => setConfig({...config, accentColor: c})}
                                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${config.accentColor === c ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: c }}
                              />
                          ))}
                      </div>
                  </section>

                  {/* Font Style */}
                  <section>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Typography</label>
                      <div className="space-y-2">
                          {(['sans', 'serif', 'mono'] as const).map(f => (
                              <button 
                                key={f} 
                                onClick={() => setConfig({...config, fontStyle: f})}
                                className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-all ${config.fontStyle === f ? 'bg-white text-slate-950 font-bold' : 'bg-slate-950 text-slate-500 hover:text-slate-300'}`}
                              >
                                  {f.charAt(0).toUpperCase() + f.slice(1)} Mode
                              </button>
                          ))}
                      </div>
                  </section>

                  {/* Section Controls */}
                  <section>
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Layout Sections</label>
                      <div className="space-y-3">
                          {config.sections.map(s => (
                              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                                  <div className="flex items-center gap-3">
                                      <Layout className="w-4 h-4 text-slate-500" />
                                      <span className="text-sm font-bold text-slate-300 capitalize">{s.id}</span>
                                  </div>
                                  <button 
                                    onClick={() => updateSectionVisibility(s.id)}
                                    className={`w-10 h-5 rounded-full p-0.5 transition-colors ${s.visible ? 'bg-green-500' : 'bg-slate-700'}`}
                                  >
                                      <div className={`w-4 h-4 bg-white rounded-full transition-transform ${s.visible ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                  </button>
                              </div>
                          ))}
                      </div>
                  </section>

                  <button 
                    onClick={handleSave}
                    className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-xl shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                  >
                      <Save className="w-5 h-5" /> Publish Changes
                  </button>
              </div>
          </div>
      )}

      {/* --- PREVIEW AREA --- */}
      <div className="flex-1 overflow-y-auto relative custom-scrollbar">
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

        {/* Hero Section */}
        <div className="relative h-[400px] md:h-[500px] overflow-hidden group">
            <div className="absolute inset-0 bg-slate-900">
                {banner ? <img src={banner} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black"></div>}
                <div className="absolute inset-0 bg-gradient-to-t from-current-bg via-transparent to-transparent" style={{ '--current-bg': config.theme === 'light' ? 'white' : 'black' } as any}></div>
            </div>

            <div className="absolute top-6 left-6 flex gap-3 z-30">
                {isPublic && onBack && (
                    <button onClick={onBack} className="bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-sm font-bold shadow-lg">
                        <ArrowLeft className="w-4 h-4" /> Exit Site
                    </button>
                )}
                {!isPublic && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="bg-cyan-500 text-slate-950 px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                        <Edit2 className="w-4 h-4" /> Enter Build Mode
                    </button>
                )}
            </div>

            <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 flex flex-col md:flex-row items-end gap-8 z-10">
                <div className="relative group/avatar">
                    <div className="w-40 h-40 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl bg-slate-800">
                        <img src={avatar || ''} className="w-full h-full object-cover" />
                    </div>
                    {isEditing && (
                        <button onClick={() => handleUploadClick('avatar')} className="absolute inset-0 bg-black/60 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white font-bold gap-2">
                            <Camera className="w-5 h-5" /> Change Photo
                        </button>
                    )}
                </div>

                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-4">
                        {isEditing ? (
                            <input 
                                value={profile.stageName} 
                                onChange={e => setProfile({...profile, stageName: e.target.value})}
                                className="bg-transparent border-b border-white/20 text-4xl md:text-7xl font-black focus:border-cyan-500 outline-none w-full"
                            />
                        ) : (
                            <h1 className="text-4xl md:text-7xl font-black tracking-tight">{profile.stageName}</h1>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center gap-6 opacity-70 font-bold uppercase tracking-widest text-xs">
                        <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {profile.location}</span>
                        <span className="flex items-center gap-2"><Music className="w-4 h-4" /> {profile.genre}</span>
                        <span className="flex items-center gap-2 text-cyan-400"><Star className="w-4 h-4 fill-current" /> Official Artist</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={() => setShowChat(true)} className="px-8 py-3 rounded-full font-bold transition-all shadow-xl flex items-center gap-2 hover:scale-105" style={{ backgroundColor: config.accentColor, color: config.theme === 'light' ? 'white' : 'black' }}>
                        <Mail className="w-5 h-5" /> Connect
                    </button>
                    <button onClick={handleShare} className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all shadow-lg">
                        <Share2 className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>

        {/* Dynamic Sections */}
        <div className="max-w-6xl mx-auto px-8 py-16 space-y-24">
            {config.sections.filter(s => s.visible).sort((a, b) => a.order - b.order).map(section => (
                <div key={section.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    
                    {section.id === 'bio' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
                            <div className="md:col-span-1">
                                <h3 className="text-sm font-black uppercase tracking-widest opacity-50 mb-4">The Story</h3>
                                <div className="w-12 h-1 mb-8" style={{ backgroundColor: config.accentColor }}></div>
                            </div>
                            <div className="md:col-span-2">
                                {isEditing ? (
                                    <textarea 
                                        value={profile.bio} 
                                        onChange={e => setProfile({...profile, bio: e.target.value})}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-lg leading-relaxed focus:border-cyan-500 outline-none h-48"
                                    />
                                ) : (
                                    <p className="text-xl md:text-2xl font-medium leading-relaxed opacity-90">{profile.bio}</p>
                                )}
                            </div>
                        </div>
                    )}

                    {section.id === 'tracks' && (
                        <div className="space-y-8">
                             <div className="flex justify-between items-end">
                                <h3 className="text-sm font-black uppercase tracking-widest opacity-50">Discography</h3>
                                <button onClick={() => setActiveTab('music')} className="text-xs font-bold uppercase tracking-widest hover:underline" style={{ color: config.accentColor }}>View All Releases</button>
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {tracks.slice(0, 4).map(track => (
                                    <div key={track.id} className="group flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer" onClick={() => playTrack(track)}>
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 shadow-lg">
                                            <img src={track.image} className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <Play className="w-8 h-8 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-lg truncate">{track.title}</h4>
                                            <p className="text-sm opacity-50">{track.plays.toLocaleString()} Streamed</p>
                                        </div>
                                        <div className="text-xs font-mono opacity-30">{track.duration}</div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {section.id === 'photos' && (
                        <div className="space-y-8">
                            <h3 className="text-sm font-black uppercase tracking-widest opacity-50">Visuals</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {MOCK_PHOTOS.map((src, i) => (
                                    <div key={i} className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl hover:scale-[1.02] transition-transform duration-500 cursor-pointer border border-white/10">
                                        <img src={src} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {section.id === 'tour' && (
                        <div className="space-y-8">
                             <div className="flex justify-between items-end">
                                <h3 className="text-sm font-black uppercase tracking-widest opacity-50">On Tour</h3>
                                <div className="flex gap-4">
                                    {isEditing && (
                                        <button onClick={addTourDate} className="text-xs font-bold uppercase tracking-widest bg-white/10 px-4 py-1.5 rounded-full hover:bg-white/20 transition-all">Add Show</button>
                                    )}
                                </div>
                             </div>
                             <div className="rounded-3xl border border-white/10 overflow-hidden bg-white/5 shadow-2xl">
                                {tourDates.length > 0 ? (
                                    <div className="divide-y divide-white/5">
                                        {tourDates.map((date, i) => (
                                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-8 hover:bg-white/5 transition-all">
                                                <div className="flex items-center gap-8 mb-4 md:mb-0">
                                                    <div className="text-center w-16">
                                                        <div className="text-sm uppercase font-black opacity-40">{new Date(date.date).toLocaleString('default', { month: 'short' })}</div>
                                                        <div className="text-3xl font-black">{new Date(date.date).getDate() || '??'}</div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-xl font-bold">{date.venue}</h4>
                                                        <p className="text-sm opacity-50">{date.city}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6">
                                                    <span className="text-sm font-bold uppercase tracking-widest opacity-50">{date.status}</span>
                                                    <button className="px-8 py-3 rounded-full border border-white/20 font-bold hover:bg-white hover:text-black transition-all">Tickets</button>
                                                    {isEditing && (
                                                        <button onClick={() => removeTourDate(i)} className="text-red-500 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center text-slate-500 italic">No upcoming dates announced.</div>
                                )}
                             </div>
                        </div>
                    )}

                </div>
            ))}

            {/* Footer Connect */}
            <div className="pt-24 border-t border-white/10 text-center">
                 <h2 className="text-5xl md:text-8xl font-black mb-12 tracking-tighter">LET'S MERGE.</h2>
                 <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {socials.spotify && <a href={socials.spotify} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500 transition-all group"><Music className="w-8 h-8 group-hover:text-cyan-400" /></a>}
                    {socials.instagram && <a href={socials.instagram} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500 transition-all group"><ImageIcon className="w-8 h-8 group-hover:text-pink-400" /></a>}
                    {socials.youtube && <a href={socials.youtube} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-red-500 transition-all group"><Video className="w-8 h-8 group-hover:text-red-400" /></a>}
                    {socials.twitter && <a href={socials.twitter} className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400 transition-all group"><Send className="w-8 h-8 group-hover:text-blue-400" /></a>}
                 </div>
                 <p className="text-sm font-bold opacity-30 uppercase tracking-widest">© 2025 {profile.stageName} • Built on Sound Merge</p>
            </div>
        </div>
      </div>

      {/* MODALS */}
      {showChat && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowChat(false)}></div>
              <div className="bg-slate-900 w-full sm:w-[450px] rounded-3xl shadow-2xl overflow-hidden z-10 animate-in slide-in-from-bottom-10">
                  <div className="p-6 bg-slate-800 flex justify-between items-center border-b border-white/5">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-slate-700 overflow-hidden border-2 border-cyan-500">
                              <img src={avatar || ''} className="w-full h-full object-cover" />
                          </div>
                          <div>
                              <h4 className="font-bold text-white">Message {profile.stageName}</h4>
                              <p className="text-[10px] text-green-400 font-bold uppercase tracking-widest">Active Now</p>
                          </div>
                      </div>
                      <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="p-8 space-y-6">
                      <p className="text-sm text-slate-400 text-center">Interested in a feature, booking, or licensing voice IP? Send a direct request.</p>
                      <textarea className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:border-cyan-500 outline-none h-32" placeholder="Tell me about your project..." />
                      <button className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl shadow-lg transition-all">Send Message</button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );

  function addTourDate() {
      setTourDates([...tourDates, { date: new Date().toISOString().split('T')[0], venue: 'New Venue', city: 'City, State', status: 'Announced' }]);
  }

  function removeTourDate(index: number) {
      const newDates = [...tourDates];
      newDates.splice(index, 1);
      setTourDates(newDates);
  }
};
