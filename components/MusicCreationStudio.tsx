
import React, { useState, useEffect, useRef } from 'react';
import { 
    Play, Square, Mic, Settings, Plus, Trash2, Clock, Save, Wand2, Sparkles, 
    Loader2, Music, Download, ChevronRight, ChevronDown, Grid, Disc, 
    FileAudio, Circle, X, BrainCircuit, Cpu, Database, Zap, CheckCircle2, 
    Sliders, Type, History, MessageSquare, RotateCcw, Heart, BookmarkPlus, 
    Share, Sparkle, RefreshCw, Shield, MoreVertical, Layers, Scissors, Upload,
    Volume2, Waves, FileOutput, Bot, Brain, AudioLines, Target, TrendingUp,
    Clapperboard, Video, Film, Star, AlertTriangle, UserCircle, Move, Expand,
    Camera, Languages, FastForward, Image as ImageIcon
} from 'lucide-react';
import { musicGenService, MusicEngine, ForgeOptions } from '../services/musicGenService';
import { separateAudioWithKits } from '../services/audioService';
import { klingService, KlingMode, KlingConfig } from '../services/klingService';
import { dataService } from '../services/dataService';
import { getStudioAgentSuggestions } from '../services/geminiService';
import { User, StemResult, StudioSuggestion, StudioAgent, VideoGenerationJob, Track } from '../types';
import { usePlayer } from '../contexts/PlayerContext';

interface MusicCreationStudioProps {
  user: User;
  onUpgrade: () => void;
}

type StudioTab = 'forge' | 'separator' | 'cinema' | 'history';

const MODEL_VERSIONS = [
    { label: 'High-Fidelity Neural Node', value: 'udio' },
    { label: 'Cinematic Score Processor', value: 'mureka' },
    { label: 'Rapid Prototype Engine', value: 'musicgpt' },
    { label: 'Standard Vocal Synthesis', value: 'suno' },
    { label: 'Experimental Hybrid Node', value: 'aimusic' }
];

const INITIAL_AGENTS: StudioAgent[] = [
  { id: 'beat', name: 'Rhythm Architect', role: 'beat', avatar: 'https://ui-avatars.com/api/?name=Rhythm+Architect&background=06b6d4&color=fff', status: 'idle' },
  { id: 'melody', name: 'Melody Scout', role: 'melody', avatar: 'https://ui-avatars.com/api/?name=Melody+Scout&background=8b5cf6&color=fff', status: 'idle' },
  { id: 'engineer', name: 'Sound Designer', role: 'engineer', avatar: 'https://ui-avatars.com/api/?name=Sound+Designer&background=10b981&color=fff', status: 'idle' },
];

