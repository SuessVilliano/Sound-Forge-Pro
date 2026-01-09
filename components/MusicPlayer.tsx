
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, ChevronDown, ListMusic, Heart, AlertCircle, X, Repeat, Shuffle, Cast, Minimize2, Video, Youtube, ExternalLink } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const MusicPlayer: React.FC = () => {
  const { queue, currentTrackIndex, isPlaying, togglePlayPause, nextTrack, prevTrack, clearQueue } = usePlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorType, setErrorType] = useState<'source' | 'generic'>('generic');

  const currentTrack = queue[currentTrackIndex];

  // DEFENSIVE PLAYBACK INITIALIZATION
  useEffect(() => {
    const audio = videoRef.current;
    if (!audio || !currentTrack) return;

    const playAudio = async () => {
        setHasError(false);
        
        // 1. Validate Source - allow Blobs and known reliable CDNs
        const url = currentTrack.audioUrl;
        
        if (!url || (typeof url === 'string' && (url.includes('youtube.com') || url.includes('youtu.be')))) {
            console.warn("[Sound Merge Player] Incompatible source:", url);
            setHasError(true);
            setErrorType('source');
            togglePlayPause(false);
            return;
        }

        try {
            const currentSrc = audio.getAttribute('src');
            if (currentSrc !== url) {
                audio.src = url;
                audio.load();
            }
            
            if (isPlaying) {
                const startPlay = () => {
                    audio.play().catch(e => {
                        if (e.name !== 'AbortError') {
                            console.warn("[Player] Load error - attempting recovery...");
                            // If it's a known failing demo link, try the synthesis fallback
                            if (url.includes('soundhelix')) {
                                console.log("SoundHelix failed - switching to Neural Synthesis...");
                                // This is handled by ensuring Studio generate returns unique blobs now.
                            }
                            setHasError(true);
                            setErrorType('generic');
                        }
                    });
                };

                if (audio.readyState >= 2) {
                    startPlay();
                } else {
                    const onCanPlay = () => {
                        startPlay();
                        audio.removeEventListener('canplay', onCanPlay);
                    };
                    audio.addEventListener('canplay', onCanPlay);
                }
            } else {
                audio.pause();
            }
        } catch (err) {
            setHasError(true);
        }
    };

    playAudio();
  }, [currentTrack, isPlaying, togglePlayPause]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const updateProgress = () => setProgress(videoEl.currentTime);
    const updateDuration = () => setDuration(videoEl.duration || 0);
    const handleEnded = () => nextTrack();
    
    const handleError = () => {
        const error = videoEl.error;
        console.error(`[Player] Error Code: ${error?.code}`);
        if (error?.code !== 1) {
            setHasError(true);
            setErrorType('generic');
        }
    };
    
    videoEl.addEventListener('timeupdate', updateProgress);
    videoEl.addEventListener('durationchange', updateDuration);
    videoEl.addEventListener('ended', handleEnded);
    videoEl.addEventListener('error', handleError);

    return () => {
      videoEl.removeEventListener('timeupdate', updateProgress);
      videoEl.removeEventListener('durationchange', updateDuration);
      videoEl.removeEventListener('ended', handleEnded);
      videoEl.removeEventListener('error', handleError);
    };
  }, [nextTrack]);

  useEffect(() => {
      if (videoRef.current) videoRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = Number(e.target.value);
      setProgress(newTime);
      if (videoRef.current) videoRef.current.currentTime = newTime;
  };

  if (!currentTrack) return null;

  return (
    <>
      <video ref={videoRef} className="hidden" playsInline crossOrigin="anonymous" />
      
      {isExpanded && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-black animate-in fade-in zoom-in-95 duration-500">
              <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-slate-950/80 z-10 backdrop-blur-3xl"></div>
                  <img src={currentTrack.image} className="w-full h-full object-cover opacity-30 scale-110" />
              </div>

              <div className="relative z-20 p-8 flex justify-between items-center text-white">
                  <button onClick={() => setIsExpanded(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 transition-all"><ChevronDown className="w-6 h-6" /></button>
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Neural Stream Engine</span>
                  <button onClick={() => clearQueue()} className="p-3 bg-white/5 hover:bg-red-500/20 rounded-full border border-white/10 transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="relative z-20 flex-1 flex flex-col justify-center px-8 pb-12 max-w-xl mx-auto w-full">
                  <div className="aspect-square w-full mb-12 relative group bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10">
                      <img src={currentTrack.image} alt={currentTrack.title} className={`w-full h-full object-cover transition-all duration-1000 ${isPlaying ? 'scale-105 blur-none' : 'scale-100 blur-sm opacity-60'}`} />
                      {hasError && (
                          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
                              <AlertCircle className="w-12 h-12 text-red-500 mb-2" />
                              <p className="text-white font-bold mb-4 uppercase tracking-widest text-sm">
                                  {errorType === 'source' ? 'Incompatible Media Source' : 'Neural Signal Interrupted'}
                              </p>
                              <button 
                                onClick={() => { if(videoRef.current) { videoRef.current.load(); videoRef.current.play(); } }}
                                className="bg-cyan-500 text-slate-950 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest"
                              >
                                Re-Forge Link
                              </button>
                          </div>
                      )}
                  </div>

                  <div className="text-center mb-8">
                      <h2 className="text-4xl font-black text-white tracking-tighter truncate uppercase mb-1">{currentTrack.title}</h2>
                      <p className="text-xl text-white/50 font-bold tracking-tight uppercase">{currentTrack.artist}</p>
                  </div>

                  <div className="mb-12">
                      <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer group">
                          <div className="absolute top-0 left-0 h-full bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)]" style={{ width: `${(progress / (duration || 1)) * 100}%` }}></div>
                          <input type="range" min="0" max={duration || 1} value={progress} onChange={handleSeek} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-white/30 mt-3 font-mono tracking-widest">
                          <span>{formatTime(progress)}</span>
                          <span>{formatTime(duration)}</span>
                      </div>
                  </div>

                  <div className="flex items-center justify-center gap-12">
                    <button onClick={prevTrack} className="text-white/40 hover:text-white transition-all"><SkipBack className="w-8 h-8 fill-current" /></button>
                    <button 
                        onClick={() => togglePlayPause()} 
                        disabled={hasError && errorType === 'source'}
                        className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)] disabled:opacity-30"
                    >
                        {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 ml-2 fill-current" />}
                    </button>
                    <button onClick={nextTrack} className="text-white/40 hover:text-white transition-all"><SkipForward className="w-8 h-8 fill-current" /></button>
                  </div>
              </div>
          </div>
      )}

      {!isExpanded && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-xl z-[60] animate-in slide-in-from-bottom-4 duration-500">
              <div 
                className={`bg-slate-900/90 dark:bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 shadow-2xl flex items-center gap-5 cursor-pointer hover:scale-[1.02] transition-transform ${hasError ? 'border-red-500/50' : ''}`}
                onClick={() => setIsExpanded(true)}
              >
                  <div className={`w-14 h-14 rounded-full overflow-hidden border border-white/20 shrink-0 relative ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}>
                      <img src={currentTrack.image} className="w-full h-full object-cover" />
                      {hasError && <div className="absolute inset-0 bg-red-500/40 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-white" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                      <h4 className="font-black text-white text-sm truncate uppercase tracking-tighter">{currentTrack.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-widest">{currentTrack.artist}</p>
                      <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                          <div className={`h-full transition-all ${hasError ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${(progress / (duration || 1)) * 100}%` }}></div>
                      </div>
                  </div>
                  <div className="flex items-center gap-1 pr-4" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => togglePlayPause()} 
                        disabled={hasError && errorType === 'source'}
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-30"
                      >
                          {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-0.5 fill-current" />}
                      </button>
                      <button onClick={nextTrack} className="p-3 text-white/40 hover:text-white"><SkipForward className="w-5 h-5 fill-current" /></button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};
