
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Activity, Scan, Globe, Lock, Mic, CheckCircle2, Upload, Music, StopCircle, PlayCircle, Loader2, Link, Database, FileArchive, Zap } from 'lucide-react';
import { User, Track } from '../types';
import { registerVoice } from '../services/voiceService';
import { dataService } from '../services/dataService';
import { lighthouseService } from '../services/lighthouseService';
import { useWallet } from '../contexts/WalletContext';
import { VoiceAssetManager } from './VoiceAssetManager';

interface VoiceShieldProps {
  user: User;
  onUpgrade: () => void;
}

type AudioSource = 'upload' | 'record' | 'library';

export const VoiceShield: React.FC<VoiceShieldProps> = ({ user, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'monitor' | 'vault'>('register');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const { walletAddress, connectTipLink, connectPhantom } = useWallet();
  
  const [sourceMode, setSourceMode] = useState<AudioSource>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLibraryTrack, setSelectedLibraryTrack] = useState<Track | null>(null);
  
  const [uploadStatus, setUploadStatus] = useState<string>('');
  const [ipfsHash, setIpfsHash] = useState<string | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);

  useEffect(() => {
      if (sourceMode === 'library' && user) {
          const unsubscribe = dataService.subscribeToTracks(user.uid, (tracks) => {
              const mapped: Track[] = tracks.map((t: any) => ({
                  id: t.id,
                  title: t.title,
                  artist: t.artist || 'AI Artist',
                  bpm: t.bpm || 0,
                  key: t.key || '-',
                  mood_tags: t.mood_tags || t.tags || [],
                  duration: t.duration,
                  plays: t.plays || 0,
                  earnings: t.earnings || 0,
                  image: t.image || t.imageUrl || 'https://picsum.photos/100',
                  audioUrl: t.audioUrl,
                  licenseType: t.licenseType || 'non-exclusive',
                  status: t.status,
                  createdAt: t.createdAt
              }));
              setLibraryTracks(mapped);
          });
          return () => unsubscribe();
      }
  }, [sourceMode, user]);

  const handleRegister = async () => {
      let fileToProcess: File | null = selectedFile;

      if (sourceMode === 'library' && selectedLibraryTrack) {
          fileToProcess = new File(["mock_audio_content"], `${selectedLibraryTrack.title}.mp3`, { type: "audio/mp3" });
      }

      if (!fileToProcess) {
          alert("Please select or record audio first.");
          return;
      }

      if (!walletAddress) {
          alert("Please connect your wallet first to sign the authentication.");
          return;
      }

      setIsRegistering(true);
      try {
          setUploadStatus('Encrypting & Securing Identity...');
          const signedMessage = "authenticate_vocal_dna_" + Date.now(); 
          const lighthouseRes = await lighthouseService.uploadEncrypted(fileToProcess, walletAddress, signedMessage);
          
          setIpfsHash(lighthouseRes.Hash);
          setUploadStatus('Minting Rights Certificate on Ledger...');

          const result = await registerVoice(fileToProcess);
          
          if (result.success && result.nft) {
              result.nft.fingerprint_hash = lighthouseRes.Hash; 
              await dataService.saveVoiceRegistration(user.uid, result.nft);
              
              setUploadStatus('Success!');
              alert("Vocal Identity Authenticated! Check your Asset Vault.");
              
              setSelectedFile(null);
              setSelectedLibraryTrack(null);
          } else {
              alert("Failed to register voice.");
          }
      } catch (e) {
          console.error(e);
          alert("Error during registration process.");
      } finally {
          setIsRegistering(false);
          setUploadStatus('');
      }
  };

  const handleScan = () => {
      setIsScanning(true);
      setTimeout(() => setIsScanning(false), 3000);
  };

  const startRecording = async () => {
      try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const recorder = new MediaRecorder(stream);
          setMediaRecorder(recorder);
          setAudioChunks([]);

          recorder.ondataavailable = (e) => {
              if (e.data.size > 0) {
                  setAudioChunks((prev) => [...prev, e.data]);
              }
          };

          recorder.onstop = () => {
              const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
              const audioFile = new File([audioBlob], "recorded_voice.wav", { type: "audio/wav" });
              setSelectedFile(audioFile);
              stream.getTracks().forEach(track => track.stop());
          };

          recorder.start();
          setIsRecording(true);
          setRecordingDuration(0);
          timerRef.current = window.setInterval(() => {
              setRecordingDuration(prev => prev + 1);
          }, 1000);

      } catch (err) {
          console.error("Mic Error:", err);
          alert("Could not access microphone.");
      }
  };

  const stopRecording = () => {
      if (mediaRecorder && isRecording) {
          mediaRecorder.stop();
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setSelectedFile(e.target.files[0]);
      }
  };

  const formatTime = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isPro = user.plan !== 'free';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
               <Shield className="w-6 h-6 text-cyan-500" /> VoiceShield™ Protection
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Authenticate your vocal DNA on the ledger to secure usage rights and build $MERGE reputation.</p>
        </div>
        <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
            <button 
                onClick={() => setActiveTab('register')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'register' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                Authentication
            </button>
            <button 
                onClick={() => setActiveTab('monitor')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'monitor' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                Web Monitoring
            </button>
            <button 
                onClick={() => setActiveTab('vault')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'vault' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                Asset Vault
            </button>
        </div>
      </div>

      {activeTab === 'vault' ? (
          <VoiceAssetManager user={user} onNavigateToRegister={() => setActiveTab('register')} />
      ) : activeTab === 'register' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                  
                  {!walletAddress && (
                      <div className="mb-6 p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <Link className="w-5 h-5 text-cyan-500" />
                              <div className="text-sm">
                                  <span className="font-bold text-cyan-400">Ledger Unconnected</span>. Identity cannot be secured.
                              </div>
                          </div>
                          <button onClick={connectPhantom} className="text-xs bg-cyan-500 text-slate-950 px-3 py-1.5 rounded-lg font-bold hover:bg-cyan-400 transition-colors">
                              Connect Ledger
                          </button>
                      </div>
                  )}

                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <Mic className="w-6 h-6 text-cyan-500" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Identity Certificate</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Provide a clear audio sample to create your biometric rights record.</p>
                      </div>
                  </div>

                  <div className="flex gap-2 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                      <button 
                        onClick={() => { setSourceMode('upload'); setSelectedFile(null); setSelectedLibraryTrack(null); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sourceMode === 'upload' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                          <Upload className="w-3 h-3" /> Upload
                      </button>
                      <button 
                        onClick={() => { setSourceMode('record'); setSelectedFile(null); setSelectedLibraryTrack(null); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sourceMode === 'record' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                          <Mic className="w-3 h-3" /> Record
                      </button>
                  </div>

                  <div className="mb-8">
                      {sourceMode === 'upload' && (
                          <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer relative">
                              <input 
                                type="file" 
                                accept="audio/*"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                              {selectedFile ? (
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                                          <Music className="w-5 h-5" />
                                      </div>
                                      <div className="text-left">
                                          <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedFile.name}</p>
                                          <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                      </div>
                                  </div>
                              ) : (
                                  <>
                                      <Upload className="w-8 h-8 text-slate-400 mb-3" />
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload sample</p>
                                      <p className="text-xs text-slate-500 mt-1">High fidelity samples lead to higher reputation scores.</p>
                                  </>
                              )}
                          </div>
                      )}

                      {sourceMode === 'record' && (
                          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
                              <div className="mb-4 text-3xl font-mono text-slate-900 dark:text-white font-bold">
                                  {formatTime(recordingDuration)}
                              </div>
                              
                              {!isRecording ? (
                                  selectedFile ? (
                                      <div className="flex flex-col items-center">
                                          <p className="text-green-500 font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Sample Locked</p>
                                          <button 
                                            onClick={() => { setSelectedFile(null); setRecordingDuration(0); }}
                                            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline"
                                          >
                                              Re-record
                                          </button>
                                      </div>
                                  ) : (
                                      <button 
                                        onClick={startRecording}
                                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform hover:scale-105"
                                      >
                                          <Mic className="w-8 h-8" />
                                      </button>
                                  )
                              ) : (
                                  <button 
                                    onClick={stopRecording}
                                    className="w-16 h-16 rounded-full bg-slate-800 text-white flex items-center justify-center shadow-lg transition-transform animate-pulse"
                                  >
                                      <StopCircle className="w-8 h-8" />
                                  </button>
                              )}
                          </div>
                      )}
                  </div>

                  <button 
                    onClick={handleRegister}
                    disabled={isRegistering || (!selectedFile && !selectedLibraryTrack)}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                      {isRegistering ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> {uploadStatus || 'Syncing...'}</>
                      ) : (
                          <>Secure Identity Certificate</>
                      )}
                  </button>
              </div>

              <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                  
                  <div className="mb-6 flex flex-col items-center">
                      <div className="w-16 h-16 bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500 mb-4 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
                          <Zap className="w-8 h-8" />
                      </div>
                      <div className="text-xs text-cyan-500 uppercase font-black tracking-widest">Reputation Yield</div>
                      <div className="text-3xl font-black text-white mt-1">+100 $MERGE Points</div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">Professional Accreditation</h3>
                  <p className="text-slate-400 text-sm max-w-sm mb-6 leading-relaxed">
                      Authenticated identities are eligible for the institutional marketplace. Only certified voices can receive contract offers from global media partners.
                  </p>
                  
                  <div className="flex gap-2">
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-[10px] font-black uppercase tracking-wider">
                          <Globe className="w-3 h-3" /> Ledger Secured
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-[10px] font-black uppercase tracking-wider">
                          <Database className="w-3 h-3" /> IPFS Vault
                      </div>
                  </div>
              </div>
          </div>
      ) : (
          <div className="relative animate-in fade-in duration-300">
              {!isPro && (
                  <div className="absolute inset-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                          <Lock className="w-8 h-8 text-cyan-500" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Web Monitoring is Pro-Only</h2>
                      <p className="text-slate-500 dark:text-slate-300 max-w-md mb-8 leading-relaxed">
                          Upgrade to Artist Pro to enable 24/7 web scanning, deepfake detection, and automated DMCA takedowns for your certified vocal identity.
                      </p>
                      <button 
                        onClick={onUpgrade}
                        className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-transform hover:scale-105"
                      >
                          Upgrade to Pro
                      </button>
                  </div>
              )}

              <div className={`grid grid-cols-1 gap-6 ${!isPro ? 'filter blur-sm' : ''}`}>
                  <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <div className="flex justify-between items-center">
                          <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  <Activity className="w-5 h-5 text-cyan-500" /> Active Identity Monitor
                              </h3>
                              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Scanning global stores and social networks for unauthorized biometric matches.</p>
                          </div>
                          <button 
                            onClick={handleScan}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
                          >
                              <Scan className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} /> 
                              {isScanning ? 'Scanning...' : 'Manual Sweep'}
                          </button>
                      </div>
                  </div>

                  <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <h4 className="text-sm font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">Recent Activity</h4>
                      <div className="space-y-4">
                          {[
                              { platform: 'YouTube', title: 'Vocal Clone - "Summer Remix"', match: '98%', status: 'Resolution Sent', date: '2h ago' },
                              { platform: 'TikTok', title: 'Unauthorized Cover (Deepfake)', match: '92%', status: 'Resolved', date: '1d ago' }
                          ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs ${
                                          item.platform === 'YouTube' ? 'bg-red-600' : 'bg-pink-600'
                                      }`}>
                                          {item.platform[0]}
                                      </div>
                                      <div>
                                          <h5 className="text-slate-900 dark:text-white font-bold text-sm">{item.title}</h5>
                                          <span className="text-xs text-slate-500 dark:text-slate-400">{item.date} • {item.platform}</span>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                      <div className="text-right">
                                          <div className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">{item.match} Match</div>
                                          <div className="text-xs text-slate-500">Certainty</div>
                                      </div>
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                                          item.status === 'Resolved' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                                      }`}>
                                          {item.status}
                                      </span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
