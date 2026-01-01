
import React, { useState, useEffect } from 'react';
import { 
    Music, Briefcase, Headphones, Wand2, ArrowRight, CheckCircle2, 
    Zap, Globe, Shield, Mic2, Star, LayoutDashboard, Loader2, X 
} from 'lucide-react';
import { User } from '../types';
import { VIEWS } from '../constants';

interface OnboardingFlowProps {
    user: User;
    onComplete: (updatedData: Partial<User>, favorites: string[]) => void;
    onDismiss: () => void;
}

type Step = 'welcome' | 'role' | 'experience' | 'goals' | 'processing';

// Goal to View Mapping for Auto-Favorites
const GOAL_MAPPING: Record<string, string[]> = {
    'create_music': [VIEWS.STUDIO, VIEWS.MASTERING, VIEWS.MY_MUSIC],
    'distribute': [VIEWS.DISTRIBUTION, VIEWS.REVENUE],
    'sync_licensing': [VIEWS.OPPORTUNITIES, VIEWS.VOICE],
    'find_talent': [VIEWS.AR_DASHBOARD, VIEWS.ANALYTICS],
    'manage_roster': [VIEWS.CRM, VIEWS.REVENUE, VIEWS.ANALYTICS],
    'listen_discover': [VIEWS.CATALOG, VIEWS.BATTLES],
    'protect_ip': [VIEWS.VOICE, VIEWS.REVENUE],
    'grow_brand': [VIEWS.BRAND, VIEWS.CRM]
};

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete, onDismiss }) => {
    const [step, setStep] = useState<Step>('welcome');
    const [role, setRole] = useState<User['role']>('artist');
    const [experience, setExperience] = useState<User['experienceLevel']>('beginner');
    const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
    
    // Processing Animation State
    const [processingStep, setProcessingStep] = useState(0);
    const processingMessages = [
        "Analyzing your profile...",
        "Configuring AI Studio engines...",
        "Connecting to global distribution nodes...",
        "Personalizing your dashboard...",
        "Ready to launch!"
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
        // Calculate Favorites based on goals
        const favorites = new Set<string>();
        
        // Always add Dashboard
        favorites.add(VIEWS.DASHBOARD);

        // Add based on Role
        if (role === 'artist' || role === 'producer') favorites.add(VIEWS.STUDIO);
        if (role === 'manager' || role === 'label_exec') favorites.add(VIEWS.ANALYTICS);
        
        // Add based on Goals
        selectedGoals.forEach(goal => {
            const views = GOAL_MAPPING[goal];
            if (views) views.forEach(v => favorites.add(v));
        });

        // Add based on Experience (Pros usually want revenue/analytics)
        if (experience === 'pro') {
            favorites.add(VIEWS.REVENUE);
            favorites.add(VIEWS.ANALYTICS);
        }

        onComplete(
            { 
                onboardingCompleted: true,
                role,
                experienceLevel: experience,
                primaryGoals: selectedGoals
            }, 
            Array.from(favorites)
        );
    };

    const toggleGoal = (goal: string) => {
        if (selectedGoals.includes(goal)) {
            setSelectedGoals(prev => prev.filter(g => g !== goal));
        } else {
            setSelectedGoals(prev => [...prev, goal]);
        }
    };

    // --- RENDER STEPS ---

    const renderWelcome = () => (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/20">
                <Wand2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">Welcome to SoundForge, {user.displayName.split(' ')[0]}.</h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
                We're going to set up your personal AI studio. Answer 3 quick questions so we can customize your workspace.
            </p>
            <div className="flex flex-col items-center gap-4">
                <button 
                    onClick={() => setStep('role')}
                    className="bg-white text-slate-900 px-8 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
                >
                    Let's Go <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                    onClick={onDismiss}
                    className="text-slate-500 hover:text-white text-sm font-medium transition-colors"
                >
                    Skip Setup (I'll do this later)
                </button>
            </div>
        </div>
    );

    const renderRole = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">First, what describes you best?</h2>
            <p className="text-slate-400 text-center mb-8">This helps us enable the right AI agents for you.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                    { id: 'artist', label: 'Artist / Singer', icon: Mic2, desc: 'I want to release music & build a brand.' },
                    { id: 'producer', label: 'Producer / Engineer', icon: Music, desc: 'I make beats, mix, and master.' },
                    { id: 'manager', label: 'Manager / A&R', icon: Briefcase, desc: 'I manage talent and scout hits.' },
                    { id: 'listener', label: 'Fan / Curator', icon: Headphones, desc: 'I want to discover and vote on music.' },
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => {
                            setRole(option.id as any);
                            setStep('experience');
                        }}
                        className="bg-slate-800 hover:bg-slate-700 hover:border-cyan-500 border-2 border-transparent p-6 rounded-xl text-left group transition-all"
                    >
                        <div className="bg-slate-900 w-12 h-12 rounded-full flex items-center justify-center mb-4 group-hover:bg-cyan-500/20 group-hover:text-cyan-400 transition-colors">
                            <option.icon className="w-6 h-6 text-slate-400 group-hover:text-cyan-400" />
                        </div>
                        <h3 className="font-bold text-lg text-white mb-1">{option.label}</h3>
                        <p className="text-sm text-slate-400">{option.desc}</p>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderExperience = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">What's your experience level?</h2>
            <p className="text-slate-400 text-center mb-8">We'll adjust the complexity of the tools accordingly.</p>
            
            <div className="flex flex-col gap-4 max-w-md mx-auto">
                {[
                    { id: 'beginner', label: 'Just Starting Out', desc: 'Show me the basics and guide me.' },
                    { id: 'intermediate', label: 'Growing Artist', desc: 'I have some releases, ready to scale.' },
                    { id: 'pro', label: 'Established Pro', desc: 'Give me advanced tools and data.' },
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => {
                            setExperience(option.id as any);
                            setStep('goals');
                        }}
                        className="bg-slate-800 hover:bg-slate-700 p-5 rounded-xl flex items-center justify-between group border border-slate-700 hover:border-cyan-500 transition-all"
                    >
                        <div className="text-left">
                            <h3 className="font-bold text-lg text-white group-hover:text-cyan-400">{option.label}</h3>
                            <p className="text-sm text-slate-400">{option.desc}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                    </button>
                ))}
            </div>
            <button onClick={() => setStep('role')} className="block mx-auto mt-6 text-slate-500 hover:text-white text-sm">Back</button>
        </div>
    );

    const renderGoals = () => {
        // Dynamic goals based on Role
        let options = [];
        if (role === 'listener') {
            options = [
                { id: 'listen_discover', label: 'Discover New Music', icon: Globe },
                { id: 'find_talent', label: 'Vote in Battles', icon: Star },
            ];
        } else if (role === 'manager') {
            options = [
                { id: 'find_talent', label: 'Scout Talent', icon: SearchIcon },
                { id: 'manage_roster', label: 'Manage Roster', icon: Briefcase },
                { id: 'sync_licensing', label: 'Find Sync Deals', icon: Zap },
            ];
        } else {
            // Artists/Producers
            options = [
                { id: 'create_music', label: 'Create with AI', icon: Wand2 },
                { id: 'distribute', label: 'Distribute Music', icon: Globe },
                { id: 'sync_licensing', label: 'Get Sync Placements', icon: Zap },
                { id: 'protect_ip', label: 'Protect Voice (AI Shield)', icon: Shield },
                { id: 'grow_brand', label: 'Grow My Brand', icon: LayoutDashboard },
            ];
        }

        return (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                <h2 className="text-3xl font-bold text-white mb-2 text-center">What are your main goals?</h2>
                <p className="text-slate-400 text-center mb-8">Select all that apply. We'll pin these to your menu.</p>
                
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
                    {options.map((option) => {
                        const isSelected = selectedGoals.includes(option.id);
                        return (
                            <button
                                key={option.id}
                                onClick={() => toggleGoal(option.id)}
                                className={`p-4 rounded-xl flex flex-col items-center justify-center gap-3 border-2 transition-all ${
                                    isSelected 
                                    ? 'bg-cyan-500/10 border-cyan-500 text-white' 
                                    : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700'
                                }`}
                            >
                                <option.icon className={`w-8 h-8 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                                <span className="font-bold text-sm">{option.label}</span>
                                {isSelected && <div className="absolute top-2 right-2"><CheckCircle2 className="w-4 h-4 text-cyan-500" /></div>}
                            </button>
                        );
                    })}
                </div>

                <button 
                    onClick={() => setStep('processing')}
                    disabled={selectedGoals.length === 0}
                    className="w-full max-w-xs mx-auto block bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-4 rounded-full font-bold text-lg shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Build My Studio
                </button>
                <button onClick={() => setStep('experience')} className="block mx-auto mt-4 text-slate-500 hover:text-white text-sm">Back</button>
            </div>
        );
    };

    const renderProcessing = () => (
        <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-700">
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-cyan-500 animate-pulse" />
                </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{processingMessages[processingStep]}</h2>
            <div className="w-64 h-2 bg-slate-800 rounded-full mt-4 overflow-hidden">
                <div 
                    className="h-full bg-cyan-500 transition-all duration-300"
                    style={{ width: `${(processingStep / (processingMessages.length - 1)) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6">
            <button 
                onClick={onDismiss} 
                className="absolute top-6 right-6 p-2 rounded-full text-slate-500 hover:text-white hover:bg-slate-800 transition-colors z-50"
                title="Exit Setup"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="w-full max-w-4xl">
                {/* Progress Indicators (Hidden on welcome/processing) */}
                {step !== 'welcome' && step !== 'processing' && (
                    <div className="flex justify-center gap-2 mb-12">
                        {['role', 'experience', 'goals'].map((s, i) => {
                            const active = s === step;
                            const passed = ['role', 'experience', 'goals'].indexOf(step) > i;
                            return (
                                <div key={s} className={`h-1.5 w-12 rounded-full transition-all ${active ? 'bg-cyan-500 w-20' : passed ? 'bg-cyan-900' : 'bg-slate-800'}`}></div>
                            );
                        })}
                    </div>
                )}

                {step === 'welcome' && renderWelcome()}
                {step === 'role' && renderRole()}
                {step === 'experience' && renderExperience()}
                {step === 'goals' && renderGoals()}
                {step === 'processing' && renderProcessing()}
            </div>
        </div>
    );
};

// Simple icon for scout fallback
const SearchIcon = (props: any) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);
