
import React from 'react';
import { 
    Music, Wand2, Mic, Disc, Zap, Briefcase, Swords, Radio, 
    DollarSign, MapPin, Mail, Landmark, Wallet, BarChart2, Star, 
    Vote, Activity, Lock, CheckCircle2, ChevronRight, Sparkles, LayoutGrid, Globe
} from 'lucide-react';
import { NAVIGATION_ITEMS, VIEWS } from '../constants';
import { authService } from '../services/authService';
import { Stats } from '../types';

interface AllToolsViewProps {
    stats: Stats;
    onNavigate: (view: string) => void;
    onUpgrade: () => void;
}

const CATEGORIES = [
    { id: 'creative', label: 'Creative Forge', icon: Wand2, color: 'text-purple-500' },
    { id: 'business', label: 'Business Hub', icon: Briefcase, color: 'text-blue-500' },
    { id: 'protection', label: 'Rights Protection', icon: Zap, color: 'text-cyan-500' },
    { id: 'growth', label: 'Global Growth', icon: Globe, color: 'text-green-500' },
];

const ICON_MAP: Record<string, any> = {
  Music, Wand2, Mic, Disc, Zap, Briefcase, Swords, Radio, 
  DollarSign, MapPin, Mail, Landmark, Wallet, BarChart2, Star, 
  Vote, Activity, Grid: LayoutGrid
};

