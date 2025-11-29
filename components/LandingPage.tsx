
import React from 'react';
import { 
  Music, Zap, DollarSign, Globe, ShieldCheck, 
  Play, ArrowRight, BarChart2, Wand2, CheckCircle2, Layout, User
} from 'lucide-react';
import { APP_NAME } from '../constants';

interface LandingPageProps {
  onOpenAuth: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-500/30">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur fixed w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-cyan-400 to-teal-500 p-2 rounded-lg">
              <Music className="text-slate-950 w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-6">
            <button className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</button>
            <button className="hidden md:block text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</button>
            <button 
              onClick={onOpenAuth}
              className="bg-white text-slate-900 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:bg-slate-200 flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Sign In / Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-medium text-cyan-400">v2.5 Now Live with Google Gemini</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            The Complete <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500">Music Industry Platform</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            Manage your entire career in one place. From AI-powered sync licensing to VoiceShield™ protection.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <button 
              onClick={onOpenAuth}
              className="w-full sm:w-auto bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
            >
               Get Started Free
               <ArrowRight className="w-5 h-5" />
            </button>
            <button className="w-full sm:w-auto bg-slate-800/50 border border-slate-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
              <Play className="w-5 h-5 fill-current" /> Watch Demo
            </button>
          </div>

          {/* Hero Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 border-t border-slate-800 pt-10 animate-in fade-in delay-500 duration-1000">
            {[
              { label: "Upfront Cost", val: "$0" },
              { label: "Royalties Kept (Pro)", val: "100%" },
              { label: "Sync Commission", val: "20%" },
              { label: "Voice Protection", val: "Included" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-3xl font-bold text-cyan-400 mb-1">{stat.val}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-24 bg-slate-900/50 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">The Artist-First Ecosystem</h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              We only make money when you succeed, or when you use our premium power tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: "Sync Opportunities", desc: "Get your music placed in TV, Film, and Ads. Free users split revenue 80/20. Pro users keep 100%.", color: "text-yellow-400" },
              { icon: Globe, title: "Global Distribution", desc: "Distribute to Spotify, Apple Music, TikTok, and 150+ stores. No hidden upload fees.", color: "text-cyan-400" },
              { icon: ShieldCheck, title: "VoiceShield™", desc: "Mint your voice on the blockchain. We track unauthorized usage and handle legal takedowns automatically.", color: "text-green-400" },
              { icon: Wand2, title: "AI Studio", desc: "Generate ideas, master tracks, and create artwork with our state-of-the-art Gemini AI integration.", color: "text-purple-400" },
              { icon: BarChart2, title: "Advanced Analytics", desc: "Track your performance across all platforms in one dashboard. Powered by Chartmetric.", color: "text-blue-400" },
              { icon: Layout, title: "Smart Contracts", desc: "Automated royalty splits for collaborators. The platform handles the payments so you don't have to.", color: "text-red-400" },
            ].map((feature, i) => (
              <div key={i} className="bg-slate-950 p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/30 transition-all hover:-translate-y-1 group">
                <div className={`w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-cyan-950/20"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-8">Your Career, Protected & Profitable</h2>
          <p className="text-xl text-slate-400 mb-10">
            Join the platform that treats your voice as an asset, not a product.
          </p>
          <button 
            onClick={onOpenAuth}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-10 py-5 rounded-full text-lg font-bold transition-all shadow-2xl shadow-cyan-500/20 hover:scale-105 flex items-center justify-center gap-3 mx-auto"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-6 text-sm text-slate-500 flex items-center justify-center gap-6">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> Free Forever Tier</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500"/> No Credit Card Needed</span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-cyan-400 to-teal-500 p-1.5 rounded-lg">
              <Music className="text-slate-950 w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-white">{APP_NAME}</span>
          </div>
          <div className="text-slate-500 text-sm">
            © 2025 {APP_NAME}. Empowering artists worldwide with Web3 technology.
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
