
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { 
  MOCK_OPPORTUNITIES, VIEWS, FEATURED_ARTISTS
} from './constants';
import { parseRawBrief } from './services/geminiService';
import { authService } from './services/authService';
import { dataService } from './services/dataService';
import { webhookService } from './services/webhookService';
import { Opportunity, User as UserType, Stats } from './types';
import { PlayerProvider, usePlayer } from './contexts/PlayerContext';
import { WalletProvider } from './contexts/WalletContext';

// New Components
// Fix: Added missing imports for DashboardView, OpportunitiesView, and AcademyView
import { DashboardView } from './components/DashboardView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { AcademyView } from './components/AcademyView';
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
import { OnboardingFlow } from './components/OnboardingFlow'; 
import { HelpModal } from './components/HelpModal';
import { CommunityView } from './components/CommunityView';
import { AdminDashboard } from './components/AdminDashboard';
import { SmartWalletDashboard } from './components/SmartWalletDashboard'; 

const AppContent = () => {
  // Auth State
  const [user, setUser] = useState<UserType | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // App State
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [isScanning, setIsScanning] = useState(false);
  
  const [realStats, setRealStats] = useState<Stats>({
      totalEarnings: 0,
      totalStreams: 0,
      activeOpportunities: 0,
      brandScore: '-',
      earningsGrowth: 0,
      streamsGrowth: 0,
      opportunitiesNew: false,
      artistLevel: "New Artist",
      xp: 0,
      nextLevelXp: 1000
  });
  
  const [selectedArtistId, setSelectedArtistId] = useState<number | undefined>(undefined);
  const [viewingProfile, setViewingProfile] = useState<UserType | null>(null);

  // Onboarding & Legal
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { queue } = usePlayer();

  useEffect(() => {
    let userUnsubscribe: () => void = () => {};

    const authUnsubscribe = authService.observeAuth((observedUser) => {
        if (observedUser) {
            setUser(observedUser); 
            
            userUnsubscribe = dataService.subscribeToUserProfile(observedUser.uid, (updatedUser) => {
                setUser(updatedUser);
                dataService.getRealStats(updatedUser.uid).then(stats => setRealStats(stats));
                
                const isDemoMaster = updatedUser.uid === 'demo_master_account';
                const isLocallyDismissed = localStorage.getItem('sf_onboarding_skip') === 'true';
                if (!isDemoMaster && !updatedUser.onboardingCompleted && !onboardingDismissed && !isLocallyDismissed) {
                    setShowOnboarding(true);
                }
            });
            
            setShowAuthModal(false); 
        } else {
            setUser(null);
            if (userUnsubscribe) userUnsubscribe();
        }
        setLoadingAuth(false);
    });

    const safetyTimeout = setTimeout(() => {
        setLoadingAuth(current => current ? false : current);
    }, 2500);

    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      document.documentElement.classList.add('dark');
    }

    return () => {
        authUnsubscribe();
        if (userUnsubscribe) userUnsubscribe();
        clearTimeout(safetyTimeout);
    };
  }, [onboardingDismissed]); 

  // Legal Modal Controller - Trigger only when user object is stable and missing signature
  useEffect(() => {
      if (user && !user.hasSignedLegal && !user.uid.startsWith('guest') && user.uid !== 'demo_master_account' && !showLegalModal) {
          setShowLegalModal(true);
      }
  }, [user, user?.hasSignedLegal]);

  const handleLogout = async () => {
      await authService.logout();
      setCurrentView(VIEWS.DASHBOARD);
      setOnboardingDismissed(false);
      localStorage.removeItem('sf_onboarding_skip'); 
  };

  const handleLegalSign = async (signature: string) => {
      if (!user) return;
      
      // Close modal immediately for a snappy feel
      setShowLegalModal(false);

      const now = new Date().toISOString();
      const optimisticUser = { ...user, hasSignedLegal: true, legalSignedDate: now };
      setUser(optimisticUser);

      try {
          await Promise.all([
              dataService.saveLegalRecord({
                  id: `leg_${Date.now()}`,
                  userId: user.uid,
                  userEmail: user.email,
                  userName: user.displayName,
                  documentType: 'Voice IP & NDA',
                  documentVersion: 'v1.0',
                  signature: signature,
                  timestamp: now,
                  ipAddress: '127.0.0.1', 
                  status: 'signed'
              }),
              authService.updateUserProfile({
                  hasSignedLegal: true,
                  legalSignedDate: now
              })
          ]);
      } catch (e) {
          console.error("Legal background sync error:", e);
      }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleOnboardingComplete = async (updatedData: Partial<UserType>, favorites: string[]) => {
      if (!user) return;
      setOnboardingDismissed(true);
      setShowOnboarding(false);
      setUser(prev => prev ? { ...prev, ...updatedData, onboardingCompleted: true } : null);

      try {
          await authService.updateUserProfile({ ...updatedData, onboardingCompleted: true });
      } catch (e) {
          console.error("Onboarding Save Error:", e);
      } finally {
          localStorage.setItem('sf_favorites', JSON.stringify(favorites));
      }
  };

  const handleOnboardingDismiss = () => {
      setOnboardingDismissed(true);
      setShowOnboarding(false);
      localStorage.setItem('sf_onboarding_skip', 'true');
  };

  const handleRestartOnboarding = () => {
      localStorage.removeItem('sf_onboarding_skip');
      setShowHelpModal(false);
      setOnboardingDismissed(false);
      setShowOnboarding(true);
  };

  const handleNavigate = (view: string) => {
      setCurrentView(view);
      if (view !== VIEWS.PROFILE) setViewingProfile(null);
  };

  const scanForBriefs = async () => {
    if (!user) return;
    setIsScanning(true);
    try {
        const rawBriefFound = "NEW BRIEF: Luxury Car Ad. Style: Synthwave/Electronic Pop. Payout: $5000.";
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
                match_score: parsed.match_score || 85,
                mood_tags: parsed.mood_tags || []
            };
            
            setOpportunities(prev => [newOp, ...prev]);

            // --- NOTIFICATION LOGIC ---
            // Check if user has genre preferences that match
            const userGenres = user.genrePreferences || [];
            const briefMoods = newOp.mood_tags.map(t => t.toLowerCase());
            
            const hasGenreMatch = userGenres.some(g => briefMoods.includes(g.toLowerCase()));
            const isHighPayer = newOp.payout_max > 2000;

            if ((hasGenreMatch || isHighPayer) && user.notificationSettings?.emailSyncMatches) {
                await webhookService.sendSyncMatchNotification(user, newOp);
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsScanning(false);
    }
  };

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

  if (showOnboarding) {
      return <OnboardingFlow user={user} onComplete={handleOnboardingComplete} onDismiss={handleOnboardingDismiss} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-cyan-500/30 transition-colors duration-200">
      <Sidebar 
        currentView={currentView} 
        setCurrentView={handleNavigate} 
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onLogout={handleLogout}
        onOpenHelp={() => setShowHelpModal(true)}
      />
      
      <div className={`flex-1 flex flex-col relative transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header 
            onMenuClick={() => setIsMobileMenuOpen(true)} 
            theme={theme} 
            toggleTheme={toggleTheme}
            user={user}
            onUpgrade={() => setShowPricingModal(true)}
            onLogout={handleLogout}
            onNavigate={handleNavigate}
            onUpload={() => setShowUploadModal(true)}
            onArtistSelect={(id) => setSelectedArtistId(id)}
        />
        
        <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-20">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500 h-full">
            <ErrorBoundary>
              {currentView === VIEWS.DASHBOARD && (
                <DashboardView 
                  user={user} 
                  stats={realStats} 
                  opportunities={opportunities} 
                  onNavigate={handleNavigate} 
                  onUpgrade={() => setShowPricingModal(true)} 
                  onUpload={() => setShowUploadModal(true)}
                />
              )}
              {currentView === VIEWS.ADMIN && user.isAdmin && <AdminDashboard />}
              {currentView === VIEWS.SMART_WALLET && <SmartWalletDashboard />}
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
              {currentView === VIEWS.COMMUNITY && <CommunityView />}
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
              {currentView === VIEWS.MONITORING && user.isAdmin && <AIMonitoring />}
              {currentView === VIEWS.PROFILE && (
                  <ArtistProfile 
                      user={viewingProfile || user} 
                      onNavigate={handleNavigate}
                      isPublic={!!viewingProfile}
                      onBack={() => {
                          setViewingProfile(null);
                          setCurrentView(VIEWS.DASHBOARD);
                      }}
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

        {queue.length > 0 && <MusicPlayer />}

        <LegalOnboarding 
            isOpen={showLegalModal} 
            onSign={handleLegalSign} 
        />
        
        <PricingModal 
            isOpen={showPricingModal} 
            onClose={() => setShowPricingModal(false)}
            user={user}
            onUpgrade={(plan) => console.log("Upgraded", plan)}
        />

        <UploadModal 
            isOpen={showUploadModal}
            onClose={() => setShowUploadModal(false)}
            user={user}
        />

        <HelpModal 
            isOpen={showHelpModal}
            onClose={() => setShowHelpModal(false)}
            onRestartOnboarding={handleRestartOnboarding}
        />

        <ChatBot 
            currentView={currentView}
            stats={realStats}
            opportunities={opportunities}
        />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <WalletProvider>
        <PlayerProvider>
            <AppContent />
        </PlayerProvider>
    </WalletProvider>
  );
}
