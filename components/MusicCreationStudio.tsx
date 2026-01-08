
import React, { useState, useEffect } from 'react';
import { Play, Square, Mic, Settings, Plus, Trash2, Clock, Save, Wand2, Sparkles, Send, Loader2, Music, Download, ChevronRight, ChevronDown, Grid, Disc, FileAudio, Circle, X, BrainCircuit, Cpu, Database, Zap, CheckCircle2, Sliders, Type, History, MessageSquare, RotateCcw, Heart, BookmarkPlus, Share, Sparkle, RefreshCw, Shield, MoreVertical } from 'lucide-react';
import { musicGenService, MusicEngine, ForgeOptions } from '../services/musicGenService';
import { dataService } from '../services/dataService';
import { User } from '../types';
import { usePlayer } from '../contexts/PlayerContext';

interface MusicCreationStudioProps {
  user: User;
  onUpgrade: () => void;
}

const STYLE_PRESETS = ["Latin", "Acid House", "Industrial", "Baroque", "Cyberpunk", "Chillwave", "Lo-Fi Hip Hop"];
const MODEL_VERSIONS = [
    { label: 'V4 (Suno)', value: 'suno' },
    { label: 'Pro (Udio)', value: 'udio' },
    { label: 'Cinema (Mureka)', value: 'mureka' },
    { label: 'Turbo (MusicGPT)', value: 'musicgpt' },
    { label: 'X-Gen (AI Music)', value: 'aimusic' }
];

