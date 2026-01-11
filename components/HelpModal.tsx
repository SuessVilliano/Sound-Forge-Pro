
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
    { icon: LayoutGrid, title: "Discovery Lab", desc: "Your node directory. Explore creative, business, and protection tools as you scale your XP." },
    { icon: Users, title: "Team Hub", desc: "Collaborate with your AI staff in a unified war-room. All agents stay aligned on your master game plan." },
    { icon: Inbox, title: "Matrix Inbox", desc: "Institutional messaging center. Reply to SMS, WhatsApp, and Social DMs with AI-assisted drafting." },
    { icon: Zap, title: "Sync Agent", desc: "Auto-match your catalog to institutional placement opportunities from studios and agencies." },
    { icon: Globe, title: "Global Network", desc: "Deploy assets to 150+ stores via Sound Merge rails while maintaining 100% ownership." },
    { icon: Lock, title: "Legal Vault", desc: "Instant access to your signed IP agreements, Voice licenses, and on-chain ownership proofs." },
    { icon: DollarSign, title: "Partners Program", desc: "Earn recurring commissions by referring other artists. Access your tracking links and performance data." },
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
              <p className="text-slate-400 text-sm font-medium">Master your personal institutional infrastructure.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-12 custom-scrollbar">
          <div className="bg-slate-850 border border-slate-700 rounded-[2rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-lg">
                  <h3 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter italic">Node Synchronization</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">
                      If your AI staff feels disconnected or your socials aren't syncing, re-initialize your Sound Merge Core. This resets your identity metadata and re-trains your agents.
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
