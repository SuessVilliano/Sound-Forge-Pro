
import React, { useState } from 'react';
import { User, Mail, Camera, Save, X, Shield, CreditCard, LogOut, CheckCircle2, Webhook, Link, AlertTriangle, Trash2, BarChart2, FileText, Bell, Tag } from 'lucide-react';
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
      // Create Webhook Config Object
      const webhooks = {
          url: webhookUrl,
          enabled: webhookEnabled,
          events: user.webhooks?.events || ['sale', 'stream', 'placement'] // Default to all
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
      
      // Simulate delay
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
      // Simulate image upload
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your personal information and subscription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Identity & Developer */}
        <div className="md:col-span-2 space-y-6">
            
            {/* PERSONAL INFO */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Information</h3>
                    {!isEditing && (
                        <button 
                            onClick={() => setIsEditing(true)}
                            className="text-sm text-cyan-600 dark:text-cyan-400 font-bold hover:underline"
                        >
                            Edit Details
                        </button>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start">
                    <div className="relative group shrink-0">
                        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border-2 border-slate-200 dark:border-slate-700">
                            <img src={photoURL} alt={displayName} className="w-full h-full object-cover" />
                        </div>
                        {isEditing && (
                            <button 
                                onClick={handleImageChange}
                                className="absolute bottom-0 right-0 bg-cyan-500 text-white p-1.5 rounded-full hover:bg-cyan-400 transition-colors shadow-sm"
                                title="Change Photo"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    <div className="flex-1 w-full space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Display Name</label>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                                />
                            ) : (
                                <div className="text-slate-900 dark:text-white font-medium flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" /> {displayName}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
                            <div className="text-slate-900 dark:text-slate-300 font-medium flex items-center gap-2 opacity-80">
                                <Mail className="w-4 h-4 text-slate-400" /> {user.email}
                                <span className="text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* NOTIFICATIONS & MATCHING */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Bell className="w-5 h-5 text-yellow-500" /> Sync Match Alerts
                    </h3>
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Email Notifications</p>
                            <p className="text-xs text-slate-500">Get notified when an AI agent finds a perfect sync brief match.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={emailSyncMatches} 
                                onChange={(e) => setEmailSyncMatches(e.target.checked)}
                                disabled={!isEditing}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-500"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
                            <Tag className="w-3 h-3" /> Target Sync Genres
                        </label>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={genres}
                                onChange={(e) => setGenres(e.target.value)}
                                placeholder="e.g. Electronic, Pop, Cinematic (comma separated)"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                            />
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {user.genrePreferences?.length ? user.genrePreferences.map(g => (
                                    <span key={g} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded border border-slate-200 dark:border-slate-700">
                                        {g}
                                    </span>
                                )) : <span className="text-xs text-slate-500 italic">No genres selected.</span>}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* LEGAL & COMPLIANCE */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-slate-500" /> Legal & Compliance
                    </h3>
                </div>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">Service Agreement & Voice IP License</p>
                            <p className="text-xs text-slate-500">
                                {user.hasSignedLegal 
                                    ? `Signed on ${new Date(user.legalSignedDate!).toLocaleDateString()}` 
                                    : "Not signed yet"}
                            </p>
                        </div>
                        {user.hasSignedLegal && (
                            <button 
                                onClick={() => setViewAgreement(true)}
                                className="text-xs bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-3 py-1.5 rounded font-bold transition-colors"
                            >
                                View
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* DATA CONNECTIONS */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-blue-500" /> Data Connections
                    </h3>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Chartmetric Artist ID</label>
                        <p className="text-xs text-slate-500 mb-2">Connect your Chartmetric profile to pull official data into your analytics dashboard.</p>
                        {isEditing ? (
                            <input 
                                type="text" 
                                value={chartmetricId}
                                onChange={(e) => setChartmetricId(e.target.value)}
                                placeholder="e.g. 187689"
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                            />
                        ) : (
                            <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                                    {user.chartmetricArtistId ? `ID: ${user.chartmetricArtistId}` : 'Not Connected'}
                                </span>
                                {user.chartmetricArtistId && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* WEBHOOKS & API */}
            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Webhook className="w-5 h-5 text-purple-500" /> Developer Webhooks
                    </h3>
                </div>
                
                <p className="text-sm text-slate-500 mb-4">
                    Receive real-time JSON payloads for sales, streams, and sync placements. Connect to Zapier, Make, or your own server.
                </p>

                {isEditing ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Webhook URL</label>
                            <div className="flex items-center gap-2">
                                <Link className="w-4 h-4 text-slate-400" />
                                <input 
                                    type="text" 
                                    value={webhookUrl}
                                    onChange={(e) => setWebhookUrl(e.target.value)}
                                    placeholder="https://hooks.zapier.com/..."
                                    className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={webhookEnabled} 
                                onChange={(e) => setWebhookEnabled(e.target.checked)}
                                className="rounded border-slate-300 bg-slate-100 dark:bg-slate-900 text-cyan-500 focus:ring-cyan-500" 
                            />
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-bold">Enable Webhooks</span>
                        </label>
                    </div>
                ) : (
                    <div className="bg-slate-100 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-2 h-2 rounded-full shrink-0 ${user.webhooks?.enabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <code className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
                                {user.webhooks?.url || "No Webhook Configured"}
                            </code>
                        </div>
                        <span className="text-xs font-bold text-slate-500">{user.webhooks?.enabled ? 'Active' : 'Disabled'}</span>
                    </div>
                )}
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-900/30 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Deleting your account will permanently remove all tracks, voice registrations, and licensing data. This action cannot be undone.
                </p>
                <button 
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors flex items-center gap-2 shadow-lg shadow-red-600/20"
                >
                    <Trash2 className="w-4 h-4" /> Delete Account
                </button>
            </div>

            {/* ACTION BUTTONS */}
            {(isEditing || message) && (
                <div className="flex flex-col items-end gap-2">
                    {message && (
                        <div className="p-3 bg-green-500/10 text-green-600 dark:text-green-400 text-sm rounded-lg flex items-center gap-2 animate-in fade-in">
                            <CheckCircle2 className="w-4 h-4" /> {message}
                        </div>
                    )}
                    {isEditing && (
                        <div className="flex gap-3">
                            <button 
                                onClick={() => {
                                    setIsEditing(false);
                                    setDisplayName(user.displayName);
                                    setWebhookUrl(user.webhooks?.url || '');
                                    setWebhookEnabled(user.webhooks?.enabled || false);
                                }}
                                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 rounded-lg bg-cyan-500 text-white dark:text-slate-950 font-bold text-sm hover:bg-cyan-400 transition-colors flex items-center gap-2"
                            >
                                {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>

        {/* Right Col: Plan & Status */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 text-white border border-slate-700 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Shield className="w-24 h-24 rotate-12" />
                </div>
                
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Current Plan</h3>
                <div className="text-3xl font-bold mb-4 capitalize flex items-center gap-2">
                    {user.plan} <span className="text-lg font-normal text-slate-400">Tier</span>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        {user.plan === 'free' ? '80% Royalty Split' : '100% Royalty Split'}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                        {user.voiceShieldEnabled ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <X className="w-4 h-4 text-slate-500" />}
                        VoiceShield™ {user.voiceShieldEnabled ? 'Active' : 'Inactive'}
                    </div>
                </div>

                <button className="w-full py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors text-sm">
                    Upgrade Plan
                </button>
            </div>

            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <CreditCard className="w-4 h-4" /> Wallet & Payouts
                </h3>
                <div className="mb-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Balance</span>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">${user.walletBalance.toFixed(2)}</div>
                </div>
                <button className="w-full border border-slate-300 dark:border-slate-600 rounded-lg py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    Withdraw Funds
                </button>
            </div>

            <button 
                onClick={() => authService.logout()}
                className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 py-3 rounded-lg transition-colors font-medium text-sm"
            >
                <LogOut className="w-4 h-4" /> Sign Out
            </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                  <div className="p-6 text-center">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <AlertTriangle className="w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Are you absolutely sure?</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                          This action cannot be undone. This will permanently delete your account, tracks, and remove your data from our servers.
                      </p>
                      
                      <div className="flex gap-3">
                          <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                              Cancel
                          </button>
                          <button 
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                              {isDeleting ? 'Deleting...' : 'Delete Account'}
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
