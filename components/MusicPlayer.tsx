
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, ChevronDown, ListMusic, Heart, AlertCircle, X, Repeat, Shuffle, Cast, Minimize2, Video, Youtube } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const getYoutubeEmbed = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&controls=0&enablejsapi=1` : null;
};

export const MusicPlayer: React.FC = () => {
  const { queue, currentTrackIndex, isPlaying, togglePlayPause, nextTrack, prevTrack, clearQueue } = usePlayer();
  const videoRef = useRef<HTMLVideoElement>(null);
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
  const [showVideo, setShowVideo] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const currentTrack = queue[currentTrackIndex];

  useEffect(() => {
    const syncLikeStatus = () => {
      if (currentTrack) {
        try {
          const saved = localStorage.getItem('sf_track_favorites');
          const favs: string[] = saved ? JSON.parse(saved) : [];
          setIsLiked(favs.includes(currentTrack.id));
        } catch (e) { console.error(e); }
      }
    };
    syncLikeStatus();
    window.addEventListener('favoritesUpdated', syncLikeStatus);
    return () => window.removeEventListener('favoritesUpdated', syncLikeStatus);
  }, [currentTrack]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const updateProgress = () => { if (!isCasting) setProgress(videoEl.currentTime); };
    const updateDuration = () => setDuration(videoEl.duration || 0);
    const handleEnded = () => nextTrack();
    const handleError = () => setHasError(true);
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
  }, [nextTrack, isPlaying, isCasting]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !currentTrack) return;
    if (isCasting) { videoEl.pause(); return; }
    if (showYoutube) { videoEl.pause(); return; }
    if (videoEl.src !== currentTrack.audioUrl) {
        setHasError(false);
        videoEl.src = currentTrack.audioUrl || '';
        videoEl.load();
    }
    if (isPlaying) videoEl.play().catch(() => {});
    else videoEl.pause();
  }, [currentTrackIndex, isPlaying, queue, isCasting, showYoutube]);

  useEffect(() => {
      if (videoRef.current) videoRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
      if (!isExpanded || !videoRef.current || !visualizerEnabled || isCasting || showVideo || showYoutube) return;
      let isActive = true;
      const initVisualizer = async () => {
          if (!audioContextRef.current) {
              try {
                  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                  const ctx = new AudioContextClass();
                  const analyser = ctx.createAnalyser();
                  analyser.fftSize = 128;
                  if (!sourceRef.current && videoRef.current) {
                      const source = ctx.createMediaElementSource(videoRef.current);
                      source.connect(analyser);
                      analyser.connect(ctx.destination);
                      sourceRef.current = source;
                  }
                  audioContextRef.current = ctx;
                  analyserRef.current = analyser;
              } catch (e) { setVisualizerEnabled(false); }
          }
          if (canvasRef.current && analyserRef.current) {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d')!;
              const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
              const draw = () => {
                  if (!isActive) return;
                  animationRef.current = requestAnimationFrame(draw);
                  analyserRef.current!.getByteFrequencyData(dataArray);
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  const barWidth = (canvas.width / dataArray.length) * 2;
                  let x = 0;
                  for (let i = 0; i < dataArray.length; i++) {
                      const barHeight = (dataArray[i] / 255) * canvas.height;
                      ctx.fillStyle = `rgba(255, 255, 255, 0.3)`;
                      ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);
                      x += barWidth;
                  }
              };
              draw();
          }
      };
      initVisualizer();
      return () => { isActive = false; cancelAnimationFrame(animationRef.current); };
  }, [isExpanded, isPlaying, visualizerEnabled, isCasting, showVideo, showYoutube]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = Number(e.target.value);
      setProgress(newTime);
      if (videoRef.current) videoRef.current.currentTime = newTime;
  };

  const toggleFavorite = () => {
      if (!currentTrack) return;
      try {
          const saved = localStorage.getItem('sf_track_favorites');
          const favs: string[] = saved ? JSON.parse(saved) : [];
          const next = favs.includes(currentTrack.id) ? favs.filter(id => id !== currentTrack.id) : [...favs, currentTrack.id];
          localStorage.setItem('sf_track_favorites', JSON.stringify(next));
          setIsLiked(!isLiked);
          window.dispatchEvent(new Event('favoritesUpdated'));
      } catch (e) { console.error(e); }
  };

  if (!currentTrack) return null;
  const isVideoTrack = currentTrack.audioUrl?.endsWith('.mp4') || currentTrack.audioUrl?.startsWith('data:video');

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
                  <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Secure Stream Engine</span>
                  <button onClick={() => clearQueue()} className="p-3 bg-white/5 hover:bg-red-500/20 rounded-full border border-white/10 transition-all"><X className="w-6 h-6" /></button>
              </div>

              <div className="relative z-20 flex-1 flex flex-col justify-center px-8 pb-12 max-w-xl mx-auto w-full">
                  <div className="aspect-square w-full mb-12 relative group bg-slate-900 rounded-[3rem] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10">
                      {showYoutube && currentTrack.videoUrl ? (
                          <iframe src={getYoutubeEmbed(currentTrack.videoUrl)} className="w-full h-full border-0" allow="autoplay; encrypted-media" />
                      ) : (
                          <>
                            <img src={currentTrack.image} alt={currentTrack.title} className={`w-full h-full object-cover transition-all duration-1000 ${isPlaying ? 'scale-105 blur-none' : 'scale-100 blur-sm opacity-60'}`} />
                            {visualizerEnabled && !isCasting && !showQueue && <canvas ref={canvasRef} width={400} height={100} className="absolute bottom-10 left-10 right-10 h-20 opacity-40 pointer-events-none mix-blend-screen" />}
                          </>
                      )}
                  </div>

                  <div className="flex justify-between items-end mb-8">
                      <div className="min-w-0">
                          <h2 className="text-4xl font-black text-white tracking-tighter truncate">{currentTrack.title}</h2>
                          <p className="text-xl text-white/50 font-bold tracking-tight">{currentTrack.artist}</p>
                      </div>
                      <button onClick={toggleFavorite} className={`p-4 rounded-full transition-all ${isLiked ? 'text-red-500 bg-red-500/10' : 'text-white/20 hover:text-white bg-white/5'}`}><Heart className={`w-8 h-8 ${isLiked ? 'fill-current' : ''}`} /></button>
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

                  <div className="flex items-center justify-between">
                      <button className="text-white/20 hover:text-white transition-colors"><Shuffle className="w-5 h-5" /></button>
                      <div className="flex items-center gap-10">
                        <button onClick={prevTrack} className="text-white/80 hover:text-white transition-all hover:scale-110"><SkipBack className="w-10 h-10 fill-current" /></button>
                        <button onClick={() => togglePlayPause()} className="w-24 h-24 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                            {isPlaying ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 ml-2 fill-current" />}
                        </button>
                        <button onClick={nextTrack} className="text-white/80 hover:text-white transition-all hover:scale-110"><SkipForward className="w-10 h-10 fill-current" /></button>
                      </div>
                      <button onClick={() => setShowQueue(!showQueue)} className={`transition-colors ${showQueue ? 'text-cyan-400' : 'text-white/20 hover:text-white'}`}><ListMusic className="w-5 h-5" /></button>
                  </div>
              </div>
          </div>
      )}

      {!isExpanded && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-xl z-[60] animate-in slide-in-from-bottom-4 duration-500">
              <div 
                className="bg-slate-900/90 dark:bg-black/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-3 shadow-2xl flex items-center gap-5 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => setIsExpanded(true)}
              >
                  <div className={`w-14 h-14 rounded-full overflow-hidden border border-white/20 shrink-0 relative ${isPlaying ? 'animate-[spin_12s_linear_infinite]' : ''}`}>
                      <img src={currentTrack.image} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                      <h4 className="font-black text-white text-sm truncate uppercase tracking-tighter">{currentTrack.title}</h4>
                      <p className="text-[10px] font-bold text-slate-500 truncate uppercase tracking-widest">{currentTrack.artist}</p>
                      <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                          <div className="h-full bg-cyan-500 transition-all" style={{ width: `${(progress / (duration || 1)) * 100}%` }}></div>
                      </div>
                  </div>
                  <div className="flex items-center gap-1 pr-4" onClick={e => e.stopPropagation()}>
                      <button onClick={() => togglePlayPause()} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg">
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
