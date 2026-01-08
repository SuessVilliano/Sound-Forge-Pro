
import React, { useState, useEffect } from 'react';
import { Users, Trash2, Edit2, Shield, Search, CheckCircle2, AlertTriangle, X, Globe, Music, Save, Plus, Activity, RefreshCw, Eye, Terminal, Zap, FileText, Landmark, Phone, ArrowRight, ExternalLink, MessageSquare } from 'lucide-react';
import { User, WebhookLog, DistributionRelease, LegalRecord, FundingRequest, SyncBrief, OpportunityRequest } from '../types';
import { dataService } from '../services/dataService';
import { webhookService } from '../services/webhookService';
import { authService } from '../services/authService';
import { alchemyService } from '../services/alchemyService';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [releases, setReleases] = useState<DistributionRelease[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [legalRecords, setLegalRecords] = useState<LegalRecord[]>([]);
  const [fundingRequests, setFundingRequests] = useState<FundingRequest[]>([]);
  const [syncBriefs, setSyncBriefs] = useState<SyncBrief[]>([]);
  const [opportunityRequests, setOpportunityRequests] = useState<OpportunityRequest[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'distributions' | 'legal' | 'funding' | 'opportunities' | 'requests' | 'webhooks'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewingRequest, setViewingRequest] = useState<FundingRequest | null>(null);
  const [viewingBrief, setViewingBrief] = useState<SyncBrief | null>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [userData, releaseData, legalData, fundingData, briefData, opReqData] = await Promise.all([
        dataService.getAllUsers(),
        dataService.getAllReleases(),
        dataService.getAllLegalRecords(),
        dataService.getAllFundingRequests(),
        dataService.getAllSyncBriefs(),
        dataService.getAllOpportunityRequests()
    ]);
    setUsers(userData);
    setReleases(releaseData);
    setLegalRecords(legalData);
    setFundingRequests(fundingData);
    setSyncBriefs(briefData);
    setOpportunityRequests(opReqData);
    setLogs(webhookService.getLogs());
    setLoading(false);
  };

  const filteredUsers = users.filter(u => 
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-6 rounded-xl gap-4">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-6 h-6 text-red-500" /> Admin Command Center
                </h1>
                <p className="text-slate-400 text-sm mt-1">LIV8 Entertainment Master Control</p>
            </div>
            <div className="flex gap-2">
                <button onClick={loadAllData} className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 overflow-x-auto">
            {[
                { id: 'users', label: 'User Registry', icon: Users },
                { id: 'opportunities', label: 'Briefs Ledger', icon: Zap },
                { id: 'requests', label: 'Op Requests', icon: MessageSquare },
                { id: 'funding', label: 'Funding Pool', icon: Landmark },
                { id: 'distributions', label: 'Distributions', icon: Globe },
                { id: 'legal', label: 'Legal Records', icon: FileText },
                { id: 'webhooks', label: 'System Logs', icon: Activity }
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-bold border-b-2 transition-colors whitespace-nowrap ${
                        activeTab === tab.id 
                        ? 'border-red-500 text-red-400 bg-slate-900/50' 
                        : 'border-transparent text-slate-500 hover:text-white'
                    }`}
                >
                    <tab.icon className="w-4 h-4" /> {tab.label}
                </button>
            ))}
        </div>

        {/* --- OPPORTUNITIES TAB --- */}
        {activeTab === 'opportunities' && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-3">Brief Title</th>
                            <th className="px-6 py-3">Source</th>
                            <th className="px-6 py-3">Deadline</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-300">
                        {syncBriefs.map(brief => (
                            <tr key={brief.id} className="hover:bg-slate-800/50">
                                <td className="px-6 py-4 font-bold text-white">{brief.title}</td>
                                <td className="px-6 py-4 uppercase text-[10px]">{brief.source}</td>
                                <td className="px-6 py-4">{brief.deadline ? new Date(brief.deadline).toLocaleDateString() : 'Rolling'}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-500/10 text-green-400 px-2 py-0.5 rounded text-[10px] font-black uppercase">Live</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 bg-slate-800 rounded-lg"><Eye className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* --- OP REQUESTS TAB --- */}
        {activeTab === 'requests' && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-xs font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                            <th className="px-6 py-3">Artist</th>
                            <th className="px-6 py-3">Target Brief</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-300">
                        {opportunityRequests.map(req => (
                            <tr key={req.id} className="hover:bg-slate-800/50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-white">{req.userName}</div>
                                    <div className="text-[10px] text-slate-500">{req.userEmail}</div>
                                </td>
                                <td className="px-6 py-4 font-bold text-indigo-400">{req.briefTitle}</td>
                                <td className="px-6 py-4 text-[10px] uppercase font-bold">{req.type}</td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded text-[10px] font-black uppercase">{req.status}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 bg-slate-800 rounded-lg"><Eye className="w-4 h-4"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* Other tabs follow the same pattern... */}
        {activeTab === 'funding' && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-3">Artist / Request</th>
                                <th className="px-6 py-3">Royalties (6m)</th>
                                <th className="px-6 py-3">Indicative Range</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {fundingRequests.map(req => (
                                <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{req.artistName}</div>
                                        <div className="text-[10px] text-slate-500 uppercase font-mono">{req.id}</div>
                                    </td>
                                    <td className="px-6 py-4 text-white font-mono">${req.totalNetRoyaltiesLast6Months.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-cyan-400 font-bold">${req.calculatedOfferLow.toLocaleString()} – ${req.calculatedOfferHigh.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                            req.status === 'forwarded' ? 'bg-blue-500/10 text-blue-400' :
                                            req.status === 'approved-partner' ? 'bg-green-500/10 text-green-400' :
                                            'bg-slate-700 text-slate-300'
                                        }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setViewingRequest(req)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white"><Eye className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

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
                            {filteredUsers.map(user => (
                                <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold text-white">{user.displayName}</td>
                                    <td className="px-6 py-4 uppercase text-[10px] text-slate-400">{user.role} • {user.plan}</td>
                                    <td className="px-6 py-4 font-mono">${user.walletBalance.toLocaleString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button onClick={() => setViewingUser(user)} className="p-2 bg-slate-800 rounded-lg"><Eye className="w-4 h-4"/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
    </div>
  );
};
