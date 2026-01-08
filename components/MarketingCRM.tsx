
import React, { useState, useEffect } from 'react';
import { 
    Users, Send, TrendingUp, UserPlus, Search, Plus, Sparkles, 
    FileText, Settings, ArrowRight, CheckCircle2, Clock, Zap, 
    MessageSquare, BarChart, Filter, MoreHorizontal, Mail, Link, 
    AlertCircle, X, Smartphone, PlayCircle, StopCircle, RefreshCw, 
    Calendar, Inbox, Activity, ShieldCheck, Database, Layout, 
    Globe, Phone, MessageCircle, Cloud, Share2, Bot, Loader2, Server
} from 'lucide-react';
import { crmService } from '../services/crmService';
import { authService } from '../services/authService';
import { CRMContact, CRMAutomaton, CRMCampaign, MessageThread, SocialPost } from '../types';

export const MarketingCRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'calendar' | 'automations' | 'campaigns' | 'contacts' | 'analytics'>('inbox');
  const user = authService.getCurrentUser();
  const [isCoreActive, setIsCoreActive] = useState(crmService.isConnected());
  const [loading, setLoading] = useState(true);

  // Data State
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<SocialPost[]>([]);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [automations, setAutomations] = useState<CRMAutomaton[]>([]);
  const [campaigns, setCampaigns] = useState<CRMCampaign[]>([]);

  useEffect(() => {
      loadData();
  }, [activeTab]);

  const loadData = async () => {
      setLoading(true);
      try {
          if (activeTab === 'inbox') setThreads(await crmService.getThreads());
          if (activeTab === 'calendar') setScheduledPosts(await crmService.getScheduledPosts());
          if (activeTab === 'contacts') setContacts(await crmService.getContacts());
          if (activeTab === 'automations') setAutomations(await crmService.getAutomations());
          if (activeTab === 'campaigns') setCampaigns(await crmService.getCampaigns());
      } catch (e) {
          console.error("Failed to sync Hub", e);
      } finally {
          setLoading(false);
      }
  };

  const handleActivateCore = async () => {
      if (!user) return;
      setLoading(true);
      const res = await crmService.provisionUser(user.uid, user.role || 'artist');
      if (res.success) {
          setIsCoreActive(true);
          localStorage.setItem('sf_ghl_active', 'true');
      }
      setLoading(false);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* SYSTEM HEALTH BAR */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isCoreActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                  <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Infrastructure Status</div>
                      <div className={`text-xs font-bold ${isCoreActive ? 'text-green-400' : 'text-yellow-500'}`}>
                          {isCoreActive ? 'Sound Merge Core Active' : 'Synchronization Pending'}
                      </div>
                  </div>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
              <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Identity Sync</span>
                      <div className="flex gap-2 mt-1">
                          <div title="WhatsApp Ready" className="p-1 rounded bg-green-500/10 text-green-400"><MessageCircle className="w-3.5 h-3.5" /></div>
                          <div title="SMS Compliant" className="p-1 rounded bg-blue-500/10 text-blue-400"><Smartphone className="w-3.5 h-3.5" /></div>
                          <div title="Email Warm" className="p-1 rounded bg-purple-500/10 text-purple-400"><Mail className="w-3.5 h-3.5" /></div>
                      </div>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Voice Agent</span>
                      <div className="mt-1 text-xs font-bold text-slate-400 flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" /> Enabled
                      </div>
                  </div>
              </div>
          </div>

          {!isCoreActive && (
              <button 
                onClick={handleActivateCore}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
              >
                  <Plus className="w-4 h-4" /> Activate Core Engine
              </button>
          )}
      </div>

      {/* PRIMARY NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-hide">
         {[
             { id: 'inbox', label: 'Unified Hub', icon: Inbox },
             { id: 'calendar', label: 'Promotion Ledger', icon: Calendar },
             { id: 'campaigns', label: 'Outreach', icon: Send },
             { id: 'automations', label: 'Workflows', icon: Zap },
             { id: 'contacts', label: 'Fan Registry', icon: Users },
             { id: 'analytics', label: 'Performance', icon: BarChart },
         ].map((tab) => (
             <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-8 py-4 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' 
                    : 'border-transparent text-slate-500 hover:text-white'
                }`}
             >
                 <tab.icon className="w-4 h-4" /> {tab.label}
             </button>
         ))}
      </div>

      {/* DYNAMIC CONTENT AREA */}
      <div className="min-h-[500px]">
          {loading ? (
              <div className="flex flex-col items-center justify-center h-96 text-slate-500 gap-4">
                  <RefreshCw className="w-8 h-8 animate-spin text-cyan-500" />
                  <span className="text-xs font-black uppercase tracking-widest">Synchronizing Identity Data...</span>
              </div>
          ) : !isCoreActive ? (
              <div className="flex flex-col items-center justify-center h-96 text-center space-y-6">
                  <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center border-2 border-slate-800 text-slate-700">
                      <Server className="w-10 h-10" />
                  </div>
                  <div>
                      <h2 className="text-2xl font-black text-white uppercase">Identity Engine Offline</h2>
                      <p className="text-slate-500 max-w-sm mx-auto mt-2">Initialize your personal Sound Merge Core to enable automated fan management and promotion ledgers.</p>
                  </div>
                  <button onClick={handleActivateCore} className="bg-white text-slate-950 px-10 py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all">Synchronize Now</button>
              </div>
          ) : (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {activeTab === 'inbox' && <InboxModule threads={threads} />}
                  {activeTab === 'calendar' && <CalendarModule posts={scheduledPosts} />}
                  {/* ... other tab placeholders ... */}
              </div>
          )}
      </div>
    </div>
  );
};

