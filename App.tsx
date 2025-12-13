
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { 
  MOCK_OPPORTUNITIES, MOCK_STATS, VIEWS
} from './constants';
import { parseRawBrief } from './services/geminiService';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import { Opportunity, User as UserType } from './types';
import { PlayerProvider, usePlayer } from './contexts/PlayerContext';

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
import { UserProfile } from './components/UserProfile';
import { UploadModal } from './components/UploadModal';
import { DAODashboard } from './components/DAODashboard';
import { MyMusic } from './components/MyMusic';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AffiliateDashboard } from './components/AffiliateDashboard';
import { WaitlistModal } from './components/WaitlistModal';
import { BattlesArena } from './components/BattlesArena';

// Extracted Views
import { DashboardView } from './components/DashboardView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { AcademyView } from './components/AcademyView';

// Internal component to handle playing from header
const AppContent = () => {
  // Auth State
  const [user, setUser] = useState<UserType | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // App State
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [isScanning, setIsScanning] = useState(false);
  
  // Analytics State
  const [selectedArtistId, setSelectedArtistId] = useState<number | undefined>(undefined);

  // Onboarding & Legal
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [hasSignedLegal, setHasSignedLegal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Use Global Player State
  const { queue } = usePlayer();

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
      setCurrentView(VIEWS.DASHBOARD);
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
          <WaitlistModal />
          <LandingPage onOpenAuth={() => setShowAuthModal(true)} />
          <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
        </>
      );
  }

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
            onLogout={handleLogout}
            onNavigate={setCurrentView}
            onUpload={() => setShowUploadModal(true)}
            onArtistSelect={(id) => setSelectedArtistId(id)}
        />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-20">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
            <ErrorBoundary>
              {currentView === VIEWS.DASHBOARD && (
                <DashboardView 
                  user={user} 
                  stats={MOCK_STATS} 
                  opportunities={opportunities} 
                  onNavigate={setCurrentView} 
                  onUpgrade={() => setShowPricingModal(true)} 
                  onUpload={() => setShowUploadModal(true)}
                />
              )}
              {currentView === VIEWS.CATALOG && <MusicCatalog />}
              {currentView === VIEWS.BATTLES && <BattlesArena />}
              {currentView === VIEWS.AR_DASHBOARD && <ARDashboard />}
              {currentView === VIEWS.OPPORTUNITIES && (
                <OpportunitiesView 
                  opportunities={opportunities} 
                  isScanning={isScanning} 
                  onScan={scanForBriefs} 
                />
              )}
              {currentView === VIEWS.ACADEMY && <AcademyView />}
              {currentView === VIEWS.REVENUE && <RevenueRecovery />}
              {currentView === VIEWS.DISTRIBUTION && <MusicDistribution />}
              {currentView === VIEWS.CRM && <MarketingCRM />}
              {currentView === VIEWS.VOICE && (
                  <div className="space-y-8">
                      <VoiceMarketplace />
                      <VoiceShield user={user} onUpgrade={() => setShowPricingModal(true)} />
                  </div>
              )}
              {currentView === VIEWS.DAO && <DAODashboard user={user} />}
              {currentView === VIEWS.AFFILIATES && <AffiliateDashboard user={user} />}
              {currentView === VIEWS.MONITORING && <AIMonitoring />}
              {currentView === VIEWS.PROFILE && (
                  <ArtistProfile 
                      user={user} 
                      onNavigate={setCurrentView} 
                  />
              )}
              {currentView === VIEWS.BRAND && <BrandBuilder />}
              {currentView === VIEWS.ANALYTICS && <AnalyticsView user={user} onUpgrade={() => setShowPricingModal(true)} artistId={selectedArtistId} />}
              {currentView === VIEWS.STUDIO && <MusicCreationStudio user={user} onUpgrade={() => setShowPricingModal(true)} />}
              {currentView === VIEWS.MASTERING && <MasteringConsole />}
              {currentView === VIEWS.TOURING && <GigFinder />}
              {currentView === VIEWS.LIVE_AGENT && <LiveAgent />}
              {currentView === VIEWS.SETTINGS && <UserProfile user={user} />}
              {currentView === VIEWS.MY_MUSIC && <MyMusic user={user} setShowUploadModal={setShowUploadModal} />}
            </ErrorBoundary>
          </div>
        </main>

        {/* Global Audio Player using Context */}
        {queue.length > 0 && (
            <MusicPlayer />
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
               console.log("Upgrading to", plan);
            }}
        />

        <UploadModal 
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            user={user}
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
};

export default function App() {
  return (
    <PlayerProvider>
      <AppContent />
    </PlayerProvider>
  );
}