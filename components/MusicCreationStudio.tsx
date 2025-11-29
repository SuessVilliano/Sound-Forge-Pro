import React, { useState, useEffect } from 'react';
import { Wand2, Play, Download, Save, Music2, Mic2, Loader2, Lock, Crown, FileText, Music4, Settings, Mic, Headphones, Trash2, Layers, Plus, Volume2, MoreVertical } from 'lucide-react';
import { generateMusicTrack, generateElevenLabsVocals, generateElevenLabsSFX, GeneratedTrack } from '../services/audioService';
import { generateSongStructure, SongStructure } from '../services/geminiService';
import { dataService } from '../services/dataService';
import { User } from '../types';

interface MusicCreationStudioProps {
  user: User;
  onUpgrade: () => void;
}

type StudioMode = 'compose' | 'vocals' | 'beats';

// Mock Track for Visualizer
interface TimelineTrack {
    id: string;
    name: string;
    type: 'audio' | 'midi' | 'vocal';
    color: string;
    clips: { start: number, duration: number, name: string }[];
    muted: boolean;
    solo: boolean;
    volume: number;
}

export const MusicCreationStudio: React.FC<MusicCreationStudioProps> = ({ user, onUpgrade }) => {
  const [mode, setMode] = useState<StudioMode>('compose');
  const [elevenLabsKey, setElevenLabsKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Composition State (Gemini)
  const [compTopic, setCompTopic] = useState('');
  const [compGenre, setCompGenre] = useState('Pop');
  const [compMood, setCompMood] = useState('Happy');
  const [songStructure, setSongStructure] = useState<SongStructure | null>(null);
  const [isComposing, setIsComposing] = useState(false);

  // Vocal State (ElevenLabs)
  const [vocalText, setVocalText] = useState('');
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM'); 
  const [isGeneratingVocal, setIsGeneratingVocal] = useState(false);

  // Beat State
  const [beatPrompt, setBeatPrompt] = useState('');
  const [isGeneratingBeat, setIsGeneratingBeat] = useState(false);

  // DAW State
  const [tracks, setTracks] = useState<TimelineTrack[]>([
      { id: 't1', name: 'Main Vocals', type: 'vocal', color: 'bg-cyan-500', clips: [], muted: false, solo: false, volume: 0.8 },
      { id: 't2', name: 'Drums', type: 'audio', color: 'bg-green-500', clips: [], muted: false, solo: false, volume: 0.7 },
      { id: 't3', name: 'Bass', type: 'midi', color: 'bg-purple-500', clips: [], muted: false, solo: false, volume: 0.6 },
  ]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playhead, setPlayhead] = useState(0);

  // Free tier limit logic
  const isPro = user.plan !== 'free';

  // Handlers
  const handleCompose = async () => {
      if(!compTopic) return;
      setIsComposing(true);
      try {
          const result = await generateSongStructure(compTopic, compGenre, compMood);
          setSongStructure(result);
          setVocalText(result.lyrics);
          setBeatPrompt(`${result.genre} beat, ${result.bpm} bpm, ${compMood} mood`);
      } catch (e) {
          console.error(e);
      } finally {
          setIsComposing(false);
      }
  };

  const handleGenerateVocals = async () => {
      if (!elevenLabsKey) {
          setShowKeyInput(true);
          return;
      }
      setIsGeneratingVocal(true);
      try {
          const url = await generateElevenLabsVocals(vocalText, voiceId, elevenLabsKey);
          // Add clip to Vocal track
          const newClip = { start: 0, duration: 30, name: 'AI Vocal Take 1' };
          setTracks(prev => prev.map(t => t.id === 't1' ? { ...t, clips: [...t.clips, newClip] } : t));
          alert("Vocal generated and added to timeline!");
      } catch (e) {
          alert("ElevenLabs Error: Check API Key");
      } finally {
          setIsGeneratingVocal(false);
      }
  };

  const handleGenerateBeat = async () => {
      if (!elevenLabsKey) {
          setShowKeyInput(true);
          return;
      }
      setIsGeneratingBeat(true);
      try {
          const url = await generateElevenLabsSFX(beatPrompt, elevenLabsKey);
          // Add clip to Drum track
          const newClip = { start: 0, duration: 15, name: 'Generated Beat' };
          setTracks(prev => prev.map(t => t.id === 't2' ? { ...t, clips: [...t.clips, newClip] } : t));
          alert("Beat generated and added to timeline!");
      } catch(e) {
          alert("Generation Error");
      } finally {
          setIsGeneratingBeat(false);
      }
  };

  const togglePlayback = () => {
      setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-cyan-400" /> AI Studio DAW
          </h1>
          <p className="text-slate-400 text-sm">Multi-track editor powered by Gemini & ElevenLabs.</p>
        </div>
        <div className="flex gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Project
            </button>
            <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Mix
            </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
          
          {/* Left Panel: Generators */}
          <div className="col-span-3 bg-slate-850 rounded-xl border border-slate-800 p-4 overflow-y-auto flex flex-col gap-6">
              
              {/* API Key Input */}
              <button 
                onClick={() => setShowKeyInput(!showKeyInput)}
                className="w-full text-xs text-slate-400 hover:text-white flex items-center justify-between bg-slate-900 px-3 py-2 rounded-lg border border-slate-700"
              >
                <span className="flex items-center gap-2"><Settings className="w-3 h-3" /> Audio Settings</span>
                {elevenLabsKey ? <span className="text-green-500 text-[10px]">Connected</span> : <span className="text-red-500 text-[10px]">Setup Required</span>}
              </button>
              
              {showKeyInput && (
                  <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                      <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">ElevenLabs Key</label>
                      <input 
                        type="password" 
                        value={elevenLabsKey} 
                        onChange={(e) => setElevenLabsKey(e.target.value)} 
                        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white" 
                        placeholder="xi-..." 
                      />
                  </div>
              )}

              {/* Generator Tabs */}
              <div className="flex bg-slate-900 p-1 rounded-lg">
                  <button onClick={() => setMode('compose')} className={`flex-1 py-1.5 text-xs font-bold rounded ${mode === 'compose' ? 'bg-purple-600 text-white' : 'text-slate-400'}`}>Write</button>
                  <button onClick={() => setMode('vocals')} className={`flex-1 py-1.5 text-xs font-bold rounded ${mode === 'vocals' ? 'bg-cyan-600 text-white' : 'text-slate-400'}`}>Voice</button>
                  <button onClick={() => setMode('beats')} className={`flex-1 py-1.5 text-xs font-bold rounded ${mode === 'beats' ? 'bg-green-600 text-white' : 'text-slate-400'}`}>Beat</button>
              </div>

              {/* Generator Content */}
              <div className="flex-1">
                  {mode === 'compose' && (
                      <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400">Song Idea</label>
                          <textarea 
                            value={compTopic}
                            onChange={(e) => setCompTopic(e.target.value)}
                            className="w-full h-20 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white resize-none"
                            placeholder="A chill synthwave track about night driving..."
                          />
                          <button 
                            onClick={handleCompose}
                            disabled={isComposing}
                            className="w-full bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                          >
                              {isComposing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />} Generate Structure
                          </button>
                          {songStructure && (
                              <div className="bg-slate-900 p-3 rounded-lg text-xs text-slate-300 max-h-40 overflow-y-auto">
                                  <p className="font-bold text-white mb-1">{songStructure.title}</p>
                                  <p>{songStructure.key} • {songStructure.bpm} BPM</p>
                                  <div className="mt-2 pt-2 border-t border-slate-700 whitespace-pre-wrap">{songStructure.lyrics}</div>
                              </div>
                          )}
                      </div>
                  )}

                  {mode === 'vocals' && (
                      <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400">Lyrics</label>
                          <textarea 
                            value={vocalText}
                            onChange={(e) => setVocalText(e.target.value)}
                            className="w-full h-32 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white resize-none"
                            placeholder="Lyrics to sing..."
                          />
                          <button 
                            onClick={handleGenerateVocals}
                            disabled={isGeneratingVocal}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                          >
                              {isGeneratingVocal ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mic className="w-3 h-3" />} Generate Vocal
                          </button>
                      </div>
                  )}

                  {mode === 'beats' && (
                      <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400">Beat Prompt</label>
                          <textarea 
                            value={beatPrompt}
                            onChange={(e) => setBeatPrompt(e.target.value)}
                            className="w-full h-24 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white resize-none"
                            placeholder="Trap drums 140bpm..."
                          />
                          <button 
                            onClick={handleGenerateBeat}
                            disabled={isGeneratingBeat}
                            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                          >
                              {isGeneratingBeat ? <Loader2 className="w-3 h-3 animate-spin" /> : <Music4 className="w-3 h-3" />} Generate Loop
                          </button>
                      </div>
                  )}
              </div>
          </div>

          {/* Right Panel: Timeline / Visualizer */}
          <div className="col-span-9 bg-slate-900 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
              
              {/* Transport Controls */}
              <div className="h-14 border-b border-slate-800 bg-slate-850 flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setPlayhead(0)} className="text-slate-400 hover:text-white"><span className="text-xs font-bold">|&lt;</span></button>
                      <button onClick={togglePlayback} className="bg-white text-slate-900 rounded-full p-2 hover:bg-cyan-400 transition-colors">
                          {isPlaying ? <span className="block w-3 h-3 bg-current rounded-sm"></span> : <Play className="w-3 h-3 fill-current" />}
                      </button>
                      <div className="text-xl font-mono text-cyan-400">
                          {Math.floor(playhead / 60)}:{Math.floor(playhead % 60).toString().padStart(2, '0')}<span className="text-slate-600 text-sm">.00</span>
                      </div>
                  </div>
                  <div className="flex items-center gap-4">
                      <div className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">120 BPM</div>
                      <div className="text-xs font-bold text-slate-500 bg-slate-900 px-2 py-1 rounded">4/4</div>
                  </div>
              </div>

              {/* Timeline Header */}
              <div className="h-8 bg-slate-850 border-b border-slate-800 relative">
                  {/* Ruler Mockup */}
                  <div className="absolute inset-0 flex items-end pl-40">
                      {Array.from({length: 20}).map((_, i) => (
                          <div key={i} className="flex-1 border-l border-slate-700 h-2 text-[10px] text-slate-500 pl-1">{i + 1}</div>
                      ))}
                  </div>
                  {/* Playhead */}
                  <div className="absolute top-0 bottom-0 w-0.5 bg-cyan-500 z-20 left-[200px]">
                      <div className="w-3 h-3 -ml-1.5 bg-cyan-500 transform rotate-45 -mt-1.5"></div>
                  </div>
              </div>

              {/* Tracks Area */}
              <div className="flex-1 overflow-y-auto bg-slate-900 relative">
                  {tracks.map((track) => (
                      <div key={track.id} className="flex h-24 border-b border-slate-800">
                          {/* Track Header */}
                          <div className="w-40 bg-slate-850 border-r border-slate-800 p-3 flex flex-col justify-between shrink-0 z-10">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <div className={`w-2 h-2 rounded-full ${track.color}`}></div>
                                      <span className="text-xs font-bold text-white truncate">{track.name}</span>
                                  </div>
                                  <div className="flex gap-1">
                                      <button className={`text-[10px] px-1.5 rounded border ${track.muted ? 'bg-red-500/20 border-red-500 text-red-500' : 'border-slate-600 text-slate-500'}`}>M</button>
                                      <button className={`text-[10px] px-1.5 rounded border ${track.solo ? 'bg-yellow-500/20 border-yellow-500 text-yellow-500' : 'border-slate-600 text-slate-500'}`}>S</button>
                                  </div>
                              </div>
                              <div className="flex items-center gap-2">
                                  <Volume2 className="w-3 h-3 text-slate-500" />
                                  <div className="h-1 flex-1 bg-slate-700 rounded-full overflow-hidden">
                                      <div className="h-full bg-slate-400" style={{ width: `${track.volume * 100}%` }}></div>
                                  </div>
                              </div>
                          </div>

                          {/* Track Timeline */}
                          <div className="flex-1 relative bg-slate-900/50">
                              {/* Grid Lines */}
                              <div className="absolute inset-0 flex">
                                  {Array.from({length: 20}).map((_, i) => (
                                      <div key={i} className="flex-1 border-r border-slate-800/50"></div>
                                  ))}
                              </div>
                              
                              {/* Clips */}
                              {track.clips.map((clip, i) => (
                                  <div 
                                    key={i}
                                    className={`absolute top-2 bottom-2 rounded-md ${track.color.replace('bg-', 'bg-')}/30 border ${track.color.replace('bg-', 'border-')} flex items-center px-2 cursor-pointer hover:brightness-110`}
                                    style={{ left: `${clip.start * 10}px`, width: `${clip.duration * 10}px` }}
                                  >
                                      <span className="text-[10px] font-bold text-white truncate">{clip.name}</span>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
                  
                  {/* Add Track Button */}
                  <div className="p-4">
                      <button className="text-xs font-bold text-slate-500 hover:text-white flex items-center gap-2 px-3 py-2 rounded border border-dashed border-slate-700 hover:border-slate-500 transition-colors">
                          <Plus className="w-3 h-3" /> Add Track
                      </button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};