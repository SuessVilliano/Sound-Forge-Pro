
import React, { useState, useRef } from 'react';
/* Added Users to the lucide-react imports to fix the error on line 422 */
import { CheckCircle2, Bot, ArrowLeft, Upload, Server, ShieldCheck, Globe, Zap, Music2, Plus, Trash2, Image as ImageIcon, AlertCircle, Database, Lock, Disc, Layers, Copy, Check, Calendar, HardDrive, FileAudio, X, Sliders, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { DISTRIBUTION_PARTNERS } from '../constants';
import { DistributionRelease, DistributionTrack, Contributor } from '../types';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

const SERVICES_LIST = [
    "Spotify", "Apple Music", "iTunes", "Instagram & Facebook", "TikTok & ByteDance", 
    "YouTube Music", "Amazon", "Pandora", "Deezer", "Tidal", "iHeartRadio", 
    "Claro Música", "Saavn", "Boomplay", "Anghami", "NetEase", "Tencent"
];

const GENRES = ["Pop", "Hip Hop", "R&B", "Rock", "Electronic", "Latin", "Country", "Jazz", "Classical", "Folk", "Reggae", "Blues", "Alternative"];
const ROLES = ['Songwriter', 'Producer', 'Featured Artist', 'Remixer', 'Mixer', 'Mastering Engineer', 'Composer'] as const;

export const MusicDistribution: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'setup' | 'new-release' | 'agent-processing'>('dashboard');
  const user = authService.getCurrentUser();
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [agentProgress, setAgentProgress] = useState(0);
  const [releaseType, setReleaseType] = useState<'Single' | 'Album'>('Single');
  const [trackCount, setTrackCount] = useState(1);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);

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
          originalArtist: '',
          contributors: [{ id: `c1_${i}`, name: user?.displayName || 'Artist', role: 'Songwriter' }]
      }));
      setRelease(prev => ({ ...prev, tracks: initialTracks }));
      if (initialTracks.length > 0) setExpandedTrackId(initialTracks[0].id);
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

  const addContributor = (trackId: string) => {
      const newContrib: Contributor = { id: `cont_${Date.now()}`, name: '', role: 'Producer' };
      setRelease(prev => ({
          ...prev,
          tracks: prev.tracks.map(t => t.id === trackId ? { ...t, contributors: [...(t.contributors || []), newContrib] } : t)
      }));
  };

  const removeContributor = (trackId: string, contribId: string) => {
      setRelease(prev => ({
          ...prev,
          tracks: prev.tracks.map(t => t.id === trackId ? { ...t, contributors: (t.contributors || []).filter(c => c.id !== contribId) } : t)
      }));
  };

  const updateContributor = (trackId: string, contribId: string, field: keyof Contributor, value: string) => {
      setRelease(prev => ({
          ...prev,
          tracks: prev.tracks.map(t => {
              if (t.id === trackId) {
                  return { ...t, contributors: (t.contributors || []).map(c => c.id === contribId ? { ...c, [field]: value } : c) };
              }
              return t;
          })
      }));
  };

  const handleTrackFileUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          updateTrack(id, 'audioFile', file);
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
          <div className="max-w-6xl mx-auto space-y-10 py-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex justify-between items-center">
                  <button onClick={() => setView('setup')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Change Format
                  </button>
                  <h1 className="text-xl font-black text-white uppercase tracking-widest italic">Release Metadata Terminal</h1>
                  <div className="w-20"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Cover & Core Release Data */}
                  <div className="lg:col-span-4 space-y-6">
                      <div 
                        onClick={() => coverInputRef.current?.click()}
                        className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500 transition-all overflow-hidden relative group shadow-inner"
                      >
                          {release.coverUrl ? (
                              <>
                                <img src={release.coverUrl} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <span className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-full">Change Artwork</span>
                                </div>
                              </>
                          ) : (
                              <>
                                <ImageIcon className="w-12 h-12 text-slate-800 mb-2 group-hover:text-cyan-500 transition-colors" />
                                <p className="text-slate-600 text-[10px] font-black uppercase px-12 tracking-widest">Select High-Res Master Artwork</p>
                                <p className="text-[8px] text-slate-700 mt-2 font-mono">3000x3000px JPG/PNG</p>
                              </>
                          )}
                          <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverUpload} />
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 space-y-6 shadow-xl">
                          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3">Project Global Data</h3>
                          <div>
                              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Release Title</label>
                              <input 
                                value={release.title}
                                onChange={e => setRelease({...release, title: e.target.value})}
                                placeholder="e.g. Genesis Protocol"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-all" 
                              />
                          </div>
                          <div>
                              <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Main Label</label>
                              <input 
                                value={release.recordLabel}
                                onChange={e => setRelease({...release, recordLabel: e.target.value})}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-all font-mono" 
                              />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Genre</label>
                                  <select 
                                    value={release.primaryGenre}
                                    onChange={e => setRelease({...release, primaryGenre: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-cyan-500 outline-none"
                                  >
                                      {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Release Date</label>
                                  <input 
                                    type="date"
                                    value={release.releaseDate}
                                    onChange={e => setRelease({...release, releaseDate: e.target.value})}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-cyan-500 outline-none" 
                                  />
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Right Column: Track Metadata Terminal */}
                  <div className="lg:col-span-8 space-y-6">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                          <h3 className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
                              <Music2 className="w-6 h-6 text-cyan-400" /> Tracks Ledger ({release.tracks.length})
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
                                        originalArtist: '',
                                        contributors: [{ id: `c_${Date.now()}`, name: user?.displayName || '', role: 'Songwriter' }]
                                    };
                                    setRelease({...release, tracks: [...release.tracks, newTrack]});
                                    setExpandedTrackId(newTrack.id);
                                }}
                                className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-slate-700"
                              >
                                  Append Track +
                              </button>
                          )}
                      </div>

                      <div className="space-y-4">
                          {release.tracks.map((track, idx) => {
                              const isExpanded = expandedTrackId === track.id;
                              return (
                                <div key={track.id} className={`bg-slate-900 border rounded-[2rem] overflow-hidden transition-all duration-500 ${isExpanded ? 'border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.1)]' : 'border-slate-800 hover:border-slate-700'}`}>
                                    <div 
                                        className="p-6 flex items-center justify-between cursor-pointer group"
                                        onClick={() => setExpandedTrackId(isExpanded ? null : track.id)}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black italic text-xs ${track.audioFile ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-600'}`}>
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-white text-base uppercase tracking-tight">{track.title || "Untitled Sequence"}</h4>
                                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                                                    {track.audioFile ? track.audioFile.name : "Awaiting Asset injection..."}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {track.isExplicit && <span className="text-[8px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-black">E</span>}
                                            {track.isInstrumental && <span className="text-[8px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-black">INSTR</span>}
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500 group-hover:text-white" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="p-8 bg-slate-950/50 border-t border-slate-800 animate-in slide-in-from-top-4 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                                
                                                {/* Left side: Upload & Basic Info */}
                                                <div className="md:col-span-4 space-y-6">
                                                    <div 
                                                        onClick={() => trackFileRefs.current[idx]?.click()}
                                                        className={`w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all ${track.audioFile ? 'bg-cyan-500/5 border-cyan-500 shadow-inner' : 'bg-slate-950 border-slate-800 hover:border-slate-600'}`}
                                                    >
                                                        {track.audioFile ? (
                                                            <div className="text-cyan-400 flex flex-col items-center gap-2">
                                                                <FileAudio className="w-10 h-10 mb-1" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest truncate max-w-[150px]">{track.audioFile.name}</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Upload className="w-8 h-8 text-slate-800 mb-2" />
                                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Inject WAV Source</span>
                                                            </>
                                                        )}
                                                        <input type="file" ref={el => trackFileRefs.current[idx] = el} className="hidden" accept="audio/wav,audio/mpeg" onChange={(e) => handleTrackFileUpload(track.id, e)} />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Track Title</label>
                                                        <input 
                                                            value={track.title} onChange={e => updateTrack(track.id, 'title', e.target.value)}
                                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none transition-all" 
                                                        />
                                                    </div>
                                                    
                                                    <div className="flex flex-wrap gap-4">
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <input type="checkbox" checked={track.isExplicit} onChange={e => updateTrack(track.id, 'isExplicit', e.target.checked)} className="w-5 h-5 rounded-lg border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500 transition-all" />
                                                            <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest transition-colors">Explicit Content</span>
                                                        </label>
                                                        <label className="flex items-center gap-3 cursor-pointer group">
                                                            <input type="checkbox" checked={track.isInstrumental} onChange={e => updateTrack(track.id, 'isInstrumental', e.target.checked)} className="w-5 h-5 rounded-lg border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500 transition-all" />
                                                            <span className="text-[10px] font-black text-slate-500 group-hover:text-white uppercase tracking-widest transition-colors">Instrumental</span>
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Right side: Contributor Terminal & Industry Codes */}
                                                <div className="md:col-span-8 space-y-8">
                                                    
                                                    {/* Contributors Terminal */}
                                                    <div>
                                                        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-2">
                                                            <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                                <Users className="w-3 h-3" /> Contributor Terminal
                                                            </h5>
                                                            <button onClick={() => addContributor(track.id)} className="text-[10px] font-black uppercase text-cyan-400 hover:text-white flex items-center gap-1.5 transition-colors">
                                                                <Plus className="w-3 h-3" /> Add Credit
                                                            </button>
                                                        </div>
                                                        
                                                        <div className="space-y-3">
                                                            {(track.contributors || []).map(contrib => (
                                                                <div key={contrib.id} className="grid grid-cols-12 gap-3 animate-in fade-in">
                                                                    <div className="col-span-6">
                                                                        <input 
                                                                            value={contrib.name}
                                                                            onChange={(e) => updateContributor(track.id, contrib.id, 'name', e.target.value)}
                                                                            placeholder="Legal Name"
                                                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none font-bold"
                                                                        />
                                                                    </div>
                                                                    <div className="col-span-4">
                                                                        <select 
                                                                            value={contrib.role}
                                                                            onChange={(e) => updateContributor(track.id, contrib.id, 'role', e.target.value as any)}
                                                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-400 focus:border-cyan-500 outline-none font-black uppercase tracking-tighter"
                                                                        >
                                                                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                                                        </select>
                                                                    </div>
                                                                    <div className="col-span-2 flex justify-end">
                                                                        <button onClick={() => removeContributor(track.id, contrib.id)} className="p-2.5 bg-slate-900 border border-slate-800 text-slate-700 hover:text-red-500 rounded-xl transition-all">
                                                                            <Trash2 className="w-4 h-4" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Industry Codes Terminal */}
                                                    <div className="bg-slate-900/50 border border-slate-800 rounded-[1.5rem] p-6 space-y-6">
                                                        <h5 className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                                            <Database className="w-3 h-3" /> Industry Ledger Codes
                                                        </h5>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">ISRC Code (Optional)</label>
                                                                <input 
                                                                    value={track.isrc || ''} onChange={e => updateTrack(track.id, 'isrc', e.target.value)}
                                                                    placeholder="US-ABC-25-00001"
                                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-cyan-500 outline-none font-mono" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Internal Reference</label>
                                                                <input 
                                                                    placeholder="Release ID-001"
                                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-500 outline-none font-mono" disabled
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {release.tracks.length > 1 && (
                                                        <div className="flex justify-end pt-4">
                                                            <button onClick={() => setRelease({...release, tracks: release.tracks.filter(t => t.id !== track.id)})} className="text-[9px] font-black uppercase text-red-500 hover:text-white transition-colors tracking-widest">Destroy Track Sequence</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                              );
                          })}
                      </div>

                      {/* Final Deployment Actions */}
                      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-transparent pointer-events-none"></div>
                          <div className="text-left relative z-10">
                              <h4 className="text-white font-black text-2xl uppercase tracking-tighter italic mb-1">Global Distribution Ready</h4>
                              <p className="text-slate-500 text-sm max-w-sm font-medium">Your assets will be deployed to the Sound Merge Ledger and delivered to 150+ stores simultaneously.</p>
                          </div>
                          <button 
                            onClick={handleSubmit}
                            className="w-full md:w-auto px-12 py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl shadow-cyan-600/30 flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
                          >
                              <ShieldCheck className="w-5 h-5" /> Authorize Deployment
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 rounded-[3rem] p-12 flex flex-col lg:flex-row justify-between items-center relative overflow-hidden border border-slate-800 shadow-2xl">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          <div className="relative z-10 text-center lg:text-left lg:max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-8 animate-pulse">
                  <Zap className="w-3 h-3 text-yellow-400" /> AI-Powered Asset Deployment Active
              </div>
              <h2 className="text-6xl font-black text-white mb-6 tracking-tighter italic leading-[0.9]">Institutional Music Distribution.</h2>
              <p className="text-slate-500 text-xl mb-12 leading-relaxed font-medium">
                  Automate your metadata optimization and secure your identity on the Sound Merge Ledger. We handle the complexity of global delivery while you keep 100% ownership.
              </p>
              <button 
                onClick={() => setView('setup')} 
                className="bg-white text-slate-950 px-12 py-4 rounded-full font-black uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-3 hover:scale-105 transition-all mx-auto lg:mx-0 text-xs"
              >
                  <Upload className="w-4 h-4" /> Initialize Release
              </button>
          </div>
          <div className="mt-12 lg:mt-0 relative">
             <Globe className="w-96 h-96 text-cyan-500/10 animate-pulse-slow shrink-0" />
             <div className="absolute inset-0 flex items-center justify-center">
                 <ShieldCheck className="w-24 h-24 text-cyan-400 opacity-40 shadow-[0_0_80px_rgba(6,182,212,0.2)]" />
             </div>
          </div>
      </div>

      {/* Release History Section */}
      <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Recent Operational Deployments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                  { title: "Neon Sunset", date: "2 days ago", status: "Delivered", color: "text-green-400", type: "Single" },
                  { title: "Dream State EP", date: "1 week ago", status: "In Review", color: "text-yellow-400", type: "Album" },
                  { title: "Midnight City", date: "1 month ago", status: "Delivered", color: "text-green-400", type: "Single" },
                  { title: "Lost in Code", date: "2 months ago", status: "Live", color: "text-cyan-400", type: "Single" }
              ].map((item, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] hover:border-cyan-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-xl">
                      <div className="flex justify-between items-start mb-6">
                          <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl group-hover:bg-cyan-500/10 transition-colors border border-slate-100 dark:border-slate-800">
                              {item.type === 'Single' ? <Disc className="w-6 h-6 text-slate-400 group-hover:text-cyan-400" /> : <Layers className="w-6 h-6 text-slate-400 group-hover:text-purple-400" />}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${item.color} border border-current px-2 py-0.5 rounded`}>{item.status}</span>
                      </div>
                      <h4 className="font-black text-slate-900 dark:text-white text-lg mb-1 group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{item.title}</h4>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{item.date} • {item.type}</p>
                  </div>
              ))}
          </div>
      </div>
    </div>
  );
};
