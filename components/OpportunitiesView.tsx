

import React, { useState, useEffect, useMemo } from 'react';
import { 
    Zap, Search, Plus, Filter, ArrowUpDown, Globe, Mail, 
    FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight,
    TrendingUp, Shield, Clock, Trash2, Sliders, ChevronRight, X, Sparkles, Send, Music
} from 'lucide-react';
/* Updated imports for missing types */
import { SyncBrief, OpportunityRequest, BriefArtifacts, User, BriefSource, MediaType } from '../types';
import { dataService } from '../services/dataService';
import { parseBriefToSchema, generateBriefArtifacts } from '../services/geminiService';
import { authService } from '../services/authService';

export const OpportunitiesView: React.FC = () => {
    const [briefs, setBriefs] = useState<SyncBrief[]>([]);
    const [requests, setRequests] = useState<OpportunityRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBrief, setSelectedBrief] = useState<SyncBrief | null>(null);
    const [briefArtifacts, setBriefArtifacts] = useState<BriefArtifacts | null>(null);
    const [isGeneratingArtifacts, setIsGeneratingArtifacts] = useState(false);
    
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

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        // dataService.getAllSyncBriefs now implemented in dataService.ts
        const data = await dataService.getAllSyncBriefs();
        setBriefs(data);
        setLoading(false);
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
        setIsGeneratingArtifacts(true);
        try {
            const artifacts = await generateBriefArtifacts(brief);
            setBriefArtifacts(artifacts);
        } catch (e) {
            console.error(e);
        } finally {
            setIsGeneratingArtifacts(false);
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
                // Added missing SyncBrief properties
                requiredGenres: parsed.requiredGenres,
                moods: parsed.moods,
                tempo: parsed.tempo,
                vocal: parsed.vocal,
                references: parsed.references,
                deliverables: parsed.deliverables,
                usage: parsed.usage,
                territory: parsed.territory,
                createdAt: new Date().toISOString(),
                readinessScore: 70
            };
            // dataService.addSyncBrief now implemented in dataService.ts
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
            // dataService.submitOpportunityRequest now implemented in dataService.ts
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
        <div className="h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-500">
            
            {/* Header / Actions */}
            <div className="flex justify-between items-center mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                        <Zap className="w-6 h-6 text-yellow-500 fill-yellow-500" /> Professional Opportunities
                    </h1>
                    <p className="text-slate-500 text-xs mt-1">Institutional Music Briefs & Sync Placements Feed.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowFilters(!showFilters)}
                        className={`px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all border ${showFilters ? 'bg-cyan-500/10 border-cyan-500 text-cyan-600 dark:text-cyan-400' : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-500 hover:text-white'}`}
                    >
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <button 
                        onClick={() => setShowIntake(true)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/20"
                    >
                        <Plus className="w-4 h-4" /> Add Opportunity
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Filter by Source</label>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setActiveSource('All')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSource === 'All' ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>All Sources</button>
                                {SOURCES.map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => setActiveSource(s)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeSource === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-3">Media Placement</label>
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setActiveMediaType('All')} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeMediaType === 'All' ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>All Media</button>
                                {MEDIA_TYPES.map(m => (
                                    <button 
                                        key={m} 
                                        onClick={() => setActiveMediaType(m)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeMediaType === m ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
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
                
                {/* Left: Feed */}
                <div className="w-[450px] flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <span className="text-xs font-bold uppercase tracking-widest">Syncing Global Briefs...</span>
                        </div>
                    ) : filteredBriefs.length === 0 ? (
                        <div className="text-center p-12 text-slate-500 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                            No briefs match your active filters.
                        </div>
                    ) : (
                        filteredBriefs.map(brief => (
                            <button
                                key={brief.id}
                                onClick={() => handleSelectBrief(brief)}
                                className={`w-full text-left p-6 rounded-2xl border transition-all relative group overflow-hidden ${
                                    selectedBrief?.id === brief.id 
                                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-600/20' 
                                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-500'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                            selectedBrief?.id === brief.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                        }`}>
                                            {brief.source}
                                        </span>
                                        <span className="text-[10px] opacity-60">• {brief.mediaType}</span>
                                    </div>
                                    <div className={`text-right ${selectedBrief?.id === brief.id ? 'text-white' : 'text-green-500'} font-black text-sm`}>
                                        {brief.readinessScore}% <span className="text-[8px] opacity-60 uppercase">Match</span>
                                    </div>
                                </div>
                                <h3 className={`font-bold text-base mb-2 group-hover:underline ${selectedBrief?.id === brief.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{brief.title}</h3>
                                <p className={`text-xs line-clamp-2 leading-relaxed ${selectedBrief?.id === brief.id ? 'text-indigo-100' : 'text-slate-500'}`}>{brief.description}</p>
                                
                                <div className="mt-4 flex items-center justify-between border-t pt-4 border-black/10 dark:border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-3 h-3 opacity-60" />
                                        <span className="text-[10px] font-bold uppercase tracking-tighter opacity-70">
                                            {brief.deadline ? `Due ${new Date(brief.deadline).toLocaleDateString()}` : 'Rolling'}
                                        </span>
                                    </div>
                                    <div className="font-mono text-[10px] font-bold">
                                        {brief.budget ? `${brief.budget.currency}${brief.budget.max.toLocaleString()}` : 'Contact for budget'}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>

                {/* Right: Workspace */}
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden shadow-inner">
                    {selectedBrief ? (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            {/* Detailed Header */}
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="max-w-2xl">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="bg-yellow-500/10 text-yellow-500 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-yellow-500/20">High Priority Placement</span>
                                            <span className="text-slate-500 text-xs font-medium">Source ID: {selectedBrief.id}</span>
                                        </div>
                                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{selectedBrief.title}</h2>
                                    </div>
                                    <button 
                                        onClick={() => setShowInterestModal(true)}
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-2"
                                    >
                                        Submit Interest <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-4 gap-6">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Media Type</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedBrief.mediaType}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Budget High</div>
                                        <div className="text-sm font-bold text-green-500 font-mono">
                                            {selectedBrief.budget ? `${selectedBrief.budget.currency}${selectedBrief.budget.max.toLocaleString()}` : 'N/A'}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tempo Req</div>
                                        <div className="text-sm font-bold text-slate-900 dark:text-white">{selectedBrief.tempo || 'Open'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ready Score</div>
                                        <div className="text-sm font-bold text-cyan-400">{selectedBrief.readinessScore || '65'}%</div>
                                    </div>
                                </div>
                            </div>

                            {/* Artifact Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-10">
                                <section>
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <FileText className="w-4 h-4" /> Brief Description
                                    </h4>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl italic">
                                        "{selectedBrief.description}"
                                    </p>
                                </section>

                                {isGeneratingArtifacts ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin"></div>
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Sparkles className="w-6 h-6 text-cyan-500 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <h4 className="font-bold text-white">Gemini Production Analyst Active</h4>
                                            <p className="text-[10px] uppercase tracking-widest mt-1">Normalizing metadata & generating production blueprint...</p>
                                        </div>
                                    </div>
                                ) : briefArtifacts ? (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-4 duration-500">
                                        {/* Production Prompt Pack */}
                                        <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                                <Zap className="w-20 h-20 text-cyan-400" />
                                            </div>
                                            <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" /> AI Production Prompt Pack
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="bg-white/5 p-4 rounded-xl">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Arrangement Arc</span>
                                                    <p className="text-xs text-slate-300 leading-relaxed">{briefArtifacts.productionPromptPack?.arrangement}</p>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Target Mood</span>
                                                        <p className="text-xs font-bold text-white">{briefArtifacts.productionPromptPack?.mood}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-black text-slate-500 uppercase block mb-1">Tempo Range</span>
                                                        <p className="text-xs font-bold text-white">{briefArtifacts.productionPromptPack?.tempo}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <span className="text-[10px] font-black text-slate-500 uppercase block mb-2">Technical Keywords (Include)</span>
                                                    <div className="flex flex-wrap gap-2">
                                                        {briefArtifacts.productionPromptPack?.keywordsInclude.map((k, i) => (
                                                            <span key={i} className="px-2 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold rounded-lg border border-cyan-500/20">{k}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <button 
                                                    className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/10"
                                                    onClick={() => {
                                                        const technicalPrompt = `Mood: ${briefArtifacts.productionPromptPack?.mood}, Genre: ${briefArtifacts.productionPromptPack?.genre}, Instruments: ${briefArtifacts.productionPromptPack?.instruments.join(', ')}. ${briefArtifacts.productionPromptPack?.arrangement}`;
                                                        navigator.clipboard.writeText(technicalPrompt);
                                                        alert("Technical Prompt Copied to Clipboard. Paste in AI Studio.");
                                                    }}
                                                >
                                                    Copy Technical Blueprint
                                                </button>
                                            </div>
                                        </div>

                                        {/* Pitch Checklist */}
                                        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
                                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-green-500" /> Pitch Deliverables Checklist
                                            </h4>
                                            <div className="space-y-6">
                                                <div className="space-y-3">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-black/5 dark:border-white/5 pb-2">Technical Requirements</span>
                                                    {briefArtifacts.pitchChecklist?.technical.map((item, i) => (
                                                        <div key={i} className="flex items-start gap-3">
                                                            <div className="w-4 h-4 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center mt-0.5 bg-white dark:bg-slate-950"></div>
                                                            <span className="text-xs text-slate-600 dark:text-slate-400">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="space-y-3">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block border-b border-black/5 dark:border-white/5 pb-2">Legal Readiness</span>
                                                    {briefArtifacts.pitchChecklist?.legal.map((item, i) => (
                                                        <div key={i} className="flex items-start gap-3">
                                                            <Shield className="w-4 h-4 text-slate-300 shrink-0" />
                                                            <span className="text-xs text-slate-600 dark:text-slate-400">{item}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center text-slate-500 flex flex-col items-center">
                                        <Sliders className="w-10 h-10 opacity-20 mb-4" />
                                        <p className="text-sm">Click a brief to generate production intelligence.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                             <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 opacity-40">
                                <Music className="w-12 h-12 text-slate-400" />
                             </div>
                             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Select an Opportunity</h2>
                             <p className="text-slate-500 max-w-sm">Browse the institutional feed and select a placement opportunity to analyze requirements and generate production prompts.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODALS */}
            {showIntake && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Plus className="w-32 h-32 text-cyan-400" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Intake Terminal</h3>
                                <button onClick={() => setShowIntake(false)} className="text-slate-400 hover:text-white transition-colors"><X className="w-8 h-8" /></button>
                            </div>
                            <p className="text-slate-500 text-sm mb-6 font-medium leading-relaxed">
                                Paste a sync brief link or raw email text below. Our AI will normalize the data into a technical schema, calculate a readiness score, and generate a production blueprint.
                            </p>
                            <textarea
                                value={rawBriefText}
                                onChange={(e) => setRawBriefText(e.target.value)}
                                placeholder="Paste brief text or partner URL..."
                                className="w-full h-64 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-slate-900 dark:text-white focus:ring-2 focus:ring-cyan-500 outline-none transition-all resize-none shadow-inner"
                            />
                            <div className="flex gap-4 mt-8">
                                <button 
                                    onClick={handleParseIntake}
                                    disabled={isParsing || !rawBriefText.trim()}
                                    className="flex-1 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-2"
                                >
                                    {isParsing ? <><Loader2 className="w-5 h-5 animate-spin" /> Normalizing Data...</> : <><Sparkles className="w-5 h-5" /> Execute AI Normalization</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showInterestModal && selectedBrief && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] w-full max-w-lg p-8 shadow-2xl">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Submit Interest</h3>
                        <p className="text-slate-500 text-sm mb-6">Securing a slot for: <span className="text-indigo-500 font-bold">{selectedBrief.title}</span></p>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Action Request Type</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {["I have a track to pitch", "I want to generate a track from this brief", "I need help clearing rights"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setInterestType(t as any)}
                                            className={`text-left px-4 py-3 rounded-xl border transition-all text-xs font-bold ${
                                                interestType === t 
                                                ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                                                : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-700'
                                            }`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Additional Context / Track Links</label>
                                <textarea
                                    value={interestNotes}
                                    onChange={(e) => setInterestNotes(e.target.value)}
                                    placeholder="Add any specific notes for the A&R team..."
                                    className="w-full h-32 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm text-white focus:border-indigo-500 outline-none transition-all"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button onClick={() => setShowInterestModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl">Cancel</button>
                                <button 
                                    onClick={handleSubmitInterest}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Secure Request</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};
