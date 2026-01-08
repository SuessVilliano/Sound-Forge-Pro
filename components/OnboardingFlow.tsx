
import React, { useState, useEffect, useRef } from 'react';
import { 
    Music, Briefcase, Headphones, Wand2, ArrowRight, CheckCircle2, 
    Zap, Globe, Shield, Mic2, Star, LayoutDashboard, Loader2, X, MessageSquare, Users,
    Radio, Camera, Instagram, Facebook, Twitter, Link as LinkIcon, Save, Sparkles, Server,
    FileText, PenTool, ImagePlus, Check
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
                tourCompleted: false, // Trigger tutorial on next load
                role,
                bio,
                location,
                photoURL: identityImages[0] || user.photoURL,
                identityAssets: identityImages,
                socialLinks: socials,
                hasSignedLegal: true,
                legalSignedDate: new Date().toISOString()
            }, 
            [VIEWS.DASHBOARD, VIEWS.STAFF, VIEWS.STUDIO, VIEWS.BRAND]
        );
    };

    const handleAssetUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Fix: Explicitly cast Array.from result to File[] to prevent "unknown" type inference
        const files = Array.from(e.target.files || []) as File[];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setIdentityImages(prev => [...prev, reader.result as string].slice(0, 6));
            };
            // Fix: Ensured file is passed correctly to readAsDataURL as line 86 error was likely caused by "unknown" inference
            reader.readAsDataURL(file);
        });
    };

    const renderWelcome = () => (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/20">
                <Music className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">Own Your Future, {user.displayName.split(' ')[0]}.</h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
                Sound Merge provides the institutional infrastructure for you to create, distribute, and protect your music identity.
            </p>
            <div className="flex flex-col items-center gap-4">
                <button 
                    onClick={() => setStep('role')}
                    className="bg-white text-slate-900 px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-xl"
                >
                    Initialize Career Hub <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );

    const renderRole = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tighter">Your Industry Role</h2>
            <p className="text-slate-400 text-center mb-8">We'll tailor your infrastructure to your specific professional needs.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                    { id: 'artist', label: 'Artist / Vocalist', icon: Mic2, desc: 'I need global distribution and vocal IP protection.' },
                    { id: 'producer', label: 'Producer / Writer', icon: Music, desc: 'I need sync deals and ledger-based royalty management.' },
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => { setRole(option.id as any); setStep('legal'); }}
                        className="bg-slate-900 hover:bg-slate-800 hover:border-cyan-500 border-2 border-slate-800 p-6 rounded-3xl text-left group transition-all"
                    >
                        <div className="bg-slate-950 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-cyan-500/10 group-hover:text-cyan-400 transition-colors">
                            <option.icon className="w-6 h-6 text-slate-600 group-hover:text-cyan-400" />
                        </div>
                        <h3 className="font-black text-lg text-white mb-1 uppercase tracking-tight">{option.label}</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">{option.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderVisualAssets = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tighter">Visual Identity Training</h2>
            <p className="text-slate-400 text-center mb-10 font-medium italic">Upload 3-6 photos of yourself. Our neural engine uses these to generate professional marketing assets in the Brand Builder.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div 
                        key={i}
                        onClick={() => assetInputRef.current?.click()}
                        className={`aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-all overflow-hidden relative group ${identityImages[i] ? 'border-cyan-500 bg-cyan-500/5' : 'border-slate-700 bg-slate-900 hover:border-slate-500'}`}
                    >
                        {identityImages[i] ? (
                            <>
                                <img src={identityImages[i]} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1"><Check className="w-3 h-3 text-white" /></div>
                            </>
                        ) : (
                            <>
                                <ImagePlus className="w-8 h-8 text-slate-700 group-hover:text-slate-500 transition-colors" />
                                <span className="text-[8px] font-black uppercase text-slate-600 mt-2">Asset {i+1}</span>
                            </>
                        )}
                    </div>
                ))}
            </div>
            <input type="file" multiple ref={assetInputRef} className="hidden" accept="image/*" onChange={handleAssetUpload} />

            <button 
                onClick={() => setStep('core-activation')}
                disabled={identityImages.length < 3}
                className="w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all disabled:opacity-30"
            >
                Confirm Visual Identity (Min 3 Photos)
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar">
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

                {step === 'identity' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
                        <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tighter">Identity Metadata</h2>
                        <p className="text-slate-400 text-center mb-10 font-medium">Tell your story for your ledger profile.</p>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Artist Bio</label>
                                <textarea 
                                    value={bio} onChange={e => setBio(e.target.value)}
                                    placeholder="Share your musical journey..."
                                    className="w-full h-32 bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-cyan-500 outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Base Location</label>
                                <input 
                                    value={location} onChange={e => setLocation(e.target.value)}
                                    placeholder="e.g. London, UK"
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-sm text-white focus:border-cyan-500 outline-none"
                                />
                            </div>
                            <button onClick={() => setStep('visual-assets')} className="w-full py-4 bg-cyan-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs">Next: Training Assets</button>
                        </div>
                    </div>
                )}

                {step === 'visual-assets' && renderVisualAssets()}

                {step === 'core-activation' && (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                            <Server className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Synchronize Core</h2>
                        <p className="text-slate-400 text-lg mb-8">Deploying your institutional Identity Node on the Sound Merge Ledger.</p>
                        <button 
                            onClick={() => setStep('socials')}
                            className="bg-cyan-500 text-slate-950 px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-xl"
                        >
                            Synchronize Engine <CheckCircle2 className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {step === 'socials' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-xl mx-auto">
                        <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tighter">Link Channels</h2>
                        <div className="space-y-4">
                            {[
                                { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
                                { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-white' },
                                { id: 'spotify', label: 'Spotify', icon: Music, color: 'text-green-500' },
                            ].map(net => (
                                <div key={net.id} className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                                    <div className={`p-2 bg-black rounded-lg ${net.color}`}><net.icon className="w-5 h-5" /></div>
                                    <input 
                                        placeholder={`Link your ${net.label}...`}
                                        value={(socials as any)[net.id]}
                                        onChange={e => setSocials({...socials, [net.id]: e.target.value})}
                                        className="bg-transparent flex-1 text-sm font-bold text-white outline-none"
                                    />
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setStep('staff')} className="mt-12 w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs">Authorize Connections</button>
                    </div>
                )}

                {step === 'staff' && (
                    <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
                        <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tighter">Assign Professional Staff</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                            {[
                                { id: 'mgr', label: 'Manager', icon: Briefcase, color: 'text-white' },
                                { id: 'mkt', label: 'Marketing', icon: Zap, color: 'text-cyan-400' },
                                { id: 'dst', label: 'Distribution', icon: Radio, color: 'text-green-400' },
                                { id: 'lgl', label: 'Legal', icon: Shield, color: 'text-red-400' },
                            ].map((staff) => (
                                <button
                                    key={staff.id}
                                    onClick={() => setSelectedStaff(prev => selectedStaff.includes(staff.id) ? prev.filter(s => s !== staff.id) : [...prev, staff.id])}
                                    className={`p-6 rounded-[2rem] flex flex-col items-center gap-4 border-2 transition-all ${selectedStaff.includes(staff.id) ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'}`}
                                >
                                    <div className={`p-4 bg-black rounded-2xl ${staff.color}`}><staff.icon className="w-8 h-8" /></div>
                                    <span className="font-black text-[10px] uppercase">{staff.label}</span>
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setStep('processing')} className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm">Contract Staff & Enter Studio</button>
                    </div>
                )}

                {step === 'processing' && (
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 text-cyan-500 animate-pulse" /></div>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{processingMessages[processingStep]}</h2>
                    </div>
                )}
            </div>
        </div>
    );
};
