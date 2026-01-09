import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MoreHorizontal, Bot, User, Phone, Video, Info, CheckCheck, Loader2, Sparkles, Briefcase, Zap, Shield, Globe, Mic, Users, BrainCircuit, ArrowRight, TrendingUp, AlertTriangle, Layers, MessageSquare } from 'lucide-react';
import { AiStaffMember, StaffMessage, StaffProposal } from '../types';
import { chatWithGemini, generateProactiveProposal } from '../services/geminiService';
import { MOCK_STATS } from '../constants';
import { authService } from '../services/authService';

const TEAM_HUB_AGENT: AiStaffMember = { 
    id: 'team-hub', 
    name: 'Team Hub', 
    role: 'Group Sync' as any, 
    avatar: 'https://ui-avatars.com/api/?name=Team+HQ&background=0f172a&color=fff', 
    online: true, 
    description: 'Unified Strategic HQ', 
    lastMessage: 'Let\'s align on the game plan.' 
};

const INITIAL_STAFF: AiStaffMember[] = [
    TEAM_HUB_AGENT,
    { id: 'mgr', name: 'James', role: 'manager', avatar: 'https://ui-avatars.com/api/?name=James+Manager&background=020617&color=fff', online: true, description: 'Executive Strategy & Business Coordination', lastMessage: "Let's review your Q3 plan." },
    { id: 'mkt', name: 'Elena', role: 'marketing', avatar: 'https://ui-avatars.com/api/?name=Elena+Mkt&background=06b6d4&color=fff', online: true, description: 'Growth, Socials & Hype', lastMessage: "Your TikTok engagement is up 20%!" },
    { id: 'bkg', name: 'Rick', role: 'booking', avatar: 'https://ui-avatars.com/api/?name=Rick+Agent&background=8b5cf6&color=fff', online: false, description: 'Shows, Tours & Negotiations', lastMessage: "Found 3 clubs in Berlin for October." },
    { id: 'dst', name: 'Sarah', role: 'distribution', avatar: 'https://ui-avatars.com/api/?name=Sarah+Dist&background=10b981&color=fff', online: true, description: 'Store Submissions & Metadata', lastMessage: "New single is live on Apple Music." },
    { id: 'lgl', name: 'Marcus', role: 'legal', avatar: 'https://ui-avatars.com/api/?name=Marcus+Legal&background=f43f5e&color=fff', online: true, description: 'Voice IP & Rights Protection', lastMessage: "Secured your latest VoiceShield hash." },
];

interface StaffMessagingHubProps {
    chatThreads: Record<string, StaffMessage[]>;
    setChatThreads: React.Dispatch<React.SetStateAction<Record<string, StaffMessage[]>>>;
}

