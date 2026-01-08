
import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MoreHorizontal, Bot, User, Phone, Video, Info, CheckCheck, Loader2, Sparkles, Briefcase, Zap, Shield, Globe, Mic, Users, BrainCircuit, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';
import { AiStaffMember, StaffMessage, StaffProposal } from '../types';
import { chatWithGemini, generateProactiveProposal } from '../services/geminiService';
import { MOCK_STATS } from '../constants';
import { authService } from '../services/authService';

const INITIAL_STAFF: AiStaffMember[] = [
    { id: 'mgr', name: 'James', role: 'manager', avatar: 'https://ui-avatars.com/api/?name=James+Manager&background=020617&color=fff', online: true, description: 'Executive Strategy & Business Coordination', lastMessage: "Let's review your Q3 plan." },
    { id: 'mkt', name: 'Elena', role: 'marketing', avatar: 'https://ui-avatars.com/api/?name=Elena+Mkt&background=06b6d4&color=fff', online: true, description: 'Growth, Socials & Hype', lastMessage: "Your TikTok engagement is up 20%!" },
    { id: 'bkg', name: 'Rick', role: 'booking', avatar: 'https://ui-avatars.com/api/?name=Rick+Agent&background=8b5cf6&color=fff', online: false, description: 'Shows, Tours & Negotiations', lastMessage: "Found 3 clubs in Berlin for October." },
    { id: 'dst', name: 'Sarah', role: 'distribution', avatar: 'https://ui-avatars.com/api/?name=Sarah+Dist&background=10b981&color=fff', online: true, description: 'Store Submissions & Metadata', lastMessage: "New single is live on Apple Music." },
    { id: 'lgl', name: 'Marcus', role: 'legal', avatar: 'https://ui-avatars.com/api/?name=Marcus+Legal&background=f43f5e&color=fff', online: true, description: 'Voice IP & Rights Protection', lastMessage: "Secured your latest VoiceShield hash." },
];

