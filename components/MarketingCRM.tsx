import React, { useState, useEffect, useRef } from 'react';
import { 
    Users, Send, TrendingUp, UserPlus, Search, Plus, Sparkles, 
    FileText, Settings, ArrowRight, CheckCircle2, Clock, Zap, 
    MessageSquare, BarChart, Filter, MoreHorizontal, Mail, Link, 
    AlertCircle, AlertTriangle, X, Smartphone, PlayCircle, StopCircle, RefreshCw, 
    Calendar, Inbox, Activity, ShieldCheck, Database, Layout, 
    Globe, Phone, MessageCircle, Cloud, Share2, Bot, Loader2, Server, Building2, MapPin, ChevronRight, ZapOff, Instagram, Facebook, LayoutGrid, Video
} from 'lucide-react';
import { crmService } from '../services/crmService';
import { authService } from '../services/authService';
import { searchAddresses, chatWithGemini } from '../services/geminiService';
import { CRMContact, CRMAutomaton, CRMCampaign, MessageThread, ChatMessage, User, CommunicationChannel } from '../types';
import { MOCK_STATS } from '../constants';

export const MarketingCRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'calendar' | 'automations' | 'contacts'>('inbox');
  const user = authService.getCurrentUser();
  const [isCoreActive, setIsCoreActive] = useState(!!user?.ghlIntegration?.ghlLocationId);
  const [loading, setLoading] = useState(false);
  const [showProvisioning, setShowProvisioning] = useState(false);

  // Data State
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [contacts, setContacts] = useState<CRMContact[]>([]);

  useEffect(() => {
      if (isCoreActive) {
          loadData();
      }
  }, [activeTab, isCoreActive]);

  const loadData = async () => {
      setLoading(true);
      try {
          if (activeTab === 'inbox') setThreads(await crmService.getThreads());
          if (activeTab === 'contacts') setContacts(await crmService.getContacts());
      } catch (e) {
          console.error("CRM Sync Error", e);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-500 overflow-hidden -m-8">
      
      {/* HEADER BAR */}
      <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-8">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                  <Server className="w-5 h-5 text-indigo-500" /> Sound Merge Hub
              </h2>
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl">
                  {[
                      { id: 'inbox', label: 'Matrix Inbox', icon: Inbox },
                      { id: 'calendar', label: 'Planner', icon: Calendar },
                      { id: 'contacts', label: 'Registry', icon: Users },
                      { id: 'automations', label: 'Workflows', icon: Zap },
                  ].map(tab => (
                      <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab.id ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}`}
                      >
                          <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                      </button>
                  ))}
              </div>
          </div>

          <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-green-500/10 rounded-full border border-green-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Core Synchronized</span>
              </div>
              {!isCoreActive && (
                  <button onClick={() => setShowProvisioning(true)} className="bg-cyan-600 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase">Init Hub</button>
              )}
          </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
          {loading ? (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-cyan-500" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Synchronizing Matrix...</span>
              </div>
          ) : null}

          {activeTab === 'inbox' ? (
              <InboxMatrix threads={threads} user={user} />
          ) : (
              <div className="p-12 flex flex-col items-center justify-center h-full text-slate-500">
                  <Zap className="w-16 h-16 mb-4 opacity-10" />
                  <p className="font-black uppercase text-xs tracking-widest">Module active in background</p>
              </div>
          )}
      </div>

      {showProvisioning && (
          <ProvisioningTerminal user={user} onClose={() => setShowProvisioning(false)} onSuccess={() => setIsCoreActive(true)} />
      )}
    </div>
  );
};

const InboxMatrix: React.FC<{ threads: MessageThread[], user: User | null }> = ({ threads, user }) => {
    const [selectedThread, setSelectedThread] = useState<MessageThread | null>(threads[0] || null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
    const [loadingMessages, setLoadingMessages] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (selectedThread) {
            fetchMessages();
            generateReplySuggestion();
        }
    }, [selectedThread]);

    const fetchMessages = async () => {
        if (!selectedThread) return;
        setLoadingMessages(true);
        const res = await crmService.getMessages(selectedThread.id);
        setMessages(res);
        setLoadingMessages(false);
        setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }), 100);
    };

    const generateReplySuggestion = async () => {
        if (!selectedThread || !user) return;
        setAiSuggestion(null);
        const lastMsg = selectedThread.lastMessageText;
        if (!lastMsg) return;

        const prompt = `The fan just said: "${lastMsg}". Give me a plain text, conversational reply suggestion from the artist. MAX 2 sentences. No markdown.`;
        const suggestion = await chatWithGemini(prompt, [], {
            currentView: 'inbox',
            stats: MOCK_STATS,
            opportunities: [],
            user: user,
            agentRole: 'manager'
        });
        setAiSuggestion(suggestion);
    };

    const handleSend = async () => {
        if (!selectedThread || !input.trim()) return;
        const msgText = input;
        setInput('');
        setIsTyping(true);
        const res = await crmService.sendMessage(selectedThread.id, msgText, selectedThread.channel);
        if (res.success) {
            await fetchMessages();
            setAiSuggestion(null);
        }
        setIsTyping(false);
    };

    const getChannelIcon = (channel: CommunicationChannel) => {
        switch(channel) {
            case 'whatsapp': return <MessageCircle className="w-3.5 h-3.5 text-green-500" />;
            case 'sms': return <Smartphone className="w-3.5 h-3.5 text-blue-500" />;
            case 'instagram': return <Instagram className="w-3.5 h-3.5 text-pink-500" />;
            case 'facebook': return <Facebook className="w-3.5 h-3.5 text-blue-600" />;
            case 'email': return <Mail className="w-3.5 h-3.5 text-purple-500" />;
            default: return <Globe className="w-3.5 h-3.5 text-slate-500" />;
        }
    };

    const getChannelHaloClass = (channel: CommunicationChannel) => {
        switch(channel) {
            case 'whatsapp': return 'border-green-500/50 shadow-green-500/20';
            case 'instagram': return 'border-pink-500/50 shadow-pink-500/20';
            case 'facebook': return 'border-blue-600/50 shadow-blue-600/20';
            case 'email': return 'border-purple-500/50 shadow-purple-500/20';
            case 'sms': return 'border-blue-400/50 shadow-blue-400/20';
            default: return 'border-slate-400/50 shadow-slate-400/20';
        }
    };

    return (
        <div className="flex h-full bg-slate-50 dark:bg-slate-950">
            {/* THREAD LIST */}
            <div className="w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input placeholder="Search Registry..." className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-xs" />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {threads.map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setSelectedThread(t)}
                            className={`w-full p-6 text-left border-b border-slate-100 dark:border-slate-800/50 transition-all group flex items-start gap-4 ${selectedThread?.id === t.id ? 'bg-indigo-500/5 dark:bg-indigo-500/10 border-l-4 border-l-indigo-600 dark:border-l-cyan-500' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border-2 relative transition-all ${getChannelHaloClass(t.channel)}`}>
                                <span className="font-black text-slate-900 dark:text-white uppercase">{t.contactName[0]}</span>
                                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    {getChannelIcon(t.channel)}
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-black text-sm uppercase truncate ${selectedThread?.id === t.id ? 'text-indigo-700 dark:text-cyan-400' : 'text-slate-900 dark:text-white'}`}>{t.contactName}</span>
                                    <span className="text-[9px] font-bold text-slate-400 font-mono">{new Date(t.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p className={`text-xs line-clamp-1 italic ${selectedThread?.id === t.id ? 'text-slate-600 dark:text-slate-300' : 'text-slate-500'}`}>{t.lastMessageText}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* CHAT PANE */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 relative">
                {selectedThread ? (
                    <>
                        <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between bg-white dark:bg-slate-900/80 backdrop-blur">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm flex items-center gap-2">
                                        {selectedThread.contactName} 
                                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[8px] border border-slate-200 dark:border-slate-700">{selectedThread.channel}</span>
                                    </h3>
                                    <span className="text-[10px] text-slate-500 font-mono">{selectedThread.contactId}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-all"><Phone className="w-4 h-4"/></button>
                                <button className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 hover:text-indigo-600 transition-all"><Video className="w-4 h-4"/></button>
                            </div>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar bg-slate-50 dark:bg-slate-950/50">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                                    <div className={`max-w-[70%] flex flex-col ${m.direction === 'outbound' ? 'items-end' : 'items-start'}`}>
                                        <div className={`px-6 py-4 rounded-[2rem] text-sm shadow-xl ${m.direction === 'outbound' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-800'}`}>
                                            <p className="leading-relaxed whitespace-pre-wrap font-medium">{m.body}</p>
                                        </div>
                                        <div className="mt-2 flex items-center gap-2 text-[9px] font-black uppercase text-slate-400 px-2 opacity-50">
                                            {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            {m.direction === 'outbound' && <CheckCircle2 className="w-3 h-3" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-end">
                                    <div className="bg-indigo-600/20 px-4 py-2 rounded-full border border-indigo-500/20">
                                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 space-y-6">
                            {aiSuggestion && (
                                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-[1.5rem] p-5 animate-in slide-in-from-bottom-4 group/ai">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <Bot className="w-4 h-4 text-cyan-500" />
                                            <span className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest">Suggested Fan Strategy</span>
                                        </div>
                                        <button onClick={() => setAiSuggestion(null)} className="text-slate-400 hover:text-white"><X className="w-3 h-3"/></button>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-4">"{aiSuggestion}"</p>
                                    <button 
                                        onClick={() => { setInput(aiSuggestion); setAiSuggestion(null); }}
                                        className="text-[10px] font-black uppercase tracking-[0.2em] bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-full transition-all"
                                    >
                                        Use Strategy
                                    </button>
                                </div>
                            )}
                            <div className="flex gap-4 items-center">
                                <button className="p-3 bg-slate-100 dark:bg-slate-950 rounded-2xl text-slate-400 hover:text-indigo-500 transition-all border border-slate-200 dark:border-slate-800"><Plus className="w-6 h-6"/></button>
                                <div className="flex-1 relative">
                                    <input 
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                                        placeholder="Type a message..."
                                        className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] py-5 px-8 text-sm outline-none focus:ring-2 ring-indigo-500/20 transition-all shadow-inner"
                                    />
                                    <button 
                                        onClick={handleSend}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl transition-all"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                        <Inbox className="w-24 h-24 mb-6 opacity-10" />
                        <h3 className="text-xl font-black uppercase tracking-widest italic opacity-40">Matrix Unified Feed</h3>
                    </div>
                )}
            </div>

            {/* DETAILS PANE */}
            <div className="w-80 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 p-8 space-y-10 overflow-y-auto custom-scrollbar">
                {selectedThread ? (
                    <>
                        <div className="text-center">
                            <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto mb-4 text-4xl font-black text-slate-900 dark:text-white uppercase shadow-2xl">
                                {selectedThread.contactName[0]}
                            </div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">{selectedThread.contactName}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Institutional Entity</p>
                        </div>

                        <div className="space-y-6">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 pb-2">Active Metadata</h5>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Channel</span>
                                    <span className="font-bold text-slate-900 dark:text-white uppercase flex items-center gap-1.5">
                                        {getChannelIcon(selectedThread.channel)} {selectedThread.channel}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-slate-500">Vibe Match</span>
                                    <span className="font-mono font-bold text-cyan-500">92%</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-indigo-600 text-white rounded-[2rem] p-6 shadow-2xl shadow-indigo-600/20 relative overflow-hidden group cursor-pointer">
                            <Zap className="w-8 h-8 mb-4 fill-white animate-pulse" />
                            <h4 className="font-black uppercase tracking-tight text-base mb-1">Create Deal</h4>
                            <p className="text-indigo-100 text-[10px] leading-relaxed font-bold">Generate on-chain licensing contract for this contact.</p>
                            <ArrowRight className="w-4 h-4 mt-6 group-hover:translate-x-2 transition-transform" />
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-800 text-center gap-4">
                        <Users className="w-12 h-12 opacity-10" />
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Entity Data Required</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- PROVISIONING SUBCOMPONENT REMAINS SAME (FOR GHL SETUP) ---
interface ProvisioningTerminalProps {
    user: User | null;
    onClose: () => void;
    onSuccess: () => void;
}

const ProvisioningTerminal: React.FC<ProvisioningTerminalProps> = ({ user, onClose, onSuccess }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [formData, setFormData] = useState({
        businessName: user?.displayName || '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        address: '',
        city: '',
        country: 'US'
    });

    const handleDeploy = async () => {
        if (!user) return;
        setIsSyncing(true);
        try {
            const res = await crmService.provisionUser(user.uid, user.role || 'artist', formData);
            if (res.success) {
                await new Promise(r => setTimeout(r, 2000));
                onSuccess();
            } else {
                alert("Setup error: " + (res.error || "Gateway timeout"));
                setIsSyncing(false);
            }
        } catch (e) {
            alert("CRM Setup failed.");
            setIsSyncing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl relative">
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
                            <Server className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Hub Terminal</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Institutional Provisioning</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                </div>

                <div className="p-10 flex-1">
                    {isSyncing ? (
                        <div className="py-20 flex flex-col items-center text-center space-y-8 animate-in zoom-in">
                            <Loader2 className="w-16 h-16 text-cyan-500 animate-spin" />
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest animate-pulse">Synchronizing Nodes...</h3>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operational ID</label>
                                    <input value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-6 text-slate-900 dark:text-white outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contact Email</label>
                                    <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-6 text-slate-900 dark:text-white outline-none" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Compliance Address</label>
                                    <input placeholder="Physical mailing address..." value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-4 px-6 text-slate-900 dark:text-white outline-none" />
                                </div>
                            </div>
                            <button onClick={handleDeploy} className="w-full py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:scale-[1.01]">Initialize Institutional Core</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
