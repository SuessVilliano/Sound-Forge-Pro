
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Activity, Scan, Globe, Lock, Mic, CheckCircle2, Upload, Music, StopCircle, PlayCircle, Loader2, Link, Database, FileArchive, Zap, AlertTriangle, Search, Fingerprint, X, Play } from 'lucide-react';
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

export const VoiceShield: React.FC<VoiceShieldProps> = ({ user, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'monitor' | 'vault' | 'detect'>('register');
  const [sourceMode, setSourceMode] = useState<AudioSource>('upload');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { walletAddress } = useWallet();
  
  // File & Recording State
  const [selectedFile, setSelectedFile] = useState<File | Blob | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>('');
  
  // Recording Logic State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Library Selection State
  const [libraryTracks, setLibraryTracks] = useState<any[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'register' && sourceMode === 'library') {
        const unsub = dataService.subscribeToTracks(user.uid, (tracks) => {
            setLibraryTracks(tracks);
        });
        return () => unsub();
    }
  }, [activeTab, sourceMode, user.uid]);

  // Recording Handlers
  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          mediaRecorderRef.current = recorder;
          audioChunksRef.current = [];
          
          recorder.ondataavailable = (e) => {
              if (e.data.size > 0) audioChunksRef.current.push(e.data);
          };

          recorder.onstop = () => {
              const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
              setSelectedFile(audioBlob);
              stream.getTracks().forEach(track => track.stop());
          };

          recorder.start();
          setIsRecording(true);
          setRecordingDuration(0);
          timerRef.current = window.setInterval(() => {
              setRecordingDuration(prev => prev + 1);
          }, 1000);
      } catch (err) {
          alert("Microphone access denied.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
      }
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRegister = async () => {
      if (!selectedFile) return;
      if (!walletAddress) {
          alert("Connect wallet to sign authentication.");
          return;
      }

      setIsRegistering(true);
      try {
          setUploadStatus('Neural Indexing (Resemble)...');
          // In real integration, we pass the file to Resemble for training
          const cloneId = await resembleService.createVoiceClone(user.displayName);
          
          setUploadStatus('Securing Identity on Solana...');
          // Wrap blob in file if needed
          const fileToUpload = selectedFile instanceof File ? selectedFile : new File([selectedFile], "recorded_voice.wav", { type: 'audio/wav' });
          const result = await registerVoice(fileToUpload);
          
          if (result.success && result.nft) {
              await dataService.saveVoiceRegistration(user.uid, result.nft);
              alert("Identity Authenticated and Cloned! Vocal NFT minted.");
              setSelectedFile(null);
              setSelectedTrackId(null);
          }
      } catch (e) {
          alert("Registration error.");
      } finally {
          setIsRegistering(false);
          setUploadStatus('');
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
      } catch (e) {
          alert("Scan failed.");
      } finally {
          setIsScanning(false);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
          setDetectionResult(null);
      }
  };

  const selectFromLibrary = (track: any) => {
      setSelectedTrackId(track.id);
      // Create a mock blob from the audioUrl to simulate file selection
      // In production, we'd fetch the file or pass the URL to the service
      fetch(track.audioUrl)
        .then(res => res.blob())
        .then(blob => setSelectedFile(blob));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
           <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tight">
               <Shield className="w-6 h-6 text-cyan-500" /> VoiceShield™
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Protect your vocal DNA and detect unauthorized cloning.</p>
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
              
              {/* Main Intake Area */}
              <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Ingest Vocal DNA</h3>
                      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
                          <button onClick={() => {setSourceMode('upload'); setSelectedFile(null);}} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sourceMode === 'upload' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>Upload</button>
                          <button onClick={() => {setSourceMode('record'); setSelectedFile(null);}} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sourceMode === 'record' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>Record</button>
                          <button onClick={() => {setSourceMode('library'); setSelectedFile(null);}} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${sourceMode === 'library' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500 hover:text-white'}`}>Library</button>
                      </div>
                  </div>

                  <div className="min-h-[300px] flex flex-col items-center justify-center">
                      {sourceMode === 'upload' && (
                          <div 
                            onClick={() => document.getElementById('reg-upload')?.click()}
                            className={`w-full border-2 border-dashed rounded-3xl p-20 text-center cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/30 ${selectedFile ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-700'}`}
                          >
                              <input id="reg-upload" type="file" className="hidden" onChange={handleFileUpload} accept="audio/*" />
                              {selectedFile ? (
                                  <div className="space-y-2">
                                      <Music className="w-12 h-12 text-cyan-500 mx-auto" />
                                      <p className="text-white font-black uppercase tracking-tight">{(selectedFile as File).name}</p>
                                      <button onClick={(e) => {e.stopPropagation(); setSelectedFile(null);}} className="text-red-500 text-xs font-bold uppercase hover:underline">Remove</button>
                                  </div>
                              ) : (
                                  <div className="space-y-2">
                                      <Upload className="w-12 h-12 text-slate-600 mx-auto" />
                                      <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Drop 5-minute vocal sample</p>
                                  </div>
                              )}
                          </div>
                      )}

                      {sourceMode === 'record' && (
                          <div className="w-full space-y-8 text-center">
                              <div className="relative">
                                  <div className={`w-40 h-40 rounded-full mx-auto flex items-center justify-center border-4 transition-all duration-500 ${isRecording ? 'border-red-500 animate-pulse-slow shadow-[0_0_50px_rgba(239,68,68,0.3)]' : 'border-slate-800'}`}>
                                      {isRecording ? (
                                          <div className="text-center">
                                              <div className="text-2xl font-mono font-black text-white">{formatTime(recordingDuration)}</div>
                                              <div className="text-[8px] font-black uppercase text-red-500 tracking-tighter">Capturing Biometrics</div>
                                          </div>
                                      ) : (
                                          <Mic className="w-16 h-16 text-slate-700" />
                                      )}
                                  </div>
                              </div>
                              
                              <div className="flex justify-center gap-4">
                                  {!isRecording ? (
                                      <button 
                                        onClick={startRecording}
                                        className="bg-red-600 hover:bg-red-500 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest transition-all shadow-xl shadow-red-600/20 flex items-center gap-2"
                                      >
                                          <Circle className="w-4 h-4 fill-white" /> Start Studio Rec
                                      </button>
                                  ) : (
                                      <button 
                                        onClick={stopRecording}
                                        className="bg-white text-slate-950 px-10 py-4 rounded-full font-black uppercase tracking-widest transition-all shadow-xl flex items-center gap-2"
                                      >
                                          <StopCircle className="w-4 h-4" /> Finalize Intake
                                      </button>
                                  )}
                              </div>
                              <p className="text-xs text-slate-500 max-w-xs mx-auto">Requires clean environment. We recommend a 60-second minimum capture for high Resemble.ai fidelity.</p>
                          </div>
                      )}

                      {sourceMode === 'library' && (
                          <div className="w-full space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                              {libraryTracks.length === 0 ? (
                                  <div className="text-center py-20 text-slate-600 italic">No tracks found in your library yet.</div>
                              ) : (
                                  libraryTracks.map(track => (
                                      <div 
                                        key={track.id} 
                                        onClick={() => selectFromLibrary(track)}
                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedTrackId === track.id ? 'bg-cyan-500/10 border-cyan-500 shadow-md' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                                      >
                                          <div className="flex items-center gap-4">
                                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/5">
                                                  <img src={track.image || track.imageUrl} className="w-full h-full object-cover" />
                                              </div>
                                              <div>
                                                  <div className="font-bold text-white text-sm">{track.title}</div>
                                                  <div className="text-[10px] text-slate-500 uppercase tracking-widest font-black">{track.duration} • {track.genre}</div>
                                              </div>
                                          </div>
                                          {selectedTrackId === track.id ? (
                                              <CheckCircle2 className="w-5 h-5 text-cyan-500" />
                                          ) : (
                                              <div className="w-5 h-5 rounded-full border border-slate-700"></div>
                                          )}
                                      </div>
                                  ))
                              )}
                          </div>
                      )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                      <button 
                        onClick={handleRegister}
                        disabled={isRegistering || !selectedFile}
                        className="w-full py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-cyan-500/10 flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                          {isRegistering ? (
                              <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>{uploadStatus}</span>
                              </>
                          ) : (
                              <>
                                <Fingerprint className="w-5 h-5" />
                                <span>Mint Voice Identity NFT</span>
                              </>
                          )}
                      </button>
                      <p className="text-[10px] text-center text-slate-500 font-bold uppercase tracking-widest mt-4">Authorized by Resemble.ai & Solana</p>
                  </div>
              </div>

              {/* Right Col: Reputation Status */}
              <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 text-center relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                          <Zap className="w-32 h-32 text-cyan-400" />
                      </div>
                      <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Zap className="w-8 h-8 text-cyan-400" />
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Liquid Identity</h3>
                      <p className="text-slate-400 text-xs leading-relaxed mb-6 font-medium">Your verified vocal profile enables automated revenue splits and instant deepfake protection across the Sound Merge network.</p>
                      <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase">
                              <span>Security Score</span>
                              <span className="text-cyan-400">92/100</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: '92%' }}></div>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8">
                      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Ledger Infrastructure</h4>
                      <ul className="space-y-4">
                          {[
                              { label: 'Encryption', val: 'AES-256 (Neural)', icon: Lock },
                              { label: 'Model', val: 'Resemble Pro v4', icon: Bot },
                              { label: 'Network', val: 'Solana Mainnet', icon: Globe }
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
                  <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-purple-500/20">
                      <Search className="w-10 h-10 text-purple-400" />
                  </div>
                  <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter">Deepfake Radar</h2>
                  <p className="text-slate-400 mb-10 max-w-md mx-auto font-medium">Resemble Detect provides institutional-grade verification for synthetic vocal artifacts.</p>
                  
                  <div 
                    onClick={() => document.getElementById('detect-upload')?.click()}
                    className={`border-2 border-dashed rounded-[2rem] p-16 transition-all cursor-pointer group ${selectedFile ? 'border-purple-500 bg-purple-500/5' : 'border-slate-700 hover:border-slate-500 bg-slate-950'}`}
                  >
                      <input id="detect-upload" type="file" className="hidden" onChange={handleFileUpload} accept="audio/*" />
                      {selectedFile ? (
                          <div className="flex flex-col items-center gap-3">
                              <Music className="w-12 h-12 text-purple-500" />
                              <span className="text-white font-black uppercase tracking-tight">{(selectedFile as File).name}</span>
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ready for biometric audit</span>
                          </div>
                      ) : (
                          <div className="flex flex-col items-center gap-3">
                              <Upload className="w-12 h-12 text-slate-700 group-hover:text-purple-400 transition-colors" />
                              <span className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Drop audio to scan for AI signals</span>
                          </div>
                      )}
                  </div>

                  {selectedFile && !detectionResult && (
                      <button 
                        onClick={handleDeepfakeScan}
                        disabled={isScanning}
                        className="mt-8 w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3"
                      >
                          {isScanning ? <><Loader2 className="w-5 h-5 animate-spin" /> Deep Spectral Analysis...</> : <><Scan className="w-5 h-5" /> Execute Audit</>}
                      </button>
                  )}

                  {detectionResult && (
                      <div className="mt-10 p-8 rounded-3xl border bg-slate-950 animate-in zoom-in duration-300 relative overflow-hidden" style={{ borderColor: detectionResult.is_synthetic ? '#ef4444' : '#22c55e' }}>
                          <div className="flex flex-col items-center text-center gap-6">
                              {detectionResult.is_synthetic ? <AlertTriangle className="w-16 h-16 text-red-500" /> : <CheckCircle2 className="w-16 h-16 text-green-500" />}
                              <div className="space-y-1">
                                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">{detectionResult.is_synthetic ? 'Synthetic / AI Content' : 'Authentic Performance'}</h3>
                                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Audit Confidence: {Math.round(detectionResult.score * 100)}%</p>
                              </div>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-8">
                              <div className={`h-full transition-all duration-1000 ${detectionResult.is_synthetic ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${detectionResult.score * 100}%` }}></div>
                          </div>
                          <p className="mt-6 text-xs text-slate-500 leading-relaxed italic max-w-sm mx-auto">
                              "{detectionResult.is_synthetic 
                                ? 'Neural artifacts found in high frequencies. File does not match user biometric hash.' 
                                : 'Authentic biometric signature confirmed via Resemble.ai Detect. Performance is valid human audio.'}"
                          </p>
                          <button onClick={() => setSelectedFile(null)} className="mt-6 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">Clear Result</button>
                      </div>
                  )}
              </div>
          </div>
      )}

      {activeTab === 'vault' && <VoiceAssetManager user={user} onNavigateToRegister={() => setActiveTab('register')} />}
    </div>
  );
};

// Simple Circle Icon for Start Rec
const Circle = ({ className, ...props }: any) => (
    <svg className={className} viewBox="0 0 24 24" {...props}><circle cx="12" cy="12" r="10" /></svg>
);
const Bot = ({ className, ...props }: any) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>
);
