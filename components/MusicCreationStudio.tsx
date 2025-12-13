
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wand2, Play, Download, Music2, Mic2, Loader2, Layers, Plus, Volume2, Upload, StopCircle, Square, Circle, PenTool, Save, Mic, Sliders, FileText, MessageSquare, Copy, Scissors, Split, Trash2, ZoomIn, ZoomOut, Grid, MousePointer2, Repeat, ChevronRight, Settings, GripVertical } from 'lucide-react';
import { generateMusicTrack, generateElevenLabsVocals, convertVoiceWithKits, getKitsVoiceModels, separateAudioWithKits } from '../services/audioService';
import { generateSongStructure, generateCustomPitch } from '../services/geminiService';
import { User, KitsVoiceModel } from '../types';

interface MusicCreationStudioProps {
  user: User;
  onUpgrade: () => void;
}

interface AudioClip {
    id: string;
    name: string;
    audioUrl: string;
    start: number; // Start time in seconds
    duration: number; // Duration in seconds
    offset: number; // Offset into the audio file (trim start)
    color?: string;
    buffer?: AudioBuffer; // Cache the decoded buffer
}

interface TimelineTrack {
    id: string;
    name: string;
    type: 'beat' | 'vocal' | 'recording' | 'instrument';
    color: string;
    clips: AudioClip[];
    muted: boolean;
    solo: boolean;
    volume: number;
}

const MUSICAL_KEYS = ['C Maj', 'C Min', 'C# Maj', 'C# Min', 'D Maj', 'D Min', 'Eb Maj', 'Eb Min', 'E Maj', 'E Min', 'F Maj', 'F Min', 'F# Maj', 'F# Min', 'G Maj', 'G Min', 'Ab Maj', 'Ab Min', 'A Maj', 'A Min', 'Bb Maj', 'Bb Min', 'B Maj', 'B Min'];
const STRUCTURES = ['Loop (No Structure)', 'Verse - Chorus', 'Verse - Chorus - Bridge', 'Intro - Drop - Outro', 'Cinematic Build-up'];