export const MusicCreationStudio: React.FC<MusicCreationStudioProps> = ({ user, onUpgrade }) => {
  const { playTrack, togglePlayPause } = usePlayer();
  
  const [activeTab, setActiveTab] = useState<StudioTab>('forge');
  const [isCustomMode, setIsCustomMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [forgeHistory, setForgeHistory] = useState<any[]>([]);
  const [operationalMessage, setOperationalMessage] = useState('Marie is initializing...');

  // Forge Configuration State
  const [activeEngine, setActiveEngine] = useState<MusicEngine>('musicgpt');
  const [duration, setDuration] = useState(60);
  const [songTitle, setSongTitle] = useState('');
  const [styleInput, setStyleInput] = useState('');
  const [simplePrompt, setSimplePrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);

  // Cinema Forge (Kling AI) Expanded State
  const [klingMode, setKlingMode] = useState<KlingMode>('text_to_video');
  const [selectedVideoTrack, setSelectedVideoTrack] = useState<Track | null>(null);
  const [videoPrompt, setVideoPrompt] = useState('');
  const [activeVideoJob, setActiveVideoJob] = useState<VideoGenerationJob | null>(null);
  const [videoHistory, setVideoHistory] = useState<VideoGenerationJob[]>([]);
  
  // Advanced Kling Parameters
  const [motionScore, setMotionScore] = useState(5);
  const [cameraControl, setCameraControl] = useState({ pan: 0, tilt: 0, zoom: 0 });
  const [isAdvancedKling, setIsAdvancedKling] = useState(false);

  // Studio Agents State
  const [agents, setAgents] = useState<StudioAgent[]>(INITIAL_AGENTS);
  const [suggestions, setSuggestions] = useState<StudioSuggestion[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Separator State
  const [sepFile, setSepFile] = useState<File | null>(null);
  const [sepStatus, setSepStatus] = useState('');
  const [extractedStems, setExtractedStems] = useState<StemResult | null>(null);
  const sepInputRef = useRef<HTMLInputElement>(null);

  // Sync History
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = dataService.subscribeToTracks(user.uid, (tracks) => {
        // Map to ensure 'image' property exists for history items
        // Fix: Cast 't' to 'any' because 'GeneratedTrack' does not have 'image' property, only 'imageUrl'.
        const mapped = tracks.map((t: any) => ({
            ...t,
            image: t.image || t.imageUrl || 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&auto=format&fit=crop'
        }));
        setForgeHistory(mapped);
        if (mapped.length > 0 && !selectedVideoTrack) {
            setSelectedVideoTrack(mapped[0] as any);
        }
    });
    return () => unsub();
  }, [user.uid]);

  // Proactive Studio Agent Trigger
  useEffect(() => {
    if (activeTab !== 'forge') return;
    
    const timeout = setTimeout(async () => {
      if (!styleInput && !lyrics) return;
      setIsThinking(true);
      setAgents(prev => prev.map(a => ({ ...a, status: 'analyzing' })));
      
      const newSuggestions = await getStudioAgentSuggestions(styleInput, lyrics);
      if (newSuggestions.length > 0) {
        setSuggestions(prev => [...newSuggestions, ...prev].slice(0, 5));
        setAgents(prev => prev.map(a => ({ ...a, status: 'suggesting' })));
        setTimeout(() => {
          setAgents(prev => prev.map(a => ({ ...a, status: 'idle' })));
        }, 3000);
      }
      setIsThinking(false);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [styleInput, lyrics, activeTab]);

  const applySuggestion = (suggestion: StudioSuggestion) => {
    if (isCustomMode) {
      setStyleInput(prev => `${prev}, ${suggestion.promptAddon}`.replace(/^, /, ''));
    } else {
      setSimplePrompt(prev => `${prev}. Also, ${suggestion.description}`);
    }
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  };

  const handleForge = async () => {
      const promptToUse = isCustomMode ? styleInput : simplePrompt;
      if (!promptToUse) return;
      
      togglePlayPause(false); 
      setIsProcessing(true);
      setOperationalMessage(`Connecting to Institutional Hardware...`);

      const options: ForgeOptions = {
          engine: activeEngine,
          prompt: promptToUse,
          lyrics: isCustomMode && !isInstrumental ? lyrics : '',
          isInstrumental: isInstrumental,
          version: activeEngine,
          durationDesired: duration,
          styleTags: styleInput.split(',').map(t => t.trim())
      };

      try {
          const result = await musicGenService.generate(options);
          setOperationalMessage("Metadata optimization in progress...");
          
          const trackData: any = {
              ...result,
              title: songTitle || (isCustomMode ? "Project Forge" : "Neural Masterpiece"),
              artist: user.displayName || 'Sandbox Artist',
              createdAt: new Date().toISOString(),
              userId: user.uid,
              isSaved: true
          };

          await dataService.saveTrack(user.uid, trackData);
          playTrack(trackData);
          setSelectedVideoTrack(trackData);
          setSongTitle('');
          
          window.dispatchEvent(new CustomEvent('sf-notification', { 
              detail: { title: 'Forge Complete', message: 'Asset secured on ledger.', type: 'success', image: result.imageUrl } 
          }));

      } catch (e) {
          setOperationalMessage("Signal error. Re-authenticating...");
      } finally {
          setIsProcessing(false);
      }
  };

  const handleCinemaForge = async () => {
      if (!selectedVideoTrack || !videoPrompt) return;
      
      const cost = klingMode === 'extension' ? 15 : 10;
      if (user.credits < cost) {
          alert(`Insufficient Forge Credits. This node requires ${cost} credits.`);
          onUpgrade();
          return;
      }

      setIsProcessing(true);
      setOperationalMessage(`Handshaking Kling ${klingMode.replace('_', ' ').toUpperCase()} Node...`);

      try {
          const success = await dataService.deductCredits(user.uid, cost);
          if (!success) throw new Error("Credit settlement failed.");

          const config: KlingConfig = {
              mode: klingMode,
              prompt: videoPrompt,
              motion_score: motionScore,
              camera_control: isAdvancedKling ? cameraControl : undefined,
              aspect_ratio: '16:9'
          };

          const job = await klingService.forgeVideo(selectedVideoTrack, config);
          setActiveVideoJob(job);
          setVideoHistory(prev => [job, ...prev]);
          await dataService.saveVideoJob(user.uid, job);

          // Simulated High-Fidelity Polling
          let progress = 0;
          const pollInterval = setInterval(async () => {
              const next = klingService.getNextProgress(progress, klingMode);
              progress = next.progress;
              setOperationalMessage(next.message);

              if (progress >= 100) {
                  clearInterval(pollInterval);
                  const finalUrl = await klingService.getDownloadUrl(job.id);
                  const finalJob = { ...job, status: 'completed' as const, progress: 100, videoUrl: finalUrl };
                  setActiveVideoJob(finalJob);
                  await dataService.saveVideoJob(user.uid, finalJob);
                  window.dispatchEvent(new CustomEvent('sf-notification', { detail: { title: 'Cinema Node Ready', message: `Visuals for ${selectedVideoTrack.title} finalized.`, type: 'success' } }));
                  setIsProcessing(false);
              } else {
                  setActiveVideoJob(prev => prev ? { ...prev, progress } : null);
              }
          }, 3500);

      } catch (e: any) {
          alert(e.message || "Cinema Forge synchronization failed.");
          setIsProcessing(false);
      }
  };

  const handleSeparateStems = async () => {
      if (!sepFile) return;
      setIsProcessing(true);
      setExtractedStems(null);
      try {
          const result = await separateAudioWithKits(sepFile, (msg) => setSepStatus(msg));
          setExtractedStems(result);
          window.dispatchEvent(new CustomEvent('sf-notification', { detail: { title: 'Stems Isolated', message: `Extracted ${sepFile.name} components.`, type: 'success' } }));
      } catch (e) {
          console.error("Stem Isolation Error:", e);
      } finally {
          setIsProcessing(false);
          setSepStatus('');
      }
  };

  const syncLyricsToVideo = () => {
      if (selectedVideoTrack) {
          // Logic: Clean lyrics and append to prompt to drive Kling's temporal consistency
          const lyricSnippet = lyrics ? ` Visual narrative based on these lyrics: "${lyrics.substring(0, 100)}..."` : "";
          setVideoPrompt(prev => prev + lyricSnippet);
          window.dispatchEvent(new CustomEvent('sf-notification', { detail: { title: 'Temporal Sync Active', message: 'Visual prompt enriched with lyrical metadata.', type: 'info' } }));
      }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-950 -m-8 overflow-hidden font-sans">
        
        {/* LEFT: CONTROL DECK */}
        <div className="w-[380px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 animate-in slide-in-from-left duration-500">
            <div className="h-16 border-b border-slate-800 flex bg-slate-950/50 p-1">
                <button 
                    onClick={() => setActiveTab('forge')}
                    className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'forge' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Disc className="w-4 h-4" /> Forge
                </button>
                <button 
                    onClick={() => setActiveTab('cinema')}
                    className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'cinema' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Film className="w-4 h-4" /> Cinema
                </button>
                <button 
                    onClick={() => setActiveTab('separator')}
                    className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'separator' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Layers className="w-4 h-4" /> Stems
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                {activeTab === 'forge' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div onClick={() => setIsCustomMode(!isCustomMode)} className="flex items-center gap-3 cursor-pointer group">
                                <div className={`w-10 h-5 rounded-full p-1 transition-all ${isCustomMode ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isCustomMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                                </div>
                                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Custom Mode</span>
                            </div>
                            <select value={activeEngine} onChange={(e) => setActiveEngine(e.target.value as any)} className="bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-400 rounded-lg px-2 py-1 outline-none">
                                {MODEL_VERSIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Project Title</label>
                            <input value={songTitle} onChange={(e) => setSongTitle(e.target.value)} placeholder="Untitled..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white outline-none focus:border-indigo-500 font-bold" />
                        </div>
                        {isCustomMode ? (
                            <div className="space-y-6">
                                <textarea value={styleInput} onChange={(e) => setStyleInput(e.target.value)} placeholder="Genre, Mood, BPM, Style (e.g. Cinematic Electronic, Uplifting, 128BPM)..." className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white resize-none outline-none focus:border-indigo-500" />
                                <div onClick={() => setIsInstrumental(!isInstrumental)} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Instrumental Only</span>
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${isInstrumental ? 'bg-cyan-500' : 'bg-slate-700'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${isInstrumental ? 'translate-x-4' : 'translate-x-0'}`}></div></div>
                                </div>
                                <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} disabled={isInstrumental} placeholder="Enter your lyrics (or leave empty for AI lyrics)..." className={`w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white resize-none outline-none focus:border-indigo-500 ${isInstrumental ? 'opacity-30' : ''}`} />
                            </div>
                        ) : (
                            <textarea value={simplePrompt} onChange={(e) => setSimplePrompt(e.target.value)} placeholder="Describe the track you want to create in natural language..." className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white resize-none outline-none focus:border-indigo-500" />
                        )}
                    </div>
                )}

                {activeTab === 'cinema' && (
                    <div className="space-y-6">
                        <div className="bg-purple-900/10 border border-purple-500/20 p-5 rounded-[1.5rem] flex flex-col items-center text-center">
                            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-4">Kling Forge Nodes</h4>
                            <div className="grid grid-cols-4 gap-2 w-full">
                                {[
                                    { id: 'text_to_video', icon: Type, label: 'Omni' },
                                    { id: 'image_to_video', icon: ImageIcon, label: 'Visual' },
                                    { id: 'lip_sync', icon: Languages, label: 'LipSync' },
                                    { id: 'extension', icon: Expand, label: 'Long' }
                                ].map(node => (
                                    <button 
                                        key={node.id} 
                                        onClick={() => setKlingMode(node.id as any)}
                                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-all ${klingMode === node.id ? 'bg-purple-500 text-white border-purple-400 shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                    >
                                        <node.icon className="w-3.5 h-3.5" />
                                        <span className="text-[7px] font-black uppercase">{node.label}</span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-[7px] text-slate-500 mt-3 font-bold uppercase tracking-widest">
                                {klingMode === 'lip_sync' ? 'Syncs vocals to your visual avatar identity.' : 'High-fidelity cinematic generation node.'}
                            </p>
                        </div>

                        <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between">
                                 Source Track Node
                                 <span className="text-purple-400 font-mono">{user.credits || 0} CR</span>
                             </label>
                             <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                 {forgeHistory.length === 0 ? (
                                     <p className="text-[9px] text-slate-600 italic uppercase">Forge a track first to enable video synthesis.</p>
                                 ) : forgeHistory.map(track => (
                                     <button 
                                        key={track.id} 
                                        onClick={() => setSelectedVideoTrack(track)}
                                        className={`w-full text-left p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedVideoTrack?.id === track.id ? 'bg-purple-500/10 border-purple-500 shadow-lg' : 'bg-slate-950 border-slate-800 opacity-60'}`}
                                     >
                                         <img src={track.image || track.imageUrl} className="w-8 h-8 rounded-lg object-cover" />
                                         <span className="text-[10px] font-bold text-white truncate uppercase tracking-tight">{track.title}</span>
                                     </button>
                                 ))}
                             </div>
                        </div>

                        <div className="space-y-2">
                             <div className="flex justify-between items-center mb-1">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Visual Strategy</label>
                                <button onClick={syncLyricsToVideo} className="text-[8px] font-black uppercase text-cyan-400 hover:text-white flex items-center gap-1"><RefreshCw className="w-2.5 h-2.5" /> Sync Lyrics</button>
                             </div>
                             <textarea 
                                value={videoPrompt}
                                onChange={(e) => setVideoPrompt(e.target.value)}
                                placeholder="Describe the scene. Kling AI will synchronize these visuals with your audio gradients..." 
                                className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white resize-none outline-none focus:border-purple-500" 
                             />
                        </div>

                        {/* ADVANCED KLING CONTROLS */}
                        <div className="space-y-4">
                            <button 
                                onClick={() => setIsAdvancedKling(!isAdvancedKling)}
                                className="w-full flex items-center justify-between text-[8px] font-black uppercase tracking-widest text-slate-500 py-1 hover:text-white transition-colors"
                            >
                                <span>Master Motion Gradients</span>
                                <Sliders className="w-3 h-3" />
                            </button>
                            
                            {isAdvancedKling && (
                                <div className="space-y-4 animate-in slide-in-from-top-2">
                                    <div>
                                        <div className="flex justify-between text-[8px] font-black uppercase text-slate-600 mb-1">
                                            <span>Motion Intensity</span>
                                            <span className="text-purple-400">{motionScore}</span>
                                        </div>
                                        <input type="range" min="1" max="10" value={motionScore} onChange={e => setMotionScore(parseInt(e.target.value))} className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-purple-500" />
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['pan', 'tilt', 'zoom'].map(ctrl => (
                                            <div key={ctrl}>
                                                <label className="text-[7px] font-black uppercase text-slate-600 block mb-1">{ctrl} vector</label>
                                                <input 
                                                    type="number" 
                                                    value={(cameraControl as any)[ctrl]} 
                                                    onChange={e => setCameraControl({...cameraControl, [ctrl]: parseInt(e.target.value)})}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] text-white font-mono"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="bg-slate-950/50 border border-slate-800 rounded-xl p-4">
                            <div className="flex items-center justify-between text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                <span>Node Cost</span>
                                <span className="text-purple-400">{klingMode === 'extension' ? '15' : '10'} Credits</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'separator' && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Neural Separator</h3>
                            <p className="text-xs text-slate-500 mt-1">Institutional isolation powered by Sound Merge Nodes</p>
                        </div>
                        <div 
                            onClick={() => sepInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-[2.5rem] p-10 text-center cursor-pointer transition-all hover:bg-slate-800/30 ${sepFile ? 'border-cyan-500 bg-cyan-500/5 shadow-inner' : 'border-slate-800'}`}
                        >
                            {sepFile ? (
                                <div className="space-y-2">
                                    <FileAudio className="w-10 h-10 text-cyan-400 mx-auto" />
                                    <p className="text-white font-bold text-sm truncate px-4">{sepFile.name}</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="w-10 h-10 text-slate-700 mx-auto" />
                                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Select Master Track</p>
                                </div>
                            )}
                            <input ref={sepInputRef} type="file" className="hidden" accept="audio/*" onChange={(e) => setSepFile(e.target.files?.[0] || null)} />
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800">
                {activeTab === 'forge' && (
                    <button 
                        onClick={handleForge}
                        disabled={isProcessing || (isCustomMode ? !styleInput : !simplePrompt)}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl hover:scale-[1.02] disabled:opacity-30 flex items-center justify-center gap-3"
                    >
                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> DISPATCHING...</> : <><Zap className="w-5 h-5" /> GENERATE MUSIC</>}
                    </button>
                )}
                {activeTab === 'cinema' && (
                    <button 
                        onClick={handleCinemaForge}
                        disabled={isProcessing || !videoPrompt || !selectedVideoTrack}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl hover:scale-[1.02] disabled:opacity-30 flex items-center justify-center gap-3"
                    >
                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> ENGAGING NODE...</> : <><Clapperboard className="w-5 h-5" /> FORGE CINEMA</>}
                    </button>
                )}
                {activeTab === 'separator' && (
                    <button 
                        onClick={handleSeparateStems}
                        disabled={isProcessing || !sepFile}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl hover:scale-[1.02] disabled:opacity-30"
                    >
                        {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin mr-2" /> PROCESSING...</> : 'EXTRACT STEMS'}
                    </button>
                )}
            </div>
        </div>

        {/* RIGHT: AGENTS & FEED */}
        <div className="flex-1 bg-slate-950 overflow-hidden flex flex-col relative">
            
            {/* AGENT STATUS BAR */}
            <div className="h-20 bg-slate-950 border-b border-slate-900 px-8 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-6">
                    {agents.map(agent => (
                        <div key={agent.id} className="flex items-center gap-3 relative">
                            <div className={`w-10 h-10 rounded-full border-2 transition-all duration-500 overflow-hidden ${agent.status === 'analyzing' ? 'border-cyan-500 animate-pulse' : agent.status === 'suggesting' ? 'border-green-500 scale-110' : 'border-slate-800'}`}>
                                <img src={agent.avatar} className="w-full h-full object-cover" />
                            </div>
                            <div className="hidden lg:block">
                                <span className="text-[10px] font-black text-white uppercase tracking-tighter block">{agent.name}</span>
                                <span className={`text-[8px] font-bold uppercase ${agent.status === 'analyzing' ? 'text-cyan-500' : agent.status === 'suggesting' ? 'text-green-500' : 'text-slate-600'}`}>{agent.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    {isThinking && (
                        <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-4 py-1.5 rounded-full">
                            <BrainCircuit className="w-3 h-3 text-cyan-500 animate-pulse" />
                            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Neural Analysis Active</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
                {isProcessing && (
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 w-96 bg-slate-900/95 backdrop-blur border border-indigo-500/30 rounded-3xl p-6 text-center animate-in slide-in-from-top-4 shadow-2xl">
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
                                </div>
                            </div>
                        </div>
                        <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{operationalMessage}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Sound Merge Enterprise Node</p>
                    </div>
                )}

                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    <div className="lg:col-span-8 space-y-12">
                        {activeTab === 'cinema' && (
                            <div className="space-y-12">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-widest flex items-center gap-4 italic">
                                        <Film className="w-8 h-8 text-purple-500" /> Cinema Ledger
                                    </h2>
                                </div>

                                {activeVideoJob && (
                                    <div className="bg-slate-900 border-2 border-purple-500/30 rounded-[3rem] p-10 animate-in zoom-in duration-500 shadow-2xl">
                                        <div className="flex flex-col md:flex-row gap-10">
                                            <div className="w-full md:w-64 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                                                {activeVideoJob.status === 'completed' && activeVideoJob.videoUrl ? (
                                                    <video controls src={activeVideoJob.videoUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-slate-950">
                                                        <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
                                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Rendering Frames...</span>
                                                    </div>
                                                )}
                                                {activeVideoJob.status === 'processing' && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-end p-4">
                                                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-purple-500 transition-all duration-1000" style={{ width: `${activeVideoJob.progress}%` }}></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 space-y-6">
                                                <div>
                                                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1 block">Institutional Prompt</span>
                                                    <p className="text-xs text-white font-medium italic leading-relaxed">"{activeVideoJob.prompt}"</p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                                                        <div className="text-[8px] font-black text-slate-500 uppercase">Provider</div>
                                                        <div className="text-xs font-black text-white">KLING-NODE-1.5</div>
                                                    </div>
                                                    <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                                                        <div className="text-[8px] font-black text-slate-500 uppercase">Status</div>
                                                        <div className="text-xs font-black text-purple-400 uppercase">{activeVideoJob.status}</div>
                                                    </div>
                                                </div>
                                                {activeVideoJob.status === 'completed' && (
                                                    <button className="w-full py-3 bg-white text-slate-950 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
                                                        <Download className="w-4 h-4" /> Save to Catalog
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {videoHistory.length > 1 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {videoHistory.slice(1).map(v => (
                                            <div key={v.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-5 flex items-center gap-4 group hover:border-purple-500/50 transition-all">
                                                <div className="w-20 h-12 bg-black rounded-lg overflow-hidden shrink-0">
                                                    <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200" className="w-full h-full object-cover opacity-50" />
                                                </div>
                                                <div className="flex-1 min-0">
                                                    <h4 className="text-[10px] font-black text-white uppercase truncate tracking-tight">{v.prompt}</h4>
                                                    <span className="text-[8px] font-bold text-slate-600 uppercase">Archive ID: {v.id.slice(-6)}</span>
                                                </div>
                                                <Play className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {videoHistory.length === 0 && !isProcessing && (
                                    <div className="h-64 flex flex-col items-center justify-center text-slate-800 opacity-20 border-4 border-dashed border-slate-900 rounded-[4rem]">
                                        <Clapperboard className="w-24 h-24 mb-4" />
                                        <p className="text-xl font-black uppercase tracking-widest italic">Director Deck Idle</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'forge' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                                    <h2 className="text-3xl font-black text-white uppercase tracking-widest flex items-center gap-4 italic">
                                        <History className="w-8 h-8 text-indigo-500" /> Neural History
                                    </h2>
                                </div>
                                
                                {forgeHistory.length === 0 && !isProcessing ? (
                                    <div className="h-64 flex flex-col items-center justify-center text-slate-800 opacity-20 border-4 border-dashed border-slate-900 rounded-[3rem]">
                                        <Disc className="w-24 h-24 mb-4" />
                                        <p className="text-xl font-black uppercase tracking-widest italic">Ledger Empty</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {forgeHistory.map(track => (
                                            <div key={track.id} className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden flex h-40 group hover:border-indigo-500/50 transition-all shadow-xl relative">
                                                <div className="w-40 relative overflow-hidden shrink-0 border-r border-slate-800">
                                                    <img src={track.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                                    <div onClick={() => playTrack(track)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                                                        <Play className="w-12 h-12 fill-white text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 p-6 flex flex-col justify-between">
                                                    <div className="space-y-1">
                                                        <h3 className="text-xl font-black text-white uppercase truncate tracking-tight">{track.title}</h3>
                                                        <div className="flex flex-wrap gap-2">
                                                            {track.tags?.slice(0,3).map((t:any) => <span key={t} className="text-[9px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded uppercase tracking-tighter">#{t}</span>)}
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center border-t border-slate-800/50 pt-4">
                                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                            {track.duration} • <span className="text-slate-400">NODE</span>
                                                        </div>
                                                        <div className="flex gap-4">
                                                            <button onClick={() => setActiveTab('cinema')} title="Build Music Video" className="text-slate-700 hover:text-purple-400 transition-colors"><Clapperboard className="w-4 h-4" /></button>
                                                            <button onClick={() => dataService.deleteTrack(track.id)} className="text-slate-700 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'separator' && (
                            <div className="space-y-12">
                                {extractedStems ? (
                                    <div className="animate-in zoom-in duration-500">
                                        <div className="text-center mb-12">
                                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                                                <CheckCircle2 className="w-10 h-10 text-green-500" />
                                            </div>
                                            <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Stems Isolated.</h2>
                                        </div>
                                    </div>
                                ) : isProcessing ? (
                                    <div className="flex flex-col items-center justify-center py-40">
                                        <Waves className="w-32 h-32 text-cyan-500 animate-pulse mb-8" />
                                        <h3 className="text-3xl font-black text-white uppercase tracking-tighter animate-pulse">{sepStatus || "ISOLATING SIGNALS..."}</h3>
                                    </div>
                                ) : (
                                    <div className="h-96 flex flex-col items-center justify-center text-slate-800 opacity-20 border-4 border-dashed border-slate-900 rounded-[4rem]">
                                        <Layers className="w-32 h-32 mb-4" />
                                        <p className="text-2xl font-black uppercase tracking-widest italic">Idle Status</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: AGENT SUGGESTIONS PANE */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-cyan-400" /> AI Insights
                            </h3>
                            <button onClick={() => setSuggestions([])} className="text-[10px] text-slate-500 hover:text-white uppercase tracking-widest font-bold transition-colors">Clear</button>
                        </div>
                        
                        <div className="space-y-4">
                            {suggestions.length === 0 ? (
                                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center">
                                    <Brain className="w-8 h-8 text-slate-800 mx-auto mb-3" />
                                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
                                        Describe your vibe to trigger proactive team assistance.
                                    </p>
                                </div>
                            ) : (
                                suggestions.map(suggestion => (
                                    <div key={suggestion.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-cyan-500/50 transition-all group animate-in slide-in-from-right-4 duration-300">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl ${
                                                    suggestion.agentId === 'beat' ? 'bg-cyan-500/10 text-cyan-400' :
                                                    suggestion.agentId === 'melody' ? 'bg-purple-500/10 text-purple-400' :
                                                    'bg-green-500/10 text-green-400'
                                                }`}>
                                                    {suggestion.type === 'beat' ? <AudioLines className="w-4 h-4" /> : suggestion.type === 'vocal' ? <Mic className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
                                                </div>
                                                <div>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{suggestion.agentId} node</span>
                                                    <h4 className="text-sm font-bold text-white uppercase tracking-tight line-clamp-1">{suggestion.title}</h4>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed mb-6 italic">"{suggestion.description}"</p>
                                        <button 
                                            onClick={() => applySuggestion(suggestion)}
                                            className="w-full py-2.5 bg-slate-800 hover:bg-cyan-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
                                        >
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Integrate Insight
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* INDUSTRY TRENDS TICKER */}
                        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-3xl p-6 mt-8">
                             <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-indigo-400" />
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Cinema Pulse</span>
                             </div>
                             <div className="space-y-4">
                                {[
                                    { label: 'Lip-Sync Efficiency', impact: '+82%' },
                                    { label: 'Temporal Consistency', impact: 'Institutional' },
                                    { label: '4K Rendering Nodes', impact: 'Active' }
                                ].map((trend, i) => (
                                    <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                                        <span className="text-slate-500 uppercase">{trend.label}</span>
                                        <span className="text-cyan-400 font-mono">{trend.impact}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
