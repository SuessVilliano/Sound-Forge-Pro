
import React from 'react';
import { X, BookOpen, Wand2, Music, Shield, DollarSign, Zap, Globe, MessageSquare, PlayCircle, Cpu, ZapOff, Sparkles, Server, Inbox, Share2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartOnboarding: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onRestartOnboarding }) => {
  if (!isOpen) return null;

  const features = [
    { icon: Inbox, title: "Identity Hub", desc: "Manage all communications with fans and industry partners in one synchronized center." },
    { icon: Share2, title: "Promotion Ledger", desc: "Schedule and automate your promotion campaigns across all connected social channels." },
    { icon: Zap, title: "Sync Agent", desc: "Auto-match your catalog to institutional opportunities from Netflix, HBO, and ad agencies." },
    { icon: Globe, title: "Global Network", desc: "Release music directly to Spotify, Apple Music, and 150+ stores globally via the Sound Merge infrastructure." },
    { icon: DollarSign, title: "Revenue Recovery", desc: "Find unclaimed royalties in global black box databases." },
    { icon: Shield, title: "VoiceShield™", desc: "Register your voice biometrics on the Sound Merge Ledger to prevent unauthorized cloning." },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Institutional Knowledge Base</h2>
              <p className="text-slate-400 text-sm">Master the Sound Merge ecosystem and build your professional career.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="max-w-lg">
                  <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Synchronize Your Node</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                      Sound Merge is powered by decentralized professional nodes. Restarting your onboarding ensures your personal "Sound Merge Core" is synchronized correctly with your socials and identity metadata.
                  </p>
              </div>
              <button onClick={onRestartOnboarding} className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-full text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-cyan-500/20 transition-all hover:scale-105">
                  <PlayCircle className="w-4 h-4" /> Restart Setup
              </button>
          </div>

          <div>
              <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest"><Sparkles className="w-5 h-5 text-cyan-400" /> Professional Infrastructure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {features.map((feat, i) => (
                      <div key={i} className="p-6 rounded-2xl bg-slate-950 border border-slate-800 hover:border-cyan-500/30 transition-all group">
                          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 transition-colors">
                              <feat.icon className="w-6 h-6 text-cyan-400" />
                          </div>
                          <h4 className="font-bold text-white mb-1 uppercase tracking-tight">{feat.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
                      </div>
                  ))}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
