
import React, { useState, useEffect, useMemo } from 'react';
// Added Database to the lucide-react imports to fix missing name error on line 503
import { 
    Zap, Search, Plus, Filter, ArrowUpDown, Globe, Mail, 
    FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight,
    TrendingUp, Shield, Clock, Trash2, Sliders, ChevronRight, X, Sparkles, Send, Music,
    RefreshCw, Target, Heart, Play, Database
} from 'lucide-react';
import { SyncBrief, OpportunityRequest, BriefArtifacts, User, BriefSource, MediaType, Track } from '../types';
import { dataService } from '../services/dataService';
import { parseBriefToSchema, generateBriefArtifacts } from '../services/geminiService';
import { authService } from '../services/authService';
import { usePlayer } from '../contexts/PlayerContext';

export const OpportunitiesView: React.FC = () => {
    const [briefs, setBriefs] = useState<SyncBrief[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [selectedBrief, setSelectedBrief] = useState<SyncBrief | null>(null);
    const [briefArtifacts, setBriefArtifacts] = useState<BriefArtifacts | null>(null);
    const [isGeneratingArtifacts, setIsGeneratingArtifacts] = useState(false);
    
    // Catalog Matching
    const [myTracks, setMyTracks] = useState<Track[]>([]);
    const [isMatching, setIsMatching] = useState(false);
    const [matchedTracks, setMatchedTracks] = useState<(Track & { matchScore: number })[]>([]);

    // Filtering State
    const [showFilters, setShowFilters] = useState(false);
    const [activeSource, setActiveSource] = useState<string>('All');
    const [activeMediaType, setActiveMediaType] = useState<string>('All');

    // Intake State
    const [showIntake, setShowIntake] = useState(false);
    const [rawBriefText, setRawBriefText] = useState('');
    const [isParsing, setIsParsing] = useState(false);

    // Interest Form
    const [showInterestModal, setShowInterestModal] = useState(false);
    const [interestType, setInterestType] = useState<OpportunityRequest['type']>('I have a track to pitch');
    const [interestNotes, setInterestNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const user = authService.getCurrentUser();
    const { playTrack } = usePlayer();

    useEffect(() => {
        loadData();
        if (user) {
            dataService.subscribeToTracks(user.uid, (tracks) => setMyTracks(tracks as any));
        }
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await dataService.getAllSyncBriefs();
        setBriefs(data);
        setLoading(false);
    };

    const handlePartnerSync = async () => {
        setIsSyncing(true);
        // Simulate high-fidelity multi-partner data ingestion
        await new Promise(r => setTimeout(r, 2000));
        await loadData();
        setIsSyncing(false);
        window.dispatchEvent(new CustomEvent('sf-notification', { 
            detail: { title: 'Nodes Synchronized', message: 'Ingested 4 new briefs from Songtradr and DittoString.', type: 'success' } 
        }));
    };

    const filteredBriefs = useMemo(() => {
        return briefs.filter(b => {
            const sourceMatch = activeSource === 'All' || b.source === activeSource;
            const mediaMatch = activeMediaType === 'All' || b.mediaType === activeMediaType;
            return sourceMatch && mediaMatch;
        });
    }, [briefs, activeSource, activeMediaType]);

    const handleSelectBrief = async (brief: SyncBrief) => {
        setSelectedBrief(brief);
        setBriefArtifacts(null);
        setMatchedTracks([]);
        setIsGeneratingArtifacts(true);
        
        try {
            // Parallel execution: AI Artifacts + Catalog Matching
            const artifactsPromise = generateBriefArtifacts(brief);
            
            // Simulation of a sophisticated catalog match logic
            setIsMatching(true);
            await new Promise(r => setTimeout(r, 1000));
            const scored = myTracks.map(t => ({
                ...t,
                matchScore: Math.floor(60 + Math.random() * 35) // In prod, this would be a vector similarity check
            })).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
            
            const artifacts = await artifactsPromise;
            setBriefArtifacts(artifacts);
            setMatchedTracks(scored);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingArtifacts(false);
            setIsMatching(false);
        }
    };

    const handleParseIntake = async () => {
        if (!rawBriefText.trim()) return;
        setIsParsing(true);
        try {
            const parsed = await parseBriefToSchema(rawBriefText);
            const newBrief: SyncBrief = {
                id: `sb_${Date.now()}`,
                source: 'UserSubmitted',
                title: parsed.title || 'Imported Brief',
                description: parsed.description || rawBriefText,
                mediaType: (parsed.mediaType as MediaType) || 'Other',
                deadline: parsed.deadline,
                budget: parsed.budget,
                requiredGenres: parsed.requiredGenres,
                moods: parsed.moods,
                tempo: parsed.tempo,
                vocal: parsed.vocal,
                references: parsed.references,
                deliverables: parsed.deliverables,
                usage: parsed.usage,
                territory: parsed.territory,
                createdAt: new Date().toISOString(),
                readinessScore: 75
            };
            await dataService.addSyncBrief(newBrief);
            setBriefs(prev => [newBrief, ...prev]);
            setShowIntake(false);
            setRawBriefText('');
            handleSelectBrief(newBrief);
        } catch (e) {
            alert("Failed to parse brief metadata.");
        } finally {
            setIsParsing(false);
        }
    };

    const handleSubmitInterest = async () => {
        if (!selectedBrief || !user) return;
        setIsSubmitting(true);
        try {
            const request: OpportunityRequest = {
                id: `req_${Date.now()}`,
                userId: user.uid,
                userEmail: user.email,
                userName: user.displayName,
                briefId: selectedBrief.id,
                briefTitle: selectedBrief.title,
                type: interestType,
                notes: interestNotes,
                status: 'pending',
                createdAt: new Date().toISOString()
            };
            await dataService.submitOpportunityRequest(request);
            setShowInterestModal(false);
            setInterestNotes('');
            alert("Interest secured. Our A&R team will contact you shortly.");
        } catch (e) {
            alert("Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const SOURCES: BriefSource[] = ["Songtradr", "DittoSync", "Horus", "EmailFeed", "UserSubmitted", "PartnerAPI"];
    const MEDIA_TYPES: MediaType[] = ["TV", "Film", "Ad", "Game", "Trailer", "Brand", "Other"];

    return (
        <div className="h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-500 overflow-hidden">
            
            {/* Header / Institutional Actions */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] shadow-sm gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight italic">
                        <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Opportunity Ledger
                    </h1>
                    <p className="text-slate-500 text-xs mt-1 font-medium">Institutional Sync Feed & Production Intelligence.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button 
                        onClick={handlePartnerSync}
                        disabled={isSyncing}
                        className="flex-1 md:flex-none px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-slate-200 dark:hover:bg-slate-700"
                    >
                        {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4 text-cyan-500" />}
                        Sync Partners
                    </button>
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex-1 md:flex-none px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border ${showFilters ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500'}`}
                    >
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button 
                        onClick={() => setShowIntake(true)}
                        className="flex-1 md:flex-none bg-slate-950 dark:bg-white text-white dark:text-slate-900 px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-cyan-600/10"
                    >
                        <Plus className="w-4 h-4" /> Add Brief
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2rem] animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Filter by Source Node</label>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setActiveSource('All')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${activeSource === 'All' ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border-transparent hover:border-slate-800'}`}>All Sources</button>
                                {SOURCES.map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setActiveSource(s)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${activeSource === s ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border-transparent hover:border-slate-800'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">Media Placement Hierarchy</label>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setActiveMediaType('All')} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${activeMediaType === 'All' ? 'bg-cyan-600 text-slate-950 border-cyan-500' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border-transparent hover:border-slate-800'}`}>All Media</button>
                                {MEDIA_TYPES.map(m => (
                                    <button 
                                        key={m} 
                                        onClick={() => setActiveMediaType(m)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all border ${activeMediaType === m ? 'bg-cyan-600 text-slate-950 border-cyan-500' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border-transparent hover:border-slate-800'}`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Split Pane View */}
            <div className="flex-1 flex gap-6 overflow-hidden">
                
                {/* Left: Brief Stream */}
                <div className="w-[480px] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 pb-12">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                            <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing Global Briefs...</span>
                        </div>
                    ) : filteredBriefs.length === 0 ? (
                        <div className="text-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
                            No briefs match your active node filters.
                        </div>
                    ) : (
                        filteredBriefs.map(brief => (
                            <button
                                key={brief.id}
                                onClick={() => handleSelectBrief(brief)}
                                className={`w-full text-left p-8 rounded-[2.5rem] border transition-all relative group overflow-hidden ${
                                    selectedBrief?.id === brief.id 
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-2xl shadow-indigo-600/20' 
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 shadow-sm'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                                            selectedBrief?.id === brief.id ? 'bg-white/20 text-white border-white/20' : 'bg-slate-100 dark:bg-slate-950 text-slate-500 border-slate-200 dark:border-slate-800'
                                        }`}>
                                            {brief.source}
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-60 italic">{brief.mediaType}</span>
                                    </div>
                                    <div className={`text-right ${selectedBrief?.id === brief.id ? 'text-white' : 'text-cyan-500'} font-black text-base italic`}>
                                        {brief.readinessScore || '65'}% <span className="text-[8px] opacity-60 uppercase not-italic tracking-widest">Match</span>
                                    </div>
                                </div>
                                <h3 className={`font-black text-xl mb-3 leading-none uppercase tracking-tight italic group-hover:underline ${selectedBrief?.id === brief.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{brief.title}</h3>
                                <p className={`text-xs line-clamp-2 leading-relaxed font-medium mb-6 ${selectedBrief?.id === brief.id ? 'text-indigo-100' : 'text-slate-500'}`}>{brief.description}</p>
                                
                                <div className="flex items-center justify-between border-t pt-5 border-black/10 dark:border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3.5 h-3.5 opacity-60" />
                                        <span className="text-[10px] font-black uppercase tracking-tighter opacity-70">
                                            {brief.deadline ? `Due ${new Date(brief.deadline).toLocaleDateString()}` : 'Rolling Intake'}
                                        </span>
                                    </div>
                                    <div className="font-mono text-xs font-black uppercase">
                                        {brief.budget ? `${brief.budget.currency}${brief.budget.max.toLocaleString()}` : 'Inquire for Split'}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Right: Workspace & Intelligence */}
                <div className="flex-1 bg-white dark:bg-slate-950 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-inner mb-12">
                    {selectedBrief ? (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            {/* Technical Header */}
                            <div className="p-10 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-950/50">
                                <div className="flex justify-between items-start mb-10">
                                    <div className="max-w-3xl">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="px-4 py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-yellow-500/20 shadow-sm animate-pulse">
                                                High Yield placement
                                            </div>
                                            <span className="text-slate-500 text-[10px] font-mono font-bold">SHA-256: {selectedBrief.id.slice(-12)}</span>
                                        </div>
                                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none mb-4">{selectedBrief.title}</h2>
                                        <p className="text-slate-500 font-medium italic leading-relaxed">"{selectedBrief.description}"</p>
                                    </div>
                                    <button 
                                        onClick={() => setShowInterestModal(true)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all shadow-2xl shadow-indigo-600/20 flex items-center gap-3 hover:scale-105 active:scale-95"
                                    >
                                        Execute Intent <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                                    {[
                                        { label: 'Deployment Channel', value: selectedBrief.mediaType },
                                        { label: 'Budget Cap', value: selectedBrief.budget ? `${selectedBrief.budget.currency}${selectedBrief.budget.max.toLocaleString()}` : 'Variable', color: 'text-green-500' },
                                        { label: 'Tempo Constraint', value: selectedBrief.tempo || 'Open Format' },
                                        { label: 'Node Readiness', value: `${selectedBrief.readinessScore || '65'}%`, color: 'text-cyan-400' }
                                    ].map((stat, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
                                            <div className={`text-lg font-black uppercase tracking-tight italic ${stat.color || 'text-slate-900 dark:text-white'}`}>{stat.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Intelligence Stream */}
                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
                                
                                {isGeneratingArtifacts ? (
                                    <div className="flex flex-col items-center justify-center py-24 text-slate-500 gap-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full border-4 border-slate-200 dark:border-slate-800 border-t-indigo-500 animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles className="w-8 h-8 text-indigo-500 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic mb-2">Neural Analyst Active</h4>
                                            <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-slate-500">Generating Production Blueprint...</p>
                                        </div>
                                    </div>
                                ) : briefArtifacts ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4 duration-500">
                                        
                                        {/* Production Intelligence Pack */}
                                        <div className="bg-slate-950 rounded-[2.5rem] border border-slate-800 p-8 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                                                <Target className="w-48 h-48 text-indigo-400" />
                                            </div>
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Neural Blueprint v2.5</h4>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                <div className="bg-white/5 p-6 rounded-2xl border border-white/5">
                                                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-2 tracking-widest">Arrangement Arc</span>
                                                    <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{briefArtifacts.productionPromptPack?.arrangement}"</p>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-6">
                                                    <div>
                                                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">Target Vibe</span>
                                                        <p className="text-base font-black text-white uppercase tracking-tight">{briefArtifacts.productionPromptPack?.mood}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-black text-slate-500 uppercase block mb-1 tracking-widest">BPM / Metric</span>
                                                        <p className="text-base font-black text-white font-mono">{briefArtifacts.productionPromptPack?.tempo}</p>
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <span className="text-[9px] font-black text-slate-500 uppercase block mb-3 tracking-widest">Technical Constraints (Must Include)</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {briefArtifacts.productionPromptPack?.keywordsInclude.map((k, i) => (
                                                            <span key={i} className="px-3 py-1.5 bg-white/5 text-indigo-300 text-[10px] font-black uppercase rounded-xl border border-white/5 transition-all hover:bg-white/10">{k}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <button 
                                                    className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                                                    onClick={() => {
                                                        const blueprint = `PRODUCTION BLUEPRINT: ${briefArtifacts.productionPromptPack?.mood} ${briefArtifacts.productionPromptPack?.genre}. Arrangement: ${briefArtifacts.productionPromptPack?.arrangement}. Instruments: ${briefArtifacts.productionPromptPack?.instruments.join(', ')}. Keywords: ${briefArtifacts.productionPromptPack?.keywordsInclude.join(', ')}`;
                                                        navigator.clipboard.writeText(blueprint);
                                                        window.dispatchEvent(new CustomEvent('sf-notification', { detail: { title: 'Blueprint Copied', message: 'Ready for insertion into AI Studio Node.', type: 'success' } }));
                                                    }}
                                                >
                                                    Inject into Studio Node
                                                </button>
                                            </div>
                                        </div>

                                        {/* Pitch Readiness Checklist */}
                                        <div className="space-y-8 animate-in slide-in-from-right-4">
                                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-8 flex items-center gap-3">
                                                    <CheckCircle2 className="w-5 h-5 text-green-500" /> Pitch Deliverables Node
                                                </h4>
                                                <div className="space-y-8">
                                                    <div className="space-y-4">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-black/5 dark:border-white/5 pb-2 block">Technical Requirements</span>
                                                        {briefArtifacts.pitchChecklist?.technical.map((item, i) => (
                                                            <div key={i} className="flex items-start gap-4">
                                                                <div className="w-5 h-5 rounded-lg border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center mt-0.5 bg-white dark:bg-slate-950 shrink-0"></div>
                                                                <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="space-y-4">
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-black/5 dark:border-white/5 pb-2 block">Institutional Rights Compliance</span>
                                                        {briefArtifacts.pitchChecklist?.legal.map((item, i) => (
                                                            <div key={i} className="flex items-start gap-4">
                                                                <Shield className="w-5 h-5 text-slate-300 dark:text-slate-700 shrink-0" />
                                                                <span className="text-sm text-slate-500 dark:text-slate-500 italic font-medium">{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Catalog Match Section */}
                                            <div className="bg-cyan-500/5 dark:bg-cyan-500/10 rounded-[2.5rem] border border-cyan-500/20 p-8 shadow-inner">
                                                <div className="flex items-center justify-between mb-8">
                                                    <h4 className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest flex items-center gap-3">
                                                        <Target className="w-5 h-5" /> Catalog Suggestions
                                                    </h4>
                                                    <span className="text-[9px] font-black uppercase text-cyan-500/60 bg-cyan-500/5 px-3 py-1 rounded-full border border-cyan-500/10">Neural Ranker active</span>
                                                </div>

                                                {isMatching ? (
                                                    <div className="flex items-center justify-center py-10 gap-3 text-cyan-500">
                                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Scanning Ledger Assets...</span>
                                                    </div>
                                                ) : matchedTracks.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {matchedTracks.map(track => (
                                                            <div key={track.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between group hover:border-cyan-500/50 transition-all shadow-sm">
                                                                <div className="flex items-center gap-4 min-w-0">
                                                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                                                                        <img src={track.image} className="w-full h-full object-cover" alt={track.title} />
                                                                        <button 
                                                                            onClick={() => playTrack(track)}
                                                                            className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        >
                                                                            <Play className="w-6 h-6 text-white fill-white" />
                                                                        </button>
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <h5 className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{track.title}</h5>
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest italic">{track.artist}</span>
                                                                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                                                                            <span className="text-cyan-500 font-black text-[10px]">{track.matchScore}% Match</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <button 
                                                                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-cyan-500 hover:bg-cyan-500/10 rounded-xl transition-all"
                                                                    onClick={() => {
                                                                        setInterestNotes(`I'm pitching my track "${track.title}" which has a ${track.matchScore}% neural match with this brief.`);
                                                                        setInterestType('I have a track to pitch');
                                                                        setShowInterestModal(true);
                                                                    }}
                                                                >
                                                                    <Send className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-10 text-slate-500 italic text-sm font-medium">
                                                        No direct catalog matches found. <br/> Initialize a Studio Session to forge a response.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-24 text-center text-slate-500 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-900 rounded-[4rem] max-w-2xl mx-auto opacity-40">
                                        <Database className="w-16 h-16 mb-6" />
                                        <h3 className="text-2xl font-black uppercase tracking-widest italic mb-2">Idle Workspace</h3>
                                        <p className="text-sm font-medium max-w-xs mx-auto">Select a brief from the institutional ledger to initialize production intelligence.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-20 animate-in fade-in">
                             <div className="w-40 h-40 bg-slate-50 dark:bg-slate-900 rounded-[3rem] flex items-center justify-center mb-10 opacity-30 shadow-inner">
                                <Globe className="w-16 h-16 text-slate-400" />
                             </div>
                             <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">Selection Required</h2>
                             <p className="text-slate-500 max-w-md mx-auto text-lg leading-relaxed font-medium">
                                Browse the global opportunity ledger and select an entry to synchronize requirements and generate custom blueprints.
                             </p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            {showIntake && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-xl animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] w-full max-w-2xl p-12 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                            <Plus className="w-64 h-64 text-cyan-400" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Intake Terminal</h3>
                                <button onClick={() => setShowIntake(false)} className="text-slate-400 hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 p-3 rounded-full"><X className="w-8 h-8" /></button>
                            </div>
                            <p className="text-slate-500 text-lg mb-8 font-medium leading-relaxed italic">
                                Paste a sync brief link or raw email text below. Our AI supervisor will normalize the data into a technical ledger entry and calculate node readiness.
                            </p>
                            <textarea
                                value={rawBriefText}
                                onChange={(e) => setRawBriefText(e.target.value)}
                                placeholder="Paste raw brief text or institutional URL..."
                                className="w-full h-80 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 text-slate-900 dark:text-white focus:ring-4 focus:ring-cyan-500/10 outline-none transition-all resize-none shadow-inner text-lg font-medium"
                            />
                            <div className="flex gap-6 mt-10">
                                <button 
                                    onClick={handleParseIntake}
                                    disabled={isParsing || !rawBriefText.trim()}
                                    className="flex-1 py-6 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.2em] rounded-3xl transition-all shadow-2xl shadow-cyan-600/20 flex items-center justify-center gap-4 hover:scale-[1.01] active:scale-95 disabled:opacity-30"
                                >
                                    {isParsing ? <><RefreshCw className="w-6 h-6 animate-spin" /> Normalizing Node Data...</> : <><Sparkles className="w-6 h-6" /> Execute AI Ingestion</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showInterestModal && selectedBrief && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3rem] w-full max-w-lg p-10 shadow-2xl relative">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/10 rounded-full blur-[80px] pointer-events-none"></div>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tighter italic">Register Intent</h3>
                        <p className="text-slate-500 text-sm mb-8 font-medium">Securing a slot for: <span className="text-indigo-500 font-black">{selectedBrief.title}</span></p>
                        
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block border-b border-slate-100 dark:border-slate-800 pb-2 ml-1">Request Type</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {["I have a track to pitch", "I want to generate a track from this brief", "I need help clearing rights"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setInterestType(t as any)}
                                            className={`text-left px-5 py-3.5 rounded-2xl border transition-all text-xs font-black uppercase tracking-tight ${
                                                interestType === t 
                                                ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/20' 
                                                : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-700'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block border-b border-slate-100 dark:border-slate-800 pb-2 ml-1">Operational Context</label>
                                <textarea
                                    value={interestNotes}
                                    onChange={(e) => setInterestNotes(e.target.value)}
                                    placeholder="Provide track links or technical context for the A&R node..."
                                    className="w-full h-36 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-5 text-sm text-slate-900 dark:text-white focus:border-indigo-500 outline-none transition-all font-medium"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowInterestModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black uppercase tracking-widest text-[10px] rounded-2xl">Cancel</button>
                                <button 
                                    onClick={handleSubmitInterest}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Finalize Request</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