export const StaffMessagingHub: React.FC = () => {
    const user = authService.getCurrentUser();
    const [selectedAgent, setSelectedAgent] = useState<AiStaffMember>(INITIAL_STAFF[0]);
    const [proposals, setProposals] = useState<StaffProposal[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    
    const [chatThreads, setChatThreads] = useState<Record<string, StaffMessage[]>>({
        mgr: [{ id: '1', agentId: 'mgr', role: 'agent', text: "James here. I've analyzed your current growth. We're leaning too heavily on organic search. I'm drafting a proposal to shift your target to Sync Licensing for H2.", timestamp: '10:00 AM' }],
        mkt: [{ id: '2', agentId: 'mkt', role: 'agent', text: "Elena from Marketing. Your latest track 'Midnight' has a 4-second hook that is perfect for a transition trend. I'm suggesting a 3nd-party ad-spend test.", timestamp: '9:45 AM' }],
    });
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [chatThreads, selectedAgent.id]);

    // Proactive Intelligence: Trigger a proposal every few seconds or on mount
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isThinking) return;
            setIsThinking(true);
            const prop = await generateProactiveProposal({
                currentView: 'staff',
                stats: MOCK_STATS,
                opportunities: [],
                user: user || undefined,
                agentRole: selectedAgent.role
            });
            if (prop) setProposals(prev => [prop, ...prev].slice(0, 5));
            setIsThinking(false);
        }, 30000); // Check for strategy gap every 30s
        return () => clearInterval(interval);
    }, [selectedAgent, user]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isTyping) return;

        const userMsg: StaffMessage = {
            id: Date.now().toString(),
            agentId: selectedAgent.id,
            role: 'user',
            text: input,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const currentThread = chatThreads[selectedAgent.id] || [];
        setChatThreads({ ...chatThreads, [selectedAgent.id]: [...currentThread, userMsg] });
        setInput('');
        setIsTyping(true);

        try {
            const history = currentThread.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
            const response = await chatWithGemini(input, history, {
                currentView: 'staff',
                stats: MOCK_STATS,
                opportunities: [],
                user: user || undefined,
                agentRole: selectedAgent.role
            });

            const agentMsg: StaffMessage = {
                id: (Date.now() + 1).toString(),
                agentId: selectedAgent.id,
                role: 'agent',
                text: response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatThreads(prev => ({ ...prev, [selectedAgent.id]: [...(prev[selectedAgent.id] || []), agentMsg] }));
        } catch (e) { console.error(e); } finally { setIsTyping(false); }
    };

    const handleAcceptProposal = (prop: StaffProposal) => {
        const acceptanceMsg: StaffMessage = {
            id: `accept_${Date.now()}`,
            agentId: selectedAgent.id,
            role: 'agent',
            text: `PROPOSAL ACCEPTED: ${prop.title}. I'm executing the ${prop.actionLabel} workflow now. Check your Sync Ops tab in 5 minutes for the results.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatThreads(prev => ({ ...prev, [selectedAgent.id]: [...(prev[selectedAgent.id] || []), acceptanceMsg] }));
        setProposals(prev => prev.filter(p => p.id !== prop.id));
    };

    const currentMessages = chatThreads[selectedAgent.id] || [];

    return (
        <div className="h-[calc(100vh-120px)] flex bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            
            {/* LEFT: INBOX LIST */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50 dark:bg-slate-900/30">
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                        <Users className="w-6 h-6 text-indigo-500" /> Team
                    </h2>
                    {isThinking && (
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">
                            <BrainCircuit className="w-3 h-3" /> Proactive Analysis Active
                        </div>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                    {INITIAL_STAFF.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${selectedAgent.id === agent.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'hover:bg-slate-200/50 dark:hover:bg-slate-800/50'}`}
                        >
                            <div className="relative shrink-0">
                                <img src={agent.avatar} className="w-12 h-12 rounded-full border-2 border-white/10" alt={agent.name} />
                                {agent.online && (
                                    <span className="absolute bottom-0 right-0 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-slate-900"></span>
                                    </span>
                                )}
                            </div>
                            <div className="text-left min-w-0 flex-1">
                                <div className="flex justify-between items-start">
                                    <span className={`font-black text-sm uppercase truncate ${selectedAgent.id === agent.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{agent.name}</span>
                                </div>
                                <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${selectedAgent.id === agent.id ? 'text-indigo-200' : 'text-indigo-500'}`}>{agent.role}</p>
                                <p className={`text-xs truncate ${selectedAgent.id === agent.id ? 'text-white/70' : 'text-slate-500'}`}>{agent.lastMessage}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* CENTER: CHAT WINDOW */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative">
                
                {/* Chat Header */}
                <div className="h-20 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between bg-white dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <img src={selectedAgent.avatar} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm" alt={selectedAgent.name} />
                            {selectedAgent.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></span>}
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2 uppercase tracking-tight">
                                {selectedAgent.name}
                                <span className="bg-indigo-500/10 text-indigo-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{selectedAgent.role}</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">{selectedAgent.description}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><Phone className="w-5 h-5" /></button>
                        <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><Video className="w-5 h-5" /></button>
                        <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors"><Info className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20 dark:bg-slate-950/50 custom-scrollbar">
                    {currentMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[70%] rounded-3xl p-5 text-sm shadow-xl relative ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800'}`}>
                                <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                                <div className={`flex items-center gap-2 text-[10px] mt-3 font-bold uppercase tracking-widest opacity-40 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <span>{msg.timestamp}</span>
                                    {msg.role === 'user' && <CheckCheck className="w-3 h-3" />}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl rounded-tl-none p-4 flex items-center gap-2 shadow-sm">
                                <div className="flex gap-1">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Tray */}
                <div className="p-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                    <form onSubmit={handleSend} className="relative flex items-center gap-4">
                        <button type="button" className="p-3 text-slate-400 hover:text-indigo-500 transition-colors"><Mic className="w-6 h-6" /></button>
                        <div className="flex-1 relative">
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder={`Collaborate with ${selectedAgent.name}...`}
                                className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl py-4 pl-6 pr-14 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all shadow-inner"
                            />
                            <button 
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg disabled:opacity-50"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* RIGHT: STRATEGY & PROPOSALS */}
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50 dark:bg-slate-900/30">
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" /> Proposals
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Goal: Sync Placement</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {proposals.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <BrainCircuit className="w-8 h-8 text-slate-700 mx-auto mb-3 opacity-20" />
                            <p className="text-xs text-slate-500 font-medium">Your team is analyzing the landscape for proactive moves...</p>
                        </div>
                    ) : (
                        proposals.map(prop => (
                            <div key={prop.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm animate-in zoom-in-95">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                                        prop.type === 'opportunity' ? 'bg-green-500/10 text-green-500' :
                                        prop.type === 'warning' ? 'bg-red-500/10 text-red-500' :
                                        'bg-blue-500/10 text-blue-500'
                                    }`}>
                                        {prop.type}
                                    </span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase">{prop.impact} impact</span>
                                </div>
                                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">{prop.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed mb-4">{prop.description}</p>
                                <button 
                                    onClick={() => handleAcceptProposal(prop)}
                                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {prop.actionLabel} <ArrowRight className="w-3 h-3" />
                                </button>
                            </div>
                        ))
                    )}

                    {/* Proactive Signal Heatmap Placeholder */}
                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 mt-8">
                         <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-4 h-4 text-cyan-400" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Market Alignment</span>
                         </div>
                         <div className="space-y-3">
                            {[
                                { label: 'Vibe Match', val: '92%' },
                                { label: 'Release Lead', val: '14 Days' },
                                { label: 'IP Safety', val: 'Critical' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-600 font-bold">{s.label}</span>
                                    <span className={`text-[10px] font-mono ${s.val === 'Critical' ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`}>{s.val}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
