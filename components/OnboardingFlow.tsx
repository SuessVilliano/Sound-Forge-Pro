
import React, { useState, useEffect, useRef } from 'react';
import { 
    Music, Briefcase, Headphones, Wand2, ArrowRight, CheckCircle2, 
    Zap, Globe, Shield, Mic2, Star, LayoutDashboard, Loader2, X, MessageSquare, Users,
    Radio, Camera, Instagram, Facebook, Twitter, Link as LinkIcon, Save, Sparkles, Server,
    FileText, PenTool, ImagePlus, Check, Building2, Users2
} from 'lucide-react';
import { User } from '../types';
import { VIEWS } from '../constants';
import { LegalOnboarding } from './LegalOnboarding';

interface OnboardingFlowProps {
    user: User;
    onComplete: (updatedData: Partial<User>, favorites: string[]) => void;
    onDismiss: () => void;
}

type Step = 'welcome' | 'role' | 'legal' | 'core-activation' | 'identity' | 'visual-assets' | 'socials' | 'staff' | 'processing';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete, onDismiss }) => {
    const [step, setStep] = useState<Step>('welcome');
    const [role, setRole] = useState<User['role']>('artist');
    const [selectedStaff, setSelectedStaff] = useState<string[]>(['mgr', 'mkt', 'dst']);
    
    // Identity State
    const [bio, setBio] = useState(user.bio || '');
    const [location, setLocation] = useState(user.location || '');
    const [identityImages, setIdentityImages] = useState<string[]>([]);
    const assetInputRef = useRef<HTMLInputElement>(null);

    // Social State
    const [socials, setSocials] = useState({ instagram: '', twitter: '', spotify: '', youtube: '' });

    const [processingStep, setProcessingStep] = useState(0);
    const processingMessages = [
        "Initializing Sound Merge Core...",
        "Establishing Institutional Rights Rails...",
        "Deploying Dedicated Identity Ledger...",
        "Syncing Voice DNA Protection...",
        "Assigning Professional AI Staff...",
        "Welcome to your professional digital office."
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
            }, 1200);
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
                setIdentityImages(prev => [...prev, reader.result as string].slice(0, 6));
            };
            reader.readAsDataURL(file);
        });
    };

    const renderWelcome = () => (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/20">
                <Music className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">Institutional Music Infrastructure.</h1>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
                Sound Merge provides the high-fidelity rails for artists and labels to create, protect, and scale their sonic assets.
            </p>
            <div className="flex flex-col items-center gap-4">
                <button 
                    onClick={() => setStep('role')}
                    className="bg-slate-950 dark:bg-white text-white dark:text-slate-900 px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-xl"
                >
                    Initialize Command Hub <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderRole = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center uppercase tracking-tighter italic">Select Operational Scale</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-10">We'll tailor your node based on your professional requirements.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { id: 'artist', label: 'Independent Artist', icon: Mic2, desc: 'I need to create tracks, protect my vocal IP, and distribute my music globally.' },
                    { id: 'label_exec', label: 'Music Label / Manager', icon: Building2, desc: 'I manage a roster of artists and need institutional tools for bulk distribution and rights tracking.' },
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => { setRole(option.id as any); setStep('legal'); }}
                        className="bg-white dark:bg-slate-900 hover:border-cyan-500 border-2 border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] text-left group transition-all shadow-sm hover:shadow-xl"
                    >
                        <div className="bg-slate-100 dark:bg-slate-950 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500/10 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            <option.icon className="w-8 h-8 text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400" />
                        </div>
                        <h3 className="font-black text-xl text-slate-900 dark:text-white mb-2 uppercase tracking-tight italic">{option.label}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{option.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderIdentityMetadata = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center uppercase tracking-tighter italic">
                {role === 'label_exec' ? 'Label Core Sync' : 'Artist Identity Metadata'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-10 font-medium">Tell us about your musical footprint.</p>
            <div className="space-y-6">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-sm">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
                        {role === 'label_exec' ? 'Label Vision & Roster Focus' : 'Your Musical Bio'}
                    </label>
                    <textarea 
                        value={bio} onChange={e => setBio(e.target.value)}
                        placeholder={role === 'label_exec' ? "Explain your label's genre focus and current roster size..." : "Share your journey as a creator..."}
                        className="w-full h-40 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-slate-900 dark:text-white focus:border-cyan-500 outline-none resize-none transition-all font-medium"
                    />
                    <div className="mt-6">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Primary HQ Location</label>
                        <div className="relative">
                            <input 
                                value={location} onChange={e => setLocation(e.target.value)}
                                placeholder="e.g. London, UK"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm text-slate-900 dark:text-white focus:border-cyan-500 outline-none transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>
                <button onClick={() => setStep('visual-assets')} className="w-full py-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-cyan-500/10 transition-all">Next: Secure Training Assets</button>
            </div>
        </div>
    );

    const renderVisualAssets = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center uppercase tracking-tighter italic">
                {role === 'label_exec' ? 'Roster Visual Training' : 'Visual Identity Training'}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-center mb-10 font-medium italic">
                {role === 'label_exec' ? 'Upload 3-6 photos of your flagship artist or label branding. Our neural engine uses these for roster marketing.' : 'Upload 3-6 photos of yourself. Our neural engine uses these to generate professional marketing assets.'}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div 
                        key={i}
                        onClick={() => assetInputRef.current?.click()}
                        className={`aspect-square rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden relative group ${identityImages[i] ? 'border-cyan-500 bg-cyan-500/5 shadow-inner' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-500'}`}
                    >
                        {identityImages[i] ? (
                            <>
                                <img src={identityImages[i]} className="w-full h-full object-cover" />
                                <div className="absolute top-3 right-3 bg-green-500 rounded-full p-1 shadow-lg border-2 border-white dark:border-slate-900 animate-in zoom-in"><Check className="w-3 h-3 text-white" /></div>
                            </>
                        ) : (
                            <>
                                <ImagePlus className="w-8 h-8 text-slate-300 group-hover:text-cyan-500 transition-colors" />
                                <span className="text-[8px] font-black uppercase text-slate-400 mt-3 tracking-widest">Asset {i+1}</span>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <input type="file" multiple ref={assetInputRef} className="hidden" accept="image/*" onChange={handleAssetUpload} />

            <button 
                onClick={() => setStep('core-activation')}
                disabled={identityImages.length < 3}
                className="w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.01] transition-all disabled:opacity-30 shadow-2xl"
            >
                Confirm Infrastructure Training (Min 3 Assets)
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar transition-colors duration-500">
            <div className="w-full max-w-5xl py-12">
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

                {step === 'core-activation' && (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
                        <div className="w-24 h-24 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                            <Server className="w-12 h-12 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">Synchronize Node</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 font-medium">Deploying your institutional Identity Node on the Sound Merge Ledger.</p>
                        <button 
                            onClick={() => setStep('socials')}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-xl shadow-cyan-600/20"
                        >
                            Execute Engine Sync <CheckCircle2 className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 'socials' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-xl mx-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center uppercase tracking-tighter italic">Link External Channels</h2>
                        <p className="text-slate-500 text-center mb-10 font-medium italic">We'll use these to monitor footprint and automate promos.</p>
                        <div className="space-y-4">
                            {[
                                { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
                                { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-slate-900 dark:text-white' },
                                { id: 'spotify', label: 'Spotify', icon: Music, color: 'text-green-500' },
                            ].map(net => (
                                <div key={net.id} className="flex items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all focus-within:border-cyan-500">
                                    <div className={`p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl ${net.color}`}><net.icon className="w-5 h-5" /></div>
                                    <input 
                                        placeholder={`Link your ${net.label}...`}
                                        value={(socials as any)[net.id]}
                                        onChange={e => setSocials({...socials, [net.id]: e.target.value})}
                                        className="bg-transparent flex-1 text-sm font-bold text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setStep('staff')} className="mt-12 w-full py-5 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl">Authorize Connections</button>
                    </div>
                )}

                {step === 'staff' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 text-center uppercase tracking-tighter italic">Contract AI Support Staff</h2>
                        <p className="text-slate-500 text-center mb-10 font-medium">Select your starting delegation team.</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                            {[
                                { id: 'mgr', label: 'Manager', icon: Briefcase, color: 'text-indigo-500' },
                                { id: 'mkt', label: 'Marketing', icon: Zap, color: 'text-cyan-500' },
                                { id: 'dst', label: 'Distribution', icon: Radio, color: 'text-green-500' },
                                { id: 'lgl', label: 'Legal', icon: Shield, color: 'text-red-500' },
                            ].map((staff) => (
                                <button
                                    key={staff.id}
                                    onClick={() => setSelectedStaff(prev => selectedStaff.includes(staff.id) ? prev.filter(s => s !== staff.id) : [...prev, staff.id])}
                                    className={`p-8 rounded-[3rem] flex flex-col items-center gap-4 border-2 transition-all ${selectedStaff.includes(staff.id) ? 'bg-cyan-50 dark:bg-cyan-500/10 border-cyan-500 shadow-lg' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'}`}
                                >
                                    <div className={`p-5 bg-slate-100 dark:bg-slate-950 rounded-2xl ${staff.color}`}><staff.icon className="w-8 h-8" /></div>
                                    <span className="font-black text-xs uppercase tracking-widest">{staff.label}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep('processing')} className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white rounded-3xl font-black uppercase tracking-widest text-sm shadow-xl shadow-cyan-600/20">Finalize Contracts & Enter Studio</button>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                        <div className="relative mb-10">
                            <div className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-cyan-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-10 h-10 text-cyan-600 dark:text-cyan-400 animate-pulse" /></div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">{processingMessages[processingStep]}</h2>
                        <p className="text-slate-500 font-medium mt-2">Connecting to global industry nodes...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
