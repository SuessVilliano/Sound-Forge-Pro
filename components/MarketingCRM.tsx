
import React, { useState, useEffect, useRef } from 'react';
import { 
    Users, Send, TrendingUp, UserPlus, Search, Plus, Sparkles, 
    FileText, Settings, ArrowRight, CheckCircle2, Clock, Zap, 
    MessageSquare, BarChart, Filter, MoreHorizontal, Mail, Link, 
    // Added AlertTriangle to the lucide-react imports to fix the error on line 319
    AlertCircle, AlertTriangle, X, Smartphone, PlayCircle, StopCircle, RefreshCw, 
    Calendar, Inbox, Activity, ShieldCheck, Database, Layout, 
    Globe, Phone, MessageCircle, Cloud, Share2, Bot, Loader2, Server, Building2, MapPin, ChevronRight, ZapOff
} from 'lucide-react';
import { crmService } from '../services/crmService';
import { authService } from '../services/authService';
import { searchAddresses } from '../services/geminiService';
import { CRMContact, CRMAutomaton, CRMCampaign, MessageThread, ChatMessage, SocialPost, User } from '../types';

export const MarketingCRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inbox' | 'calendar' | 'automations' | 'campaigns' | 'contacts' | 'analytics'>('inbox');
  const user = authService.getCurrentUser();
  const [isCoreActive, setIsCoreActive] = useState(!!user?.ghlIntegration?.ghlLocationId);
  const [loading, setLoading] = useState(false);
  const [showProvisioning, setShowProvisioning] = useState(false);

  // Data State
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<SocialPost[]>([]);
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [automations, setAutomations] = useState<CRMAutomaton[]>([]);
  const [campaigns, setCampaigns] = useState<CRMCampaign[]>([]);

  useEffect(() => {
      if (isCoreActive) {
          loadData();
      }
  }, [activeTab, isCoreActive]);

  const loadData = async () => {
      setLoading(true);
      try {
          if (activeTab === 'inbox') setThreads(await crmService.getThreads());
          if (activeTab === 'calendar') setScheduledPosts(await crmService.getScheduledPosts());
          if (activeTab === 'contacts') setContacts(await crmService.getContacts());
          if (activeTab === 'automations') setAutomations(await crmService.getAutomations());
          if (activeTab === 'campaigns') setCampaigns(await crmService.getCampaigns());
      } catch (e) {
          console.error("CRM Sync Error", e);
      } finally {
          setLoading(false);
      }
  };

  const handleProvisioningSuccess = () => {
      setIsCoreActive(true);
      setShowProvisioning(false);
      loadData();
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* SYSTEM HEALTH BAR */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm backdrop-blur-md">
          <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${isCoreActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-yellow-500 animate-pulse'}`}></div>
                  <div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">CRM Status</div>
                      <div className={`text-xs font-bold ${isCoreActive ? 'text-green-400' : 'text-yellow-500'}`}>
                          {isCoreActive ? `CRM Account Active` : 'Setup Required'}
                      </div>
                  </div>
              </div>
              <div className="h-8 w-px bg-slate-800 hidden md:block"></div>
              <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-500 uppercase">Synchronized Channels</span>
                      <div className="flex gap-2 mt-1">
                          <div title="WhatsApp" className={`p-1 rounded ${isCoreActive ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-600'}`}><MessageCircle className="w-3.5 h-3.5" /></div>
                          <div title="SMS" className={`p-1 rounded ${isCoreActive ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-800 text-slate-600'}`}><Smartphone className="w-3.5 h-3.5" /></div>
                          <div title="Email" className={`p-1 rounded ${isCoreActive ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-800 text-slate-600'}`}><Mail className="w-3.5 h-3.5" /></div>
                      </div>
                  </div>
              </div>
          </div>

          {!isCoreActive && (
              <button 
                onClick={() => setShowProvisioning(true)}
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-cyan-600/20 flex items-center gap-2"
              >
                  <Plus className="w-4 h-4" /> Initialize CRM
              </button>
          )}
      </div>

      {!isCoreActive ? (
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center space-y-8">
              <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-800 text-slate-700 shadow-2xl relative">
                  <Server className="w-12 h-12" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                      <ZapOff className="w-4 h-4 text-slate-500" />
                  </div>
              </div>
              <div className="max-w-md">
                  <h2 className="text-3xl font-black text-white uppercase tracking-tight">CRM Offline</h2>
                  <p className="text-slate-500 mt-4 leading-relaxed font-medium">
                      Activate your personal CRM to automate fan management, unified messaging, and campaign planning.
                  </p>
              </div>
              <button 
                onClick={() => setShowProvisioning(true)} 
                className="bg-white text-slate-950 px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:scale-105 transition-all flex items-center gap-3"
              >
                  Begin Setup <ArrowRight className="w-5 h-5" />
              </button>
          </div>
      ) : (
          <>
            {/* PRIMARY NAVIGATION TABS */}
            <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-hide">
               {[
                   { id: 'inbox', label: 'Inbox', icon: Inbox },
                   { id: 'calendar', label: 'Campaign Planner', icon: Calendar },
                   { id: 'campaigns', label: 'Mass Outreach', icon: Send },
                   { id: 'automations', label: 'Workflows', icon: Zap },
                   { id: 'contacts', label: 'Fan Registry', icon: Users },
                   { id: 'analytics', label: 'Insights', icon: BarChart },
               ].map((tab) => (
                   <button 
                      key={tab.id} 
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-8 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${
                          activeTab === tab.id 
                          ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5' 
                          : 'border-transparent text-slate-500 hover:text-white'
                      }`}
                   >
                       <tab.icon className="w-4 h-4" /> {tab.label}
                   </button>
               ))}
            </div>

            <div className="min-h-[500px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 text-slate-500 gap-4">
                        <div className="w-12 h-12 border-4 border-slate-800 border-t-cyan-500 rounded-full animate-spin"></div>
                        <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing CRM Data...</span>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {activeTab === 'inbox' && <InboxModule threads={threads} />}
                        {activeTab === 'calendar' && <CalendarModule posts={scheduledPosts} />}
                        {activeTab === 'contacts' && <ContactsModule contacts={contacts} />}
                    </div>
                )}
            </div>
          </>
      )}

      {/* SETUP MODAL */}
      {showProvisioning && (
          <ProvisioningTerminal 
              user={user} 
              onClose={() => setShowProvisioning(false)} 
              onSuccess={handleProvisioningSuccess} 
          />
      )}
    </div>
  );
};

// --- SUB-COMPONENTS ---

interface ProvisioningTerminalProps {
    user: User | null;
    onClose: () => void;
    onSuccess: () => void;
}

const ProvisioningTerminal: React.FC<ProvisioningTerminalProps> = ({ user, onClose, onSuccess }) => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [isVerifyingAddress, setIsVerifyingAddress] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
    const [isAddressVerified, setIsAddressVerified] = useState(false);
    const [formData, setFormData] = useState({
        businessName: user?.displayName || '',
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        address: '',
        city: '',
        country: 'US'
    });
    const addressTimeoutRef = useRef<number | null>(null);

    const handleAddressChange = (val: string) => {
        setFormData({ ...formData, address: val });
        setIsAddressVerified(false);
        
        if (addressTimeoutRef.current) clearTimeout(addressTimeoutRef.current);
        
        if (val.length > 4) {
            setIsVerifyingAddress(true);
            addressTimeoutRef.current = window.setTimeout(async () => {
                const suggestions = await searchAddresses(val);
                setAddressSuggestions(suggestions);
                setIsVerifyingAddress(false);
            }, 800);
        } else {
            setAddressSuggestions([]);
        }
    };

    const selectAddress = (suggestion: any) => {
        // Extract basic data from suggestion title (usually "Address, City, Country")
        const parts = suggestion.title.split(',');
        setFormData({
            ...formData,
            address: parts[0]?.trim() || suggestion.title,
            city: parts[1]?.trim() || '',
            country: parts[parts.length - 1]?.trim() || 'US'
        });
        setAddressSuggestions([]);
        setIsAddressVerified(true);
    };

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
            alert("CRM Setup failed. Check network connectivity.");
            setIsSyncing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl relative">
                
                <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-600/20">
                            <Server className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">CRM Terminal</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Verified Identity Synchronization</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-10 flex-1">
                    {isSyncing ? (
                        <div className="py-20 flex flex-col items-center text-center space-y-8 animate-in zoom-in">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Cloud className="w-8 h-8 text-cyan-400 animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-widest animate-pulse">Synchronizing Ledger...</h3>
                                <p className="text-slate-500 text-sm mt-2">Provisioning dedicated CRM Instance with Verified Identity.</p>
                            </div>
                            <div className="w-full bg-slate-950 rounded-xl p-4 font-mono text-[10px] text-green-500 text-left h-24 overflow-y-auto">
                                [SYSTEM] Connecting to gateway...<br/>
                                [SYSTEM] Injecting verified address hash...<br/>
                                [SYSTEM] Creating secure instance...<br/>
                                [SYSTEM] Verifying A2P carrier compliance...
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Artist / Business Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none" 
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Identity Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                        <input 
                                            value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-white focus:border-cyan-500 outline-none" 
                                        />
                                    </div>
                                </div>
                                <div className="col-span-2 space-y-2 relative">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex justify-between">
                                        <span>Billing Address (A2P Compliance)</span>
                                        {isAddressVerified && <span className="text-green-500 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ledger Verified</span>}
                                    </label>
                                    <div className="relative">
                                        <MapPin className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${isAddressVerified ? 'text-green-500' : 'text-slate-500'}`} />
                                        <input 
                                            placeholder="Start typing your address..."
                                            value={formData.address} onChange={e => handleAddressChange(e.target.value)}
                                            className={`w-full bg-slate-950 border rounded-xl py-4 pl-12 pr-12 text-white outline-none transition-all ${isAddressVerified ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-slate-800 focus:border-cyan-500'}`} 
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                            {isVerifyingAddress && <Loader2 className="w-4 h-4 text-cyan-500 animate-spin" />}
                                            {!isVerifyingAddress && !isAddressVerified && formData.address.length > 4 && <AlertTriangle className="w-4 h-4 text-yellow-500" title="Select a verified match" />}
                                        </div>
                                    </div>

                                    {/* ADDRESS SUGGESTIONS DROPDOWN */}
                                    {addressSuggestions.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 max-h-60 overflow-y-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 backdrop-blur-xl">
                                            <div className="p-3 text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-950/50 border-b border-slate-800">
                                                Verified Maps Ledger Matches
                                            </div>
                                            {addressSuggestions.map((s, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => selectAddress(s)}
                                                    className="w-full text-left p-4 hover:bg-cyan-500/10 text-xs font-bold text-slate-300 hover:text-white border-b border-slate-800/50 last:border-0 transition-colors flex items-center gap-3 group"
                                                >
                                                    <MapPin className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />
                                                    {s.title}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-6 flex gap-4">
                                <ShieldCheck className="w-6 h-6 text-indigo-400 shrink-0" />
                                <p className="text-xs text-indigo-300 leading-relaxed font-medium">
                                    A verified billing address is required for automated A2P messaging compliance. Your personal identity hash will be synchronized across global communication carrier nodes.
                                </p>
                            </div>

                            <button 
                                onClick={handleDeploy}
                                disabled={!isAddressVerified || !formData.businessName}
                                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-cyan-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Zap className="w-4 h-4 fill-white" /> Authorize & Synchronize Node
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InboxModule: React.FC<{ threads: MessageThread[] }> = ({ threads }) => {
    const [selectedThread, setSelectedThread] = useState<MessageThread | null>(threads[0] || null);
    const [messages, setMessages] = useState<any[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedThread) {
            setLoading(true);
            crmService.getMessages(selectedThread.id).then((res) => {
                setMessages(res);
                setLoading(false);
            });
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
        <div className="flex h-[600px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-4 duration-500">
            {/* Thread List */}
            <div className="w-80 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-lg">Active Chats</h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {threads.length === 0 ? (
                        <div className="p-8 text-center text-slate-500 text-xs italic">No active communications.</div>
                    ) : (
                        threads.map(t => (
                            <button 
                                key={t.id}
                                onClick={() => setSelectedThread(t)}
                                className={`w-full p-4 text-left rounded-xl transition-all group ${selectedThread?.id === t.id ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`font-bold text-sm truncate ${selectedThread?.id === t.id ? 'text-cyan-500' : 'text-slate-900 dark:text-white'}`}>{t.contactName}</span>
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.channel}</span>
                                </div>
                                <p className="text-xs text-slate-500 line-clamp-1">{t.lastMessageText}</p>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Pane */}
            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative">
                {selectedThread ? (
                    <>
                        <div className="h-16 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between bg-white dark:bg-slate-900/80 backdrop-blur">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white font-black uppercase text-xs border border-slate-200 dark:border-slate-700 shadow-sm">{selectedThread.contactName[0]}</div>
                                <div>
                                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedThread.contactName}</span>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{selectedThread.contactId}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            {loading ? (
                                <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-cyan-500" /></div>
                            ) : (
                                messages.map((m, i) => (
                                    <div key={i} className={`flex ${m.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-5 py-4 rounded-[1.5rem] text-sm shadow-sm ${m.direction === 'outbound' ? 'bg-cyan-600 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700'}`}>
                                            {m.body}
                                            <div className={`text-[8px] font-black uppercase tracking-widest mt-2 opacity-50 ${m.direction === 'outbound' ? 'text-right' : 'text-left'}`}>
                                                {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex gap-4">
                            <input 
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder="Secure communication..."
                                className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-inner"
                            />
                            <button onClick={handleSend} className="p-4 bg-cyan-600 rounded-2xl text-white font-bold hover:bg-cyan-500 transition-all shadow-lg shadow-cyan-600/20"><Send className="w-5 h-5" /></button>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-10" />
                        <p className="font-black uppercase tracking-widest text-xs">Select a Chat to Engage</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const CalendarModule: React.FC<{ posts: SocialPost[] }> = ({ posts }) => {
    const [showCompose, setShowCompose] = useState(false);
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Campaign Planner</h3>
                <button 
                    onClick={() => setShowCompose(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-600/20"
                >
                    <Plus className="w-4 h-4" /> New Campaign
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.length > 0 ? posts.map(post => (
                    <div key={post.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden group hover:border-cyan-500/50 transition-all shadow-sm">
                        <div className="h-48 bg-slate-100 dark:bg-slate-800 relative">
                             {post.mediaUrls[0] ? <img src={post.mediaUrls[0]} className="w-full h-full object-cover" /> : <div className="h-full flex items-center justify-center text-slate-300 dark:text-slate-700"><Share2 className="w-12 h-12"/></div>}
                             <div className="absolute top-4 left-4 flex gap-2">
                                {post.networks.map(n => <span key={n} className="px-2 py-0.5 rounded bg-black/60 text-white text-[8px] font-black uppercase tracking-widest">{n}</span>)}
                             </div>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 font-medium italic">"{post.caption}"</p>
                            <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> {new Date(post.scheduledAt).toLocaleDateString()}
                                </span>
                                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-[8px] font-black uppercase">{post.status}</span>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-24 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-center text-slate-400">
                         <Share2 className="w-16 h-16 mx-auto mb-6 opacity-10" />
                         <p className="font-black uppercase tracking-widest text-xs">No pending campaigns scheduled</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ContactsModule: React.FC<{ contacts: CRMContact[] }> = ({ contacts }) => {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Fan Registry</h3>
                 <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                     <input placeholder="Search Registry..." className="pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full text-xs outline-none focus:border-cyan-500" />
                 </div>
             </div>
             <table className="w-full text-left">
                <thead>
                    <tr className="text-[10px] font-black uppercase text-slate-500 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <th className="px-6 py-4">Entity Name</th>
                        <th className="px-6 py-4">Source Channel</th>
                        <th className="px-6 py-4">Tags</th>
                        <th className="px-6 py-4">Activity</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {contacts.map(contact => (
                        <tr key={contact.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4">
                                <div className="font-bold text-slate-900 dark:text-white">{contact.name}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{contact.email}</div>
                            </td>
                            <td className="px-6 py-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{contact.source}</span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex gap-1">
                                    {contact.tags.map(t => <span key={t} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[8px] font-black uppercase text-slate-500">{t}</span>)}
                                </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500">{contact.lastActive}</td>
                            <td className="px-6 py-4 text-right">
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-cyan-500 transition-all"><ChevronRight className="w-4 h-4"/></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
        </div>
    );
};
