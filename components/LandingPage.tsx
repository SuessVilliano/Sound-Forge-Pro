
import React, { useState } from 'react';
import { 
  Music, Zap, DollarSign, Globe, ShieldCheck, 
  Play, ArrowRight, BarChart2, Wand2, CheckCircle2, Layout, User, ChevronDown, ChevronRight, HelpCircle, Lock, Mic, Radio, Star, Info, Cpu, Rocket, Shield, Users, Calendar, Mail, Phone, Loader2
} from 'lucide-react';
import { APP_NAME, VIEWS } from '../constants';

interface LandingPageProps {
  onOpenAuth: () => void;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onNavigate }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', consent: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) {
        alert("Please provide consent for communication to proceed.");
        return;
    }
    setIsSubmitting(true);
    
    // Simulate CRM processing
    await new Promise(r => setTimeout(r, 1200));
    
    setIsSubmitting(false);
    // Redirect to the dedicated booking page with the embedded calendar
    onNavigate(VIEWS.BOOKING);
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
            <div className="hidden lg:flex items-center gap-6">
                <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">About</button>
                <button onClick={() => scrollToSection('features')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Features</button>
                <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</button>
                <button onClick={() => scrollToSection('booking')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" /> Book a Call
                </button>
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
      <header className="pt-40 pb-24 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-gradient-to-b from-cyan-900/10 via-slate-950/0 to-slate-950 pointer-events-none"></div>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[150px] -z-10 opacity-50 animate-pulse-slow"></div>

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-full px-5 py-2 mb-10 shadow-2xl">
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[10px] font-black text-cyan-400 tracking-[0.2em] uppercase">V2.5 Live Deployment</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter italic">
            Institutional <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-purple-500">Music Rails.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
            The professional operating system for the next generation of music legends. Direct-to-fan CRM, Neural Creative engines, and on-chain Voice IP protection.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onOpenAuth}
              className="w-full sm:w-auto bg-white text-slate-950 px-12 py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95"
            >
               Join the Forge
               <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button 
                onClick={() => scrollToSection('booking')}
                className="w-full sm:w-auto bg-slate-900/50 border border-slate-700 text-white px-10 py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-slate-800 transition-all backdrop-blur-sm"
            >
              Book Strategy Session
            </button>
          </div>
        </div>
      </header>

      {/* About Us Section */}
      <section id="about" className="py-32 bg-slate-950 relative scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative">
                <div className="absolute -inset-4 bg-cyan-500/10 blur-3xl rounded-[3rem] -z-10"></div>
                <img 
                    src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&auto=format&fit=crop" 
                    className="rounded-[3rem] border border-white/10 shadow-2xl" 
                    alt="The Forge" 
                />
                <div className="absolute bottom-10 left-10 bg-slate-900/90 backdrop-blur border border-white/10 p-6 rounded-2xl shadow-xl max-w-xs">
                    <h4 className="font-bold text-cyan-400 text-sm uppercase tracking-widest mb-1">Our Mission</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">To bridge the gap between creative genius and institutional leverage for every artist on the planet.</p>
                </div>
            </div>
            <div className="space-y-8">
                <div className="inline-block bg-cyan-500/10 px-4 py-1.5 rounded-full border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest">Since 2024</div>
                <h2 className="text-5xl font-black tracking-tight uppercase italic leading-none">We Are <span className="text-cyan-500">Sound Merge.</span></h2>
                <p className="text-lg text-slate-400 leading-relaxed">
                    We didn't build just another music tool. We built the infrastructure. At Sound Merge, we believe artists should have the same technological leverage as major labels.
                </p>
                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0"><Shield className="w-6 h-6 text-cyan-400" /></div>
                        <div>
                            <h4 className="font-bold text-white uppercase tracking-tight">Identity First</h4>
                            <p className="text-sm text-slate-500">Your voice is your most valuable asset. We protect it on-chain.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center shrink-0"><Cpu className="w-6 h-6 text-purple-400" /></div>
                        <div>
                            <h4 className="font-bold text-white uppercase tracking-tight">Neural Intelligence</h4>
                            <p className="text-sm text-slate-500">Using advanced AI not to replace you, but to amplify your creative output.</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 bg-slate-900 border-y border-slate-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter italic">Professional <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-400">Toolkit.</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg font-medium">
                Everything you need to run your music career like a business, powered by institutional-grade AI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: ShieldCheck, title: "VoiceShield™", desc: "Secure your vocal DNA on the blockchain. Detect unauthorized clones and keep your rights safe.", color: "text-green-400", bg: "bg-green-500/10" },
              { icon: Zap, title: "Sync Placement", desc: "Our AI agents match your tracks with sync briefs from global film studios and advertising partners automatically.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
              { icon: Wand2, title: "Neural Creative Studio", desc: "Generate radio-ready tracks, lyrics, and professional masters in seconds via our proprietary Sound Merge engines.", color: "text-purple-400", bg: "bg-purple-500/10" },
              { icon: Globe, title: "Global Network", desc: "Deploy to Spotify, Apple Music, and 150+ stores. Keep 100% of your royalties on our Pro plan.", color: "text-cyan-400", bg: "bg-cyan-500/10" },
              { icon: BarChart2, title: "Deep Analytics", desc: "Real-time industry signals from global ledgers. Know your audience better than ever with institutional data.", color: "text-blue-400", bg: "bg-blue-500/10" },
              { icon: DollarSign, title: "Revenue Recovery", desc: "Our AI scans global black-box databases to find and reclaim unclaimed royalties.", color: "text-emerald-400", bg: "bg-emerald-500/10" },
            ].map((feature, i) => (
              <div key={i} className={`p-10 rounded-[2.5rem] border border-white/5 bg-slate-950/50 hover:bg-slate-950 transition-all group hover:border-cyan-500/30`}>
                <div className={`w-16 h-16 rounded-2xl ${feature.bg} flex items-center justify-center mb-8 shadow-inner`}>
                  <feature.icon className={`w-8 h-8 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-black mb-4 text-white uppercase tracking-tight italic group-hover:text-cyan-400 transition-colors">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                <div className="lg:col-span-4">
                    <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none mb-6">Why Join the <span className="text-cyan-500">Forge?</span></h2>
                    <p className="text-slate-400 font-medium mb-8">Sound Merge is more than a platform—it's your unfair advantage in a saturated market.</p>
                    <button onClick={onOpenAuth} className="flex items-center gap-2 text-cyan-400 font-black uppercase tracking-[0.2em] text-xs hover:gap-4 transition-all">Start Your Journey <ArrowRight className="w-4 h-4" /></button>
                </div>
                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
                        <CheckCircle2 className="w-8 h-8 text-cyan-400" />
                        <h4 className="text-xl font-bold text-white uppercase">100% Ownership</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Unlike traditional distribution, our Pro tier gives you 100% of your earnings. We take zero commission from the artists we serve.</p>
                    </div>
                    <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
                        <Rocket className="w-8 h-8 text-purple-400" />
                        <h4 className="text-xl font-bold text-white uppercase">AI Staff Support</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Delegate the business. Your personal AI Team handles strategy, marketing briefs, and legal compliance 24/7.</p>
                    </div>
                    <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
                        <Zap className="w-8 h-8 text-yellow-400" />
                        <h4 className="text-xl font-bold text-white uppercase">Sync Priority</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Get first-look access to high-budget sync briefs from major film studios and global advertising agencies.</p>
                    </div>
                    <div className="bg-slate-900/50 p-8 rounded-[2rem] border border-white/5 space-y-4">
                        <ShieldCheck className="w-8 h-8 text-green-400" />
                        <h4 className="text-xl font-bold text-white uppercase">Secure Ledger</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">Every track you upload is secured with a cryptographic hash, creating a immutable record of your intellectual property.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-slate-900 border-t border-slate-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tighter italic">Investment <span className="text-cyan-500">Tiers.</span></h2>
            <p className="text-slate-400 text-lg font-medium">Professional plans designed to scale with your success.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {/* Free */}
            <div className="bg-slate-950 p-10 rounded-[3rem] border border-white/5 flex flex-col hover:border-white/10 transition-all">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Artist</h3>
                <div className="text-4xl font-black mb-8">$0<span className="text-sm text-slate-500 font-normal uppercase tracking-widest ml-1">/mo</span></div>
                <ul className="space-y-4 mb-12 flex-1">
                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 className="w-4 h-4 text-slate-600" /> 80% Net Royalties</li>
                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 className="w-4 h-4 text-slate-600" /> Standard Distribution</li>
                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 className="w-4 h-4 text-slate-600" /> AI Studio (10 credits)</li>
                </ul>
                <button onClick={onOpenAuth} className="w-full py-4 rounded-full border border-slate-800 text-white font-black text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all">Get Started</button>
            </div>

            {/* Pro */}
            <div className="bg-slate-950 p-10 rounded-[3rem] border-2 border-cyan-500 flex flex-col relative transform scale-105 shadow-2xl shadow-cyan-500/10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-slate-950 text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em]">Institutional Standard</div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Artist Pro</h3>
                <div className="text-4xl font-black mb-8">$19<span className="text-sm text-slate-500 font-normal uppercase tracking-widest ml-1">/mo</span></div>
                <ul className="space-y-4 mb-12 flex-1">
                    <li className="flex items-center gap-3 text-sm text-white font-bold"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> 100% Net Royalties</li>
                    <li className="flex items-center gap-3 text-sm text-white"><ShieldCheck className="w-4 h-4 text-cyan-400" /> Full VoiceShield™ Protection</li>
                    <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Unlimited AI Studio</li>
                    <li className="flex items-center gap-3 text-sm text-white"><CheckCircle2 className="w-4 h-4 text-cyan-400" /> Priority Sync Placement</li>
                </ul>
                <button onClick={onOpenAuth} className="w-full py-5 rounded-full bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-105 active:scale-95">Go Pro Now</button>
            </div>

            {/* Label */}
            <div className="bg-slate-950 p-10 rounded-[3rem] border border-white/5 flex flex-col hover:border-white/10 transition-all">
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Label</h3>
                <div className="text-4xl font-black mb-8">$99<span className="text-sm text-slate-500 font-normal uppercase tracking-widest ml-1">/mo</span></div>
                <ul className="space-y-4 mb-12 flex-1">
                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Manage 5 Artists</li>
                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Bulk Distribution</li>
                    <li className="flex items-center gap-3 text-sm text-slate-400"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Advanced Analytics Node</li>
                </ul>
                <button onClick={onOpenAuth} className="w-full py-4 rounded-full border border-slate-800 text-white font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 transition-all">Scale Up</button>
            </div>
          </div>
        </div>
      </section>

      {/* A2P COMPLIANT CONTACT FORM SECTION */}
      <section id="booking" className="py-32 bg-slate-950 relative scroll-mt-20 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter italic leading-none">Schedule a <span className="text-cyan-500">Discovery.</span></h2>
            <p className="text-slate-400 mb-12 text-lg font-medium">Ready to scale? Enter your details below to initialize a high-fidelity strategy session with our team.</p>
            
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-[3rem] p-10 border border-white/10 shadow-2xl max-w-2xl mx-auto text-left relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Zap className="w-32 h-32 text-cyan-400" />
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Legal Name</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                                    placeholder="Alex Rivera"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                    placeholder="alex@example.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mobile Number (A2P Compliant)</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input 
                                type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                                placeholder="+1 (555) 000-0000"
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none transition-all placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    {/* A2P COMPLIANCE OPT-IN */}
                    <div className="bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50 space-y-4">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <div className="relative flex items-center justify-center shrink-0 mt-1">
                                <input 
                                    type="checkbox" required checked={formData.consent} onChange={e => setFormData({...formData, consent: e.target.checked})}
                                    className="w-5 h-5 rounded-lg border-slate-800 bg-slate-900 text-cyan-500 focus:ring-cyan-500 transition-all cursor-pointer appearance-none checked:bg-cyan-500 checked:border-cyan-500 border-2" 
                                />
                                {formData.consent && <CheckCircle2 className="w-3 h-3 text-slate-950 absolute pointer-events-none" />}
                            </div>
                            <p className="text-[11px] text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">
                                By providing your phone number and checking this box, you consent to receive automated marketing and transactional text messages (e.g. appointment reminders, platform updates) from Sound Merge. Consent is not a condition of any purchase. Message and data rates may apply. Message frequency varies. You can reply <span className="text-white font-bold">STOP</span> to cancel or <span className="text-white font-bold">HELP</span> for more information.
                            </p>
                        </label>
                        
                        <div className="flex flex-wrap gap-4 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-600">
                            <a href="#" className="hover:text-cyan-400 transition-colors border-b border-slate-800 pb-0.5">Privacy Policy</a>
                            <a href="#" className="hover:text-cyan-400 transition-colors border-b border-slate-800 pb-0.5">Terms of Service</a>
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-3 group disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Finalizing Node Identity...</>
                        ) : (
                            // Add missing ChevronRight icon
                            <>Initialize Strategy Session <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                        )}
                    </button>
                </form>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-cyan-400 to-teal-500 p-2 rounded-lg">
                    <Music className="text-slate-950 w-6 h-6" />
                </div>
                <span className="font-bold text-xl tracking-tight text-white uppercase italic">{APP_NAME}</span>
            </div>
            
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
                <button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About</button>
                <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
                <button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button>
                <a href="https://soundmerge.co" className="hover:text-white transition-colors">SoundMerge.co</a>
            </div>

            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">© 2025 Sound Merge Inc. Built on Institutional Rails.</p>
        </div>
      </footer>
    </div>
  );
};
