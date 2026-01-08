
import React, { useState, useEffect } from 'react';
// Added RefreshCw to imports
import { Play, Square, Mic, Settings, Plus, Trash2, Clock, Save, Wand2, Sparkles, Send, Loader2, Music, Download, ChevronRight, ChevronDown, Grid, Disc, FileAudio, Circle, X, BrainCircuit, Cpu, Database, Zap, CheckCircle2, Sliders, Type, History, MessageSquare, RotateCcw, Heart, BookmarkPlus, Share, Sparkle, RefreshCw } from 'lucide-react';
import { musicGenService, MusicEngine, ForgeOptions } from '../services/musicGenService';
import { chatWithGemini } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { User } from '../types';
import { usePlayer } from '../contexts/PlayerContext';

interface MusicCreationStudioProps {
  user: User;
  onUpgrade: () => void;
}

const STYLE_PRESETS = ["Latin", "Acid House", "Drone", "Baroque", "Cyberpunk", "Chillwave", "Lo-Fi Hip Hop"];
const SIMPLE_PROMPTS = [
    "A catchy summer pop anthem about driving to the beach",
    "Dark cinematic techno with heavy industrial sub-bass",
    "Chill lo-fi study beats with raining atmosphere",
    "Aggressive 90s boom bap with a soul sample",
    "Dreamy ethereal shoegaze with female vocals"
];

