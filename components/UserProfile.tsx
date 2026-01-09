import React, { useState } from 'react';
// Added Loader2 to lucide-react imports to resolve missing name error
import { User, Mail, Camera, Save, X, Shield, CreditCard, LogOut, CheckCircle2, Webhook, Link, AlertTriangle, Trash2, BarChart2, FileText, Bell, Tag, Download, Eye, ExternalLink, Lock, Loader2 } from 'lucide-react';
import { User as UserType } from '../types';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { LegalOnboarding } from './LegalOnboarding';

interface UserProfileProps {
  user: UserType;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [photoURL, setPhotoURL] = useState(user.photoURL);
  
  // Data Connections
  const [chartmetricId, setChartmetricId] = useState(user.chartmetricArtistId?.toString() || '');
  
  // Webhook State
  const [webhookUrl, setWebhookUrl] = useState(user.webhooks?.url || '');
  const [webhookEnabled, setWebhookEnabled] = useState(user.webhooks?.enabled || false);
  
  // Notification State
  const [emailSyncMatches, setEmailSyncMatches] = useState(user.notificationSettings?.emailSyncMatches || false);
  const [genres, setGenres] = useState(user.genrePreferences?.join(', ') || '');

  // Deletion State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Legal View State
  const [viewAgreement, setViewAgreement] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const webhooks = {
          url: webhookUrl,
          enabled: webhookEnabled,
          events: user.webhooks?.events || ['sale', 'stream', 'placement']
      };

      const cmId = chartmetricId ? parseInt(chartmetricId) : undefined;

      await authService.updateUserProfile({ 
          displayName, 
          photoURL: photoURL || undefined,
          chartmetricArtistId: cmId,
          webhooks: webhooks as any,
          notificationSettings: {
              emailSyncMatches
          },
          genrePreferences: genres.split(',').map(g => g.trim()).filter(g => g.length > 0)
      });
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMessage("Profile settings updated!");
      setIsEditing(false);
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error(error);
      setMessage("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = () => {
      const randomId = Math.floor(Math.random() * 1000);
      setPhotoURL(`https://picsum.photos/seed/${randomId}/200/200`);
  };

