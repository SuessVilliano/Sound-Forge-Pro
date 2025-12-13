
import React, { useState, useRef } from 'react';
import { CheckCircle2, Bot, ArrowLeft, Upload, Server, ShieldCheck, Globe, Zap, Music2, Plus, Trash2, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { DISTRIBUTION_PARTNERS } from '../constants';
import { DistributionRelease, DistributionTrack } from '../types';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

const SERVICES_LIST = [
    "Spotify", "Apple Music", "iTunes", "Instagram & Facebook", "TikTok & ByteDance", 
    "YouTube Music", "Amazon", "Pandora", "Deezer", "Tidal", "iHeartRadio", 
    "Claro Música", "Saavn", "Boomplay", "Anghami", "NetEase", "Tencent"
];

const GENRES = ["Pop", "Hip Hop", "R&B", "Rock", "Electronic", "Latin", "Country", "Jazz", "Classical", "Folk", "Reggae", "Blues", "Alternative"];
const LANGUAGES = ["English", "Spanish", "French", "German", "Japanese", "Korean", "Portuguese", "Chinese"];

export const MusicDistribution: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'new-release' | 'agent-processing'>('dashboard');
  const user = authService.getCurrentUser();
  
  // Agent State
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [agentProgress, setAgentProgress] = useState(0);

  // Form State
  const [release, setRelease] = useState<DistributionRelease>({
      title: '',
      artistName: user?.displayName || '',
      releaseDate: new Date().toISOString().split('T')[0],
      recordLabel: 'SoundForge Records',
      copyrightYear: new Date().getFullYear().toString(),
      copyrightOwner: user?.displayName || '',
      pLineYear: new Date().getFullYear().toString(),
      pLineOwner: user?.displayName || '',
      language: 'English',
      primaryGenre: 'Pop',
      services: SERVICES_LIST,
      previouslyReleased: false,
      tracks: [{
          id: 't1',
          title: '',
          isInstrumental: false,
          isExplicit: false,
          isRadioEdit: false,
          writerType: 'original',
          songwriters: [],
      }],
      optSocialPack: true,
      optDiscoveryPack: false,
      optStoreMaximizer: true,
      optLeaveLegacy: false,
      optLoudnessNorm: false
  });

  // Helper to handle cover art upload
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setRelease({ ...release, albumCover: file, coverUrl: url });
      }
  };

  // Helper for Track Management
  const addTrack = () => {
      const newTrack: DistributionTrack = {
          id: `t${Date.now()}`,
          title: '',
          isInstrumental: false,
          isExplicit: false,
          isRadioEdit: false,
          writerType: 'original',
          songwriters: []
      };
      setRelease(prev => ({ ...prev, tracks: [...prev.tracks, newTrack] }));
  };

  const removeTrack = (id: string) => {
      if (release.tracks.length > 1) {
          setRelease(prev => ({ ...prev, tracks: prev.tracks.filter(t => t.id !== id) }));
      }
  };

  const updateTrack = (id: string, field: keyof DistributionTrack, value: any) => {
      setRelease(prev => ({
          ...prev,
          tracks: prev.tracks.map(t => t.id === id ? { ...t, [field]: value } : t)
      }));
  };

  const handleSubmit = async () => {
      if (!release.title || !release.artistName) {
          alert("Please fill in Release Title and Artist Name.");
          return;
      }
      if (!release.albumCover) {
          alert("Please upload cover art.");
          return;
      }
      
      setView('agent-processing');
      setAgentLogs([]);
      setAgentProgress(0);

      // Simulate the AI Agent Backend Workflow
      const steps = [
          { msg: "Agent Initialized: Analyzing Release Metadata...", time: 1000 },
          { msg: "Validating Cover Art Specs (3000x3000px)...", time: 1000 },
          { msg: "Connecting to DSP Gateways...", time: 1500 },
          { msg: "Logging in as SoundForge Label Admin...", time: 800 },
          { msg: `Uploading "${release.title}" Assets to S3...`, time: 2000 },
          { msg: "Assigning UPC/EAN Codes...", time: 1000 },
          { msg: "Registering Songwriter Credits...", time: 1200 },
          { msg: "Minting ISRC Codes on Blockchain...", time: 1500 },
          { msg: "Submitting Final Release Package...", time: 1000 },
          { msg: "Success: Release Queued for Global Delivery.", time: 500 }
      ];

      for (let i = 0; i < steps.length; i++) {
          await new Promise(r => setTimeout(r, steps[i].time));
          setAgentLogs(prev => [...prev, steps[i].msg]);
          setAgentProgress(((i + 1) / steps.length) * 100);
      }

      await dataService.submitRelease(user?.uid || 'guest', release);
      await new Promise(r => setTimeout(r, 1000));
      alert("Success! Your release has been submitted to the stores.");
      setView('dashboard');
  };

  // ----------------------------------------------------------------------
  // AGENT PROCESSING VIEW
  // ----------------------------------------------------------------------
  if (view === 'agent-processing') {
      return (
          <div className="flex flex-col items-center justify-center min-h-[600px] max-w-3xl mx-auto space-y-8 animate-in fade-in">
              <div className="relative">
                  <div className="w-32 h-32 bg-slate-900 rounded-full border-4 border-cyan-500/30 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(6,182,212,0.2)]">
                      <Bot className="w-16 h-16 text-cyan-400 animate-pulse" />
                  </div>
                  <div className="absolute inset-0 border border-slate-800 rounded-full animate-[spin_4s_linear_infinite]"></div>
                  <div className="absolute -inset-4 border border-dashed border-slate-800 rounded-full animate-[spin_10s_linear_infinite_reverse]"></div>
              </div>
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">SoundForge AI Agent Working</h2>
                  <p className="text-slate-400">Automating submission to 150+ stores. Sit back and relax.</p>
              </div>
              <div className="w-full bg-slate-950 rounded-xl border border-slate-800 p-6 font-mono text-xs md:text-sm shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-purple-500" style={{ width: `${agentProgress}%`, transition: 'width 0.5s ease' }}></div>
                  <div className="h-64 overflow-y-auto custom-scrollbar space-y-2">
                      {agentLogs.map((log, i) => (
                          <div key={i} className="flex gap-3 text-green-400/90 animate-in slide-in-from-left-2 fade-in">
                              <span className="text-slate-600 select-none">[{new Date().toLocaleTimeString()}]</span>
                              <span className="flex-1">{log}</span>
                              {i === agentLogs.length - 1 && <span className="w-2 h-4 bg-green-500 animate-pulse"></span>}
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      );
  }

  // ----------------------------------------------------------------------
  // NEW RELEASE FORM
  // ----------------------------------------------------------------------
  if (view === 'new-release') {
      return (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                  <button onClick={() => setView('dashboard')} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                      <ArrowLeft className="w-6 h-6 text-slate-400" />
                  </button>
                  <div>
                      <h1 className="text-2xl font-bold text-white">Global Distribution</h1>
                      <p className="text-slate-400 text-sm">Create a new release for Spotify, Apple Music, and 150+ stores.</p>
                  </div>
              </div>

              {/* 1. Release Info */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="bg-slate-950 px-6 py-4 border-b border-slate-800">
                      <h3 className="font-bold text-white flex items-center gap-2"><Globe className="w-4 h-4 text-cyan-500"/> Release Details</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Cover Art */}
                      <div className="lg:col-span-1">
                          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Artwork</label>
                          <div className="relative aspect-square bg-slate-800 rounded-xl border-2 border-dashed border-slate-700 hover:border-cyan-500 transition-colors flex flex-col items-center justify-center cursor-pointer group overflow-hidden">
                              {release.coverUrl ? (
                                  <img src={release.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                              ) : (
                                  <>
                                      <ImageIcon className="w-12 h-12 text-slate-600 mb-2 group-hover:text-cyan-500 transition-colors" />
                                      <span className="text-xs text-slate-500 font-bold">Upload Cover</span>
                                      <span className="text-[10px] text-slate-600 mt-1">3000 x 3000px (JPG/PNG)</span>
                                  </>
                              )}
                              <input type="file" accept="image/*" onChange={handleCoverUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                          </div>
                      </div>

                      {/* Info Fields */}
                      <div className="lg:col-span-2 space-y-6">
                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Release Title</label>
                              <input 
                                type="text" 
                                placeholder="Album or Single Title"
                                value={release.title}
                                onChange={e => setRelease({...release, title: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none font-bold text-lg"
                              />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 mb-1">Artist Name</label>
                                  <input 
                                    type="text" 
                                    value={release.artistName}
                                    onChange={e => setRelease({...release, artistName: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 mb-1">Release Date</label>
                                  <input 
                                    type="date" 
                                    value={release.releaseDate}
                                    onChange={e => setRelease({...release, releaseDate: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                  />
                              </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 mb-1">Primary Genre</label>
                                  <select 
                                    value={release.primaryGenre}
                                    onChange={e => setRelease({...release, primaryGenre: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                  >
                                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-400 mb-1">Language</label>
                                  <select 
                                    value={release.language}
                                    onChange={e => setRelease({...release, language: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                  >
                                      {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                                  </select>
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs font-bold text-slate-400 mb-1">Record Label</label>
                              <input 
                                type="text" 
                                value={release.recordLabel}
                                onChange={e => setRelease({...release, recordLabel: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                              />
                          </div>
                      </div>
                  </div>
              </div>

              {/* 2. Copyright & IDs */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="bg-slate-950 px-6 py-4 border-b border-slate-800">
                      <h3 className="font-bold text-white flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-purple-500"/> Copyright & IDs</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                          <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-1">
                                  <label className="block text-xs font-bold text-slate-400 mb-1">© Year</label>
                                  <input 
                                    type="text" 
                                    value={release.copyrightYear}
                                    onChange={e => setRelease({...release, copyrightYear: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                  />
                              </div>
                              <div className="col-span-2">
                                  <label className="block text-xs font-bold text-slate-400 mb-1">© Copyright Owner</label>
                                  <input 
                                    type="text" 
                                    value={release.copyrightOwner}
                                    onChange={e => setRelease({...release, copyrightOwner: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                  />
                              </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-1">
                                  <label className="block text-xs font-bold text-slate-400 mb-1">℗ Year</label>
                                  <input 
                                    type="text" 
                                    value={release.pLineYear}
                                    onChange={e => setRelease({...release, pLineYear: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                  />
                              </div>
                              <div className="col-span-2">
                                  <label className="block text-xs font-bold text-slate-400 mb-1">℗ Sound Recording Owner</label>
                                  <input 
                                    type="text" 
                                    value={release.pLineOwner}
                                    onChange={e => setRelease({...release, pLineOwner: e.target.value})}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                                  />
                              </div>
                          </div>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-1">UPC / EAN Code (Optional)</label>
                          <input 
                            type="text" 
                            placeholder="Leave blank to auto-generate"
                            value={release.upc || ''}
                            onChange={e => setRelease({...release, upc: e.target.value})}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none"
                          />
                          <p className="text-[10px] text-slate-500 mt-2">SoundForge will assign a UPC automatically if you don't have one.</p>
                      </div>
                  </div>
              </div>

              {/* 3. Tracklist */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                  <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="font-bold text-white flex items-center gap-2"><Music2 className="w-4 h-4 text-green-500"/> Tracklist</h3>
                      <button onClick={addTrack} className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                          <Plus className="w-3 h-3" /> Add Track
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      {release.tracks.map((track, index) => (
                          <div key={track.id} className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                              <div className="flex justify-between items-start mb-4">
                                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Track {index + 1}</span>
                                  {release.tracks.length > 1 && (
                                      <button onClick={() => removeTrack(track.id)} className="text-slate-500 hover:text-red-500 transition-colors">
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  )}
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-400 mb-1">Track Title</label>
                                      <input 
                                        type="text" 
                                        value={track.title}
                                        onChange={e => updateTrack(track.id, 'title', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                                      />
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-400 mb-1">Version (Optional)</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. Radio Edit, Remix"
                                        value={track.version || ''}
                                        onChange={e => updateTrack(track.id, 'version', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                                      />
                                  </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-400 mb-1">Audio File (WAV/FLAC)</label>
                                      <div className="flex gap-2">
                                          <button className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-3 py-2 rounded flex items-center gap-2 transition-colors">
                                              <Upload className="w-3 h-3" /> Choose File
                                          </button>
                                          <span className="text-xs text-slate-500 self-center">No file chosen</span>
                                      </div>
                                  </div>
                                  <div>
                                      <label className="block text-xs font-bold text-slate-400 mb-1">ISRC (Optional)</label>
                                      <input 
                                        type="text" 
                                        placeholder="Leave blank to auto-generate"
                                        value={track.isrc || ''}
                                        onChange={e => updateTrack(track.id, 'isrc', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                                      />
                                  </div>
                              </div>

                              <div className="mb-4">
                                  <label className="block text-xs font-bold text-slate-400 mb-1">Songwriters (Required)</label>
                                  <input 
                                    type="text" 
                                    placeholder="Full Legal Names, separated by comma"
                                    value={track.songwriters.join(', ')}
                                    onChange={e => updateTrack(track.id, 'songwriters', e.target.value.split(', '))}
                                    className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                                  />
                              </div>

                              <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-700">
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={track.isExplicit} 
                                        onChange={e => updateTrack(track.id, 'isExplicit', e.target.checked)}
                                        className="rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                                      />
                                      <span className="text-sm text-slate-300">Explicit Content</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={track.isInstrumental} 
                                        onChange={e => updateTrack(track.id, 'isInstrumental', e.target.checked)}
                                        className="rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                                      />
                                      <span className="text-sm text-slate-300">Instrumental</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer">
                                      <input 
                                        type="checkbox" 
                                        checked={track.isRadioEdit} 
                                        onChange={e => updateTrack(track.id, 'isRadioEdit', e.target.checked)}
                                        className="rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
                                      />
                                      <span className="text-sm text-slate-300">Radio Edit</span>
                                  </label>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              {/* 4. Store Selection */}
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Server className="w-4 h-4 text-cyan-500"/> Stores & Services</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {SERVICES_LIST.map(store => (
                          <div key={store} className="flex items-center gap-2">
                              <input type="checkbox" checked readOnly className="rounded border-slate-700 bg-slate-800 text-cyan-500" />
                              <span className="text-sm text-slate-300">{store}</span>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Submit Action */}
              <div className="flex justify-end pt-4 border-t border-slate-800">
                  <button 
                    onClick={handleSubmit}
                    className="bg-green-500 hover:bg-green-400 text-slate-950 px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:shadow-green-500/20 transition-all flex items-center gap-2"
                  >
                      <CheckCircle2 className="w-5 h-5" /> Submit to Stores
                  </button>
              </div>
          </div>
      );
  }

  // ----------------------------------------------------------------------
  // DASHBOARD VIEW
  // ----------------------------------------------------------------------
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-10 flex justify-between items-center relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-white mb-4 border border-white/20">
                  <Zap className="w-3 h-3 text-yellow-400" /> AI-Powered Label Services
              </div>
              <h2 className="text-3xl font-bold text-white mb-3">SoundForge Global Distribution</h2>
              <p className="text-indigo-100 text-base mb-8 max-w-xl leading-relaxed">
                  We are your label now. Our AI agents automate the submission process to Spotify, Apple Music, and 150+ stores. Keep 100% of your royalties.
              </p>
              <div className="flex gap-4">
                  <button 
                    onClick={() => setView('new-release')}
                    className="bg-white text-indigo-950 px-8 py-3 rounded-full font-bold shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2 hover:scale-105"
                  >
                      <Upload className="w-4 h-4" /> Distribute New Release
                  </button>
                  <button className="px-6 py-3 rounded-full font-bold text-white border border-white/30 hover:bg-white/10 transition-colors">
                      View My Catalog
                  </button>
              </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
          <Globe className="absolute -right-10 -bottom-10 w-96 h-96 text-indigo-500/30 animate-pulse-slow" />
      </div>

      {/* Legacy Partners */}
      <div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">External Partners (Legacy)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 opacity-70 hover:opacity-100 transition-opacity">
             {DISTRIBUTION_PARTNERS.map((partner, i) => (
                 <div key={i} className="bg-slate-900 rounded-lg border border-slate-800 p-4 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                         <Music2 className="w-4 h-4 text-slate-500" />
                     </div>
                     <div>
                         <h4 className="font-bold text-white text-sm">{partner.name}</h4>
                         <span className="text-[10px] text-slate-500 block">External Link</span>
                     </div>
                 </div>
             ))}
          </div>
      </div>
    </div>
  );
};
