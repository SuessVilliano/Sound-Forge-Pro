
import React from 'react';
/* Added RefreshCw to lucide-react imports to resolve missing name error */
import { X, BookOpen, Wand2, Music, Shield, DollarSign, Zap, Globe, MessageSquare, PlayCircle, Cpu, ZapOff, Sparkles, Server, Inbox, Share2, LayoutGrid, Lock, Users, RefreshCw } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartOnboarding: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onRestartOnboarding }) => {
  if (!isOpen) return null;

  const features = [
    { icon: Wand2, title: "AI Music Studio", desc: "Generate radio-ready tracks with 5 AI engines: Udio, Suno, MusicGPT, Mureka, and AIMusic. 5 credits per generation." },
    { icon: Users, title: "AI Staff", desc: "Your virtual team powered by Gemini: Manager, Marketing, Distribution, and Legal agents working 24/7." },
    { icon: Zap, title: "Sync Opportunities", desc: "Match your catalog to 20+ briefs across 8 platforms: Songtradr, Musicbed, Artlist, and more. Payouts up to $100K." },
    { icon: Globe, title: "Distribution", desc: "DistroKid-compatible export with auto-generated ISRC/UPC codes. Copy-paste ready for 150+ stores." },
    { icon: Shield, title: "VoiceShield", desc: "Biometric vocal fingerprinting on Solana. Detect deepfakes and protect your voice DNA." },
    { icon: Briefcase, title: "Brand Builder", desc: "AI-generated cover art, promo videos, and cinematic content with Gemini Image and Veo 3.1." },
    { icon: DollarSign, title: "Credit System", desc: "50-2500 credits/month based on plan. Purchase packs with up to 50% bonus. 100% royalty share on Pro." },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Knowledge Base</h2>
              <p className="text-slate-400 text-sm font-medium">Sound Forge Pro v3.0 - AI-powered music creation and distribution.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
          <div className="bg-slate-850 border border-slate-700 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-lg">
                  <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter italic">Profile Reset</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">
                      Restart onboarding to update your profile, reconnect social accounts, or retrain your AI staff with new information about your music career.
                  </p>
              </div>
              <button onClick={onRestartOnboarding} className="px-10 py-5 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-full text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl shadow-cyan-600/20 transition-all hover:scale-105">
                  <RefreshCw className="w-5 h-5" /> Re-Sync Node
              </button>
          </div>

          <div>
              <h3 className="text-xs font-black text-slate-500 mb-8 flex items-center gap-3 uppercase tracking-[0.3em] ml-1"><Sparkles className="w-4 h-4 text-cyan-400" /> Professional Architecture</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((feat, i) => (
                      <div key={i} className="p-8 rounded-3xl bg-slate-950 border border-slate-800 hover:border-cyan-500/30 transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                              <feat.icon className="w-12 h-12 text-cyan-400" />
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 transition-colors">
                              <feat.icon className="w-6 h-6 text-cyan-400" />
                          </div>
                          <h4 className="font-black text-white mb-2 uppercase tracking-tight italic">{feat.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
