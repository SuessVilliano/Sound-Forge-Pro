import React, { useState, useRef, useEffect } from 'react';
// Added Activity to the lucide-react imports to fix missing name error
import { Send, Search, MoreHorizontal, Bot, User, Phone, Video, Info, CheckCheck, Loader2, Sparkles, Briefcase, Zap, Shield, Globe, Mic, Users, BrainCircuit, ArrowRight, TrendingUp, AlertTriangle, Layers, MessageSquare, Activity } from 'lucide-react';
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

    // Added currentMessages variable to fix the missing name error
    const currentMessages = chatThreads[selectedAgent.id] || [];

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

        if (selectedAgent.id === 'team-hub') {
            setActiveTypingAgents(['James (Manager)', 'Elena (Marketing)']);
            setTimeout(() => setActiveTypingAgents(['Marcus (Legal)']), 1200);
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

    return (
        <div className="h-[calc(100vh-120px)] flex bg-slate-950 rounded-[3rem] border border-white/5 overflow-hidden shadow-2xl font-sans relative">
            {/* Background Grain/Noise */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
            
            {/* LEFT: ROSTER LIST */}
            <div className="w-80 border-r border-white/5 flex flex-col shrink-0 bg-slate-900/50 backdrop-blur-3xl z-10">
                <div className="p-8 border-b border-white/5 bg-slate-950/40">
                    <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tighter italic">
                        <Users className="w-6 h-6 text-indigo-500" /> War Room
                    </h2>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-cyan-500 uppercase tracking-widest">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></div>
                        Neural Grid: Linked
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    {INITIAL_STAFF.map(agent => (
                        <button
                            key={agent.id}
                            onClick={() => setSelectedAgent(agent)}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${selectedAgent.id === agent.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'hover:bg-white/5'}`}
                        >
                            <div className="relative shrink-0">
                                <div className={`w-12 h-12 rounded-2xl border-2 transition-all duration-500 overflow-hidden ${selectedAgent.id === agent.id ? 'border-white/20' : 'border-white/5'}`}>
                                    <img src={agent.avatar} className="w-full h-full object-cover" alt={agent.name} />
                                </div>
                                {agent.online && (
                                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-slate-900"></span>
                                    </span>
                                )}
                            </div>
                            <div className="text-left min-w-0 flex-1">
                                <span className={`font-black text-sm uppercase truncate block ${selectedAgent.id === agent.id ? 'text-white' : 'text-slate-200'}`}>{agent.name}</span>
                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${selectedAgent.id === agent.id ? 'text-indigo-200' : 'text-slate-500'}`}>{agent.role}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* CENTER: INTERFACE */}
            <div className="flex-1 flex flex-col bg-slate-950 relative z-10">
                <div className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-slate-900/40 backdrop-blur-2xl">
                    <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-white text-lg flex items-center gap-2 uppercase tracking-tighter italic">
                                {selectedAgent.name}
                                <span className="bg-indigo-500/10 text-indigo-400 text-[8px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-widest border border-indigo-500/20">Operational</span>
                            </h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{selectedAgent.description}</p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-[radial-gradient(circle_at_top,_rgba(79,70,229,0.05),_transparent)]">
                    {currentMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-500`}>
                            <div className={`max-w-[70%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`px-6 py-4 rounded-[2rem] text-sm shadow-2xl relative border ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-500' : 'bg-slate-900 text-slate-200 rounded-tl-none border-white/5'}`}>
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
                        <div className="flex flex-col gap-3">
                            {activeTypingAgents.length > 0 ? (
                                activeTypingAgents.map(name => (
                                    <div key={name} className="flex items-center gap-3 text-[10px] font-black uppercase text-cyan-500 italic animate-pulse">
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> {name} analyzing ledger...
                                    </div>
                                ))
                            ) : (
                                <div className="bg-slate-900 border border-white/5 rounded-2xl rounded-tl-none p-4 flex items-center gap-2 shadow-xl w-fit">
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-300"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-8 bg-slate-950 border-t border-white/5">
                    <form onSubmit={handleSend} className="relative flex items-center gap-4 bg-slate-900/50 p-2 rounded-[2rem] border border-white/5 shadow-inner">
                        <button type="button" className="p-4 text-slate-500 hover:text-indigo-400 transition-colors"><Mic className="w-6 h-6" /></button>
                        <input 
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder={`Strategy session with ${selectedAgent.name.toUpperCase()}...`}
                            className="flex-1 bg-transparent border-none py-4 text-sm text-white focus:ring-0 outline-none font-bold placeholder:text-slate-700"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isTyping}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-[1.5rem] transition-all shadow-xl disabled:opacity-30"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* RIGHT: LIVE SIGNAL FEED */}
            <div className="w-80 border-l border-white/5 flex flex-col shrink-0 bg-slate-900/30 backdrop-blur-3xl z-10 p-8 space-y-10">
                <div>
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-400" /> Pulse signals
                    </h3>
                    <div className="space-y-6">
                        {[
                            { label: 'Network Latency', val: '12ms', color: 'text-green-500' },
                            { label: 'Reputation yield', val: '+5.2%', color: 'text-cyan-400' },
                            { label: 'Store Sync', val: '152 Nodes', color: 'text-slate-300' }
                        ].map((stat, i) => (
                            <div key={i}>
                                <div className="text-[9px] font-black text-slate-600 uppercase mb-1">{stat.label}</div>
                                <div className={`text-xl font-black font-mono italic ${stat.color}`}>{stat.val}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                     <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Active Strategy</h3>
                     <div className="bg-indigo-600/10 border border-indigo-500/20 p-5 rounded-[2rem] shadow-inner group cursor-pointer hover:bg-indigo-600/20 transition-all">
                         <div className="flex items-center gap-2 mb-3">
                             <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                             <span className="text-[9px] font-black uppercase text-indigo-400">Node Optimized</span>
                         </div>
                         <p className="text-[11px] text-slate-300 leading-relaxed font-bold italic">"Expand H2 focus to Sync Licensing for High-Fidelity Electronic tracks."</p>
                         <button className="mt-4 flex items-center gap-2 text-[9px] font-black uppercase text-indigo-400 group-hover:gap-4 transition-all">Accept Strategy <ArrowRight className="w-3 h-3"/></button>
                     </div>
                </div>

                <div className="mt-auto">
                    <div className="p-4 bg-slate-950 border border-white/5 rounded-2xl">
                         <div className="flex items-center gap-3 mb-2">
                             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                             <span className="text-[8px] font-black text-white uppercase tracking-widest">Mainnet Synchronized</span>
                         </div>
                         <p className="text-[8px] font-bold text-slate-600 font-mono">NODE_HASH: sf_940_p_rev2</p>
                    </div>
                </div>
            </div>
        </div>
    );
};