
import React from 'react';
import { X, BookOpen, Wand2, Music, Shield, DollarSign, Zap, Globe, MessageSquare, PlayCircle, Cpu, ZapOff, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartOnboarding: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onRestartOnboarding }) => {
  if (!isOpen) return null;

  const features = [
    { icon: Wand2, title: "AI Studio", desc: "Generate tracks, stems, and lyrics using Sound Merge's specialized creative engines." },
    { icon: Shield, title: "VoiceShield™", desc: "Register your voice biometrics on the Sound Merge Ledger to prevent unauthorized cloning." },
    { icon: Zap, title: "Sync Agent", desc: "Auto-match your catalog to institutional opportunities from Netflix, HBO, and ad agencies." },
    { icon: Globe, title: "Distribution", desc: "Release music directly to Spotify, Apple Music, and 150+ stores globally via the Sound Merge network." },
    { icon: DollarSign, title: "Revenue Recovery", desc: "Find unclaimed royalties in global black box databases." },
    { icon: Music, title: "Battles Arena", desc: "Compete in AI vs Human music battles for Merge Reputation and prizes." },
  ];

  const engines = [
      { name: "Udio & Suno", desc: "Industry leaders for full vocal tracks and structured radio-ready songs." },
      { name: "Mureka", desc: "Professional cinematic node. Best for high-fidelity instrumentals and film scoring." },
      { name: "MusicGPT", desc: "Ultra-fast text-to-music. Perfect for quick loops, beats, and rapid prototyping." },
      { name: "AI Music", desc: "Experimental texture engine. Ideal for genre-blending and aggressive modern production." }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Knowledge Base</h2>
              <p className="text-slate-400 text-sm">Master the Sound Merge ecosystem and build your professional career.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-white text-lg mb-1">New to Sound Merge?</h3>
                    <p className="text-sm text-slate-400">Restart the guided setup tour to hire your initial staff and configure your studio.</p>
                </div>
                <button onClick={onRestartOnboarding} className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full text-sm flex items-center gap-2 shadow-lg">
                    <PlayCircle className="w-4 h-4" /> Restart Tour
                </button>
             </div>
             
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-white text-lg mb-1">Need Support?</h3>
                    <p className="text-sm text-slate-400">Contact the Sound Merge team or message your AI Staff.</p>
                </div>
                <button className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-full text-sm flex items-center gap-2 transition-colors">
                    <MessageSquare className="w-4 h-4" /> Contact Us
                </button>
             </div>
          </div>

          <div>
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest"><Cpu className="w-5 h-5 text-indigo-400" /> Neural Engine Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {engines.map((eng, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
                          <h4 className="font-black text-cyan-400 text-xs uppercase tracking-widest mb-2">{eng.name}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">{eng.desc}</p>
                      </div>
                  ))}
              </div>
          </div>

          <div>
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 uppercase tracking-widest"><Sparkles className="w-5 h-5 text-cyan-400" /> Platform Infrastructure</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {features.map((feat, i) => (
                      <div key={i} className="p-4 rounded-xl bg-slate-850 border border-slate-800 hover:border-slate-700 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-3">
                              <feat.icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <h4 className="font-bold text-white text-sm mb-1">{feat.title}</h4>
                          <p className="text-xs text-slate-400 leading-relaxed">{feat.desc}</p>
                      </div>
                  ))}
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};