export const MusicCreationStudio: React.FC<MusicCreationStudioProps> = ({ user, onUpgrade }) => {
  // --- DAW STATE ---
  const [tracks, setTracks] = useState<TimelineTrack[]>([
      { id: 't1', name: 'Beat / Drums', type: 'beat', color: 'bg-emerald-500', clips: [], muted: false, solo: false, volume: 0.8 },
      { id: 't2', name: 'Bass / 808', type: 'instrument', color: 'bg-purple-500', clips: [], muted: false, solo: false, volume: 0.8 },
      { id: 't3', name: 'Vocals (Main)', type: 'vocal', color: 'bg-cyan-500', clips: [], muted: false, solo: false, volume: 0.9 },
      { id: 't4', name: 'Vocals (Back)', type: 'vocal', color: 'bg-blue-500', clips: [], muted: false, solo: false, volume: 0.7 },
  ]);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0); // Current time in seconds
  const [zoom, setZoom] = useState(50); // Pixels per second
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [bpm, setBpm] = useState(120);
  const [isLooping, setIsLooping] = useState(false);
  const [loopRegion, setLoopRegion] = useState<{start: number, end: number}>({start: 0, end: 8});
  
  // Interaction State
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  
  // Dragging State
  const [dragging, setDragging] = useState<{
      type: 'move' | 'resize';
      clipId: string;
      trackId: string;
      startX: number;
      originalValue: number; // original start time (move) or duration (resize)
  } | null>(null);

  // Audio Engine Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const trackNodesRef = useRef<Map<string, { gain: GainNode, sources: AudioBufferSourceNode[] }>>(new Map());
  const nextStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0); // When playback started relative to AudioContext time

  // Tools State
  const [activeTool, setActiveTool] = useState<'lyrics' | 'beat' | 'voice' | 'settings'>('beat');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [lyrics, setLyrics] = useState('');

  // --- AUDIO ENGINE INITIALIZATION ---
  useEffect(() => {
      const initAudio = () => {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioContextClass();
          const master = ctx.createGain();
          master.connect(ctx.destination);
          
          audioContextRef.current = ctx;
          masterGainRef.current = master;
      };
      initAudio();

      return () => {
          stopPlayback();
          if (audioContextRef.current) audioContextRef.current.close();
      };
  }, []);

  // --- PLAYBACK LOGIC ---
  const stopPlayback = () => {
      trackNodesRef.current.forEach(track => {
          track.sources.forEach(src => {
              try { src.stop(); } catch(e) {}
          });
          track.sources = [];
      });
      cancelAnimationFrame(animationFrameRef.current);
      setIsPlaying(false);
  };

  const startPlayback = async () => {
      if (!audioContextRef.current || !masterGainRef.current) return;
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') await ctx.resume();

      // Stop existing sounds
      stopPlayback();

      startTimeRef.current = ctx.currentTime - playhead;
      
      // Schedule Clips
      tracks.forEach(track => {
          if (track.muted) return;

          // Create Track Gain if missing
          let trackNode = trackNodesRef.current.get(track.id);
          if (!trackNode) {
              const gain = ctx.createGain();
              gain.connect(masterGainRef.current!);
              trackNode = { gain, sources: [] };
              trackNodesRef.current.set(track.id, trackNode);
          }
          trackNode.gain.gain.value = track.volume;

          track.clips.forEach(async (clip) => {
              if (!clip.buffer) {
                  // Decode on the fly if needed (better to pre-load, but this works for demo)
                  try {
                      const resp = await fetch(clip.audioUrl);
                      const arr = await resp.arrayBuffer();
                      clip.buffer = await ctx.decodeAudioData(arr);
                  } catch (e) { console.error("Failed to decode", clip.name); return; }
              }

              if (clip.buffer) {
                  // Calculate play timing
                  // If clip starts in the future relative to playhead:
                  if (clip.start >= playhead) {
                      const source = ctx.createBufferSource();
                      source.buffer = clip.buffer;
                      source.connect(trackNode!.gain);
                      
                      const when = ctx.currentTime + (clip.start - playhead);
                      source.start(when, clip.offset, clip.duration);
                      trackNode!.sources.push(source);
                  } 
                  // If clip is currently overlapping playhead:
                  else if (clip.start + clip.duration > playhead) {
                      const source = ctx.createBufferSource();
                      source.buffer = clip.buffer;
                      source.connect(trackNode!.gain);
                      
                      const startOffset = playhead - clip.start + clip.offset;
                      const durationRemaining = clip.duration - (playhead - clip.start);
                      
                      source.start(ctx.currentTime, startOffset, durationRemaining);
                      trackNode!.sources.push(source);
                  }
              }
          });
      });

      setIsPlaying(true);
      
      // Animation Loop
      const animate = () => {
          const current = ctx.currentTime - startTimeRef.current;
          
          if (isLooping && current >= loopRegion.end) {
              // Simple Loop implementation: Restart
              stopPlayback();
              setPlayhead(loopRegion.start);
              setTimeout(() => startPlayback(), 10); // Tiny delay to prevent stack overflow
              return;
          }

          setPlayhead(current);
          animationFrameRef.current = requestAnimationFrame(animate);
      };
      animationFrameRef.current = requestAnimationFrame(animate);
  };

  const togglePlay = () => {
      if (isPlaying) {
          stopPlayback();
      } else {
          startPlayback();
      }
  };

  // --- CLIP ACTIONS ---

  const handleDuplicate = () => {
      if (!selectedClipId) return;
      
      setTracks(prev => prev.map(t => {
          const clipToDup = t.clips.find(c => c.id === selectedClipId);
          if (!clipToDup) return t;

          const newClip: AudioClip = {
              ...clipToDup,
              id: `c_${Date.now()}`,
              start: clipToDup.start + clipToDup.duration // Place immediately after
          };
          
          return {
              ...t,
              clips: [...t.clips, newClip]
          };
      }));
  };

  const handleSplit = () => {
      if (!selectedClipId) return;

      setTracks(prev => prev.map(t => {
          const clipIndex = t.clips.findIndex(c => c.id === selectedClipId);
          if (clipIndex === -1) return t;

          const clip = t.clips[clipIndex];
          
          // Check if playhead is inside clip
          if (playhead <= clip.start || playhead >= clip.start + clip.duration) {
              alert("Place playhead inside the clip to split.");
              return t;
          }

          const splitPointRelative = playhead - clip.start;
          
          // Create Left Clip
          const leftClip: AudioClip = {
              ...clip,
              duration: splitPointRelative
          };

          // Create Right Clip
          const rightClip: AudioClip = {
              ...clip,
              id: `c_${Date.now()}`,
              start: playhead,
              offset: clip.offset + splitPointRelative,
              duration: clip.duration - splitPointRelative
          };

          const newClips = [...t.clips];
          newClips.splice(clipIndex, 1, leftClip, rightClip);

          return { ...t, clips: newClips };
      }));
      
      setSelectedClipId(null); // Deselect after split
  };

  const handleDeleteClip = () => {
      if (!selectedClipId) return;
      setTracks(prev => prev.map(t => ({
          ...t,
          clips: t.clips.filter(c => c.id !== selectedClipId)
      })));
      setSelectedClipId(null);
  };

  // --- DRAG & DROP LOGIC ---

  const handleMouseDown = (e: React.MouseEvent, trackId: string, clipId: string, type: 'move' | 'resize', value: number) => {
      e.stopPropagation();
      e.preventDefault(); // Prevent text selection
      setSelectedClipId(clipId);
      
      setDragging({
          type,
          trackId,
          clipId,
          startX: e.clientX,
          originalValue: value
      });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (!dragging) return;

      const deltaPixels = e.clientX - dragging.startX;
      const deltaSeconds = deltaPixels / zoom;
      
      if (dragging.type === 'move') {
          let newStart = Math.max(0, dragging.originalValue + deltaSeconds);

          // Snap to Grid (assuming 4/4 time, snap to 1/4 notes)
          if (snapToGrid) {
              const beatDuration = 60 / bpm;
              newStart = Math.round(newStart / beatDuration) * beatDuration;
          }

          setTracks(prev => prev.map(t => {
              if (t.id === dragging.trackId) {
                  return {
                      ...t,
                      clips: t.clips.map(c => c.id === dragging.clipId ? { ...c, start: newStart } : c)
                  };
              }
              return t;
          }));
      } else if (dragging.type === 'resize') {
          let newDuration = Math.max(0.1, dragging.originalValue + deltaSeconds);
          
          // Snap duration to grid if enabled
          if (snapToGrid) {
              const beatDuration = 60 / bpm;
              // Round to nearest beat fraction
              newDuration = Math.round(newDuration / (beatDuration/2)) * (beatDuration/2);
              newDuration = Math.max(0.1, newDuration);
          }

          setTracks(prev => prev.map(t => {
              if (t.id === dragging.trackId) {
                  return {
                      ...t,
                      clips: t.clips.map(c => c.id === dragging.clipId ? { ...c, duration: newDuration } : c)
                  };
              }
              return t;
          }));
      }
  };

  const handleMouseUp = () => {
      setDragging(null);
  };

  // --- GENERATORS ---
  const addGeneratedClip = async (trackId: string, url: string, name: string) => {
      // Decode immediately to get duration
      if (!audioContextRef.current) return;
      try {
          const resp = await fetch(url);
          const buff = await resp.arrayBuffer();
          const audioBuffer = await audioContextRef.current.decodeAudioData(buff);
          
          const newClip: AudioClip = {
              id: `c_${Date.now()}`,
              name,
              audioUrl: url,
              start: playhead, // Place at playhead
              duration: audioBuffer.duration,
              offset: 0,
              buffer: audioBuffer,
              color: tracks.find(t => t.id === trackId)?.color || 'bg-slate-500'
          };

          setTracks(prev => prev.map(t => 
              t.id === trackId ? { ...t, clips: [...t.clips, newClip] } : t
          ));
      } catch (e) {
          console.error("Failed to add clip", e);
      }
  };

  const handleGenerateBeat = async () => {
      if (!prompt) return;
      setIsProcessing(true);
      try {
          // Pass valid or empty key. Service handles fallback.
          const track = await generateMusicTrack(prompt, 15, "Beat", elevenLabsKey);
          if (track.audioUrl) {
              await addGeneratedClip('t1', track.audioUrl, track.title);
          }
      } catch (e) { alert("Generation failed"); }
      setIsProcessing(false);
  };

  const handleGenerateLyrics = async () => {
      setIsProcessing(true);
      const res = await generateSongStructure(prompt || "Love song", "Pop", "Happy");
      setLyrics(res.lyrics);
      setIsProcessing(false);
  };

  const handleTTS = async () => {
      if (!lyrics) return;
      setIsProcessing(true);
      try {
          const url = await generateElevenLabsVocals(lyrics.slice(0, 200), "21m00Tcm4TlvDq8ikWAM", elevenLabsKey); // Default voice
          if (url) await addGeneratedClip('t3', url, "AI Vocals");
      } catch (e) { alert("TTS Failed"); }
      setIsProcessing(false);
  };

  // --- RENDER HELPERS ---
  const formatTime = (s: number) => {
      const min = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      const ms = Math.floor((s % 1) * 10);
      return `${min}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  return (
    <div 
        className="flex flex-col h-[calc(100vh-100px)] bg-slate-950 font-sans select-none rounded-xl overflow-hidden border border-slate-800"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onKeyDown={(e) => { if(e.key === 'Delete' || e.key === 'Backspace') handleDeleteClip(); }}
        tabIndex={0} // Allow div to catch keyboard events
    >
        {/* TOP BAR */}
        <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-4">
                <div className="bg-slate-800 p-1 rounded-lg flex gap-1">
                    <button onClick={togglePlay} className={`p-2 rounded-md ${isPlaying ? 'bg-cyan-500 text-black' : 'text-white hover:bg-slate-700'}`}>
                        {isPlaying ? <Square className="w-4 h-4 fill-current"/> : <Play className="w-4 h-4 fill-current"/>}
                    </button>
                    <button onClick={() => { stopPlayback(); setPlayhead(0); }} className="p-2 text-white hover:bg-slate-700 rounded-md">
                        <StopCircle className="w-4 h-4"/>
                    </button>
                    <button onClick={() => setIsLooping(!isLooping)} className={`p-2 rounded-md ${isLooping ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-400'}`}>
                        <Repeat className="w-4 h-4"/>
                    </button>
                </div>
                
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded border border-slate-800 font-mono text-cyan-400">
                    <span className="text-xl font-bold">{formatTime(playhead)}</span>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-500">BPM</span>
                    <input type="number" value={bpm} onChange={e => setBpm(Number(e.target.value))} className="w-12 bg-slate-800 border border-slate-700 rounded p-1 text-xs text-white text-center"/>
                </div>
            </div>

            {/* ACTION TOOLBAR (When clip selected) */}
            {selectedClipId && (
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 animate-in fade-in slide-in-from-top-2">
                    <button onClick={handleSplit} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded" title="Split Clip">
                        <Scissors className="w-4 h-4" />
                    </button>
                    <button onClick={handleDuplicate} className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded" title="Duplicate Clip">
                        <Copy className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-600 mx-1"></div>
                    <button onClick={handleDeleteClip} className="p-1.5 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex items-center gap-3">
                <div className="flex items-center bg-slate-800 rounded-lg p-1">
                    <button onClick={() => setZoom(z => Math.max(10, z-10))}><ZoomOut className="w-4 h-4 text-slate-400 m-1"/></button>
                    <button onClick={() => setZoom(z => Math.min(200, z+10))}><ZoomIn className="w-4 h-4 text-slate-400 m-1"/></button>
                </div>
                <button 
                    onClick={() => setSnapToGrid(!snapToGrid)} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${snapToGrid ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50' : 'text-slate-400 border border-slate-700'}`}
                >
                    <Grid className="w-3 h-3"/> Snap
                </button>
                <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2">
                    <Download className="w-3 h-3"/> Export
                </button>
            </div>
        </div>

        {/* MAIN WORKSPACE */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* LEFT SIDEBAR: TOOLS */}
            <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
                <div className="flex border-b border-slate-800">
                    {[{id: 'beat', icon: Music2}, {id: 'lyrics', icon: FileText}, {id: 'voice', icon: Mic}, {id: 'settings', icon: Settings}].map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setActiveTool(t.id as any)}
                            className={`flex-1 py-3 flex justify-center ${activeTool === t.id ? 'border-b-2 border-cyan-500 text-cyan-400 bg-slate-800/50' : 'text-slate-500 hover:text-white'}`}
                        >
                            <t.icon className="w-4 h-4"/>
                        </button>
                    ))}
                </div>
                
                <div className="flex-1 p-4 overflow-y-auto">
                    {activeTool === 'beat' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase">AI Beat Generator</h3>
                            <textarea 
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="Describe your beat (e.g. Dark Trap 140BPM)"
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white h-24 focus:border-cyan-500 outline-none resize-none"
                            />
                            <button 
                                onClick={handleGenerateBeat}
                                disabled={isProcessing}
                                className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded font-bold text-xs flex items-center justify-center gap-2"
                            >
                                {isProcessing ? <Loader2 className="w-3 h-3 animate-spin"/> : <Wand2 className="w-3 h-3"/>}
                                Generate Beat
                            </button>
                            <div className="p-3 bg-slate-800 rounded border border-slate-700 text-[10px] text-slate-400">
                                Tip: The beat will be placed at the playhead position on the "Beat" track.
                            </div>
                        </div>
                    )}

                    {activeTool === 'lyrics' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase">AI Songwriter</h3>
                            <input 
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                placeholder="Song Topic..."
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white outline-none"
                            />
                            <button 
                                onClick={handleGenerateLyrics}
                                disabled={isProcessing}
                                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded font-bold text-xs"
                            >
                                Write Lyrics
                            </button>
                            <textarea 
                                value={lyrics}
                                onChange={e => setLyrics(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300 h-40 resize-none font-mono"
                                placeholder="Lyrics output..."
                            />
                            <button 
                                onClick={handleTTS}
                                disabled={!lyrics}
                                className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-bold text-xs flex items-center justify-center gap-2"
                            >
                                <Mic2 className="w-3 h-3"/> Convert to Audio
                            </button>
                        </div>
                    )}
                    
                    {activeTool === 'settings' && (
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase">Project Settings</h3>
                            <div>
                                <label className="text-[10px] text-slate-500">ElevenLabs API Key</label>
                                <input 
                                    type="password" 
                                    value={elevenLabsKey}
                                    onChange={e => setElevenLabsKey(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TIMELINE AREA */}
            <div className="flex-1 flex flex-col bg-slate-950 relative overflow-hidden">
                
                {/* RULER */}
                <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-end relative overflow-hidden" style={{ paddingLeft: '192px' }}>
                    <div className="absolute top-0 bottom-0 left-[192px] right-0 overflow-hidden" style={{ transform: `translateX(${-playhead * zoom + (window.innerWidth / 2 - 300)}px)` }}> 
                        {/* Note: Simplified scroll logic for demo. Ideally synced with scroll container below */}
                    </div>
                    {/* Static Ruler Mockup for Demo Vis */}
                    {Array.from({length: 100}).map((_, i) => (
                        <div key={i} className="absolute bottom-0 border-l border-slate-700 h-3 text-[9px] text-slate-500 pl-1" style={{ left: `${i * zoom * 2}px` }}>
                            {i}
                        </div>
                    ))}
                </div>

                <div 
                    className="flex-1 overflow-auto custom-scrollbar relative bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]"
                    onClick={() => setSelectedClipId(null)}
                >
                    {/* Playhead Line */}
                    <div 
                        className="absolute top-0 bottom-0 w-px bg-red-500 z-30 pointer-events-none"
                        style={{ left: `${playhead * zoom + 192}px` }}
                    >
                        <div className="w-3 h-3 -ml-1.5 bg-red-500 rotate-45 -mt-1.5"></div>
                    </div>

                    {/* Tracks */}
                    {tracks.map(track => (
                        <div key={track.id} className="flex h-24 border-b border-slate-800 bg-slate-900/40 relative group/track">
                            
                            {/* Track Header */}
                            <div className="w-48 bg-slate-900 border-r border-slate-800 p-3 shrink-0 flex flex-col justify-between sticky left-0 z-20 shadow-md">
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${track.color}`}></div>
                                    <span className="text-xs font-bold text-white truncate">{track.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={() => setTracks(prev => prev.map(t => t.id === track.id ? {...t, muted: !t.muted} : t))}
                                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${track.muted ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'}`}
                                    >M</button>
                                    <button 
                                        onClick={() => setTracks(prev => prev.map(t => t.id === track.id ? {...t, solo: !t.solo} : t))}
                                        className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${track.solo ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-400'}`}
                                    >S</button>
                                    <input 
                                        type="range" min="0" max="1" step="0.1" 
                                        value={track.volume}
                                        onChange={(e) => setTracks(prev => prev.map(t => t.id === track.id ? {...t, volume: parseFloat(e.target.value)} : t))}
                                        className="w-16 h-1 bg-slate-700 rounded appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            {/* Track Lane */}
                            <div className="flex-1 relative min-w-[2000px]">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]" style={{ backgroundSize: `${zoom}px 100%` }}></div>

                                {track.clips.map(clip => (
                                    <div
                                        key={clip.id}
                                        onMouseDown={(e) => handleMouseDown(e, track.id, clip.id, 'move', clip.start)}
                                        className={`absolute top-1 bottom-1 rounded-md overflow-hidden cursor-move border border-white/20 hover:border-white/50 transition-colors shadow-sm select-none group/clip ${selectedClipId === clip.id ? 'ring-2 ring-white z-10' : ''} ${clip.color || track.color.replace('bg-', 'bg-opacity-40 bg-')}`}
                                        style={{
                                            left: `${clip.start * zoom}px`,
                                            width: `${Math.max(2, clip.duration * zoom)}px`
                                        }}
                                    >
                                        <div className="bg-black/20 px-2 py-1 flex justify-between items-center relative z-10 pointer-events-none">
                                            <span className="text-[10px] font-bold text-white truncate max-w-[80%]">{clip.name}</span>
                                        </div>
                                        
                                        {/* Simulated Waveform Canvas */}
                                        <div className="absolute inset-0 top-5 opacity-60 flex items-center gap-px px-1 pointer-events-none">
                                            {Array.from({length: Math.min(50, Math.floor(clip.duration * 5))}).map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className="flex-1 bg-white rounded-full" 
                                                    style={{ height: `${Math.random() * 80 + 10}%` }}
                                                ></div>
                                            ))}
                                        </div>

                                        {/* Resize Handle (Right) */}
                                        <div 
                                            onMouseDown={(e) => handleMouseDown(e, track.id, clip.id, 'resize', clip.duration)}
                                            className="absolute top-0 bottom-0 right-0 w-4 cursor-e-resize hover:bg-white/20 flex items-center justify-center z-20 transition-colors"
                                        >
                                            <GripVertical className="w-3 h-3 text-white/50" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    
                    {/* Add Track Button */}
                    <div className="p-4">
                        <button 
                            onClick={() => setTracks([...tracks, { id: `t${tracks.length+1}`, name: 'New Track', type: 'instrument', color: 'bg-slate-500', clips: [], muted: false, solo: false, volume: 0.8 }])}
                            className="flex items-center gap-2 text-slate-500 hover:text-white text-xs font-bold transition-colors"
                        >
                            <Plus className="w-4 h-4"/> Add Track
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
