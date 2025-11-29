import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { OpportunityCard } from './components/OpportunityCard';
import { 
  MOCK_OPPORTUNITIES, MOCK_STATS, PLACEMENT_PLATFORMS 
} from './constants';
import { 
  TrendingUp, Play, DollarSign, Activity, Upload, 
  Search, Sliders, CheckCircle, Lock, BookOpen, User, ArrowRight, Globe, Music, Clock
} from 'lucide-react';
import { parseRawBrief } from './services/geminiService';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import { Opportunity, Course, User as UserType, Track } from './types';
import { MOCK_COURSES } from './constants';

// New Components
import { RevenueRecovery } from './components/RevenueRecovery';
import { MusicDistribution } from './components/MusicDistribution';
import { MarketingCRM } from './components/MarketingCRM';
import { VoiceMarketplace } from './components/VoiceMarketplace';
import { AIMonitoring } from './components/AIMonitoring';
import { ArtistProfile } from './components/ArtistProfile';
import { BrandBuilder } from './components/BrandBuilder';
import { AnalyticsView } from './components/AnalyticsView';
import { MusicCreationStudio } from './components/MusicCreationStudio';
import { MasteringConsole } from './components/MasteringConsole';
import { ChatBot } from './components/ChatBot';
import { GigFinder } from './components/GigFinder';
import { LiveAgent } from './components/LiveAgent';
import { LandingPage } from './components/LandingPage';
import { LegalOnboarding } from './components/LegalOnboarding';
import { VoiceShield } from './components/VoiceShield';
import { PricingModal } from './components/PricingModal';
import { AuthModal } from './components/AuthModal';
import { MusicPlayer } from './components/MusicPlayer';
import { MusicCatalog } from './components/MusicCatalog';
import { ARDashboard } from './components/ARDashboard';