  const handleDeleteAccount = async () => {
      setIsDeleting(true);
      try {
          await dataService.deleteUserAccount(user.uid);
          await authService.logout();
      } catch (e) {
          alert("Failed to delete account. Please contact support.");
          setIsDeleting(false);
      }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Account Hub</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Institutional configuration and identity management.</p>
        </div>
        <div className="flex gap-2">
            {!isEditing ? (
                <button 
                    onClick={() => setIsEditing(true)}
                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-950 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl"
                >
                    Edit Node
                </button>
            ) : (
                <button 
                    onClick={() => setIsEditing(false)}
                    className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest"
                >
                    Cancel
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Col: Identity & Developer */}
        <div className="md:col-span-2 space-y-8">
            
            {/* PERSONAL INFO */}
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Identity Metadata
                </h3>

                <div className="flex flex-col sm:flex-row gap-8 items-start">
                    <div className="relative group shrink-0">
                        <div className="w-28 h-28 rounded-[2rem] bg-slate-200 dark:bg-slate-900 overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105 duration-500">
                            <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                        </div>
                        {isEditing && (
                            <button 
                                onClick={handleImageChange}
                                className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-500 transition-all shadow-xl"
                                title="Change Photo"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 w-full space-y-6">
                        <div>
                            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Professional Stage Name</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white font-bold focus:border-indigo-500 outline-none transition-all"
                                />
                            ) : (
                                <div className="text-slate-900 dark:text-white font-black text-xl uppercase tracking-tight flex items-center gap-3">
                                    {displayName}
                                    {user.plan !== 'free' && <CheckCircle2 className="w-5 h-5 text-cyan-500" />}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-[9px] font-black text-slate-500 dark:text-slate-500 uppercase tracking-widest mb-2 ml-1">Operational Email Address</label>
                            <div className="text-slate-900 dark:text-slate-300 font-bold text-sm flex items-center gap-2 opacity-80 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-800 w-fit">
                                <Mail className="w-4 h-4 text-slate-400" /> {user.email}
                                <span className="text-[8px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded uppercase font-black tracking-widest ml-2 border border-green-500/20">Verified Signal</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* LEGAL VAULT */}
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Lock className="w-3.5 h-3.5 text-indigo-500" /> Institutional Legal Vault
                    </h3>
                    <span className="text-[8px] font-black uppercase text-slate-500 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded">2 Documents Secured</span>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all group cursor-pointer" onClick={() => setViewAgreement(true)}>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                <FileText className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Vocal IP & Content License</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                    {user.hasSignedLegal 
                                        ? `Digitally Executed: ${new Date(user.legalSignedDate!).toLocaleDateString()}` 
                                        : "Awaiting Electronic Signature"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><Eye className="w-4 h-4" /></button>
                             <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><Download className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-500">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Service Level Agreement (SLA)</p>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Sound Merge Standard Terms v2.5</p>
                            </div>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><Eye className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            {/* WEBHOOKS & API */}
            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <Webhook className="w-3.5 h-3.5 text-purple-500" /> Ledger Events & Webhooks
                </h3>
                
                <p className="text-sm text-slate-500 font-medium mb-8 leading-relaxed">
                    Broadcast institutional events to external nodes (Zapier, Make, Discord). Receive real-time payloads for sales, streams, and licensing placements.
                </p>

                {isEditing ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Destination Webhook Endpoint</label>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-100 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800"><Link className="w-4 h-4 text-slate-400" /></div>
                                <input 
                                    type="text" 
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://hooks.example.com/..."
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-purple-500 outline-none font-mono"
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox" 
                                checked={webhookEnabled} 
                                onChange={(e) => setWebhookEnabled(e.target.checked)}
                                className="w-5 h-5 rounded-lg border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-purple-600 focus:ring-purple-500" 
                            />
                            <span className="text-xs text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest group-hover:text-white transition-colors">Activate Real-Time Relay</span>
                        </label>
                    </div>
                ) : (
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex items-center justify-between shadow-inner">
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${user.webhooks?.enabled ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                            <code className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate max-w-xs">
                                {user.webhooks?.url || "Relay Endpoint Not Initialized"}
                            </code>
                        </div>
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{user.webhooks?.enabled ? 'Active Relay' : 'Standby'}</span>
                    </div>
                )}
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-50 dark:bg-red-950/10 rounded-2xl border border-red-200 dark:border-red-900/30 p-8 shadow-sm">
                <h3 className="text-lg font-black text-red-600 dark:text-red-400 mb-4 flex items-center gap-2 uppercase tracking-tight italic">
                    <AlertTriangle className="w-5 h-5" /> Operational Hazard
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                    Terminating this node will permanently purge all forged tracks, biometric voice registrations, and licensing history from the ledger. This process is irreversible.
                </p>
                <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-8 py-3 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-700 transition-all flex items-center gap-3 shadow-xl shadow-red-600/20"
                >
                    <Trash2 className="w-4 h-4" /> Finalize Deletion
                </button>
            </div>
        </div>

        {/* Right Col: Plan & Status */}
        <div className="space-y-8">
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 rounded-2xl p-8 text-white border border-white/5 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Shield className="w-32 h-32 rotate-12" />
                </div>
                
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Membership Status</h3>
                <div className="text-3xl font-black mb-8 capitalize flex items-center gap-3 italic">
                    {user.plan} <span className="text-sm font-bold text-slate-600 uppercase not-italic tracking-widest">Node</span>
                </div>

                <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        {user.plan === 'free' ? '80% Net Royalty Split' : '100% Net Royalty Split'}
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${user.voiceShieldEnabled ? 'bg-cyan-500' : 'bg-slate-800'}`}>
                            {user.voiceShieldEnabled ? <CheckCircle2 className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-slate-500" />}
                        </div>
                        VoiceShield™ {user.voiceShieldEnabled ? 'Active' : 'Locked'}
                    </div>
                </div>

                <button className="w-full py-4 bg-white text-slate-950 font-black uppercase text-[10px] tracking-[0.2em] rounded-xl hover:bg-slate-200 transition-all shadow-xl">
                    Sync Tier Upgrade
                </button>
            </div>

            <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Settlement & Payouts
                </h3>
                <div className="mb-8">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Liquid Balance</span>
                    <div className="text-4xl font-black text-slate-900 dark:text-white mt-1 tracking-tighter">${user.walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                </div>
                <button className="w-full border-2 border-slate-200 dark:border-slate-800 rounded-xl py-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                    Execute Withdrawal
                </button>
            </div>

            <button 
                onClick={() => authService.logout()}
                className="w-full flex items-center justify-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 py-4 rounded-2xl transition-all font-black uppercase text-[10px] tracking-widest border border-transparent hover:border-red-500/20"
            >
                <LogOut className="w-4 h-4" /> De-Authorize Signal
            </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                  <div className="p-10 text-center">
                      <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                          <AlertTriangle className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 uppercase tracking-tighter italic">Confirm Termination?</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-10 leading-relaxed font-medium">
                          Node destruction is instantaneous. All tracks, biometric signatures, and licensing records will be permanently purged.
                      </p>
                      
                      <div className="flex flex-col gap-3">
                         <button 
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="w-full py-4 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
                          >
                              {isDeleting ? <><Loader2 className="w-4 h-4 animate-spin" /> Destructing...</> : 'Execute Node Deletion'}
                          </button>
                          <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="w-full py-4 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
                          >
                              Cancel Request
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Legal Agreement Viewer Modal */}
      <LegalOnboarding 
          isOpen={viewAgreement} 
          onSign={() => {}} 
          readOnly={true}
          onClose={() => setViewAgreement(false)}
          signedDate={user.legalSignedDate}
      />
    </div>
  );
};