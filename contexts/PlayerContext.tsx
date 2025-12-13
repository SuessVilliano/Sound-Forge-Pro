
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Track } from '../types';

interface PlayerContextType {
  queue: Track[];
  currentTrackIndex: number;
  isPlaying: boolean;
  playTrack: (track: Track) => void;
  addToQueue: (track: Track) => void;
  togglePlayPause: (playing?: boolean) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  clearQueue: () => void;
  currentTrack: Track | undefined;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const playTrack = useCallback((track: Track) => {
    // Check if track is already in queue
    const existingIndex = queue.findIndex(t => t.id === track.id);
    
    if (existingIndex >= 0) {
      setCurrentTrackIndex(existingIndex);
    } else {
      setQueue(prev => [track, ...prev]);
      setCurrentTrackIndex(0);
    }
    setIsPlaying(true);
  }, [queue]);

  const addToQueue = useCallback((track: Track) => {
    setQueue(prev => [...prev, track]);
  }, []);

  const togglePlayPause = useCallback((playing?: boolean) => {
    setIsPlaying(prev => playing !== undefined ? playing : !prev);
  }, []);

  const nextTrack = useCallback(() => {
    if (queue.length === 0) return;
    setCurrentTrackIndex(prev => (prev + 1) % queue.length);
    setIsPlaying(true);
  }, [queue.length]);

  const prevTrack = useCallback(() => {
    if (queue.length === 0) return;
    setCurrentTrackIndex(prev => (prev - 1 + queue.length) % queue.length);
    setIsPlaying(true);
  }, [queue.length]);

  const clearQueue = useCallback(() => {
    setQueue([]);
    setIsPlaying(false);
  }, []);

  const value = {
    queue,
    currentTrackIndex,
    isPlaying,
    playTrack,
    addToQueue,
    togglePlayPause,
    nextTrack,
    prevTrack,
    clearQueue,
    currentTrack: queue[currentTrackIndex]
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
