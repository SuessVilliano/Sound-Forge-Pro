
import React, { useState, useRef, useEffect } from 'react';
import { Shield, Activity, Scan, Globe, Lock, Mic, CheckCircle2, Upload, Music, StopCircle, PlayCircle, Loader2 } from 'lucide-react';
import { User, Track } from '../types';
import { registerVoice } from '../services/voiceService';
import { dataService } from '../services/dataService';

interface VoiceShieldProps {
  user: User;
  onUpgrade: () => void;
}

type AudioSource = 'upload' | 'record' | 'library';

export const VoiceShield: React.FC<VoiceShieldProps> = ({ user, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'monitor'>('register');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  
  // Registration State
  const [sourceMode, setSourceMode] = useState<AudioSource>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLibraryTrack, setSelectedLibraryTrack] = useState<Track | null>(null);
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<number | null>(null);

  // Library State
  const [libraryTracks, setLibraryTracks] = useState<Track[]>([]);

  useEffect(() => {
      // Fetch user tracks if library mode is selected
      if (sourceMode === 'library' && user) {
          const unsubscribe = dataService.subscribeToTracks(user.uid, (tracks) => {
              // Map GeneratedTrack to Track to match state type
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
          // In a real app, you'd fetch the BLOB from the URL. 
          // For now, we simulate a file from the track metadata.
          fileToProcess = new File(["mock_audio_content"], `${selectedLibraryTrack.title}.mp3`, { type: "audio/mp3" });
      }

      if (!fileToProcess) {
          alert("Please select or record audio first.");
          return;
      }

      setIsRegistering(true);
      try {
          const result = await registerVoice(fileToProcess);
          
          if (result.success && result.nft) {
              await dataService.saveVoiceRegistration(user.uid, result.nft);
              alert("Voice successfully registered and minted on Solana!");
              // Reset
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
               <Shield className="w-6 h-6 text-green-500" /> VoiceShield™ Protection
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Register your voice DNA on the blockchain and detect unauthorized AI clones.</p>
        </div>
        <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
            <button 
                onClick={() => setActiveTab('register')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'register' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                Registration
            </button>
            <button 
                onClick={() => setActiveTab('monitor')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'monitor' ? 'bg-green-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
            >
                Web Monitoring
            </button>
        </div>
      </div>

      {activeTab === 'register' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                          <Mic className="w-6 h-6 text-cyan-500" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">New Voice Registration</h3>
                          <p className="text-slate-500 dark:text-slate-400 text-sm">Provide a clear audio sample to create your voice print.</p>
                      </div>
                  </div>

                  {/* Input Source Tabs */}
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
                      <button 
                        onClick={() => { setSourceMode('library'); setSelectedFile(null); setSelectedLibraryTrack(null); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${sourceMode === 'library' ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                      >
                          <Music className="w-3 h-3" /> From Library
                      </button>
                  </div>

                  {/* INPUT AREA */}
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
                                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to upload audio file</p>
                                      <p className="text-xs text-slate-500 mt-1">WAV, MP3, or AIFF (Min 1 min)</p>
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
                                          <p className="text-green-500 font-bold mb-4 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Recording Saved</p>
                                          <button 
                                            onClick={() => { setSelectedFile(null); setRecordingDuration(0); }}
                                            className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white underline"
                                          >
                                              Record Again
                                          </button>
                                      </div>
                                  ) : (
                                      <button 
                                        onClick={startRecording}
                                        className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 transition-transform hover:scale-105 active:scale-95"
                                      >
                                          <Mic className="w-8 h-8" />
                                      </button>
                                  )
                              ) : (
                                  <button 
                                    onClick={stopRecording}
                                    className="w-16 h-16 rounded-full bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95 animate-pulse"
                                  >
                                      <StopCircle className="w-8 h-8" />
                                  </button>
                              )}
                              
                              <p className="mt-6 text-xs text-slate-500 text-center max-w-xs">
                                  Read a generic paragraph of text to capture your full vocal range.
                              </p>
                          </div>
                      )}

                      {sourceMode === 'library' && (
                          <div className="border border-slate-200 dark:border-slate-700 rounded-xl max-h-60 overflow-y-auto bg-slate-50 dark:bg-slate-900">
                              {libraryTracks.length === 0 ? (
                                  <div className="p-8 text-center text-slate-500">
                                      <Music className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                      <p className="text-sm">No tracks found in your library.</p>
                                  </div>
                              ) : (
                                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                      {libraryTracks.map(track => (
                                          <div 
                                            key={track.id} 
                                            onClick={() => setSelectedLibraryTrack(track)}
                                            className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${selectedLibraryTrack?.id === track.id ? 'bg-cyan-50 dark:bg-cyan-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                          >
                                              <img src={track.image} className="w-10 h-10 rounded bg-slate-300 object-cover" alt="cover" />
                                              <div className="flex-1 min-w-0">
                                                  <p className={`text-sm font-bold truncate ${selectedLibraryTrack?.id === track.id ? 'text-cyan-700 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>{track.title}</p>
                                                  <p className="text-xs text-slate-500">{track.duration} • {track.bpm} BPM</p>
                                              </div>
                                              {selectedLibraryTrack?.id === track.id && <CheckCircle2 className="w-5 h-5 text-cyan-500" />}
                                          </div>
                                      ))}
                                  </div>
                              )}
                          </div>
                      )}
                  </div>

                  <button 
                    onClick={handleRegister}
                    disabled={isRegistering || (!selectedFile && !selectedLibraryTrack)}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/20"
                  >
                      {isRegistering ? (
                          <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</>
                      ) : (
                          <>Register Voice ID (Solana)</>
                      )}
                  </button>
              </div>

              <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-sm">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                  <Shield className="w-24 h-24 text-slate-300 dark:text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Why Register?</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-6">
                      Registration establishes your legal ownership of your vocal likeness. This is required to issue takedowns against unauthorized AI clones.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-600 dark:text-purple-400 text-xs font-bold">
                      <Globe className="w-3 h-3" /> Solana Network Secured
                  </div>
              </div>
          </div>
      ) : (
          <div className="relative animate-in fade-in duration-300">
              {/* Pro Lock Overlay */}
              {!isPro && (
                  <div className="absolute inset-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                          <Lock className="w-8 h-8 text-green-500" />
                      </div>
                      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Active Protection is Pro-Only</h2>
                      <p className="text-slate-500 dark:text-slate-300 max-w-md mb-8">
                          Upgrade to Artist Pro to enable 24/7 web scanning, deepfake detection, and automated DMCA takedowns for your voice.
                      </p>
                      <button 
                        onClick={onUpgrade}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transition-transform hover:scale-105"
                      >
                          Upgrade to Pro
                      </button>
                  </div>
              )}

              <div className={`grid grid-cols-1 gap-6 ${!isPro ? 'filter blur-sm' : ''}`}>
                  {/* Scanner Controls */}
                  <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <div className="flex justify-between items-center">
                          <div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                  <Activity className="w-5 h-5 text-green-500" /> Active Web Monitor
                              </h3>
                              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Scanning YouTube, TikTok, Spotify, and SoundCloud for voice matches.</p>
                          </div>
                          <button 
                            onClick={handleScan}
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200 dark:border-slate-700"
                          >
                              <Scan className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} /> 
                              {isScanning ? 'Scanning...' : 'Run Manual Scan'}
                          </button>
                      </div>
                  </div>

                  {/* Recent Detections */}
                  <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Recent Detections</h4>
                      <div className="space-y-4">
                          {[
                              { platform: 'YouTube', title: 'AI Cover - "Your Song"', match: '98%', status: 'Takedown Sent', date: '2h ago' },
                              { platform: 'TikTok', title: 'Viral Remix (Sped Up)', match: '85%', status: 'Pending Review', date: '5h ago' },
                              { platform: 'SoundCloud', title: 'Untitled Demo', match: '92%', status: 'Resolved', date: '1d ago' }
                          ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs ${
                                          item.platform === 'YouTube' ? 'bg-red-600' : 
                                          item.platform === 'TikTok' ? 'bg-pink-600' : 'bg-orange-500'
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
                                          <div className="text-green-600 dark:text-green-400 font-bold text-sm">{item.match} Match</div>
                                          <div className="text-xs text-slate-500">Confidence</div>
                                      </div>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                          item.status === 'Takedown Sent' ? 'bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20' :
                                          item.status === 'Resolved' ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-500/20' :
                                          'bg-yellow-100 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20'
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
