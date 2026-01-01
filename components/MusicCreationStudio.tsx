
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Square, Mic, Settings, Scissors, Plus, Trash2, Clock, Save, Volume2, Layers, Wand2, Sparkles, Send, Loader2, Music, Download, ChevronRight, ChevronDown, Grid, Undo, Redo, History, Disc, FileAudio, Circle, X, Edit2, SlidersHorizontal, ArrowLeftRight } from 'lucide-react';
import { generateMusicTrack, generateElevenLabsVocals, convertVoiceWithKits, separateAudioWithKits } from '../services/audioService';
import { chatWithGemini, enhanceMusicPrompt, generateSongStructure } from '../services/geminiService';
import { User, Stats } from '../types';

interface MusicCreationStudioProps {
  user: User;
  onUpgrade: () => void;
}

// --- TYPES ---
interface AudioClip {
    id: string;
    name: string;
    audioUrl: string;
    start: number; // Start time in seconds
    duration: number; // Duration in seconds
    color: string;
    pitch: number; // -12 to +12 semitones
    volume: number; // 0 to 1
    type?: 'recording' | 'generated' | 'upload';
}

interface TimelineTrack {
    id: string;
    name: string;
    type: 'audio' | 'midi' | 'vocal';
    clips: AudioClip[];
    muted: boolean;
    solo: boolean;
    volume: number;
    pan: number; // -1 to 1
    color: string;
    isArmed?: boolean; // For recording
}

interface CopilotMessage {
    id: string;
    role: 'user' | 'agent';
    text: string;
    type?: 'text' | 'action' | 'error';
    actionData?: any; 
}

// --- CUSTOM HOOK: ROBUST UNDO/REDO ---
function useUndoRedo<T>(initialState: T) {
    const [history, setHistory] = useState({
        past: [] as T[],
        present: initialState,
        future: [] as T[]
    });

    const canUndo = history.past.length > 0;
    const canRedo = history.future.length > 0;

    const undo = useCallback(() => {
        setHistory(curr => {
            if (curr.past.length === 0) return curr;
            const previous = curr.past[curr.past.length - 1];
            const newPast = curr.past.slice(0, curr.past.length - 1);
            return {
                past: newPast,
                present: previous,
                future: [curr.present, ...curr.future]
            };
        });
    }, []);

    const redo = useCallback(() => {
        setHistory(curr => {
            if (curr.future.length === 0) return curr;
            const next = curr.future[0];
            const newFuture = curr.future.slice(1);
            return {
                past: [...curr.past, curr.present],
                present: next,
                future: newFuture
            };
        });
    }, []);

    const set = useCallback((newPresentOrFn: T | ((prev: T) => T)) => {
        setHistory(curr => {
            const nextPresent = typeof newPresentOrFn === 'function' 
                ? (newPresentOrFn as (prev: T) => T)(curr.present) 
                : newPresentOrFn;
            
            if (JSON.stringify(nextPresent) === JSON.stringify(curr.present)) return curr;

            return {
                past: [...curr.past, curr.present].slice(-50), 
                present: nextPresent,
                future: []
            };
        });
    }, []);

    return { state: history.present, set, undo, redo, canUndo, canRedo };
}

// --- UTILS ---
const INITIAL_TRACKS: TimelineTrack[] = [
    { id: 't1', name: 'Drum Rack', type: 'audio', clips: [], muted: false, solo: false, volume: 0.8, pan: 0, color: 'bg-cyan-500' },
    { id: 't2', name: 'Inst Synth', type: 'audio', clips: [], muted: false, solo: false, volume: 0.8, pan: 0, color: 'bg-purple-500' },
    { id: 't3', name: 'Vox Lead', type: 'vocal', clips: [], muted: false, solo: false, volume: 1.0, pan: 0, color: 'bg-pink-500', isArmed: true },
];

