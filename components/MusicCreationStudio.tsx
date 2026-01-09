
import React, { useState, useEffect, useRef } from 'react';
import { 
    Play, Square, Mic, Settings, Plus, Trash2, Clock, Save, Wand2, Sparkles, 
    Send, Loader2, Music, Download, ChevronRight, ChevronDown, Grid, Disc, 
    FileAudio, Circle, X, BrainCircuit, Cpu, Database, Zap, CheckCircle2, 
    Sliders, Type, History, MessageSquare, RotateCcw, Heart, BookmarkPlus, 
    Share, Sparkle, RefreshCw, Shield, MoreVertical, Layers, Scissors, Upload,
    Volume2, Waves, FileOutput
} from 'lucide-react';
import { musicGenService, MusicEngine, ForgeOptions } from '../services/musicGenService';
import { separateAudioWithKits } from '../services/audioService';
import { dataService } from '../services/dataService';
import { User, StemResult } from '../types';
import { usePlayer } from '../contexts/PlayerContext';

interface MusicCreationStudioProps {
  user: User;
  onUpgrade: () => void;
}

type StudioTab = 'forge' | 'separator' | 'history';

const MODEL_VERSIONS = [
    { label: 'V4 (Suno)', value: 'suno' },
    { label: 'Pro (Udio)', value: 'udio' },
    { label: 'Cinema (Mureka)', value: 'mureka' },
    { label: 'Turbo (MusicGPT)', value: 'musicgpt' },
    { label: 'X-Gen (AI Music)', value: 'aimusic' }
];

