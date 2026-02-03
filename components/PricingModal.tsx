
import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, Shield, Zap, Music, Coins, Sparkles, CreditCard, Package } from 'lucide-react';
import { authService } from '../services/authService';
import { affiliateService } from '../services/affiliateService';
import { creditService, CreditBalance } from '../services/creditService';
import { paymentService } from '../services/paymentService';
import { PRICING_TIERS, CREDIT_PACKAGES, CREDIT_COSTS } from '../services/config';
import { User } from '../types';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpgrade: (plan: 'pro' | 'label') => void;
}

type Tab = 'plans' | 'credits';

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, user, onUpgrade }) => {
  const [activeTab, setActiveTab] = useState<Tab>('plans');
  const [creditBalance, setCreditBalance] = useState<CreditBalance | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      creditService.getBalance(user.uid).then(setCreditBalance);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleUpgrade = async (plan: 'pro' | 'label') => {
    if (!user) return;
    setIsProcessing(true);

    try {
      // Try Stripe checkout first
      const session = await paymentService.createSubscriptionSession(
        user.uid,
        plan,
        `${window.location.origin}/success?type=subscription&plan=${plan}`,
        window.location.href
      );

      if (session?.url) {
        window.location.href = session.url;
        return;
      }

      // Fallback to demo mode
      const price = plan === 'pro' ? 19 : 99;
      const invoiceId = `inv_${Date.now()}`;
      await authService.updateUserPlan(plan);
      await affiliateService.trackSale(user, price, invoiceId);
      await creditService.upgradePlan(user.uid, plan);
      onUpgrade(plan);
      onClose();
    } catch (e) {
      console.error('Upgrade error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreditPurchase = async (packageId: string) => {
    if (!user) return;
    setIsProcessing(true);

    try {
      const session = await paymentService.createCreditPurchaseSession(
        user.uid,
        packageId,
        `${window.location.origin}/success?type=credits&package=${packageId}`,
        window.location.href
      );

      if (session?.url) {
        window.location.href = session.url;
        return;
      }

      // Demo mode - add credits directly
      await paymentService.processDemoPayment(user.uid, 'credit_purchase', packageId);
      const newBalance = await creditService.getBalance(user.uid);
      setCreditBalance(newBalance);

      window.dispatchEvent(new CustomEvent('sf-notification', {
        detail: {
          title: 'Credits Added!',
          message: `Your new balance is ${newBalance.total} credits`,
          type: 'success'
        }
      }));
    } catch (e) {
      console.error('Purchase error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-slate-800 bg-slate-950">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Upgrade Your Studio</h2>
              <p className="text-slate-400 text-sm">Choose a plan or purchase credits to unlock AI features.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Credit Balance Display */}
          {creditBalance && (
            <div className="mt-4 flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-white font-bold">{creditBalance.total}</span>
                <span className="text-slate-400 text-sm">credits available</span>
              </div>
              <div className="text-xs text-slate-500">
                ({creditBalance.subscription} subscription + {creditBalance.purchased} purchased + {creditBalance.bonus} bonus)
              </div>
            </div>
          )}

          {/* Tab Switcher */}
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => setActiveTab('plans')}
              className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === 'plans'
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4 inline mr-2" />
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab('credits')}
              className={`px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${
                activeTab === 'credits'
                  ? 'bg-yellow-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4 inline mr-2" />
              Buy Credits
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 md:p-8 bg-slate-900">
          {activeTab === 'plans' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PRICING_TIERS.map((tier, index) => (
                <div
                  key={tier.id}
                  className={`border rounded-xl p-6 flex flex-col relative ${
                    tier.id === 'pro'
                      ? 'border-2 border-cyan-500 bg-slate-800/80 shadow-2xl shadow-cyan-500/10 transform scale-105'
                      : tier.id === 'label'
                      ? 'border-purple-500/30 bg-slate-800/30'
                      : 'border-slate-800 bg-slate-800/30'
                  }`}
                >
                  {tier.id === 'pro' && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-cyan-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                      Recommended
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">{tier.name}</h3>
                  <div className="text-3xl font-bold text-white mb-4">
                    ${tier.price}
                    <span className="text-sm text-slate-500 font-normal">/mo</span>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    {tier.credits} credits/month • {tier.royaltyShare}% royalties
                  </p>

                  <div className="space-y-3 mb-8 flex-1">
                    {tier.features.map((feature, i) => (
                      <li key={i} className={`flex items-start gap-2 text-sm ${
                        tier.id === 'pro' ? 'text-white' : 'text-slate-300'
                      }`}>
                        <CheckCircle2 className={`w-4 h-4 mt-0.5 ${
                          tier.id === 'pro' ? 'text-cyan-400' :
                          tier.id === 'label' ? 'text-purple-400' : 'text-slate-500'
                        }`} />
                        {feature}
                      </li>
                    ))}
                  </div>

                  {tier.id === 'free' ? (
                    <button className="w-full py-3 rounded-lg border border-slate-600 text-white font-bold text-sm hover:bg-slate-800 transition-colors uppercase tracking-widest">
                      {user?.plan === 'free' ? 'Current Plan' : 'Downgrade'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(tier.id as 'pro' | 'label')}
                      disabled={isProcessing || user?.plan === tier.id}
                      className={`w-full py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all hover:scale-[1.02] disabled:opacity-50 ${
                        tier.id === 'pro'
                          ? 'bg-cyan-500 text-slate-950 hover:shadow-lg'
                          : 'border border-purple-500 text-purple-400 hover:bg-purple-500/10'
                      }`}
                    >
                      {user?.plan === tier.id ? 'Current Plan' : tier.id === 'pro' ? 'Go Pro Now' : 'Scale Up'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'credits' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {CREDIT_PACKAGES.map((pkg) => (
                  <div
                    key={pkg.id}
                    className={`border rounded-xl p-5 flex flex-col relative ${
                      pkg.popular
                        ? 'border-2 border-yellow-500 bg-slate-800/80 shadow-lg'
                        : 'border-slate-800 bg-slate-800/30'
                    }`}
                  >
                    {pkg.popular && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                        Popular
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-yellow-400" />
                      <h3 className="text-lg font-bold text-white">{pkg.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold text-white">{pkg.credits}</span>
                      <span className="text-slate-400 text-sm">credits</span>
                      {pkg.bonus > 0 && (
                        <span className="text-xs text-yellow-400 font-bold">+{pkg.bonus}% bonus!</span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-white mb-4">${pkg.price}</div>
                    <button
                      onClick={() => handleCreditPurchase(pkg.id)}
                      disabled={isProcessing}
                      className={`w-full py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all ${
                        pkg.popular
                          ? 'bg-yellow-500 text-slate-950 hover:shadow-lg'
                          : 'border border-slate-600 text-white hover:bg-slate-800'
                      }`}
                    >
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>

              {/* Credit Costs Reference */}
              <div className="bg-slate-950 rounded-xl p-6 border border-slate-800">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-tight">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Credit Usage Guide
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(CREDIT_COSTS).map(([feature, cost]) => (
                    <div key={feature} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                      <span className="text-sm text-slate-300">
                        {feature.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-yellow-400 font-bold">{cost} <span className="text-xs text-slate-500">credits</span></span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-8 bg-slate-950 rounded-xl p-6 border border-slate-800">
            <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2 uppercase tracking-tight">
              <Zap className="w-5 h-5 text-yellow-400" /> Ownership Matters
            </h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Sound Forge Pro is not a label. We are your technology partner. You always own 100% of your masters and your vocal identity. We just give you the tools to win.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
