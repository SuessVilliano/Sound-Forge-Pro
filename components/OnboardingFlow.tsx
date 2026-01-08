
import React, { useState, useEffect, useRef } from 'react';
import { 
    Music, Briefcase, Headphones, Wand2, ArrowRight, CheckCircle2, 
    Zap, Globe, Shield, Mic2, Star, LayoutDashboard, Loader2, X, MessageSquare, Users,
    Radio, Camera, Instagram, Facebook, Twitter, Link as LinkIcon, Save, Sparkles, Server
} from 'lucide-react';
import { User } from '../types';
import { VIEWS } from '../constants';
import { authService } from '../services/authService';

interface OnboardingFlowProps {
    user: User;
    onComplete: (updatedData: Partial<User>, favorites: string[]) => void;
    onDismiss: () => void;
}

type Step = 'welcome' | 'role' | 'core-activation' | 'identity' | 'socials' | 'staff' | 'processing';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete, onDismiss }) => {
    const [step, setStep] = useState<Step>('welcome');
    const [role, setRole] = useState<User['role']>('artist');
    const [selectedStaff, setSelectedStaff] = useState<string[]>(['mgr', 'mkt', 'dst']);
    
    // Identity State
    const [bio, setBio] = useState(user.bio || '');
    const [location, setLocation] = useState(user.location || '');
    const [avatar, setAvatar] = useState<string | null>(user.photoURL || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Social State
    const [socials, setSocials] = useState({ instagram: '', twitter: '', spotify: '', youtube: '' });

    const [processingStep, setProcessingStep] = useState(0);
    const processingMessages = [
        "Initializing Sound Merge Core...",
        "Establishing Institutional Rights Rails...",
        "Deploying Dedicated Identity Ledger...",
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
                role,
                bio,
                location,
                photoURL: avatar || undefined,
                socialLinks: socials
            }, 
            [VIEWS.DASHBOARD, VIEWS.STAFF, VIEWS.STUDIO, VIEWS.MY_MUSIC]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setAvatar(reader.result as string);
            reader.readAsDataURL(file);
        }
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
                        onClick={() => { setRole(option.id as any); setStep('core-activation'); }}
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

    const renderCoreActivation = () => (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto">
            <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                <Server className="w-10 h-10 text-cyan-400" />
            </div>
            <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">Synchronize Core</h2>
            <p className="text-slate-400 text-lg mb-8">
                To enable the Hub and Promotion Ledger, we must synchronize your personal Institutional Node. This creates your private career database.
            </p>
            <button 
                onClick={() => setStep('identity')}
                className="bg-cyan-500 text-slate-950 px-10 py-4 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-xl"
            >
                Synchronize Engine <CheckCircle2 className="w-5 h-5" />
            </button>
        </div>
    );

    const renderIdentity = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tighter">Build Identity</h2>
            <p className="text-slate-400 text-center mb-10 font-medium">Tell your story and upload professional visuals for your ledger profile.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square bg-slate-900 rounded-3xl border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-center cursor-pointer hover:border-cyan-500 transition-all overflow-hidden relative group"
                    >
                        {avatar ? <img src={avatar} className="w-full h-full object-cover" /> : <Camera className="w-10 h-10 text-slate-700" />}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black uppercase text-white">Change Photo</div>
                    </div>
                </div>
                <div className="md:col-span-2 space-y-6">
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
                </div>
            </div>

            <button 
                onClick={() => setStep('socials')}
                className="mt-12 w-full py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all"
            >
                Confirm Identity Details
            </button>
        </div>
    );

    const renderSocials = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tighter">Link Channels</h2>
            <p className="text-slate-400 text-center mb-10 font-medium">Connect your promotion channels to enable cross-platform insights.</p>
            
            <div className="space-y-4">
                {[
                    { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
                    { id: 'twitter', label: 'X (Twitter)', icon: Twitter, color: 'text-white' },
                    { id: 'spotify', label: 'Spotify', icon: Music, color: 'text-green-500' },
                    { id: 'youtube', label: 'YouTube', icon: Radio, color: 'text-red-500' },
                ].map(net => (
                    <div key={net.id} className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                        <div className={`p-2 bg-black rounded-lg ${net.color}`}><net.icon className="w-5 h-5" /></div>
                        <input 
                            placeholder={`Link your ${net.label}...`}
                            value={(socials as any)[net.id]}
                            onChange={e => setSocials({...socials, [net.id]: e.target.value})}
                            className="bg-transparent flex-1 text-sm font-bold text-white outline-none"
                        />
                        <button className="text-[10px] font-black uppercase text-cyan-500 hover:text-white transition-colors">Authorize</button>
                    </div>
                ))}
            </div>

            <button 
                onClick={() => setStep('staff')}
                className="mt-12 w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-xl shadow-cyan-500/20"
            >
                Synchronize Channels
            </button>
        </div>
    );

    const renderStaff = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl mx-auto">
            <h2 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-tighter">Assign Professional Staff</h2>
            <p className="text-slate-400 text-center mb-10">Select your core team to handle business operations.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
                {[
                    { id: 'mgr', label: 'Strategy Manager', icon: Briefcase, color: 'text-white' },
                    { id: 'mkt', label: 'Marketing Lead', icon: Zap, color: 'text-cyan-400' },
                    { id: 'dst', label: 'Head of Distro', icon: Radio, color: 'text-green-400' },
                    { id: 'lgl', label: 'IP / Legal Officer', icon: Shield, color: 'text-red-400' },
                ].map((staff) => {
                    const isSelected = selectedStaff.includes(staff.id);
                    return (
                        <button
                            key={staff.id}
                            onClick={() => setSelectedStaff(prev => isSelected ? prev.filter(s => s !== staff.id) : [...prev, staff.id])}
                            className={`p-6 rounded-[2rem] flex flex-col items-center gap-4 border-2 transition-all relative ${
                                isSelected ? 'bg-cyan-500/10 border-cyan-500 text-white shadow-xl' : 'bg-slate-900 border-slate-800 text-slate-500 hover:bg-slate-800'
                            }`}
                        >
                            <div className={`p-4 bg-black rounded-2xl ${staff.color}`}><staff.icon className="w-8 h-8" /></div>
                            <span className="font-black text-xs uppercase tracking-widest">{staff.label}</span>
                            {isSelected && <div className="absolute top-4 right-4"><CheckCircle2 className="w-4 h-4 text-cyan-500" /></div>}
                        </button>
                    );
                })}
            </div>

            <button 
                onClick={() => setStep('processing')}
                className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm shadow-2xl hover:scale-[1.01] transition-all"
            >
                Authorize Employment Contracts
            </button>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-5xl py-12">
                {step === 'welcome' && renderWelcome()}
                {step === 'role' && renderRole()}
                {step === 'core-activation' && renderCoreActivation()}
                {step === 'identity' && renderIdentity()}
                {step === 'socials' && renderSocials()}
                {step === 'staff' && renderStaff()}
                {step === 'processing' && (
                    <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
                        <div className="relative mb-8">
                            <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin"></div>
                            <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 text-cyan-500 animate-pulse" /></div>
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{processingMessages[processingStep]}</h2>
                        <div className="w-64 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden">
                            <div className="h-full bg-cyan-500 transition-all duration-300" style={{ width: `${(processingStep / (processingMessages.length - 1)) * 100}%` }}></div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
