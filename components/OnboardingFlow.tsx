
import React, { useState, useEffect } from 'react';
import { 
    Music, Briefcase, Headphones, Wand2, ArrowRight, CheckCircle2, 
    Zap, Globe, Shield, Mic2, Star, LayoutDashboard, Loader2, X, MessageSquare, Users,
    Radio
} from 'lucide-react';
import { User } from '../types';
import { VIEWS } from '../constants';

interface OnboardingFlowProps {
    user: User;
    onComplete: (updatedData: Partial<User>, favorites: string[]) => void;
    onDismiss: () => void;
}

type Step = 'welcome' | 'role' | 'staff' | 'processing';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ user, onComplete, onDismiss }) => {
    const [step, setStep] = useState<Step>('welcome');
    const [role, setRole] = useState<User['role']>('artist');
    const [selectedStaff, setSelectedStaff] = useState<string[]>(['mgr', 'mkt', 'dst']); // Default staff
    
    const [processingStep, setProcessingStep] = useState(0);
    const processingMessages = [
        "Onboarding your staff members...",
        "Setting up specialized communication threads...",
        "Syncing your catalog to A&R agents...",
        "Establishing direct distribution channels...",
        "Welcome to your professional agency!"
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
        const favorites = [
            VIEWS.DASHBOARD,
            VIEWS.STAFF,
            VIEWS.STUDIO,
            VIEWS.MY_MUSIC
        ];

        onComplete(
            { 
                onboardingCompleted: true,
                role
            }, 
            favorites
        );
    };

    const toggleStaff = (id: string) => {
        if (selectedStaff.includes(id)) {
            setSelectedStaff(prev => prev.filter(s => s !== id));
        } else {
            setSelectedStaff(prev => [...prev, id]);
        }
    };

    const renderWelcome = () => (
        <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
            <div className="w-20 h-20 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-cyan-500/20">
                <Users className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">You shouldn't have to work alone, {user.displayName.split(' ')[0]}.</h1>
            <p className="text-slate-400 text-lg max-w-md mx-auto mb-8 leading-relaxed">
                Most artists fail because they have no team. Sound Merge gives you a full staff to handle the business while you create.
            </p>
            <div className="flex flex-col items-center gap-4">
                <button 
                    onClick={() => setStep('role')}
                    className="bg-white text-slate-900 px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto shadow-xl"
                >
                    Hire My Team <ArrowRight className="w-5 h-5" />
                </button>
                <button 
                    onClick={onDismiss}
                    className="text-slate-500 hover:text-white text-sm font-medium transition-colors"
                >
                    Skip Setup
                </button>
            </div>
        </div>
    );

    const renderRole = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Who are you?</h2>
            <p className="text-slate-400 text-center mb-8">We'll tailor your staff's expertise to your role.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {[
                    { id: 'artist', label: 'Artist / Vocalist', icon: Mic2, desc: 'I need marketing, booking, and distribution.' },
                    { id: 'producer', label: 'Producer / Writer', icon: Music, desc: 'I need sync deals, legal, and placement agents.' },
                ].map((option) => (
                    <button
                        key={option.id}
                        onClick={() => {
                            setRole(option.id as any);
                            setStep('staff');
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

    const renderStaffSelection = () => (
        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Select your Initial Staff</h2>
            <p className="text-slate-400 text-center mb-8">You can message them anytime in your Staff Inbox.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-10">
                {[
                    { id: 'mgr', label: 'Strategy Manager', icon: Briefcase, color: 'text-white' },
                    { id: 'mkt', label: 'Marketing Lead', icon: Zap, color: 'text-cyan-400' },
                    { id: 'bkg', label: 'Booking Agent', icon: Globe, color: 'text-purple-400' },
                    { id: 'dst', label: 'Head of Distro', icon: Radio, color: 'text-green-400' },
                    { id: 'lgl', label: 'IP / Legal Officer', icon: Shield, color: 'text-red-400' },
                ].map((staff) => {
                    const isSelected = selectedStaff.includes(staff.id);
                    return (
                        <button
                            key={staff.id}
                            onClick={() => toggleStaff(staff.id)}
                            className={`p-6 rounded-2xl flex flex-col items-center gap-4 border-2 transition-all ${
                                isSelected 
                                ? 'bg-cyan-500/10 border-cyan-500 text-white' 
                                : 'bg-slate-800 border-transparent text-slate-400 hover:bg-slate-700'
                            }`}
                        >
                            <div className={`p-4 bg-slate-950 rounded-full ${staff.color}`}>
                                <staff.icon className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-sm">{staff.label}</span>
                            {isSelected && <div className="absolute top-3 right-3"><CheckCircle2 className="w-5 h-5 text-cyan-500" /></div>}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col items-center gap-4">
                <button 
                    onClick={() => setStep('processing')}
                    disabled={selectedStaff.length === 0}
                    className="w-full max-w-xs bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-4 rounded-full font-bold text-lg shadow-lg transition-all disabled:opacity-50"
                >
                    Finalize Contracts
                </button>
                <button onClick={() => setStep('role')} className="text-slate-500 hover:text-white text-sm">Back</button>
            </div>
        </div>
    );

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

    return (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-5xl">
                {step === 'welcome' && renderWelcome()}
                {step === 'role' && renderRole()}
                {step === 'staff' && renderStaffSelection()}
                {step === 'processing' && renderProcessing()}
            </div>
        </div>
    );
};
