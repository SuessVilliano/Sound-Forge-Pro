
import React, { useState } from 'react';
import { User, Mail, Camera, Save, X, Shield, CreditCard, LogOut, CheckCircle2 } from 'lucide-react';
import { User as UserType } from '../types';
import { authService } from '../services/authService';

interface UserProfileProps {
  user: UserType;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [photoURL, setPhotoURL] = useState(user.photoURL);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSave = async () => {
    setLoading(true);
    setMessage(null);
    try {
      // In a real app, this would update firebase profile via authService
      // For now, we update local state simulation
      // await authService.updateProfile({ displayName, photoURL });
      
      // Simulate delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setMessage("Profile updated successfully!");
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Account Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage your personal information and subscription.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Col: Identity */}
        <div className="md:col-span-2 space-y-6">
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

                {isEditing && (
                    <div className="mt-8 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
                        <button 
                            onClick={() => {
                                setIsEditing(false);
                                setDisplayName(user.displayName);
                                setPhotoURL(user.photoURL);
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
                
                {message && (
                    <div className="mt-4 p-3 bg-green-500/10 text-green-600 dark:text-green-400 text-sm rounded-lg flex items-center gap-2 animate-in fade-in">
                        <CheckCircle2 className="w-4 h-4" /> {message}
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                    {['Email me about new opportunities', 'Notify me when I receive royalties', 'Weekly performance summary', 'Product updates and news'].map((pref, i) => (
                        <label key={i} className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-300 text-cyan-500 focus:ring-cyan-500 bg-slate-100 dark:bg-slate-900 dark:border-slate-700" />
                            <span className="text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{pref}</span>
                        </label>
                    ))}
                </div>
            </div>
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
    </div>
  );
};
