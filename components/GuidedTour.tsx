
import React, { useState, useEffect } from 'react';
import { 
    Sparkles, ArrowRight, X, Bot, Music, Briefcase, 
    Globe, Users, Zap, CheckCircle2, Trophy 
} from 'lucide-react';
import { VIEWS } from '../constants';

interface GuidedTourProps {
    onComplete: () => void;
    onNavigate: (view: string) => void;
}

interface Mission {
    id: number;
    title: string;
    description: string;
    view: string;
    icon: any;
    color: string;
}

const MISSIONS: Mission[] = [
    { 
        id: 1, 
        title: "Forge Your Signature Sound", 
        description: "Welcome! Your first objective is the AI Studio. Here, you'll use our neural engines to create radio-ready tracks from simple ideas.", 
        view: VIEWS.STUDIO, 
        icon: Music, 
        color: "text-purple-400" 
    },
    { 
        id: 2, 
        title: "Develop Visual Identity", 
        description: "Great music needs a visual world. We're going to the Brand Builder to generate cinematic promo videos and cover art using your training photos.", 
        view: VIEWS.BRAND, 
        icon: Briefcase, 
        color: "text-cyan-400" 
    },
    { 
        id: 3, 
        title: "Deploy to Global Stores", 
        description: "It's time to go live. Our AI agents automate the distribution process to 150+ stores while you keep 100% ownership.", 
        view: VIEWS.DISTRIBUTION, 
        icon: Globe, 
        color: "text-green-400" 
    },
    { 
        id: 4, 
        title: "Meet Your AI Staff", 
        description: "Finally, let's head to the Hub. Your assigned AI staff members are ready to handle strategy, marketing, and legal while you focus on creating.", 
        view: VIEWS.STAFF, 
        icon: Users, 
        color: "text-indigo-400" 
    }
];

export const GuidedTour: React.FC<GuidedTourProps> = ({ onComplete, onNavigate }) => {
    const [currentMission, setCurrentMission] = useState(0);
    const [showOverview, setShowOverview] = useState(true);

    const mission = MISSIONS[currentMission];

    const nextMission = () => {
        if (currentMission < MISSIONS.length - 1) {
            setCurrentMission(prev => prev + 1);
            onNavigate(MISSIONS[currentMission + 1].view);
        } else {
            onComplete();
        }
    };

    if (showOverview) {
        return (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
                <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-[3rem] p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Trophy className="w-64 h-64 text-cyan-500" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-cyan-500/20">
                            <Bot className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-4 italic">The Artist Mission</h2>
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                            Welcome to Sound Merge. I am your Executive AI Strategist. Your institutional infrastructure is ready. Let's walk through your first global release cycle.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-12">
                            {MISSIONS.map(m => (
                                <div key={m.id} className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                    <div className={`p-2 bg-slate-900 rounded-lg ${m.color}`}><m.icon className="w-4 h-4" /></div>
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-tight">{m.title}</span>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => { setShowOverview(false); onNavigate(MISSIONS[0].view); }}
                            className="bg-white text-slate-950 px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl flex items-center gap-3 mx-auto"
                        >
                            Initialize Mission <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[150] w-full max-w-xl animate-in slide-in-from-bottom-10 duration-500">
            <div className="bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative overflow-hidden">
                <button onClick={onComplete} className="absolute top-4 right-6 text-slate-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                
                <div className="flex items-start gap-6">
                    <div className="relative shrink-0">
                        <div className="w-14 h-14 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Bot className="w-8 h-8 text-slate-950" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"></div>
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Active Mission {currentMission + 1}/4</span>
                            <div className="h-1 flex-1 bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${((currentMission + 1) / MISSIONS.length) * 100}%` }}></div>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">{mission.title}</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-6">
                            {mission.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                            <button onClick={onComplete} className="text-[10px] font-black uppercase text-slate-600 hover:text-slate-400 transition-colors">Skip Tutorial</button>
                            <button 
                                onClick={nextMission}
                                className="bg-cyan-500 text-slate-950 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/10"
                            >
                                {currentMission === MISSIONS.length - 1 ? 'Finish Mission' : 'Next Objective'} <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
