
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Maximize2, ChevronDown, ListMusic, Heart, AlertCircle } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

// Props are optional as we use context
interface MusicPlayerProps {
  queue?: any[];
  initialIndex?: number;
  isPlaying?: boolean;
  onPlayPause?: (playing: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onClose?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = () => {
  const { queue, currentTrackIndex, isPlaying, togglePlayPause, nextTrack, prevTrack } = usePlayer();
  
  // Audio Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Visualizer Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationRef = useRef<number>(0);

  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [visualizerEnabled, setVisualizerEnabled] = useState(true);

  // Initialize Audio Element safely with CORS support
  if (!audioRef.current) {
      audioRef.current = new Audio();
      // Crucial for Visualizer to work with external URLs
      audioRef.current.crossOrigin = "anonymous"; 
  }

  // --- AUDIO SETUP & HANDLERS ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => nextTrack();
    
    const handleError = (e: Event) => {
        const err = audio.error;
        console.warn(`Audio Playback Error: Code ${err?.code}, Message: ${err?.message || 'N/A'}`);

        // Attempt recovery from CORS issues (common with external MP3s)
        if (audio.crossOrigin === "anonymous") {
            console.log("Attempting recovery: Disabling CORS/Visualizer and reloading...");
            audio.crossOrigin = null; // Remove CORS requirement
            setVisualizerEnabled(false); // Disable visualizer as it requires CORS
            
            // Force reload of current source
            const currentSrc = audio.src;
            audio.src = currentSrc;
            audio.load();
            
            if (isPlaying) {
                const playPromise = audio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(e => console.error("Recovery play failed:", e));
                }
            }
            setHasError(false); // Reset error state during recovery
            return;
        }

        setHasError(true);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [nextTrack, isPlaying]);

  // --- PLAYBACK CONTROL ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTrack = queue[currentTrackIndex];
    if (!currentTrack) return;

    // Change source if needed
    if (audio.src !== currentTrack.audioUrl) {
        setHasError(false);
        // Reset CORS if we moved to a new track (try visualizer again)
        if (!visualizerEnabled) {
             audio.crossOrigin = "anonymous";
             setVisualizerEnabled(true);
        }
        
        audio.src = currentTrack.audioUrl || '';
        audio.load();
    }

    if (isPlaying) {
        // Resume AudioContext if it was suspended (browser policy)
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(console.error);
        }

        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                // Only warn if it's not an abort error (fast skipping)
                if (error.name !== 'AbortError') {
                    console.warn("Playback prevented/interrupted:", error);
                }
            });
        }
    } else {
        audio.pause();
    }

    // Media Session API Integration
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.title,
            artist: currentTrack.artist,
            artwork: [{ src: currentTrack.image, sizes: '512x512', type: 'image/png' }]
        });
        navigator.mediaSession.setActionHandler('play', () => togglePlayPause(true));
        navigator.mediaSession.setActionHandler('pause', () => togglePlayPause(false));
        navigator.mediaSession.setActionHandler('previoustrack', prevTrack);
        navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
    }

  }, [currentTrackIndex, isPlaying, queue, togglePlayPause, nextTrack, prevTrack]);

  // --- VOLUME CONTROL ---
  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = isMuted ? 0 : volume;
      }
  }, [volume, isMuted]);

  // --- VISUALIZER SETUP ---
  useEffect(() => {
      if (!isExpanded || !audioRef.current || !visualizerEnabled) return;

      let isActive = true;

      const initAudioContext = async () => {
          if (!audioContextRef.current) {
              try {
                  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                  const ctx = new AudioContextClass();
                  const analyser = ctx.createAnalyser();
                  analyser.fftSize = 256; // Optimized size
                  
                  // NOTE: createMediaElementSource requires CORS to access audio data
                  if (!sourceRef.current) {
                      const source = ctx.createMediaElementSource(audioRef.current!);
                      source.connect(analyser);
                      analyser.connect(ctx.destination);
                      sourceRef.current = source;
                  }
                  
                  audioContextRef.current = ctx;
                  analyserRef.current = analyser;
              } catch (e) {
                  console.warn("Visualizer init failed (CORS/Context):", e);
                  setVisualizerEnabled(false); // Switch to CSS fallback
              }
          }
      };

      initAudioContext();

      const renderVisualizer = () => {
          if (!canvasRef.current || !analyserRef.current || !visualizerEnabled) return;
          
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          
          const draw = () => {
              if (!isActive) return;
              
              animationRef.current = requestAnimationFrame(draw);
              analyserRef.current!.getByteFrequencyData(dataArray);

              const width = canvas.width;
              const height = canvas.height;
              ctx.clearRect(0, 0, width, height);

              const barWidth = (width / bufferLength) * 2.5;
              let barHeight;
              let x = 0;

              // Mirror effect: Draw from center
              const centerX = width / 2;

              for (let i = 0; i < bufferLength; i++) {
                  barHeight = (dataArray[i] / 255) * (height * 0.5);

                  const r = barHeight + (25 * (i/bufferLength));
                  const g = 250 * (i/bufferLength);
                  const b = 255;
                  
                  ctx.fillStyle = `rgba(${r},${g},${b}, 0.5)`;
                  
                  ctx.fillRect(centerX + x, height - barHeight, barWidth, barHeight);
                  ctx.fillRect(centerX - x - barWidth, height - barHeight, barWidth, barHeight);

                  x += barWidth + 1;
              }
          };
          draw();
      };

      if (visualizerEnabled) {
          renderVisualizer();
      }

      return () => {
          isActive = false;
          cancelAnimationFrame(animationRef.current);
      };
  }, [isExpanded, isPlaying, visualizerEnabled]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = Number(e.target.value);
      if (audioRef.current) audioRef.current.currentTime = newTime;
      setProgress(newTime);
  };

  const formatTime = (time: number) => {
      if (isNaN(time)) return "0:00";
      const min = Math.floor(time / 60);
      const sec = Math.floor(time % 60);
      return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const currentTrack = queue[currentTrackIndex];
  if (!currentTrack) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[60] transition-all duration-500 ease-in-out ${isExpanded ? 'h-screen bg-slate-950' : 'h-24 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.2)]'}`}>
      
      {/* EXPANDED VIEW */}
      {isExpanded && (
          <div className="relative h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
              
              {/* Visualizer: Canvas or Fallback */}
              {visualizerEnabled ? (
                  <canvas 
                      ref={canvasRef} 
                      width={window.innerWidth} 
                      height={window.innerHeight / 2}
                      className="absolute bottom-0 left-0 w-full h-2/3 pointer-events-none opacity-40"
                  />
              ) : (
                  <div className="absolute bottom-0 left-0 w-full h-1/2 flex items-end justify-center gap-1 pointer-events-none opacity-20 px-8">
                      {isPlaying && Array.from({length: 40}).map((_, i) => (
                          <div 
                            key={i} 
                            className="w-full bg-cyan-500 rounded-t-sm animate-pulse" 
                            style={{ 
                                height: `${Math.random() * 60 + 10}%`, 
                                animationDuration: `${Math.random() * 0.5 + 0.5}s` 
                            }} 
                          />
                      ))}
                  </div>
              )}
              
              {/* Header */}
              <div className="p-6 flex justify-between items-center text-white relative z-10">
                  <button onClick={() => setIsExpanded(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><ChevronDown className="w-8 h-8" /></button>
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">Now Playing</span>
                  <button className={`p-2 rounded-full transition-colors ${showQueue ? 'bg-white/20' : 'hover:bg-white/10'}`} onClick={() => setShowQueue(!showQueue)}>
                      <ListMusic className="w-6 h-6" />
                  </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12 relative z-10">
                  {/* Album Art */}
                  <div className="relative group mb-10 w-full max-w-sm aspect-square">
                      {hasError ? (
                          <div className="w-full h-full rounded-2xl bg-slate-800 flex flex-col items-center justify-center border border-red-500/30">
                              <AlertCircle className="w-16 h-16 text-red-500 mb-2" />
                              <span className="text-red-400 font-bold">Playback Error</span>
                              <span className="text-xs text-red-400/70 mt-1">Source unavailable (CORS/404)</span>
                          </div>
                      ) : (
                          <img 
                            src={currentTrack.image} 
                            alt={currentTrack.title} 
                            className={`w-full h-full object-cover rounded-2xl shadow-2xl border border-white/10 ${isPlaying ? 'scale-100' : 'scale-95 opacity-80'} transition-all duration-700`} 
                          />
                      )}
                      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10"></div>
                  </div>

                  {/* Info */}
                  <div className="text-center mb-8 space-y-1">
                      <h2 className="text-3xl font-bold text-white tracking-tight">{currentTrack.title}</h2>
                      <p className="text-lg text-slate-400 font-medium">{currentTrack.artist}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full max-w-2xl flex items-center gap-4 text-xs font-mono text-slate-400 mb-8">
                      <span>{formatTime(progress)}</span>
                      <div className="flex-1 relative h-1.5 group cursor-pointer">
                          <div className="absolute inset-0 bg-slate-800 rounded-full"></div>
                          <div 
                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full group-hover:from-cyan-400 group-hover:to-blue-400" 
                            style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                          >
                              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max={duration || 1} 
                            value={progress} 
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                      </div>
                      <span>{formatTime(duration)}</span>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-8 md:gap-12">
                      <div className="relative group flex items-center justify-center">
                          <button 
                            onClick={() => setIsMuted(!isMuted)} 
                            className="text-slate-400 hover:text-white p-2"
                          >
                              {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                          </button>
                          {/* Hover Slider Popup */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-10 h-32 bg-slate-800 border border-slate-700 rounded-full flex flex-col items-center justify-end py-3 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all duration-300 shadow-xl">
                              <input 
                                type="range" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                value={volume} 
                                onChange={(e) => setVolume(Number(e.target.value))}
                                className="w-1.5 h-24 bg-slate-600 rounded-full appearance-none cursor-pointer accent-cyan-500 [writing-mode:vertical-lr] [direction:rtl]"
                              />
                          </div>
                      </div>

                      <button onClick={prevTrack} className="text-white hover:text-cyan-400 transition-colors"><SkipBack className="w-10 h-10" /></button>
                      
                      <button 
                        onClick={() => togglePlayPause()}
                        className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-slate-950 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                      >
                          {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
                      </button>
                      
                      <button onClick={nextTrack} className="text-white hover:text-cyan-400 transition-colors"><SkipForward className="w-10 h-10" /></button>
                      
                      <button className="text-slate-400 hover:text-white p-2"><Shuffle className="w-6 h-6" /></button>
                  </div>
              </div>
          </div>
      )}

      {/* COMPACT VIEW */}
      {!isExpanded && (
          <div className="flex flex-row items-center justify-between h-full px-4 md:px-8 max-w-7xl mx-auto">
              {/* Track Info */}
              <div className="flex items-center gap-4 w-1/3">
                  <div className="relative group w-14 h-14 shrink-0">
                      <img src={currentTrack.image} alt="Cover" className={`w-full h-full object-cover rounded-lg shadow-md ${isPlaying ? 'animate-[spin_8s_linear_infinite]' : ''}`} />
                      <button 
                        onClick={() => setIsExpanded(true)} 
                        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg transition-opacity backdrop-blur-[1px]"
                      >
                          <Maximize2 className="w-6 h-6 text-white" />
                      </button>
                  </div>
                  <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm">{currentTrack.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 truncate text-xs">{currentTrack.artist}</p>
                      {hasError && <span className="text-[10px] text-red-500 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Error</span>}
                  </div>
                  <button className="text-slate-400 hover:text-red-500 transition-colors hidden sm:block"><Heart className="w-4 h-4" /></button>
              </div>

              {/* Center Controls */}
              <div className="flex flex-col items-center w-1/3">
                  <div className="flex items-center gap-6 mb-1">
                      <button onClick={prevTrack} className="text-slate-900 dark:text-white hover:text-cyan-500 transition-colors"><SkipBack className="w-5 h-5" /></button>
                      <button 
                        onClick={() => togglePlayPause()}
                        className="w-10 h-10 bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                      >
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                      </button>
                      <button onClick={nextTrack} className="text-slate-900 dark:text-white hover:text-cyan-500 transition-colors"><SkipForward className="w-5 h-5" /></button>
                  </div>
                  
                  <div className="w-full flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                      <span className="w-8 text-right">{formatTime(progress)}</span>
                      <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full relative group cursor-pointer">
                          <div 
                            className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full" 
                            style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                          ></div>
                          <input 
                            type="range" 
                            min="0" 
                            max={duration || 1} 
                            value={progress} 
                            onChange={handleSeek}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                      </div>
                      <span className="w-8">{formatTime(duration)}</span>
                  </div>
              </div>

              {/* Right Controls */}
              <div className="flex items-center justify-end gap-4 w-1/3">
                  <div className="flex items-center gap-2 group relative">
                      <button onClick={() => setIsMuted(!isMuted)}>
                          {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-slate-400" />}
                      </button>
                      
                      <div className="w-24 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full relative overflow-hidden opacity-50 group-hover:opacity-100 transition-opacity">
                          <div className="absolute top-0 left-0 h-full bg-slate-500" style={{ width: `${volume * 100}%` }}></div>
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={volume} 
                            onChange={(e) => setVolume(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                          />
                      </div>
                  </div>
                  <button onClick={() => setIsExpanded(true)} className="text-slate-400 hover:text-white p-2">
                      <Maximize2 className="w-4 h-4" />
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
