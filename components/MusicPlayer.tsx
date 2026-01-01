
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2, ChevronDown, ListMusic, Heart, AlertCircle, X, Repeat, Shuffle, Cast, Minimize2, Video, Youtube } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// Helper to extract Youtube Embed URL
const getYoutubeEmbed = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : null;
    return id ? `https://www.youtube.com/embed/${id}?autoplay=1&controls=0&enablejsapi=1` : null;
};

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

declare global {
    interface Window {
        chrome: any;
        cast: any;
        __onGCastApiAvailable: (isAvailable: boolean) => void;
    }
}

const loadMediaToCast = (track: any, session: any) => {
    if (!session || !track) return;
    try {
        const mediaInfo = new window.chrome.cast.media.MediaInfo(track.audioUrl, 'audio/mp3');
        const metadata = new window.chrome.cast.media.MusicTrackMediaMetadata();
        metadata.metadataType = window.chrome.cast.media.MetadataType.MUSIC_TRACK;
        metadata.title = track.title;
        metadata.artist = track.artist;
        metadata.images = [new window.chrome.cast.Image(track.image)];
        
        mediaInfo.metadata = metadata;

        const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
        session.loadMedia(request).then(
            () => console.log('Load succeed'),
            (errorCode: any) => console.log('Error code: ' + errorCode)
        );
    } catch (e) {
        console.error("Cast Error", e);
    }
};

