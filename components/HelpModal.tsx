
import React from 'react';
import { X, BookOpen, Wand2, Music, Shield, DollarSign, Zap, Globe, MessageSquare, PlayCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestartOnboarding: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, onRestartOnboarding }) => {
  if (!isOpen) return null;

  const features = [
    { icon: Wand2, title: "AI Studio", desc: "Generate tracks, stems, and lyrics using Gemini & ElevenLabs." },
    { icon: Shield, title: "VoiceShield™", desc: "Register your voice biometrics on Solana to prevent unauthorized AI cloning." },
    { icon: Zap, title: "Sync Agent", desc: "Auto-match your catalog to opportunities from Netflix, HBO, and ads." },
    { icon: Globe, title: "Distribution", desc: "Release music to Spotify, Apple Music, and 150+ stores globally." },
    { icon: DollarSign, title: "Revenue Recovery", desc: "Find unclaimed royalties in black box databases." },
    { icon: Music, title: "Battles Arena", desc: "Compete in AI vs Human music battles for XP and prizes." },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Help & Knowledge Base</h2>
              <p className="text-slate-400 text-sm">Everything you need to know about SoundForge Pro.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-white text-lg mb-1">New to SoundForge?</h3>
                    <p className="text-sm text-slate-400">Restart the guided setup tour to configure your studio.</p>
                </div>
                <button 
                    onClick={onRestartOnboarding}
                    className="whitespace-nowrap px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-full text-sm flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
                >
                    <PlayCircle className="w-4 h-4" /> Restart Tour
                </button>
             </div>
             
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h3 className="font-bold text-white text-lg mb-1">Need Support?</h3>
                    <p className="text-sm text-slate-400">Contact our support team or chat with the AI Agent.</p>
                </div>
                <button className="whitespace-nowrap px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-full text-sm flex items-center gap-2 transition-colors">
                    <MessageSquare className="w-4 h-4" /> Contact Us
                </button>
             </div>
          </div>

          {/* Feature Grid */}
          <div>
              <h3 className="text-lg font-bold text-white mb-4">Platform Features</h3>
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

          {/* Shortcuts */}
          <div>
              <h3 className="text-lg font-bold text-white mb-4">Keyboard Shortcuts</h3>
              <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">General</div>
                      <ul className="space-y-2 text-sm text-slate-300">
                          <li className="flex justify-between"><span className="text-slate-400">Search</span> <kbd className="bg-slate-800 px-2 rounded text-xs">Cmd+K</kbd></li>
                          <li className="flex justify-between"><span className="text-slate-400">Help</span> <kbd className="bg-slate-800 px-2 rounded text-xs">?</kbd></li>
                      </ul>
                  </div>
                  <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">Studio</div>
                      <ul className="space-y-2 text-sm text-slate-300">
                          <li className="flex justify-between"><span className="text-slate-400">Play/Pause</span> <kbd className="bg-slate-800 px-2 rounded text-xs">Space</kbd></li>
                          <li className="flex justify-between"><span className="text-slate-400">Undo</span> <kbd className="bg-slate-800 px-2 rounded text-xs">Cmd+Z</kbd></li>
                      </ul>
                  </div>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};
