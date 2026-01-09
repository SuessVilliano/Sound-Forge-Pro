
import React, { useEffect } from 'react';
import { Calendar, Music, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { APP_NAME } from '../constants';

interface BookingViewProps {
    onBack: () => void;
}

export const BookingView: React.FC<BookingViewProps> = ({ onBack }) => {
    
    useEffect(() => {
        // Load the GHL form embed script if it's not already there
        const scriptId = 'ghl-booking-script';
        if (!document.getElementById(scriptId)) {
            const script = document.createElement('script');
            script.id = scriptId;
            script.src = "https://api.soundmerge.co/js/form_embed.js";
            script.type = "text/javascript";
            document.body.appendChild(script);
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans animate-in fade-in duration-700 overflow-x-hidden">
            {/* Minimal Header */}
            <div className="h-20 border-b border-white/5 px-8 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-tr from-cyan-400 to-teal-500 p-2 rounded-lg">
                        <Music className="text-slate-950 w-5 h-5" />
                    </div>
                    <span className="font-black text-lg tracking-tighter uppercase italic">{APP_NAME} <span className="text-cyan-500">Concierge</span></span>
                </div>
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-full border border-white/10"
                >
                    <ArrowLeft className="w-4 h-4" /> Cancel & Exit
                </button>
            </div>

            <div className="flex-1 max-w-6xl mx-auto w-full p-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start py-20">
                
                {/* Left: Value Prop / Context */}
                <div className="lg:col-span-4 space-y-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-cyan-400">
                            <Zap className="w-3 h-3 text-yellow-400" /> Priority Onboarding
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter leading-none italic">Finalize Your <br/><span className="text-cyan-500">Deployment.</span></h1>
                        <p className="text-slate-400 font-medium leading-relaxed">
                            Schedule your institutional strategy session to finalize your node synchronization and unlock the full Sound Merge creative suite.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10"><ShieldCheck className="w-5 h-5 text-cyan-500" /></div>
                            <div>
                                <h4 className="font-bold text-sm uppercase">Secure Identity Sync</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed">Our team will walk you through securing your vocal DNA hash on the Solana ledger.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center shrink-0 border border-white/10"><Zap className="w-5 h-5 text-purple-500" /></div>
                            <div>
                                <h4 className="font-bold text-sm uppercase">Creative Audit</h4>
                                <p className="text-[11px] text-slate-500 leading-relaxed">Analyze your existing catalog for high-payout sync licensing potential.</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 text-center">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Institutional Partners</p>
                        <div className="flex flex-wrap justify-center gap-6 opacity-30">
                            <span className="font-black text-xs uppercase italic tracking-widest">Resemble.ai</span>
                            <span className="font-black text-xs uppercase italic tracking-widest">Alchemy</span>
                            <span className="font-black text-xs uppercase italic tracking-widest">GHL</span>
                        </div>
                    </div>
                </div>

                {/* Right: The Booking Calendar */}
                <div className="lg:col-span-8 bg-white rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border-4 border-slate-900 min-h-[700px] relative">
                    <iframe 
                        src="https://api.soundmerge.co/widget/booking/2F1G2CFfjCnrvdCv7s14" 
                        style={{ width: '100%', border: 'none', overflow: 'hidden', minHeight: '700px' }} 
                        scrolling="no" 
                        id="2F1G2CFfjCnrvdCv7s14_1767910405176"
                        className="animate-in fade-in zoom-in-95 duration-1000 delay-300"
                    ></iframe>
                </div>
            </div>

            <footer className="h-20 border-t border-white/5 flex items-center justify-center px-8 text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
                © 2025 Sound Merge Inc. | All rights reserved on-chain.
            </footer>
        </div>
    );
};
