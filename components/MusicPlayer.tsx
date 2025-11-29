import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Repeat, Shuffle, Maximize2, ChevronDown, ListMusic, Heart } from 'lucide-react';
import { Track } from '../types';

interface MusicPlayerProps {
  queue: Track[];
  initialIndex?: number;
  isPlaying: boolean;
  onPlayPause: (playing: boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onClose?: () => void;
}

export const MusicPlayer: React.FC<MusicPlayerProps> = ({ 
  queue, 
  initialIndex = 0, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrev 
}) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const audio = audioRef.current;
    
    // Configure handlers
    const updateProgress = () => setProgress(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
        onNext();
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNext]);

  // Handle source changes and Play/Pause
  useEffect(() => {
    const audio = audioRef.current;
    const currentTrack = queue[currentIndex];

    if (!currentTrack) return;

    // If source changed or not set
    if (audio.src !== currentTrack.audioUrl) {
        audio.src = currentTrack.audioUrl || '';
        audio.crossOrigin = 'anonymous'; // Important for visualizers/CORS
    }

    if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => console.log("Auto-play prevented:", error));
        }
    } else {
        audio.pause();
    }

    // Update Media Session API Metadata (Lock Screen controls)
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.title,
            artist: currentTrack.artist,
            album: "SoundForge Catalog",
            artwork: [{ src: currentTrack.image, sizes: '512x512', type: 'image/png' }]
        });

        navigator.mediaSession.setActionHandler('play', () => onPlayPause(true));
        navigator.mediaSession.setActionHandler('pause', () => onPlayPause(false));
        navigator.mediaSession.setActionHandler('previoustrack', onPrev);
        navigator.mediaSession.setActionHandler('nexttrack', onNext);
    }

  }, [currentIndex, isPlaying, queue, onPlayPause, onNext, onPrev]);

  useEffect(() => {
      if (audioRef.current) {
          audioRef.current.volume = volume;
      }
  }, [volume]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = Number(e.target.value);
      audioRef.current.currentTime = newTime;
      setProgress(newTime);
  };

  const formatTime = (time: number) => {
      const min = Math.floor(time / 60);
      const sec = Math.floor(time % 60);
      return `${min}:${sec < 10 ? '0' + sec : sec}`;
  };

  const currentTrack = queue[currentIndex];
  if (!currentTrack) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[60] transition-all duration-300 ${isExpanded ? 'h-screen bg-slate-950' : 'h-24 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 backdrop-blur-lg shadow-2xl'}`}>
      
      {/* Expanded View Header */}
      {isExpanded && (
          <div className="p-6 flex justify-between items-center text-white">
              <button onClick={() => setIsExpanded(false)}><ChevronDown className="w-8 h-8" /></button>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Now Playing</span>
              <button><ListMusic className="w-6 h-6" onClick={() => setShowQueue(!showQueue)} /></button>
          </div>
      )}

      {/* Main Player Content */}
      <div className={`flex ${isExpanded ? 'flex-col items-center justify-center h-[calc(100vh-100px)] px-8' : 'flex-row items-center justify-between h-full px-4 md:px-8 max-w-7xl mx-auto'}`}>
          
          {/* Track Info */}
          <div className={`flex items-center gap-4 ${isExpanded ? 'flex-col text-center w-full mb-8' : 'w-1/3'}`}>
              <div className={`relative group ${isExpanded ? 'w-64 h-64 md:w-96 md:h-96 shadow-2xl' : 'w-14 h-14'}`}>
                  <img src={currentTrack.image} alt={currentTrack.title} className={`w-full h-full object-cover rounded-xl ${isPlaying && !isExpanded ? 'animate-[spin_10s_linear_infinite]' : ''}`} />
                  {!isExpanded && (
                      <button onClick={() => setIsExpanded(true)} className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
                          <Maximize2 className="w-6 h-6 text-white" />
                      </button>
                  )}
              </div>
              <div className={`${isExpanded ? 'mt-6 space-y-2' : 'min-w-0'}`}>
                  <h3 className={`font-bold text-slate-900 dark:text-white truncate ${isExpanded ? 'text-2xl' : 'text-sm'}`}>{currentTrack.title}</h3>
                  <p className={`text-slate-500 dark:text-slate-400 truncate ${isExpanded ? 'text-lg' : 'text-xs'}`}>{currentTrack.artist}</p>
              </div>
              {isExpanded && (
                  <button className="mt-4 text-cyan-500 hover:text-cyan-400"><Heart className="w-6 h-6" /></button>
              )}
          </div>

          {/* Controls */}
          <div className={`flex flex-col items-center ${isExpanded ? 'w-full max-w-2xl' : 'w-1/3'}`}>
              <div className="flex items-center gap-6 mb-2">
                  <button onClick={() => {}} className="text-slate-400 hover:text-white hidden md:block"><Shuffle className="w-4 h-4" /></button>
                  <button onClick={onPrev} className="text-slate-900 dark:text-white hover:text-cyan-500"><SkipBack className={`${isExpanded ? 'w-8 h-8' : 'w-5 h-5'}`} /></button>
                  <button 
                    onClick={() => onPlayPause(!isPlaying)}
                    className={`rounded-full flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105 ${isExpanded ? 'w-16 h-16' : 'w-10 h-10'}`}
                  >
                      {isPlaying ? <Pause className={`${isExpanded ? 'w-8 h-8' : 'w-5 h-5'}`} /> : <Play className={`${isExpanded ? 'w-8 h-8 ml-1' : 'w-5 h-5 ml-0.5'}`} />}
                  </button>
                  <button onClick={onNext} className="text-slate-900 dark:text-white hover:text-cyan-500"><SkipForward className={`${isExpanded ? 'w-8 h-8' : 'w-5 h-5'}`} /></button>
                  <button onClick={() => {}} className="text-slate-400 hover:text-white hidden md:block"><Repeat className="w-4 h-4" /></button>
              </div>
              
              <div className="w-full flex items-center gap-3 text-xs text-slate-500 font-mono">
                  <span>{formatTime(progress)}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max={duration || 1} 
                    value={progress} 
                    onChange={handleSeek}
                    className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                  <span>{formatTime(duration)}</span>
              </div>
          </div>

          {/* Volume & Extras */}
          <div className={`flex items-center justify-end gap-4 ${isExpanded ? 'hidden' : 'w-1/3'}`}>
              <div className="flex items-center gap-2 w-32 group">
                  <Volume2 className="w-4 h-4 text-slate-400" />
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.01" 
                    value={volume} 
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-400 opacity-50 group-hover:opacity-100 transition-opacity" 
                  />
              </div>
              <button onClick={() => setIsExpanded(true)} className="text-slate-400 hover:text-white p-2">
                  <Maximize2 className="w-4 h-4" />
              </button>
          </div>
      </div>
    </div>
  );
};