function App() {
  // Auth State
  const [user, setUser] = useState<UserType | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // App State
  const [currentView, setCurrentView] = useState('dashboard');
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [isScanning, setIsScanning] = useState(false);
  
  // Onboarding & Legal
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [hasSignedLegal, setHasSignedLegal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Persistent Player State
  const [playerQueue, setPlayerQueue] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayTrack = (track: Track) => {
      // Check if track is already in queue
      const existingIndex = playerQueue.findIndex(t => t.id === track.id);
      if (existingIndex >= 0) {
          setCurrentTrackIndex(existingIndex);
      } else {
          setPlayerQueue([track, ...playerQueue]);
          setCurrentTrackIndex(0);
      }
      setIsPlaying(true);
  };

  useEffect(() => {
    let userUnsubscribe: () => void = () => {};

    // REAL AUTH: Subscribe to Firebase Auth State
    const authUnsubscribe = authService.observeAuth((observedUser) => {
        if (observedUser) {
            // If we have an authenticated user, subscribe to their Firestore doc for real-time updates
            userUnsubscribe = dataService.subscribeToUserProfile(observedUser.uid, (updatedUser) => {
                setUser(updatedUser);
            });
            setUser(observedUser); // Set initial state immediately
            setShowAuthModal(false); // Close modal if open
            if (!hasSignedLegal && !observedUser.uid.startsWith('guest')) {
               setShowLegalModal(true); // Trigger legal onboarding
            }
        } else {
            setUser(null);
            if (userUnsubscribe) userUnsubscribe();
        }
        setLoadingAuth(false);
    });

    // Theme Init
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.add('dark');
    }

    return () => {
        authUnsubscribe();
        if (userUnsubscribe) userUnsubscribe();
    };
  }, []);

  const handleLogout = async () => {
      await authService.logout();
      setCurrentView('dashboard');
  };

  const handleLegalSign = () => {
      setHasSignedLegal(true);
      setShowLegalModal(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Simulated Agent: "Brief Hunter"
  const scanForBriefs = async () => {
    setIsScanning(true);
    const rawBriefFound = `
      NEW BRIEF: Tech Promo. 
      We need a background track for a software launch video. 
      Style: Minimal techno, clean, precise. 
      Budget: $3000 flat fee. 
      Length: 60s. 
      Deadline: Next Friday.
    `;
    
    try {
        const parsed = await parseRawBrief(rawBriefFound);
        if (parsed.brief_title) {
            const newOp: Opportunity = {
                id: `op_${Date.now()}`,
                brief_title: parsed.brief_title || "Unknown",
                description: parsed.description || "",
                source_platform: "internal",
                usage_type: (parsed.usage_type as any) || "Ad",
                duration_required: 60,
                payout_min: parsed.payout_min || 0,
                payout_max: parsed.payout_max || 0,
                deadline_datetime: new Date().toISOString(),
                submission_status: "open",
                match_score: parsed.match_score,
                risk_score: 10,
                recommended_action: "manual_review",
                mood_tags: parsed.mood_tags || []
            };
            setOpportunities([newOp, ...opportunities]);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsScanning(false);
    }
  };

  // Render Logic
  if (loadingAuth) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div></div>;

  if (!user) {
      return (
        <>
          <LandingPage onOpenAuth={() => setShowAuthModal(true)} />
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
      );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Welcome back, {user.displayName}.</p>
        </div>
        {user.plan === 'free' && (
            <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-3 flex items-center gap-3">
                <div className="text-xs text-indigo-200">
                    <span className="font-bold text-white">Free Plan</span> • 80% Royalties
                </div>
                <button onClick={() => setShowPricingModal(true)} className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white px-3 py-1.5 rounded font-bold transition-colors">
                    Upgrade
                </button>
            </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Earnings', value: `$${MOCK_STATS.totalEarnings.toLocaleString()}`, change: '+12.5%', icon: DollarSign, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-400/10' },
          { label: 'Total Streams', value: MOCK_STATS.totalStreams.toLocaleString(), change: '+8.2%', icon: Play, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-100 dark:bg-cyan-400/10' },
          { label: 'Active Opportunities', value: MOCK_STATS.activeOpportunities, change: 'New!', icon: Activity, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-400/10' },
          { label: 'Brand Score', value: MOCK_STATS.brandScore, change: 'Top 5%', icon: TrendingUp, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-400/10' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-850 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className={`text-xs font-bold ${stat.change.includes('+') ? 'text-green-600 dark:text-green-400' : 'text-cyan-600 dark:text-cyan-400'}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-xs text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Activity & Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Activity Chart */}
          <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                 <button className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500">View All</button>
             </div>
            <div className="h-64 w-full flex items-center justify-center flex-col text-slate-400 dark:text-slate-500">
                 <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
                     <Activity className="w-6 h-6 opacity-50" />
                 </div>
                 <p>No recent activity</p>
                 <p className="text-xs mt-1">Start by uploading a track or exploring opportunities</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-4">
             <button className="bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 transition-all group text-left shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 p-3 rounded-lg transition-colors shrink-0">
                  <Upload className="w-5 h-5 text-cyan-500 dark:text-cyan-400" />
                </div>
                <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">Upload New Track</span>
                    <span className="text-xs text-slate-500">Add music to your catalog</span>
                </div>
             </button>
             <button className="bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 transition-all group text-left shadow-sm">
                 <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 p-3 rounded-lg transition-colors shrink-0">
                  <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                </div>
                <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">Submit to Opportunity</span>
                    <span className="text-xs text-slate-500">Apply for placements</span>
                </div>
             </button>
             <button className="bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex items-center gap-4 transition-all group text-left shadow-sm">
                <div className="bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 p-3 rounded-lg transition-colors shrink-0">
                  <User className="w-5 h-5 text-purple-500 dark:text-purple-400" />
                </div>
                <div>
                    <span className="font-semibold text-slate-900 dark:text-white block">Generate Press Kit</span>
                    <span className="text-xs text-slate-500">AI-powered bio & content</span>
                </div>
             </button>
          </div>
        </div>

        {/* Right Col: Featured Opps */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Featured Opportunities</h3>
             <div className="flex items-center gap-2">
                 <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">All Genres</span>
                 <button 
                    onClick={() => setCurrentView('opportunities')}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500"
                >
                    View All
                </button>
             </div>
          </div>
          
          <div className="space-y-4 overflow-y-auto flex-1 max-h-[600px] pr-2">
            {opportunities.slice(0, 3).map(op => (
              <div key={op.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs text-slate-500 font-mono">{op.usage_type.toUpperCase()}</span>
                  <span className="text-green-600 dark:text-green-400 text-xs font-bold">{op.match_score}% Match</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 group-hover:text-cyan-600 dark:group-hover:text-cyan-400">{op.brief_title}</h4>
                <p className="text-xs text-slate-500 mb-3 line-clamp-2">{op.description}</p>
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">${op.payout_min} - ${op.payout_max}</span>
                    <button className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white dark:hover:text-slate-950 transition-all">
                        <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOpportunities = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sync Opportunities</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">AI-curated briefs matched to your catalog.</p>
        </div>
        <button 
          onClick={scanForBriefs}
          disabled={isScanning}
          className="bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isScanning ? (
            <>
               <Activity className="w-4 h-4 animate-spin" />
               Scanning Agents...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Scan for New Briefs
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {opportunities.map(op => (
          <OpportunityCard key={op.id} opportunity={op} />
        ))}
      </div>
      
      {/* Placement Platforms List */}
      <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Integrated Placement Platforms</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {PLACEMENT_PLATFORMS.map((p, i) => (
                  <a key={i} href={p.url} target="_blank" rel="noreferrer" className="bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-colors group shadow-sm">
                      <Globe className="w-6 h-6 text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 mb-2" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{p.name}</span>
                  </a>
              ))}
          </div>
      </div>
    </div>
  );

  const renderAcademy = () => (
    <div className="space-y-6">
       <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Music Academy</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Master the industry with expert courses.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {MOCK_COURSES.map(course => (
             <div key={course.id} className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col group hover:border-cyan-500/50 transition-colors shadow-sm">
                <div className="h-40 bg-slate-100 dark:bg-slate-800 relative">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover opacity-90 dark:opacity-60 group-hover:opacity-100 dark:group-hover:opacity-80 transition-opacity" />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-slate-950/80 backdrop-blur text-slate-900 dark:text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                        {course.category}
                    </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
                     <div className="flex justify-between text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {course.duration}</span>
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {course.lessons} lessons</span>
                    </div>
                    <button className="w-full py-2 rounded-lg bg-cyan-500 text-white dark:text-slate-950 font-bold hover:bg-cyan-400">Enroll Now</button>
                </div>
             </div>
         ))}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-cyan-500/30 transition-colors duration-200">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
      />
      
      <div className={`flex-1 flex flex-col relative transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header 
            onMenuClick={() => setIsMobileMenuOpen(true)} 
            theme={theme} 
            toggleTheme={toggleTheme}
            user={user}
            onUpgrade={() => setShowPricingModal(true)}
        />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-20">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            {currentView === 'dashboard' && renderDashboard()}
            {currentView === 'catalog' && <MusicCatalog onPlayTrack={handlePlayTrack} />}
            {currentView === 'ar-dashboard' && <ARDashboard onPlayTrack={handlePlayTrack} />}
            {currentView === 'opportunities' && renderOpportunities()}
            {currentView === 'academy' && renderAcademy()}
            {currentView === 'revenue' && <RevenueRecovery />}
            {currentView === 'distribution' && <MusicDistribution />}
            {currentView === 'crm' && <MarketingCRM />}
            {currentView === 'voice' && (
                <div className="space-y-8">
                    <VoiceMarketplace />
                    <VoiceShield user={user} onUpgrade={() => setShowPricingModal(true)} />
                </div>
            )}
            {currentView === 'monitoring' && <AIMonitoring />}
            {currentView === 'profile' && (
                <ArtistProfile 
                    user={user} 
                    onNavigate={setCurrentView} 
                />
            )}
            {currentView === 'brand' && <BrandBuilder />}
            {currentView === 'analytics' && <AnalyticsView user={user} onUpgrade={() => setShowPricingModal(true)} />}
            {currentView === 'studio' && <MusicCreationStudio user={user} onUpgrade={() => setShowPricingModal(true)} />}
            {currentView === 'mastering' && <MasteringConsole />}
            {currentView === 'touring' && <GigFinder />}
            {currentView === 'live-agent' && <LiveAgent />}
            
            {['my-music'].includes(currentView) && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <Sliders className="w-12 h-12 mb-4 opacity-50" />
                <h2 className="text-xl font-bold text-slate-600 dark:text-slate-400">Section Under Construction</h2>
                <p className="text-sm mt-2">The {currentView.replace('-', ' ')} module is coming soon in v2.6</p>
              </div>
            )}
          </div>
        </main>

        {/* Global Audio Player */}
        {playerQueue.length > 0 && (
            <MusicPlayer 
                queue={playerQueue}
                initialIndex={currentTrackIndex}
                isPlaying={isPlaying}
                onPlayPause={setIsPlaying}
                onNext={() => setCurrentTrackIndex((i) => (i + 1) % playerQueue.length)}
                onPrev={() => setCurrentTrackIndex((i) => (i - 1 + playerQueue.length) % playerQueue.length)}
                onClose={() => {
                    setPlayerQueue([]);
                    setIsPlaying(false);
                }}
            />
        )}

        {/* Modals */}
        <LegalOnboarding 
            isOpen={showLegalModal && !hasSignedLegal && user?.uid.startsWith('demo') === false} 
            onSign={handleLegalSign} 
        />
        
        <PricingModal 
            isOpen={showPricingModal} 
            onClose={() => setShowPricingModal(false)}
            user={user}
            onUpgrade={(plan) => {
               // Update handled via real-time subscription
               console.log("Upgrading to", plan);
            }}
        />

        {/* AI Chatbot Overlay */}
        <ChatBot 
            currentView={currentView}
            stats={MOCK_STATS}
            opportunities={opportunities}
        />
      </div>
    </div>
  );
}

export default App;