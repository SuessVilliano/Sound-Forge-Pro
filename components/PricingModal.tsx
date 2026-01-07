
import React from 'react';
import { CheckCircle2, X, Shield, Zap, Music } from 'lucide-react';
import { authService } from '../services/authService';
import { affiliateService } from '../services/affiliateService';
import { User } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpgrade: (plan: 'pro' | 'label') => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, user, onUpgrade }) => {
  if (!isOpen) return null;

  const handleUpgrade = async (plan: 'pro' | 'label') => {
      await new Promise(r => setTimeout(r, 1000));
      const price = plan === 'pro' ? 19 : 99;
      const invoiceId = `inv_${Date.now()}`;
      await authService.updateUserPlan(plan);
      if (user) {
          await affiliateService.trackSale(user, price, invoiceId);
      }
      onUpgrade(plan);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
           <div>
               <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Choose Your Path</h2>
               <p className="text-slate-400 text-sm">Select the plan that fits your musical goals.</p>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
               <X className="w-6 h-6" />
           </button>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 bg-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Artist Tier */}
                <div className="border border-slate-800 bg-slate-800/30 rounded-xl p-6 flex flex-col relative">
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Artist</h3>
                    <div className="text-3xl font-bold text-white mb-4">$0<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                    <p className="text-sm text-slate-400 mb-6">For those just starting their musical journey.</p>
                    
                    <div className="space-y-3 mb-8 flex-1">
                        <li className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5" /> 80% Royalties</li>
                        <li className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5" /> Global Distribution</li>
                        <li className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-slate-500 mt-0.5" /> 10 AI Studio Credits / mo</li>
                    </div>
                    
                    <button className="w-full py-3 rounded-lg border border-slate-600 text-white font-bold text-sm hover:bg-slate-800 transition-colors uppercase tracking-widest">
                        Current Plan
                    </button>
                </div>

                {/* Pro Tier */}
                <div className="border-2 border-cyan-500 bg-slate-800/80 rounded-xl p-6 flex flex-col relative shadow-2xl shadow-cyan-500/10 transform scale-105">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Recommended</div>
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Artist Pro</h3>
                    <div className="text-3xl font-bold text-white mb-4">$19<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                    <p className="text-sm text-slate-300 mb-6">For the serious artist building a professional career.</p>
                    
                    <div className="space-y-3 mb-8 flex-1">
                        <li className="flex items-start gap-2 text-sm text-white font-medium"><CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" /> 100% Royalties</li>
                        <li className="flex items-start gap-2 text-sm text-white font-bold"><Shield className="w-4 h-4 text-cyan-400 mt-0.5" /> Full VoiceShield™ Protection</li>
                        <li className="flex items-start gap-2 text-sm text-white"><CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" /> Unlimited AI Studio</li>
                        <li className="flex items-start gap-2 text-sm text-white"><CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5" /> Priority Sync Placement</li>
                    </div>
                    
                    <button 
                        onClick={() => handleUpgrade('pro')}
                        className="w-full py-3 rounded-lg bg-cyan-500 text-slate-950 font-black text-xs uppercase tracking-widest hover:shadow-lg transition-all hover:scale-[1.02]"
                    >
                        Go Pro Now
                    </button>
                </div>

                 {/* Label Tier */}
                 <div className="border border-purple-500/30 bg-slate-800/30 rounded-xl p-6 flex flex-col relative">
                    <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Label</h3>
                    <div className="text-3xl font-bold text-white mb-4">$99<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                    <p className="text-sm text-slate-400 mb-6">For managers and labels overseeing multiple artists.</p>
                    
                    <div className="space-y-3 mb-8 flex-1">
                        <li className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5" /> Manage Up to 5 Artists</li>
                        <li className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5" /> Advanced Analytics Node</li>
                        <li className="flex items-start gap-2 text-sm text-slate-300"><CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5" /> White-Label Pages</li>
                    </div>
                    
                    <button 
                        onClick={() => handleUpgrade('label')}
                        className="w-full py-3 rounded-lg border border-purple-500 text-purple-400 hover:bg-purple-500/10 font-bold text-xs uppercase tracking-widest transition-colors"
                    >
                        Scale Up
                    </button>
                </div>
            </div>

            <div className="mt-8 bg-slate-950 rounded-xl p-6 border border-slate-800">
                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-tight"><Zap className="w-5 h-5 text-yellow-400" /> Ownership Matters</h4>
                <p className="text-sm text-slate-400 leading-relaxed">
                    Sound Merge is not a label. We are your technology partner. You always own 100% of your masters and your vocal identity. We just give you the tools to win.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