export const AllToolsView: React.FC<AllToolsViewProps> = ({ stats, onNavigate, onUpgrade }) => {
    const user = authService.getCurrentUser();
    
    const checkMilestone = (milestone: string) => {
        if (milestone === 'always' || milestone === 'core') return { locked: false };
        
        const xp = stats.xp;
        const isPro = user?.plan !== 'free';

        switch(milestone) {
            case 'first_asset': return { locked: xp <= 0, reason: 'Requires First Asset', action: VIEWS.STUDIO, label: 'Forge Your First Track' };
            case 'reputation_500': return { locked: xp < 500, reason: 'Requires Level 2 (500 XP)', action: VIEWS.STUDIO, label: 'Earn XP in Studio' };
            case 'reputation_1000': return { locked: xp < 1000, reason: 'Requires Level 3 (1000 XP)', action: VIEWS.CATALOG, label: 'Promote Catalog' };
            case 'reputation_2000': return { locked: xp < 2000 && !isPro, reason: 'Requires Level 4 or Pro', action: VIEWS.BATTLES, label: 'Compete for Reputation' };
            case 'pro_only': return { locked: !isPro, reason: 'Requires Artist Pro Plan', action: 'upgrade', label: 'Unlock Pro' };
            default: return { locked: false };
        }
    };

    const categorizedTools = {
        creative: NAVIGATION_ITEMS.filter(t => [VIEWS.STUDIO, VIEWS.MASTERING, VIEWS.MY_MUSIC].includes(t.id)),
        // Fixed: Renamed VIEWS.FUNDING to VIEWS.ADVANCES
        business: NAVIGATION_ITEMS.filter(t => [VIEWS.CRM, VIEWS.ADVANCES, VIEWS.SMART_WALLET, VIEWS.AFFILIATES].includes(t.id)),
        protection: NAVIGATION_ITEMS.filter(t => [VIEWS.VOICE, VIEWS.DAO, VIEWS.MONITORING].includes(t.id)),
        growth: NAVIGATION_ITEMS.filter(t => [VIEWS.OPPORTUNITIES, VIEWS.BRAND, VIEWS.BATTLES, VIEWS.DISTRIBUTION, VIEWS.TOURING, VIEWS.ANALYTICS, VIEWS.AR_DASHBOARD].includes(t.id)),
    };

    return (
        <div className="space-y-12 pb-24 animate-in fade-in duration-700">
            <div className="max-w-3xl">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-4">Discovery Lab</h1>
                <p className="text-slate-500 dark:text-slate-400 text-lg font-medium leading-relaxed">
                    The complete Sound Merge architectural suite. Unlocked nodes are ready for immediate deployment; locked assets require institutional reputation or membership upgrades.
                </p>
            </div>

            {Object.entries(categorizedTools).map(([catKey, tools]) => (
                <div key={catKey} className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                        <div className="p-2 bg-indigo-500/10 dark:bg-cyan-500/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-indigo-500 dark:text-cyan-400" />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest italic">{catKey} Node Cluster</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.map(tool => {
                            const { locked, reason, action, label } = checkMilestone(tool.milestone);
                            const IconComponent = ICON_MAP[tool.icon] || Music;
                            
                            return (
                                <div 
                                    key={tool.id} 
                                    className={`relative bg-white dark:bg-slate-900 rounded-[2.5rem] border p-8 transition-all group overflow-hidden ${
                                        locked 
                                        ? 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50' 
                                        : 'border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/5 cursor-pointer'
                                    }`}
                                    onClick={() => !locked ? onNavigate(tool.id) : null}
                                >
                                    {locked && (
                                        <div className="absolute top-4 right-4 z-20">
                                            <div className="bg-slate-800/80 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 border border-white/10">
                                                <Lock className="w-3 h-3 text-slate-400" />
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{reason}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-col h-full">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${
                                            locked ? 'bg-slate-100 dark:bg-slate-800 text-slate-500' : 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white shadow-inner'
                                        }`}>
                                            <IconComponent className="w-7 h-7" />
                                        </div>

                                        <h3 className={`text-xl font-black uppercase tracking-tight mb-2 italic ${locked ? 'text-slate-500' : 'text-slate-900 dark:text-white group-hover:text-cyan-500'}`}>
                                            {tool.label}
                                        </h3>
                                        
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium mb-12">
                                            {getToolDescription(tool.id)}
                                        </p>

                                        <div className="mt-auto flex justify-between items-center">
                                            {locked ? (
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (action === 'upgrade') onUpgrade();
                                                        else if (action) onNavigate(action);
                                                    }}
                                                    className="bg-indigo-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-500 transition-all flex items-center gap-2"
                                                >
                                                    {label} <ChevronRight className="w-3 h-3" />
                                                </button>
                                            ) : (
                                                <button className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] group-hover:scale-105 transition-transform shadow-lg">
                                                    Deploy Module
                                                </button>
                                            )}
                                            {!locked && tool.ai && (
                                                <span className="text-[8px] font-black uppercase text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">AI Synchronized</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

// Helper descriptions for the Lab
function getToolDescription(view: string): string {
    const desc: Record<string, string> = {
        [VIEWS.STUDIO]: "Multi-node neural music generation for lyrics, composition, and high-fidelity production.",
        [VIEWS.MASTERING]: "Institutional-grade AI audio post-production and LUFS optimization for global stores.",
        [VIEWS.MY_MUSIC]: "Your private ledger of all forged assets, masters, and on-chain registrations.",
        [VIEWS.CRM]: "Automated fan registry and unified messaging node for SMS, Email, and WhatsApp.",
        // Fixed: Renamed VIEWS.FUNDING to VIEWS.ADVANCES
        [VIEWS.ADVANCES]: "Access non-recourse capital advances based on your verified catalog performance.",
        [VIEWS.SMART_WALLET]: "Institutional digital account for managing rights liquidity and royalty settlements.",
        [VIEWS.AFFILIATES]: "Expand your network and earn recurring revenue through professional partnerships.",
        [VIEWS.VOICE]: "Biometric vocal fingerprinting and on-chain ID protection against unauthorized clones.",
        [VIEWS.DAO]: "Participate in ecosystem governance and vote on platform development protocols.",
        [VIEWS.OPPORTUNITIES]: "Direct synchronization with global sync briefs from film, games, and advertising.",
        [VIEWS.BRAND]: "Neural visual engines for hyper-realistic promo videos and social marketing assets.",
        [VIEWS.BATTLES]: "Identity-verified arena for competitive benchmarking and reputation yield.",
        [VIEWS.DISTRIBUTION]: "Deploy assets to 150+ global stores while maintaining 100% rights ownership.",
        [VIEWS.TOURING]: "AI venue discovery and routing engine for global live performance deployments.",
        [VIEWS.ANALYTICS]: "Consolidated real-time industry signals from all major platform ledgers.",
        [VIEWS.AR_DASHBOARD]: "Institutional trend spotting and talent identification via global Billboard nodes."
    };
    return desc[view] || "Advanced music industry operational module.";
}