export const MusicPlayer: React.FC<MusicPlayerProps> = () => {
  const { queue, currentTrackIndex, isPlaying, togglePlayPause, nextTrack, prevTrack, clearQueue } = usePlayer();
  
  // Media Refs (Using <video> for both audio and video files)
  const videoRef = useRef<HTMLVideoElement>(null);
  
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
  
  // Video Mode State
  const [showVideo, setShowVideo] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);

  // Cast State
  const [isCasting, setIsCasting] = useState(false);
  const [castSession, setCastSession] = useState<any>(null);
  const [castPlayer, setCastPlayer] = useState<any>(null);
  const [castController, setCastController] = useState<any>(null);
  
  // Favorite State
  const [isLiked, setIsLiked] = useState(false);

  const currentTrack = queue[currentTrackIndex];

  // --- SYNC LIKE STATUS WITH LOCALSTORAGE ---
  useEffect(() => {
    const syncLikeStatus = () => {
      if (currentTrack) {
        try {
          const saved = localStorage.getItem('sf_track_favorites');
          const favs: string[] = saved ? JSON.parse(saved) : [];
          setIsLiked(favs.includes(currentTrack.id));
        } catch (e) {
          console.error("Failed to parse favorites", e);
        }
      }
    };

    syncLikeStatus();
    
    // Listen for changes from Catalog or Library
    window.addEventListener('favoritesUpdated', syncLikeStatus);
    return () => window.removeEventListener('favoritesUpdated', syncLikeStatus);
  }, [currentTrack]);

  // --- DOM EVENT LISTENERS FOR VIDEO ELEMENT ---
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    
    const updateProgress = () => {
        if (!isCasting) setProgress(videoEl.currentTime);
    };
    const updateDuration = () => setDuration(videoEl.duration || 0);
    const handleEnded = () => nextTrack();
    
    const handleError = (e: Event) => {
        const err = videoEl.error;
        if (err && err.code !== 4) {
            console.warn("Media Error Event:", err.message || err.code);
        }

        // Recovery attempt for CORS/Visualizer issues
        if (videoEl.crossOrigin === "anonymous") {
            videoEl.crossOrigin = null; 
            setVisualizerEnabled(false); 
            if (videoEl.src) {
                const currentSrc = videoEl.src;
                videoEl.src = currentSrc;
                videoEl.load();
                if (isPlaying && !isCasting) {
                    videoEl.play().catch(console.error);
                }
                setHasError(false);
                return;
            }
        }
        setHasError(true);
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
  }, [nextTrack, isPlaying, isCasting]);

  // --- TRACK LOADING & PLAYBACK LOGIC ---
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    
    if (!currentTrack) {
        videoEl.removeAttribute('src');
        videoEl.load();
        return;
    }

    if (isCasting) {
        if (!videoEl.paused) videoEl.pause();
        if (castController) castController.playOrPause();
        return; 
    }

    // Determine if we should show YouTube Embed (overriding native player)
    const ytUrl = currentTrack.videoUrl && getYoutubeEmbed(currentTrack.videoUrl);
    
    // Only switch to YouTube mode if specifically requested by user toggling it later,
    // OR if we want auto-switch logic. For now, we load the audioUrl into the player.
    // If showYoutube is active, we pause the native player.
    if (showYoutube && ytUrl) {
        videoEl.pause();
        return;
    }

    const targetSrc = currentTrack.audioUrl;

    if (targetSrc && videoEl.src !== targetSrc) {
        setHasError(false);
        // Reset visualizer CORS if needed
        if (!visualizerEnabled && !hasError) {
             videoEl.crossOrigin = "anonymous";
             setVisualizerEnabled(true);
        }
        videoEl.src = targetSrc;
        videoEl.load();
    } else if (!targetSrc) {
        setHasError(true);
    }

    if (isPlaying && !showYoutube) {
        if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume().catch(console.error);
        }
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                if (error.name !== 'AbortError') console.error("Playback error:", error);
            });
        }
    } else {
        videoEl.pause();
    }

  }, [currentTrackIndex, isPlaying, queue, isCasting, castController, showYoutube]);

  // --- VOLUME CONTROL ---
  useEffect(() => {
      if (videoRef.current) {
          videoRef.current.volume = isMuted ? 0 : volume;
      }
      if (isCasting && castPlayer) {
          castPlayer.volumeLevel = isMuted ? 0 : volume;
          if (castController) castController.setVolumeLevel();
      }
  }, [volume, isMuted, isCasting, castPlayer]);

  // --- VISUALIZER SETUP ---
  useEffect(() => {
      if (!isExpanded || !videoRef.current || !visualizerEnabled || isCasting || showVideo || showYoutube) return;

      let isActive = true;

      const initAudioContext = async () => {
          if (!audioContextRef.current) {
              try {
                  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                  const ctx = new AudioContextClass();
                  const analyser = ctx.createAnalyser();
                  analyser.fftSize = 256; 
                  
                  if (!sourceRef.current && videoRef.current) {
                      const source = ctx.createMediaElementSource(videoRef.current);
                      source.connect(analyser);
                      analyser.connect(ctx.destination);
                      sourceRef.current = source;
                  }
                  
                  audioContextRef.current = ctx;
                  analyserRef.current = analyser;
              } catch (e) {
                  setVisualizerEnabled(false);
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

              const barWidth = (width / bufferLength) * 2; 
              let x = 0;

              for (let i = 0; i < bufferLength; i++) {
                  const barHeight = (dataArray[i] / 255) * height * 0.6;
                  ctx.fillStyle = `rgba(255, 255, 255, 0.4)`;
                  ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight); 
                  x += barWidth;
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
  }, [isExpanded, isPlaying, visualizerEnabled, isCasting, showVideo, showYoutube]);

  // --- CAST SETUP (UNCHANGED) ---
  useEffect(() => {
      const initCast = () => {
          if (window.chrome && window.chrome.cast && window.chrome.cast.isAvailable) {
              const castContext = window.cast.framework.CastContext.getInstance();
              castContext.setOptions({ receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID, autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED });
              castContext.addEventListener(window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED, (event: any) => {
                  switch (event.sessionState) {
                      case window.cast.framework.SessionState.SESSION_STARTED:
                      case window.cast.framework.SessionState.SESSION_RESUMED:
                          setIsCasting(true);
                          const session = castContext.getCurrentSession();
                          setCastSession(session);
                          if (session) {
                              const player = new window.cast.framework.RemotePlayer();
                              const controller = new window.cast.framework.RemotePlayerController(player);
                              setCastPlayer(player);
                              setCastController(controller);
                              controller.addEventListener(window.cast.framework.RemotePlayerEventType.CURRENT_TIME_CHANGED, (e: any) => setProgress(e.value));
                              controller.addEventListener(window.cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED, (e: any) => { if (e.value !== !isPlaying) togglePlayPause(!e.value); });
                              if (currentTrack) loadMediaToCast(currentTrack, session);
                          }
                          break;
                      case window.cast.framework.SessionState.SESSION_ENDED:
                          setIsCasting(false);
                          setCastSession(null);
                          setCastPlayer(null);
                          setCastController(null);
                          if (isPlaying && videoRef.current) videoRef.current.play().catch(console.error);
                          break;
                  }
              });
          }
      };
      if (window.chrome && window.chrome.cast) initCast();
      else window['__onGCastApiAvailable'] = (isAvailable: boolean) => { if (isAvailable) initCast(); };
  }, []);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTime = Number(e.target.value);
      setProgress(newTime);
      if (isCasting && castPlayer) {
          castPlayer.currentTime = newTime;
          castController.seek();
      } else if (videoRef.current) {
          videoRef.current.currentTime = newTime;
      }
  };

  const toggleFavorite = () => {
      if (!currentTrack) return;
      try {
          const saved = localStorage.getItem('sf_track_favorites');
          const favs: string[] = saved ? JSON.parse(saved) : [];
          let newFavs;
          if (favs.includes(currentTrack.id)) {
              newFavs = favs.filter(id => id !== currentTrack.id);
          } else {
              newFavs = [...favs, currentTrack.id];
          }
          localStorage.setItem('sf_track_favorites', JSON.stringify(newFavs));
          setIsLiked(!isLiked);
          // Notify Catalog & Library
          window.dispatchEvent(new Event('favoritesUpdated'));
      } catch (e) {
          console.error("Failed to update favorites", e);
      }
  };

  const handleClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      clearQueue();
  };

  if (!currentTrack) return null;

  const isVideoTrack = currentTrack.audioUrl?.endsWith('.mp4') || currentTrack.audioUrl?.startsWith('data:video');
  const hasYoutube = !!currentTrack.videoUrl;

  return (
    <>
      {/* HIDDEN VIDEO ELEMENT (Primary Player) */}
      <video 
          ref={videoRef} 
          className={isExpanded && showVideo && isVideoTrack ? "fixed inset-0 w-full h-full object-contain z-[90] bg-black pointer-events-none" : "hidden"} 
          playsInline
          crossOrigin="anonymous"
      />

      {/* EXPANDED VIEW - IMMERSIVE OVERLAY */}
      {isExpanded && (
          <div className="fixed inset-0 z-[100] flex flex-col bg-black animate-in fade-in zoom-in-95 duration-300">
              
              {/* Dynamic Background */}
              <div className="absolute inset-0 z-0">
                  <div className="absolute inset-0 bg-slate-900/60 z-10 backdrop-blur-3xl"></div>
                  <img src={currentTrack.image} className="w-full h-full object-cover opacity-50 blur-xl scale-110" />
              </div>

              {/* Header */}
              <div className="relative z-20 p-6 flex justify-between items-center text-white/90">
                  <button onClick={() => setIsExpanded(false)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors shadow-lg" title="Minimize">
                      <ChevronDown className="w-6 h-6" />
                  </button>
                  <span className="text-sm font-bold tracking-widest uppercase opacity-80">Now Playing</span>
                  <div className="flex gap-2">
                      <button onClick={() => setShowQueue(!showQueue)} className={`p-3 rounded-full backdrop-blur-md transition-colors shadow-lg ${showQueue ? 'bg-white text-slate-900' : 'bg-white/10 hover:bg-white/20 text-white'}`} title="Queue">
                          <ListMusic className="w-6 h-6" />
                      </button>
                      <button onClick={handleClose} className="p-3 bg-white/10 hover:bg-red-500/80 rounded-full backdrop-blur-md transition-colors shadow-lg text-white" title="Close Player">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
              </div>

              {/* Content Container */}
              <div className="relative z-20 flex-1 flex flex-col justify-center px-8 pb-12 max-w-2xl mx-auto w-full">
                  
                  {/* Media Display Area */}
                  <div className="aspect-square w-full mb-10 relative group bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
                      
                      {/* 1. YouTube Iframe Overlay */}
                      {showYoutube && hasYoutube && getYoutubeEmbed(currentTrack.videoUrl!) ? (
                          <div className="w-full h-full">
                              <iframe 
                                  src={getYoutubeEmbed(currentTrack.videoUrl!)} 
                                  className="w-full h-full border-0" 
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                  allowFullScreen
                              />
                              {/* Close YT Button */}
                              <button 
                                onClick={() => { setShowYoutube(false); togglePlayPause(true); }}
                                className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                              >
                                  <X className="w-5 h-5" />
                              </button>
                          </div>
                      ) : showVideo && isVideoTrack ? (
                          // 2. Native Video Clone (For visuals)
                          <div className="w-full h-full flex items-center justify-center bg-black">
                              <img src={currentTrack.image} className="w-full h-full object-cover opacity-50" />
                              <div className="absolute inset-0 flex items-center justify-center">
                                  <p className="text-white font-bold bg-black/50 px-4 py-2 rounded-full">Video Playing (Audio Only Mode)</p>
                              </div>
                          </div>
                      ) : (
                          // 3. Album Art
                          <>
                            <img 
                                src={currentTrack.image} 
                                alt={currentTrack.title}
                                className={`w-full h-full object-cover transition-transform duration-700 ${isPlaying ? 'scale-100' : 'scale-95 opacity-90'}`}
                            />
                            {visualizerEnabled && !isCasting && !showQueue && (
                                <canvas 
                                    ref={canvasRef} 
                                    width={400} 
                                    height={100}
                                    className="absolute bottom-8 left-8 right-8 h-24 opacity-60 pointer-events-none mix-blend-overlay"
                                />
                            )}
                          </>
                      )}

                      {/* Video Toggle Controls */}
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                          {isVideoTrack && (
                              <button 
                                onClick={() => setShowVideo(!showVideo)}
                                className={`p-2 rounded-full backdrop-blur-md transition-colors ${showVideo ? 'bg-white text-slate-900' : 'bg-black/40 text-white hover:bg-black/60'}`}
                                title="Toggle Native Video"
                              >
                                  <Video className="w-5 h-5" />
                              </button>
                          )}
                          {hasYoutube && (
                              <button 
                                onClick={() => { setShowYoutube(!showYoutube); if(!showYoutube) togglePlayPause(false); }}
                                className={`p-2 rounded-full backdrop-blur-md transition-colors ${showYoutube ? 'red-600 text-white' : 'bg-black/40 text-white hover:bg-red-600/80'}`}
                                title="Watch on YouTube"
                              >
                                  <Youtube className="w-5 h-5" />
                              </button>
                          )}
                      </div>
                  </div>

                  {/* Track Info */}
                  <div className="flex justify-between items-end mb-8">
                      <div>
                          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-2 line-clamp-2">{currentTrack.title}</h2>
                          <p className="text-lg md:text-xl text-white/70 font-medium">{currentTrack.artist}</p>
                      </div>
                      <button 
                        onClick={toggleFavorite} 
                        className={`p-3 rounded-full bg-white/10 backdrop-blur-md transition-all ${isLiked ? 'text-red-500 bg-white/20' : 'text-white/50 hover:text-white hover:bg-white/20'}`}
                      >
                          <Heart className={`w-7 h-7 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                  </div>

                  {/* Progress Bar (Thick Pill Style) */}
                  <div className="mb-10 group">
                      <div className="relative h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                          <div 
                            className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-100" 
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
                      <div className="flex justify-between text-xs font-bold text-white/50 mt-2 font-mono">
                          <span>{formatTime(progress)}</span>
                          <span>{formatTime(duration)}</span>
                      </div>
                  </div>

                  {/* Main Controls (Material Style) */}
                  <div className="flex items-center justify-between gap-6">
                      <button className="text-white/60 hover:text-white transition-colors p-2"><Shuffle className="w-6 h-6" /></button>
                      <button onClick={prevTrack} className="text-white hover:scale-110 transition-transform"><SkipBack className="w-10 h-10 fill-current" /></button>
                      
                      {/* Play Button - Large Circle */}
                      <button 
                        onClick={() => togglePlayPause()}
                        className="w-20 h-20 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                      >
                          {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 ml-1 fill-current" />}
                      </button>
                      
                      <button onClick={nextTrack} className="text-white hover:scale-110 transition-transform"><SkipForward className="w-10 h-10 fill-current" /></button>
                      <button onClick={() => setIsCasting(!isCasting)} className={`transition-colors p-2 ${isCasting ? 'text-cyan-400' : 'text-white/60 hover:text-white'}`}><Cast className="w-6 h-6" /></button>
                  </div>
              </div>

              {/* Queue Drawer (Overlay) */}
              {showQueue && (
                  <div className="absolute inset-x-0 bottom-0 top-24 bg-black/80 backdrop-blur-xl z-30 rounded-t-[2rem] border-t border-white/10 p-6 overflow-y-auto animate-in slide-in-from-bottom-10">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="text-xl font-bold text-white">Up Next</h3>
                          <button onClick={() => clearQueue()} className="text-xs font-bold text-red-400 uppercase tracking-wider">Clear</button>
                      </div>
                      <div className="space-y-2">
                          {queue.map((track, i) => (
                              <div key={`${track.id}-${i}`} className={`flex items-center gap-4 p-3 rounded-xl ${i === currentTrackIndex ? 'bg-white/10 border border-white/20' : 'hover:bg-white/5'}`}>
                                  <img src={track.image} className="w-12 h-12 rounded-lg object-cover" />
                                  <div className="flex-1 min-w-0">
                                      <h4 className={`font-bold text-sm ${i === currentTrackIndex ? 'text-cyan-400' : 'text-white'}`}>{track.title}</h4>
                                      <p className="text-xs text-white/50">{track.artist}</p>
                                  </div>
                                  {i === currentTrackIndex && <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>}
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}

      {/* MINI PLAYER - FLOATING PILL (Material Style) */}
      {!isExpanded && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-[60] animate-in slide-in-from-bottom-4 duration-300">
              <div 
                className="bg-slate-900/90 dark:bg-black/90 backdrop-blur-xl border border-white/10 rounded-[2rem] p-3 shadow-2xl flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform"
                onClick={() => setIsExpanded(true)}
              >
                  {/* Rotating Art */}
                  <div className={`w-14 h-14 rounded-full overflow-hidden border-2 border-white/10 shrink-0 relative ${isPlaying ? 'animate-[spin_10s_linear_infinite]' : ''}`}>
                      <img src={currentTrack.image} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 className="w-6 h-6 text-white" />
                      </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                          <h4 className="font-bold text-white text-sm truncate">{currentTrack.title}</h4>
                          {hasError && <AlertCircle className="w-3 h-3 text-red-500" />}
                          {isVideoTrack && <Video className="w-3 h-3 text-cyan-400" />}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{currentTrack.artist}</p>
                      
                      {/* Mini Progress Bar */}
                      <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                          <div 
                            className="h-full bg-cyan-400 transition-all duration-300"
                            style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                          ></div>
                      </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 pr-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={toggleFavorite} 
                        className={`p-2 rounded-full hover:bg-white/10 transition-colors ${isLiked ? 'text-red-500' : 'text-slate-400'}`}
                      >
                          <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={() => togglePlayPause()}
                        className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg shadow-white/10"
                      >
                          {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 ml-0.5 fill-current" />}
                      </button>
                      <button onClick={nextTrack} className="p-2 text-white hover:text-cyan-400 transition-colors">
                          <SkipForward className="w-6 h-6 fill-current" />
                      </button>
                      <button onClick={handleClose} className="p-2 text-slate-400 hover:text-white transition-colors" title="Close">
                          <X className="w-5 h-5" />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};
