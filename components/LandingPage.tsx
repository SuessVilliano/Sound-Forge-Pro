
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
                <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">How it Works</button>
                <button onClick={() => scrollToSection('pricing')} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Pricing</button>
            </div>
            <button 
              onClick={onOpenAuth}
              className="bg-white hover:bg-slate-100 text-slate-900 px-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 flex items-center gap-2 shadow-xl shadow-white/5"
            >
              <User className="w-4 h-4" />
              Login / Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-cyan-900/20 via-slate-950/0 to-slate-950 pointer-events-none"></div>
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-[120px] -z-10 opacity-50 animate-pulse-slow"></div>
        <div className="absolute top-40 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[100px] -z-10 opacity-40"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 backdrop-blur rounded-full px-4 py-1.5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-medium text-cyan-400 tracking-wide">v2.5: AI Agent & VoiceShield™ Live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Your Voice is an Asset. <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-400 to-purple-500">Protect & Monetize It.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            The first all-in-one platform for the AI era. Register your voice on the blockchain, distribute music globally, and let our AI agents find you sync deals.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
            <button 
              onClick={onOpenAuth}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 hover:-translate-y-1"
            >
               Get Started Free
               <ArrowRight className="w-5 h-5" />
            </button>
            <button 
                onClick={() => scrollToSection('features')}
                className="w-full sm:w-auto bg-slate-800/50 border border-slate-700 text-white px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-slate-800 transition-all backdrop-blur-sm"
            >
              <Play className="w-5 h-5 fill-current" /> Watch Demo
            </button>
          </div>

          <div className="mt-16 text-sm text-slate-500 font-medium uppercase tracking-widest animate-in fade-in delay-500">Trusted By Artists On</div>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-6 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 animate-in fade-in delay-500">
              {['Spotify', 'Apple Music', 'TikTok', 'YouTube', 'SoundCloud'].map((brand) => (
                  <div key={brand} className="text-lg font-bold text-slate-300">{brand}</div>
              ))}
          </div>
        </div>
      </header>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-slate-900 border-t border-slate-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything You Need to Win</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Stop paying for 10 different subscriptions. SoundForge Pro unifies your entire career stack.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: ShieldCheck, title: "VoiceShield™ Protection", desc: "Biometric fingerprinting on the Solana blockchain. We detect unauthorized AI clones and handle takedowns automatically.", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
              { icon: Zap, title: "AI Sync Agent", desc: "Our AI scans thousands of briefs daily and auto-pitches your tracks to Netflix, HBO, and ad agencies based on sonic matching.", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
              { icon: Wand2, title: "Generative Studio", desc: "Beat block is dead. Use Gemini & ElevenLabs to generate stems, write lyrics, and master tracks in seconds.", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
              { icon: Globe, title: "Global Distribution", desc: "Unlimited uploads to 150+ stores including Spotify and Apple Music. Keep 100% of your royalties with Pro.", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
              { icon: BarChart2, title: "Real-Time Analytics", desc: "Unified dashboard powered by Chartmetric API. See your streams, revenue, and audience growth in one place.", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
              { icon: DollarSign, title: "Revenue Recovery", desc: "We scan global PRO databases to find unclaimed royalties sitting in black boxes and deposit them to your wallet.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
            ].map((feature, i) => (
              <div key={i} className={`p-8 rounded-2xl border ${feature.border} bg-slate-950 hover:bg-slate-900 transition-all hover:-translate-y-1 group relative overflow-hidden`}>
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feature.desc}</p>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -mr-10 -mt-10 transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- FEATURED SPOTLIGHT --- */}
      <section className="py-24 bg-slate-950 border-t border-slate-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                      <Star className="w-3 h-3" /> Creator Spotlight
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold mb-6">Discover Featured Talent</h2>
                  <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                      Top-tier artists, producers, and vocalists ready to collaborate.
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {FEATURED_ARTISTS.map((artist) => (
                      <div key={artist.uid} onClick={onOpenAuth} className="bg-gradient-to-b from-slate-900 to-slate-950 rounded-2xl border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer group overflow-hidden shadow-2xl shadow-black/50">
                          <div className="h-48 relative overflow-hidden">
                              <img src={artist.photoURL} alt={artist.displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                              <div className="absolute top-3 right-3 bg-amber-500/90 backdrop-blur text-slate-950 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                                  Featured
                              </div>
                          </div>
                          <div className="p-6 relative -mt-12">
                              <div className="w-20 h-20 rounded-full border-4 border-slate-900 overflow-hidden shadow-xl mb-4">
                                  <img src={artist.photoURL} className="w-full h-full object-cover" />
                              </div>
                              <h3 className="text-2xl font-bold text-white mb-1 group-hover:text-amber-400 transition-colors">{artist.displayName}</h3>
                              <p className="text-slate-400 text-sm mb-4 line-clamp-2">{artist.bio}</p>
                              
                              <div className="flex flex-wrap gap-2 mb-6">
                                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs font-bold uppercase">{artist.role}</span>
                                  {/* Fix: added optional chaining for rates access */}
                                  {artist.rates?.voiceLicense ? (
                                      <span className="px-2 py-1 rounded bg-green-900/30 text-green-400 border border-green-500/20 text-xs font-bold">Voice: ${artist.rates?.voiceLicense}</span>
                                  ) : null}
                              </div>

                              <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                                  View Profile <ArrowRight className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Deep Dive 1: VoiceShield */}
      <section className="py-24 border-t border-slate-800 bg-slate-900 overflow-hidden relative">
          <div className="absolute top-1/2 right-0 -translate-x-1/2 w-[500px] h-[500px] bg-green-500/10 rounded-full blur-[100px] -z-10"></div>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-lg opacity-30 transform rotate-3"></div>
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative shadow-2xl">
                      <div className="flex items-center gap-4 mb-8 border-b border-slate-800 pb-6">
                          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                              <Lock className="w-6 h-6" />
                          </div>
                          <div>
                              <div className="text-lg font-bold text-white">Voice Passport #8291</div>
                              <div className="text-xs text-slate-500 font-mono">Solana Network • Verified</div>
                          </div>
                      </div>
                      <div className="space-y-4">
                          {[
                              { label: 'Status', val: 'Active Protection', col: 'text-green-400' },
                              { label: 'Biometric Hash', val: '0x7f...9a21', col: 'text-slate-400 font-mono' },
                              { label: 'Recent Scan', val: 'No unauthorized clones found', col: 'text-slate-300' },
                          ].map((r, i) => (
                              <div key={i} className="flex justify-between items-center p-3 bg-slate-950 rounded-lg border border-slate-800">
                                  <span className="text-sm text-slate-500">{r.label}</span>
                                  <span className={`text-sm font-bold ${r.col}`}>{r.val}</span>
                              </div>
                          ))}
                      </div>
                      <div className="mt-8 pt-6 border-t border-slate-800">
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                              <ShieldCheck className="w-4 h-4 text-green-500" />
                              Monitoring YouTube, TikTok, and Spotify 24/7
                          </div>
                      </div>
                  </div>
              </div>
              <div className="order-1 lg:order-2">
                  <div className="inline-block px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold mb-6">
                      Industry First
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Don't Let AI Steal Your Voice. <span className="text-green-400">Own It.</span></h2>
                  <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                      AI voice cloning is here. Without protection, anyone can use your voice to make music, ads, or content without paying you.
                      <br/><br/>
                      <strong>VoiceShield™</strong> registers your vocal biometrics on the blockchain, creating irrefutable legal proof of ownership. We actively scan the web for deepfakes and issue automated takedowns.
                  </p>
                  <button onClick={onOpenAuth} className="text-white border-b-2 border-green-500 pb-1 font-bold hover:text-green-400 transition-colors flex items-center gap-2 w-fit">
                      Register Your Voice Now <ArrowRight className="w-4 h-4" />
                  </button>
              </div>
          </div>
      </section>

      {/* Deep Dive 2: Sync Agent */}
      <section className="py-24 border-t border-slate-800 bg-slate-900 overflow-hidden relative">
          <div className="absolute top-1/2 left-0 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] -z-10"></div>
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                  <div className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-bold mb-6">
                      AI Powered A&R
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold mb-6">Your Personal <span className="text-purple-400">Sync Agent</span> that Never Sleeps.</h2>
                  <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                      Stop refreshing emails waiting for opportunities. Our AI analyzes your music's mood, bpm, and key, then instantly matches it with thousands of live briefs from Netflix, HBO, and global ad agencies.
                      <br/><br/>
                      We even draft the pitch emails for you.
                  </p>
                  <ul className="space-y-4 mb-8">
                      {[
                          "Automated brief matching based on sonic analysis",
                          "Direct submission to music supervisors",
                          "Fair 80/20 splits (Free) or 100% (Pro)",
                          "Real-time status tracking"
                      ].map((item, i) => (
                          <li key={i} className="flex items-center gap-3 text-slate-300">
                              <CheckCircle2 className="w-5 h-5 text-purple-500" /> {item}
                          </li>
                      ))}
                  </ul>
                  <button onClick={onOpenAuth} className="bg-white text-purple-900 px-8 py-3 rounded-full font-bold hover:bg-purple-50 transition-colors">
                      View Open Briefs
                  </button>
              </div>
              <div className="relative">
                   <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl relative z-10">
                        {/* Mock Opportunity Cards */}
                        {[
                            { title: "Netflix / Sci-Fi Series", type: "Sync Placement", payout: "$2,500 - $5,000", match: "98%" },
                            { title: "Nike / Summer Campaign", type: "Ad Spot", payout: "$15,000", match: "94%" },
                            { title: "Fortnite / In-Game Radio", type: "Game License", payout: "$1,000 + Royalties", match: "89%" },
                        ].map((card, i) => (
                            <div key={i} className={`mb-4 p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between ${i === 0 ? 'border-purple-500/50 bg-purple-500/5' : ''}`}>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{card.title}</h4>
                                    <p className="text-xs text-slate-500">{card.type} • {card.payout}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-green-400">{card.match}</div>
                                    <div className="text-[10px] text-slate-500">Match Score</div>
                                </div>
                            </div>
                        ))}
                        <div className="absolute -bottom-4 -right-4 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-lg flex items-center gap-2">
                            <Zap className="w-4 h-4 fill-white" /> 12 New Matches
                        </div>
                   </div>
              </div>
          </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-slate-950 border-t border-slate-800 scroll-mt-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Simple, Transparent Pricing</h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              Start for free. Upgrade when you're ready to scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Starter</h3>
              <div className="text-4xl font-bold text-white mb-6">$0<span className="text-lg text-slate-500 font-medium">/mo</span></div>
              <p className="text-slate-400 text-sm mb-8 border-b border-slate-800 pb-8">
                Everything you need to release your first track and start building a fanbase.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-600" /> 80% Royalty Retention</li>
                <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-600" /> Distribute to Spotify/Apple</li>
                <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-600" /> Basic Analytics</li>
                <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-slate-600" /> 5 AI Studio Generations/mo</li>
              </ul>
              <button onClick={onOpenAuth} className="w-full py-3 rounded-xl border border-slate-700 text-white font-bold hover:bg-slate-800 transition-colors">Start Free</button>
            </div>

            {/* Pro */}
            <div className="bg-slate-900 rounded-2xl p-8 border-2 border-cyan-500 relative flex flex-col transform md:-translate-y-4 shadow-2xl shadow-cyan-500/10">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-slate-950 px-4 py-1 rounded-full text-xs font-bold uppercase">Most Popular</div>
              <h3 className="text-xl font-bold text-white mb-2">Artist Pro</h3>
              <div className="text-4xl font-bold text-white mb-6">$19<span className="text-lg text-slate-500 font-medium">/mo</span></div>
              <p className="text-slate-400 text-sm mb-8 border-b border-slate-800 pb-8">
                For serious artists who want full protection and 100% of their earnings.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-white text-sm font-medium"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> <strong>100% Royalty Retention</strong></li>
                <li className="flex gap-3 text-white text-sm"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> VoiceShield™ Protection</li>
                <li className="flex gap-3 text-white text-sm"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> Unlimited AI Studio</li>
                <li className="flex gap-3 text-white text-sm"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> Advanced Chartmetric Analytics</li>
                <li className="flex gap-3 text-white text-sm"><CheckCircle2 className="w-5 h-5 text-cyan-400" /> Priority Sync Pitching</li>
              </ul>
              <button onClick={onOpenAuth} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-bold hover:scale-[1.02] transition-transform shadow-lg">Get Pro Access</button>
            </div>

            {/* Label */}
            <div className="bg-slate-900 rounded-2xl p-8 border border-purple-500/30 flex flex-col">
              <h3 className="text-xl font-bold text-white mb-2">Label / Manager</h3>
              <div className="text-4xl font-bold text-white mb-6">$99<span className="text-lg text-slate-500 font-medium">/mo</span></div>
              <p className="text-slate-400 text-sm mb-8 border-b border-slate-800 pb-8">
                Manage multiple artists, catalogs, and contracts in one place.
              </p>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-purple-500" /> Manage 5+ Artist Profiles</li>
                <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-purple-500" /> Automated Royalty Splits</li>
                <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-purple-500" /> Bulk Voice Minting</li>
                <li className="flex gap-3 text-slate-300 text-sm"><CheckCircle2 className="w-5 h-5 text-purple-500" /> API Access</li>
              </ul>
              <button onClick={onOpenAuth} className="w-full py-3 rounded-xl border border-purple-500/50 text-purple-400 font-bold hover:bg-purple-500/10 transition-colors">Contact Sales</button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-slate-900/50">
          <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
              <div className="space-y-4">
                  {[
                      { q: "Does SoundForge own my music?", a: "No. You retain 100% ownership of your masters and publishing. We are a technology partner, not a record label." },
                      { q: "How does VoiceShield™ work?", a: "We analyze your voice's unique biometric data and mint a cryptographic hash to the Solana blockchain. This serves as immutable legal proof of ownership." },
                      { q: "Can I switch from Free to Pro later?", a: "Yes, you can upgrade or downgrade at any time. Your music stays live in stores regardless of your plan." },
                      { q: "How do I get paid?", a: "We collect royalties from Spotify, Apple Music, and other stores and deposit them directly into your SoundForge wallet. You can withdraw to your bank or PayPal monthly." }
                  ].map((item, i) => (
                      <div key={i} className="border border-slate-800 rounded-xl bg-slate-900 p-6">
                          <h4 className="font-bold text-lg text-white mb-2 flex items-center gap-2">
                              <HelpCircle className="w-5 h-5 text-slate-500" /> {item.q}
                          </h4>
                          <p className="text-slate-400 leading-relaxed">{item.a}</p>
                      </div>
                  ))}
              </div>
          </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-950/40 to-slate-950"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">Ready to Take Control?</h2>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
            Join 50,000+ independent artists using SoundForge Pro to build sustainable careers.
          </p>
          <button 
            onClick={onOpenAuth}
            className="bg-white text-slate-950 px-10 py-5 rounded-full text-lg font-bold transition-all shadow-2xl shadow-cyan-500/10 hover:scale-105 flex items-center justify-center gap-3 mx-auto"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </button>
          <p className="mt-6 text-sm text-slate-600">No credit card required for Starter plan.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-gradient-to-tr from-cyan-400 to-teal-500 p-1.5 rounded-lg">
                        <Music className="text-slate-950 w-5 h-5" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">{APP_NAME}</span>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        Empowering artists with AI, Blockchain, and Data to build the music industry of the future.
                    </p>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-4">Platform</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><button className="hover:text-cyan-400 transition-colors">Features</button></li>
                        <li><button className="hover:text-cyan-400 transition-colors">Pricing</button></li>
                        <li><button className="hover:text-cyan-400 transition-colors">VoiceShield™</button></li>
                        <li><button className="hover:text-cyan-400 transition-colors">Distribution</button></li>
                        <li><button onClick={onOpenAuth} className="hover:text-cyan-400 transition-colors">Battles Arena</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-4">Resources</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><button className="hover:text-cyan-400 transition-colors">Blog</button></li>
                        <li><button className="hover:text-cyan-400 transition-colors">Academy</button></li>
                        <li><button className="hover:text-cyan-400 transition-colors">Help Center</button></li>
                        <li><button className="hover:text-cyan-400 transition-colors">Community</button></li>
                        <li><button onClick={onOpenAuth} className="hover:text-cyan-400 transition-colors">Affiliate Program</button></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-white mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-slate-400">
                        <li><button className="hover:text-cyan-400 transition-colors">Privacy Policy</button></li>
                        <li><button className="hover:text-cyan-400 transition-colors">Terms of Service</button></li>
                        <li><button className="hover:text-cyan-400 transition-colors">Cookie Policy</button></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="text-slate-600 text-sm">
                    © 2025 {APP_NAME}, Inc. All rights reserved.
                </div>
                <div className="flex gap-4">
                    {/* Social Icons Placeholder */}
                    <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"><Globe className="w-4 h-4"/></div>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};
