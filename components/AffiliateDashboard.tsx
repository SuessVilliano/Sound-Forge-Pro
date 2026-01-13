
import React, { useState } from 'react';
import { 
    DollarSign, Copy, ExternalLink, Link as LinkIcon, Users, TrendingUp, Check, 
    ArrowRight, MousePointer, UserPlus, CreditCard, Sparkles, Wand2, Loader2,
    MessageSquare, Send, Globe, Zap
} from 'lucide-react';
import { affiliateService } from '../services/affiliateService';
import { generateAffiliatePitch } from '../services/geminiService';
import { User } from '../types';

interface AffiliateDashboardProps {
  user: User | null;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ user }) => {
  const [affiliateCode, setAffiliateCode] = useState(user?.email || '');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  
  // AI Pitch State
  const [targetVibe, setTargetVibe] = useState('Indie Producers');
  const [aiPitch, setAiPitch] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);

  const stats = [
    { label: "Total Clicks", value: "0", icon: MousePointer, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Signups", value: "0", icon: UserPlus, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Conversion Rate", value: "0%", icon: TrendingUp, color: "text-green-400", bg: "bg-green-500/10" },
    { label: "Pending Earnings", value: "$0.00", icon: DollarSign, color: "text-yellow-400", bg: "bg-yellow-500/10" },
  ];

  const handleGenerate = () => {
      if (!affiliateCode) return;
      const link = affiliateService.generateLink(affiliateCode);
      setGeneratedLink(link);
  };

  const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerateAiPitch = async () => {
      setIsGeneratingPitch(true);
      try {
          const pitch = await generateAffiliatePitch(targetVibe, user?.displayName || 'Sound Merge Member');
          setAiPitch(pitch);
      } catch (e) {
          console.error(e);
      } finally {
          setIsGeneratingPitch(false);
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-10 border border-indigo-900/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Users className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                  <Zap className="w-3 h-3 text-yellow-500 animate-pulse" /> Growth Node Cluster Active
              </div>
              <h1 className="text-5xl font-black text-white mb-4 uppercase tracking-tighter italic leading-none">Partner <br/>Infrastructure.</h1>
              <p className="text-indigo-200 text-lg mb-10 leading-relaxed font-medium">
                  Earn 40% recurring yield for referring artists to the Sound Merge ecosystem. Direct settlement via PushLapGrowth rails.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                  <a href="https://soundmerge.pushlapgrowth.com/" target="_blank" rel="noreferrer" className="bg-indigo-500 hover:bg-indigo-400 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-600/20">Apply Now <ArrowRight className="w-4 h-4" /></a>
                  <a href="https://soundmerge.pushlapgrowth.com/" target="_blank" rel="noreferrer" className="bg-white/10 backdrop-blur border border-white/20 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white/20 transition-all">Command Center <ExternalLink className="w-4 h-4" /></a>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Controls */}
          <div className="lg:col-span-2 space-y-8">
              {/* Link Generator */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight italic">
                      <LinkIcon className="w-5 h-5 text-cyan-500" /> Referral Matrix
                  </h3>
                  
                  <div className="space-y-6">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Affiliate ID / Partner Node</label>
                          <div className="flex gap-4">
                              <input 
                                type="text" 
                                value={affiliateCode}
                                onChange={(e) => setAffiliateCode(e.target.value)}
                                placeholder="Your Node ID..."
                                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-5 py-4 text-slate-900 dark:text-white font-bold focus:border-cyan-500 outline-none shadow-inner"
                              />
                              <button 
                                onClick={handleGenerate}
                                disabled={!affiliateCode}
                                className="bg-cyan-600 hover:bg-cyan-500 text-white px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all disabled:opacity-30 shadow-lg shadow-cyan-600/20"
                              >
                                  Generate
                              </button>
                          </div>
                      </div>

                      {generatedLink && (
                          <div className="bg-cyan-500/5 dark:bg-cyan-500/10 border border-cyan-500/20 rounded-3xl p-6 animate-in slide-in-from-top-2">
                              <div className="flex items-center justify-between gap-4">
                                  <code className="text-cyan-600 dark:text-cyan-400 text-sm font-mono truncate">{generatedLink}</code>
                                  <button onClick={() => handleCopy(generatedLink)} className="p-3 bg-white dark:bg-slate-800 rounded-xl text-slate-500 hover:text-cyan-500 transition-all shadow-sm">
                                      {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                  </button>
                              </div>
                          </div>
                      )}
                  </div>
              </div>

              {/* NEURAL PITCH GENERATOR */}
              <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Sparkles className="w-40 h-40 text-purple-400" />
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3 uppercase tracking-tight italic">
                      <Wand2 className="w-5 h-5 text-purple-500" /> Neural Copy Generator
                  </h3>

                  <div className="space-y-6 relative z-10">
                      <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Target Persona Vibe</label>
                          <select 
                            value={targetVibe}
                            onChange={(e) => setTargetVibe(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500"
                          >
                              <option>Indie Producers</option>
                              <option>Bedroom Pop Artists</option>
                              <option>Electronic Record Labels</option>
                              <option>AI Music Enthusiasts</option>
                              <option>Sync Licensing Hunters</option>
                          </select>
                      </div>

                      {aiPitch && (
                          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-sm italic text-slate-300 font-medium leading-relaxed animate-in zoom-in duration-300">
                              "{aiPitch}"
                              <div className="mt-4 flex justify-end">
                                  <button onClick={() => handleCopy(aiPitch)} className="text-[10px] font-black uppercase text-purple-400 flex items-center gap-2 hover:text-white transition-colors">
                                      Copy Copy <Copy className="w-3 h-3" />
                                  </button>
                              </div>
                          </div>
                      )}

                      <button 
                        onClick={handleGenerateAiPitch}
                        disabled={isGeneratingPitch}
                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                          {isGeneratingPitch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          {isGeneratingPitch ? 'Synthesizing...' : 'Generate Neural Pitch'}
                      </button>
                  </div>
              </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-inner">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-8 border-b border-slate-800 pb-4 ml-1">Live Global Pulse</h4>
                  <div className="space-y-6">
                      {stats.map((stat, i) => (
                          <div key={i} className="flex items-center gap-4 group">
                              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} shadow-lg transition-transform group-hover:scale-110`}>
                                  <stat.icon className="w-5 h-5" />
                              </div>
                              <div>
                                  <div className="text-xl font-black text-white font-mono">{stat.value}</div>
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-[2.5rem] p-8">
                  <h4 className="font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-400" /> Settlement
                  </h4>
                  <p className="text-indigo-200 text-xs leading-relaxed font-medium mb-6">Commission is calculated net of processing fees and settled monthly in USD via your PushLap account.</p>
                  <button className="w-full py-3 bg-white text-indigo-950 font-black uppercase text-[9px] tracking-widest rounded-xl shadow-lg">Verify Payout Node</button>
              </div>
          </div>
      </div>
    </div>
  );
};