// ... InboxModule and CalendarModule remain but with updated terminology internally ...
const InboxModule: React.FC<{ threads: MessageThread[] }> = ({ threads }) => {
    const [selectedThread, setSelectedThread] = useState<MessageThread | null>(threads[0] || null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (selectedThread) {
            crmService.getMessages(selectedThread.id).then(setMessages);
        }
    }, [selectedThread]);

    const handleSend = async () => {
        if (!selectedThread || !input.trim()) return;
        const res = await crmService.sendMessage(selectedThread.id, input, selectedThread.channel);
        if (res.success) {
            setMessages([...messages, { direction: 'outbound', body: input, timestamp: new Date().toISOString() }]);
            setInput('');
        }
    };

    return (
        <div className="flex h-[600px] bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
            {/* Thread List */}
            <div className="w-80 border-r border-slate-800 bg-slate-950 flex flex-col">
                <div className="p-6 border-b border-slate-800">
                    <h3 className="font-black text-white uppercase tracking-tight text-lg">Hub Connections</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {threads.map(t => (
                        <button 
                            key={t.id}
                            onClick={() => setSelectedThread(t)}
                            className={`w-full p-5 text-left border-b border-slate-800/50 hover:bg-slate-900 transition-all group ${selectedThread?.id === t.id ? 'bg-slate-900' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`font-bold ${selectedThread?.id === t.id ? 'text-cyan-400' : 'text-white'}`}>{t.contactName}</span>
                                <span className="text-[10px] text-slate-500">{new Date(t.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-1">{t.lastMessageText}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Pane */}
            <div className="flex-1 flex flex-col bg-slate-900 relative">
                {selectedThread ? (
                    <>
                        <div className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/80 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold">{selectedThread.contactName[0]}</div>
                                <span className="font-bold text-white">{selectedThread.contactName}</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm ${m.direction === 'outbound' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'}`}>
                                        {m.body}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-950 border-t border-slate-800 flex gap-3">
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Communicate via Core..."
                                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                            />
                            <button onClick={handleSend} className="p-3 bg-cyan-600 rounded-xl text-slate-950 font-bold hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20"><Send className="w-5 h-5" /></button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                        <p>Select a connection to communicate.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CalendarModule: React.FC<{ posts: SocialPost[] }> = ({ posts }) => {
    const [showCompose, setShowCompose] = useState(false);
    const [aiThinking, setAiThinking] = useState(false);
    const [caption, setCaption] = useState('');

    const generateAiCaption = async () => {
        setAiThinking(true);
        setTimeout(() => {
            setCaption("Just dropped a new track secured on the Sound Merge Ledger! 🎵 Real music, real ownership. Check it out via the link in bio! #SoundMerge #VocalIP #SolanaMusic");
            setAiThinking(false);
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Promotion Ledger</h3>
                <button 
                    onClick={() => setShowCompose(true)}
                    className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-cyan-600/20"
                >
                    <Plus className="w-4 h-4" /> Draft Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.length > 0 ? posts.map(post => (
                    <div key={post.id} className="bg-slate-900 border border-slate-800 rounded-[2rem] overflow-hidden group hover:border-cyan-500/50 transition-all shadow-lg">
                        {/* ... Post item UI ... */}
                    </div>
                )) : (
                    <div className="col-span-full py-20 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] text-center text-slate-600">
                         <Share2 className="w-12 h-12 mx-auto mb-4 opacity-20" />
                         <p className="font-black uppercase tracking-widest text-xs">Ledger Clear</p>
                    </div>
                )}
            </div>
            {/* Modal renamed to Promotion Ledger etc */}
        </div>
    );
};
