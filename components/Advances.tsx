

import React, { useState, useEffect } from 'react';
import { Landmark, Calculator, Info, ShieldCheck, DollarSign, ArrowRight, Loader2, CheckCircle2, ChevronRight, AlertCircle, Phone, Globe, Signal, Activity } from 'lucide-react';
import { User, FundingRequest } from '../types';
import { dataService } from '../services/dataService';

interface AdvancesProps {
  user: User;
}

export const Advances: React.FC<AdvancesProps> = ({ user }) => {
  const [step, setStep] = useState<'overview' | 'calculator' | 'request' | 'success'>('overview');
  const [loading, setLoading] = useState(false);
  
  // Calculator State
  const [royalties, setRoyalties] = useState<number>(0);
  const [ownership, setOwnership] = useState<number>(100);
  const [stability, setStability] = useState<'Stable' | 'Mixed' | 'Volatile'>('Mixed');
  const [estimate, setEstimate] = useState<{ low: number; high: number } | null>(null);

  // Form State
  const [artistName, setArtistName] = useState(user.displayName);
  const [stageName, setStageName] = useState('');
  const [phone, setPhone] = useState(user.phoneNumber || '');
  const [country, setCountry] = useState(user.location || '');
  const [distributor, setDistributor] = useState('');
  const [hasSplits, setHasSplits] = useState(false);
  const [notes, setNotes] = useState('');
  const [requestedAmount, setRequestedAmount] = useState<string>('');
  const [consent, setConsent] = useState(false);

  // Calculate Advance
  useEffect(() => {
    if (royalties <= 0) {
        setEstimate(null);
        return;
    }
    const avg = royalties / 6;
    const multiples = { Stable: 3.0, Mixed: 2.5, Volatile: 2.0 };
    const ownershipFactor = ownership / 100;
    const mid = avg * 12 * multiples[stability] * ownershipFactor;
    
    setEstimate({
        low: Math.round(mid * 0.70),
        high: Math.round(mid * 1.10)
    });
  }, [royalties, ownership, stability]);

  const handleSubmitRequest = async () => {
      if (!consent || royalties < 0 || !artistName) return;
      
      setLoading(true);
      try {
          const payload: Partial<FundingRequest> = {
              userId: user.uid,
              userEmail: user.email,
              userName: user.displayName,
              artistName,
              stageName,
              contactPhone: phone,
              country,
              primaryDistributor: distributor,
              totalNetRoyaltiesLast6Months: royalties,
              ownsMastersPercent: ownership,
              revenueStability: stability,
              hasPublishingSplits: hasSplits,
              catalogNotes: notes,
              requestedAmount: requestedAmount ? parseFloat(requestedAmount) : undefined,
              consentToShareData: consent
          };

          // submitFundingRequest now implemented in dataService.ts
          await dataService.submitFundingRequest(payload);
          setStep('success');
      } catch (e) {
          alert("Submission failed. Please verify your details.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <Landmark className="w-48 h-48 text-white" />
          </div>
          <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Landmark className="text-cyan-500" /> Professional Advances
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-slate-400 max-w-xl">
                    Institutional, catalog-based advances for professional artists.
                </p>
                <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                    <Activity className="w-3 h-3 text-green-500 animate-pulse" />
                    <span className="text-[9px] font-black text-green-400 uppercase tracking-widest">Real-time Stream Sync Active</span>
                </div>
              </div>
          </div>
      </div>

      {step === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5 text-cyan-400" /> How it Works
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed font-medium">
                          Sound Merge leverages real-time Spotify Playback and Songstats signals to calculate non-recourse advances. We bridge the gap between your streaming revenue and immediate capital needs.
                      </p>
                  </div>
                  <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-green-400" /> Advance Eligibility
                      </h3>
                      <ul className="space-y-3">
                          <li className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> Verified stream history via RapidAPI Nodes
                          </li>
                          <li className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> $100+ net royalties in last 6 months
                          </li>
                          <li className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> On-chain identity verification
                          </li>
                      </ul>
                  </div>
              </div>
              <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-between shadow-2xl shadow-indigo-600/20">
                  <div>
                    <h2 className="text-2xl font-bold mb-4 uppercase tracking-tight italic">Liquidate Future Yield</h2>
                    <p className="text-indigo-100 mb-8 font-medium">Get an instant indicative estimate based on your global streaming footprint.</p>
                  </div>
                  <button 
                    onClick={() => setStep('calculator')}
                    className="w-full bg-white text-indigo-950 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 hover:bg-slate-100 transition-all shadow-xl"
                  >
                      Initialize Signal Search <ArrowRight className="w-5 h-5" />
                  </button>
              </div>
          </div>
      )}

      {step === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6">
                  <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                          <Calculator className="w-6 h-6 text-cyan-500" />
                          <h2 className="text-xl font-bold text-white">Indicative Calculator</h2>
                      </div>
                      <div className="flex items-center gap-1 bg-cyan-500/10 px-2 py-1 rounded border border-cyan-500/20">
                          <Signal className="w-3 h-3 text-cyan-400" />
                          <span className="text-[8px] font-black text-cyan-500 uppercase">Live Node</span>
                      </div>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Net Royalties (Last 6 Months)</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                              <input 
                                type="number" 
                                value={royalties || ''} 
                                onChange={(e) => setRoyalties(parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white font-black outline-none focus:border-cyan-500 shadow-inner"
                                placeholder="0.00"
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Masters Ownership (%)</label>
                          <input 
                            type="range" min="0" max="100" value={ownership} 
                            onChange={(e) => setOwnership(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-slate-700 rounded-full appearance-none cursor-pointer accent-cyan-500"
                          />
                          <div className="flex justify-between text-[10px] font-black text-slate-500 mt-2">
                              <span>0%</span>
                              <span className="text-cyan-400">{ownership}% SECURED</span>
                              <span>100%</span>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Revenue Stability</label>
                          <div className="grid grid-cols-3 gap-2">
                              {['Stable', 'Mixed', 'Volatile'].map(s => (
                                  <button 
                                    key={s}
                                    onClick={() => setStability(s as any)}
                                    className={`py-2 rounded-lg text-[10px] font-black border transition-all uppercase tracking-widest ${stability === s ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-lg' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                                  >
                                      {s}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between shadow-inner">
                  <div>
                      <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] mb-2">Indicative Offer Range</h3>
                      <div className="text-4xl font-black text-white mb-2 italic tracking-tighter">
                          {estimate ? `$${estimate.low.toLocaleString()} – $${estimate.high.toLocaleString()}` : '$0 – $0'}
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium">
                          Subject to verification via Spotify/Songstats nodes. Non-binding estimate for professional liquidation purposes.
                      </p>
                  </div>

                  <div className="space-y-4 mt-8">
                      <div className="p-4 bg-cyan-900/10 border border-cyan-500/20 rounded-xl flex gap-3">
                          <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                          <p className="text-[10px] text-cyan-200 font-medium">
                              Based on your input, you {royalties >= 100 ? 'meet' : 'may not meet'} the minimum verified eligibility threshold.
                          </p>
                      </div>
                      <button 
                        onClick={() => setStep('request')}
                        className="w-full py-4 bg-white text-slate-950 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-100 transition-all flex items-center justify-center gap-2 shadow-xl"
                      >
                          Apply for Liquidation <ArrowRight className="w-5 h-5" />
                      </button>
                      <button onClick={() => setStep('overview')} className="w-full text-slate-600 hover:text-white text-[9px] font-black uppercase tracking-widest">Back to Protocol Overview</button>
                  </div>
              </div>
          </div>
      )}

      {step === 'request' && (
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight italic">Identity Authentication</h2>
                  <button onClick={() => setStep('calculator')} className="text-xs font-black text-slate-500 hover:text-white uppercase">Cancel</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Legal Identity Name</label>
                      <input 
                        value={artistName} onChange={e => setArtistName(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none font-bold"
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Stage Alias</label>
                      <input 
                        value={stageName} onChange={e => setStageName(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none font-bold"
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-1"><Phone className="w-3 h-3" /> Mobile Signal</label>
                      <input 
                        value={phone} onChange={e => setPhone(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none font-bold"
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-1"><Globe className="w-3 h-3" /> Jurisdiction</label>
                      <input 
                        value={country} onChange={e => setCountry(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none font-bold"
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Primary Distribution Node</label>
                      <input 
                        placeholder="e.g. DistroKid, UnitedMasters"
                        value={distributor} onChange={e => setDistributor(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Desired Advance Node</label>
                      <input 
                        type="number"
                        placeholder="USD"
                        value={requestedAmount} onChange={e => setRequestedAmount(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none font-mono"
                      />
                  </div>
              </div>

              <div className="space-y-6">
                  <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" checked={hasSplits} onChange={e => setHasSplits(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-cyan-500"
                      />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">My catalog has publishing splits / multiple node owners</span>
                  </div>

                  <div>
                      <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Operational Notes & Highlights</label>
                      <textarea 
                        value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Mention your top performing ISRC codes or upcoming marketing sprints."
                        className="w-full h-32 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none resize-none shadow-inner"
                      />
                  </div>

                  <div className="p-6 bg-slate-900 rounded-[2rem] border border-slate-800 space-y-4">
                      <div className="flex items-start gap-4">
                          <input 
                            type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-cyan-500 mt-1"
                          />
                          <p className="text-[10px] text-slate-500 leading-relaxed font-medium uppercase tracking-tighter">
                              I authorize Sound Merge to ingest my financial and catalog data via Spotify and Songstats nodes for the purpose of verifying eligibility. I understand this constitutes an application for rights liquidation, not a traditional loan.
                          </p>
                      </div>
                      
                      <button 
                        onClick={handleSubmitRequest}
                        disabled={loading || !consent || !artistName || royalties < 0}
                        className="w-full py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Authorize Advance Protocol"}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {step === 'success' && (
          <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                  <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">Signal Secured</h2>
              <p className="text-slate-400 leading-relaxed font-medium">
                  Your institutional advance request has been anchored to the Sound Merge Ledger. Our AI analysts will verify your performance metrics across all nodes within 48-72 business hours.
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 inline-block mx-auto shadow-inner">
                  <span className="text-[8px] text-slate-500 uppercase font-black mr-3 tracking-[0.3em]">Ledger UID:</span>
                  <code className="text-cyan-400 font-mono font-bold">ADV-{Math.random().toString(36).substring(2, 10).toUpperCase()}</code>
              </div>
              <div className="pt-8">
                  <button 
                    onClick={() => setStep('overview')}
                    className="px-12 py-4 bg-white text-slate-950 rounded-full font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:scale-105 shadow-xl shadow-white/5"
                  >
                      Return to Hub
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
