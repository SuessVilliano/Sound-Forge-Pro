
import React, { useState, useEffect, useRef } from 'react';
import { 
    Music, Briefcase, Headphones, Wand2, ArrowRight, CheckCircle2, 
    Zap, Globe, Shield, Mic2, Star, LayoutDashboard, Loader2, X, MessageSquare, Users,
    Radio, Camera, Instagram, Facebook, Twitter, Link as LinkIcon, Save, Sparkles, Server,
    FileText, PenTool, ImagePlus, Check, Building2, Users2, Youtube, Video, Globe2, Linkedin, Chrome,
    ChevronRight
} from 'lucide-react';
import { User } from '../types';
import { VIEWS } from '../constants';
import { LegalOnboarding } from './LegalOnboarding';

interface OnboardingFlowProps {
    user: User;
    onComplete: (updatedData: Partial<User>, favorites: string[]) => void;
    onDismiss: () => void;
}

type Step = 'welcome' | 'role' | 'legal' | 'identity' | 'visual-assets' | 'socials' | 'core-activation' | 'staff' | 'processing';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete, onDismiss }) => {
    const [step, setStep] = useState<Step>('welcome');
    const [role, setRole] = useState<User['role']>('artist');
    const [selectedStaff, setSelectedStaff] = useState<string[]>(['mgr', 'mkt', 'dst']);
    
    // Identity State
    const [bio, setBio] = useState(user.bio || '');
    const [location, setLocation] = useState(user.location || '');
    const [identityImages, setIdentityImages] = useState<string[]>([]);
    const assetInputRef = useRef<HTMLInputElement>(null);

    // Reference Assets for AI Learning
    const [youtubeVideoLinks, setYoutubeVideoLinks] = useState<string[]>(['']);
    const [websiteLinks, setWebsiteLinks] = useState<string[]>(['']);

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

    const finishOnboarding = () => {
        onComplete(
            { 
                onboardingCompleted: true,
                tourCompleted: false,
                role,
                bio,
                location,
                photoURL: identityImages[0] || user.photoURL,
                identityAssets: identityImages,
                socialLinks: socials,
                referenceVideoLinks: youtubeVideoLinks.filter(l => l.trim()),
                referenceWebsites: websiteLinks.filter(l => l.trim()),
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

    const addLinkField = (type: 'youtube' | 'web') => {
        if (type === 'youtube') setYoutubeVideoLinks([...youtubeVideoLinks, '']);
        else setWebsiteLinks([...websiteLinks, '']);
    };

    const updateLinkField = (type: 'youtube' | 'web', index: number, value: string) => {
        if (type === 'youtube') {
            const newLinks = [...youtubeVideoLinks];
            newLinks[index] = value;
            setYoutubeVideoLinks(newLinks);
        } else {
            const newLinks = [...websiteLinks];
            newLinks[index] = value;
            setWebsiteLinks(newLinks);
        }
    };

    const renderWelcome = () => (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
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
                    Initialize Command Hub <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderRole = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-3 text-center uppercase tracking-tighter italic">Operational Scale</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-12 text-lg">Select the tier of institutional infrastructure you require.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { id: 'artist', label: 'Indie Professional', icon: Mic2, desc: 'Single-node deployment for independent creators. Full access to AI Staff and Distribution.' },
                    { id: 'label_exec', label: 'Enterprise Label', icon: Building2, desc: 'Multi-node management for agencies and labels. Specialized A&R and bulk metadata tools.' },
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => { setRole(option.id as any); setStep('legal'); }}
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

    const renderIdentityMetadata = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto space-y-10">
            <div className="text-center">
                <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter italic">
                    {role === 'label_exec' ? 'Institutional Sync' : 'Digital Identity Hash'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Feed the neural engine your professional history.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* BIO & LOCATION */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                            Professional Overview / Bio
                        </label>
                        <textarea 
                            value={bio} onChange={e => setBio(e.target.value)}
                            placeholder="Provide 200+ words for deep personality mapping..."
                            className="w-full h-48 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-sm text-slate-900 dark:text-white focus:border-cyan-500 outline-none resize-none transition-all font-medium"
                        />
                        <div className="mt-8">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Geographic Hub</label>
                            <div className="relative">
                                <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input 
                                    value={location} onChange={e => setLocation(e.target.value)}
                                    placeholder="e.g. New York, USA"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 pl-12 pr-4 text-sm text-slate-900 dark:text-white focus:border-cyan-500 outline-none transition-all font-bold"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI LEARNING REFERENCES */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2.5rem] space-y-6 shadow-inner text-slate-900 dark:text-white">
                        <div className="flex items-center gap-3 mb-2">
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                            <h3 className="text-xs font-black uppercase tracking-widest">Neural Learning Inputs</h3>
                        </div>

                        {/* YouTube Links */}
                        <div className="space-y-3">
                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">YouTube Video References</label>
                            {youtubeVideoLinks.map((link, idx) => (
                                <div key={idx} className="relative">
                                    <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-500" />
                                    <input 
                                        value={link} onChange={e => updateLinkField('youtube', idx, e.target.value)}
                                        placeholder="Paste video URL..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-slate-300 focus:border-red-500 outline-none"
                                    />
                                </div>
                            ))}
                            <button onClick={() => addLinkField('youtube')} className="text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest">+ Add More Videos</button>
                        </div>

                        {/* Website Links */}
                        <div className="space-y-3 pt-4">
                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Institutional Web Links</label>
                            {websiteLinks.map((link, idx) => (
                                <div key={idx} className="relative">
                                    <Chrome className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-cyan-500" />
                                    <input 
                                        value={link} onChange={e => updateLinkField('web', idx, e.target.value)}
                                        placeholder="e.g. Official Site, Press, Linktree..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-3 text-xs text-slate-300 focus:border-cyan-500 outline-none"
                                    />
                                </div>
                            ))}
                            <button onClick={() => addLinkField('web')} className="text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest">+ Add More Websites</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <button onClick={() => setStep('visual-assets')} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-cyan-600/20 transition-all flex items-center justify-center gap-3">
                Sync Identity Ledger <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );

    const renderVisualAssets = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-3 text-center uppercase tracking-tighter italic">
                {role === 'label_exec' ? 'Roster Visual Corpus' : 'Visual Identity Corpus'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-12 text-lg font-medium italic max-w-2xl mx-auto">
                {role === 'label_exec' ? 'Upload 3-12 brand assets. Our neural engine uses these as a primary visual reference for all roster-wide marketing generations.' : 'Upload 3-12 clear photos. These define your visual hash, allowing the AI to generate hyper-realistic professional assets for your brand.'}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
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

            <div className="flex flex-col gap-4">
                <button 
                    onClick={() => setStep('socials')}
                    disabled={identityImages.length < 3}
                    className="w-full py-6 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-3xl font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.01] transition-all disabled:opacity-30 shadow-2xl"
                >
                    Confirm Neural Visual Hash
                </button>
                <p className="text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">Min 3 High-Res Assets Required for Node Validation</p>
            </div>
        </div>
    );

    const renderSocials = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto space-y-10">
            <div className="text-center">
                <h2 className="text-4xl md:text-6xl font-display font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter italic">Connect External Nodes</h2>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">Link your global footprint for automated audience synchronization.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500', placeholder: '@handle' },
                    { id: 'tiktok', label: 'TikTok', icon: Music, color: 'text-white', bg: 'bg-black', placeholder: '@handle' },
                    { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-slate-900 dark:text-white', placeholder: '@handle' },
                    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-600', placeholder: 'profile-url' },
                    { id: 'spotify', label: 'Spotify', icon: Music, color: 'text-green-500', placeholder: 'artist-url' },
                    { id: 'youtube', label: 'YouTube', icon: Youtube, color: 'text-red-600', placeholder: 'channel-handle' },
                ].map(net => (
                    <div key={net.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm transition-all focus-within:ring-2 ring-cyan-500/20">
                        <div className={`p-3 bg-slate-50 dark:bg-slate-950 rounded-xl ${net.color} ${net.bg || ''}`}><net.icon className="w-5 h-5" /></div>
                        <div className="flex-1">
                            <label className="block text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{net.label}</label>
                            <input 
                                placeholder={net.placeholder}
                                value={(socials as any)[net.id]}
                                onChange={e => setSocials({...socials, [net.id]: e.target.value})}
                                className="bg-transparent w-full text-xs font-bold text-slate-900 dark:text-white outline-none"
                            />
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={() => setStep('core-activation')} className="w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-2xl mt-4">
                Authorize Channel Integration
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar transition-colors duration-500">
            <div className="w-full max-w-6xl py-12">
                {step === 'welcome' && renderWelcome()}
                {step === 'role' && renderRole()}
                
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
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
                        <div className="w-32 h-32 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border-2 border-cyan-500 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
                            <Server className="w-16 h-16 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">Initialize Node</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-xl mb-12 font-medium">Finalizing the deployment of your institutional identity on the Sound Merge Ledger.</p>
                        <button 
                            onClick={() => setStep('staff')}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:scale-105 transition-transform flex items-center gap-4 mx-auto shadow-xl shadow-cyan-600/20"
                        >
                            Authorize Enterprise Sync <CheckCircle2 className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 'staff' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-5xl mx-auto space-y-12">
                        <div className="text-center">
                            <h2 className="text-5xl md:text-7xl font-display font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter italic leading-none">CONTRACT AI SUPPORT</h2>
                            <p className="text-slate-500 text-xl font-medium mt-4">Delegate the business of music to your personal institutional staff.</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {[
                                { id: 'mgr', label: 'AGENT / MANAGER', icon: Briefcase, color: 'text-indigo-500', desc: 'Strategy & Ops' },
                                { id: 'mkt', label: 'CMO / MARKETING', icon: Zap, color: 'text-cyan-500', desc: 'Hype & Growth' },
                                { id: 'dst', label: 'DISTRO OFFICER', icon: Radio, color: 'text-green-500', desc: 'Metadata & Stores' },
                                { id: 'lgl', label: 'LEGAL COUNSEL', icon: Shield, color: 'text-red-500', desc: 'Rights & Voice IP' },
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
                            Initialize Team Hub & Enter Platform
                        </button>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-700 min-h-[400px]">
                        <div className="relative mb-12">
                            <div className="w-40 h-40 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-cyan-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-12 h-12 text-cyan-600 dark:text-cyan-400 animate-pulse" /></div>
                        </div>
                        <h2 className="text-3xl font-display font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{processingMessages[processingStep]}</h2>
                        <p className="text-slate-500 font-medium mt-4 text-lg">Synchronizing agentic nodes with global industry infrastructure...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
