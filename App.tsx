
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
import { Loader2, X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

import { DashboardView } from './components/DashboardView';
import { OpportunitiesView } from './components/OpportunitiesView';
import { AcademyView } from './components/AcademyView';
import { RevenueRecovery } from './components/RevenueRecovery';
import { Funding } from './components/Funding';
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
import { StaffMessagingHub } from './components/StaffMessagingHub';
import { GuidedTour } from './components/GuidedTour';

interface Notification {
    id: string;
    title: string;
    message: string;
    image?: string;
    type: 'success' | 'info' | 'error';
}

const AppContent = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentView, setCurrentView] = useState(VIEWS.DASHBOARD);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>(MOCK_OPPORTUNITIES);
  const [isScanning, setIsScanning] = useState(false);
  const [realStats, setRealStats] = useState<Stats>({
      totalEarnings: 0, totalStreams: 0, activeOpportunities: 0, brandScore: '-',
      earningsGrowth: 0, streamsGrowth: 0, opportunitiesNew: false,
      artistLevel: "New Artist", xp: 0, nextLevelXp: 1000
  });
  const [selectedArtistId, setSelectedArtistId] = useState<number | undefined>(undefined);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showGuidedTour, setShowGuidedTour] = useState(false);
  const [onboardingDismissed, setOnboardingDismissed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('sf_theme') as 'dark' | 'light') || 'dark';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const { queue } = usePlayer();

  // Sync theme with document class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('sf_theme', theme);
  }, [theme]);

  useEffect(() => {
      const handleNotify = (e: any) => {
          const { title, message, image, type } = e.detail;
          const id = Date.now().toString();
          setNotifications(prev => [...prev, { id, title, message, image, type }]);
          setTimeout(() => {
              setNotifications(prev => prev.filter(n => n.id !== id));
          }, 6000);
      };
      window.addEventListener('sf-notification', handleNotify);
      return () => window.removeEventListener('sf-notification', handleNotify);
  }, []);

  useEffect(() => {
    let userUnsubscribe: () => void = () => {};
    const authUnsubscribe = authService.observeAuth((observedUser) => {
        if (observedUser) {
            setUser(observedUser); 
            userUnsubscribe = dataService.subscribeToUserProfile(observedUser.uid, (updatedUser) => {
                setUser(updatedUser);
                dataService.getRealStats(updatedUser.uid).then(stats => setRealStats(stats));
                const isLocallyDismissed = localStorage.getItem('sf_onboarding_skip') === 'true';
                if (updatedUser.uid !== 'demo_master_account' && !updatedUser.onboardingCompleted && !onboardingDismissed && !isLocallyDismissed) {
                    setShowOnboarding(true);
                } else if (updatedUser.onboardingCompleted && !updatedUser.tourCompleted) {
                    setShowGuidedTour(true);
                }
            });
            setShowAuthModal(false); 
        } else {
            setUser(null);
            if (userUnsubscribe) userUnsubscribe();
        }
        setLoadingAuth(false);
    });
    return () => { authUnsubscribe(); if (userUnsubscribe) userUnsubscribe(); };
  }, [onboardingDismissed]); 

  const handleLogout = async () => {
      await authService.logout();
      setCurrentView(VIEWS.DASHBOARD);
      setOnboardingDismissed(false);
      localStorage.removeItem('sf_onboarding_skip'); 
  };

  const handleOnboardingComplete = async (updatedData: Partial<UserType>, favorites: string[]) => {
      if (!user) return;
      setOnboardingDismissed(true);
      setShowOnboarding(false);
      setUser(prev => prev ? { ...prev, ...updatedData, onboardingCompleted: true } : null);
      try {
          await authService.updateUserProfile({ ...updatedData, onboardingCompleted: true });
          // Force guide after save
          setShowGuidedTour(true);
      } catch (e) { console.error(e); }
      localStorage.setItem('sf_favorites', JSON.stringify(favorites));
  };

  const handleNavigate = (view: string) => {
      setCurrentView(view);
      setIsMobileMenuOpen(false);
  };

  const handleCompleteTour = async () => {
      setShowGuidedTour(false);
      if (user) {
          await authService.updateUserProfile({ tourCompleted: true });
      }
  };

  if (loadingAuth) return <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 text-cyan-500 animate-spin" /></div>;
  if (!user) return (
    <>
      <WaitlistModal />
      <LandingPage onOpenAuth={() => setShowAuthModal(true)} />
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
  if (showOnboarding) return <OnboardingFlow user={user} onComplete={handleOnboardingComplete} onDismiss={() => setShowOnboarding(false)} />;

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans selection:bg-cyan-500/30 transition-colors duration-200">
      
      {showGuidedTour && <GuidedTour onComplete={handleCompleteTour} onNavigate={handleNavigate} />}

      <div className="fixed top-20 left-0 right-0 z-[100] px-4 pointer-events-none flex flex-col items-center gap-3">
          {notifications.map(n => (
              <div key={n.id} className="w-full max-w-sm bg-white dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-4 pointer-events-auto animate-in slide-in-from-top-4 duration-500">
                  {n.image ? (
                      <img src={n.image} className="w-12 h-12 rounded-lg object-cover shadow-lg" alt="track" />
                  ) : (
                      <div className={`p-3 rounded-lg ${n.type === 'success' ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 'bg-blue-500/20 text-blue-600 dark:text-blue-400'}`}>
                          {n.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                      </div>
                  )}
                  <div className="flex-1 min-w-0">
                      <h4 className="font-black text-xs uppercase tracking-widest text-slate-900 dark:text-white">{n.title}</h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5">{n.message}</p>
                  </div>
                  <button onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <X className="w-4 h-4" />
                  </button>
              </div>
          ))}
      </div>

      <Sidebar 
        currentView={currentView} setCurrentView={handleNavigate} isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen} isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} onLogout={handleLogout}
        onOpenHelp={() => setShowHelpModal(true)}
      />
      <div className={`flex-1 flex flex-col relative transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        <Header 
            onMenuClick={() => setIsMobileMenuOpen(true)} 
            theme={theme} 
            toggleTheme={() => setTheme(t => t==='dark'?'light':'dark')}
            user={user} onUpgrade={() => setShowPricingModal(true)} onLogout={handleLogout} onNavigate={handleNavigate}
            onUpload={() => setShowUploadModal(true)} onArtistSelect={setSelectedArtistId}
        />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto mb-20 lg:mb-0">
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500 h-full">
            <ErrorBoundary>
              {currentView === VIEWS.DASHBOARD && <DashboardView user={user} stats={realStats} opportunities={opportunities} onNavigate={handleNavigate} onUpgrade={() => setShowPricingModal(true)} onUpload={() => setShowUploadModal(true)} />}
              {currentView === VIEWS.STAFF && <StaffMessagingHub />}
              {currentView === VIEWS.SMART_WALLET && <SmartWalletDashboard />}
              {currentView === VIEWS.CATALOG && <MusicCatalog />}
              {currentView === VIEWS.BATTLES && <BattlesArena />}
              {currentView === VIEWS.AR_DASHBOARD && <ARDashboard />}
              {currentView === VIEWS.OPPORTUNITIES && <OpportunitiesView opportunities={opportunities} isScanning={isScanning} onScan={() => {}} />}
              {currentView === VIEWS.ACADEMY && <AcademyView />}
              {currentView === VIEWS.COMMUNITY && <CommunityView />}
              {currentView === VIEWS.DISTRIBUTION && <MusicDistribution />}
              {currentView === VIEWS.VOICE && <div className="space-y-8"><VoiceMarketplace /><VoiceShield user={user} onUpgrade={() => setShowPricingModal(true)} /></div>}
              {currentView === VIEWS.STUDIO && <MusicCreationStudio user={user} onUpgrade={() => setShowPricingModal(true)} />}
              {currentView === VIEWS.SETTINGS && <UserProfile user={user} />}
              {currentView === VIEWS.MY_MUSIC && <MyMusic user={user} setShowUploadModal={setShowUploadModal} />}
              {currentView === VIEWS.TOURING && <GigFinder />}
              {currentView === VIEWS.REVENUE && <RevenueRecovery />}
              {currentView === VIEWS.FUNDING && <Funding user={user} />}
              {currentView === VIEWS.BRAND && <BrandBuilder />}
              {currentView === VIEWS.MASTERING && <MasteringConsole />}
              {currentView === VIEWS.ANALYTICS && <AnalyticsView user={user} onUpgrade={() => setShowPricingModal(true)} artistId={selectedArtistId} />}
              {currentView === VIEWS.CRM && <MarketingCRM />}
              {currentView === VIEWS.DAO && <DAODashboard user={user} />}
              {currentView === VIEWS.AFFILIATES && <AffiliateDashboard user={user} />}
              {currentView === VIEWS.MONITORING && user.isAdmin && <AIMonitoring />}
              {currentView === VIEWS.LIVE_AGENT && <LiveAgent />}
              {currentView === VIEWS.ADMIN && user.isAdmin && <AdminDashboard />}
              {currentView === VIEWS.PROFILE && <ArtistProfile user={user} onBack={() => handleNavigate(VIEWS.DASHBOARD)} />}
            </ErrorBoundary>
          </div>
        </main>
        {queue.length > 0 && <MusicPlayer />}
        <PricingModal isOpen={showPricingModal} onClose={() => setShowPricingModal(false)} user={user} onUpgrade={() => {}} />
        <UploadModal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} user={user} />
        <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} onRestartOnboarding={() => setShowOnboarding(true)} />
        <ChatBot currentView={currentView} stats={realStats} opportunities={opportunities} />
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
