import React, { useState, useEffect, useRef } from 'react';
import { 
    Music, Briefcase, Headphones, Wand2, ArrowRight, CheckCircle2, 
    Zap, Globe, Shield, Mic2, Star, LayoutDashboard, Loader2, X, MessageSquare, Users,
    Radio, Camera, Instagram, Facebook, Twitter, Link as LinkIcon, Save, Sparkles, Server,
    FileText, PenTool, ImagePlus, Check, Building2, Users2, Youtube, Video, Globe2, Linkedin, Chrome,
    ChevronRight, Search, Heart, Signal, Activity, RefreshCw
} from 'lucide-react';
import { User } from '../types';
import { VIEWS } from '../constants';
import { LegalOnboarding } from './LegalOnboarding';
import { RapidApiAgent } from '../services/rapidApiService';

interface OnboardingFlowProps {
    user: User;
    onComplete: (updatedData: Partial<User>, favorites: string[]) => void;
    onDismiss: () => void;
}

type Step = 'welcome' | 'role' | 'search' | 'legal' | 'identity' | 'visual-assets' | 'socials' | 'core-activation' | 'staff' | 'processing';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete, onDismiss }) => {
    const [step, setStep] = useState<Step>('welcome');
    const [role, setRole] = useState<User['role']>('artist');
    const [selectedStaff, setSelectedStaff] = useState<string[]>(['mgr', 'mkt', 'dst']);
    
    // Search Artist State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedArtist, setSelectedArtist] = useState<any | null>(null);

    // Identity State
    const [bio, setBio] = useState(user.bio || '');
    const [location, setLocation] = useState(user.location || '');
    const [identityImages, setIdentityImages] = useState<string[]>([]);
    const assetInputRef = useRef<HTMLInputElement>(null);

    // Neural Sync State (YouTube/Web)
    const [ytSearchQuery, setYtSearchQuery] = useState('');
    const [ytResults, setYtResults] = useState<any[]>([]);
    const [isSearchingYt, setIsSearchingYt] = useState(false);
    const [selectedYtChannel, setSelectedYtChannel] = useState<any | null>(null);

    // Social State
    const [socials, setSocials] = useState({ 
        instagram: '', 
        twitter: '', 
        spotify: '', 
        youtube: '', 
        tiktok: '', 
        linkedin: '' 
    });

    const [processingStep, setProcessingStep] = useState(0);
    const processingMessages = [
        "Initializing Sound Merge Core...",
        "Establishing Institutional Rights Rails...",
        "Indexing Global Social Footprint...",
        "Neural Crawling: Analyzing YouTube & Web References...",
        "Training Custom Marketing Persona...",
        "Deploying Dedicated Identity Ledger...",
        "Syncing Voice DNA Protection...",
        "Assigning Professional AI Staff...",
        "System Ready. Welcome to your digital office."
    ];

    useEffect(() => {
        if (step === 'processing') {
            const interval = setInterval(() => {
                setProcessingStep(prev => {
                    if (prev >= processingMessages.length - 1) {
                        clearInterval(interval);
                        finishOnboarding();
                        return prev;
                    }
                    return prev + 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const results = await RapidApiAgent.searchArtistProfiles(searchQuery);
            setSearchResults(results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleYtSearch = async () => {
        if (!ytSearchQuery.trim()) return;
        setIsSearchingYt(true);
        try {
            const results = await RapidApiAgent.searchYouTubeChannels(ytSearchQuery);
            setYtResults(results);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearchingYt(false);
        }
    };

    const handleSelectArtist = (artist: any) => {
        setSelectedArtist(artist);
        setSocials({
            ...socials,
            spotify: artist.uri || ''
        });
        setBio(`Professional profile verified via Sound Merge Sync. Identity confirmed for ${artist.name}. Current Reach: ${artist.followers.toLocaleString()} monthly listeners.`);
        setStep('legal');
    };

    const finishOnboarding = () => {
        onComplete(
            { 
                onboardingCompleted: true,
                tourCompleted: false,
                role,
                bio,
                location,
                displayName: selectedArtist?.name || user.displayName,
                photoURL: selectedArtist?.image || identityImages[0] || user.photoURL,
                identityAssets: identityImages,
                socialLinks: socials,
                referenceVideoLinks: selectedYtChannel ? [selectedYtChannel.id] : [],
                hasSignedLegal: true,
                legalSignedDate: new Date().toISOString()
            }, 
            role === 'label_exec' 
                ? [VIEWS.DASHBOARD, VIEWS.AR_DASHBOARD, VIEWS.ANALYTICS, VIEWS.DISTRIBUTION]
                : [VIEWS.DASHBOARD, VIEWS.STAFF, VIEWS.STUDIO, VIEWS.BRAND]
        );
    };

    const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []) as File[];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdentityImages(prev => [...prev, reader.result as string].slice(0, 12));
            };
            reader.readAsDataURL(file);
        });
    };

    const renderWelcome = () => (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative py-20">
            <div className="w-24 h-24 bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-cyan-500/30">
                <Music className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tighter italic leading-[0.9]">The Future <br/>is Managed.</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xl max-w-lg mx-auto mb-10 leading-relaxed font-medium">
                Initialize your professional operating system. We bridge creative genius with institutional leverage.
            </p>
            <div className="flex flex-col items-center gap-4">
                <button 
                    onClick={() => setStep('role')}
                    className="bg-slate-950 dark:bg-white text-white dark:text-slate-900 px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-2xl"
                >
                    Initialize Profile <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderRole = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto py-10">
            <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-3 text-center uppercase tracking-tighter italic">Operational Scale</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-12 text-lg">Select the tier of institutional infrastructure you require.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { id: 'artist', label: 'Indie Professional', icon: Mic2, desc: 'Single profile deployment for independent creators. Full access to AI Staff and Distribution.' },
                    { id: 'label_exec', label: 'Enterprise Label', icon: Building2, desc: 'Multi-artist management for agencies and labels. Specialized A&R and bulk metadata tools.' },
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => { setRole(option.id as any); setStep('search'); }}
                        className="bg-white dark:bg-slate-900 hover:border-cyan-500 border-2 border-slate-200 dark:border-slate-800 p-10 rounded-[3rem] text-left group transition-all shadow-sm hover:shadow-2xl"
                    >
                        <div className="bg-slate-100 dark:bg-slate-950 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:bg-cyan-500/10 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            <option.icon className="w-10 h-10 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                        </div>
                        <h3 className="font-display font-black text-2xl text-slate-900 dark:text-white mb-3 uppercase tracking-tight italic">{option.label}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{option.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderSearch = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto py-10">
            <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-3 text-center uppercase tracking-tighter italic">Sync Profile</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-12 text-lg font-medium">Find your artist profile to synchronize performance and audience signals.</p>
            
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Search your stage name..."
                        className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-[2rem] py-6 pl-16 pr-6 text-xl text-slate-900 dark:text-white outline-none focus:border-cyan-500 shadow-xl transition-all"
                    />
                    <button 
                        onClick={handleSearch}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest shadow-lg"
                    >
                        Search Artist
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {isSearching ? (
                        <div className="py-20 flex flex-col items-center gap-4 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
                            <span className="font-black uppercase tracking-widest text-[10px]">Scanning Industry Signals...</span>
                        </div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map((artist, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => handleSelectArtist(artist)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2rem] flex items-center justify-between hover:border-cyan-500 cursor-pointer group transition-all"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md">
                                        <img src={artist.image} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{artist.name}</h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest animate-pulse">
                                                <Activity className="w-2.5 h-2.5" /> Live Signal
                                            </div>
                                            <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{artist.followers.toLocaleString()} listeners</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-cyan-600 group-hover:text-white p-3 rounded-2xl transition-all">
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </div>
                        ))
                    ) : searchQuery.length > 2 && !isSearching && (
                        <div className="text-center py-10">
                            <button onClick={() => setStep('legal')} className="text-cyan-500 font-black uppercase tracking-widest hover:underline">Manual Identity Setup</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderIdentityMetadata = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto space-y-10 py-10">
            <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter italic">Professional Identity</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Feed the neural engine your professional history and channel references.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* BIO & LOCATION */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            Artist Overview / Story
                        </label>
                        <textarea 
                            value={bio} onChange={e => setBio(e.target.value)}
                            placeholder="Tell your story. This trains your AI manager on your tone and goals..."
                            className="w-full h-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm text-slate-900 dark:text-white focus:border-cyan-500 outline-none resize-none transition-all font-medium"
                        />
                        <div className="mt-8">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Geographic Hub</label>
                            <div className="relative">
                                <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    value={location} onChange={e => setLocation(e.target.value)}
                                    placeholder="e.g. London, UK"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:border-cyan-500 outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI LEARNING REFERENCES */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-inner text-slate-900 dark:text-white h-full">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Neural Learning Sync</h3>
                        </div>

                        {/* YouTube Channel Search */}
                        <div className="space-y-3">
                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Official YouTube Channel</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" />
                                <input 
                                    value={ytSearchQuery} onChange={e => setYtSearchQuery(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleYtSearch()}
                                    placeholder="Search channel name..."
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-slate-300 focus:border-red-500 outline-none"
                                />
                            </div>
                            
                            <div className="space-y-2 mt-2">
                                {isSearchingYt ? (
                                    <div className="py-4 text-center"><Loader2 className="w-4 h-4 animate-spin mx-auto text-red-500" /></div>
                                ) : ytResults.map((yt, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => setSelectedYtChannel(yt)}
                                        className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${selectedYtChannel?.id === yt.id ? 'bg-red-500/10 border-red-500 shadow-lg' : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <img src={yt.image} className="w-8 h-8 rounded-full object-cover" />
                                            <div className="text-left">
                                                <div className="text-[10px] font-bold text-white">{yt.title}</div>
                                                <div className="text-[8px] font-black text-slate-500 uppercase">{yt.subscribers.toLocaleString()} subs</div>
                                            </div>
                                        </div>
                                        {selectedYtChannel?.id === yt.id && <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800">
                             <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-3">Institutional Web Node</label>
                             <div className="relative">
                                <Chrome className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-500" />
                                <input 
                                    value={socials.website} onChange={e => setSocials({...socials, website: e.target.value})}
                                    placeholder="e.g. official-site.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-slate-300 focus:border-cyan-500 outline-none"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <button onClick={() => setStep('visual-assets')} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-cyan-600/20 transition-all flex items-center justify-center gap-3">
                Sync Professional Assets <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );

    const renderVisualAssets = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto py-10 flex flex-col h-full min-h-[600px]">
            <div className="shrink-0 text-center mb-10">
                <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter italic">
                    Visual Identity Corpus
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium italic max-w-2xl mx-auto leading-relaxed">
                    Upload 3-12 clear photos. These define your visual hash, allowing the AI to generate hyper-realistic professional assets for your brand.
                </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12 flex-1">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                        key={i}
                        onClick={() => assetInputRef.current?.click()}
                        className={`aspect-square rounded-[1.5rem] border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden relative group ${identityImages[i] ? 'border-cyan-500 bg-cyan-500/5 shadow-inner' : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-500'}`}
                    >
                        {identityImages[i] ? (
                            <>
                                <img src={identityImages[i]} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1 shadow-lg border-2 border-white dark:border-slate-900 animate-in zoom-in"><Check className="w-2 h-2 text-white" /></div>
                            </>
                        ) : (
                            <>
                                <ImagePlus className={`w-6 h-6 ${i < 3 ? 'text-cyan-500' : 'text-slate-300'} group-hover:text-cyan-500 transition-colors`} />
                                <span className="text-[7px] font-black uppercase text-slate-400 mt-2 tracking-widest">{i < 3 ? 'Required' : `Ref ${i+1}`}</span>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <input type="file" multiple ref={assetInputRef} className="hidden" accept="image/*" onChange={handleAssetUpload} />

            <div className="shrink-0 flex flex-col gap-4 mt-auto">
                <button 
                    onClick={() => setStep('socials')}
                    disabled={identityImages.length < 3}
                    className="w-full py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.01] transition-all disabled:opacity-30 shadow-2xl"
                >
                    Confirm Visual Identity
                </button>
                <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Min 3 High-Res Assets Required for Persona Validation</p>
            </div>
        </div>
    );

    const renderSocials = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto space-y-10 py-10">
            <div className="text-center">
                <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter italic">Connect Channels</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Link your global footprint for automated audience synchronization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500', placeholder: '@handle' },
                    { id: 'tiktok', label: 'TikTok', icon: Music, color: 'text-white', bg: 'bg-black', placeholder: '@handle' },
                    { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-slate-900 dark:text-white', placeholder: '@handle' },
                    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', placeholder: 'profile-url' },
                ].map(net => (
                    <div key={net.id} className="flex flex-col bg-white dark:bg-slate-900 p-5 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm group focus-within:border-cyan-500/50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 bg-slate-50 dark:bg-slate-950 rounded-xl ${net.color} ${net.bg || ''}`}><net.icon className="w-5 h-5" /></div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-0.5">{net.label}</label>
                                <input 
                                    placeholder={net.placeholder}
                                    value={(socials as any)[net.id]}
                                    onChange={e => setSocials({...socials, [net.id]: e.target.value})}
                                    className="bg-transparent w-full text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={async () => {
                                // Simulate searching and syncing
                                alert(`Syncing ${net.label} signal for institutional verification...`);
                            }}
                            className="w-full py-2 bg-slate-100 dark:bg-slate-950 hover:bg-cyan-500 dark:hover:bg-cyan-500 hover:text-slate-950 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-200 dark:border-slate-800"
                        >
                            Sync Account Node
                        </button>
                    </div>
                ))}
            </div>

            <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 flex items-center gap-4">
                <div className={`p-3 bg-slate-950 rounded-xl text-green-500`}><Music className="w-5 h-5" /></div>
                <div className="flex-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Spotify Sync Status</label>
                    <div className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                        {selectedArtist?.name || "No Profile Selected"}
                        <span className="text-[8px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-black">CONNECTED</span>
                    </div>
                </div>
                <button onClick={() => setStep('search')} className="p-2 text-slate-500 hover:text-white"><RefreshCw className="w-4 h-4"/></button>
            </div>

            <button onClick={() => setStep('core-activation')} className="w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl mt-4">
                Finalize Integration
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-start md:justify-center p-6 overflow-y-auto custom-scrollbar transition-colors duration-500">
            <div className="w-full max-w-6xl">
                {step === 'welcome' && renderWelcome()}
                {step === 'role' && renderRole()}
                {step === 'search' && renderSearch()}
                
                {step === 'legal' && (
                    <div className="animate-in fade-in duration-500">
                        <LegalOnboarding 
                            isOpen={true} 
                            onSign={async (sig) => { setStep('identity'); }} 
                        />
                    </div>
                )}

                {step === 'identity' && renderIdentityMetadata()}

                {step === 'visual-assets' && renderVisualAssets()}

                {step === 'socials' && renderSocials()}

                {step === 'core-activation' && (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto py-20">
                        <div className="w-32 h-32 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                            <Server className="w-16 h-16 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">Initialize Profile</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xl mb-12 font-medium">Finalizing the deployment of your professional identity on the Sound Merge network.</p>
                        <button 
                            onClick={() => setStep('staff')}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-transform flex items-center gap-4 mx-auto shadow-xl shadow-cyan-600/20"
                        >
                            Authorize System Sync <CheckCircle2 className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 'staff' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-5xl mx-auto space-y-12 py-10">
                        <div className="text-center">
                            <h2 className="text-5xl md:text-7xl font-display font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter italic leading-none">CONTRACT SUPPORT</h2>
                            <p className="text-slate-500 text-xl font-medium mt-4">Delegate the business of music to your personal AI staff members.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { id: 'mgr', label: 'MANAGER', icon: Briefcase, color: 'text-indigo-500', desc: 'Strategy & Ops' },
                                { id: 'mkt', label: 'MARKETING', icon: Zap, color: 'text-cyan-500', desc: 'Hype & Growth' },
                                { id: 'dst', label: 'DISTRIBUTION', icon: Radio, color: 'text-green-500', desc: 'Metadata & Stores' },
                                { id: 'lgl', label: 'LEGAL', icon: Shield, color: 'text-red-500', desc: 'Rights & Voice IP' },
                            ].map((staff) => (
                                <button
                                    key={staff.id}
                                    onClick={() => setSelectedStaff(prev => selectedStaff.includes(staff.id) ? prev.filter(s => s !== staff.id) : [...prev, staff.id])}
                                    className={`aspect-square rounded-[3.5rem] flex flex-col items-center justify-center p-6 border-2 transition-all duration-300 relative group overflow-hidden ${selectedStaff.includes(staff.id) ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_40px_rgba(6,182,212,0.2)]' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                                >
                                    <div className={`p-8 bg-slate-950 rounded-[2.5rem] mb-6 shadow-2xl border border-white/5 group-hover:scale-105 transition-transform ${selectedStaff.includes(staff.id) ? 'text-cyan-400' : 'text-slate-500'}`}>
                                        <staff.icon className="w-12 h-12" strokeWidth={1.5} />
                                    </div>
                                    <div className="text-center">
                                        <span className={`font-display font-black text-sm uppercase tracking-tight block ${selectedStaff.includes(staff.id) ? 'text-white' : 'text-slate-500'}`}>{staff.label}</span>
                                        <span className="text-[11px] text-slate-500 mt-1 block font-bold uppercase opacity-60 tracking-wider">{staff.desc}</span>
                                    </div>
                                    
                                    {selectedStaff.includes(staff.id) && (
                                        <div className="absolute top-6 right-6">
                                            <CheckCircle2 className="w-6 h-6 text-cyan-500 fill-cyan-500/20" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                        <button 
                            onClick={() => setStep('processing')} 
                            className="w-full py-6 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-[2.5rem] font-display font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_50px_rgba(6,182,212,0.3)] transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
                        >
                            Complete Profile & Enter Studio
                        </button>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-700 min-h-[400px] py-20">
                        <div className="relative mb-12">
                            <div className="w-40 h-40 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-cyan-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-12 h-12 text-cyan-600 dark:text-cyan-400 animate-pulse" /></div>
                        </div>
                        <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{processingMessages[processingStep]}</h2>
                        <p className="text-slate-500 font-medium mt-4 text-lg">Synchronizing profile with global industry infrastructure...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
