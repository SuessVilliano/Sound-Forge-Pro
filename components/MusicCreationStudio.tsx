
import React, { useState, useEffect, useRef } from 'react';
import {
    Play, Square, Mic, Settings, Plus, Trash2, Clock, Save, Wand2, Sparkles,
    Loader2, Music, Download, ChevronRight, ChevronDown, Grid, Disc,
    FileAudio, Circle, X, BrainCircuit, Cpu, Database, Zap, CheckCircle2,
    Sliders, Type, History, MessageSquare, RotateCcw, Heart, BookmarkPlus,
    Share, Sparkle, RefreshCw, Shield, MoreVertical, Layers, Scissors, Upload,
    Volume2, Waves, FileOutput, Bot, Brain, AudioLines, Target, TrendingUp,
    Clapperboard, Video, Film, Star, AlertTriangle, UserCircle, Move, Expand,
    Camera, Languages, FastForward, Image as ImageIcon, Coins, Lock
} from 'lucide-react';
import { musicGenService, MusicEngine, ForgeOptions, getAvailableEngines, MUSIC_GEN_CREDIT_COST } from '../services/musicGenService';
import { separateAudioWithKits } from '../services/audioService';
import { klingService, KlingMode, KlingConfig } from '../services/klingService';
import { dataService } from '../services/dataService';
import { creditService } from '../services/creditService';
import { getStudioAgentSuggestions } from '../services/geminiService';
import { CREDIT_COSTS } from '../services/config';
import { User, StemResult, StudioSuggestion, StudioAgent, VideoGenerationJob, Track } from '../types';
import { usePlayer } from '../contexts/PlayerContext';

interface MusicCreationStudioProps {
  user: User;
  onUpgrade: () => void;
}

type StudioTab = 'forge' | 'separator' | 'cinema' | 'history';

// Dynamic engine list based on configuration
const getModelVersions = () => {
    const engines = getAvailableEngines();
    return [
        { label: 'Internal Studio Core', value: 'studio', available: true },
        { label: 'High-Fidelity Neural (Udio)', value: 'udio', available: engines.find(e => e.engine === 'udio')?.available },
        { label: 'Cinematic Score (Mureka)', value: 'mureka', available: engines.find(e => e.engine === 'mureka')?.available },
        { label: 'Rapid Prototype (MusicGPT)', value: 'musicgpt', available: engines.find(e => e.engine === 'musicgpt')?.available },
        { label: 'Vocal Synthesis (Suno)', value: 'suno', available: engines.find(e => e.engine === 'suno')?.available },
        { label: 'Experimental Hybrid (AIMusic)', value: 'aimusic', available: engines.find(e => e.engine === 'aimusic')?.available },
    ];
};

const INITIAL_AGENTS: StudioAgent[] = [
  { id: 'beat', name: 'Rhythm Architect', role: 'beat', avatar: 'https://ui-avatars.com/api/?name=Rhythm+Architect&background=06b6d4&color=fff', status: 'idle' },
  { id: 'melody', name: 'Melody Scout', role: 'melody', avatar: 'https://ui-avatars.com/api/?name=Melody+Scout&background=8b5cf6&color=fff', status: 'idle' },
  { id: 'engineer', name: 'Sound Designer', role: 'engineer', avatar: 'https://ui-avatars.com/api/?name=Sound+Designer&background=10b981&color=fff', status: 'idle' },
];

