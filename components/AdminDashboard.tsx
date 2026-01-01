
import React, { useState, useEffect } from 'react';
import { Users, Trash2, Edit2, Shield, Search, CheckCircle2, AlertTriangle, X, Globe, Music, Save, Plus, Activity, RefreshCw, Eye, Terminal, Zap, FileText } from 'lucide-react';
import { User, WebhookLog, DistributionRelease, LegalRecord } from '../types';
import { dataService } from '../services/dataService';
import { webhookService } from '../services/webhookService';
import { authService } from '../services/authService';
import { alchemyService } from '../services/alchemyService';

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [releases, setReleases] = useState<DistributionRelease[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [legalRecords, setLegalRecords] = useState<LegalRecord[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'distributions' | 'webhooks' | 'legal'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals & State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [userTracks, setUserTracks] = useState<any[]>([]);
  const [newUser, setNewUser] = useState<Partial<User>>({ plan: 'free', role: 'artist' });
  const [alchemyWebhookUrl, setAlchemyWebhookUrl] = useState('');

  useEffect(() => {
    loadAllData();
    // Load persisted webhook URL
    setAlchemyWebhookUrl(alchemyService.getStoredWebhookUrl());
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    const [userData, releaseData, legalData] = await Promise.all([
        dataService.getAllUsers(),
        dataService.getAllReleases(),
        dataService.getAllLegalRecords()
    ]);
    setUsers(userData);
    setReleases(releaseData);
    setLegalRecords(legalData);
    setLogs(webhookService.getLogs()); // Initial fetch of in-memory logs
    setLoading(false);
  };

  const refreshLogs = () => {
      setLogs([...webhookService.getLogs()]);
  };

  const handleDeleteUser = async (userId: string) => {
      if(!confirm("Are you sure? This will wipe all user data.")) return;
      try {
          await dataService.deleteUserAccount(userId);
          setUsers(prev => prev.filter(u => u.uid !== userId));
          alert(`User ${userId} deleted.`);
      } catch (e) {
          alert("Failed to delete user.");
      }
  };

  const handleCreateUser = async () => {
      try {
          await dataService.adminCreateUser(newUser);
          setShowCreateModal(false);
          loadAllData();
          alert("User created successfully");
      } catch(e) {
          alert("Error creating user");
      }
  };

  const handleViewUser = (user: User) => {
      setViewingUser(user);
      const unsub = dataService.subscribeToTracks(user.uid, (tracks) => {
          setUserTracks(tracks);
      });
  };

  const handleTestWebhook = () => {
      const currentUser = authService.getCurrentUser();
      if(currentUser) {
          webhookService.sendSystemEvent('admin_test', currentUser, { note: "Manual verification test" });
          refreshLogs();
          alert("Test webhook sent. Check Logs tab.");
      }
  };

  const handleCreateAlchemyWebhook = async () => {
      if (!alchemyWebhookUrl) {
          alert("Please enter a valid Webhook URL.");
          return;
      }
      
      const activeAddresses = users.map(u => "0x" + u.uid.substring(0, 40)); // Fake addresses for demo
      try {
          const result = await alchemyService.createWebhook(alchemyWebhookUrl, activeAddresses);
          alert(`Alchemy Webhook Updated & Registered Successfully!\nID: ${result.id}`);
          // Ensure state is synced (service handles localStorage, but good for UI consistency)
          setAlchemyWebhookUrl(alchemyWebhookUrl);
      } catch (e) {
          alert("Failed to configure Alchemy.");
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
                <button 
                    onClick={loadAllData} 
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh Data
                </button>
            </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 overflow-x-auto">
            {[
                { id: 'users', label: 'User Registry', icon: Users },
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

        {/* --- USERS TAB --- */}
        {activeTab === 'users' && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search users..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-red-500 w-64"
                        />
                    </div>
                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-red-900/20"
                    >
                        <Plus className="w-4 h-4" /> Create User
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Role & Plan</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Balance</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {filteredUsers.map(user => (
                                <tr key={user.uid} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                {user.photoURL ? <img src={user.photoURL} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{user.displayName[0]}</div>}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-900 dark:text-white">{user.displayName} {user.isAdmin && <span className="text-[10px] bg-red-500 text-white px-1.5 rounded ml-1">ADMIN</span>}</div>
                                                <div className="text-xs text-slate-500 font-mono">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="capitalize font-bold text-white">{user.role}</span>
                                            <span className={`text-xs uppercase ${user.plan === 'label' ? 'text-purple-400' : user.plan === 'pro' ? 'text-cyan-400' : 'text-slate-500'}`}>
                                                {user.plan} Plan
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.voiceShieldEnabled ? (
                                            <span className="text-green-500 flex items-center gap-1 text-xs font-bold"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                                        ) : (
                                            <span className="text-slate-400 text-xs">Standard</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">
                                        ${user.walletBalance.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleViewUser(user)} className="p-2 text-slate-400 hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteUser(user.uid)} className="p-2 text-red-400 hover:text-white bg-red-50 dark:bg-red-900/10 hover:bg-red-600 rounded-lg transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- DISTRIBUTIONS TAB --- */}
        {activeTab === 'distributions' && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-900 dark:text-white">Active Releases</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-3">Release Title</th>
                                <th className="px-6 py-3">Artist</th>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">UPC/ISRC</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {releases.map((rel, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4 font-bold text-white">{rel.title}</td>
                                    <td className="px-6 py-4 text-slate-400">{rel.artistName}</td>
                                    <td className="px-6 py-4">{rel.releaseDate}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{rel.upc || 'Pending'}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded text-xs font-bold uppercase">
                                            {rel.status || 'Processing'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- LEGAL RECORDS TAB --- */}
        {activeTab === 'legal' && (
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-500" /> Signed Agreements Archive
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-xs font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-3">User</th>
                                <th className="px-6 py-3">Document</th>
                                <th className="px-6 py-3">Signature</th>
                                <th className="px-6 py-3">Timestamp (UTC)</th>
                                <th className="px-6 py-3">IP Address</th>
                                <th className="px-6 py-3 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                            {legalRecords.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-white">{record.userName}</div>
                                        <div className="text-xs text-slate-500">{record.userEmail}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300">
                                        {record.documentType} <span className="text-slate-500 text-xs">({record.documentVersion})</span>
                                    </td>
                                    <td className="px-6 py-4 font-serif italic text-cyan-200">
                                        "{record.signature}"
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                                        {new Date(record.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                        {record.ipAddress || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="bg-green-500/10 text-green-500 px-2 py-1 rounded text-xs font-bold uppercase">
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {legalRecords.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-slate-500">No legal records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {/* --- WEBHOOKS & ALCHEMY TAB --- */}
        {activeTab === 'webhooks' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Alchemy Configuration */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-5 h-5 text-purple-500" />
                            <h3 className="font-bold text-white">Alchemy Configuration</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 mb-1 block">Notify Webhook URL</label>
                                <input 
                                    type="text" 
                                    value={alchemyWebhookUrl}
                                    onChange={(e) => setAlchemyWebhookUrl(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-xs text-slate-300"
                                />
                            </div>
                            <button 
                                onClick={handleCreateAlchemyWebhook}
                                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded text-xs transition-colors"
                            >
                                Register Alchemy Webhook
                            </button>
                            <p className="text-[10px] text-slate-500">
                                Registers address monitoring for all active user wallets on Solana Mainnet.
                            </p>
                        </div>
                    </div>
                </div>

                {/* System Logs */}
                <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden font-mono">
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Terminal className="w-4 h-4 text-green-500" /> System Event Stream
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={handleTestWebhook} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700">Test Event</button>
                            <button onClick={refreshLogs} className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700">Refresh</button>
                        </div>
                    </div>
                    <div className="h-[500px] overflow-y-auto p-4 space-y-2 bg-black">
                        {logs.length === 0 ? (
                            <div className="text-slate-500 text-center mt-10">No events logged yet.</div>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="text-xs border-b border-slate-900 pb-2 mb-2">
                                    <div className="flex gap-3 mb-1">
                                        <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                                        <span className={`font-bold ${log.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>{log.event.toUpperCase()}</span>
                                        <span className="text-slate-400">{log.destination}</span>
                                    </div>
                                    <div className="text-slate-300 break-all pl-20">
                                        {JSON.stringify(log.payload)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* --- CREATE USER MODAL --- */}
        {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-white">Create New User</h2>
                        <button onClick={() => setShowCreateModal(false)}><X className="w-5 h-5 text-slate-400" /></button>
                    </div>
                    <div className="space-y-4">
                        <input 
                            placeholder="Display Name" 
                            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"
                            onChange={e => setNewUser({...newUser, displayName: e.target.value})}
                        />
                        <input 
                            placeholder="Email" 
                            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"
                            onChange={e => setNewUser({...newUser, email: e.target.value})}
                        />
                        <select 
                            className="w-full bg-slate-950 border border-slate-800 rounded p-3 text-white"
                            onChange={e => setNewUser({...newUser, plan: e.target.value as any})}
                        >
                            <option value="free">Free Plan</option>
                            <option value="pro">Pro Plan</option>
                            <option value="label">Label Plan</option>
                        </select>
                        <button 
                            onClick={handleCreateUser}
                            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 rounded-lg"
                        >
                            Create Account
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* --- VIEW USER MODAL --- */}
        {viewingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                    <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950 sticky top-0 z-10">
                        <div className="flex items-center gap-3">
                            <img src={viewingUser.photoURL || 'https://ui-avatars.com/api/?name=User'} className="w-10 h-10 rounded-full" />
                            <div>
                                <h2 className="text-xl font-bold text-white">{viewingUser.displayName}</h2>
                                <p className="text-xs text-slate-400">{viewingUser.email} • {viewingUser.uid}</p>
                            </div>
                        </div>
                        <button onClick={() => setViewingUser(null)}><X className="w-6 h-6 text-slate-400 hover:text-white" /></button>
                    </div>
                    
                    <div className="p-6 space-y-8">
                        {/* Profile Data */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-800 p-4 rounded-lg">
                                <div className="text-slate-500 mb-1">Current Plan</div>
                                <div className="text-white font-bold uppercase">{viewingUser.plan}</div>
                            </div>
                            <div className="bg-slate-800 p-4 rounded-lg">
                                <div className="text-slate-500 mb-1">Wallet Balance</div>
                                <div className="text-white font-bold">${viewingUser.walletBalance}</div>
                            </div>
                        </div>

                        {/* Tracks */}
                        <div>
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Music className="w-4 h-4" /> Music Library</h3>
                            <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden">
                                {userTracks.length === 0 ? (
                                    <div className="p-4 text-slate-500 text-center text-sm">No tracks found.</div>
                                ) : (
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-900 text-slate-500">
                                            <tr>
                                                <th className="p-3">Title</th>
                                                <th className="p-3">Plays</th>
                                                <th className="p-3">Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {userTracks.map(t => (
                                                <tr key={t.id}>
                                                    <td className="p-3 font-bold text-slate-300">{t.title}</td>
                                                    <td className="p-3 text-slate-400">{t.plays}</td>
                                                    <td className="p-3 text-slate-500">{new Date(t.createdAt).toLocaleDateString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
