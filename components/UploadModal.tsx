
import React, { useState, useRef } from 'react';
import { X, Upload, Music, CheckCircle2, Loader2, FileAudio, Tag } from 'lucide-react';
import { User, Track } from '../types';
import { dataService } from '../services/dataService';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, user }) => {
  const [step, setStep] = useState<'upload' | 'metadata' | 'processing' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Metadata State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState(user.displayName || '');
  const [genre, setGenre] = useState('');
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('audio/')) {
      setFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
      setStep('metadata');
    } else {
      alert("Please upload a valid audio file (MP3, WAV)");
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStep('processing');

    try {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        const newTrack: any = {
            id: `track_${Date.now()}`,
            title: title || 'Untitled Track',
            artist: artist,
            bpm: parseInt(bpm) || 120,
            key: key || 'C',
            mood_tags: genre ? [genre] : [],
            duration: '3:30', // Mock duration
            plays: 0,
            earnings: 0,
            image: `https://picsum.photos/300/300?random=${Date.now()}`,
            audioUrl: URL.createObjectURL(file), // Local blob for demo
            licenseType: 'sync-ready',
            status: 'completed',
            type: 'song',
            createdAt: new Date().toISOString()
        };

        await dataService.saveTrack(user.uid, newTrack);
        setStep('success');
    } catch (error) {
        console.error("Upload failed", error);
        setStep('metadata');
    }
  };

  const reset = () => {
      setFile(null);
      setStep('upload');
      setTitle('');
      setBpm('');
      setKey('');
      setGenre('');
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
           <h2 className="text-lg font-bold text-white flex items-center gap-2">
               <Upload className="w-5 h-5 text-cyan-500" /> Upload Music
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
               <X className="w-5 h-5" />
           </button>
        </div>

        {/* Content */}
        <div className="p-6">
            {step === 'upload' && (
                <div 
                    className={`border-2 border-dashed rounded-xl h-64 flex flex-col items-center justify-center text-center transition-all ${dragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-500 bg-slate-800/50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <Upload className="w-8 h-8 text-cyan-500" />
                    </div>
                    <p className="text-white font-bold text-lg mb-1">Drag & Drop Audio File</p>
                    <p className="text-slate-400 text-sm mb-6">WAV, MP3, AIFF up to 50MB</p>
                    <button 
                        onClick={() => inputRef.current?.click()}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2 rounded-full text-sm font-bold transition-colors"
                    >
                        Browse Files
                    </button>
                    <input 
                        ref={inputRef}
                        type="file" 
                        accept="audio/*"
                        className="hidden" 
                        onChange={handleChange}
                    />
                </div>
            )}

            {step === 'metadata' && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg mb-4">
                        <div className="w-10 h-10 bg-cyan-500/20 rounded flex items-center justify-center text-cyan-400">
                            <FileAudio className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-bold truncate">{file?.name}</p>
                            <p className="text-slate-500 text-xs">{(file!.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button onClick={() => setStep('upload')} className="text-xs text-red-400 hover:text-red-300">Change</button>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-400 mb-1">Track Title</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Genre</label>
                            <input 
                                type="text" 
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                                placeholder="e.g. Pop"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Artist Name</label>
                            <input 
                                type="text" 
                                value={artist}
                                onChange={(e) => setArtist(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">BPM</label>
                            <input 
                                type="number" 
                                value={bpm}
                                onChange={(e) => setBpm(e.target.value)}
                                placeholder="120"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Key</label>
                            <input 
                                type="text" 
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                placeholder="C Maj"
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                            />
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg mt-2 transition-colors"
                    >
                        Upload & Save
                    </button>
                </div>
            )}

            {step === 'processing' && (
                <div className="h-64 flex flex-col items-center justify-center text-center animate-in fade-in">
                    <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Uploading...</h3>
                    <p className="text-slate-400 text-sm">Analyzing audio waveform and generating fingerprints.</p>
                </div>
            )}

            {step === 'success' && (
                <div className="h-64 flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Upload Complete!</h3>
                    <p className="text-slate-400 text-sm mb-6">Your track has been added to your library.</p>
                    <button 
                        onClick={reset}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-2 rounded-full font-bold text-sm transition-colors"
                    >
                        Close
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