export const MusicCreationStudio: React.FC<MusicCreationStudioProps> = ({ user, onUpgrade }) => {
  const { playTrack } = usePlayer();
  
  // Configuration State
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [activeEngine, setActiveEngine] = useState<MusicEngine>('udio');
  const [engineVersion, setEngineVersion] = useState('V7.5-PRO');
  const [duration, setDuration] = useState(30);
  
  // Track Details
  const [songTitle, setSongTitle] = useState('');
  const [styleInput, setStyleInput] = useState('');
  const [simplePrompt, setSimplePrompt] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isInstrumental, setIsInstrumental] = useState(false);
  const [vocalGender, setVocalGender] = useState<'male' | 'female' | 'none'>('female');

  // App UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [forgeHistory, setForgeHistory] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const addStyleTag = (tag: string) => {
      if (styleInput.includes(tag)) return;
      setStyleInput(prev => prev ? `${prev}, ${tag}` : tag);
  };

  const handleForge = async () => {
      const promptToUse = isCustomMode ? styleInput : simplePrompt;
      if (!promptToUse) return;
      
      setIsProcessing(true);

      const options: ForgeOptions = {
          engine: activeEngine,
          prompt: promptToUse,
          lyrics: isCustomMode && !isInstrumental ? lyrics : '',
          isInstrumental: isCustomMode ? isInstrumental : false,
          vocalGender: isCustomMode ? vocalGender : 'none',
          version: engineVersion,
          durationDesired: duration,
          styleTags: promptToUse.split(',').map(t => t.trim())
      };

      try {
          const result = await musicGenService.generate(options);
          const trackData = {
              ...result,
              title: songTitle || (isCustomMode ? result.title : "New Composition"),
              artist: user.displayName || 'Creator',
              image: result.imageUrl,
              isSaved: false
          };

          setForgeHistory(prev => [trackData, ...prev]);
          
          window.dispatchEvent(new CustomEvent('sf-notification', { 
              detail: { 
                  title: 'Forge Complete', 
                  message: `"${trackData.title}" is ready. Playback initialized.`,
                  image: trackData.image,
                  type: 'success'
              } 
          }));

          playTrack(trackData as any);
      } catch (e) {
          console.error(e);
      } finally {
          setIsProcessing(false);
      }
  };

  const saveToLibrary = async (track: any) => {
      try {
          await dataService.saveTrack(user.uid, track);
          setForgeHistory(prev => prev.map(t => t.id === track.id ? { ...t, isSaved: true } : t));
          window.dispatchEvent(new CustomEvent('sf-notification', { detail: { title: 'Saved', message: 'Added to your permanent collection.', type: 'info' } }));
      } catch (e) { alert("Save failed."); }
  };

  const toggleFavorite = (trackId: string) => {
      setFavorites(prev => prev.includes(trackId) ? prev.filter(id => id !== trackId) : [...prev, trackId]);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full lg:h-[calc(100vh-100px)] bg-slate-950 rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl transition-all duration-500">
        
        {/* LEFT: FORGE CONTROLS */}
        <div className="w-full lg:w-[450px] border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-900/40 overflow-y-auto custom-scrollbar flex flex-col p-6 lg:p-10 shrink-0 relative transition-all duration-500">
            
            {/* Header / Mode Switch */}
            <div className="flex items-center justify-between mb-10">
                <div 
                    onClick={() => setIsCustomMode(!isCustomMode)}
                    className={`p-1 rounded-2xl border transition-all flex items-center gap-3 px-5 py-2.5 cursor-pointer shadow-lg ${isCustomMode ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                >
                    <div className={`w-10 h-5 rounded-full p-0.5 transition-colors relative ${isCustomMode ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isCustomMode ? 'translate-x-5' : 'translate-x-0 shadow-sm'}`}></div>
                    </div>
                    <span className="text-xs font-black uppercase text-white tracking-[0.1em]">{isCustomMode ? 'Custom Mode' : 'Simple Mode'}</span>
                </div>

                <select 
                    value={engineVersion}
                    onChange={(e) => setEngineVersion(e.target.value)}
                    className="bg-black/40 border border-slate-800 rounded-xl px-4 py-2 text-[10px] font-black text-slate-400 focus:outline-none focus:border-indigo-500 uppercase tracking-widest"
                >
                    <option>V7.5-PRO</option>
                    <option>V4-LIT</option>
                </select>
            </div>

            {/* --- SIMPLE VIEW --- */}
            {!isCustomMode ? (
                <div className="flex-1 flex flex-col animate-in fade-in zoom-in-95 duration-500">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">What do you want to create?</h2>
                        <p className="text-slate-500 text-sm">Describe your vision in plain English. AI handles the rest.</p>
                    </div>

                    <div className="bg-slate-950/50 border-2 border-slate-800 rounded-[2rem] p-6 focus-within:border-indigo-500 transition-all shadow-2xl mb-8 group">
                        <textarea 
                            value={simplePrompt}
                            onChange={(e) => setSimplePrompt(e.target.value)}
                            placeholder="e.g. A lo-fi hip hop track with jazz piano and a rainy atmosphere..."
                            className="w-full bg-transparent border-none text-white text-lg font-medium focus:ring-0 h-40 resize-none placeholder:text-slate-800 scrollbar-hide"
                        />
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                            <button 
                                onClick={() => setSimplePrompt(SIMPLE_PROMPTS[Math.floor(Math.random() * SIMPLE_PROMPTS.length)])}
                                className="text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" /> Surprise Me
                            </button>
                            <span className="text-[10px] font-mono text-slate-700 uppercase">Neural Processing V7.5</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 block">Popular Vibes</label>
                        <div className="flex flex-wrap gap-2">
                            {["Energetic", "Melancholic", "Aggressive", "Lush", "Groovy"].map(vibe => (
                                <button 
                                    key={vibe}
                                    onClick={() => setSimplePrompt(prev => prev ? `${prev}, ${vibe}` : vibe)}
                                    className="px-4 py-2 bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold rounded-xl hover:border-indigo-500 hover:text-white transition-all active:scale-95"
                                >
                                    + {vibe}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto">
                        <div className="bg-indigo-500/5 rounded-2xl p-4 border border-indigo-500/10 mb-6">
                            <p className="text-[10px] text-indigo-400/80 leading-relaxed italic">
                                "Tip: Be specific about instruments and mood for high-fidelity results."
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                /* --- ADVANCED (CUSTOM) VIEW --- */
                <div className="flex-1 flex flex-col space-y-6 animate-in slide-in-from-left-4 duration-500">
                    {/* QUICK ACTIONS ROW */}
                    <div className="grid grid-cols-3 gap-2">
                        {['Reference', 'Vocals', 'Melody'].map((label, idx) => {
                            const Icon = [History, Mic, BrainCircuit][idx];
                            return (
                                <button key={label} className="flex flex-col items-center justify-center py-4 bg-black/20 border border-slate-800 rounded-2xl text-slate-500 hover:text-white hover:border-indigo-500 transition-all group active:scale-95">
                                    <Icon className="w-4 h-4 mb-2 group-hover:text-indigo-400 transition-colors" />
                                    <span className="text-[8px] font-black uppercase tracking-tighter">{label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* LYRICS BLOCK */}
                    <div className="bg-black/40 border border-slate-800 rounded-3xl p-5 relative group">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Lyrics</label>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] text-slate-600 font-bold uppercase">Inst</span>
                                <div 
                                    onClick={() => setIsInstrumental(!isInstrumental)}
                                    className={`w-7 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${isInstrumental ? 'bg-cyan-500' : 'bg-slate-800'}`}
                                >
                                    <div className={`w-3 h-3 bg-white rounded-full transition-transform ${isInstrumental ? 'translate-x-3' : 'translate-x-0'}`}></div>
                                </div>
                            </div>
                        </div>
                        <textarea 
                            value={lyrics}
                            onChange={(e) => setLyrics(e.target.value)}
                            disabled={isInstrumental}
                            placeholder={isInstrumental ? "Instrumental core engaged..." : "Enter lyrics here..."}
                            className="w-full bg-transparent border-none text-slate-200 text-sm focus:ring-0 h-32 lg:h-40 resize-none placeholder:text-slate-800 custom-scrollbar"
                        />
                        <div className="flex justify-between items-center mt-3 border-t border-white/5 pt-3">
                            <button className="text-[9px] font-black text-indigo-400 flex items-center gap-1 hover:text-white uppercase tracking-widest"><Sparkles className="w-3 h-3"/> AI Lyrics</button>
                            <span className="text-[8px] font-mono text-slate-700">{lyrics.length}/3000</span>
                        </div>
                    </div>

                    {/* STYLE BLOCK */}
                    <div className="bg-black/40 border border-slate-800 rounded-3xl p-5 group">
                        <div className="flex justify-between items-center mb-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Style Profile</label>
                            <button onClick={() => setStyleInput('')} className="text-slate-700 hover:text-white transition-colors"><RotateCcw className="w-3 h-3"/></button>
                        </div>
                        <textarea 
                            value={styleInput}
                            onChange={(e) => setStyleInput(e.target.value)}
                            placeholder="Describe your sonic vision..."
                            className="w-full bg-transparent border-none text-slate-200 text-sm focus:ring-0 h-20 resize-none placeholder:text-slate-800 custom-scrollbar"
                        />
                        <div className="flex flex-wrap gap-1.5 mt-4">
                            {STYLE_PRESETS.map(tag => (
                                <button 
                                    key={tag} 
                                    onClick={() => addStyleTag(tag)}
                                    className="text-[8px] font-black px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-500 hover:border-indigo-500 hover:text-white transition-all uppercase"
                                >
                                    + {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* PARAMETERS GRID */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl">
                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Duration</label>
                            <select 
                                value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value))}
                                className="w-full bg-transparent text-white font-bold text-xs outline-none cursor-pointer"
                            >
                                <option value={30} className="bg-slate-900">0:30 (Clip)</option>
                                <option value={60} className="bg-slate-900">1:00 (Post)</option>
                                <option value={120} className="bg-slate-900">2:00 (Full)</option>
                                <option value={180} className="bg-slate-900">3:00 (Radio)</option>
                            </select>
                        </div>
                        <div className="bg-black/40 border border-slate-800 p-3 rounded-2xl">
                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Gender</label>
                            <div className="flex gap-3 mt-0.5">
                                <button onClick={() => setVocalGender('female')} className={`text-[10px] font-black uppercase ${vocalGender === 'female' ? 'text-indigo-400' : 'text-slate-600'}`}>Female</button>
                                <button onClick={() => setVocalGender('male')} className={`text-[10px] font-black uppercase ${vocalGender === 'male' ? 'text-indigo-400' : 'text-slate-600'}`}>Male</button>
                            </div>
                        </div>
                        <div className="col-span-2 bg-black/40 border border-slate-800 p-4 rounded-2xl">
                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Song Title</label>
                            <input 
                                value={songTitle}
                                onChange={(e) => setSongTitle(e.target.value)}
                                placeholder="Untitled Project"
                                className="w-full bg-transparent border-none p-0 text-white font-black text-lg placeholder:text-slate-800 focus:ring-0 uppercase tracking-tight"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* MAIN FORGE BUTTON */}
            <button 
                onClick={handleForge}
                disabled={isProcessing || (isCustomMode ? !styleInput : !simplePrompt)}
                className={`w-full py-5 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-2xl flex items-center justify-center gap-3 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed sticky bottom-0 z-10 ${isCustomMode ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30' : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-purple-900/20'}`}
            >
                {isProcessing ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Neural Mining...</>
                ) : (
                    <><Zap className="w-5 h-5 fill-current" /> {isCustomMode ? 'Initialize Forge' : 'Create Music'}</>
                )}
            </button>
        </div>

        {/* RIGHT: LEDGER FEED */}
        <div className="flex-1 bg-slate-950 relative flex flex-col min-h-[500px]">
            <div className="h-16 lg:h-20 border-b border-slate-800 flex items-center justify-between px-6 lg:px-10 bg-black/20 backdrop-blur-xl shrink-0">
                <div className="flex items-center gap-4">
                    <h2 className="text-sm lg:text-lg font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Disc className={`w-5 h-5 text-indigo-500 ${isProcessing ? 'animate-spin' : ''}`} /> Production Ledger
                    </h2>
                </div>
                <div className="flex gap-2">
                     {['udio', 'suno'].map(e => (
                         <button 
                            key={e}
                            onClick={() => setActiveEngine(e as any)}
                            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${activeEngine === e ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                         >
                             {e}
                         </button>
                     ))}
                </div>
            </div>

            {/* FEED CONTAINER */}
            <div className="flex-1 overflow-y-auto p-5 lg:p-10 space-y-6 custom-scrollbar">
                {isProcessing && (
                    <div className="flex flex-col items-center justify-center py-24 text-center animate-pulse">
                        <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30 mb-8 shadow-2xl shadow-indigo-500/20">
                            <BrainCircuit className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-widest">Synthesizing Asset</h3>
                        <p className="text-slate-600 text-[10px] mt-2 font-mono uppercase">Connecting to {activeEngine.toUpperCase()} Core...</p>
                    </div>
                )}

                {forgeHistory.length === 0 && !isProcessing && (
                    <div className="h-full flex flex-col items-center justify-center text-slate-800 py-32 opacity-20">
                        <Disc className="w-20 h-20 mb-6" />
                        <p className="text-lg font-black uppercase tracking-[0.2em]">Forge Empty</p>
                        <p className="text-xs mt-2 uppercase tracking-widest">Ready for deployment</p>
                    </div>
                )}

                {forgeHistory.map((track, i) => {
                    const isFav = favorites.includes(track.id);
                    return (
                        <div key={track.id} className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden group animate-in slide-in-from-right-4 duration-500 shadow-xl hover:border-slate-700 transition-colors">
                            <div className="flex flex-col md:flex-row">
                                 {/* Artwork */}
                                 <div className="w-full md:w-56 aspect-square shrink-0 relative overflow-hidden">
                                     <img src={track.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                                     <div 
                                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                                        onClick={() => playTrack(track)}
                                     >
                                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl">
                                            <Play className="w-6 h-6 fill-black text-black ml-1" />
                                         </div>
                                     </div>
                                 </div>
                                 
                                 {/* Metadata */}
                                 <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between">
                                     <div>
                                         <div className="flex justify-between items-start mb-2">
                                             <h3 className="text-xl lg:text-2xl font-black text-white uppercase tracking-tighter truncate pr-4">{track.title}</h3>
                                             <div className="flex gap-2">
                                                 <button 
                                                    onClick={() => toggleFavorite(track.id)}
                                                    className={`p-2 rounded-xl border transition-all ${isFav ? 'bg-red-500/20 border-red-500 text-red-500' : 'bg-black/20 border-slate-800 text-slate-500 hover:text-white'}`}
                                                 >
                                                     <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                                                 </button>
                                                 <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20 shadow-lg">Mastered</span>
                                             </div>
                                         </div>
                                         <div className="flex flex-wrap gap-2 mb-6">
                                             {track.tags?.map((t: string) => (
                                                 <span key={t} className="text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-800 px-2 py-1 rounded-lg">#{t}</span>
                                             ))}
                                         </div>
                                     </div>

                                     <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                         <div className="flex items-center gap-6">
                                             <div>
                                                 <div className="text-[7px] font-black text-slate-600 uppercase mb-1 tracking-widest">Duration</div>
                                                 <div className="text-sm lg:text-lg font-mono font-bold text-white">{track.duration}</div>
                                             </div>
                                             <div>
                                                 <div className="text-[7px] font-black text-slate-600 uppercase mb-1 tracking-widest">Loudness</div>
                                                 <div className="text-sm lg:text-lg font-mono font-bold text-cyan-400">-9.2 <span className="text-[10px] text-slate-600 uppercase">LUFS</span></div>
                                             </div>
                                         </div>
                                         <div className="flex gap-2">
                                             {!track.isSaved ? (
                                                 <button 
                                                    onClick={() => saveToLibrary(track)}
                                                    className="px-5 py-2.5 bg-white text-slate-950 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-slate-200 transition-all shadow-xl"
                                                 >
                                                     <BookmarkPlus className="w-4 h-4" /> Add to Library
                                                 </button>
                                             ) : (
                                                 <div className="px-5 py-2.5 bg-green-500/20 text-green-400 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 border border-green-500/20">
                                                     <CheckCircle2 className="w-4 h-4" /> Secured
                                                 </div>
                                             )}
                                             <button className="p-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all border border-slate-700 active:scale-90">
                                                 <Share className="w-4 h-4" />
                                             </button>
                                             <button className="p-2.5 bg-slate-800 hover:bg-red-600 text-white rounded-xl transition-all border border-slate-700 active:scale-90">
                                                 <Trash2 className="w-4 h-4" />
                                             </button>
                                         </div>
                                     </div>
                                 </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
