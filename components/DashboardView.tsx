
import React from 'react';
import { DollarSign, Play, Activity, TrendingUp, Upload, CheckCircle, User, ArrowRight, Shield, Coins, Zap } from 'lucide-react';
import { User as UserType, Stats, Opportunity } from '../types';

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
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Portfolio Command</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Managing digital assets for <span className="text-white font-bold">{user.displayName}</span></p>
        </div>
        <div className="flex gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Alchemy Nodes Active</span>
            </div>
            {user.plan === 'free' && (
                <button onClick={onUpgrade} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
                    <Zap className="w-3 h-3" /> Maximize Revenue
                </button>
            )}
        </div>
      </div>

      {/* Hero: Valuation Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20"></div>
              <div className="relative z-10">
                  <div className="text-xs font-bold text-indigo-200 uppercase tracking-widest mb-1">Estimated Asset Valuation</div>
                  <div className="text-4xl font-black mb-4">$124,500.00</div>
                  <div className="flex gap-4">
                      <div className="bg-black/20 backdrop-blur rounded-lg p-3 flex-1">
                          <div className="text-[10px] text-indigo-200 font-bold uppercase">Liquid Earnings</div>
                          <div className="text-lg font-bold">${stats.totalEarnings.toLocaleString()}</div>
                      </div>
                      <div className="bg-black/20 backdrop-blur rounded-lg p-3 flex-1">
                          <div className="text-[10px] text-indigo-200 font-bold uppercase">Rights Leverage</div>
                          <div className="text-lg font-bold">12 Active</div>
                      </div>
                  </div>
              </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 border border-green-500/20">
                      <Shield className="w-5 h-5" />
                  </div>
                  <div>
                      <h3 className="font-bold text-white text-sm">VoiceShield™</h3>
                      <p className="text-[10px] text-slate-500">Infrastructure Monitoring</p>
                  </div>
              </div>
              <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Web Presence</span>
                      <span className="text-green-400 font-bold">Secured</span>
                  </div>
                  <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Deepfake Detection</span>
                      <span className="text-green-400 font-bold">Active</span>
                  </div>
              </div>
              <button onClick={() => onNavigate('voice')} className="mt-4 text-[10px] font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-widest flex items-center gap-1">
                  Security Console <ArrowRight className="w-3 h-3" />
              </button>
          </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Settled Royalties', value: `$${stats.totalEarnings.toLocaleString()}`, change: '+12%', icon: DollarSign, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Audience Reach', value: stats.totalStreams.toLocaleString(), change: '+8%', icon: Play, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
          { label: 'Unclaimed Rights', value: '$1,240', change: 'Scan', icon: Activity, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          { label: 'Reputation Score', value: stats.brandScore, change: 'Rising', icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-purple-400" /> Infrastructure Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { title: "Mint Voice x402", desc: "Enable rights liquidation", icon: Shield, col: "text-purple-400", bg: "bg-purple-400/10", view: "voice" },
                    { title: "Vault Submission", desc: "Sync to global distributors", icon: Upload, col: "text-cyan-400", bg: "bg-cyan-400/10", view: "distribution" },
                    { title: "Match Briefs", desc: "Sonic AI deal matching", icon: CheckCircle, col: "text-green-400", bg: "bg-green-400/10", view: "opportunities" },
                    { title: "Marketplace Seat", desc: "Manage license inventory", icon: User, col: "text-amber-400", bg: "bg-amber-400/10", view: "voice" }
                ].map((act, i) => (
                    <button key={i} onClick={() => onNavigate(act.view)} className="flex items-center gap-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 transition-all text-left group">
                        <div className={`p-3 rounded-xl ${act.bg} ${act.col} group-hover:scale-110 transition-transform`}>
                            <act.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="font-bold text-white text-sm">{act.title}</div>
                            <div className="text-xs text-slate-500">{act.desc}</div>
                        </div>
                    </button>
                ))}
              </div>
          </div>
        </div>

        {/* Right Col: Ledger Feed */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rights Feed</h3>
             <button onClick={() => onNavigate('smart-wallet')} className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Ledger</button>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1 max-h-[600px] pr-2">
            {opportunities.slice(0, 4).map(op => (
              <div key={op.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{op.usage_type}</span>
                  <span className="text-green-500 text-[10px] font-bold border border-green-500/20 px-1.5 rounded uppercase">Matched</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">{op.brief_title}</h4>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800">
                    <span className="text-xs font-mono text-indigo-400">${op.payout_min} - ${op.payout_max}</span>
                    <button className="text-[10px] font-bold text-slate-400 group-hover:text-white flex items-center gap-1 transition-colors">
                        Review Deal <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
