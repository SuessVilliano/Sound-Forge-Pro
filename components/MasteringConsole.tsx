
import React, { useState, useRef } from 'react';
import { Upload, Sliders, Play, Download, CheckCircle, Activity, Music, X, Trash2, Loader2, FileAudio, RefreshCw, AlertCircle, BarChart2, Eye, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MASTERING_STYLES } from '../constants';
import { masterTrack } from '../services/audioService';
import { usePlayer } from '../contexts/PlayerContext';
import { Track } from '../types';

interface MasteringStats {
    loudness: number;
    dynamicRange: number;
    peak: number;
    spectrum: { freq: string; original: number; mastered: number }[];
}

interface QueuedTrack {
  id: string;
  file: File;
  status: 'idle' | 'processing' | 'completed' | 'error';
  resultUrl?: string;
  styleId: string;
  progress: number;
  stats?: MasteringStats;
  originalStats?: { loudness: number; dynamicRange: number; peak: number };
}

export const MasteringConsole: React.FC = () => {
  const [queue, setQueue] = useState<QueuedTrack[]>([]);
  const [globalStyle, setGlobalStyle] = useState(MASTERING_STYLES[0].id);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState<QueuedTrack | null>(null);
  
  // Animation State
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationStage, setAnimationStage] = useState('Initializing Neural Engine...');

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { playTrack } = usePlayer();

  // Helper to generate mock spectrum data for visualization
  const generateMockAnalysis = (): MasteringStats => {
      const freqs = ['20', '60', '125', '250', '500', '1k', '2k', '4k', '8k', '16k'];
      return {
          loudness: -9 + (Math.random() * 2), // Target ~ -8 to -9 LUFS
          dynamicRange: 6 + (Math.random() * 3),
          peak: -0.1,
          spectrum: freqs.map(f => ({
              freq: f,
              original: -30 - Math.random() * 20,
              mastered: -15 - Math.random() * 10 // Louder, more consistent
          }))
      };
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const newTracks: QueuedTrack[] = Array.from(files).map(file => ({
      id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      file,
      status: 'idle',
      styleId: globalStyle,
      progress: 0,
      originalStats: {
          loudness: -18 - (Math.random() * 6), // Quiet mix
          dynamicRange: 12 + (Math.random() * 4), // Dynamic uncompressed
          peak: -3 - (Math.random() * 3)
      }
    }));
    setQueue(prev => [...prev, ...newTracks]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeTrack = (id: string) => {
    setQueue(prev => prev.filter(t => t.id !== id));
    if (selectedAnalysis?.id === id) setSelectedAnalysis(null);
  };

  const updateTrackStyle = (id: string, styleId: string) => {
      setQueue(prev => prev.map(t => t.id === id && t.status === 'idle' ? { ...t, styleId } : t));
  };

  const handlePreview = (track: QueuedTrack) => {
      if (!track.resultUrl) return;
      
      const previewTrack: Track = {
          id: track.id,
          title: `Mastered: ${track.file.name}`,
          artist: 'AI Mastering Engine',
          image: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60',
          audioUrl: track.resultUrl,
          duration: 'Preview',
          bpm: 0,
          key: '-',
          mood_tags: ['Mastered'],
          plays: 0,
          earnings: 0
      };
      playTrack(previewTrack);
  };

  const processQueue = async () => {
    setIsProcessingBatch(true);
    setShowAnimation(true);
    
    const tracksToProcess = queue.filter(t => t.status === 'idle');
    if (tracksToProcess.length === 0) {
        setIsProcessingBatch(false);
        setShowAnimation(false);
        return;
    }

    setQueue(prev => prev.map(t => t.status === 'idle' ? { ...t, status: 'processing' } : t));

    // Animation Stages Cycle
    const stages = [
        "Analyzing Frequency Spectrum...",
        "Correcting Phase Correlation...",
        "Applying Multiband Compression...",
        "Harmonic Saturation & Warmth...",
        "Stereo Width Enhancement...",
        "Final Limiting & Dithering..."
    ];
    let stageIndex = 0;
    const stageInterval = setInterval(() => {
        setAnimationStage(stages[stageIndex % stages.length]);
        stageIndex++;
    }, 1200);

    await Promise.all(tracksToProcess.map(async (track) => {
        try {
            // Fake progress animation
            const progressInterval = setInterval(() => {
                setQueue(prev => prev.map(t => {
                    if (t.id === track.id && t.status === 'processing') {
                        const next = Math.min(t.progress + Math.random() * 5, 98);
                        return { ...t, progress: next };
                    }
                    return t;
                }));
            }, 200);

            // Actual Service Call
            const { url } = await masterTrack(track.file, track.styleId);
            const stats = generateMockAnalysis();
            
            clearInterval(progressInterval);
            
            setQueue(prev => prev.map(t => 
                t.id === track.id 
                ? { ...t, status: 'completed', resultUrl: url, progress: 100, stats } 
                : t
            ));
        } catch (e) {
            setQueue(prev => prev.map(t => 
                t.id === track.id ? { ...t, status: 'error', progress: 0 } : t
            ));
        }
    }));

    clearInterval(stageInterval);
    setIsProcessingBatch(false);
    
    // Complete state before closing
    setAnimationStage("Mastering Complete.");
    setTimeout(() => setShowAnimation(false), 1500);
  };

  const clearCompleted = () => {
      setQueue(prev => prev.filter(t => t.status !== 'completed' && t.status !== 'error'));
      setSelectedAnalysis(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* SOPHISTICATED ANIMATION OVERLAY */}
      {showAnimation && (
        <div className="fixed inset-0 z-[100] bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center animate-in fade-in duration-500 cursor-wait">
            
            {/* Central Core */}
            <div className="relative w-96 h-96 flex items-center justify-center mb-16 scale-75 md:scale-100 transition-transform">
                {/* Outer Ring */}
                <div className="absolute inset-0 border-4 border-slate-800 border-t-cyan-500 border-r-cyan-900 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                {/* Middle Ring */}
                <div className="absolute inset-8 border-2 border-slate-800 border-b-purple-500 border-l-purple-900 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '5s' }}></div>
                {/* Inner Ring */}
                <div className="absolute inset-20 border border-slate-800 border-t-green-500 rounded-full animate-spin" style={{ animationDuration: '2s' }}></div>
                
                {/* Glowing Core */}
                <div className="absolute inset-32 bg-cyan-500/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative z-10 bg-slate-950 p-6 rounded-full border border-slate-700 shadow-2xl shadow-cyan-500/20">
                    <Zap className="w-16 h-16 text-cyan-400 animate-pulse" />
                </div>

                {/* Orbiting Particles */}
                <div className="absolute top-0 left-1/2 w-2 h-2 bg-white rounded-full blur-[1px] animate-ping"></div>
                <div className="absolute bottom-10 right-10 w-1.5 h-1.5 bg-purple-400 rounded-full blur-[1px] animate-pulse"></div>
            </div>

            {/* Text & Status */}
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight animate-in slide-in-from-bottom-4 text-center">{animationStage}</h2>
            <p className="text-slate-400 text-lg mb-8 font-mono">AI Model v2.5 Active</p>

            {/* Waveform Visualization */}
            <div className="flex items-end justify-center gap-1 h-24 w-96 opacity-80">
                {Array.from({length: 30}).map((_, i) => (
                    <div 
                        key={i} 
                        className="w-2 bg-gradient-to-t from-cyan-600 via-purple-500 to-white rounded-t-sm animate-pulse"
                        style={{ 
                            height: `${Math.random() * 60 + 20}%`, 
                            animationDuration: `${0.5 + Math.random() * 0.5}s`,
                            animationDelay: `${i * 0.05}s`
                        }}
                    ></div>
                ))}
            </div>
        </div>
      )}

      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-500" /> AI Mastering Console
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Professional grade mastering engine. Batch process your stems or album tracks.
          </p>
        </div>
        {queue.some(t => t.status === 'completed' || t.status === 'error') && (
            <button 
                onClick={clearCompleted}
                className="text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors"
            >
                <RefreshCw className="w-3 h-3" /> Clear Finished
            </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: UPLOAD & SETTINGS */}
        <div className="lg:col-span-4 space-y-6">
           <div 
             onDragOver={(e) => e.preventDefault()}
             onDrop={handleDrop}
             onClick={() => fileInputRef.current?.click()}
             className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-cyan-500 dark:hover:border-cyan-500 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer group h-64"
           >
             <div className="w-14 h-14 bg-white dark:bg-slate-800 group-hover:bg-cyan-50 dark:group-hover:bg-slate-700 rounded-full flex items-center justify-center mb-4 transition-colors shadow-sm">
                <Upload className="w-6 h-6 text-slate-400 group-hover:text-cyan-500" />
             </div>
             <p className="text-slate-900 dark:text-white font-bold text-sm mb-1 group-hover:text-cyan-500 transition-colors">Drop tracks here</p>
             <p className="text-slate-500 text-xs">WAV, AIFF, MP3 up to 100MB</p>
             <input 
                type="file" 
                ref={fileInputRef} 
                multiple 
                accept="audio/*" 
                className="hidden" 
                onChange={(e) => handleFiles(e.target.files)} 
             />
           </div>

           <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Default Style Profile</h3>
              <div className="space-y-2">
                 {MASTERING_STYLES.map(style => (
                   <button
                     key={style.id}
                     onClick={() => setGlobalStyle(style.id)}
                     className={`w-full text-left p-3 rounded-lg border transition-all ${
                       globalStyle === style.id 
                         ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 ring-1 ring-cyan-500' 
                         : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600'
                     }`}
                   >
                     <div className="flex justify-between items-center mb-1">
                       <span className={`text-sm font-bold ${globalStyle === style.id ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>{style.name}</span>
                       {globalStyle === style.id && <CheckCircle className="w-4 h-4 text-cyan-500" />}
                     </div>
                     <p className="text-[10px] text-slate-500">{style.description}</p>
                   </button>
                 ))}
              </div>
           </div>
           
           <button 
             onClick={processQueue}
             disabled={isProcessingBatch || !queue.some(t => t.status === 'idle')}
             className="w-full bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-bold py-4 rounded-xl text-lg shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
           >
             {isProcessingBatch ? <Loader2 className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
             {isProcessingBatch ? 'Mastering...' : `Master All (${queue.filter(t => t.status === 'idle').length})`}
           </button>
        </div>

        {/* RIGHT COLUMN: QUEUE & RESULTS */}
        <div className="lg:col-span-8 space-y-6">
            
            {/* Analysis Panel (Conditional) */}
            {selectedAnalysis && selectedAnalysis.stats && selectedAnalysis.originalStats && (
                <div className="bg-slate-900 rounded-xl border border-slate-700 overflow-hidden shadow-2xl animate-in slide-in-from-top-4 duration-500">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                        <div className="flex items-center gap-3">
                            <BarChart2 className="w-5 h-5 text-cyan-400" />
                            <div>
                                <h3 className="text-white font-bold text-sm">Mastering Report</h3>
                                <p className="text-slate-500 text-xs">{selectedAnalysis.file.name}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedAnalysis(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Metrics */}
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <span className="text-xs text-slate-400 uppercase font-bold">Loudness (LUFS)</span>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className="text-2xl font-bold text-white">{selectedAnalysis.stats.loudness.toFixed(1)}</span>
                                    <span className="text-xs text-green-400 mb-1">
                                        (+{Math.abs(selectedAnalysis.stats.loudness - selectedAnalysis.originalStats.loudness).toFixed(1)} dB)
                                    </span>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <span className="text-xs text-slate-400 uppercase font-bold">Dynamic Range</span>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className="text-2xl font-bold text-white">DR{Math.floor(selectedAnalysis.stats.dynamicRange)}</span>
                                    <span className="text-xs text-slate-500 mb-1">
                                        (Prev: DR{Math.floor(selectedAnalysis.originalStats.dynamicRange)})
                                    </span>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <span className="text-xs text-slate-400 uppercase font-bold">True Peak</span>
                                <div className="flex items-end gap-2 mt-1">
                                    <span className="text-2xl font-bold text-white">{selectedAnalysis.stats.peak} dB</span>
                                    <span className="text-xs text-green-400 mb-1">Safe</span>
                                </div>
                            </div>
                        </div>

                        {/* Frequency Chart */}
                        <div className="md:col-span-2 h-64 bg-slate-800/30 rounded-lg border border-slate-700 p-2 relative">
                            <div className="absolute top-2 right-2 flex gap-2 text-[10px]">
                                <span className="flex items-center gap-1 text-slate-400"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Original</span>
                                <span className="flex items-center gap-1 text-cyan-400"><span className="w-2 h-2 rounded-full bg-cyan-500"></span> Mastered</span>
                            </div>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={selectedAnalysis.stats.spectrum}>
                                    <defs>
                                        <linearGradient id="colorMastered" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="freq" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[-60, 0]} hide />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '8px' }} 
                                        itemStyle={{ fontSize: '12px' }}
                                        labelStyle={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="original" stroke="#64748b" fill="none" strokeWidth={2} strokeDasharray="4 4" name="Original Mix" />
                                    <Area type="monotone" dataKey="mastered" stroke="#22d3ee" fill="url(#colorMastered)" strokeWidth={3} name="Mastered" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    
                    {/* Simulated Waveform Comparison */}
                    <div className="px-6 pb-6">
                        <span className="text-xs text-slate-400 uppercase font-bold mb-2 block">Waveform Impact</span>
                        <div className="h-16 flex items-end gap-0.5 opacity-80">
                            {Array.from({length: 60}).map((_, i) => {
                                const height = Math.max(10, Math.sin(i * 0.2) * 40 + 50 + (Math.random() * 20));
                                return (
                                    <div key={i} className="flex-1 flex flex-col justify-end h-full gap-px group">
                                        <div className="w-full bg-cyan-500 transition-all duration-500" style={{ height: `${height}%` }}></div>
                                        <div className="w-full bg-slate-600 transition-all duration-500" style={{ height: `${height * 0.6}%` }}></div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Queue List */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 min-h-[500px] flex flex-col shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex justify-between items-center">
                    <span>Session Queue</span>
                    <span className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{queue.length} Tracks</span>
                </h3>

                {queue.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                        <Music className="w-16 h-16 opacity-20 mb-4" />
                        <p className="font-medium">Queue is empty</p>
                        <p className="text-sm mt-1">Upload tracks to begin mastering session</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {queue.map((track) => (
                            <div key={track.id} className={`bg-slate-50 dark:bg-slate-900 border rounded-lg p-4 flex items-center gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 group ${selectedAnalysis?.id === track.id ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-slate-200 dark:border-slate-800'}`}>
                                {/* Icon / Status */}
                                <div className="shrink-0">
                                    {track.status === 'completed' ? (
                                        <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                                            <CheckCircle className="w-5 h-5" />
                                        </div>
                                    ) : track.status === 'processing' ? (
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-500">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        </div>
                                    ) : track.status === 'error' ? (
                                        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
                                            <AlertCircle className="w-5 h-5" />
                                        </div>
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                                            <FileAudio className="w-5 h-5" />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md" title={track.file.name}>{track.file.name}</h4>
                                        <span className="text-xs text-slate-500">{(track.file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    </div>
                                    
                                    {track.status === 'processing' ? (
                                        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                                            <div className="h-full bg-cyan-500 transition-all duration-300 ease-out" style={{ width: `${track.progress}%` }}></div>
                                        </div>
                                    ) : track.status === 'completed' ? (
                                        <div className="flex items-center gap-3 text-xs mt-1">
                                            <span className="text-green-600 dark:text-green-400">Mastered with {MASTERING_STYLES.find(s => s.id === track.styleId)?.name}</span>
                                            <button 
                                                onClick={() => setSelectedAnalysis(track)}
                                                className="text-cyan-600 dark:text-cyan-400 font-bold hover:underline flex items-center gap-1"
                                            >
                                                <Eye className="w-3 h-3" /> View Report
                                            </button>
                                        </div>
                                    ) : track.status === 'error' ? (
                                        <div className="text-xs text-red-500 mt-1">Processing Failed</div>
                                    ) : (
                                        <div className="flex items-center gap-2 mt-1">
                                            <select 
                                                    value={track.styleId} 
                                                    onChange={(e) => updateTrackStyle(track.id, e.target.value)}
                                                    className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 rounded px-2 py-0.5 focus:outline-none focus:border-cyan-500"
                                            >
                                                {MASTERING_STYLES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    {track.status === 'completed' && track.resultUrl && (
                                        <>
                                            <button 
                                                    onClick={() => handlePreview(track)}
                                                    className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white transition-colors" 
                                                    title="Preview"
                                            >
                                                <Play className="w-4 h-4 fill-current" />
                                            </button>
                                            <a href={track.resultUrl} download={`mastered-${track.file.name}`} className="p-2 rounded-full bg-green-600 hover:bg-green-500 text-white transition-colors shadow-sm" title="Download">
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </>
                                    )}
                                    {track.status === 'idle' && (
                                        <button onClick={() => removeTrack(track.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