const ELEVENLABS_VOICES = [
    { id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel (American)" },
    { id: "AZnzlk1XvdvUeBnXmlld", name: "Domi (Deep)" },
    { id: "EXAVITQu4vr4xnSDxMaL", name: "Bella (Soft)" },
    { id: "ErXwobaYiN019PkySvjV", name: "Antoni (Energetic)" },
    { id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli (British)" },
];

export const MusicCreationStudio: React.FC<MusicCreationStudioProps> = ({ user, onUpgrade }) => {
  // DAW State
  const { state: tracks, set: setTracks, undo, redo, canUndo, canRedo } = useUndoRedo<TimelineTrack[]>(INITIAL_TRACKS);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [zoom, setZoom] = useState(50); 
  const [bpm, setBpm] = useState(128);
  
  // Selection State
  const [selectedClip, setSelectedClip] = useState<{trackId: string, clipId: string} | null>(null);

  // Settings
  const [showSettings, setShowSettings] = useState(false);
  const [apiKeys, setApiKeys] = useState({
      elevenLabs: localStorage.getItem('sf_elevenlabs_key') || '',
      kitsAi: localStorage.getItem('sf_kits_key') || ''
  });

  // Copilot State
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState<CopilotMessage[]>([
      { id: '1', role: 'agent', text: "Ready to produce. I can generate beats, vocals, and provide mixing advice. How can I help with your session today?" }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Lyrics Editor Modal State
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [lyricsToEdit, setLyricsToEdit] = useState('');
  const [selectedVoice, setSelectedVoice] = useState(ELEVENLABS_VOICES[0].id);

  // Audio Engine Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number>(0);

  const saveKeys = () => {
      localStorage.setItem('sf_elevenlabs_key', apiKeys.elevenLabs);
      localStorage.setItem('sf_kits_key', apiKeys.kitsAi);
      setShowSettings(false);
      setCopilotMessages(prev => [...prev, { id: `sys_${Date.now()}`, role: 'agent', text: 'Infrastructure keys secured. High-fidelity engines enabled.' }]);
  };

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.code === 'Space' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
              e.preventDefault();
              togglePlay();
          }
          if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
              e.preventDefault();
              if (e.shiftKey) redo(); else undo();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, isPlaying]);

  useEffect(() => {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      return () => {
          stopPlayback();
          if (audioContextRef.current) audioContextRef.current.close();
      };
  }, []);

  const loadAudioBuffer = async (url: string): Promise<AudioBuffer> => {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      if (!audioContextRef.current) throw new Error("No Audio Context");
      return await audioContextRef.current.decodeAudioData(arrayBuffer);
  };

  const playPlayback = async () => {
      if (!audioContextRef.current) return;
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();

      const ctx = audioContextRef.current;
      startTimeRef.current = ctx.currentTime - currentTime;
      
      const playPromises = tracks.flatMap(track => {
          if (track.muted) return [];
          return track.clips.map(async (clip) => {
              const clipEnd = clip.start + clip.duration;
              if (currentTime < clipEnd) {
                  try {
                      const buffer = await loadAudioBuffer(clip.audioUrl);
                      const source = ctx.createBufferSource();
                      source.buffer = buffer;
                      source.playbackRate.value = Math.pow(2, clip.pitch / 12);

                      const gainNode = ctx.createGain();
                      gainNode.gain.value = track.volume * clip.volume;
                      
                      const pannerNode = ctx.createStereoPanner();
                      pannerNode.pan.value = track.pan;

                      source.connect(gainNode);
                      gainNode.connect(pannerNode);
                      pannerNode.connect(ctx.destination);
                      
                      let startOffset = 0; 
                      let whenToPlay = 0;  
                      
                      if (currentTime < clip.start) {
                          whenToPlay = ctx.currentTime + (clip.start - currentTime);
                          startOffset = 0;
                      } else {
                          whenToPlay = ctx.currentTime;
                          startOffset = (currentTime - clip.start) * source.playbackRate.value;
                      }

                      source.start(whenToPlay, startOffset);
                      sourceNodesRef.current.set(clip.id, source);
                      source.onended = () => sourceNodesRef.current.delete(clip.id);
                  } catch (e) {
                      console.error(`Failed to play clip`, e);
                  }
              }
          });
      });

      await Promise.all(playPromises);
      setIsPlaying(true);
      
      const draw = () => {
          setCurrentTime(ctx.currentTime - startTimeRef.current);
          animationFrameRef.current = requestAnimationFrame(draw);
      };
      draw();
  };

  const stopPlayback = () => {
      sourceNodesRef.current.forEach(node => { try { node.stop(); } catch(e) {} });
      sourceNodesRef.current.clear();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setIsPlaying(false);
  };

  const togglePlay = () => {
      if (isPlaying) stopPlayback();
      else playPlayback();
  };

  const startRecording = async () => {
      if (!audioContextRef.current) return;
      if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();

      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorderRef.current = new MediaRecorder(stream);
          audioChunksRef.current = [];

          mediaRecorderRef.current.ondataavailable = (e) => {
              if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };

          mediaRecorderRef.current.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
              const audioUrl = URL.createObjectURL(audioBlob);
              const duration = (Date.now() - recordingStartTimeRef.current) / 1000;
              
              const armedTrack = tracks.find(t => t.isArmed) || tracks[2];
              const newClip: AudioClip = {
                  id: `rec_${Date.now()}`,
                  name: `Recording ${new Date().toLocaleTimeString()}`,
                  audioUrl,
                  start: Math.max(0, currentTime - duration),
                  duration,
                  color: 'bg-red-500',
                  pitch: 0,
                  volume: 1.0,
                  type: 'recording'
              };
              
              setTracks(prev => prev.map(t => t.id === armedTrack.id ? { ...t, clips: [...t.clips, newClip] } : t));
              stream.getTracks().forEach(track => track.stop());
          };

          if (!isPlaying) playPlayback();
          
          recordingStartTimeRef.current = Date.now();
          mediaRecorderRef.current.start();
          setIsRecording(true);

      } catch (err) {
          console.error("Mic Error:", err);
          alert("Could not access microphone.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          stopPlayback();
      }
  };

  const toggleRecording = () => {
      if (isRecording) stopRecording();
      else startRecording();
  };

  const handleTrackPropertyChange = (trackId: string, property: 'volume' | 'pan' | 'muted' | 'solo' | 'isArmed', value: any) => {
      setTracks(ts => ts.map(t => t.id === trackId ? { ...t, [property]: value } : t));
  };

  const handleDeleteClip = (trackId: string, clipId: string) => {
      setTracks(ts => ts.map(t => t.id === trackId ? { ...t, clips: t.clips.filter(c => c.id !== clipId) } : t));
      if (selectedClip?.clipId === clipId) setSelectedClip(null);
  };

  const handleClipPropertyChange = (trackId: string, clipId: string, property: 'start' | 'pitch' | 'volume' | 'name', value: any) => {
      setTracks(ts => ts.map(t => t.id === trackId ? { 
          ...t, 
          clips: t.clips.map(c => c.id === clipId ? { ...c, [property]: value } : c) 
      } : t));
  };

  const handleSplitClip = (trackId: string, clipId: string) => {
      setTracks(ts => ts.map(t => {
          if (t.id !== trackId) return t;
          const clipIndex = t.clips.findIndex(c => c.id === clipId);
          if (clipIndex === -1) return t;
          
          const clip = t.clips[clipIndex];
          const splitPoint = currentTime - clip.start;
          
          if (splitPoint <= 0 || splitPoint >= clip.duration) {
              return t; 
          }

          const clipA: AudioClip = { ...clip, id: `${clip.id}_a`, duration: splitPoint };
          const clipB: AudioClip = { ...clip, id: `${clip.id}_b`, start: currentTime, duration: clip.duration - splitPoint };
          
          const newClips = [...t.clips];
          newClips.splice(clipIndex, 1, clipA, clipB);
          return { ...t, clips: newClips };
      }));
      setSelectedClip(null);
  };

  const handleAddTrack = () => {
      setTracks(prev => [...prev, { 
          id: `t${prev.length + 1}`, 
          name: 'New Track', 
          type: 'audio', 
          clips: [], 
          muted: false, 
          solo: false, 
          volume: 0.8, 
          pan: 0, 
          color: 'bg-slate-600' 
      }]);
  };

  // --- CONTEXTUAL COPILOT ---
  const handleCopilotSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!copilotInput.trim()) return;

      const userText = copilotInput;
      setCopilotMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text: userText }]);
      setCopilotInput('');
      setIsProcessing(true);

      try {
          const lowerText = userText.toLowerCase();
          
          // Context for Gemini
          const studioContext = {
              tracks: tracks.map(t => ({ id: t.id, name: t.name, clipCount: t.clips.length })),
              currentTime,
              bpm
          };

          if (lowerText.includes('beat') || lowerText.includes('drum') || lowerText.includes('generate') || lowerText.includes('make a sound')) {
              // High-Fidelity Path
              const enhancedPrompt = await enhanceMusicPrompt(userText);
              setCopilotMessages(prev => [...prev, { id: `sys_enhance_${Date.now()}`, role: 'agent', text: `✨ Mastering prompt for high-fidelity result...\n"${enhancedPrompt}"` }]);
              
              const trackResult = await generateMusicTrack(enhancedPrompt, 30, "Studio Production", apiKeys.elevenLabs);
              
              if (trackResult.audioUrl) {
                  // Smart placement: try to find a drum or synth track
                  const targetTrackId = lowerText.includes('drum') || lowerText.includes('beat') ? 't1' : 't2';
                  
                  const newClip: AudioClip = {
                      id: `c_${Date.now()}`,
                      name: trackResult.title,
                      audioUrl: trackResult.audioUrl,
                      start: currentTime,
                      duration: 30,
                      color: targetTrackId === 't1' ? 'bg-cyan-500' : 'bg-purple-500',
                      pitch: 0,
                      volume: 1.0,
                      type: 'generated'
                  };
                  setTracks(prev => prev.map(t => t.id === targetTrackId ? { ...t, clips: [...t.clips, newClip] } : t));
                  setCopilotMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', text: `Generated high-fidelity sound "${trackResult.title}" and integrated it into the ${targetTrackId === 't1' ? 'Drums' : 'Synth'} track.` }]);
              }
          } 
          else {
              // General assistance / conversation with full studio context
              const response = await chatWithGemini(userText, copilotMessages, {
                  currentView: 'studio',
                  stats: {} as any, // Mock stats not needed for this call
                  opportunities: [],
                  studioContext
              });
              
              let actionData = null;
              if (response.toLowerCase().includes('[lyrics]')) {
                  actionData = { type: 'synthesize_lyrics', text: response.split('[lyrics]')[1]?.trim() };
              }

              setCopilotMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', text: response, actionData }]);
          }

      } catch (error: any) {
          setCopilotMessages(prev => [...prev, { id: Date.now().toString(), role: 'agent', text: `Error: ${error.message}` }]);
      } finally {
          setIsProcessing(false);
      }
  };

  const triggerVocalSynthesis = async () => {
      setShowLyricsModal(false);
      setIsProcessing(true);
      try {
          const audioUrl = await generateElevenLabsVocals(lyricsToEdit, selectedVoice, apiKeys.elevenLabs);
          const newClip: AudioClip = {
              id: `c_${Date.now()}`,
              name: "High-Fidelity Vocal",
              audioUrl: audioUrl,
              start: currentTime,
              duration: 10,
              color: 'bg-pink-500',
              pitch: 0,
              volume: 1.0,
              type: 'generated'
          };
          setTracks(prev => prev.map(t => t.id === 't3' ? { ...t, clips: [...t.clips, newClip] } : t));
          setCopilotMessages(prev => [...prev, { id: `sys_${Date.now()}`, role: 'agent', text: "Vocals synthesized with high-fidelity engine and synced to Vox track." }]);
      } catch (e: any) {
          console.error(e);
          setCopilotMessages(prev => [...prev, { id: `err_${Date.now()}`, role: 'agent', text: `Failed to synthesize vocals: ${e.message}` }]);
      } finally {
          setIsProcessing(false);
      }
  };

  useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [copilotMessages]);

  const formatTime = (s: number) => {
      const min = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      const ms = Math.floor((s % 1) * 10);
      return `${min}:${sec.toString().padStart(2, '0')}.${ms}`;
  };

  const activeClipData = selectedClip ? tracks.find(t => t.id === selectedClip.trackId)?.clips.find(c => c.id === selectedClip.clipId) : null;

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 relative">
        
        {/* Settings Modal */}
        {showSettings && (
            <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5" /> Studio Configuration</h3>
                        <button onClick={() => setShowSettings(false)}><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">ElevenLabs API Key (High-Fidelity Vocals)</label>
                            <input 
                                type="password" 
                                value={apiKeys.elevenLabs}
                                onChange={(e) => setApiKeys({...apiKeys, elevenLabs: e.target.value})}
                                placeholder="sk_..."
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-cyan-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Kits.AI API Key (Advanced Conversion)</label>
                            <input 
                                type="password" 
                                value={apiKeys.kitsAi}
                                onChange={(e) => setApiKeys({...apiKeys, kitsAi: e.target.value})}
                                placeholder="sk_..."
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-purple-500"
                            />
                        </div>
                        <button onClick={saveKeys} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 rounded-lg transition-colors">
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Lyrics & Vocal Modal */}
        {showLyricsModal && (
            <div className="absolute inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 w-full max-w-lg shadow-2xl">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2"><Mic className="w-5 h-5" /> Vocal Synthesis</h3>
                        <button onClick={() => setShowLyricsModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Lyrics / Script</label>
                            <textarea 
                                value={lyricsToEdit}
                                onChange={(e) => setLyricsToEdit(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white text-sm focus:border-cyan-500 h-32"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Select Voice Model</label>
                            <select 
                                value={selectedVoice}
                                onChange={(e) => setSelectedVoice(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-sm focus:border-cyan-500"
                            >
                                {ELEVENLABS_VOICES.map(v => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>
                        <button 
                            onClick={triggerVocalSynthesis}
                            className="w-full bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Wand2 className="w-4 h-4" /> Generate High-Fidelity Vocals
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* LEFT: COPILOT & TOOLS */}
        <div className="w-80 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Studio Copilot</h3>
                        <p className="text-[10px] text-cyan-400">Contextual Engineer Active</p>
                    </div>
                </div>
                <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white" title="API Settings">
                    <Settings className="w-4 h-4" />
                </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {copilotMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] rounded-2xl p-3 text-xs leading-relaxed ${
                            msg.role === 'user' 
                            ? 'bg-cyan-600 text-white rounded-tr-sm' 
                            : 'bg-slate-800 text-slate-300 rounded-tl-sm border border-slate-700'
                        }`}>
                            <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                            {msg.actionData && msg.actionData.type === 'synthesize_lyrics' && (
                                <button 
                                    onClick={() => { setLyricsToEdit(msg.actionData.text); setShowLyricsModal(true); }}
                                    className="mt-2 bg-pink-500 hover:bg-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold w-full flex items-center justify-center gap-1"
                                >
                                    <Mic className="w-3 h-3" /> Synthesize Vocals
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {isProcessing && (
                    <div className="flex justify-start">
                        <div className="bg-slate-800 rounded-2xl p-3 flex items-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin text-cyan-500" />
                            <span className="text-xs text-slate-400">Engineering...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Quick Tools Panel */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/50">
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Studio Tools</p>
                <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => setShowLyricsModal(true)} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 p-2 rounded text-xs text-slate-300 border border-slate-700 transition-colors">
                        <Mic className="w-3 h-3 text-pink-400" /> Vocal Synth
                    </button>
                    <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 p-2 rounded text-xs text-slate-300 border border-slate-700 transition-colors">
                        <Scissors className="w-3 h-3 text-blue-400" /> Split Stems
                    </button>
                </div>
            </div>

            <form onSubmit={handleCopilotSubmit} className="p-3 bg-slate-950 border-t border-slate-800">
                <div className="relative">
                    <input 
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-4 pr-10 text-xs text-white focus:outline-none focus:border-cyan-500"
                        placeholder="Ask for ideas or mix tips..."
                        value={copilotInput}
                        onChange={e => setCopilotInput(e.target.value)}
                        disabled={isProcessing}
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50">
                        <Send className="w-3 h-3" />
                    </button>
                </div>
            </form>
        </div>

        {/* RIGHT: TIMELINE / DAW */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
            {/* Toolbar */}
            <div className="h-14 border-b border-slate-800 flex items-center justify-between px-4 bg-slate-900">
                <div className="flex items-center gap-4">
                    <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700">
                        <button onClick={togglePlay} className="p-2 hover:bg-slate-700 rounded text-white transition-colors" title="Play/Pause (Space)">
                            {isPlaying ? <Square className="w-4 h-4 fill-current text-cyan-400" /> : <Play className="w-4 h-4 fill-current text-green-500" />}
                        </button>
                        <button onClick={() => {stopPlayback(); setCurrentTime(0);}} className="p-2 hover:bg-slate-700 rounded text-white transition-colors" title="Stop">
                            <div className="w-4 h-4 rounded-sm bg-slate-400"></div>
                        </button>
                        <button 
                            onClick={toggleRecording} 
                            className={`p-2 hover:bg-slate-700 rounded transition-colors ${isRecording ? 'text-red-500 animate-pulse' : 'text-slate-400 hover:text-red-500'}`} 
                            title="Record Audio"
                        >
                            <Circle className={`w-4 h-4 ${isRecording ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                    
                    <div className="flex items-center gap-1 border-l border-slate-700 pl-4">
                        <button onClick={undo} disabled={!canUndo} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"><Undo className="w-4 h-4" /></button>
                        <button onClick={redo} disabled={!canRedo} className="p-2 hover:bg-slate-800 rounded text-slate-400 hover:text-white disabled:opacity-30 transition-colors"><Redo className="w-4 h-4" /></button>
                    </div>

                    <div className="font-mono text-xl text-cyan-400 font-bold w-24 text-center bg-black/40 rounded px-2 py-1 ml-4 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                        {formatTime(currentTime)}
                    </div>
                    <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                        <span className="text-xs font-bold text-slate-500">BPM</span>
                        <input type="number" value={bpm} onChange={e => setBpm(parseInt(e.target.value))} className="w-12 bg-transparent text-white text-xs font-mono text-center border-b border-slate-700 focus:border-cyan-500 outline-none" />
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20">
                        <Download className="w-3 h-3" /> Export Mix
                    </button>
                </div>
            </div>

            {/* Timeline Area */}
            <div className="flex-1 overflow-hidden flex flex-col relative bg-[#0a0f1c]">
                {/* Ruler */}
                <div className="h-8 bg-slate-900 border-b border-slate-800 flex items-end relative overflow-hidden shrink-0 select-none">
                    <div className="w-48 shrink-0 border-r border-slate-800 bg-slate-900 z-10"></div>
                    <div className="flex-1 relative" style={{ transform: `translateX(${-currentTime * zoom}px)` }}>
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div key={i} className="absolute bottom-0 h-4 border-l border-slate-700 text-[9px] text-slate-500 pl-1" style={{ left: i * zoom * 2 }}>
                                {i * 2}s
                            </div>
                        ))}
                    </div>
                </div>

                {/* Tracks Container */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden relative scrollbar-thin scrollbar-thumb-slate-700">
                    <div className="absolute top-0 bottom-0 w-px bg-cyan-500 z-20 pointer-events-none shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ left: 192 + (currentTime * zoom) }}>
                        <div className="w-3 h-3 -ml-1.5 -mt-1.5 bg-cyan-500 rotate-45 shadow-sm"></div>
                    </div>

                    {tracks.map((track) => (
                        <div key={track.id} className="flex h-32 border-b border-slate-800/50 group hover:bg-white/5 transition-colors relative">
                            {/* Track Header */}
                            <div className="w-48 shrink-0 bg-slate-900 border-r border-slate-800 p-3 flex flex-col justify-between relative z-10">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className={`w-3 h-3 rounded-full ${track.color} ${track.isArmed ? 'animate-pulse' : ''}`}></div>
                                        <span className="text-xs font-bold text-white truncate w-24" title={track.name}>{track.name}</span>
                                    </div>
                                    <div className="flex gap-1 mb-2">
                                        <button 
                                            onClick={() => handleTrackPropertyChange(track.id, 'muted', !track.muted)}
                                            className={`w-6 h-6 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${track.muted ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                                        >M</button>
                                        <button 
                                            onClick={() => handleTrackPropertyChange(track.id, 'solo', !track.solo)}
                                            className={`w-6 h-6 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${track.solo ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-500 hover:bg-slate-700'}`}
                                        >S</button>
                                        {track.type === 'vocal' && (
                                            <button 
                                                onClick={() => handleTrackPropertyChange(track.id, 'isArmed', !track.isArmed)}
                                                className={`w-6 h-6 rounded text-[9px] font-bold flex items-center justify-center transition-colors ${track.isArmed ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-500 hover:text-red-500'}`}
                                                title="Arm for Recording"
                                            >R</button>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <ArrowLeftRight className="w-3 h-3 text-slate-500" />
                                        <input 
                                            type="range" min="-1" max="1" step="0.1" 
                                            value={track.pan} 
                                            onChange={(e) => handleTrackPropertyChange(track.id, 'pan', parseFloat(e.target.value))}
                                            className="w-full h-1 bg-slate-700 rounded-full appearance-none accent-slate-400 hover:accent-purple-400"
                                            title="Pan"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Volume2 className="w-3 h-3 text-slate-500" />
                                    <input 
                                        type="range" min="0" max="1" step="0.1" 
                                        value={track.volume} 
                                        onChange={(e) => handleTrackPropertyChange(track.id, 'volume', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-slate-700 rounded-full appearance-none accent-slate-400 hover:accent-cyan-500"
                                        title="Volume"
                                    />
                                </div>
                            </div>

                            {/* Track Lane */}
                            <div className="flex-1 relative overflow-hidden">
                                <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)]" style={{ backgroundSize: `${zoom}px 100%`, transform: `translateX(${-currentTime * zoom}px)` }}></div>
                                
                                <div className="absolute inset-0" style={{ transform: `translateX(${-currentTime * zoom}px)` }}>
                                    {track.clips.map((clip) => (
                                        <div 
                                            key={clip.id}
                                            onClick={(e) => { e.stopPropagation(); setSelectedClip({trackId: track.id, clipId: clip.id}); }}
                                            className={`absolute top-2 bottom-2 rounded-md border ${selectedClip?.clipId === clip.id ? 'border-white ring-1 ring-white shadow-[0_0_10px_rgba(255,255,255,0.3)]' : 'border-white/10'} ${clip.color} opacity-90 hover:opacity-100 hover:border-white/40 cursor-pointer overflow-hidden group/clip transition-all shadow-sm`}
                                            style={{ left: clip.start * zoom, width: clip.duration * zoom }}
                                            title={clip.name}
                                        >
                                            <div className="px-2 py-1 text-[10px] font-bold text-white truncate drop-shadow-md flex justify-between items-center bg-black/10">
                                                <span className="flex items-center gap-1">
                                                    {clip.type === 'recording' && <Mic className="w-3 h-3" />}
                                                    {clip.type === 'generated' && <Wand2 className="w-3 h-3" />}
                                                    {clip.name}
                                                </span>
                                                <div className="flex items-center gap-1 opacity-0 group-hover/clip:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleSplitClip(track.id, clip.id); }}
                                                        className="p-0.5 hover:text-cyan-200" title="Split at playhead"
                                                    >
                                                        <Scissors className="w-3 h-3" />
                                                    </button>
                                                    <button 
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteClip(track.id, clip.id); }}
                                                        className="p-0.5 hover:text-red-200"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="absolute inset-0 top-5 flex items-center justify-center gap-px opacity-40 pointer-events-none px-1">
                                                {Array.from({length: Math.min(50, Math.floor(clip.duration * 5))}).map((_, i) => (
                                                    <div key={i} className="flex-1 bg-black/50 rounded-full" style={{ height: `${Math.random() * 60 + 20}%` }}></div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        onClick={handleAddTrack}
                        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-xs text-slate-500 hover:text-white font-bold border-b border-dashed border-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-3 h-3" /> Add Track
                    </button>
                </div>

                {/* --- CLIP INSPECTOR --- */}
                {activeClipData && (
                    <div className="absolute bottom-4 right-4 z-40 w-64 bg-slate-900/95 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                                <Edit2 className="w-3 h-3" /> Clip Settings
                            </h4>
                            <button onClick={() => setSelectedClip(null)} className="text-slate-500 hover:text-white"><X className="w-4 h-4" /></button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Clip Name</label>
                                <input 
                                    type="text" 
                                    value={activeClipData.name} 
                                    onChange={(e) => handleClipPropertyChange(selectedClip!.trackId, selectedClip!.clipId, 'name', e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:border-cyan-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Position (s)</label>
                                    <input 
                                        type="number" step="0.1" min="0"
                                        value={activeClipData.start.toFixed(1)} 
                                        onChange={(e) => handleClipPropertyChange(selectedClip!.trackId, selectedClip!.clipId, 'start', parseFloat(e.target.value))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:border-cyan-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Gain</label>
                                    <input 
                                        type="range" min="0" max="1" step="0.01"
                                        value={activeClipData.volume} 
                                        onChange={(e) => handleClipPropertyChange(selectedClip!.trackId, selectedClip!.clipId, 'volume', parseFloat(e.target.value))}
                                        className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-cyan-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase mb-1">
                                    <span>Pitch Shift</span>
                                    <span className="text-cyan-400">{activeClipData.pitch > 0 ? '+' : ''}{activeClipData.pitch} ST</span>
                                </div>
                                <input 
                                    type="range" min="-12" max="12" step="1"
                                    value={activeClipData.pitch} 
                                    onChange={(e) => handleClipPropertyChange(selectedClip!.trackId, selectedClip!.clipId, 'pitch', parseInt(e.target.value))}
                                    className="w-full h-1 bg-slate-800 rounded-full appearance-none accent-purple-500"
                                />
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button 
                                    onClick={() => handleSplitClip(selectedClip!.trackId, selectedClip!.clipId)}
                                    className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-white rounded flex items-center justify-center gap-1 transition-colors"
                                >
                                    <Scissors className="w-3 h-3" /> Split
                                </button>
                                <button 
                                    onClick={() => handleDeleteClip(selectedClip!.trackId, selectedClip!.clipId)}
                                    className="flex-1 py-1.5 bg-red-900/30 hover:bg-red-900/50 text-[10px] font-bold text-red-400 rounded flex items-center justify-center gap-1 transition-colors border border-red-900/20"
                                >
                                    <Trash2 className="w-3 h-3" /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
