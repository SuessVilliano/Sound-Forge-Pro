
import React from 'react';
import { 
  Music, Zap, DollarSign, Globe, ShieldCheck, 
  Play, ArrowRight, BarChart2, Wand2, CheckCircle2, Layout, User, ChevronDown, HelpCircle, Lock, Mic, Radio, Star
} from 'lucide-react';
import { APP_NAME, FEATURED_ARTISTS } from '../constants';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md fixed w-full z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-gradient-to-tr from-cyan-400 to-teal-500 p-2 rounded-lg shadow-lg shadow-cyan-500/20">
              <Music className="text-slate-950 w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight text-white">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
                <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</button>
                <button onClick={() => scrollToSection('voiceshield')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">VoiceShield</button>
                <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</button>
            </div>
            <button 
              onClick={onOpenAuth}
              className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-xl shadow-white/5"
            >
              <User className="w-4 h-4" />
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-cyan-900/20 via-slate-950/0 to-slate-950 pointer-events-none"></div>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] -z-10 opacity-50 animate-pulse-slow"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 backdrop-blur rounded-full px-4 py-1.5 mb-8">
            <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">Your Career, Powered by AI</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight">
            The Complete Platform for <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500">The Modern Artist.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Everything you need to create, protect, and monetize your music. AI mastering, distribution, sync placements, and your own AI team to manage the business while you focus on the art.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onOpenAuth}
              className="w-full sm:w-auto bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-105"
            >
               Get Started for Free
               <ArrowRight className="w-5 h-5" />
            </button>
            <button 
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto bg-slate-800/50 border border-slate-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all backdrop-blur-sm"
            >
              See Features
            </button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-900 border-t border-slate-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Built for Every Creator</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              From bedroom producers to major stars, Sound Merge gives you the tools to compete on a global stage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "Protect Your Voice", desc: "VoiceShield™ secures your vocal DNA on the blockchain. Detect unauthorized clones and keep your rights safe.", color: "text-green-400", bg: "bg-green-500/10" },
              { icon: Zap, title: "Get Your Music in Film/TV", desc: "Our AI agents match your tracks with sync briefs from Netflix, HBO, and top brands automatically.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { icon: Wand2, title: "AI Creative Suite", desc: "Generate beats, lyrics, and professional masters in seconds. It’s like having a world-class studio in your pocket.", color: "text-purple-400", bg: "bg-purple-500/10" },
              { icon: Globe, title: "Global Distribution", desc: "Release to Spotify, Apple Music, and TikTok. Keep 100% of your royalties and watch your career grow.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
              { icon: BarChart2, title: "Deep Analytics", desc: "Understand your audience with real-time data from Spotify and TikTok. Know exactly where your next tour should be.", color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: DollarSign, title: "Recover Lost Royalties", desc: "We scan global databases to find and reclaim unclaimed money you didn’t even know was yours.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map((feature, i) => (
              <div key={i} className={`p-8 rounded-2xl border border-slate-800 bg-slate-950 hover:bg-slate-900 transition-all group`}>
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white uppercase tracking-tight">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden bg-slate-950">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Ready to level up?</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join thousands of artists who are already using Sound Merge to build their future.
          </p>
          <button 
            onClick={onOpenAuth}
            className="bg-white text-slate-950 px-10 py-5 rounded-full text-lg font-bold transition-all shadow-2xl hover:scale-105 flex items-center justify-center gap-3 mx-auto"
          >
            Join Sound Merge Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
};
