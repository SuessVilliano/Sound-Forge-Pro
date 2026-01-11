

import React, { useState, useEffect } from 'react';
import { 
    Users, Trash2, Edit2, Shield, Search, CheckCircle2, AlertTriangle, X, Globe, 
    Music, Save, Plus, Activity, RefreshCw, Eye, Terminal, Zap, FileText, Landmark, 
    Phone, ArrowRight, ExternalLink, MessageSquare, Copy, Check, HardDrive, Download, Bot 
} from 'lucide-react';
/* Updated imports for missing types */
import { User, WebhookLog, DistributionRelease, LegalRecord, FundingRequest, SyncBrief, OpportunityRequest, DistributionSubmission } from '../types';
import { dataService } from '../services/dataService';
import { webhookService } from '../services/webhookService';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [releases, setReleases] = useState<DistributionRelease[]>([]);
  const [distSubmissions, setDistSubmissions] = useState<DistributionSubmission[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [legalRecords, setLegalRecords] = useState<LegalRecord[]>([]);
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [syncBriefs, setSyncBriefs] = useState<SyncBrief[]>([]);
  const [opportunityRequests, setOpportunityRequests] = useState<OpportunityRequest[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'distributions' | 'legal' | 'funding' | 'opportunities' | 'requests' | 'webhooks'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const [viewingSubmission, setViewingSubmission] = useState<DistributionSubmission | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    // All methods now implemented in dataService.ts
    const [userData, releaseData, distData, legalData, fundingData, briefData, opReqData] = await Promise.all([
        dataService.getAllUsers(),
        dataService.getAllReleases(),
        dataService.getAllDistributionSubmissions(),
        dataService.getAllLegalRecords(),
        dataService.getAllFundingRequests(),
        dataService.getAllSyncBriefs(),
        dataService.getAllOpportunityRequests()
    ]);
    setUsers(userData);
    setReleases(releaseData);
    setDistSubmissions(distData);
    setLegalRecords(legalData);
    setFundingRequests(fundingData);
    setSyncBriefs(briefData);
    setOpportunityRequests(opReqData);
    setLogs(webhookService.getLogs());
    setLoading(false);
  };

  const handleCopy = (text: string, field: string) => {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1500);
  };

  const updateSubmissionStatus = async (id: string, status: DistributionSubmission['status']) => {
      await dataService.updateDistributionStatus(id, status);
      setDistSubmissions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      if (viewingSubmission?.id === id) setViewingSubmission(prev => prev ? { ...prev, status } : null);
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-6 rounded-xl gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-500" /> Admin Command Center
                </h1>
                <p className="text-slate-400 text-sm mt-1">Institutional Fulfillment Terminal</p>
            </div>
            <button onClick={loadAllData} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Sync Data
            </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 overflow-x-auto">
            {[
                { id: 'users', label: 'User Registry', icon: Users },
                { id: 'distributions', label: 'Distribution Vault', icon: Globe },
                { id: 'opportunities', label: 'Briefs Ledger', icon: Zap },
                { id: 'requests', label: 'Op Requests', icon: MessageSquare },
                { id: 'funding', label: 'Funding Pool', icon: Landmark },
                { id: 'legal', label: 'Legal Vault', icon: FileText },
                { id: 'webhooks', label: 'System Logs', icon: Activity }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id 
                        ? 'border-red-500 text-red-400 bg-slate-900/50' 
                        : 'border-transparent text-slate-500 hover:text-white'
                    }`}
                >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1">
            {activeTab === 'distributions' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* List Pane */}
                        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[600px]">
                            <div className="p-4 border-b border-slate-800 bg-slate-950">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Pending Fulfillment</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto custom-scrollbar">
                                {distSubmissions.map(sub => (
                                    <button 
                                        key={sub.id} 
                                        onClick={() => setViewingSubmission(sub)}
                                        className={`w-full text-left p-4 border-b border-slate-800 transition-all hover:bg-slate-800 ${viewingSubmission?.id === sub.id ? 'bg-indigo-900/20 border-l-4 border-l-red-500' : ''}`}
                                    >
                                        <div className="flex gap-3 items-center">
                                            <div className="w-10 h-10 rounded bg-slate-800 overflow-hidden shrink-0 border border-white/5">
                                                <img src={sub.coverUrl} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="font-bold text-white text-sm truncate">{sub.title}</div>
                                                <div className="text-[10px] text-slate-500 uppercase font-black truncate">{sub.artistName}</div>
                                            </div>
                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border ${
                                                sub.status === 'live' ? 'border-green-500 text-green-500' :
                                                sub.status === 'delivered' ? 'border-cyan-500 text-cyan-500' :
                                                'border-yellow-500 text-yellow-500'
                                            }`}>{sub.status}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Fulfillment Terminal Pane */}
                        <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative">
                            {viewingSubmission ? (
                                <div className="flex-1 flex flex-col overflow-hidden">
                                    <div className="p-6 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                                        <div className="flex items-center gap-4">
                                            <Terminal className="w-5 h-5 text-green-500" />
                                            <h3 className="font-black text-white uppercase tracking-widest text-sm">Release Fulfillment Terminal</h3>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => updateSubmissionStatus(viewingSubmission.id, 'processing')} className="px-3 py-1 bg-yellow-600 text-white text-[10px] font-bold rounded">Mark Processing</button>
                                            <button onClick={() => updateSubmissionStatus(viewingSubmission.id, 'delivered')} className="px-3 py-1 bg-cyan-600 text-white text-[10px] font-bold rounded">Mark Delivered</button>
                                            <button onClick={() => updateSubmissionStatus(viewingSubmission.id, 'live')} className="px-3 py-1 bg-green-600 text-white text-[10px] font-bold rounded">Mark Live</button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {/* Data Group 1 */}
                                            <section className="space-y-4">
                                                <h4 className="text-[10px] font-black text-green-500 uppercase tracking-widest border-b border-green-500/20 pb-2">Core Metadata</h4>
                                                {[
                                                    { label: 'Release Title', value: viewingSubmission.title },
                                                    { label: 'Primary Artist', value: viewingSubmission.artistName },
                                                    { label: 'Label', value: viewingSubmission.recordLabel },
                                                    { label: 'Genre', value: viewingSubmission.primaryGenre },
                                                    { label: 'Release Date', value: viewingSubmission.releaseDate }
                                                ].map(item => (
                                                    <div key={item.label} className="flex justify-between items-center group">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{item.label}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-white text-sm font-mono">{item.value}</span>
                                                            <button onClick={() => handleCopy(item.value, item.label)} className="text-slate-700 hover:text-green-400"><Copy className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </section>

                                            {/* Data Group 2 */}
                                            <section className="space-y-4">
                                                <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest border-b border-cyan-500/20 pb-2">Artist Context</h4>
                                                {[
                                                    { label: 'User UID', value: viewingSubmission.userId },
                                                    { label: 'Contact Email', value: viewingSubmission.userEmail },
                                                    { label: 'Artist ID', value: viewingSubmission.id }
                                                ].map(item => (
                                                    <div key={item.label} className="flex justify-between items-center group">
                                                        <span className="text-[10px] text-slate-500 font-bold uppercase">{item.label}</span>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-white text-sm font-mono truncate max-w-[150px]">{item.value}</span>
                                                            <button onClick={() => handleCopy(item.value, item.label)} className="text-slate-700 hover:text-cyan-400"><Copy className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </section>
                                        </div>

                                        {/* Tracks Table */}
                                        <section>
                                            <h4 className="text-[10px] font-black text-purple-500 uppercase tracking-widest border-b border-purple-500/20 pb-2 mb-4">Track Assets ({viewingSubmission.tracks.length})</h4>
                                            <div className="space-y-4">
                                                {viewingSubmission.tracks.map((track, i) => (
                                                    <div key={i} className="bg-slate-900/50 p-4 rounded-xl border border-slate-800 flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-xs text-slate-700 font-black italic">#{i+1}</div>
                                                            <div>
                                                                <div className="text-sm font-bold text-white uppercase">{track.title}</div>
                                                                <div className="text-[10px] text-slate-500">ISRC: {track.isrc || 'AUTO-GEN'} • {track.isExplicit ? 'EXPLICIT' : 'CLEAN'}</div>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => handleCopy(track.title, `t${i}_title`)} className="p-2 bg-slate-800 rounded hover:bg-indigo-600 transition-all" title="Copy Track Title"><Copy className="w-3.5 h-3.5"/></button>
                                                            <button className="p-2 bg-slate-800 rounded hover:bg-green-600 transition-all" title="Download Asset"><Download className="w-3.5 h-3.5"/></button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center text-slate-700">
                                    <Bot className="w-16 h-16 mb-4 opacity-10" />
                                    <p className="font-black uppercase text-xs tracking-widest">Select a release for manual fulfillment</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* User Registry tab implemented with getAllUsers */}
            {activeTab === 'users' && (
                <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" placeholder="Search users..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-red-500 w-64"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-3">User</th>
                                    <th className="px-6 py-3">Role & Plan</th>
                                    <th className="px-6 py-3">Balance</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                                {users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                                    <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-bold text-white">{user.displayName}</td>
                                        <td className="px-6 py-4 uppercase text-[10px] text-slate-400">{user.role} • {user.plan}</td>
                                        <td className="px-6 py-4 font-mono">${user.walletBalance.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 bg-slate-800 rounded-lg"><Eye className="w-4 h-4"/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
};
