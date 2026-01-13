
import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Play, Activity, TrendingUp, Upload, CheckCircle, User, 
  ArrowRight, Shield, Coins, Zap, Star, Layout, Crown, Music, 
  MessageSquare, Disc, Wand2, MapPin, Briefcase, BookOpen, Users, Sliders, BarChart2, Mail, Mic, Radio, Vote, Link, Landmark,
  Globe, ShieldCheck, CheckCircle2, Server
} from 'lucide-react';
import { User as UserType, Stats, Opportunity } from '../types';
import { dataService } from '../services/dataService';

const ICON_MAP: Record<string, any> = {
  Shield, Coins, Zap, Upload, Music, Disc, Wand2, MapPin, Briefcase, BookOpen, Users, Sliders, BarChart2, User, Mail, Mic, Radio, Vote, Link, Activity, Layout, Landmark, MessageSquare
};

interface DashboardViewProps {
  user: UserType;
  stats: Stats;
  opportunities: Opportunity[];
  onNavigate: (view: string) => void;
  onUpgrade: () => void;
  onUpload: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ 
    user, stats, opportunities, onNavigate, onUpgrade, onUpload 
}) => {
  const [isNodeLive, setIsNodeLive] = useState(false);
  const repPercent = Math.min(100, (stats.xp / 5000) * 100);
  const strokeDash = 2 * Math.PI * 45;
  const offset = strokeDash - (repPercent / 100) * strokeDash;

  useEffect(() => {
      // Check if we are connected to the real production node
      dataService.pingNode().then(live => setIsNodeLive(live));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Artist Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back, <span className="text-cyan-500 font-black">{user.displayName}</span></p>
        </div>
        <div className="flex gap-3">
            {isNodeLive ? (
                <div className="bg-green-500/10 border border-green-500/20 rounded-full px-5 py-2 flex items-center gap-2 shadow-[0_0_15px_rgba(34,197,94,0.1)] group">
                    <Server className="w-3.5 h-3.5 text-green-500" />
                    <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Institutional Ledger Synchronized</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1"></div>
                </div>
            ) : (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2 flex items-center gap-2 shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-widest">Sandbox Protocol Active</span>
                </div>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                  <Music className="w-96 h-96 -rotate-12" />
              </div>
              
              <div className="relative z-10 flex flex-col md:flex-row justify-between h-full gap-12">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-300 mb-6">
                        <Crown className="w-3 h-3" /> Total Artist Earnings
                    </div>
                    <div className="text-7xl font-black tracking-tighter mb-4">${stats.totalEarnings.toLocaleString()}<span className="text-2xl text-slate-500">.00</span></div>
                    <div className="flex gap-8">
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Streams</div>
                            <div className="text-2xl font-bold text-green-400">{stats.totalStreams.toLocaleString()}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Forge Rep</div>
                            <div className="text-2xl font-bold text-cyan-400">{stats.xp} XP</div>
                        </div>
                    </div>
                  </div>

                  <div className="w-48 h-48 flex flex-col items-center justify-center bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-md shadow-inner">
                      <div className="relative w-32 h-32">
                          <svg className="w-full h-full -rotate-90">
                              <circle cx="64" cy="64" r="45" className="fill-none stroke-slate-800 stroke-[8]" />
                              <circle cx="64" cy="64" r="45" 
                                className="fill-none stroke-cyan-500 stroke-[8] transition-all duration-1000 ease-out"
                                strokeDasharray={strokeDash}
                                strokeDashoffset={offset}
                                strokeLinecap="round"
                              />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                              <span className="text-3xl font-black tracking-tighter">{Math.round(repPercent)}%</span>
                              <span className="text-[8px] font-bold uppercase text-slate-500">Node Pwr</span>
                          </div>
                      </div>
                      <div className="mt-4 text-[10px] font-black text-indigo-300 uppercase tracking-widest">{stats.artistLevel}</div>
                  </div>
              </div>
          </div>

          <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex-1 flex flex-col justify-between group hover:border-cyan-500/50 transition-all">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-cyan-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                          <ShieldCheck className="w-6 h-6 text-cyan-500" />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Node</span>
                  </div>
                  <div>
                      <h3 className="font-bold dark:text-white uppercase tracking-tight">VoiceShield™</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">Vocal DNA protected on Solana.</p>
                  </div>
                  <button onClick={() => onNavigate('voice')} className="mt-4 py-2.5 w-full text-[10px] font-black uppercase tracking-widest text-white bg-slate-950 dark:bg-slate-800 hover:bg-cyan-500 transition-all rounded-xl shadow-lg">
                      Manage IP
                  </button>
              </div>

              <div className="bg-cyan-500 rounded-[2rem] p-6 shadow-2xl shadow-cyan-500/20 group cursor-pointer overflow-hidden relative transition-all hover:scale-[1.02]" onClick={onUpgrade}>
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform"><Zap className="w-20 h-20 text-slate-950" /></div>
                  <h3 className="text-slate-950 font-black text-lg uppercase tracking-tight">Expand Node</h3>
                  <p className="text-slate-900/60 text-xs font-bold leading-relaxed mt-1">Unlock 100% royalties and AI Marketing Staff.</p>
                  <ArrowRight className="w-5 h-5 text-slate-950 mt-4 group-hover:translate-x-2 transition-transform" />
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                      <Layout className="w-5 h-5 text-indigo-500" /> Roster Infrastructure
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { title: "Voice Market", desc: "License your voice avatar.", icon: "Shield", col: "text-purple-500", bg: "bg-purple-500/10", view: "voice" },
                        { title: "Smart Wallet", desc: "Institutional AA account.", icon: "Wallet", col: "text-amber-500", bg: "bg-amber-500/10", view: "smart-wallet" },
                        { title: "Advances", desc: "Catalog-based funding.", icon: "Landmark", col: "text-indigo-500", bg: "bg-indigo-500/10", view: "advances" },
                        { title: "Distribution", desc: "Deploy to Spotify/TikTok.", icon: "Upload", col: "text-green-500", bg: "bg-green-500/10", view: "distribution" }
                      ].map((act, i) => {
                          const IconComponent = ICON_MAP[act.icon];
                          return (
                            <button key={i} onClick={() => onNavigate(act.view)} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/50 transition-all text-left group">
                                <div className={`p-4 rounded-xl ${act.bg} ${act.col} group-hover:scale-110 transition-transform shadow-inner`}>
                                    {IconComponent && <IconComponent className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight">{act.title}</div>
                                    <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{act.desc}</div>
                                </div>
                            </button>
                          );
                      })}
                  </div>
              </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 flex flex-col shadow-sm">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Sync Ledger</h3>
                  <button onClick={() => onNavigate('opportunities')} className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">Full Feed</button>
              </div>
              
              <div className="space-y-4 overflow-y-auto flex-1 max-h-[400px] pr-2 custom-scrollbar">
                  {opportunities.map(op => (
                      <div key={op.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-cyan-500/50 transition-all cursor-pointer group">
                          <div className="flex justify-between items-start mb-2">
                              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{op.usage_type}</span>
                              <span className="text-green-500 text-[8px] font-black border border-green-500/20 px-2 py-0.5 rounded uppercase">{op.match_score}% Match</span>
                          </div>
                          <h4 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1 uppercase tracking-tight">{op.brief_title}</h4>
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                              <span className="text-[10px] font-mono font-bold text-indigo-500">Up to ${op.payout_max}</span>
                              <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-1 transition-all" />
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};
