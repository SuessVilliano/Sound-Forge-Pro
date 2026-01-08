
import React, { useState, useEffect } from 'react';
import { Users, Trash2, Edit2, Shield, Search, CheckCircle2, AlertTriangle, X, Globe, Music, Save, Plus, Activity, RefreshCw, Eye, Terminal, Zap, FileText, Landmark, Phone, ArrowRight, ExternalLink } from 'lucide-react';
import { User, WebhookLog, DistributionRelease, LegalRecord, FundingRequest } from '../types';
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
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'distributions' | 'legal' | 'funding' | 'webhooks'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [viewingRequest, setViewingRequest] = useState<FundingRequest | null>(null);
  const [userTracks, setUserTracks] = useState<any[]>([]);
  const [newUser, setNewUser] = useState<Partial<User>>({ plan: 'free', role: 'artist' });
  const [alchemyWebhookUrl, setAlchemyWebhookUrl] = useState('');

  useEffect(() => {
    loadAllData();
    setAlchemyWebhookUrl(alchemyService.getStoredWebhookUrl());
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [userData, releaseData, legalData, fundingData] = await Promise.all([
        dataService.getAllUsers(),
        dataService.getAllReleases(),
        dataService.getAllLegalRecords(),
        dataService.getAllFundingRequests()
    ]);
    setUsers(userData);
    setReleases(releaseData);
    setLegalRecords(legalData);
    setFundingRequests(fundingData);
    setLogs(webhookService.getLogs());
    setLoading(false);
  };

  const updateRequestStatus = async (id: string, status: FundingRequest['status']) => {
      await dataService.updateFundingRequest(id, { status });
      setFundingRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      if (viewingRequest?.id === id) setViewingRequest({ ...viewingRequest, status });
  };

  const handleRetryWebhook = async (id: string) => {
      try {
          await dataService.retryFundingWebhook(id);
          alert("Retry successful");
          loadAllData();
      } catch(e) {
          alert("Retry failed");
      }
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
                { id: 'funding', label: 'Funding Requests', icon: Landmark },
                { id: 'distributions', label: 'Global Distributions', icon: Globe },
                { id: 'legal', label: 'Legal & Compliance', icon: FileText },
                { id: 'webhooks', label: 'Webhook & Alchemy', icon: Activity }
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

        {/* --- FUNDING TAB --- */}
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
                                <th className="px-6 py-3">Webhook</th>
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
                                    <td className="px-6 py-4">
                                        {req.webhookDelivery.success ? (
                                            <span className="text-green-500 flex items-center gap-1 text-[10px] font-bold uppercase"><CheckCircle2 className="w-3 h-3"/> Sent</span>
                                        ) : (
                                            <button onClick={() => handleRetryWebhook(req.id)} className="text-red-400 hover:underline flex items-center gap-1 text-[10px] font-bold uppercase"><AlertTriangle className="w-3 h-3"/> Failed (Retry?)</button>
                                        )}
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

        {/* --- USERS TAB --- */}
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

        {/* --- MODALS --- */}
        {viewingRequest && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl space-y-8">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-white uppercase tracking-tight">Funding Proposal Detail</h2>
                            <p className="text-slate-500 font-mono text-xs mt-1">ID: {viewingRequest.id}</p>
                        </div>
                        <button onClick={() => setViewingRequest(null)} className="p-2 text-slate-400 hover:text-white"><X className="w-8 h-8"/></button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <section className="bg-slate-850 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Artist Metadata</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-[10px] text-slate-500 block">Artist Name</label><span className="text-white font-bold">{viewingRequest.artistName}</span></div>
                                    <div><label className="text-[10px] text-slate-500 block">Stage Name</label><span className="text-white font-bold">{viewingRequest.stageName || 'N/A'}</span></div>
                                    <div><label className="text-[10px] text-slate-500 block">Distributor</label><span className="text-cyan-400 font-bold">{viewingRequest.primaryDistributor}</span></div>
                                    <div><label className="text-[10px] text-slate-500 block">Location</label><span className="text-white font-bold">{viewingRequest.country}</span></div>
                                </div>
                            </section>

                            <section className="bg-slate-850 p-6 rounded-xl border border-slate-800">
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Financial Core</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-900 p-3 rounded-lg"><label className="text-[10px] text-slate-500 block">6m Royalties</label><span className="text-xl font-mono text-white">${viewingRequest.totalNetRoyaltiesLast6Months.toLocaleString()}</span></div>
                                    <div className="bg-slate-900 p-3 rounded-lg"><label className="text-[10px] text-slate-500 block">Avg Monthly</label><span className="text-xl font-mono text-white">${viewingRequest.avgMonthlyRoyalties.toFixed(0)}</span></div>
                                    <div className="bg-slate-900 p-3 rounded-lg"><label className="text-[10px] text-slate-500 block">Ownership</label><span className="text-xl font-mono text-cyan-400">{viewingRequest.ownsMastersPercent}%</span></div>
                                </div>
                            </section>

                            <section>
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2 block">Catalog Notes</label>
                                <p className="bg-slate-950 p-4 rounded-xl text-slate-300 text-sm italic border border-slate-800">{viewingRequest.catalogNotes || 'No notes provided.'}</p>
                            </section>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Admin Controls</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Internal Status</label>
                                        <select 
                                            value={viewingRequest.status}
                                            onChange={e => updateRequestStatus(viewingRequest.id, e.target.value as any)}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-xs"
                                        >
                                            <option value="new">New</option>
                                            <option value="reviewing">Reviewing</option>
                                            <option value="forwarded">Forwarded</option>
                                            <option value="needs-info">Needs Info</option>
                                            <option value="approved-partner">Approved</option>
                                            <option value="declined">Declined</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Admin Notes</label>
                                        <textarea className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white text-xs h-24" placeholder="Add internal review notes..." />
                                    </div>
                                    <button onClick={() => updateRequestStatus(viewingRequest.id, 'forwarded')} className="w-full py-2 bg-indigo-600 rounded-lg text-white text-xs font-bold">Deploy to Partner Pipeline</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
