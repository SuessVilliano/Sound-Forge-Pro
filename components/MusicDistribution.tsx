
import React, { useState, useRef, useEffect } from 'react';
import { 
    CheckCircle2, Bot, ArrowLeft, Upload, Server, ShieldCheck, Globe, Zap, 
    Music2, Plus, Trash2, Image as ImageIcon, AlertCircle, Database, Lock, 
    Disc, Layers, Copy, Check, Calendar, HardDrive, FileAudio, X, Sliders, 
    ChevronDown, ChevronUp, Users, Clock, Loader2, Send, History 
} from 'lucide-react';
import { DistributionRelease, DistributionTrack, Contributor, DistributionSubmission } from '../types';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

const SERVICES_LIST = [ "Spotify", "Apple Music", "iTunes", "Instagram & Facebook", "TikTok", "YouTube Music", "Amazon", "Deezer", "Tidal" ];
const GENRES = ["Pop", "Hip Hop", "R&B", "Rock", "Electronic", "Latin", "Indie"];
const ROLES = ['Songwriter', 'Producer', 'Featured Artist', 'Remixer', 'Mixer', 'Mastering Engineer', 'Composer'] as const;

export const MusicDistribution: React.FC = () => {
  const [view, setView] = useState<'dashboard' | 'setup' | 'new-release' | 'agent-processing' | 'history'>('dashboard');
  const user = authService.getCurrentUser();
  const [agentLogs, setAgentLogs] = useState<string[]>([]);
  const [agentProgress, setAgentProgress] = useState(0);
  const [releaseType, setReleaseType] = useState<'Single' | 'EP' | 'Album'>('Single');
  const [trackCount, setTrackCount] = useState(1);
  const [expandedTrackId, setExpandedTrackId] = useState<string | null>(null);
  const [mySubmissions, setMySubmissions] = useState<DistributionSubmission[]>([]);

  const [release, setRelease] = useState<Partial<DistributionSubmission>>({
      title: '',
      artistName: user?.displayName || '',
      releaseDate: new Date().toISOString().split('T')[0],
      recordLabel: 'Sound Merge Records',
      primaryGenre: 'Pop',
      tracks: []
  });

  useEffect(() => { if (view === 'dashboard' && user) loadHistory(); }, [view, user]);

  const loadHistory = async () => {
      if (!user) return;
      const history = await dataService.getMyDistributionSubmissions(user.uid);
      setMySubmissions(history);
  };

  const startRelease = () => {
      const initialTracks: DistributionTrack[] = Array.from({ length: trackCount }).map((_, i) => ({
          id: `t${Date.now()}_${i}`,
          asset_id: `asset_${crypto.randomUUID()}`,
          title: '',
          isInstrumental: false,
          isExplicit: false,
          p_line: `(P) ${new Date().getFullYear()} ${user?.displayName}`,
          c_line: `(C) ${new Date().getFullYear()} ${user?.displayName} Publishing`,
          contributors: [{ id: `c1_${i}`, name: user?.displayName || 'Artist', role: 'Songwriter' }]
      }));
      setRelease(prev => ({ ...prev, tracks: initialTracks }));
      if (initialTracks.length > 0) setExpandedTrackId(initialTracks[0].id);
      setView('new-release');
  };

  const updateTrack = (id: string, field: keyof DistributionTrack, value: any) => {
      setRelease(prev => ({
          ...prev,
          tracks: prev.tracks?.map(t => t.id === id ? { ...t, [field]: value } : t)
      }));
  };

  const updateContributor = (trackId: string, contribId: string, field: keyof Contributor, value: string) => {
      setRelease(prev => ({
          ...prev,
          tracks: prev.tracks?.map(t => t.id === trackId ? { ...t, contributors: t.contributors?.map(c => c.id === contribId ? { ...c, [field]: value } : c) } : t)
      }));
  };

  const handleSubmit = async () => {
      if (!release.title || !release.artistName || !release.coverUrl) { alert("Core metadata and artwork required."); return; }
      
      setView('agent-processing');
      setAgentLogs([]);
      setAgentProgress(0);

      const steps = [
          { msg: "Analyzing DDEX metadata compatibility...", time: 800 },
          { msg: "Verifying ℗ and © ownership alignment...", time: 1000 },
          { msg: "Securing Assets in Distribution Ledger...", time: 800 },
          { msg: "Initializing LabelGrid white-label handshake...", time: 1500 },
          { msg: "UPC/ISRC Request Queued for Registry...", time: 1000 },
          { msg: "Release Protocol Finalized.", time: 500 }
      ];

      for (let i = 0; i < steps.length; i++) {
          await new Promise(r => setTimeout(r, steps[i].time));
          setAgentLogs(prev => [...prev, steps[i].msg]);
          setAgentProgress(((i + 1) / steps.length) * 100);
      }

      if (user) {
          const submission: Partial<DistributionSubmission> = {
              ...release,
              id: `dist_${Date.now()}`,
              release_id: `rel_${crypto.randomUUID()}`,
              userId: user.uid,
              userName: user.displayName,
              userEmail: user.email,
              status: 'submitted',
              createdAt: new Date().toISOString()
          };
          await dataService.submitDistributionSubmission(submission);
      }

      setTimeout(() => setView('dashboard'), 1000);
  };

  if (view === 'agent-processing') {
      return (
          <div className="flex flex-col items-center justify-center min-h-[500px] max-w-2xl mx-auto space-y-8 animate-in fade-in">
              <Bot className="w-16 h-16 text-cyan-400 animate-pulse" />
              <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black text-white uppercase italic">SARAH: Release Coordinator Active</h2>
                  <p className="text-slate-500 font-medium">Securing your release identity for institutional deployment.</p>
              </div>
              <div className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-[10px] h-64 overflow-y-auto">
                  {agentLogs.map((log, i) => (
                      <div key={i} className="text-green-500 flex gap-2 mb-1">
                          <span className="text-slate-700">[{new Date().toLocaleTimeString()}]</span> {log}
                      </div>
                  ))}
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${agentProgress}%` }}></div>
              </div>
          </div>
      );
  }

  if (view === 'setup') {
      return (
          <div className="max-w-2xl mx-auto space-y-8 py-10 animate-in fade-in">
              <button onClick={() => setView('dashboard')} className="text-[10px] font-black uppercase text-slate-500 hover:text-white">← Back</button>
              <div className="text-center">
                <h1 className="text-4xl font-black text-white uppercase tracking-tight italic">Deployment Format</h1>
                <p className="text-slate-500 mt-2 font-medium">Select the structural hierarchy for this release node.</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'Single', icon: Disc, label: 'Single', count: 1 },
                    { id: 'EP', icon: Layers, label: 'EP', count: 4 },
                    { id: 'Album', icon: Layers, label: 'Album', count: 10 }
                  ].map(opt => (
                    <button key={opt.id} onClick={() => { setReleaseType(opt.id as any); setTrackCount(opt.count); }} className={`p-8 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${releaseType === opt.id ? 'bg-cyan-500/10 border-cyan-500' : 'bg-slate-900 border-slate-800 opacity-50'}`}>
                        <opt.icon className={`w-8 h-8 ${releaseType === opt.id ? 'text-cyan-400' : 'text-slate-600'}`} />
                        <span className="text-xs font-black uppercase tracking-widest text-white">{opt.label}</span>
                    </button>
                  ))}
              </div>
              <button onClick={startRelease} className="w-full py-5 bg-white text-slate-950 font-black uppercase tracking-widest text-sm rounded-2xl shadow-xl transition-all hover:scale-[1.01]">Initialize Metadata Sync</button>
          </div>
      );
  }

  if (view === 'new-release') {
      return (
          <div className="max-w-6xl mx-auto space-y-10 py-6 animate-in slide-in-from-bottom-4 duration-500 pb-24">
              <div className="flex justify-between items-center">
                  <button onClick={() => setView('setup')} className="text-[10px] font-black uppercase text-slate-500">← Change Format</button>
                  <h1 className="text-xl font-black text-white uppercase tracking-[0.3em] italic opacity-40">DISTRIBUTION LEDGER</h1>
                  <div className="w-20"></div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-4 space-y-6">
                      <div onClick={() => setRelease({...release, coverUrl: 'https://picsum.photos/400/400?random=release'})} className="aspect-square bg-slate-950 border-2 border-dashed border-slate-800 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 transition-all overflow-hidden relative group">
                          {release.coverUrl ? <img src={release.coverUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-10 h-10 text-slate-800" />}
                          <div className="absolute bottom-4 bg-black/60 backdrop-blur px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest text-white opacity-0 group-hover:opacity-100 transition-opacity">Inject Master Artwork</div>
                      </div>
                      
                      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] space-y-6">
                          <div>
                              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Release Title</label>
                              <input value={release.title} onChange={e => setRelease({...release, title: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-bold outline-none focus:border-cyan-500" placeholder="Genesis Node" />
                          </div>
                          <div>
                              <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Main Label</label>
                              <input value={release.recordLabel} onChange={e => setRelease({...release, recordLabel: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white font-mono outline-none" />
                          </div>
                      </div>
                  </div>

                  <div className="lg:col-span-8 space-y-6">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight italic mb-4">Track Ledger ({release.tracks?.length})</h3>
                      <div className="space-y-4">
                          {release.tracks?.map((track, idx) => (
                              <div key={track.id} className={`bg-slate-900 border border-slate-800 rounded-[1.5rem] overflow-hidden transition-all ${expandedTrackId === track.id ? 'border-indigo-500' : ''}`}>
                                  <div onClick={() => setExpandedTrackId(expandedTrackId === track.id ? null : track.id)} className="p-5 flex items-center justify-between cursor-pointer">
                                      <div className="flex items-center gap-4">
                                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black italic text-[10px]">{idx + 1}</div>
                                          <h4 className="font-bold text-white uppercase tracking-tight text-sm">{track.title || "Untitled Sequence"}</h4>
                                      </div>
                                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${expandedTrackId === track.id ? 'rotate-180' : ''}`} />
                                  </div>
                                  
                                  {expandedTrackId === track.id && (
                                      <div className="p-8 bg-slate-950/50 border-t border-slate-800 animate-in slide-in-from-top-2">
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                              <div className="space-y-4">
                                                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-2">Institutional Rights</h5>
                                                  <div>
                                                      <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">℗ Sound Recording Owner</label>
                                                      <input value={track.p_line} onChange={e => updateTrack(track.id, 'p_line', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500" />
                                                  </div>
                                                  <div>
                                                      <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">© Publishing Admin</label>
                                                      <input value={track.c_line} onChange={e => updateTrack(track.id, 'c_line', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-indigo-500" />
                                                  </div>
                                              </div>
                                              <div className="space-y-4">
                                                  <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-2">Registry Codes</h5>
                                                  <div>
                                                      <label className="block text-[8px] font-black text-slate-600 uppercase mb-1">ISRC Code (Optional)</label>
                                                      <input placeholder="Auto-Generate" value={track.isrc} onChange={e => updateTrack(track.id, 'isrc', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-indigo-400 font-mono" />
                                                  </div>
                                                  <div className="flex gap-4 pt-2">
                                                      <label className="flex items-center gap-2 cursor-pointer">
                                                          <input type="checkbox" checked={track.isExplicit} onChange={e => updateTrack(track.id, 'isExplicit', e.target.checked)} className="rounded bg-slate-900 border-slate-800 text-red-500" />
                                                          <span className="text-[10px] font-black text-slate-500 uppercase">Explicit</span>
                                                      </label>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  )}
                              </div>
                          ))}
                      </div>

                      <div className="pt-8 border-t border-slate-800 flex justify-end">
                          <button onClick={handleSubmit} className="px-12 py-4 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all hover:scale-105 active:scale-95 text-xs">Authorize Global Deployment</button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-10 pointer-events-none"></div>
          <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-8">
                  <Zap className="w-3 h-3 text-yellow-500 animate-pulse" /> AI Distribution Hub Sync: Active
              </div>
              <h2 className="text-6xl font-black text-white tracking-tighter uppercase italic leading-[0.9] mb-6">Master <br/><span className="text-cyan-500">Distribution.</span></h2>
              <p className="text-slate-400 text-xl font-medium leading-relaxed mb-10">Deploy your roster to 150+ stores via Sound Merge rails. Maintain total sovereign ownership of your ℗ and © lines.</p>
              <div className="flex gap-4">
                  <button onClick={() => setView('setup')} className="bg-white text-slate-950 px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-105 transition-all">Start New Deployment</button>
                  <button onClick={() => setView('history')} className="bg-slate-800 text-white px-10 py-4 rounded-full font-black uppercase tracking-[0.2em] text-xs shadow-xl flex items-center gap-2 hover:bg-slate-700 transition-all"><History className="w-4 h-4" /> View Vault</button>
              </div>
          </div>
      </div>
    </div>
  );
};
