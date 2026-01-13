
import React, { useState, useEffect } from 'react';
import { X, Mail, ArrowRight, Sparkles, Clock, CheckCircle2, Phone } from 'lucide-react';
import { affiliateService } from '../services/affiliateService';
import { webhookService } from '../services/webhookService';
import { dataService } from '../services/dataService';
import { User } from '../types';

export const WaitlistModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if user has already seen the modal or is logged in
    const hasSeen = localStorage.getItem('hasSeenWaitlist');
    const isLoggedIn = localStorage.getItem('soundforge_user_session');

    if (!hasSeen && !isLoggedIn) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500); // Show after 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenWaitlist', 'true');
  };

  const validatePhone = (p: string) => {
      // Basic regex for international or US numbers
      const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
      return regex.test(p);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !name || !phone) {
        setErrorMsg('All fields are required.');
        return;
    }

    if (!validatePhone(phone)) {
        setErrorMsg('Please enter a valid phone number.');
        return;
    }

    setIsSubmitting(true);

    try {
      const leadId = `lead_${Date.now()}`;
      
      // Added missing credits: 0 property to fix error on line 61
      const leadUser: User = {
        uid: leadId,
        email: email,
        displayName: name,
        phoneNumber: phone,
        photoURL: '',
        plan: 'free',
        credits: 0,
        role: 'listener', // Initially listener/lead
        voiceShieldEnabled: false,
        walletBalance: 0
      };

      // 1. Send System Webhook (Visible in Admin -> Logs)
      // This sends to the configured external webhook AND stores a log entry
      // Fixed: Cast window to any for affiliateId access
      await webhookService.sendSystemEvent('signup', leadUser, {
          source: 'waitlist_modal',
          affiliateId: (window as any).affiliateId || 'organic'
      });

      // 2. Save to Database/Cache (Visible in Admin -> Users)
      await dataService.adminCreateUser({
          ...leadUser,
          role: 'listener', // Mark as listener/lead
          plan: 'free'
      });

      // 3. Track with Affiliate Service
      await affiliateService.trackSignup(leadUser);

      // UI Feedback Delay
      await new Promise(resolve => setTimeout(resolve, 800));

      setIsSuccess(true);
      localStorage.setItem('hasSeenWaitlist', 'true');
      
      // Auto close after success message
      setTimeout(() => {
        setIsOpen(false);
      }, 3500);

    } catch (error) {
      console.error("Waitlist error:", error);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Visual Side (Hidden on mobile for space) */}
        <div className="hidden md:flex w-1/3 bg-gradient-to-br from-cyan-900 to-slate-900 relative items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-slate-900/80"></div>
            <div className="relative z-10 text-center p-4">
                <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <div className="text-cyan-200 text-xs font-bold uppercase tracking-widest mb-1">V2.5 Launching</div>
                <div className="text-white font-mono text-lg font-bold">SOON</div>
            </div>
        </div>

        {/* Content Side */}
        <div className="flex-1 p-8 relative">
            <button 
                onClick={handleClose}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            {isSuccess ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8 animate-in zoom-in duration-300">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">You're on the list!</h3>
                    <p className="text-slate-400 text-sm">We've received your info. Keep an eye on your inbox for early access.</p>
                </div>
            ) : (
                <>
                    <div className="mb-6">
                        <span className="inline-block px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-wider mb-3">
                            Limited Early Access
                        </span>
                        <h2 className="text-2xl font-bold text-white mb-2">Build Your Future. <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Before Everyone Else.</span></h2>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            Join the waitlist to secure your VoiceShield™ username and get <span className="text-white font-bold">3 months of Pro Free</span> ($57 value) when we launch.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Artist Name</label>
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. The Weeknd"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+1 555 000-0000"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        {errorMsg && (
                            <p className="text-red-400 text-xs text-center font-bold animate-pulse">{errorMsg}</p>
                        )}

                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                "Securing Spot..."
                            ) : (
                                <>
                                    Join the Waitlist <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>Spots filling fast: 483 joined today</span>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};