export const MusicCreationStudio: React.FC<MusicCreationStudioProps> = ({ user, onUpgrade }) => {
  const { playTrack, togglePlayPause } = usePlayer();
  
  // App UI State
  const [isCustomMode, setIsCustomMode] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [forgeHistory, setForgeHistory] = useState<any[]>([]);

  // Configuration State
  const [activeEngine, setActiveEngine] = useState<MusicEngine>('udio');
  const [duration, setDuration] = useState(60);
  
  // Track Details
  const [songTitle, setSongTitle] = useState('');
  const [styleInput, setStyleInput] = useState('');
  const [simplePrompt, setSimplePrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);

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
          
          window.dispatchEvent(new CustomEvent('sf-notification', { 
              detail: { 
                  title: 'Forge Complete', 
                  message: `"${trackData.title}" secured via ${activeEngine.toUpperCase()}.`,
                  image: trackData.image,
                  type: 'success'
              } 
          }));

          setSongTitle('');
      } catch (e) {
          console.error("Neural Forge Error:", e);
      } finally {
          setIsProcessing(false);
      }
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-950 -m-8 overflow-hidden font-sans">
        
        {/* LEFT: THE CONTROL DESK (Fixed Suno/Udio Style) */}
        <div className="w-[360px] bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 animate-in slide-in-from-left duration-500">
            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                
                {/* Mode & Model Row */}
                <div className="flex items-center justify-between">
                    <div 
                        onClick={() => setIsCustomMode(!isCustomMode)}
                        className="flex items-center gap-3 cursor-pointer group"
                    >
                        <div className={`w-10 h-5 rounded-full p-1 transition-all ${isCustomMode ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isCustomMode ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-wider group-hover:text-white transition-colors">Custom Mode</span>
                    </div>

                    <select 
                        value={activeEngine}
                        onChange={(e) => setActiveEngine(e.target.value as any)}
                        className="bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-400 rounded-lg px-2 py-1 focus:outline-none focus:border-indigo-500 uppercase tracking-widest"
                    >
                        {MODEL_VERSIONS.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
                    </select>
                </div>

                {/* Title Box */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Project Title</label>
                    <input 
                        value={songTitle}
                        onChange={(e) => setSongTitle(e.target.value)}
                        placeholder="Name your masterpiece..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white placeholder:text-slate-700 focus:border-indigo-500 transition-all outline-none"
                    />
                </div>

                {!isCustomMode ? (
                    /* SIMPLE DESCRIPTION */
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Song Description</label>
                        <div className="relative">
                            <textarea 
                                value={simplePrompt}
                                onChange={(e) => setSimplePrompt(e.target.value.slice(0, 500))}
                                placeholder="Describe the style of music and the topic you want..."
                                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white resize-none focus:border-indigo-500 transition-all outline-none scrollbar-hide"
                            />
                            <span className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-700">{simplePrompt.length}/500</span>
                        </div>
                    </div>
                ) : (
                    /* CUSTOM CONFIG */
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Style of Music</label>
                            <div className="relative">
                                <textarea 
                                    value={styleInput}
                                    onChange={(e) => setStyleInput(e.target.value.slice(0, 200))}
                                    placeholder="Enter style tags (e.g. Synthwave, Male Vocals, 80s)..."
                                    className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white resize-none focus:border-indigo-500 transition-all outline-none scrollbar-hide"
                                />
                                <span className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-700">{styleInput.length}/200</span>
                            </div>
                        </div>

                        <div 
                            onClick={() => setIsInstrumental(!isInstrumental)}
                            className="flex items-center justify-between bg-slate-950 border border-slate-800 p-4 rounded-xl cursor-pointer hover:border-slate-700 transition-all"
                        >
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Instrumental Only</span>
                            <div className={`w-8 h-4 rounded-full p-0.5 transition-all ${isInstrumental ? 'bg-cyan-500' : 'bg-slate-700'}`}>
                                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isInstrumental ? 'translate-x-4' : 'translate-x-0'}`}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Lyrics</label>
                            <div className="relative">
                                <textarea 
                                    value={lyrics}
                                    onChange={(e) => setLyrics(e.target.value.slice(0, 3000))}
                                    disabled={isInstrumental}
                                    placeholder={isInstrumental ? "Instrumental mode active..." : "Enter your lyrics here..."}
                                    className={`w-full h-48 bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white resize-none focus:border-indigo-500 transition-all outline-none scrollbar-hide ${isInstrumental ? 'opacity-30' : ''}`}
                                />
                                <span className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-700">{lyrics.length}/3000</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ACTION FOOTER */}
            <div className="p-6 bg-slate-900 border-t border-slate-800">
                <button 
                    onClick={handleForge}
                    disabled={isProcessing || (isCustomMode ? !styleInput : !simplePrompt)}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-[1.02] active:scale-95 text-white font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-30 disabled:hover:scale-100 flex items-center justify-center gap-3"
                >
                    {isProcessing ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Forge in Progress</>
                    ) : (
                        <><Zap className="w-5 h-5 fill-current" /> Generate Music</>
                    )}
                </button>
            </div>
        </div>

        {/* RIGHT: THE PRODUCTION FEED (Recent History) */}
        <div className="flex-1 bg-slate-950 overflow-y-auto p-8 lg:p-12 custom-scrollbar">
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-3">
                        <Disc className={`w-5 h-5 text-indigo-500 ${isProcessing ? 'animate-spin' : ''}`} /> Recent History
                    </h2>
                </div>

                {isProcessing && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                        {[1, 2].map(i => (
                            <div key={i} className="h-32 bg-slate-900/50 rounded-2xl border border-slate-800"></div>
                        ))}
                    </div>
                )}

                {forgeHistory.length === 0 && !isProcessing && (
                    <div className="h-96 flex flex-col items-center justify-center text-slate-800 opacity-20">
                        <Music className="w-20 h-20 mb-4" />
                        <p className="text-xl font-black uppercase tracking-widest">Library Empty</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {forgeHistory.map((track) => (
                        <div key={track.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden group hover:border-indigo-500/50 hover:bg-slate-900/60 transition-all duration-500 shadow-2xl flex">
                             <div className="w-32 sm:w-40 h-full relative overflow-hidden shrink-0">
                                 <img src={track.image || track.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={track.title} />
                                 <div 
                                    className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                                    onClick={() => playTrack(track)}
                                 >
                                    <Play className="w-10 h-10 fill-white text-white" />
                                 </div>
                             </div>
                             
                             <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
                                 <div>
                                     <div className="flex justify-between items-start">
                                         <h3 className="text-lg font-black text-white uppercase truncate pr-4 leading-tight">{track.title}</h3>
                                         <button className="text-slate-600 hover:text-white"><MoreVertical className="w-4 h-4" /></button>
                                     </div>
                                     <div className="flex flex-wrap gap-1 mt-2">
                                         {track.tags?.slice(0, 3).map((t: string) => (
                                             <span key={t} className="text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-800 px-2 py-0.5 rounded-md">#{t}</span>
                                         ))}
                                     </div>
                                 </div>

                                 <div className="flex items-center justify-between pt-4 mt-auto">
                                     <div className="flex items-center gap-4">
                                         <div>
                                             <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Length</div>
                                             <div className="text-xs font-mono font-bold text-white">{track.duration}</div>
                                         </div>
                                         <div className="hidden sm:block">
                                             <div className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Node</div>
                                             <div className="text-[10px] font-black text-cyan-400 uppercase tracking-tighter">{track.tags?.find((t:string) => ['Udio', 'Suno', 'Mureka', 'MusicGPT', 'AIMusic'].includes(t)) || 'GEN-X'}</div>
                                         </div>
                                     </div>
                                     <div className="flex gap-2">
                                         <button onClick={() => playTrack(track)} className="p-2 bg-slate-800 hover:bg-indigo-600 text-white rounded-xl transition-all">
                                             <Play className="w-3 h-3 fill-current" />
                                         </button>
                                         <button onClick={() => dataService.deleteTrack(track.id)} className="p-2 bg-slate-800 hover:bg-red-600 text-white rounded-xl transition-all">
                                             <Trash2 className="w-3 h-3" />
                                         </button>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
  );
};