export const StaffMessagingHub: React.FC<StaffMessagingHubProps> = ({ chatThreads, setChatThreads }) => {
    const user = authService.getCurrentUser();
    const [selectedAgent, setSelectedAgent] = useState<AiStaffMember>(INITIAL_STAFF[0]);
    const [proposals, setProposals] = useState<StaffProposal[]>([]);
    const [isThinking, setIsThinking] = useState(false);
    const [activeTypingAgents, setActiveTypingAgents] = useState<string[]>([]);
    
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [chatThreads, selectedAgent.id]);

    // Proactive Intelligence
    useEffect(() => {
        const interval = setInterval(async () => {
            if (isThinking) return;
            setIsThinking(true);
            const prop = await generateProactiveProposal({
                currentView: 'staff',
                stats: MOCK_STATS,
                opportunities: [],
                user: user || undefined,
                agentRole: selectedAgent.id === 'team-hub' ? 'Team Hub' : selectedAgent.role
            });
            if (prop) setProposals(prev => [prop, ...prev].slice(0, 5));
            setIsThinking(false);
        }, 45000);
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

        // Simulation logic for Team Hub: multiple agents "analyzing"
        if (selectedAgent.id === 'team-hub') {
            setActiveTypingAgents(['James (Manager)', 'Elena (Marketing)']);
            setTimeout(() => setActiveTypingAgents(['Marcus (Legal)']), 1500);
        }

        try {
            const history = currentThread.map(m => ({ role: m.role === 'user' ? 'user' : 'model', text: m.text }));
            const response = await chatWithGemini(input, history, {
                currentView: 'staff',
                stats: MOCK_STATS,
                opportunities: [],
                user: user || undefined,
                agentRole: selectedAgent.id === 'team-hub' ? 'Team Hub' : selectedAgent.role
            });

            const agentMsg: StaffMessage = {
                id: (Date.now() + 1).toString(),
                agentId: selectedAgent.id,
                role: 'agent',
                text: response,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setChatThreads(prev => ({ ...prev, [selectedAgent.id]: [...(prev[selectedAgent.id] || []), agentMsg] }));
        } catch (e) { console.error(e); } finally { 
            setIsTyping(false); 
            setActiveTypingAgents([]);
        }
    };

    const handleAcceptProposal = (prop: StaffProposal) => {
        const acceptanceMsg: StaffMessage = {
            id: `accept_${Date.now()}`,
            agentId: selectedAgent.id,
            role: 'agent',
            text: `PROPOSAL ACCEPTED: ${prop.title}. I'm executing the ${prop.actionLabel} workflow now.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setChatThreads(prev => ({ ...prev, [selectedAgent.id]: [...(prev[selectedAgent.id] || []), acceptanceMsg] }));
        setProposals(prev => prev.filter(p => p.id !== prop.id));
    };

    const currentMessages = chatThreads[selectedAgent.id] || [];

    return (
        <div className="h-[calc(100vh-120px)] flex bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl font-sans">
            
            {/* LEFT: TEAM LIST */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50 dark:bg-slate-900/30">
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                        <Users className="w-6 h-6 text-indigo-500" /> Team Hub
                    </h2>
                    {isThinking && (
                        <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest animate-pulse">
                            <BrainCircuit className="w-3 h-3" /> Staff Context Sync
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
                                <div className={`w-12 h-12 rounded-full border-2 overflow-hidden ${selectedAgent.id === agent.id ? 'border-white/20' : 'border-slate-200 dark:border-slate-800'}`}>
                                    <img src={agent.avatar} className="w-full h-full object-cover" alt={agent.name} />
                                </div>
                                {agent.online && agent.id !== 'team-hub' && (
                                    <span className="absolute bottom-0 right-0 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-slate-900"></span>
                                    </span>
                                )}
                            </div>
                            <div className="text-left min-w-0 flex-1">
                                <span className={`font-black text-sm uppercase truncate block ${selectedAgent.id === agent.id ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{agent.name}</span>
                                <p className={`text-[9px] font-black uppercase tracking-widest ${selectedAgent.id === agent.id ? 'text-indigo-200' : 'text-indigo-500'}`}>{agent.role}</p>
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
                        <img src={selectedAgent.avatar} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm" alt={selectedAgent.name} />
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center gap-2 uppercase tracking-tight">
                                {selectedAgent.name}
                                <span className="bg-indigo-500/10 text-indigo-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{selectedAgent.role}</span>
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">{selectedAgent.description}</p>
                        </div>
                    </div>
                    {selectedAgent.id === 'team-hub' && (
                        <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest">Collaborative Mode</span>
                        </div>
                    )}
                </div>

                {/* Messages Feed */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/20 dark:bg-slate-950/50 custom-scrollbar">
                    {currentMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[75%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                {selectedAgent.id === 'team-hub' && msg.role === 'agent' && (
                                    <span className="text-[9px] font-black uppercase text-slate-500 mb-1 ml-1">Team Ledger Consensus</span>
                                )}
                                <div className={`px-5 py-3.5 rounded-[1.8rem] text-sm shadow-xl relative ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800'}`}>
                                    <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                                    <div className={`flex items-center gap-2 text-[8px] mt-2 font-black uppercase tracking-widest opacity-30 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <span>{msg.timestamp}</span>
                                        {msg.role === 'user' && <CheckCheck className="w-3 h-3" />}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex flex-col gap-2">
                            {activeTypingAgents.length > 0 ? (
                                activeTypingAgents.map(name => (
                                    <div key={name} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 italic">
                                        <Loader2 className="w-3 h-3 animate-spin" /> {name} is reviewing...
                                    </div>
                                ))
                            ) : (
                                <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 shadow-sm w-fit">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                                    </div>
                                </div>
                            )}
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
                                placeholder={selectedAgent.id === 'team-hub' ? "Brief the entire staff..." : `Strategy session with ${selectedAgent.name}...`}
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
                        <Zap className="w-4 h-4 text-yellow-500" /> Game Plan
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Status: Active Synthesis</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {proposals.length === 0 ? (
                        <div className="text-center py-12 px-6">
                            <BrainCircuit className="w-8 h-8 text-slate-700 mx-auto mb-3 opacity-20" />
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Analyzing ledger signals for strategic pivots...</p>
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
                </div>
            </div>
        </div>
    );
};