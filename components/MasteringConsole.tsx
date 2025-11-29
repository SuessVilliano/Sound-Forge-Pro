import React, { useState } from 'react';
import { Upload, Sliders, Play, SkipBack, SkipForward, Download, CheckCircle, Activity, Music } from 'lucide-react';
import { MASTERING_STYLES } from '../constants';
import { masterTrack } from '../services/audioService';

export const MasteringConsole: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(MASTERING_STYLES[0].id);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const { url } = await masterTrack(file, selectedStyle);
      setResultUrl(url);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Sliders className="w-6 h-6 text-cyan-400" /> AI Mastering Console
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Professional grade mastering engine comparable to Landr.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Upload & Settings */}
        <div className="lg:col-span-1 space-y-6">
           {/* Upload Area */}
           <div 
             onDragOver={(e) => e.preventDefault()}
             onDrop={handleFileDrop}
             className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${
               file ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-850'
             }`}
           >
             {file ? (
               <>
                 <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center mb-3">
                    <Music className="w-6 h-6 text-cyan-400" />
                 </div>
                 <p className="text-white font-bold text-sm truncate max-w-[200px]">{file.name}</p>
                 <p className="text-slate-500 text-xs mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                 <button onClick={(e) => { e.stopPropagation(); setFile(null); setResultUrl(null); }} className="text-red-400 text-xs mt-3 hover:underline">Remove</button>
               </>
             ) : (
               <>
                 <Upload className="w-10 h-10 text-slate-500 mb-3" />
                 <p className="text-slate-300 font-bold text-sm">Drop your mix here</p>
                 <p className="text-slate-500 text-xs mt-1">WAV, AIFF, MP3 up to 100MB</p>
                 <button className="mt-4 bg-slate-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-700">Browse Files</button>
               </>
             )}
           </div>

           {/* Style Selector */}
           <div className="bg-slate-850 rounded-xl border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-white mb-4">Mastering Style</h3>
              <div className="space-y-2">
                 {MASTERING_STYLES.map(style => (
                   <button
                     key={style.id}
                     onClick={() => setSelectedStyle(style.id)}
                     className={`w-full text-left p-3 rounded-lg border transition-all ${
                       selectedStyle === style.id 
                         ? 'bg-cyan-500/10 border-cyan-500' 
                         : 'bg-slate-900 border-slate-800 hover:border-slate-600'
                     }`}
                   >
                     <div className="flex justify-between items-center mb-1">
                       <span className={`text-sm font-bold ${selectedStyle === style.id ? 'text-cyan-400' : 'text-white'}`}>{style.name}</span>
                       {selectedStyle === style.id && <CheckCircle className="w-3 h-3 text-cyan-400" />}
                     </div>
                     <p className="text-[10px] text-slate-400">{style.description}</p>
                   </button>
                 ))}
              </div>
           </div>
           
           <button 
             onClick={handleProcess}
             disabled={!file || isProcessing || !!resultUrl}
             className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-4 rounded-xl text-lg shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
           >
             {isProcessing ? 'Mastering Track...' : resultUrl ? 'Mastering Complete' : 'Master Track'}
           </button>
        </div>

        {/* Right Column: Visualizer & Result */}
        <div className="lg:col-span-2 bg-slate-850 rounded-xl border border-slate-800 p-8 flex flex-col relative overflow-hidden">
           {!resultUrl && !isProcessing && (
             <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                <Activity className="w-20 h-20 opacity-20 mb-4" />
                <p className="text-lg font-medium">Ready to Process</p>
                <p className="text-sm">Upload a track and select a style to begin.</p>
             </div>
           )}

           {isProcessing && (
             <div className="flex-1 flex flex-col items-center justify-center">
                <div className="w-20 h-20 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
                <p className="text-white font-bold text-lg animate-pulse">Analyzing Audio Profile...</p>
                <p className="text-slate-500 text-sm mt-2">Applying {MASTERING_STYLES.find(s => s.id === selectedStyle)?.name} EQ and Compression</p>
             </div>
           )}

           {resultUrl && (
             <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-4 mb-4">
                   <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                      <CheckCircle className="w-8 h-8" />
                   </div>
                   <div>
                      <h2 className="text-2xl font-bold text-white">Mastering Complete!</h2>
                      <p className="text-slate-400 text-sm">Your track has been optimized for streaming platforms.</p>
                   </div>
                </div>

                {/* Fake Comparison Waveform */}
                <div className="relative h-48 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 group">
                   <div className="absolute inset-0 flex items-center gap-0.5 px-4 opacity-30">
                      {/* "Original" Waveform */}
                      {Array.from({length: 100}).map((_,i) => (
                          <div key={i} className="flex-1 bg-slate-500 rounded-full" style={{ height: `${30 + Math.random() * 40}%` }}></div>
                      ))}
                   </div>
                   
                   <div className="absolute inset-0 flex items-center gap-0.5 px-4 clip-path-half">
                      {/* "Mastered" Waveform - Louder */}
                      {Array.from({length: 100}).map((_,i) => (
                          <div key={i} className="flex-1 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]" style={{ height: `${50 + Math.random() * 50}%` }}></div>
                      ))}
                   </div>
                   
                   <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-xs font-bold text-white">
                      After (Mastered)
                   </div>
                </div>

                {/* Player Controls */}
                <div className="flex items-center justify-center gap-6">
                   <button className="p-2 hover:text-white text-slate-400"><SkipBack className="w-6 h-6" /></button>
                   <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-slate-950 hover:scale-105 transition-transform">
                      <Play className="w-6 h-6 ml-1" />
                   </button>
                   <button className="p-2 hover:text-white text-slate-400"><SkipForward className="w-6 h-6" /></button>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-800">
                   <button className="bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      Save to Library
                   </button>
                   <button className="bg-green-500 hover:bg-green-400 text-slate-950 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-green-500/20">
                      <Download className="w-4 h-4" /> Download Master (WAV)
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};
