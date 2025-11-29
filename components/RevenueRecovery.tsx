import React from 'react';
import { Search, CheckCircle, DollarSign, Eye, FileText, AlertCircle, Clock, ExternalLink, ShieldCheck } from 'lucide-react';
import { PRO_PLATFORMS } from '../constants';

export const RevenueRecovery: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white">Revenue Recovery</h1>
          <p className="text-slate-400 text-sm mt-1">Find and claim unclaimed royalties from streaming platforms and collection agencies worldwide.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
           <div className="p-3 bg-green-500/10 rounded-lg">
             <DollarSign className="w-6 h-6 text-green-400" />
           </div>
           <div>
             <div className="text-2xl font-bold text-white">$0.00</div>
             <div className="text-xs text-slate-500">Total Found</div>
           </div>
        </div>
        <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
           <div className="p-3 bg-yellow-500/10 rounded-lg">
             <Clock className="w-6 h-6 text-yellow-400" />
           </div>
           <div>
             <div className="text-2xl font-bold text-white">$0.00</div>
             <div className="text-xs text-slate-500">Pending Claims</div>
           </div>
        </div>
        <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
           <div className="p-3 bg-cyan-500/10 rounded-lg">
             <CheckCircle className="w-6 h-6 text-cyan-400" />
           </div>
           <div>
             <div className="text-2xl font-bold text-white">$0.00</div>
             <div className="text-xs text-slate-500">Successfully Claimed</div>
           </div>
        </div>
        <div className="bg-slate-850 p-5 rounded-xl border border-slate-800 flex items-center gap-4">
           <div className="p-3 bg-purple-500/10 rounded-lg">
             <ShieldCheck className="w-6 h-6 text-purple-400" />
           </div>
           <div>
             <div className="text-2xl font-bold text-white">0</div>
             <div className="text-xs text-slate-500">Registered Works</div>
           </div>
        </div>
      </div>

      {/* Royalty Scanner */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-white">Royalty Scanner</h3>
            <p className="text-xs text-slate-400">Scan major collection agencies and streaming platforms for unclaimed royalties</p>
          </div>
          <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-colors">
            <Search className="w-4 h-4" />
            Start Scan
          </button>
        </div>

        <div className="bg-cyan-900/20 border border-cyan-500/30 rounded-lg p-4 flex gap-3 mb-8">
            <AlertCircle className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="text-sm text-cyan-100">
                <span className="font-bold">How It Works:</span> Our AI-powered scanner matches your tracks against unclaimed royalty databases from major collection agencies worldwide. We use metadata, audio fingerprinting, and ISRC codes to identify potential matches.
            </div>
        </div>
      </div>

      {/* Rights & Registrations */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-400" /> Rights & Registrations
          </h3>
          <p className="text-slate-400 text-sm mb-6">Connect your accounts or register directly with these Performance Rights Organizations (PROs) to ensure you collect 100% of your royalties.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {PRO_PLATFORMS.map((pro, i) => (
                 <div key={i} className="bg-slate-800/50 rounded-lg p-5 border border-slate-700 hover:border-slate-600 transition-all group flex flex-col h-full">
                     <div className="flex justify-between items-start mb-3">
                        <span className="font-bold text-white text-lg">{pro.name}</span>
                        <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded uppercase font-semibold tracking-wide">{pro.type}</span>
                     </div>
                     <div className="flex-1">
                         <p className="text-xs text-slate-400 mb-4 flex items-center gap-2">
                            Status: <span className="text-slate-500 italic flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Not Connected</span>
                         </p>
                     </div>
                     <a 
                        href={pro.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="w-full bg-slate-700 group-hover:bg-cyan-500 group-hover:text-slate-950 text-slate-200 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                         Connect / Register <ExternalLink className="w-3 h-3" />
                     </a>
                 </div>
             ))}
          </div>
      </div>

      {/* Royalty History */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 p-6 min-h-[300px] flex flex-col">
         <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Royalty History</h3>
            <button className="text-slate-400 hover:text-white text-sm flex items-center gap-2">
                <Eye className="w-4 h-4" /> View Reports
            </button>
         </div>
         
         <div className="flex-1 flex flex-col items-center justify-center bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
            <DollarSign className="w-16 h-16 text-slate-700 mb-4" />
            <h4 className="text-xl font-bold text-slate-400">No royalties found yet</h4>
            <p className="text-slate-500 text-sm mt-2">Run your first scan to discover unclaimed royalties from your music</p>
         </div>
      </div>
    </div>
  );
};