
import React, { useState, useRef } from 'react';
import { Edit2, Camera, Share2, BarChart, MapPin, Globe, Save, X, Link as LinkIcon, Music, Users, Shield, ShoppingBag } from 'lucide-react';
import { VoiceNFTManager } from './VoiceNFTManager';
import { MerchStore } from './MerchStore';
import { User } from '../types';

interface ArtistProfileProps {
  user: User | null;
  onNavigate?: (view: string) => void;
}

export const ArtistProfile: React.FC<ArtistProfileProps> = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'voice-ip' | 'store'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(user?.photoURL || null);
  const [banner, setBanner] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<'avatar' | 'banner' | null>(null);
  
  const [profile, setProfile] = useState({
    stageName: user?.displayName || 'New Artist',
    bio: 'Artist on SoundForge Pro.',
    genre: 'Pop',
    location: 'Los Angeles, CA',
    website: '',
    customUrl: `soundforge.club/${user?.displayName?.toLowerCase().replace(/\s/g, '') || 'artist'}`,
    instagram: '',
    twitter: '',
  });

  const [stats, setStats] = useState({
      followers: 12450,
      posts: 24,
      events: 3,
      releases: 5
  });

  const handleSave = () => {
    setIsEditing(false);
    // In real app, save to firestore via dataService with the base64 avatar string
  };

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
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
        if (uploadTarget === 'avatar') {
            setAvatar(result);
        } else if (uploadTarget === 'banner') {
            setBanner(result);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input to allow re-selection of same file if needed
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  // Quick Action Handlers
  const handleCreatePost = () => {
      const content = window.prompt("Create a new post for your fans:");
      if (content) {
          alert("Post published successfully!");
          setStats(prev => ({ ...prev, posts: prev.posts + 1 }));
      }
  };

  const handleShareProfile = async () => {
      const shareData = {
          title: profile.stageName,
          text: `Check out ${profile.stageName} on SoundForge Pro!`,
          url: `https://${profile.customUrl}`
      };

      if (navigator.share) {
          try {
              await navigator.share(shareData);
          } catch (err) {
              // User cancelled share
          }
      } else {
          navigator.clipboard.writeText(shareData.url);
          alert("Profile link copied to clipboard!");
      }
  };

  const handleViewAnalytics = () => {
      if (onNavigate) {
          onNavigate('analytics');
      }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handleFileChange} 
      />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Artist Profile</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your public artist profile, Voice IP, and Merch Store</p>
         </div>
         <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                Overview
            </button>
            <button 
                onClick={() => setActiveTab('voice-ip')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'voice-ip' ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <Shield className="w-3 h-3" /> Voice IP
            </button>
            <button 
                onClick={() => setActiveTab('store')}
                className={`px-4 py-2 text-sm font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'store' ? 'bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <ShoppingBag className="w-3 h-3" /> Merch Store
            </button>
         </div>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden shadow-sm transition-colors">
          
          {/* Banner Image */}
          <div className="h-48 w-full bg-slate-200 dark:bg-slate-800 relative group">
              {banner ? (
                  <img src={banner} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <span className="text-sm font-medium">Add a banner image</span>
                  </div>
              )}
              <button 
                onClick={() => handleUploadClick('banner')}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Change Banner"
              >
                  <Camera className="w-4 h-4" />
              </button>
          </div>

          <div className="px-8 pb-8">
              <div className="flex justify-between items-end -mt-12 mb-6">
                  {/* Avatar */}
                  <div className="relative group">
                      <div className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-850 bg-slate-300 dark:bg-slate-700 overflow-hidden">
                          {avatar ? (
                              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                  <Users className="w-8 h-8 text-slate-500" />
                              </div>
                          )}
                      </div>
                      <button 
                        onClick={() => handleUploadClick('avatar')}
                        className="absolute bottom-0 right-0 bg-cyan-500 text-white p-1.5 rounded-full border-2 border-white dark:border-slate-850 hover:bg-cyan-400 transition-colors"
                        title="Change Avatar"
                      >
                          <Camera className="w-3 h-3" />
                      </button>
                  </div>

                  {/* Edit Actions - Only show in Overview */}
                  {activeTab === 'overview' && (
                    isEditing ? (
                        <div className="flex gap-2">
                            <button 
                              onClick={() => setIsEditing(false)}
                              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                            >
                                <X className="w-4 h-4" /> Cancel
                            </button>
                            <button 
                              onClick={handleSave}
                              className="px-4 py-2 rounded-lg bg-green-500 text-white dark:text-slate-950 font-bold text-sm hover:bg-green-400 flex items-center gap-2 shadow-lg shadow-green-500/20"
                            >
                                <Save className="w-4 h-4" /> Save Changes
                            </button>
                        </div>
                    ) : (
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                        >
                            <Edit2 className="w-4 h-4" /> Edit Profile
                        </button>
                    )
                  )}
              </div>

              {activeTab === 'overview' ? (
                  /* Profile Fields */
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
                      {/* Left Col: Main Info */}
                      <div className="lg:col-span-2 space-y-6">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Stage Name</label>
                              {isEditing ? (
                                  <input 
                                    type="text" 
                                    value={profile.stageName} 
                                    onChange={(e) => handleChange('stageName', e.target.value)}
                                    className="w-full text-2xl font-bold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                  />
                              ) : (
                                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.stageName}</h2>
                              )}
                              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm mt-1">
                                  <Users className="w-4 h-4" /> {stats.followers.toLocaleString()} followers
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Bio</label>
                              {isEditing ? (
                                  <textarea 
                                    rows={4}
                                    value={profile.bio} 
                                    onChange={(e) => handleChange('bio', e.target.value)}
                                    className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white text-sm focus:outline-none focus:border-cyan-500"
                                  />
                              ) : (
                                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{profile.bio}</p>
                              )}
                          </div>
                      </div>

                      {/* Right Col: Details */}
                      <div className="space-y-5 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Genre</label>
                              {isEditing ? (
                                  <select 
                                        value={profile.genre}
                                        onChange={(e) => handleChange('genre', e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-900 dark:text-white"
                                  >
                                      <option>Indie Pop</option>
                                      <option>Hip Hop</option>
                                      <option>Electronic</option>
                                      <option>Rock</option>
                                      <option>R&B</option>
                                  </select>
                              ) : (
                                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-medium">
                                      <Music className="w-4 h-4 text-purple-500" /> {profile.genre}
                                  </div>
                              )}
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Location</label>
                              {isEditing ? (
                                  <input 
                                    type="text" 
                                    value={profile.location} 
                                    onChange={(e) => handleChange('location', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-900 dark:text-white"
                                  />
                              ) : (
                                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-medium">
                                      <MapPin className="w-4 h-4 text-red-500" /> {profile.location}
                                  </div>
                              )}
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Website</label>
                              {isEditing ? (
                                  <input 
                                    type="text" 
                                    value={profile.website} 
                                    onChange={(e) => handleChange('website', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-900 dark:text-white"
                                  />
                              ) : (
                                  <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-medium text-sm truncate">
                                      <LinkIcon className="w-4 h-4" /> 
                                      <a href={`https://${profile.website}`} target="_blank" rel="noreferrer" className="hover:underline">{profile.website || 'Not set'}</a>
                                  </div>
                              )}
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">SoundForge URL</label>
                              {isEditing ? (
                                  <input 
                                    type="text" 
                                    value={profile.customUrl} 
                                    onChange={(e) => handleChange('customUrl', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-3 py-2 text-sm text-slate-900 dark:text-white"
                                  />
                              ) : (
                                  <div className="flex items-center gap-2 text-slate-900 dark:text-slate-200 font-medium text-sm truncate">
                                      <Globe className="w-4 h-4 text-green-500" /> {profile.customUrl}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              ) : activeTab === 'voice-ip' ? (
                  // Voice IP Tab
                  <VoiceNFTManager user={user} onNavigateToRegister={() => onNavigate && onNavigate('voice')} />
              ) : (
                  // Merch Store Tab
                  <MerchStore userDisplayName={user?.displayName} />
              )}
          </div>
      </div>

      {/* Stats Overview (Only on Overview) */}
      {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in">
                {[
                    { label: "Followers", val: stats.followers.toLocaleString(), color: "text-cyan-500" },
                    { label: "Posts", val: stats.posts, color: "text-green-500" },
                    { label: "Events", val: stats.events, color: "text-yellow-500" },
                    { label: "Releases", val: stats.releases, color: "text-purple-500" }
                ].map((s, i) => (
                    <div key={i} className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center shadow-sm hover:border-cyan-500/30 transition-colors">
                        <div className={`text-3xl font-bold ${s.color} mb-1`}>{s.val}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm animate-in fade-in">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button 
                        onClick={handleCreatePost}
                        className="flex items-center justify-center gap-2 py-3 border border-slate-300 dark:border-slate-600 rounded-full text-cyan-600 dark:text-cyan-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Camera className="w-4 h-4" /> Create Post
                    </button>
                    <button 
                        onClick={handleShareProfile}
                        className="flex items-center justify-center gap-2 py-3 border border-slate-300 dark:border-slate-600 rounded-full text-green-600 dark:text-green-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <Share2 className="w-4 h-4" /> Share Profile
                    </button>
                    <button 
                        onClick={handleViewAnalytics}
                        className="flex items-center justify-center gap-2 py-3 border border-slate-300 dark:border-slate-600 rounded-full text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                        <BarChart className="w-4 h-4" /> View Analytics
                    </button>
                </div>
            </div>
          </>
      )}
    </div>
  );
};
