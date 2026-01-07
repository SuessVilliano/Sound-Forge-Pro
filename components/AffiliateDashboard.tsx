import React, { useState } from 'react';
import { DollarSign, Copy, ExternalLink, Link as LinkIcon, Users, TrendingUp, Check, ArrowRight, MousePointer, UserPlus, CreditCard } from 'lucide-react';
import { affiliateService } from '../services/affiliateService';
import { User } from '../types';

interface AffiliateDashboardProps {
  user: User | null;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ user }) => {
  const [affiliateCode, setAffiliateCode] = useState(user?.email || ''); // Default to user email
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Mock stats - in a real implementation, this would fetch from PushLap API if available
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

  const handleCopy = () => {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl p-8 border border-indigo-900/50 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Users className="w-64 h-64 text-white" />
          </div>
          <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                  <DollarSign className="w-3 h-3" /> Affiliate Program
              </div>
              <h1 className="text-4xl font-bold text-white mb-4">Partner with Sound Merge</h1>
              <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
                  Earn 40% recurring revenue for every artist you refer. Track your performance and payouts directly through our partner, PushLapGrowth.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                  <a 
                    href="https://soundmerge.pushlapgrowth.com/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/20"
                  >
                      Apply Now <ArrowRight className="w-4 h-4" />
                  </a>
                  <a 
                    href="https://soundmerge.pushlapgrowth.com/" 
                    target="_blank" 
                    rel="noreferrer"
                    className="bg-white/10 backdrop-blur border border-white/20 text-white px-8 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
                  >
                      Login to Dashboard <ExternalLink className="w-4 h-4" />
                  </a>
              </div>
          </div>
      </div>

      {/* Statistics Grid */}
      <div>
          <h3 className="text-lg font-bold text-white mb-4">Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                  <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
                      <div>
                          <div className="text-2xl font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-slate-500">{stat.label}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.bg}`}>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                  </div>
              ))}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Link Generator */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-cyan-500" /> Create Referral Link
              </h3>
              
              <div className="space-y-6">
                  <div>
                      <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-2">
                          Your PushLap Affiliate ID (or Email)
                      </label>
                      <div className="flex gap-3">
                          <input 
                            type="text" 
                            value={affiliateCode}
                            onChange={(e) => setAffiliateCode(e.target.value)}
                            placeholder="Enter your affiliate ID"
                            className="flex-1 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                          />
                          <button 
                            onClick={handleGenerate}
                            disabled={!affiliateCode}
                            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 rounded-lg font-bold transition-colors disabled:opacity-50"
                          >
                              Generate
                          </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                          Use the specific ID provided in your PushLap dashboard for accurate tracking.
                      </p>
                  </div>

                  {generatedLink && (
                      <div className="bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-200 dark:border-cyan-900/30 rounded-xl p-4 animate-in slide-in-from-top-2">
                          <label className="block text-xs font-bold text-cyan-700 dark:text-cyan-400 mb-2 uppercase tracking-wide">
                              Your Custom URL
                          </label>
                          <div className="flex items-center justify-between gap-4 bg-white dark:bg-slate-950 p-3 rounded-lg border border-cyan-100 dark:border-cyan-900/50">
                              <code className="text-slate-700 dark:text-slate-300 text-sm font-mono truncate">
                                  {generatedLink}
                              </code>
                              <button 
                                onClick={handleCopy}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
                                title="Copy to clipboard"
                              >
                                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                              </button>
                          </div>
                      </div>
                  )}
              </div>
          </div>

          {/* How It Works */}
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-8 h-fit">
              <h3 className="text-lg font-bold text-white mb-6">How It Works</h3>
              <div className="space-y-8 relative">
                  {/* Connector Line */}
                  <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-800"></div>

                  {[
                      { title: "Get Your Link", desc: "Sign up on PushLap and generate your unique URL.", icon: LinkIcon },
                      { title: "Share & Promote", desc: "Share with artists, producers, and your audience.", icon: Users },
                      { title: "Get Paid", desc: "Receive 40% recurring commission on every sale.", icon: CreditCard }
                  ].map((item, i) => (
                      <div key={i} className="flex gap-4 relative z-10">
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                              <item.icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <div>
                              <h4 className="text-white font-bold text-sm">{item.title}</h4>
                              <p className="text-slate-400 text-xs mt-1 leading-relaxed">{item.desc}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};