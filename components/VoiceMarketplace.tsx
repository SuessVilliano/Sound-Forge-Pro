

import React, { useState, useEffect } from 'react';
/* Added Loader2 and Globe to the lucide-react imports to fix missing name errors */
import { Mic, Search, FileText, Check, Clock, Play, DollarSign, ShieldCheck, Zap, ArrowRight, UserCheck, Star, Loader2, Globe } from 'lucide-react';
import { VoiceAsset, User } from '../types';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

export const VoiceMarketplace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'browse' | 'list' | 'licenses'>('browse');
  const user = authService.getCurrentUser();
  const [myVerifiedAssets, setMyVerifiedAssets] = useState<VoiceAsset[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if (user) {
          const unsub = dataService.subscribeToVoiceRegistrations(user.uid, (assets) => {
              setMyVerifiedAssets(assets.filter(a => a.status === 'active') as any);
          });
          return () => unsub();
      }
  }, [user]);

  const handleListVoice = async (asset: VoiceAsset) => {
      setLoading(true);
      await new Promise(r => setTimeout(r, 1500));
      // Mark as marketplace active in DB
      setLoading(false);
      alert("Voice profile listed on marketplace. Licensing protocols active.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight italic">
              <Mic className="w-8 h-8 text-cyan-500" /> Voice IP Marketplace
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Verified licensing for institutional voice avatars.</p>
        </div>

        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-xl p-1 border border-slate-300 dark:border-slate-700">
            {['browse', 'list', 'licenses'].map(t => (
                <button key={t} onClick={() => setActiveTab(t as any)} className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-white'}`}>{t}</button>
            ))}
        </div>
      </div>

      {activeTab === 'browse' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                <input type="text" placeholder="Search verified voice identities (ISRC/VoiceID)..." className="w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 shadow-sm outline-none" />
            </div>
            <div className="h-64 bg-slate-100 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-500">
                <ShieldCheck className="w-12 h-12 mb-4 opacity-20" />
                <p className="font-black uppercase text-xs tracking-widest italic">Scanning Marketplace Ledger...</p>
            </div>
          </div>
      )}

      {activeTab === 'list' && (
          <div className="animate-in slide-in-from-right-4 duration-500">
              {myVerifiedAssets.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 p-12 rounded-[3rem] text-center space-y-6">
                      <div className="w-20 h-20 bg-slate-950 rounded-full flex items-center justify-center mx-auto border border-slate-800 shadow-xl">
                          <Mic className="w-10 h-10 text-slate-700" />
                      </div>
                      <h3 className="text-xl font-bold text-white uppercase italic">Registry Entry Required</h3>
                      <p className="text-slate-500 max-w-sm mx-auto font-medium">To monetize your voice, you must first secure a biometric signature in the VoiceShield™ vault.</p>
                      <button onClick={() => alert("Redirecting to Registry...")} className="bg-white text-slate-950 px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-xl">Initialize Vault</button>
                  </div>
              ) : (
                  <div className="space-y-8">
                      <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                          <Zap className="absolute top-0 right-0 p-10 w-64 h-64 opacity-10 pointer-events-none" />
                          <div className="relative z-10 max-w-lg">
                              <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none mb-4">Monetize Your <br/>Vocal DNA.</h2>
                              <p className="text-indigo-100 font-medium leading-relaxed mb-8">List your verified voice profile to allow institutional partners to rent your likeness for secure, on-chain licensed generations.</p>
                              <div className="flex gap-4">
                                  <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                                      <div className="text-[8px] font-black uppercase opacity-60">Avg. Payout</div>
                                      <div className="text-lg font-black">$45.00/Min</div>
                                  </div>
                                  <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                                      <div className="text-[8px] font-black uppercase opacity-60">Yield Score</div>
                                      <div className="text-lg font-black">92%</div>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {myVerifiedAssets.map(asset => (
                              <div key={asset.token_id} className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 flex flex-col justify-between hover:border-cyan-500 transition-all group">
                                  <div>
                                      <div className="flex justify-between items-start mb-6">
                                          <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800">
                                              <UserCheck className="w-8 h-8 text-cyan-400" />
                                          </div>
                                          <span className="bg-green-500/10 text-green-400 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-green-500/20">Verified Identity</span>
                                      </div>
                                      <h3 className="text-xl font-bold text-white uppercase italic mb-2">Voice Profile #{asset.token_id.slice(-4)}</h3>
                                      <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8 italic">"Vocal model trained on high-fidelity stems. Provenance watermark PerTh v4.5 applied."</p>
                                  </div>
                                  <button onClick={() => handleListVoice(asset)} disabled={loading} className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl transition-all flex items-center justify-center gap-2">
                                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Globe className="w-4 h-4" /> List Profile</>}
                                  </button>
                              </div>
                          ))}
                      </div>
                  </div>
              )}
          </div>
      )}
    </div>
  );
};
