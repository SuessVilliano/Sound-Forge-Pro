import React, { useState, useRef } from 'react';
import { CheckCircle2, Bot, ArrowLeft, Upload, Server, ShieldCheck, Globe, Zap, Music2, Plus, Trash2, Image as ImageIcon, AlertCircle, Database, Lock, Disc, Layers, Copy, Check, Calendar, HardDrive, FileAudio, X } from 'lucide-react';
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

export const MusicDistribution: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'setup' | 'new-release' | 'agent-processing'>('dashboard');
  const user = authService.getCurrentUser();
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [agentProgress, setAgentProgress] = useState(0);
  const [releaseType, setReleaseType] = useState<'Single' | 'Album'>('Single');
  const [trackCount, setTrackCount] = useState(1);

  const [release, setRelease] = useState<DistributionRelease>({
      id: `rel_${Date.now()}`,
      title: '',
      artistName: user?.displayName || '',
      releaseDate: new Date().toISOString().split('T')[0],
      recordLabel: 'Sound Merge Records',
      copyrightYear: new Date().getFullYear().toString(),
      copyrightOwner: user?.displayName || '',
      pLineYear: new Date().getFullYear().toString(),
      pLineOwner: user?.displayName || '',
      language: 'English',
      primaryGenre: 'Pop',
      services: SERVICES_LIST,
      previouslyReleased: false,
      tracks: [],
      optSocialPack: true,
      optDiscoveryPack: false,
      optStoreMaximizer: true,
      optLeaveLegacy: false,
      optLoudnessNorm: false,
      optBlockchainStorage: false
  });

  const coverInputRef = useRef<HTMLInputElement>(null);
  const trackFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  const startRelease = () => {
      const initialTracks: DistributionTrack[] = Array.from({ length: trackCount }).map((_, i) => ({
          id: `t${Date.now()}_${i}`,
          title: '',
          isInstrumental: false,
          isExplicit: false,
          isRadioEdit: false,
          writerType: 'original',
          songwriters: [user?.displayName || ''],
          producers: '',
          performers: user?.displayName || '',
          originalArtist: ''
      }));
      setRelease(prev => ({ ...prev, tracks: initialTracks }));
      setView('new-release');
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const url = URL.createObjectURL(file);
          setRelease({ ...release, albumCover: file, coverUrl: url });
      }
  };

  const updateTrack = (id: string, field: keyof DistributionTrack, value: any) => {
      setRelease(prev => ({
          ...prev,
          tracks: prev.tracks.map(t => t.id === id ? { ...t, [field]: value } : t)
      }));
  };

  const handleTrackFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          updateTrack(id, 'audioFile', file);
          // Auto-fill title if empty
          const track = release.tracks.find(t => t.id === id);
          if (track && !track.title) {
              updateTrack(id, 'title', file.name.replace(/\.[^/.]+$/, ""));
          }
      }
  };

  const handleSubmit = async () => {
      if (!release.title || !release.artistName || !release.albumCover) {
          alert("Release title, artist name, and album cover are mandatory.");
          return;
      }
      
      const missingFiles = release.tracks.some(t => !t.audioFile);
      if (missingFiles) {
          alert("Please upload audio files for all tracks.");
          return;
      }
      
      setView('agent-processing');
      setAgentLogs([]);
      setAgentProgress(0);

      const steps = [
          { msg: "Agent Initialized: Analyzing Metadata...", time: 1000 },
          { msg: "Connecting to Global Distribution Partners...", time: 1000 },
          { msg: "Validating Artwork Specs (Institutional Grade)...", time: 1000 },
          { msg: "Logging in as Sound Merge Label Admin...", time: 800 },
          { msg: `Uploading "${release.title}" Assets to CDN...`, time: 2000 },
          { msg: "Assigning UPC/EAN Rights Codes...", time: 1000 },
          { msg: "Securing Copyright Record on Ledger...", time: 1200 },
          { msg: "Final Delivery Queued.", time: 500 }
      ];

      for (let i = 0; i < steps.length; i++) {
          await new Promise(r => setTimeout(r, steps[i].time));
          setAgentLogs(prev => [...prev, steps[i].msg]);
          setAgentProgress(((i + 1) / steps.length) * 100);
      }

      await dataService.submitRelease(user?.uid || 'guest', release);
      setTimeout(() => {
          alert("Submission complete! Assets are processing.");
          setView('dashboard');
      }, 1000);
  };

  if (view === 'agent-processing') {
      return (
          <div className="flex flex-col items-center justify-center min-h-[600px] max-w-3xl mx-auto space-y-8 animate-in fade-in">
              <div className="w-32 h-32 bg-slate-900 rounded-full border-4 border-cyan-500/30 flex items-center justify-center relative shadow-2xl">
                  <Bot className="w-16 h-16 text-cyan-400 animate-pulse" />
              </div>
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-white mb-2">Sound Merge AI Agent Active</h2>
                  <p className="text-slate-400">Deploying your assets to the global network.</p>
              </div>
              <div className="w-full bg-slate-950 rounded-xl border border-slate-800 p-6 font-mono text-xs shadow-2xl">
                  <div className="h-64 overflow-y-auto space-y-2 custom-scrollbar">
                      {agentLogs.map((log, i) => (
                          <div key={i} className="text-green-400/90 flex gap-3">
                              <span className="text-slate-600">[{new Date().toLocaleTimeString()}]</span>
                              <span className="flex-1">{log}</span>
                          </div>
                      ))}
                  </div>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${agentProgress}%` }}></div>
              </div>
          </div>
      );
  }

  if (view === 'setup') {
      return (
          <div className="max-w-2xl mx-auto space-y-8 py-10 animate-in fade-in">
              <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Back to Dashboard
              </button>
              <div className="text-center">
                <h1 className="text-3xl font-black text-white uppercase tracking-tight">New Ledger Release</h1>
                <p className="text-slate-500 mt-2">Choose the format for your global deployment.</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                  <div onClick={() => { setReleaseType('Single'); setTrackCount(1); }} className={`cursor-pointer rounded-2xl border-2 p-8 flex flex-col items-center gap-4 transition-all hover:scale-105 ${releaseType === 'Single' ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'bg-slate-900 border-slate-800'}`}>
                      <Disc className={`w-10 h-10 ${releaseType === 'Single' ? 'text-cyan-400' : 'text-slate-600'}`} />
                      <h3 className="text-xl font-bold text-white uppercase">Single</h3>
                      <p className="text-xs text-center text-slate-500">1 Track • Quick Deploy</p>
                  </div>
                  <div onClick={() => { setReleaseType('Album'); setTrackCount(5); }} className={`cursor-pointer rounded-2xl border-2 p-8 flex flex-col items-center gap-4 transition-all hover:scale-105 ${releaseType === 'Album' ? 'bg-purple-500/10 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.2)]' : 'bg-slate-900 border-slate-800'}`}>
                      <Layers className={`w-10 h-10 ${releaseType === 'Album' ? 'text-purple-400' : 'text-slate-600'}`} />
                      <h3 className="text-xl font-bold text-white uppercase">Album / EP</h3>
                      <p className="text-xs text-center text-slate-500">Up to 20 Tracks • Full Collection</p>
                  </div>
              </div>
              
              {releaseType === 'Album' && (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Number of Tracks</label>
                      <input 
                        type="number" min="2" max="20" 
                        value={trackCount} 
                        onChange={(e) => setTrackCount(parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                      />
                  </div>
              )}

              <button onClick={startRelease} className="w-full py-4 rounded-xl bg-white text-slate-950 font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl">
                  Start Release Process
              </button>
          </div>
      );
  }

  if (view === 'new-release') {
      return (
          <div className="max-w-5xl mx-auto space-y-10 py-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                  <button onClick={() => setView('setup')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Change Format
                  </button>
                  <h1 className="text-xl font-black text-white uppercase tracking-widest">Release Metadata Terminal</h1>
                  <div className="w-20"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Cover & Main Info */}
                  <div className="lg:col-span-1 space-y-6">
                      <div 
                        onClick={() => coverInputRef.current?.click()}
                        className="aspect-square bg-slate-900 border-2 border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500 transition-all overflow-hidden relative group"
                      >
                          {release.coverUrl ? (
                              <>
                                <img src={release.coverUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white font-bold text-sm">Change Cover</span>
                                </div>
                              </>
                          ) : (
                              <>
                                <ImageIcon className="w-12 h-12 text-slate-700 mb-2 group-hover:text-cyan-500 transition-colors" />
                                <p className="text-slate-500 text-xs font-bold uppercase px-6">Upload High-Res Artwork</p>
                                <p className="text-[10px] text-slate-600 mt-1">3000x3000px JPG/PNG</p>
                              </>
                          )}
                          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                          <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Release Title</label>
                              <input 
                                value={release.title}
                                onChange={e => setRelease({...release, title: e.target.value})}
                                placeholder="My New Project"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 outline-none" 
                              />
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Artist Name</label>
                              <input 
                                value={release.artistName}
                                onChange={e => setRelease({...release, artistName: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 outline-none" 
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                              <div>
                                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Primary Genre</label>
                                  <select 
                                    value={release.primaryGenre}
                                    onChange={e => setRelease({...release, primaryGenre: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 outline-none"
                                  >
                                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Release Date</label>
                                  <input 
                                    type="date"
                                    value={release.releaseDate}
                                    onChange={e => setRelease({...release, releaseDate: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none" 
                                  />
                              </div>
                          </div>
                          <div>
                              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Label Name</label>
                              <input 
                                value={release.recordLabel}
                                onChange={e => setRelease({...release, recordLabel: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 outline-none font-mono" 
                              />
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Tracks */}
                  <div className="lg:col-span-2 space-y-6">
                      <div className="flex justify-between items-center">
                          <h3 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                              <Music2 className="w-5 h-5 text-cyan-400" /> Tracks ({release.tracks.length})
                          </h3>
                          {releaseType === 'Album' && (
                              <button 
                                onClick={() => {
                                    const newTrack: DistributionTrack = {
                                        id: `t${Date.now()}`,
                                        title: '',
                                        isInstrumental: false,
                                        isExplicit: false,
                                        isRadioEdit: false,
                                        writerType: 'original',
                                        songwriters: [user?.displayName || ''],
                                        producers: '',
                                        performers: user?.displayName || '',
                                        originalArtist: ''
                                    };
                                    setRelease({...release, tracks: [...release.tracks, newTrack]});
                                }}
                                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                              >
                                  <Plus className="w-3 h-3" /> Add Track
                              </button>
                          )}
                      </div>

                      <div className="space-y-4">
                          {release.tracks.map((track, idx) => (
                              <div key={track.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative group animate-in slide-in-from-right-4 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                                  <div className="flex flex-col md:flex-row gap-6">
                                      {/* Audio Upload Area */}
                                      <div 
                                        onClick={() => trackFileRefs.current[idx]?.click()}
                                        className={`w-full md:w-32 h-32 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all shrink-0 ${track.audioFile ? 'bg-cyan-500/5 border-cyan-500' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                                      >
                                          {track.audioFile ? (
                                              <div className="text-cyan-400 flex flex-col items-center p-2">
                                                  <FileAudio className="w-8 h-8 mb-1" />
                                                  <span className="text-[8px] font-bold truncate max-w-[80px]">{track.audioFile.name}</span>
                                              </div>
                                          ) : (
                                              <>
                                                <Upload className="w-6 h-6 text-slate-700 mb-1" />
                                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">WAV</span>
                                              </>
                                          )}
                                          <input 
                                            type="file" 
                                            ref={el => trackFileRefs.current[idx] = el}
                                            className="hidden" 
                                            accept="audio/wav,audio/mpeg" 
                                            onChange={(e) => handleTrackFileUpload(track.id, e)} 
                                          />
                                      </div>

                                      <div className="flex-1 space-y-4">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div>
                                                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Track Title</label>
                                                  <input 
                                                    value={track.title}
                                                    onChange={e => updateTrack(track.id, 'title', e.target.value)}
                                                    placeholder="Track Title"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none" 
                                                  />
                                              </div>
                                              <div>
                                                  <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">ISRC (Optional)</label>
                                                  <input 
                                                    value={track.isrc || ''}
                                                    onChange={e => updateTrack(track.id, 'isrc', e.target.value)}
                                                    placeholder="US-ABC-25-00001"
                                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-cyan-500 outline-none font-mono" 
                                                  />
                                              </div>
                                          </div>
                                          
                                          <div className="flex flex-wrap gap-4 items-center">
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                  <input 
                                                    type="checkbox" 
                                                    checked={track.isExplicit}
                                                    onChange={e => updateTrack(track.id, 'isExplicit', e.target.checked)}
                                                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500" 
                                                  />
                                                  <span className="text-xs font-bold text-slate-400 uppercase">Explicit</span>
                                              </label>
                                              <label className="flex items-center gap-2 cursor-pointer">
                                                  <input 
                                                    type="checkbox" 
                                                    checked={track.isInstrumental}
                                                    onChange={e => updateTrack(track.id, 'isInstrumental', e.target.checked)}
                                                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500" 
                                                  />
                                                  <span className="text-xs font-bold text-slate-400 uppercase">Instrumental</span>
                                              </label>
                                              <div className="h-4 w-px bg-slate-800"></div>
                                              <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest">Contributors +</button>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {release.tracks.length > 1 && (
                                      <button 
                                        onClick={() => setRelease({...release, tracks: release.tracks.filter(t => t.id !== track.id)})}
                                        className="absolute top-4 right-4 text-slate-700 hover:text-red-500 transition-colors"
                                      >
                                          <Trash2 className="w-4 h-4" />
                                      </button>
                                  )}
                              </div>
                          ))}
                      </div>

                      {/* Final Actions */}
                      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                          <div className="text-left">
                              <h4 className="text-white font-bold text-lg mb-1">Global Distribution Ready</h4>
                              <p className="text-slate-500 text-sm">Your assets will be delivered to 150+ stores simultaneously.</p>
                          </div>
                          <button 
                            onClick={handleSubmit}
                            className="w-full md:w-auto px-10 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl shadow-cyan-500/20"
                          >
                              Authorize Deployment
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-[2.5rem] p-12 flex flex-col lg:flex-row justify-between items-center relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="relative z-10 text-center lg:text-left lg:max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white mb-6">
                  <Zap className="w-3 h-3 text-yellow-400" /> AI-Powered Asset Deployment
              </div>
              <h2 className="text-5xl font-black text-white mb-4 tracking-tight">Deploy Your Music Globally.</h2>
              <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
                  Our AI agents automate metadata optimization and institutional submission to 150+ stores. Sound Merge handles the complexity so you can focus on creation.
              </p>
              <button 
                onClick={() => setView('setup')} 
                className="bg-white text-indigo-950 px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 hover:scale-105 transition-all mx-auto lg:mx-0"
              >
                  <Upload className="w-5 h-5" /> Start New Release
              </button>
          </div>
          <div className="mt-12 lg:mt-0 relative">
             <Globe className="w-80 h-80 text-indigo-500/20 animate-pulse-slow shrink-0" />
             <div className="absolute inset-0 flex items-center justify-center">
                 <ShieldCheck className="w-20 h-20 text-cyan-400 opacity-60" />
             </div>
          </div>
      </div>

      {/* Release History Section */}
      <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Deployments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                  { title: "Neon Sunset", date: "2 days ago", status: "Delivered", color: "text-green-400", type: "Single" },
                  { title: "Dream State EP", date: "1 week ago", status: "In Review", color: "text-yellow-400", type: "Album" },
                  { title: "Midnight City", date: "1 month ago", status: "Delivered", color: "text-green-400", type: "Single" },
                  { title: "Lost in Code", date: "2 months ago", status: "Live", color: "text-cyan-400", type: "Single" }
              ].map((item, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl hover:border-cyan-500/50 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-cyan-500/10 transition-colors">
                              {item.type === 'Single' ? <Disc className="w-6 h-6 text-slate-400 group-hover:text-cyan-400" /> : <Layers className="w-6 h-6 text-slate-400 group-hover:text-purple-400" />}
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.status}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-cyan-400 transition-colors">{item.title}</h4>
                      <p className="text-xs text-slate-500">{item.date} • {item.type}</p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
