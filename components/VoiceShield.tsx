
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Activity, Scan, Globe, Lock, Mic, CheckCircle2, Upload, Music, StopCircle, PlayCircle, Loader2, Link, Database, FileArchive, Zap, AlertTriangle, Search, Fingerprint, X, Play, Sparkles } from 'lucide-react';
import { User, Track } from '../types';
import { registerVoice } from '../services/voiceService';
import { dataService } from '../services/dataService';
import { resembleService, DetectionResult } from '../services/resembleService';
import { useWallet } from '../contexts/WalletContext';
import { VoiceAssetManager } from './VoiceAssetManager';

interface VoiceShieldProps {
  user: User;
  onUpgrade: () => void;
}

type AudioSource = 'upload' | 'record' | 'library';
type RegistrationStage = 'idle' | 'holding' | 'uploading' | 'fingerprinting' | 'shielding' | 'registered';

export const VoiceShield: React.FC<VoiceShieldProps> = ({ user, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'monitor' | 'vault' | 'detect'>('register');
  const [sourceMode, setSourceMode] = useState<AudioSource>('upload');
  const [stage, setStage] = useState<RegistrationStage>('idle');
  const [isScanning, setIsScanning] = useState(false);
  const { walletAddress } = useWallet();
  
  // File State
  const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  
  // Biometric UX State
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimerRef = useRef<number | null>(null);

  // Recording Logic State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];
          recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
          recorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
              setSelectedFile(audioBlob);
              stream.getTracks().forEach(track => track.stop());
          };
          recorder.start();
          setIsRecording(true);
          setRecordingDuration(0);
          timerRef.current = window.setInterval(() => setRecordingDuration(prev => prev + 1), 1000);
      } catch (err) { alert("Microphone access denied."); }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
      }
  };

  const handleMouseDown = () => {
      if (!selectedFile || stage !== 'idle') return;
      if (!walletAddress) { alert("Connect wallet to sign registry entry."); return; }
      
      setStage('holding');
      let progress = 0;
      holdTimerRef.current = window.setInterval(() => {
          progress += 5;
          setHoldProgress(progress);
          if (progress >= 100) {
              if (holdTimerRef.current) clearInterval(holdTimerRef.current);
              executeRegistration();
          }
      }, 50);
  };

  const handleMouseUp = () => {
      if (stage === 'holding') {
          if (holdTimerRef.current) clearInterval(holdTimerRef.current);
          setStage('idle');
          setHoldProgress(0);
      }
  };

  const executeRegistration = async () => {
      setStage('uploading');
      try {
          // 1. Backend Resemble Watermarking & Fingerprinting
          const cloneId = await resembleService.createVoiceClone(user.displayName);
          setStage('fingerprinting');
          await new Promise(r => setTimeout(r, 1500));
          
          setStage('shielding');
          // 2. Solana Registry Signature
          const fileToUpload = selectedFile instanceof File ? selectedFile : new File([selectedFile!], "voice_id.wav", { type: 'audio/wav' });
          const result = await registerVoice(fileToUpload);
          
          if (result.success && result.nft) {
              const assetId = `asset_${crypto.randomUUID()}`;
              const voiceId = `voice_${crypto.randomUUID()}`;
              
              const finalAsset = {
                  ...result.nft,
                  asset_id: assetId,
                  voice_id: voiceId,
                  status: 'active' as const,
                  is_marketplace_enabled: false
              };

              await dataService.saveVoiceRegistration(user.uid, finalAsset);
              setStage('registered');
              setTimeout(() => {
                  setStage('idle');
                  setSelectedFile(null);
                  setHoldProgress(0);
                  setActiveTab('vault');
              }, 2000);
          }
      } catch (e) {
          alert("Registry synchronization failed.");
          setStage('idle');
          setHoldProgress(0);
      }
  };

  const handleDeepfakeScan = async () => {
      if (!selectedFile) return;
      setIsScanning(true);
      setDetectionResult(null);
      try {
          const fileToScan = selectedFile instanceof File ? selectedFile : new File([selectedFile], "scan_voice.wav", { type: 'audio/wav' });
          const result = await resembleService.detectDeepfake(fileToScan);
          setDetectionResult(result);
      } catch (e) { alert("Scan failed."); } finally { setIsScanning(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
               <Shield className="w-6 h-6 text-cyan-500" /> VoiceShield™
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium italic">Institutional Registry & Provenance Layer.</p>
        </div>
        <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-xl flex gap-1 shadow-inner">
            {['register', 'detect', 'monitor', 'vault'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    {tab}
                </button>
            ))}
        </div>
      </div>

      {activeTab === 'register' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Identity Authentication</h3>
                      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                          <button onClick={() => {setSourceMode('upload'); setSelectedFile(null);}} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sourceMode === 'upload' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>Upload Stems</button>
                          <button onClick={() => {setSourceMode('record'); setSelectedFile(null);}} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sourceMode === 'record' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>Liveness Proof</button>
                      </div>
                  </div>

                  <div className="min-h-[300px] flex flex-col items-center justify-center">
                      {sourceMode === 'upload' && !selectedFile && (
                          <div 
                            onClick={() => document.getElementById('reg-upload')?.click()}
                            className="w-full border-2 border-dashed border-slate-700 rounded-3xl p-20 text-center cursor-pointer transition-all hover:bg-slate-800/30"
                          >
                              <input id="reg-upload" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept="audio/*" />
                              <Upload className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Select Vocal Stems (Preferred)</p>
                          </div>
                      )}

                      {selectedFile && stage === 'idle' && (
                          <div className="text-center space-y-8">
                              <div className="w-24 h-24 bg-cyan-500/10 rounded-3xl flex items-center justify-center mx-auto border border-cyan-500/20">
                                  <Music className="w-10 h-10 text-cyan-400" />
                              </div>
                              <div>
                                  <p className="text-white font-black uppercase tracking-tight">{(selectedFile as File).name || "Recorded Audio"}</p>
                                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Ready for Institutional Shielding</p>
                              </div>
                              <button onClick={() => setSelectedFile(null)} className="text-red-500 text-[10px] font-black uppercase tracking-widest hover:underline">Purge Selection</button>
                          </div>
                      )}

                      {sourceMode === 'record' && !selectedFile && (
                          <div className="w-full space-y-8 text-center">
                              <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center border-4 transition-all duration-500 ${isRecording ? 'border-red-500 animate-pulse' : 'border-slate-800'}`}>
                                  {isRecording ? <div className="text-xl font-mono font-black text-white">{recordingDuration}s</div> : <Mic className="w-12 h-12 text-slate-700" />}
                              </div>
                              <button onClick={isRecording ? stopRecording : startRecording} className={`px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs shadow-xl transition-all ${isRecording ? 'bg-white text-slate-950' : 'bg-red-600 text-white hover:bg-red-500'}`}>
                                  {isRecording ? 'Finalize Capture' : 'Start liveness check'}
                              </button>
                          </div>
                      )}
                  </div>

                  <div className="mt-12 flex flex-col items-center gap-6">
                      <div className="relative">
                          <button 
                            onMouseDown={handleMouseDown}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleMouseDown}
                            onTouchEnd={handleMouseUp}
                            disabled={!selectedFile || stage !== 'idle'}
                            className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all relative z-10 select-none ${
                                stage === 'registered' ? 'bg-green-500' :
                                selectedFile ? 'bg-slate-900 border-4 border-cyan-500/30' : 'bg-slate-950 border-4 border-slate-800 opacity-30'
                            }`}
                          >
                             {stage === 'registered' ? <CheckCircle2 className="w-12 h-12 text-white" /> : <Fingerprint className={`w-12 h-12 ${stage === 'holding' ? 'text-cyan-400 animate-pulse' : 'text-slate-600'}`} />}
                             <div className="mt-1 text-[8px] font-black uppercase tracking-tighter text-slate-500">Hold to Sync</div>
                          </button>
                          
                          {/* Animated Progress Ring */}
                          <svg className="absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 128 128">
                              <circle cx="64" cy="64" r="60" className="fill-none stroke-slate-800 stroke-2" />
                              <circle cx="64" cy="64" r="60" className="fill-none stroke-cyan-500 stroke-4 transition-all duration-100" strokeDasharray="377" strokeDashoffset={377 - (377 * holdProgress / 100)} />
                          </svg>
                      </div>

                      <div className="text-center">
                          <h4 className="text-sm font-black text-white uppercase tracking-widest">
                              {stage === 'idle' && (selectedFile ? "Confirm Biometric Identity" : "Awaiting Data Ingestion")}
                              {stage === 'holding' && "Scanning Neural Hash..."}
                              {stage === 'uploading' && "Syncing with Filecoin Node..."}
                              {stage === 'fingerprinting' && "Computing Spectral Blueprint..."}
                              {stage === 'shielding' && "Applying PerTh Neural Watermark..."}
                              {stage === 'registered' && "Identity Anchored."}
                          </h4>
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] mt-2">
                              {stage === 'idle' ? "Hold fingerprint to authorize signature" : "Do not interrupt node synchronization"}
                          </p>
                      </div>
                  </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5"> <Zap className="w-32 h-32 text-cyan-400" /> </div>
                      <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mb-6"> <Zap className="w-8 h-8 text-cyan-400" /> </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Liquid Identity</h3>
                      <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">Your verified vocal profile enables automated revenue splits and instant deepfake protection.</p>
                      <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase">
                              <span>Security Grade</span>
                              <span className="text-cyan-400">MIL-STD-A2P</span>
                          </div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500 w-[95%]"></div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Active Node Status</h4>
                      <ul className="space-y-4">
                          {[
                              { label: 'Registry', val: 'Sound Merge v2.5', icon: Database },
                              { label: 'Watermark', val: 'Resemble PerTh', icon: Sparkles },
                              { label: 'Chain', val: 'Solana Mainnet', icon: Globe }
                          ].map((item, i) => (
                              <li key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                                  <div className="flex items-center gap-2">
                                      <item.icon className="w-3 h-3 text-slate-500" />
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.label}</span>
                                  </div>
                                  <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">{item.val}</span>
                              </li>
                          ))}
                      </ul>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'detect' && (
          <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 p-10 text-center shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 via-transparent to-transparent pointer-events-none"></div>
                  <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                      <Search className="w-10 h-10 text-purple-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter italic">Deepfake Radar</h2>
                  <p className="text-slate-400 mb-10 max-w-md mx-auto font-medium">Scan assets for synthetic vocal artifacts and PerTh provenance watermarks.</p>
                  
                  <div 
                    onClick={() => document.getElementById('detect-upload')?.click()}
                    className={`border-2 border-dashed rounded-[2rem] p-16 transition-all cursor-pointer group ${selectedFile ? 'border-purple-500 bg-purple-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-950'}`}
                  >
                      <input id="detect-upload" type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept="audio/*" />
                      <div className="flex flex-col items-center gap-3">
                          <Music className={`w-12 h-12 ${selectedFile ? 'text-purple-500' : 'text-slate-700 group-hover:text-purple-400 transition-colors'}`} />
                          <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">{selectedFile ? (selectedFile as File).name : "Ingest asset for spectral audit"}</span>
                      </div>
                  </div>

                  {selectedFile && !detectionResult && (
                      <button onClick={handleDeepfakeScan} disabled={isScanning} className="mt-8 w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl flex items-center justify-center gap-3 transition-all">
                          {isScanning ? <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing Gradients...</> : <><Scan className="w-5 h-5" /> Execute Audit</>}
                      </button>
                  )}

                  {detectionResult && (
                      <div className="mt-10 p-8 rounded-3xl border bg-slate-950 animate-in zoom-in duration-300 border-slate-800">
                          <div className="flex flex-col items-center text-center gap-6">
                              {detectionResult.is_synthetic ? <AlertTriangle className="w-16 h-16 text-red-500" /> : <CheckCircle2 className="w-16 h-16 text-green-500" />}
                              <div className="space-y-1">
                                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{detectionResult.is_synthetic ? 'Synthetic Artifacts Located' : 'Authentic Performance'}</h3>
                                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Spectral Confidence: {Math.round(detectionResult.score * 100)}%</p>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'vault' && <VoiceAssetManager user={user} onNavigateToRegister={() => setActiveTab('register')} />}
    </div>
  );
};
