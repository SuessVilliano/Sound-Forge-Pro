
import React, { useState, useEffect } from 'react';
import { Users, Send, TrendingUp, UserPlus, Search, Plus, Sparkles, FileText, Settings, ArrowRight, CheckCircle2, Clock, Zap, MessageSquare, BarChart, Filter, MoreHorizontal, Mail, Link, AlertCircle, X, Smartphone, PlayCircle, StopCircle, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart as ReBarChart, Bar, Legend } from 'recharts';
import { CAMPAIGN_TEMPLATES } from '../constants';
import { crmService } from '../services/crmService';
import { CRMContact, CRMAutomaton, CRMCampaign } from '../types';

export const MarketingCRM: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'contacts' | 'automations' | 'campaigns' | 'analytics'>('campaigns');
  const [isConnected, setIsConnected] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data State
  const [contacts, setContacts] = useState<CRMContact[]>([]);
  const [automations, setAutomations] = useState<CRMAutomaton[]>([]);
  const [campaigns, setCampaigns] = useState<CRMCampaign[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  // Modals & Builders
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [showAutoBuilder, setShowAutoBuilder] = useState(false);
  const [newAutoName, setNewAutoName] = useState('');
  const [newAutoTrigger, setNewAutoTrigger] = useState('');
  const [newAutoActions, setNewAutoActions] = useState<string[]>([]);

  // Inputs
  const [hlApiKey, setHlApiKey] = useState('');
  const [hlLocationId, setHlLocationId] = useState('');

  useEffect(() => {
      checkConnection();
      loadData();
  }, []);

  const checkConnection = () => {
      setIsConnected(crmService.isConnected());
  };

  const loadData = async () => {
      setLoading(true);
      try {
          const [c, a, cmp, an] = await Promise.all([
              crmService.getContacts(),
              crmService.getAutomations(),
              crmService.getCampaigns(),
              crmService.getAnalyticsData('7d')
          ]);
          setContacts(c);
          setAutomations(a);
          setCampaigns(cmp);
          setAnalyticsData(an);
      } catch (e) {
          console.error("Failed to load CRM data", e);
      } finally {
          setLoading(false);
      }
  };

  const handleConnect = async () => {
      if (!hlApiKey || !hlLocationId) {
          alert("Please enter both API Key and Location ID");
          return;
      }
      const success = await crmService.connectHighLevel(hlApiKey, hlLocationId);
      if (success) {
          setIsConnected(true);
          setShowConnectModal(false);
          loadData(); // Reload with "synced" data
      }
  };

  const handleDisconnect = () => {
      crmService.disconnectHighLevel();
      setIsConnected(false);
  };

  const handleCreateAutomation = async () => {
      if (!newAutoName || !newAutoTrigger || newAutoActions.length === 0) return;
      await crmService.createAutomation(newAutoName, newAutoTrigger, newAutoActions);
      setAutomations(await crmService.getAutomations());
      setShowAutoBuilder(false);
      setNewAutoName('');
      setNewAutoTrigger('');
      setNewAutoActions([]);
  };

  const addActionToBuilder = (action: string) => {
      setNewAutoActions([...newAutoActions, action]);
  };

  // --- AUTOMATIONS VIEW ---
  const renderAutomations = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-xl font-bold text-white">Workflows & Automations</h2>
                  <p className="text-slate-400 text-sm">Visual builder for fan journeys.</p>
              </div>
              <button 
                onClick={() => setShowAutoBuilder(true)}
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"
              >
                  <Plus className="w-4 h-4" /> Create Workflow
              </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
              {automations.map(auto => (
                  <div key={auto.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex justify-between items-center hover:border-cyan-500/50 transition-all cursor-pointer group">
                      <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${auto.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-400'}`}>
                              <Zap className="w-6 h-6" />
                          </div>
                          <div>
                              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">{auto.name}</h3>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                  <span className="flex items-center gap-1 font-mono text-cyan-400 bg-cyan-950/30 px-1.5 rounded"><Clock className="w-3 h-3" /> {auto.trigger}</span>
                                  <span>→</span>
                                  <span>{auto.actions.length} Actions</span>
                                  <span>•</span>
                                  <span>{auto.enrolledCount} Enrolled</span>
                              </div>
                          </div>
                      </div>
                      <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                              auto.status === 'Active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                          }`}>
                              {auto.status}
                          </span>
                          <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                              <MoreHorizontal className="w-5 h-5" />
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  // --- ANALYTICS VIEW ---
  const renderAnalytics = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Campaign Performance</h2>
              <select 
                onChange={async (e) => setAnalyticsData(await crmService.getAnalyticsData(e.target.value))}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
              >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
              </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2"><Mail className="w-4 h-4" /> Email Open & Click Rates</h3>
                  <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analyticsData}>
                              <defs>
                                  <linearGradient id="colorOpen" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                  </linearGradient>
                                  <linearGradient id="colorClick" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                              <Area type="monotone" dataKey="opened" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorOpen)" name="Opens" />
                              <Area type="monotone" dataKey="clicked" stroke="#06b6d4" fillOpacity={1} fill="url(#colorClick)" name="Clicks" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>

              <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-slate-300 mb-6 flex items-center gap-2"><Send className="w-4 h-4" /> Delivery Stats</h3>
                  <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <ReBarChart data={analyticsData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }} />
                              <Legend />
                              <Bar dataKey="sent" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Sent" />
                              <Bar dataKey="opened" fill="#10b981" radius={[4, 4, 0, 0]} name="Delivered" />
                          </ReBarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>
      </div>
  );

  // --- CONTACTS VIEW ---
  const renderContacts = () => (
      <div className="space-y-6 animate-in fade-in">
          <div className="flex justify-between items-center">
              <div>
                  <h2 className="text-xl font-bold text-white">Smart Contact Lists</h2>
                  <p className="text-slate-400 text-sm">{contacts.length} fans tracked.</p>
              </div>
              <div className="flex gap-2">
                  <button className="bg-slate-800 border border-slate-700 text-slate-300 px-4 py-2 rounded-lg text-sm font-bold hover:text-white transition-colors">
                      Import CSV
                  </button>
                  <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                      <UserPlus className="w-4 h-4" /> Add Contact
                  </button>
              </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-xs font-bold border-b border-slate-700">
                      <tr>
                          <th className="px-6 py-4">Name</th>
                          <th className="px-6 py-4">Status</th>
                          <th className="px-6 py-4">Source</th>
                          <th className="px-6 py-4">Tags</th>
                          <th className="px-6 py-4">Last Active</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                      {contacts.map(c => (
                          <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4">
                                  <div className="font-bold text-white">{c.name}</div>
                                  <div className="text-xs text-slate-500">{c.email}</div>
                              </td>
                              <td className="px-6 py-4">
                                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      c.status === 'VIP' ? 'bg-purple-500/20 text-purple-400' :
                                      c.status === 'Customer' ? 'bg-green-500/20 text-green-400' :
                                      c.status === 'Fan' ? 'bg-blue-500/20 text-blue-400' :
                                      'bg-slate-700 text-slate-400'
                                  }`}>
                                      {c.status}
                                  </span>
                              </td>
                              <td className="px-6 py-4 text-slate-300">{c.source}</td>
                              <td className="px-6 py-4">
                                  <div className="flex gap-1 flex-wrap">
                                      {c.tags.map(t => (
                                          <span key={t} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300 border border-slate-600">
                                              #{t}
                                          </span>
                                      ))}
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-slate-500 font-mono text-xs">{c.lastActive}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>
  );

  return (
    <div className="space-y-6 pb-20 relative">
      
      {/* HighLevel Connection Header */}
      <div className="bg-slate-900 border-b border-slate-800 -mx-4 md:-mx-8 px-8 py-4 flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500'}`}></div>
              <span className={`text-sm font-bold ${isConnected ? 'text-green-400' : 'text-slate-400'}`}>
                  {isConnected ? 'HighLevel Connected' : 'CRM Disconnected'}
              </span>
          </div>
          {isConnected ? (
              <button onClick={handleDisconnect} className="text-xs text-red-400 hover:text-red-300 underline">Disconnect</button>
          ) : (
              <button 
                onClick={() => setShowConnectModal(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-full text-xs font-bold transition-colors shadow-lg shadow-blue-500/20"
              >
                  Connect HighLevel
              </button>
          )}
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
            { label: "Total Contacts", val: contacts.length.toLocaleString(), change: "+12.5%", icon: Users, color: "text-cyan-400" },
            { label: "Active Workflows", val: automations.filter(a => a.status === 'Active').length.toString(), change: "Running", icon: Zap, color: "text-yellow-400" },
            { label: "Email Open Rate", val: "24.5%", change: "+5.2%", icon: TrendingUp, color: "text-purple-400" },
            { label: "SMS Credits", val: "450", change: "Auto-Reload", icon: MessageSquare, color: "text-green-400" }
        ].map((stat, i) => (
            <div key={i} className="bg-slate-850 p-5 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-2">
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">{stat.change}</span>
                </div>
                <div className="text-2xl font-bold text-white">{stat.val}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
            </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto">
         {[
             { id: 'campaigns', label: 'Campaigns', icon: Send },
             { id: 'automations', label: 'Automations', icon: Zap },
             { id: 'analytics', label: 'Analytics', icon: BarChart },
             { id: 'contacts', label: 'Contacts', icon: Users },
         ].map((tab) => (
             <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-b-2 whitespace-nowrap ${
                    activeTab === tab.id 
                    ? 'border-cyan-500 text-cyan-400 bg-slate-800/50' 
                    : 'border-transparent text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}
             >
                 <tab.icon className="w-4 h-4" /> {tab.label}
             </button>
         ))}
      </div>

      <div className="min-h-[400px]">
        {loading ? (
            <div className="flex items-center justify-center h-64 text-slate-500 gap-2">
                <RefreshCw className="w-6 h-6 animate-spin" /> Loading CRM Data...
            </div>
        ) : (
            <>
                {activeTab === 'automations' && renderAutomations()}
                {activeTab === 'analytics' && renderAnalytics()}
                {activeTab === 'contacts' && renderContacts()}
                {activeTab === 'campaigns' && (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-white">Email & SMS Campaigns</h2>
                            <button 
                                onClick={() => setShowCampaignModal(true)}
                                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
                            >
                                <Plus className="w-4 h-4" /> New Campaign
                            </button>
                        </div>

                        {/* Recent Campaigns Table */}
                        <div className="bg-slate-800/30 rounded-xl border border-slate-700 overflow-hidden mb-8">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-900/50 text-slate-400 text-xs font-bold uppercase">
                                    <tr>
                                        <th className="px-6 py-3">Campaign</th>
                                        <th className="px-6 py-3">Type</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Sent</th>
                                        <th className="px-6 py-3 text-right">Open Rate</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700/50">
                                    {campaigns.map(c => (
                                        <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4 font-bold text-white">{c.name}</td>
                                            <td className="px-6 py-4"><span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-600">{c.type}</span></td>
                                            <td className="px-6 py-4">
                                                <span className={`text-xs font-bold ${c.status === 'Sent' ? 'text-green-400' : 'text-yellow-400'}`}>{c.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right font-mono text-slate-400">{c.sentCount.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-mono text-cyan-400">{c.openRate}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {CAMPAIGN_TEMPLATES.map((template) => (
                                <div key={template.id} className="bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 transition-all cursor-pointer group flex flex-col h-full shadow-lg">
                                    <div className={`w-12 h-12 rounded-xl ${template.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <template.icon className={`w-6 h-6 ${template.color}`} />
                                    </div>
                                    <h4 className="text-white font-bold text-lg mb-2">{template.title}</h4>
                                    <p className="text-sm text-slate-400 mb-6 flex-1 leading-relaxed">{template.description}</p>
                                    <div className="space-y-2 pt-4 border-t border-slate-800/50">
                                        {template.steps.slice(0, 3).map((step, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                                                <CheckCircle2 className="w-3 h-3 text-slate-600" />
                                                {step}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-bold group-hover:bg-cyan-600 group-hover:border-cyan-600 group-hover:text-white transition-all">
                                        Use Template
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        )}
      </div>

      {/* CONNECT HIGHLEVEL MODAL */}
      {showConnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <Link className="w-5 h-5 text-blue-500" /> Connect HighLevel
                      </h3>
                      <button onClick={() => setShowConnectModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                  </div>
                  <div className="space-y-4">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-300 leading-relaxed">
                          Enter your HighLevel API Key to sync contacts, automations, and send campaigns directly from SoundForge.
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-400 mb-1 block">API Key (V2)</label>
                          <input 
                              type="password"
                              value={hlApiKey}
                              onChange={(e) => setHlApiKey(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
                              placeholder="Key..."
                          />
                      </div>
                      <div>
                          <label className="text-xs font-bold text-slate-400 mb-1 block">Location ID</label>
                          <input 
                              type="text"
                              value={hlLocationId}
                              onChange={(e) => setHlLocationId(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm"
                              placeholder="Location ID..."
                          />
                      </div>
                      <button 
                          onClick={handleConnect}
                          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors"
                      >
                          Verify & Connect
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* AUTOMATION BUILDER MODAL */}
      {showAutoBuilder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl relative">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 rounded-t-2xl">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /> Automation Builder</h3>
                      <button onClick={() => setShowAutoBuilder(false)}><X className="w-6 h-6 text-slate-400 hover:text-white" /></button>
                  </div>
                  
                  <div className="flex-1 flex overflow-hidden">
                      {/* Canvas */}
                      <div className="flex-1 bg-slate-950 p-8 overflow-y-auto flex flex-col items-center gap-4 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] relative">
                          {/* Trigger Node */}
                          <div className="w-64 p-4 bg-orange-600/20 border border-orange-500 rounded-xl text-center backdrop-blur-sm relative shadow-[0_0_15px_rgba(249,115,22,0.3)]">
                              <div className="text-xs font-bold text-orange-400 uppercase mb-1">Trigger</div>
                              {newAutoTrigger ? (
                                  <div className="text-white font-bold">{newAutoTrigger}</div>
                              ) : (
                                  <div className="text-slate-400 italic">Select a trigger...</div>
                              )}
                              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-700"></div>
                          </div>

                          {/* Action Nodes */}
                          {newAutoActions.map((action, i) => (
                              <div key={i} className="w-64 p-4 bg-slate-800 border border-slate-700 rounded-xl text-center relative animate-in slide-in-from-top-4">
                                  <div className="text-white font-bold text-sm">{action}</div>
                                  <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-slate-700"></div>
                              </div>
                          ))}

                          {/* Add Button */}
                          <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-dashed border-slate-600 flex items-center justify-center text-slate-500">
                              <Plus className="w-4 h-4" />
                          </div>
                      </div>

                      {/* Config Panel */}
                      <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col gap-6">
                          <div>
                              <label className="text-xs font-bold text-slate-400 mb-2 block">Workflow Name</label>
                              <input 
                                  value={newAutoName}
                                  onChange={(e) => setNewAutoName(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none"
                                  placeholder="My New Workflow"
                              />
                          </div>

                          <div>
                              <label className="text-xs font-bold text-slate-400 mb-2 block">Set Trigger</label>
                              <select 
                                  value={newAutoTrigger}
                                  onChange={(e) => setNewAutoTrigger(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white text-sm focus:border-cyan-500 outline-none"
                              >
                                  <option value="">Select Trigger...</option>
                                  <option value="Form Submit">Form Submitted</option>
                                  <option value="Tag Added">Tag Added</option>
                                  <option value="Sale Made">Product Sold</option>
                              </select>
                          </div>

                          <div>
                              <label className="text-xs font-bold text-slate-400 mb-2 block">Add Actions</label>
                              <div className="grid grid-cols-2 gap-2">
                                  <button onClick={() => addActionToBuilder('Send Email')} className="bg-slate-800 hover:bg-slate-700 p-2 rounded text-xs text-white border border-slate-700">Send Email</button>
                                  <button onClick={() => addActionToBuilder('Send SMS')} className="bg-slate-800 hover:bg-slate-700 p-2 rounded text-xs text-white border border-slate-700">Send SMS</button>
                                  <button onClick={() => addActionToBuilder('Wait 1 Day')} className="bg-slate-800 hover:bg-slate-700 p-2 rounded text-xs text-white border border-slate-700">Wait 1 Day</button>
                                  <button onClick={() => addActionToBuilder('Add Tag')} className="bg-slate-800 hover:bg-slate-700 p-2 rounded text-xs text-white border border-slate-700">Add Tag</button>
                              </div>
                          </div>

                          <div className="mt-auto">
                              <button 
                                  onClick={handleCreateAutomation}
                                  className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition-colors"
                              >
                                  Publish Workflow
                              </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* New Campaign Modal (Same as before but hooked up) */}
      {showCampaignModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
                  <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                      <h3 className="font-bold text-white">Create New Campaign</h3>
                      <button onClick={() => setShowCampaignModal(false)} className="text-slate-500 hover:text-white"><Settings className="w-5 h-5" /></button>
                  </div>
                  <div className="p-8 space-y-6">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Campaign Name</label>
                          <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none" placeholder="e.g. Album Launch Blast" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <button className="p-4 border border-cyan-500 bg-cyan-500/10 rounded-xl flex flex-col items-center gap-2 text-cyan-400">
                              <Mail className="w-6 h-6" /> Email Blast
                          </button>
                          <button className="p-4 border border-slate-700 bg-slate-800 rounded-xl flex flex-col items-center gap-2 text-slate-400 hover:border-slate-500 hover:text-white transition-colors">
                              <MessageSquare className="w-6 h-6" /> SMS Blast
                          </button>
                      </div>
                      <button 
                        onClick={() => { 
                            crmService.createCampaign({ name: "New Draft Campaign" });
                            setCampaigns(prev => [...prev, { id: 'new', name: 'New Draft', type: 'Email', status: 'Draft', sentCount: 0, openRate: 0, clickRate: 0, date: 'Today' }]);
                            setShowCampaignModal(false); 
                        }}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-lg font-bold transition-colors"
                      >
                          Continue to Editor
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
