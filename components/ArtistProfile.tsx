
import React, { useState, useRef, useEffect } from 'react';
import { 
    Edit2, Camera, Share2, MapPin, Globe, Save, X, Link as LinkIcon, 
    Music, Users, Shield, ShoppingBag, Play, Mail, MessageCircle, 
    CheckCircle2, Image as ImageIcon, Send, MoreHorizontal, Calendar, 
    Headphones, TrendingUp, Video, Mic2, Star, DollarSign, ArrowLeft,
    Zap, Plus, Trash2, CalendarCheck, RefreshCw, LogOut, Radio
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
  isPublic?: boolean; // If true, view as another user (no edit rights)
  onBack?: () => void;
}

// Mock Data for EPK (Visuals only)
const MOCK_PHOTOS = [
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1493225255756-d9584f8606e9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
];

const MOCK_VIDEOS = [
    { title: 'Live at Coachella', thumb: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80', duration: '4:20' },
    { title: 'Official Music Video', thumb: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?auto=format&fit=crop&w=800&q=80', duration: '3:45' }
];

export const ArtistProfile: React.FC<ArtistProfileProps> = ({ user, onNavigate, isPublic = false, onBack }) => {
  const [activeTab, setActiveTab] = useState<'epk' | 'music' | 'voice-ip' | 'store'>('epk');
  const [isEditing, setIsEditing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.photoURL || null);
  const [banner, setBanner] = useState<string | null>('https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1600&q=80');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'avatar' | 'banner' | null>(null);
  const { playTrack } = usePlayer();
  
  // Profile Data State
  const [profile, setProfile] = useState({
    stageName: user?.displayName || 'New Artist',
    bio: user?.bio || 'Electronic producer and vocalist blurring the lines between analog warmth and digital precision.',
    genre: 'Indie Pop / Electronic',
    location: user?.location || 'Los Angeles, CA',
    managementEmail: 'mgmt@soundforge.club',
  });

  // Socials State
  const [socials, setSocials] = useState({
      instagram: user?.socialLinks?.instagram || '',
      twitter: user?.socialLinks?.twitter || '',
      youtube: user?.socialLinks?.youtube || '',
      website: user?.socialLinks?.website || '',
      spotify: user?.socialLinks?.spotify || '',
      appleMusic: user?.socialLinks?.appleMusic || '',
      soundcloud: user?.socialLinks?.soundcloud || ''
  });

  // Tour Dates State
  const [tourDates, setTourDates] = useState<TourDate[]>(user?.tourDates || []);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [calendarConnected, setCalendarConnected] = useState(false);

  const [tracks, setTracks] = useState<Track[]>([]);

  // Chat State
  const [messages, setMessages] = useState([
      { id: 1, sender: 'A&R Rep (Sony)', text: "Hey! Loving the new demo. Are you open to sync opportunities?", time: "2h ago", isMe: false },
      { id: 2, sender: 'You', text: "Absolutely, thanks for reaching out. Let's connect.", time: "1h ago", isMe: true }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Update profile state when user prop changes
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
      }
  }, [user]);

  // Load Tracks
  useEffect(() => {
      if (user) {
          const unsubscribe = dataService.subscribeToTracks(user.uid, (data: any[]) => {
              // Convert to Track type
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
            tourDates: tourDates
        });
        setIsEditing(false);
    } catch (e) {
        console.error("Save failed", e);
        alert("Failed to save changes");
    }
  };

  const handleShare = async () => {
      // Construct a mock shareable URL (since we don't have deep linking routing fully set up yet)
      const shareUrl = `${window.location.origin}?artist_id=${user?.uid}`;
      
      const shareData = {
          title: `${profile.stageName} on SoundForge`,
          text: `Check out ${profile.stageName}'s latest music and profile on SoundForge Pro.`,
          url: shareUrl
      };

      // Use Web Share API if available (Mobile)
      if (navigator.share) {
          try {
              await navigator.share(shareData);
          } catch (err) {
              console.log('Share canceled');
          }
      } else {
          // Fallback to Clipboard (Desktop)
          try {
              await navigator.clipboard.writeText(shareUrl);
              alert(`Profile link copied to clipboard!\n${shareUrl}`);
          } catch (err) {
              console.error('Failed to copy', err);
          }
      }
  };

  const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
      if (!chatInput.trim()) return;
      setMessages([...messages, { id: Date.now(), sender: 'You', text: chatInput, time: 'Just now', isMe: true }]);
      setChatInput('');
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

  // --- TOUR DATE HANDLERS ---
  const addTourDate = () => {
      setTourDates([...tourDates, { date: '', venue: '', city: '', status: 'Tickets Available' }]);
  };

  const removeTourDate = (index: number) => {
      const newDates = [...tourDates];
      newDates.splice(index, 1);
      setTourDates(newDates);
  };

  const updateTourDate = (index: number, field: keyof TourDate, value: string) => {
      const newDates = [...tourDates];
      newDates[index] = { ...newDates[index], [field]: value };
      setTourDates(newDates);
  };

  const handleGoogleCalendarSync = async () => {
      setIsSyncingCalendar(true);
      try {
          if (!calendarConnected) {
              const authRes = await googleCalendarService.connectAccount();
              if (authRes.connected) {
                  setCalendarConnected(true);
              } else {
                  throw new Error("Failed to connect Google Calendar");
              }
          }
          const calendarId = "primary"; 
          const syncedDates = await googleCalendarService.getTourDates(calendarId);
          if (syncedDates.length > 0) {
              const existingDatesStr = new Set(tourDates.map(d => d.date));
              const newUniqueDates = syncedDates.filter(d => !existingDatesStr.has(d.date));
              setTourDates([...tourDates, ...newUniqueDates]);
              alert(`Synced ${newUniqueDates.length} new shows from Google Calendar!`);
          } else {
              alert("No new upcoming events found in your calendar.");
          }
      } catch (e) {
          console.error(e);
          alert("Calendar sync failed. Please try again.");
      } finally {
          setIsSyncingCalendar(false);
      }
  };

  return (
    <div className="font-sans pb-20">
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />

      {/* --- HERO SECTION --- */}
      <div className="relative w-full h-80 rounded-b-3xl overflow-hidden group">
          <div className="absolute inset-0 bg-slate-900">
              {banner && <img src={banner} alt="Banner" className="w-full h-full object-cover opacity-80" />}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
          </div>
          
          {isPublic && onBack && (
              <button 
                onClick={onBack}
                className="absolute top-6 left-6 bg-black/50 hover:bg-black/70 text-white px-4 py-2 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-sm font-bold z-20"
              >
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
          )}

          {!isPublic && isEditing && (
              <button 
                onClick={() => handleUploadClick('banner')}
                className="absolute top-6 right-6 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-md transition-all z-20"
              >
                  <Camera className="w-5 h-5" />
              </button>
          )}

          <div className="absolute bottom-0 left-0 w-full px-6 md:px-10 pb-8 flex flex-col md:flex-row items-end gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-slate-950 shadow-2xl overflow-hidden bg-slate-800">
                      <img src={avatar || ''} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  {!isPublic && isEditing && (
                      <button 
                        onClick={() => handleUploadClick('avatar')}
                        className="absolute bottom-2 right-2 bg-cyan-500 text-white p-2 rounded-full border-2 border-slate-950 hover:bg-cyan-400"
                      >
                          <Camera className="w-4 h-4" />
                      </button>
                  )}
                  {user?.isFeatured && (
                      <div className="absolute bottom-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white p-1.5 rounded-full border-2 border-slate-950 shadow-lg" title="Featured Artist">
                          <Star className="w-4 h-4 fill-current" />
                      </div>
                  )}
              </div>

              {/* Info */}
              <div className="flex-1 mb-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-3 mb-1">
                      {isEditing && !isPublic ? (
                          <input 
                            type="text" 
                            value={profile.stageName} 
                            onChange={e => setProfile({...profile, stageName: e.target.value})}
                            className="bg-slate-800/50 border border-slate-600 rounded px-2 py-1 text-2xl font-bold text-white focus:outline-none focus:border-cyan-500"
                          />
                      ) : (
                          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{profile.stageName}</h1>
                      )}
                      
                      {!isEditing && (user?.plan !== 'free' || user?.isFeatured) && (
                          <span className="px-3 py-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                              Pro Artist
                          </span>
                      )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
                      <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> 
                          {isEditing ? <input value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="bg-slate-800/50 border border-slate-600 rounded px-1 text-xs" /> : profile.location}
                      </span>
                      <span className="flex items-center gap-1"><Music className="w-3 h-3" /> {profile.genre}</span>
                      {socials.website && (
                          <a href={socials.website.startsWith('http') ? socials.website : `https://${socials.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400 hover:underline">
                              <LinkIcon className="w-3 h-3" /> {socials.website.replace('https://', '')}
                          </a>
                      )}
                  </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 mb-2">
                  {isPublic ? (
                      <div className="flex gap-2">
                          <button 
                            onClick={() => setShowChat(true)}
                            className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg"
                          >
                              <Mail className="w-4 h-4" /> Book Now
                          </button>
                          <button 
                            onClick={handleShare}
                            className="p-2.5 rounded-full bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-800 transition-colors backdrop-blur-sm"
                            title="Share Profile"
                          >
                              <Share2 className="w-5 h-5" />
                          </button>
                      </div>
                  ) : (
                      isEditing ? (
                          <div className="flex gap-2">
                              <button onClick={() => setIsEditing(false)} className="px-6 py-2.5 rounded-full bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors">Cancel</button>
                              <button onClick={handleSave} className="px-6 py-2.5 rounded-full bg-green-500 text-slate-950 font-bold hover:bg-green-400 transition-colors flex items-center gap-2">
                                  <Save className="w-4 h-4" /> Save
                              </button>
                          </div>
                      ) : (
                          <>
                              <button 
                                onClick={() => setShowChat(true)}
                                className="px-6 py-2.5 rounded-full bg-white text-slate-950 font-bold hover:bg-slate-200 transition-colors flex items-center gap-2 shadow-lg"
                              >
                                  <Mail className="w-4 h-4" /> Messages
                              </button>
                              <button 
                                onClick={() => setIsEditing(true)}
                                className="p-2.5 rounded-full bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-800 transition-colors backdrop-blur-sm"
                              >
                                  <Edit2 className="w-5 h-5" />
                              </button>
                              <button 
                                onClick={handleShare}
                                className="p-2.5 rounded-full bg-slate-800/50 border border-slate-700 text-white hover:bg-slate-800 transition-colors backdrop-blur-sm"
                                title="Share Profile"
                              >
                                  <Share2 className="w-5 h-5" />
                              </button>
                          </>
                      )
                  )}
              </div>
          </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                  { label: "Monthly Listeners", val: "124.5k", icon: Headphones, color: "text-cyan-400" },
                  { label: "Followers", val: "48.2k", icon: Users, color: "text-purple-400" },
                  { label: "Sync Placements", val: "12", icon: CheckCircle2, color: "text-green-400" },
                  { label: "Avg. Engagement", val: "8.4%", icon: TrendingUp, color: "text-yellow-400" }
              ].map((s, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
                      <div>
                          <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.val}</div>
                          <div className="text-xs text-slate-500 uppercase font-bold tracking-wide">{s.label}</div>
                      </div>
                      <s.icon className={`w-6 h-6 ${s.color}`} />
                  </div>
              ))}
          </div>

          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 overflow-x-auto">
              {[
                  { id: 'epk', label: 'EPK & Overview' },
                  { id: 'music', label: 'Discography' },
                  { id: 'voice-ip', label: 'Voice IP' },
                  { id: 'store', label: 'Merch Store' }
              ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-6 py-4 text-sm font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id 
                        ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400' 
                        : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* --- LEFT COLUMN --- */}
              <div className="lg:col-span-2 space-y-10">
                  
                  {activeTab === 'epk' && (
                      <>
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Artist Bio</h3>
                            {isEditing && !isPublic ? (
                                <textarea 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 min-h-[120px]"
                                    value={profile.bio}
                                    onChange={e => setProfile({...profile, bio: e.target.value})}
                                />
                            ) : (
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                                    {profile.bio}
                                </p>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Popular Tracks</h3>
                                <button onClick={() => setActiveTab('music')} className="text-xs text-cyan-600 dark:text-cyan-400 font-bold hover:underline">View All</button>
                            </div>
                            <div className="space-y-2">
                                {tracks.slice(0, 5).map((track, i) => (
                                    <div key={track.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors group">
                                        <span className="text-slate-400 font-mono text-sm w-4 text-center">{i + 1}</span>
                                        <div className="relative w-10 h-10 rounded overflow-hidden cursor-pointer" onClick={() => playTrack(track)}>
                                            <img src={track.image} className="w-full h-full object-cover" alt={track.title} />
                                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                                                <Play className="w-4 h-4 text-white fill-white" />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-slate-900 dark:text-white font-bold text-sm truncate">{track.title}</h4>
                                            <p className="text-xs text-slate-500">{track.plays.toLocaleString()} plays</p>
                                        </div>
                                        <span className="text-xs text-slate-400 font-mono">{track.duration}</span>
                                    </div>
                                ))}
                                {tracks.length === 0 && <p className="text-slate-500 text-sm italic">No tracks uploaded yet.</p>}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Press Photos</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {MOCK_PHOTOS.map((src, i) => (
                                    <div key={i} className="aspect-square rounded-xl overflow-hidden hover:opacity-90 transition-opacity cursor-pointer shadow-sm">
                                        <img src={src} className="w-full h-full object-cover" alt="Press" />
                                    </div>
                                ))}
                            </div>
                        </div>
                      </>
                  )}

                  {activeTab === 'music' && (
                      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm min-h-[400px]">
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Full Discography</h3>
                          {tracks.map(track => (
                              <div key={track.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden cursor-pointer" onClick={() => playTrack(track)}>
                                          <img src={track.image} alt={track.title} className="w-full h-full object-cover" />
                                      </div>
                                      <div>
                                          <h4 className="font-bold text-slate-900 dark:text-white">{track.title}</h4>
                                          <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                              <span>{track.bpm} BPM</span>
                                              <span>• {track.key}</span>
                                              <span>• {new Date(track.createdAt || Date.now()).getFullYear()}</span>
                                          </div>
                                      </div>
                                  </div>
                                  <button onClick={() => playTrack(track)} className="p-2 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white transition-colors">
                                      <Play className="w-5 h-5 fill-current" />
                                  </button>
                              </div>
                          ))}
                          {tracks.length === 0 && <p className="text-center text-slate-500 mt-10">No tracks available.</p>}
                      </div>
                  )}

                  {activeTab === 'voice-ip' && <VoiceNFTManager user={user} />}
                  {activeTab === 'store' && <MerchStore userDisplayName={profile.stageName} />}

              </div>

              {/* --- RIGHT COLUMN --- */}
              <div className="space-y-6">
                  
                  <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                      <h3 className="font-bold text-lg dark:text-white mb-4">Booking & Contact</h3>
                      <div className="space-y-4">
                          <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                  <Mail className="w-4 h-4" />
                              </div>
                              <div>
                                  <div className="text-xs text-slate-500 uppercase font-bold">Management</div>
                                  <a href={`mailto:${profile.managementEmail}`} className="text-sm font-medium text-slate-900 dark:text-white hover:text-cyan-500">{profile.managementEmail}</a>
                              </div>
                          </div>
                          <button 
                            onClick={() => setShowChat(true)}
                            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-lg transition-colors flex items-center justify-center gap-2"
                          >
                              <MessageCircle className="w-4 h-4" /> Send Message
                          </button>
                      </div>
                  </div>

                  {/* Streaming Links */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Listen On</h3>
                      
                      {isEditing && !isPublic ? (
                          <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                  <Music className="w-4 h-4 text-slate-400" />
                                  <input 
                                      value={socials.spotify} 
                                      onChange={(e) => setSocials({...socials, spotify: e.target.value})}
                                      placeholder="Spotify URL"
                                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                                  />
                              </div>
                              <div className="flex items-center gap-2">
                                  <Radio className="w-4 h-4 text-slate-400" />
                                  <input 
                                      value={socials.appleMusic} 
                                      onChange={(e) => setSocials({...socials, appleMusic: e.target.value})}
                                      placeholder="Apple Music URL"
                                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                                  />
                              </div>
                              <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-slate-400" />
                                  <input 
                                      value={socials.soundcloud} 
                                      onChange={(e) => setSocials({...socials, soundcloud: e.target.value})}
                                      placeholder="SoundCloud URL"
                                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                                  />
                              </div>
                          </div>
                      ) : (
                          <div className="space-y-2">
                              {socials.spotify && (
                                  <a href={socials.spotify} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-green-500 hover:text-white transition-colors group">
                                      <Music className="w-5 h-5 text-green-500 group-hover:text-white" />
                                      <span className="text-sm font-bold">Spotify</span>
                                  </a>
                              )}
                              {socials.appleMusic && (
                                  <a href={socials.appleMusic} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-pink-500 hover:text-white transition-colors group">
                                      <Music className="w-5 h-5 text-pink-500 group-hover:text-white" />
                                      <span className="text-sm font-bold">Apple Music</span>
                                  </a>
                              )}
                              {socials.soundcloud && (
                                  <a href={socials.soundcloud} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-orange-500 hover:text-white transition-colors group">
                                      <Globe className="w-5 h-5 text-orange-500 group-hover:text-white" />
                                      <span className="text-sm font-bold">SoundCloud</span>
                                  </a>
                              )}
                              {!socials.spotify && !socials.appleMusic && !socials.soundcloud && (
                                  <p className="text-xs text-slate-500 italic">No streaming links available.</p>
                              )}
                          </div>
                      )}
                  </div>

                  {/* Social Links */}
                  <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <h3 className="font-bold text-slate-900 dark:text-white mb-4">Connect</h3>
                      
                      {isEditing && !isPublic ? (
                          <div className="space-y-3">
                              <div className="flex items-center gap-2">
                                  <ImageIcon className="w-4 h-4 text-slate-400" />
                                  <input 
                                      value={socials.instagram} 
                                      onChange={(e) => setSocials({...socials, instagram: e.target.value})}
                                      placeholder="Instagram URL"
                                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                                  />
                              </div>
                              <div className="flex items-center gap-2">
                                  <Video className="w-4 h-4 text-slate-400" />
                                  <input 
                                      value={socials.youtube} 
                                      onChange={(e) => setSocials({...socials, youtube: e.target.value})}
                                      placeholder="YouTube URL"
                                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                                  />
                              </div>
                              <div className="flex items-center gap-2">
                                  <Send className="w-4 h-4 text-slate-400" />
                                  <input 
                                      value={socials.twitter} 
                                      onChange={(e) => setSocials({...socials, twitter: e.target.value})}
                                      placeholder="Twitter/X URL"
                                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                                  />
                              </div>
                              <div className="flex items-center gap-2">
                                  <Globe className="w-4 h-4 text-slate-400" />
                                  <input 
                                      value={socials.website} 
                                      onChange={(e) => setSocials({...socials, website: e.target.value})}
                                      placeholder="Website URL"
                                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-cyan-500"
                                  />
                              </div>
                          </div>
                      ) : (
                          <div className="grid grid-cols-4 gap-2">
                              {socials.instagram && (
                                  <a href={socials.instagram} target="_blank" className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 hover:text-cyan-500 hover:bg-cyan-50 dark:hover:bg-slate-700 transition-colors">
                                      <ImageIcon className="w-5 h-5" />
                                  </a>
                              )}
                              {socials.youtube && (
                                  <a href={socials.youtube} target="_blank" className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors">
                                      <Video className="w-5 h-5" />
                                  </a>
                              )}
                              {socials.twitter && (
                                  <a href={socials.twitter} target="_blank" className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors">
                                      <Send className="w-5 h-5" />
                                  </a>
                              )}
                              {socials.website && (
                                  <a href={socials.website} target="_blank" className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center text-slate-500 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-slate-700 transition-colors">
                                      <Globe className="w-5 h-5" />
                                  </a>
                              )}
                              {!socials.instagram && !socials.youtube && !socials.twitter && !socials.website && (
                                  <p className="col-span-4 text-xs text-slate-500 italic text-center">No social links added.</p>
                              )}
                          </div>
                      )}
                  </div>

              </div>
          </div>
      </div>

      {/* CHAT OVERLAY */}
      {showChat && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center pointer-events-none">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm pointer-events-auto" onClick={() => setShowChat(false)}></div>
              <div className="bg-white dark:bg-slate-900 w-full sm:w-[400px] h-[80vh] sm:h-[600px] sm:rounded-2xl shadow-2xl flex flex-col pointer-events-auto animate-in slide-in-from-bottom-10 duration-300 relative">
                  
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 sm:rounded-t-2xl">
                      <div className="flex items-center gap-3">
                          <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                                  <img src={avatar || ''} className="w-full h-full object-cover" />
                              </div>
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full"></div>
                          </div>
                          <div>
                              <h4 className="font-bold text-sm text-slate-900 dark:text-white">{profile.stageName}</h4>
                              <p className="text-xs text-slate-500">Typically replies in 1hr</p>
                          </div>
                      </div>
                      <button onClick={() => setShowChat(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                          <X className="w-5 h-5 text-slate-500" />
                      </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-100 dark:bg-slate-950/50">
                      {messages.map(msg => (
                          <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${
                                  msg.isMe 
                                  ? 'bg-cyan-500 text-white rounded-tr-sm' 
                                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm border border-slate-200 dark:border-slate-700'
                              }`}>
                                  {!msg.isMe && <p className="text-[10px] font-bold opacity-70 mb-1">{msg.sender}</p>}
                                  <p>{msg.text}</p>
                                  <p className="text-[10px] opacity-50 mt-1 text-right">{msg.time}</p>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Input */}
                  <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sm:rounded-b-2xl">
                      <div className="flex gap-2">
                          <input 
                              type="text" 
                              value={chatInput} 
                              onChange={e => setChatInput(e.target.value)}
                              placeholder="Type a message..." 
                              className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 dark:text-white"
                          />
                          <button type="submit" className="p-2.5 bg-cyan-500 hover:bg-cyan-400 text-white rounded-full transition-colors shadow-lg">
                              <Send className="w-4 h-4" />
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
