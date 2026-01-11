

import React, { useState, useRef, useEffect } from 'react';
import { 
    Edit2, Camera, Share2, MapPin, Globe, Save, X, Link as LinkIcon, 
    Music, Users, Shield, ShoppingBag, Play, Mail, MessageCircle, 
    CheckCircle2, Image as ImageIcon, Send, MoreHorizontal, Calendar, 
    Headphones, TrendingUp, Video, Mic2, Star, DollarSign, ArrowLeft,
    Zap, Plus, Trash2, CalendarCheck, RefreshCw, LogOut, Radio, Palette, Layout, Type as TypeIcon, Eye, Check, Sparkles,
    Moon, Sun, ArrowRight, ChevronRight
} from 'lucide-react';
/* Added Track to type imports */
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
        // User update includes bio which is now defined in types.ts
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
                        className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-