
import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MoreHorizontal, Bot, User, Phone, Video, Info, CheckCheck, Loader2, Sparkles, Briefcase, Zap, Shield, Globe, Mic, Users } from 'lucide-react';
import { AiStaffMember, StaffMessage } from '../types';
import { chatWithGemini } from '../services/geminiService';
import { MOCK_STATS } from '../constants';

const INITIAL_STAFF: AiStaffMember[] = [
    { id: 'mgr', name: 'James', role: 'manager', avatar: 'https://ui-avatars.com/api/?name=James+Manager&background=020617&color=fff', online: true, description: 'Executive Strategy & Business Coordination', lastMessage: "Let's review your Q3 plan." },
    { id: 'mkt', name: 'Elena', role: 'marketing', avatar: 'https://ui-avatars.com/api/?name=Elena+Mkt&background=06b6d4&color=fff', online: true, description: 'Growth, Socials & Hype', lastMessage: "Your TikTok engagement is up 20%!" },
    { id: 'bkg', name: 'Rick', role: 'booking', avatar: 'https://ui-avatars.com/api/?name=Rick+Agent&background=8b5cf6&color=fff', online: false, description: 'Shows, Tours & Negotiations', lastMessage: "Found 3 clubs in Berlin for October." },
    { id: 'dst', name: 'Sarah', role: 'distribution', avatar: 'https://ui-avatars.com/api/?name=Sarah+Dist&background=10b981&color=fff', online: true, description: 'Store Submissions & Metadata', lastMessage: "New single is live on Apple Music." },
    { id: 'lgl', name: 'Marcus', role: 'legal', avatar: 'https://ui-avatars.com/api/?name=Marcus+Legal&background=f43f5e&color=fff', online: true, description: 'Voice IP & Rights Protection', lastMessage: "Secured your latest VoiceShield hash." },
];

export const StaffMessagingHub: React.FC = () => {
    const [selectedAgent, setSelectedAgent] = useState<AiStaffMember>(INITIAL_STAFF[0]);
    const [chatThreads, setChatThreads] = useState<Record<string, StaffMessage[]>>({
        mgr: [{ id: '1', agentId: 'mgr', role: 'agent', text: "Hey! I've been reviewing your stats. Your reputation score is rising. Ready to talk Q3 strategy?", timestamp: '10:00 AM' }],
        mkt: [{ id: '2', agentId: 'mkt', role: 'agent', text: "I just finished the ad campaign draft for your next single. Want to see the visuals?", timestamp: '9:45 AM' }],
    });
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [chatThreads, selectedAgent.id]);

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

    const currentMessages = chatThreads[selectedAgent.id] || [];

    return (
        <div className="h-[calc(100vh-120px)] flex bg-white dark:bg-slate-950 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
            
            {/* LEFT: INBOX LIST */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-slate-50 dark:bg-slate-900/30">
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3 uppercase tracking-tight">
                        <Users className="w-6 h-6 text-indigo-500" /> Staff
                    </h2>
                    <div className="relative mt-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            placeholder="Find agent..."
                            className="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                        />
                    </div>
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

            {/* RIGHT: CHAT WINDOW */}
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
        </div>
    );
};
