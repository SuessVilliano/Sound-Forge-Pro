
import React, { useState } from 'react';
import { 
    Sparkles, ArrowRight, X, Bot, Music, Briefcase, 
    Globe, Users, Zap, CheckCircle2, Trophy, BarChart3, Building2, Layout
} from 'lucide-react';
import { VIEWS } from '../constants';
import { User } from '../types';

const ICON_MAP: Record<string, any> = {
    Music, Briefcase, Globe, Users, BarChart3, Layout, Building2
};

interface GuidedTourProps {
    user: User;
    onComplete: () => void;
    onNavigate: (view: string) => void;
}

interface Mission {
    id: number;
    title: string;
    description: string;
    view: string;
    icon: string;
    color: string;
}

const ARTIST_MISSIONS: Mission[] = [
    {
        id: 1,
        title: "Create with AI Studio",
        description: "Generate radio-ready tracks using 5 AI engines: Udio, Suno, MusicGPT, Mureka, and AIMusic. Costs 5 credits per generation.",
        view: VIEWS.STUDIO,
        icon: 'Music',
        color: "text-purple-500 dark:text-purple-400"
    },
    {
        id: 2,
        title: "Build Your Brand",
        description: "Create cover art and promo videos with Gemini Image and Veo 3.1. Generate cinematic lip-sync content with Kling AI.",
        view: VIEWS.BRAND,
        icon: 'Briefcase',
        color: "text-cyan-600 dark:text-cyan-400"
    },
    {
        id: 3,
        title: "Distribute via DistroKid",
        description: "Export DistroKid-ready metadata with auto-generated ISRC/UPC codes. Copy-paste directly to 150+ streaming platforms.",
        view: VIEWS.DISTRIBUTION,
        icon: 'Globe',
        color: "text-green-600 dark:text-green-400"
    },
    {
        id: 4,
        title: "Meet Your AI Staff",
        description: "Your Gemini-powered team: Manager for strategy, Marketing for growth, Distribution for metadata, and Legal for IP protection.",
        view: VIEWS.STAFF,
        icon: 'Users',
        color: "text-indigo-600 dark:text-indigo-400"
    }
];

const LABEL_MISSIONS: Mission[] = [
    {
        id: 1,
        title: "A&R Dashboard",
        description: "Discover trending sounds and identify roster gaps. Access sync opportunities across 8 platforms with payouts up to $100K.",
        view: VIEWS.AR_DASHBOARD,
        icon: 'BarChart3',
        color: "text-red-500 dark:text-red-400"
    },
    {
        id: 2,
        title: "Scale Artist Brands",
        description: "Generate bulk marketing assets with Gemini Image and Veo 3.1. Create consistent visual identity across your roster.",
        view: VIEWS.BRAND,
        icon: 'Layout',
        color: "text-cyan-600 dark:text-cyan-400"
    },
    {
        id: 3,
        title: "Multi-Artist Distribution",
        description: "DistroKid-compatible exports with auto-generated ISRC/UPC for all roster artists. Bulk metadata management.",
        view: VIEWS.DISTRIBUTION,
        icon: 'Building2',
        color: "text-indigo-600 dark:text-indigo-400"
    },
    {
        id: 4,
        title: "AI Staff Delegation",
        description: "2,500 credits/month on Label plan. Assign AI agents to each artist for 24/7 marketing, legal, and strategy support.",
        view: VIEWS.STAFF,
        icon: 'Users',
        color: "text-green-600 dark:text-green-400"
    }
];

export const GuidedTour: React.FC<GuidedTourProps> = ({ user, onComplete, onNavigate }) => {
    const [currentMission, setCurrentMission] = useState(0);
    const [showOverview, setShowOverview] = useState(true);

    const activeMissions = user.role === 'label_exec' ? LABEL_MISSIONS : ARTIST_MISSIONS;
    const mission = activeMissions[currentMission];

    const nextMission = () => {
        if (currentMission < activeMissions.length - 1) {
            setCurrentMission(prev => prev + 1);
            onNavigate(activeMissions[currentMission + 1].view);
        } else {
            onComplete();
        }
    };

    if (showOverview) {
        return (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-950/80 dark:bg-black/95 backdrop-blur-xl animate-in fade-in duration-500">
                <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] p-12 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                        <Trophy className="w-64 h-64 text-cyan-500" />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-cyan-500/20">
                            <Bot className="w-10 h-10 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 italic">
                            {user.role === 'label_exec' ? 'The Executive Mission' : 'The Artist Mission'}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg mb-10 leading-relaxed font-medium">
                            Welcome to Sound Forge Pro v3.0. Your AI-powered music creation and distribution platform is ready. Let's explore the core features.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-12">
                            {activeMissions.map(m => {
                                const IconComponent = ICON_MAP[m.icon];
                                return (
                                    <div key={m.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className={`p-2 bg-white dark:bg-slate-900 rounded-lg shadow-sm ${m.color}`}>
                                            {IconComponent && <IconComponent className="w-4 h-4" />}
                                        </div>
                                        <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">{m.title}</span>
                                    </div>
                                );
                            })}
                        </div>

                        <button 
                            onClick={() => { setShowOverview(false); onNavigate(activeMissions[0].view); }}
                            className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-10 py-5 rounded-full font-black uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl flex items-center gap-3 mx-auto"
                        >
                            Initialize Mission <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const MissionIcon = ICON_MAP[mission.icon];

    return (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[150] w-full max-w-xl animate-in slide-in-from-bottom-10 duration-500 px-6">
            <div className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-2xl border border-cyan-500/30 rounded-[2.5rem] p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden">
                <button onClick={onComplete} className="absolute top-4 right-6 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                
                <div className="flex items-start gap-6">
                    <div className="relative shrink-0">
                        <div className="w-14 h-14 bg-cyan-600 dark:bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                            <Bot className="w-8 h-8 text-white dark:text-slate-950" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Objective {currentMission + 1}/4</span>
                            <div className="h-1 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-cyan-500 transition-all duration-500" style={{ width: `${((currentMission + 1) / activeMissions.length) * 100}%` }}></div>
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{mission.title}</h3>
                        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 font-medium">
                            {mission.description}
                        </p>
                        
                        <div className="flex justify-between items-center">
                            <button onClick={onComplete} className="text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 dark:hover:text-slate-400 transition-colors">Skip Tutorial</button>
                            <button 
                                onClick={nextMission}
                                className="bg-cyan-600 dark:bg-cyan-500 text-white dark:text-slate-950 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-cyan-500/10"
                            >
                                {currentMission === activeMissions.length - 1 ? 'Finish Mission' : 'Next Objective'} <ArrowRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
