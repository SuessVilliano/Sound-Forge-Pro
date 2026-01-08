
import React, { useState, useEffect } from 'react';
import { Landmark, Calculator, Info, ShieldCheck, DollarSign, ArrowRight, Loader2, CheckCircle2, ChevronRight, AlertCircle, Phone, Globe } from 'lucide-react';
import { User, FundingRequest } from '../types';
import { dataService } from '../services/dataService';

interface FundingProps {
  user: User;
}

export const Funding: React.FC<FundingProps> = ({ user }) => {
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
                  <Landmark className="text-cyan-500" /> Capital Funding
              </h1>
              <p className="text-slate-400 mt-2 max-w-xl">
                  Institutional, catalog-based funding for professional artists. Access advances based on verified streaming performance and rights ownership.
              </p>
          </div>
      </div>

      {step === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                          <Info className="w-5 h-5 text-cyan-400" /> Overview
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed">
                          Sound Merge partners with institutional capital providers to offer non-recourse advances. Unlike traditional loans, these are based on the proven market value of your existing catalog.
                      </p>
                  </div>
                  <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                      <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-green-400" /> Minimum Eligibility
                      </h3>
                      <ul className="space-y-3">
                          <li className="flex items-center gap-3 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> $100+ net royalties in last 6 months
                          </li>
                          <li className="flex items-center gap-3 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> Verified distribution history
                          </li>
                          <li className="flex items-center gap-3 text-sm text-slate-300">
                              <CheckCircle2 className="w-4 h-4 text-green-500" /> Documented ownership of masters/publishing
                          </li>
                      </ul>
                  </div>
              </div>
              <div className="bg-indigo-600 rounded-2xl p-8 text-white flex flex-col justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Calculate Your Potential</h2>
                    <p className="text-indigo-100 mb-8">Get an instant indicative estimate based on your streaming performance.</p>
                  </div>
                  <button 
                    onClick={() => setStep('calculator')}
                    className="w-full bg-white text-indigo-950 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all"
                  >
                      Open Advance Calculator <ArrowRight className="w-5 h-5" />
                  </button>
              </div>
          </div>
      )}

      {step === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                      <Calculator className="w-6 h-6 text-cyan-500" />
                      <h2 className="text-xl font-bold text-white">Indicative Advance Calculator</h2>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Net Royalties (Last 6 Months)</label>
                          <div className="relative">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                              <input 
                                type="number" 
                                value={royalties || ''} 
                                onChange={(e) => setRoyalties(parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl py-3 pl-8 pr-4 text-white font-bold outline-none focus:border-cyan-500"
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
                          <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-2">
                              <span>0%</span>
                              <span className="text-cyan-400">{ownership}%</span>
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
                                    className={`py-2 rounded-lg text-xs font-bold border transition-all ${stability === s ? 'bg-cyan-500 border-cyan-500 text-slate-950' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                                  >
                                      {s}
                                  </button>
                              ))}
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col justify-between">
                  <div>
                      <h3 className="text-slate-500 text-sm font-bold uppercase tracking-widest mb-2">Indicative Results</h3>
                      <div className="text-4xl font-bold text-white mb-2">
                          {estimate ? `$${estimate.low.toLocaleString()} – $${estimate.high.toLocaleString()}` : '$0 – $0'}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed italic">
                          Indicative estimate only. Subject to verification. Not a loan offer. Our model assumes a 12-month advance window.
                      </p>
                  </div>

                  <div className="space-y-4 mt-8">
                      <div className="p-4 bg-cyan-900/10 border border-cyan-500/20 rounded-xl flex gap-3">
                          <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
                          <p className="text-[10px] text-cyan-200">
                              Based on your input, you {royalties >= 100 ? 'meet' : 'may not meet'} the minimum indicative eligibility of $100 in recent royalties.
                          </p>
                      </div>
                      <button 
                        onClick={() => setStep('request')}
                        className="w-full py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                      >
                          Submit Formal Request <ArrowRight className="w-5 h-5" />
                      </button>
                      <button onClick={() => setStep('overview')} className="w-full text-slate-500 hover:text-white text-xs font-bold">Back to Overview</button>
                  </div>
              </div>
          </div>
      )}

      {step === 'request' && (
          <div className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-white">Application Terminal</h2>
                  <button onClick={() => setStep('calculator')} className="text-sm text-slate-500 hover:text-white">Cancel</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Legal Artist Name</label>
                      <input 
                        value={artistName} onChange={e => setArtistName(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Stage Name (Optional)</label>
                      <input 
                        value={stageName} onChange={e => setStageName(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><Phone className="w-3 h-3" /> Contact Phone</label>
                      <input 
                        value={phone} onChange={e => setPhone(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><Globe className="w-3 h-3" /> Country</label>
                      <input 
                        value={country} onChange={e => setCountry(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary Distributor</label>
                      <input 
                        placeholder="e.g. DistroKid, UnitedMasters"
                        value={distributor} onChange={e => setDistributor(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                      />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1"><DollarSign className="w-3 h-3" /> Desired Funding Amount</label>
                      <input 
                        type="number"
                        placeholder="USD"
                        value={requestedAmount} onChange={e => setRequestedAmount(e.target.value)}
                        className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-white focus:border-cyan-500 outline-none"
                      />
                  </div>
              </div>

              <div className="space-y-6">
                  <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" checked={hasSplits} onChange={e => setHasSplits(e.target.checked)}
                        className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-cyan-500"
                      />
                      <span className="text-sm text-slate-300">My catalog has publishing splits / multiple owners</span>
                  </div>

                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Catalog Notes & Highlights</label>
                      <textarea 
                        value={notes} onChange={e => setNotes(e.target.value)}
                        placeholder="Mention your biggest tracks, upcoming tours, or specific goals for the funding."
                        className="w-full h-32 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl p-4 text-white focus:border-cyan-500 outline-none resize-none"
                      />
                  </div>

                  <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 space-y-4">
                      <div className="flex items-start gap-3">
                          <input 
                            type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                            className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-cyan-500 mt-0.5"
                          />
                          <p className="text-xs text-slate-400 leading-relaxed">
                              I consent to Sound Merge sharing my provided financial and catalog data with authorized funding partners for the purpose of verifying eligibility and generating potential advance offers. I understand this is not a guaranteed offer of credit.
                          </p>
                      </div>
                      
                      <button 
                        onClick={handleSubmitRequest}
                        disabled={loading || !consent || !artistName || royalties < 0}
                        className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Finalize Application"}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {step === 'success' && (
          <div className="max-w-2xl mx-auto py-12 text-center space-y-6 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
                  <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-bold text-white">Application Received</h2>
              <p className="text-slate-400 leading-relaxed">
                  Your institutional funding request has been secured on the Sound Merge Ledger. Our AI analysts and partner coordinators will review your data within 48-72 business hours.
              </p>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 inline-block mx-auto">
                  <span className="text-xs text-slate-500 uppercase font-bold mr-3 tracking-widest">Reference ID:</span>
                  <code className="text-cyan-400 font-mono">REQ-{Math.random().toString(36).substring(2, 10).toUpperCase()}</code>
              </div>
              <div className="pt-8">
                  <button 
                    onClick={() => setStep('overview')}
                    className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition-all"
                  >
                      Return to Hub
                  </button>
              </div>
          </div>
      )}
    </div>
  );
};