export const MusicCreationStudio: React.FC<MusicCreationStudioProps> = ({ user, onUpgrade }) => {
  const { playTrack, togglePlayPause } = usePlayer();
  
  // Studio UI State
  const [activeTab, setActiveTab] = useState<StudioTab>('forge');
  const [isCustomMode, setIsCustomMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [forgeHistory, setForgeHistory] = useState<any[]>([]);

  // Forge Configuration State
  const [activeEngine, setActiveEngine] = useState<MusicEngine>('udio');
  const [duration, setDuration] = useState(60);
  const [songTitle, setSongTitle] = useState('');
  const [styleInput, setStyleInput] = useState('');
  const [simplePrompt, setSimplePrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);

  // Separator State
  const [sepFile, setSepFile] = useState<File | null>(null);
  const [sepStatus, setSepStatus] = useState('');
  const [extractedStems, setExtractedStems] = useState<StemResult | null>(null);
  const sepInputRef = useRef<HTMLInputElement>(null);

  // Sync History (Private to this User)
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = dataService.subscribeToTracks(user.uid, (tracks) => {
        setForgeHistory(tracks);
    });
    return () => unsub();
  }, [user.uid]);

  const handleForge = async () => {
      const promptToUse = isCustomMode ? styleInput : simplePrompt;
      if (!promptToUse) return;
      
      togglePlayPause(false); 
      setIsProcessing(true);

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
          const trackData: any = {
              ...result,
              title: songTitle || (isCustomMode ? "Custom Project" : "Neural Masterpiece"),
              artist: user.displayName || 'Creator',
              image: result.imageUrl,
              createdAt: new Date().toISOString(),
              userId: user.uid,
              isSaved: true
          };

          await dataService.saveTrack(user.uid, trackData);
          playTrack(trackData);
          setSongTitle('');
      } catch (e) {
          console.error("Neural Forge Error:", e);
      } finally {
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
          
          window.dispatchEvent(new CustomEvent('sf-notification', { 
              detail: { 
                  title: 'Stems Isolated', 
                  message: `Extracted ${sepFile.name} components successfully.`,
                  type: 'success'
              } 
          }));
      } catch (e) {
          console.error("Stem Isolation Error:", e);
      } finally {
          setIsProcessing(false);
          setSepStatus('');
      }
  };

  const playStem = (url: string, label: string) => {
      playTrack({
          id: `stem_${Date.now()}`,
          title: `${label}: ${sepFile?.name}`,
          artist: "Stem Extractor",
          audioUrl: url,
          image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=500&auto=format",
          duration: "Stem",
          bpm: 0,
          key: "-",
          mood_tags: ["Isolated", label],
          plays: 0,
          earnings: 0
      });
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
                    onClick={() => setActiveTab('separator')}
                    className={`flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'separator' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    <Layers className="w-4 h-4" /> Stems
                </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                {activeTab === 'forge' ? (
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
                            <input value={songTitle} onChange={(e) => setSongTitle(e.target.value)} placeholder="Untitled..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white outline-none focus:border-indigo-500" />
                        </div>
                        {isCustomMode ? (
                            <div className="space-y-6">
                                <textarea value={styleInput} onChange={(e) => setStyleInput(e.target.value)} placeholder="Synthwave, Male Vocals, 80s..." className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white resize-none outline-none focus:border-indigo-500" />
                                <div onClick={() => setIsInstrumental(!isInstrumental)} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Instrumental</span>
                                    <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${isInstrumental ? 'bg-cyan-500' : 'bg-slate-700'}`}><div className={`w-3 h-3 bg-white rounded-full transition-transform ${isInstrumental ? 'translate-x-4' : 'translate-x-0'}`}></div></div>
                                </div>
                                <textarea value={lyrics} onChange={(e) => setLyrics(e.target.value)} disabled={isInstrumental} placeholder="Enter your lyrics..." className={`w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white resize-none outline-none focus:border-indigo-500 ${isInstrumental ? 'opacity-30' : ''}`} />
                            </div>
                        ) : (
                            <textarea value={simplePrompt} onChange={(e) => setSimplePrompt(e.target.value)} placeholder="Describe the style and vibe..." className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white resize-none outline-none focus:border-indigo-500" />
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h3 className="text-xl font-black text-white uppercase tracking-tighter">Neural Separator</h3>
                            <p className="text-xs text-slate-500 mt-1">Institutional component isolation via Kits.ai</p>
                        </div>

                        <div 
                            onClick={() => sepInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-[2rem] p-10 text-center cursor-pointer transition-all hover:bg-slate-800/30 ${sepFile ? 'border-cyan-500 bg-cyan-500/5 shadow-inner' : 'border-slate-800'}`}
                        >
                            {sepFile ? (
                                <div className="space-y-2">
                                    <FileAudio className="w-10 h-10 text-cyan-400 mx-auto" />
                                    <p className="text-white font-bold text-sm truncate px-4">{sepFile.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">{(sepFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="w-10 h-10 text-slate-700 mx-auto" />
                                    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Select Master Track</p>
                                    <p className="text-[8px] text-slate-600">WAV or MP3 for isolation</p>
                                </div>
                            )}
                            <input ref={sepInputRef} type="file" className="hidden" accept="audio/*" onChange={(e) => setSepFile(e.target.files?.[0] || null)} />
                        </div>

                        <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex gap-3">
                            <BrainCircuit className="w-5 h-5 text-indigo-400 shrink-0" />
                            <p className="text-[10px] text-slate-400 leading-relaxed italic">
                                "Marie is ready to oversee the extraction. We'll use Kits.ai High-Precision Separation to isolate Vocals, Drums, and Bass for your sync catalog."
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-6 bg-slate-900 border-t border-slate-800">
                {activeTab === 'forge' ? (
                    <button 
                        onClick={handleForge}
                        disabled={isProcessing || (isCustomMode ? !styleInput : !simplePrompt)}
                        className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl hover:scale-[1.02] disabled:opacity-30"
                    >
                        {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Forging...</> : <><Zap className="w-4 h-4 inline mr-2" /> Generate Music</>}
                    </button>
                ) : (
                    <button 
                        onClick={handleSeparateStems}
                        disabled={isProcessing || !sepFile}
                        className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-xl hover:scale-[1.02] disabled:opacity-30"
                    >
                        {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Isolating...</> : <><Layers className="w-4 h-4 inline mr-2" /> Extract Stems</>}
                    </button>
                )}
            </div>
        </div>

        {/* RIGHT: OUTPUT AREA */}
        <div className="flex-1 bg-slate-950 overflow-y-auto p-12 custom-scrollbar relative">
            
            {/* Marie's Operational Feed Overlay (Mobile style) */}
            {isProcessing && activeTab === 'separator' && (
                <div className="absolute top-12 left-1/2 -translate-x-1/2 z-20 w-80 bg-slate-900/90 backdrop-blur border border-cyan-500/30 rounded-2xl p-4 text-center animate-in slide-in-from-top-4">
                    <div className="flex justify-center mb-2">
                        <Waves className="w-6 h-6 text-cyan-400 animate-pulse" />
                    </div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">{sepStatus || "Marie is active..."}</p>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-12">
                {activeTab === 'forge' ? (
                    <div className="space-y-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                            <History className="w-6 h-6 text-indigo-500" /> Neural History
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {forgeHistory.map(track => (
                                <div key={track.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden flex h-36 group hover:border-indigo-500/30 transition-all">
                                    <div className="w-36 relative overflow-hidden shrink-0">
                                        <img src={track.image || track.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                        <div onClick={() => playTrack(track)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                                            <Play className="w-10 h-10 fill-white text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 p-5 flex flex-col justify-between">
                                        <div>
                                            <h3 className="text-lg font-black text-white uppercase truncate">{track.title}</h3>
                                            <div className="flex gap-1 mt-1">
                                                {track.tags?.slice(0,2).map((t:any) => <span key={t} className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">#{t}</span>)}
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase">
                                            <span>{track.duration} • {track.tags?.includes('Udio') ? 'UDIO' : 'SUNO'}</span>
                                            <button onClick={() => dataService.deleteTrack(track.id)} className="text-red-500/30 hover:text-red-500 transition-colors"><Trash2 className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {extractedStems ? (
                            <div className="animate-in zoom-in duration-500">
                                <div className="text-center mb-12">
                                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/20 shadow-[0_0_40px_rgba(34,197,94,0.1)]">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>
                                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter italic">Stems Isolated.</h2>
                                    <p className="text-slate-500 text-sm mt-2">Components ready for institutional distribution or sync placement.</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { label: 'Vocals', url: extractedStems.vocalsUrl, icon: Mic, col: 'text-cyan-400', bg: 'bg-cyan-500/10' },
                                        { label: 'Drums', url: extractedStems.drumsUrl, icon: Disc, col: 'text-purple-400', bg: 'bg-purple-500/10' },
                                        { label: 'Bass', url: extractedStems.bassUrl, icon: Volume2, col: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                                        { label: 'Instrumentation', url: extractedStems.instrumentalUrl, icon: Music, col: 'text-teal-400', bg: 'bg-teal-500/10' },
                                    ].map((stem, i) => (
                                        <div key={i} className="bg-slate-900/60 border border-slate-800 rounded-[2.5rem] p-8 flex items-center justify-between group hover:border-white/10 transition-all shadow-xl">
                                            <div className="flex items-center gap-6">
                                                <div className={`w-16 h-16 rounded-2xl ${stem.bg} ${stem.col} flex items-center justify-center shadow-lg`}>
                                                    <stem.icon className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <h4 className="text-lg font-black text-white uppercase tracking-tight">{stem.label}</h4>
                                                    <p className="text-[10px] text-slate-500 font-mono tracking-widest">Isolated Component</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => stem.url && playStem(stem.url, stem.label)}
                                                    className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all"
                                                >
                                                    <Play className="w-5 h-5 fill-current" />
                                                </button>
                                                <a 
                                                    href={stem.url} 
                                                    download={`${sepFile?.name}_${stem.label}.wav`}
                                                    className="p-4 bg-white/5 hover:bg-white/10 text-white rounded-full transition-all"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                                    <div>
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                            <Shield className="w-5 h-5 text-cyan-400" /> Catalog Ready
                                        </h3>
                                        <p className="text-slate-500 text-sm max-w-sm mt-1">Secure this asset bundle on the Sound Merge Ledger to enable automated license tracking.</p>
                                    </div>
                                    <button 
                                        className="bg-white text-slate-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                                        onClick={() => alert("Securing Stem Bundle to Ledger...")}
                                    >
                                        <FileOutput className="w-4 h-4" /> Secure Stem Bundle
                                    </button>
                                </div>
                            </div>
                        ) : isProcessing ? (
                            <div className="flex flex-col items-center justify-center py-40">
                                <div className="relative w-48 h-48 mb-12">
                                    <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-t-cyan-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Cpu className="w-12 h-12 text-cyan-500 animate-pulse" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-white uppercase tracking-tighter animate-pulse">{sepStatus || "Initializing Isolation..."}</h3>
                                <p className="text-slate-500 mt-2 font-mono text-xs">Awaiting node response...</p>
                            </div>
                        ) : (
                            <div className="h-96 flex flex-col items-center justify-center text-slate-800 opacity-20 border-4 border-dashed border-slate-900 rounded-[4rem]">
                                <Layers className="w-32 h-32 mb-4" />
                                <p className="text-2xl font-black uppercase tracking-widest">Separator Idle</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
