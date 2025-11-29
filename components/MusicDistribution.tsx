import React from 'react';
import { CheckCircle2, ExternalLink, Globe, Music2, Radio, Zap, FileText, HelpCircle } from 'lucide-react';
import { DISTRIBUTION_PARTNERS } from '../constants';

export const MusicDistribution: React.FC = () => {
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-slate-850 p-6 rounded-xl border border-slate-800">
             <div className="text-xs text-slate-400 mb-1">Total Streams</div>
             <div className="text-2xl font-bold text-white flex items-center gap-2">
                 <Music2 className="w-5 h-5 text-purple-400" /> 0
             </div>
         </div>
         <div className="bg-slate-850 p-6 rounded-xl border border-slate-800">
             <div className="text-xs text-slate-400 mb-1">Total Revenue</div>
             <div className="text-2xl font-bold text-white flex items-center gap-2">
                 <span className="text-green-400">$</span> 0.00
             </div>
         </div>
         <div className="bg-slate-850 p-6 rounded-xl border border-slate-800">
             <div className="text-xs text-slate-400 mb-1">Active Distributions</div>
             <div className="text-2xl font-bold text-white flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-cyan-400" /> 0
             </div>
         </div>
      </div>

      {/* Platform Reach */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 p-8">
         <div className="flex items-center gap-3 mb-2">
             <Globe className="w-5 h-5 text-slate-300" />
             <h3 className="text-lg font-bold text-white">Your Music Reaches These Platforms</h3>
         </div>
         <p className="text-slate-400 text-sm mb-6">When you distribute through our partners, your music automatically goes to 150+ platforms.</p>
         
         <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            {['Spotify', 'Apple Music', 'Amazon Music', 'YouTube Music', 'TikTok', 'Deezer'].map((p, i) => (
                <div key={i} className="bg-slate-800/50 p-4 rounded-lg flex flex-col items-center justify-center gap-2 border border-slate-700/50">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                        {p[0]}
                    </div>
                    <span className="text-xs font-medium text-slate-300">{p}</span>
                </div>
            ))}
         </div>
      </div>

      {/* Partners */}
      <div>
          <h3 className="text-xl font-bold text-white mb-4">Distribution Partners</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {DISTRIBUTION_PARTNERS.map((partner, i) => (
                 <div key={i} className="bg-slate-850 rounded-xl border border-slate-800 p-6 flex flex-col">
                     <div className="flex justify-between items-start mb-4">
                         <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                 <Music2 className="w-6 h-6 text-white" />
                             </div>
                             <div>
                                 <h4 className="font-bold text-white text-lg">{partner.name}</h4>
                                 <span className="text-xs text-slate-400">{partner.cost}</span>
                             </div>
                         </div>
                         <span className="text-xs bg-slate-800 text-slate-400 px-2 py-1 rounded-md border border-slate-700">Not Connected</span>
                     </div>

                     <div className="space-y-2 mb-6 flex-1">
                        {partner.features.map((f, j) => (
                            <div key={j} className="flex items-center gap-2 text-xs text-slate-300">
                                <Zap className="w-3 h-3 text-cyan-400" /> {f}
                            </div>
                        ))}
                     </div>

                     <div className="flex justify-between text-xs text-slate-500 border-t border-slate-800 pt-4 mb-4">
                         <div>
                             <span className="block mb-1">Processing Time</span>
                             <span className="text-slate-300 font-semibold">{partner.speed}</span>
                         </div>
                         <div className="text-right">
                             <span className="block mb-1">Payout</span>
                             <span className="text-slate-300 font-semibold">{partner.payout}</span>
                         </div>
                     </div>

                     <button className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all">
                         <ExternalLink className="w-4 h-4" /> Connect
                     </button>
                 </div>
             ))}
          </div>
      </div>

      {/* How To Get Started */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 p-8">
         <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="w-5 h-5 text-slate-300" />
            <h3 className="text-lg font-bold text-white">How to Get Started</h3>
         </div>
         
         <div className="space-y-6 relative">
             <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-800"></div>
             
             {[
                 { title: "Choose Your Distributor", desc: "Select a distribution platform above (DistroKid for speed, TuneCore for features)." },
                 { title: "Create an Account", desc: "Click 'Connect' to sign up with your chosen distributor (annual fees apply)." },
                 { title: "Upload Your Music", desc: "Export your mastered tracks from SoundForge and upload them to your distributor's platform." },
                 { title: "Track Your Success", desc: "Monitor streams, revenue, and analytics through your distributor's dashboard." }
             ].map((step, i) => (
                 <div key={i} className="relative flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 z-10 ring-4 ring-slate-850">
                         {i + 1}
                     </div>
                     <div>
                         <h4 className="text-white font-bold text-sm">{step.title}</h4>
                         <p className="text-slate-400 text-xs mt-1">{step.desc}</p>
                     </div>
                 </div>
             ))}
         </div>
      </div>
    </div>
  );
};