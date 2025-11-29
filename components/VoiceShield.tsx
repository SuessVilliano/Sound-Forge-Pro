
import React, { useState } from 'react';
import { Shield, Activity, FileText, Scan, Globe, Lock, Mic, CheckCircle2, AlertTriangle } from 'lucide-react';
import { User } from '../types';
import { registerVoice } from '../services/voiceService';
import { dataService } from '../services/dataService';

interface VoiceShieldProps {
  user: User;
  onUpgrade: () => void;
}

export const VoiceShield: React.FC<VoiceShieldProps> = ({ user, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<'register' | 'monitor'>('register');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleRegister = async () => {
      setIsRegistering(true);
      try {
          // Simulate fetching a file (in real app, use audio recorder)
          const mockFile = new File(["audio"], "voice_sample.wav", { type: "audio/wav" });
          
          const result = await registerVoice(mockFile);
          
          if (result.success && result.nft) {
              await dataService.saveVoiceRegistration(user.uid, result.nft);
              alert("Voice successfully registered and minted on Solana!");
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

  const isPro = user.plan !== 'free';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
           <h1 className="text-2xl font-bold text-white flex items-center gap-2">
               <Shield className="w-6 h-6 text-green-500" /> VoiceShield™ Protection
           </h1>
           <p className="text-slate-400 text-sm mt-1">Register your voice DNA on the blockchain and detect unauthorized AI clones.</p>
        </div>
        <div className="bg-slate-800 p-1 rounded-lg flex gap-1">
            <button 
                onClick={() => setActiveTab('register')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'register' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}
            >
                Registration
            </button>
            <button 
                onClick={() => setActiveTab('monitor')}
                className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'monitor' ? 'bg-green-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
                Web Monitoring
            </button>
        </div>
      </div>

      {activeTab === 'register' ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
              <div className="bg-slate-850 rounded-xl border border-slate-800 p-8">
                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                          <Mic className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                          <h3 className="text-lg font-bold text-white">Voice Fingerprinting</h3>
                          <p className="text-slate-400 text-sm">Create a unique biometric ID for your voice.</p>
                      </div>
                  </div>

                  <div className="space-y-4 mb-8">
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <div>
                              <h4 className="text-white font-bold text-sm">Biometric Analysis</h4>
                              <p className="text-slate-400 text-xs">We analyze pitch, tone, and cadence to create a unique signature.</p>
                          </div>
                      </div>
                      <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                          <div>
                              <h4 className="text-white font-bold text-sm">Blockchain Registration</h4>
                              <p className="text-slate-400 text-xs">Your voice ID is minted as an immutable NFT on the Solana network.</p>
                          </div>
                      </div>
                  </div>

                  <button 
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                      {isRegistering ? 'Processing Audio...' : 'Register Voice ID (Solana)'}
                  </button>
              </div>

              <div className="bg-slate-850 rounded-xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
                  <Shield className="w-24 h-24 text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">Why Register?</h3>
                  <p className="text-slate-400 text-sm max-w-sm mb-6">
                      Registration establishes your legal ownership of your vocal likeness. This is required to issue takedowns against unauthorized AI clones.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-bold">
                      <Globe className="w-3 h-3" /> Solana Network Secured
                  </div>
              </div>
          </div>
      ) : (
          <div className="relative animate-in fade-in duration-300">
              {/* Pro Lock Overlay */}
              {!isPro && (
                  <div className="absolute inset-0 z-20 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 rounded-xl border border-slate-700">
                      <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                          <Lock className="w-8 h-8 text-green-400" />
                      </div>
                      <h2 className="text-3xl font-bold text-white mb-2">Active Protection is Pro-Only</h2>
                      <p className="text-slate-300 max-w-md mb-8">
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
                  <div className="bg-slate-850 rounded-xl border border-slate-800 p-6">
                      <div className="flex justify-between items-center">
                          <div>
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                  <Activity className="w-5 h-5 text-green-400" /> Active Web Monitor
                              </h3>
                              <p className="text-slate-400 text-xs mt-1">Scanning YouTube, TikTok, Spotify, and SoundCloud for voice matches.</p>
                          </div>
                          <button 
                            onClick={handleScan}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors border border-slate-700"
                          >
                              <Scan className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} /> 
                              {isScanning ? 'Scanning...' : 'Run Manual Scan'}
                          </button>
                      </div>
                  </div>

                  {/* Recent Detections */}
                  <div className="bg-slate-850 rounded-xl border border-slate-800 p-6">
                      <h4 className="text-sm font-bold text-white mb-4">Recent Detections</h4>
                      <div className="space-y-4">
                          {[
                              { platform: 'YouTube', title: 'AI Cover - "Your Song"', match: '98%', status: 'Takedown Sent', date: '2h ago' },
                              { platform: 'TikTok', title: 'Viral Remix (Sped Up)', match: '85%', status: 'Pending Review', date: '5h ago' },
                              { platform: 'SoundCloud', title: 'Untitled Demo', match: '92%', status: 'Resolved', date: '1d ago' }
                          ].map((item, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                  <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-xs ${
                                          item.platform === 'YouTube' ? 'bg-red-600' : 
                                          item.platform === 'TikTok' ? 'bg-pink-600' : 'bg-orange-500'
                                      }`}>
                                          {item.platform[0]}
                                      </div>
                                      <div>
                                          <h5 className="text-white font-bold text-sm">{item.title}</h5>
                                          <span className="text-xs text-slate-400">{item.date} • {item.platform}</span>
                                      </div>
                                  </div>
                                  <div className="flex items-center gap-6">
                                      <div className="text-right">
                                          <div className="text-green-400 font-bold text-sm">{item.match} Match</div>
                                          <div className="text-xs text-slate-500">Confidence</div>
                                      </div>
                                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                          item.status === 'Takedown Sent' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                          item.status === 'Resolved' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                          'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
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