export const MusicCreationStudio: React.FC<MusicCreationStudioProps> = ({ user, onUpgrade }) => {
  const { playTrack, togglePlayPause } = usePlayer();
  const [activeTab, setActiveTab] = useState<StudioTab>('forge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [forgeHistory, setForgeHistory] = useState<any[]>([]);
  const [operationalMessage, setOperationalMessage] = useState('Marie is initializing...');
  const [activeEngine, setActiveEngine] = useState<MusicEngine>('musicgpt');
  const [duration, setDuration] = useState(60);
  const [styleInput, setStyleInput] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [klingMode, setKlingMode] = useState<KlingMode>('text_to_video');
  const [selectedVideoTrack, setSelectedVideoTrack] = useState<Track | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [activeVideoJob, setActiveVideoJob] = useState<VideoGenerationJob | null>(null);
  const [suggestions, setSuggestions] = useState<StudioSuggestion[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [sepStatus, setSepStatus] = useState('');
  const [extractedStems, setExtractedStems] = useState<StemResult | null>(null);
  const [sepFile, setSepFile] = useState<File | null>(null);
  const sepInputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = dataService.subscribeToTracks(user.uid, (tracks) => {
        setForgeHistory(tracks.map((t: any) => ({
            ...t,
            image: t.image || t.imageUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop'
        })));
    });
    return () => unsub();
  }, [user.uid]);

  const handleForge = async () => {
      if (!styleInput && !lyrics) return;

      // Check credits before proceeding
      const creditCost = CREDIT_COSTS.MUSIC_GENERATION;
      const hasCredits = await creditService.hasEnoughCredits(user.uid, 'MUSIC_GENERATION');

      if (!hasCredits) {
          window.dispatchEvent(new CustomEvent('sf-notification', {
              detail: {
                  title: 'Insufficient Credits',
                  message: `You need ${creditCost} credits to generate music. Upgrade your plan or purchase credits.`,
                  type: 'error'
              }
          }));
          onUpgrade();
          return;
      }

      setIsProcessing(true);
      setOperationalMessage(`Connecting to ${activeEngine.toUpperCase()} Node...`);

      try {
          // Deduct credits
          const creditResult = await creditService.useCredits(user.uid, 'MUSIC_GENERATION', `Music generation: ${styleInput.substring(0, 30)}`);
          if (!creditResult.success) {
              throw new Error(creditResult.error || 'Failed to deduct credits');
          }

          setOperationalMessage(`Neural processing... (${creditCost} credits used)`);

          const result = await musicGenService.generate({
              engine: activeEngine,
              prompt: styleInput,
              lyrics: isInstrumental ? '' : lyrics,
              isInstrumental,
              durationDesired: duration
          });

          const trackData: any = { ...result, userId: user.uid, createdAt: new Date().toISOString() };
          await dataService.saveTrack(user.uid, trackData);
          playTrack(trackData);

          window.dispatchEvent(new CustomEvent('sf-notification', {
              detail: {
                  title: 'Forge Success',
                  message: `Asset created! Remaining credits: ${creditResult.newBalance}`,
                  type: 'success'
              }
          }));
      } catch (e: any) {
          setOperationalMessage(e.message || "Sync failed. Check connection.");
          window.dispatchEvent(new CustomEvent('sf-notification', {
              detail: { title: 'Generation Failed', message: e.message, type: 'error' }
          }));
          await new Promise(r => setTimeout(r, 4000));
      } finally {
          setIsProcessing(false);
      }
  };

  const handleCinemaForge = async () => {
      if (!selectedVideoTrack || !videoPrompt) return;

      // Check credits for video generation
      const creditCost = CREDIT_COSTS.VIDEO_GENERATION;
      const hasCredits = await creditService.hasEnoughCredits(user.uid, 'VIDEO_GENERATION');

      if (!hasCredits) {
          window.dispatchEvent(new CustomEvent('sf-notification', {
              detail: {
                  title: 'Insufficient Credits',
                  message: `You need ${creditCost} credits for video generation. Upgrade your plan or purchase credits.`,
                  type: 'error'
              }
          }));
          onUpgrade();
          return;
      }

      setIsProcessing(true);
      setOperationalMessage(`Handshaking Kling Cinema Node...`);

      try {
          // Deduct credits using the new credit service
          const creditResult = await creditService.useCredits(user.uid, 'VIDEO_GENERATION', `Video: ${videoPrompt.substring(0, 30)}`);
          if (!creditResult.success) {
              throw new Error(creditResult.error || 'Failed to deduct credits');
          }

          setOperationalMessage(`Cinema processing... (${creditCost} credits used)`);

          const job = await klingService.forgeVideo(selectedVideoTrack, { mode: klingMode, prompt: videoPrompt });
          setActiveVideoJob(job);

          // Clear any existing interval first
          if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
          }

          let progress = 0;
          pollIntervalRef.current = setInterval(async () => {
              const next = klingService.getNextProgress(progress, klingMode);
              progress = next.progress;
              setOperationalMessage(next.message);
              if (progress >= 100) {
                  if (pollIntervalRef.current) {
                      clearInterval(pollIntervalRef.current);
                      pollIntervalRef.current = null;
                  }
                  const finalUrl = await klingService.getDownloadUrl(job.id);
                  setActiveVideoJob({ ...job, status: 'completed', progress: 100, videoUrl: finalUrl });
                  setIsProcessing(false);
                  window.dispatchEvent(new CustomEvent('sf-notification', {
                      detail: {
                          title: 'Video Ready',
                          message: `Cinema asset created! Remaining credits: ${creditResult.newBalance}`,
                          type: 'success'
                      }
                  }));
              } else {
                  setActiveVideoJob(prev => prev ? { ...prev, progress } : null);
              }
          }, 3000);
      } catch (e: any) {
          window.dispatchEvent(new CustomEvent('sf-notification', {
              detail: { title: 'Cinema Error', message: e.message, type: 'error' }
          }));
          setIsProcessing(false);
      }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-950 -m-8 overflow-hidden font-sans">
        {/* LEFT: NEURAL CONTROL PANEL */}
        <div className="w-[400px] bg-slate-900 border-r border-white/5 flex flex-col shrink-0 animate-in slide-in-from-left duration-500 shadow-2xl z-20">
            <div className="h-20 border-b border-white/5 flex bg-slate-950/80 backdrop-blur-xl p-1.5 gap-1">
                <button onClick={() => setActiveTab('forge')} className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all ${activeTab === 'forge' ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'text-slate-500 hover:bg-white/5'}`}>
                    <Wand2 className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Forge</span>
                </button>
                <button onClick={() => setActiveTab('cinema')} className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all ${activeTab === 'cinema' ? 'bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' : 'text-slate-500 hover:bg-white/5'}`}>
                    <Film className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Cinema</span>
                </button>
                <button onClick={() => setActiveTab('separator')} className={`flex-1 flex flex-col items-center justify-center gap-1 rounded-2xl transition-all ${activeTab === 'separator' ? 'bg-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'text-slate-500 hover:bg-white/5'}`}>
                    <Layers className="w-5 h-5" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Stems</span>
                </button>
            </div>

            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-8">
                {activeTab === 'forge' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] flex items-center gap-2"><Cpu className="w-3 h-3" /> Core Selection</span>
                            <select value={activeEngine} onChange={(e) => setActiveEngine(e.target.value as any)} className="bg-slate-800 border border-white/10 text-[10px] font-black text-white rounded-full px-4 py-1.5 outline-none focus:ring-1 ring-cyan-500">
                                {getModelVersions().map(v => (
                                    <option key={v.value} value={v.value} disabled={v.value !== 'studio' && !v.available}>
                                        {v.label} {v.value !== 'studio' && !v.available ? '(Not Configured)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Vibe Prompt</label>
                            <textarea value={styleInput} onChange={(e) => setStyleInput(e.target.value)} placeholder="Hyper-pop, aggressive drums, ethereal vocal pads, 140BPM..." className="w-full h-32 bg-slate-950 border border-white/10 rounded-[1.5rem] p-5 text-sm text-white resize-none outline-none focus:border-indigo-500 transition-all shadow-inner placeholder:text-slate-700" />
                        </div>
                        <div className="space-y-2">
                             <div className="flex justify-between items-center mb-1 px-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lyrical Intelligence</label>
                                <button onClick={() => setIsInstrumental(!isInstrumental)} className={`px-3 py-1 rounded-full text-[8px] font-black uppercase transition-all ${isInstrumental ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>Instrumental</button>
                             </div>
                             {!isInstrumental && <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} placeholder="Type or paste lyrics. Leave blank for AI synthesis..." className="w-full h-48 bg-slate-950 border border-white/10 rounded-[1.5rem] p-5 text-sm text-white resize-none outline-none focus:border-indigo-500 shadow-inner placeholder:text-slate-700" />}
                        </div>
                    </div>
                )}

                {activeTab === 'cinema' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-[2rem] text-center">
                            <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4">Kling Cinema Nodes</h4>
                            <div className="grid grid-cols-4 gap-2">
                                {['text_to_video', 'image_to_video', 'lip_sync', 'extension'].map(m => (
                                    <button key={m} onClick={() => setKlingMode(m as any)} className={`p-2.5 rounded-xl border transition-all flex flex-col items-center gap-1.5 ${klingMode === m ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500'}`}>
                                        {m === 'lip_sync' ? <Languages className="w-4 h-4" /> : m === 'extension' ? <Expand className="w-4 h-4" /> : <Clapperboard className="w-4 h-4" />}
                                        <span className="text-[7px] font-black uppercase truncate w-full">{m.replace('_', ' ')}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-3">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Source Asset</label>
                             <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                 {forgeHistory.map(track => (
                                     <button key={track.id} onClick={() => setSelectedVideoTrack(track)} className={`w-full flex items-center gap-3 p-3 rounded-2xl border transition-all ${selectedVideoTrack?.id === track.id ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950 border-white/5 text-slate-500 hover:border-white/20'}`}>
                                         <img src={track.image} className="w-8 h-8 rounded-lg object-cover" />
                                         <span className="text-[10px] font-bold uppercase truncate">{track.title}</span>
                                     </button>
                                 ))}
                             </div>
                        </div>
                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Visual Directive</label>
                             <textarea value={videoPrompt} onChange={e => setVideoPrompt(e.target.value)} placeholder="Cinematic slow-motion close up, 4k, matching the rhythm..." className="w-full h-32 bg-slate-950 border border-white/10 rounded-[1.5rem] p-5 text-sm text-white resize-none outline-none focus:border-purple-500 shadow-inner" />
                        </div>
                    </div>
                )}

                {activeTab === 'separator' && (
                    <div className="space-y-8 text-center py-10 animate-in fade-in">
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
                            <Layers className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Isolation Node</h3>
                        <p className="text-sm text-slate-500 font-medium">Inject high-fidelity masters to extract stems via neural separation.</p>
                        <div onClick={() => sepInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-[2.5rem] p-12 cursor-pointer hover:border-cyan-500/50 transition-all bg-slate-950/50 group">
                            <Upload className="w-10 h-10 text-slate-700 group-hover:text-cyan-400 mx-auto mb-4 transition-colors" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Upload Master Node</span>
                            <input ref={sepInputRef} type="file" className="hidden" onChange={e => setSepFile(e.target.files?.[0] || null)} />
                        </div>
                        {sepFile && <div className="text-cyan-400 text-xs font-mono">{sepFile.name}</div>}
                    </div>
                )}
            </div>

            <div className="p-8 bg-slate-900 border-t border-white/5 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
                <button 
                    onClick={activeTab === 'forge' ? handleForge : activeTab === 'cinema' ? handleCinemaForge : () => {}}
                    disabled={isProcessing}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl shadow-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
                >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 fill-white" />}
                    {isProcessing ? 'SYNCHRONIZING...' : `EXECUTE ${activeTab.toUpperCase()} NODE`}
                </button>
            </div>
        </div>

        {/* RIGHT: LIVE PROCESSING FEED */}
        <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.1),_transparent)] pointer-events-none"></div>
            
            {/* AGENT STATUS */}
            <div className="h-20 bg-slate-950/50 backdrop-blur-md border-b border-white/5 flex items-center px-10 gap-10">
                {INITIAL_AGENTS.map(agent => (
                    <div key={agent.id} className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full border-2 p-0.5 transition-all duration-500 ${isProcessing ? 'border-cyan-500 animate-pulse scale-110' : 'border-white/5 grayscale opacity-40'}`}>
                            <img src={agent.avatar} className="w-full h-full rounded-full object-cover" />
                        </div>
                        <div className="hidden xl:block">
                            <div className="text-[10px] font-black text-white uppercase tracking-tighter">{agent.name}</div>
                            <div className={`text-[8px] font-black uppercase ${isProcessing ? 'text-cyan-400' : 'text-slate-600'}`}>
                                {isProcessing ? 'Synthesizing...' : 'Node Standby'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex-1 p-12 overflow-y-auto custom-scrollbar flex flex-col items-center">
                {isProcessing ? (
                    <div className="w-full max-w-2xl mt-20 animate-in zoom-in duration-500 text-center">
                        <div className="relative mb-12">
                            <div className="w-48 h-48 rounded-full border-4 border-white/5 border-t-cyan-500 animate-spin mx-auto" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Waves className="w-16 h-16 text-indigo-500 animate-pulse" />
                            </div>
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic mb-4">{operationalMessage}</h2>
                        
                        <div className="flex items-center justify-center gap-3">
                            <div className="h-1.5 w-48 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 animate-shimmer" style={{ width: '60%' }}></div>
                            </div>
                            <span className="text-[10px] font-mono text-cyan-400">LATENCY: 120ms</span>
                        </div>
                        
                        {operationalMessage.includes("⚠️") && (
                            <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono max-w-lg mx-auto">
                                DIAGNOSTIC: API Credential Missing or Invalid.
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="w-full max-w-5xl">
                         {activeTab === 'forge' && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in">
                                 {forgeHistory.length === 0 ? (
                                     <div className="col-span-full py-40 text-center opacity-10 grayscale">
                                         <Disc className="w-40 h-40 mx-auto mb-10" />
                                         <h3 className="text-4xl font-black uppercase italic tracking-tighter">Forge Ledger Empty</h3>
                                     </div>
                                 ) : forgeHistory.map(track => (
                                     <div key={track.id} className="bg-slate-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden flex h-48 group hover:border-indigo-500/30 transition-all shadow-xl">
                                         <div className="w-48 relative overflow-hidden shrink-0">
                                             <img src={track.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                             <button onClick={() => playTrack(track)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                                 <Play className="w-12 h-12 fill-white text-white" />
                                             </button>
                                         </div>
                                         <div className="flex-1 p-6 flex flex-col justify-between">
                                             <div>
                                                 <h3 className="text-xl font-black text-white uppercase truncate tracking-tight">{track.title}</h3>
                                                 <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full uppercase tracking-widest mt-2 inline-block">Neural Composition</span>
                                             </div>
                                             <div className="flex justify-between items-center border-t border-white/5 pt-4">
                                                 <span className="text-[10px] font-mono text-slate-500 uppercase">{track.duration || '03:45'} • {new Date(track.createdAt).toLocaleDateString()}</span>
                                                 <button onClick={() => setActiveTab('cinema')} className="text-slate-600 hover:text-purple-400 transition-colors" title="Forge Cinema"><Film className="w-4 h-4" /></button>
                                             </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                         )}

                         {activeTab === 'cinema' && (
                             <div className="space-y-12 animate-in slide-in-from-right-10">
                                 {activeVideoJob ? (
                                     <div className="bg-slate-900/80 backdrop-blur-xl border-2 border-purple-500/30 rounded-[3rem] p-10 shadow-2xl">
                                         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                             <div className="lg:col-span-7">
                                                 <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative">
                                                     {activeVideoJob.videoUrl ? (
                                                         <video controls src={activeVideoJob.videoUrl} className="w-full h-full object-cover" />
                                                     ) : (
                                                         <div className="w-full h-full flex flex-col items-center justify-center gap-6">
                                                             <RefreshCw className="w-16 h-16 text-purple-500 animate-spin" />
                                                             <div className="text-center">
                                                                <p className="text-white font-black uppercase tracking-widest text-lg animate-pulse">{operationalMessage}</p>
                                                                <p className="text-slate-600 text-[10px] font-black mt-2">KLING CORE PROCESSING BLOCK #{activeVideoJob.id.slice(-8)}</p>
                                                             </div>
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                             <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
                                                 <div>
                                                     <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest block mb-2">Director Directive</span>
                                                     <p className="text-lg text-white font-bold italic leading-relaxed">"{activeVideoJob.prompt}"</p>
                                                 </div>
                                                 <div className="grid grid-cols-2 gap-4">
                                                     <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 shadow-inner">
                                                         <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Status</div>
                                                         <div className="text-sm font-black text-purple-400 uppercase">{activeVideoJob.status}</div>
                                                     </div>
                                                     <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 shadow-inner">
                                                         <div className="text-[9px] font-black text-slate-500 uppercase mb-1">Progress</div>
                                                         <div className="text-sm font-black text-white font-mono">{activeVideoJob.progress}%</div>
                                                     </div>
                                                 </div>
                                                 {activeVideoJob.status === 'completed' && (
                                                     <button className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-3">
                                                         <Download className="w-4 h-4" /> Deploy to Catalog
                                                     </button>
                                                 )}
                                             </div>
                                         </div>
                                     </div>
                                 ) : (
                                     <div className="py-40 text-center opacity-10">
                                         <Video className="w-40 h-40 mx-auto mb-10" />
                                         <h3 className="text-4xl font-black uppercase italic tracking-tighter">Cinema Node Inactive</h3>
                                     </div>
                                 )}
                             </div>
                         )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
