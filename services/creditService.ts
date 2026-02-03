/**
 * SOUND FORGE PRO - CREDIT SYSTEM SERVICE
 * Handles all credit-related operations including:
 * - Credit balance management
 * - Credit purchases
 * - Transaction history
 * - Subscription management
 */

import { doc, getDoc, updateDoc, addDoc, collection, query, where, orderBy, getDocs, serverTimestamp, increment } from 'firebase/firestore';
import { db } from './firebase';
import { CREDIT_COSTS, CREDIT_PACKAGES, PRICING_TIERS, CreditPackage, PricingTier } from './config';
import { User } from '../types';

// ============================================
// TYPES
// ============================================

export interface CreditTransaction {
  id: string;
  userId: string;
  type: 'purchase' | 'usage' | 'subscription' | 'bonus' | 'refund';
  amount: number; // positive for credits added, negative for credits used
  balance: number; // balance after transaction
  description: string;
  metadata?: {
    packageId?: string;
    featureUsed?: string;
    stripePaymentId?: string;
    subscriptionTier?: string;
  };
  createdAt: string;
}

export interface CreditBalance {
  total: number;
  subscription: number; // Monthly credits from subscription
  purchased: number; // One-time purchased credits
  bonus: number; // Bonus/promotional credits
}

export type CreditFeature = keyof typeof CREDIT_COSTS;

// ============================================
// CREDIT SERVICE
// ============================================

export const creditService = {
  /**
   * Get user's current credit balance
   */
  async getBalance(userId: string): Promise<CreditBalance> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { total: 0, subscription: 0, purchased: 0, bonus: 0 };
      }

      const userData = userSnap.data();
      const credits = userData.credits || 0;
      const creditBreakdown = userData.creditBreakdown || {
        subscription: 0,
        purchased: 0,
        bonus: 0
      };

      return {
        total: credits,
        subscription: creditBreakdown.subscription || 0,
        purchased: creditBreakdown.purchased || 0,
        bonus: creditBreakdown.bonus || 0
      };
    } catch (e) {
      console.error('[CreditService] Error getting balance:', e);
      return { total: 0, subscription: 0, purchased: 0, bonus: 0 };
    }
  },

  /**
   * Check if user has enough credits for a feature
   */
  async hasEnoughCredits(userId: string, feature: CreditFeature): Promise<boolean> {
    const cost = CREDIT_COSTS[feature];
    const balance = await this.getBalance(userId);
    return balance.total >= cost;
  },

  /**
   * Get the cost for a specific feature
   */
  getCost(feature: CreditFeature): number {
    return CREDIT_COSTS[feature];
  },

  /**
   * Deduct credits for using a feature
   * Returns true if successful, false if insufficient credits
   */
  async useCredits(
    userId: string,
    feature: CreditFeature,
    description?: string
  ): Promise<{ success: boolean; newBalance: number; error?: string }> {
    const cost = CREDIT_COSTS[feature];

    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, newBalance: 0, error: 'User not found' };
      }

      const currentCredits = userSnap.data().credits || 0;

      if (currentCredits < cost) {
        return {
          success: false,
          newBalance: currentCredits,
          error: `Insufficient credits. Need ${cost}, have ${currentCredits}`
        };
      }

      const newBalance = currentCredits - cost;

      // Update user credits
      await updateDoc(userRef, {
        credits: newBalance,
        lastCreditUsage: serverTimestamp()
      });

      // Log transaction
      await this.logTransaction(userId, {
        type: 'usage',
        amount: -cost,
        balance: newBalance,
        description: description || `Used ${feature}`,
        metadata: { featureUsed: feature }
      });

      return { success: true, newBalance };
    } catch (e) {
      console.error('[CreditService] Error using credits:', e);
      return { success: false, newBalance: 0, error: 'Failed to deduct credits' };
    }
  },

  /**
   * Add credits to user account (for purchases, bonuses, etc.)
   */
  async addCredits(
    userId: string,
    amount: number,
    type: CreditTransaction['type'],
    description: string,
    metadata?: CreditTransaction['metadata']
  ): Promise<{ success: boolean; newBalance: number }> {
    try {
      const userRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        return { success: false, newBalance: 0 };
      }

      const currentCredits = userSnap.data().credits || 0;
      const newBalance = currentCredits + amount;

      // Update user credits
      await updateDoc(userRef, {
        credits: newBalance,
        lastCreditPurchase: serverTimestamp()
      });

      // Update breakdown based on type
      const breakdownField = type === 'subscription' ? 'creditBreakdown.subscription'
        : type === 'bonus' ? 'creditBreakdown.bonus'
        : 'creditBreakdown.purchased';

      await updateDoc(userRef, {
        [breakdownField]: increment(amount)
      });

      // Log transaction
      await this.logTransaction(userId, {
        type,
        amount,
        balance: newBalance,
        description,
        metadata
      });

      return { success: true, newBalance };
    } catch (e) {
      console.error('[CreditService] Error adding credits:', e);
      return { success: false, newBalance: 0 };
    }
  },

  /**
   * Process a credit package purchase
   */
  async purchasePackage(
    userId: string,
    packageId: string,
    stripePaymentId?: string
  ): Promise<{ success: boolean; creditsAdded: number; newBalance: number }> {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);

    if (!pkg) {
      return { success: false, creditsAdded: 0, newBalance: 0 };
    }

    const bonusCredits = Math.floor(pkg.credits * (pkg.bonus / 100));
    const totalCredits = pkg.credits + bonusCredits;

    const result = await this.addCredits(
      userId,
      totalCredits,
      'purchase',
      `Purchased ${pkg.name} (${pkg.credits} + ${bonusCredits} bonus)`,
      { packageId, stripePaymentId }
    );

    return {
      success: result.success,
      creditsAdded: totalCredits,
      newBalance: result.newBalance
    };
  },

  /**
   * Grant monthly subscription credits
   */
  async grantSubscriptionCredits(userId: string, tier: PricingTier['id']): Promise<boolean> {
    const tierConfig = PRICING_TIERS.find(t => t.id === tier);

    if (!tierConfig || tierConfig.credits === 0) {
      return false;
    }

    const result = await this.addCredits(
      userId,
      tierConfig.credits,
      'subscription',
      `Monthly ${tierConfig.name} credits`,
      { subscriptionTier: tier }
    );

    return result.success;
  },

  /**
   * Log a credit transaction
   */
  async logTransaction(
    userId: string,
    transaction: Omit<CreditTransaction, 'id' | 'userId' | 'createdAt'>
  ): Promise<void> {
    try {
      await addDoc(collection(db, 'credit_transactions'), {
        userId,
        ...transaction,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error('[CreditService] Error logging transaction:', e);
    }
  },

  /**
   * Get user's transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 50): Promise<CreditTransaction[]> {
    try {
      const q = query(
        collection(db, 'credit_transactions'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      const snap = await getDocs(q);
      return snap.docs.slice(0, limit).map(d => ({
        id: d.id,
        ...d.data()
      })) as CreditTransaction[];
    } catch (e) {
      console.error('[CreditService] Error getting transaction history:', e);
      return [];
    }
  },

  /**
   * Initialize credits for new user
   */
  async initializeNewUser(userId: string, plan: PricingTier['id'] = 'free'): Promise<void> {
    const tierConfig = PRICING_TIERS.find(t => t.id === plan) || PRICING_TIERS[0];

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        credits: tierConfig.credits,
        plan: plan,
        creditBreakdown: {
          subscription: tierConfig.credits,
          purchased: 0,
          bonus: 0
        },
        subscriptionStartDate: new Date().toISOString()
      });

      await this.logTransaction(userId, {
        type: 'subscription',
        amount: tierConfig.credits,
        balance: tierConfig.credits,
        description: `Welcome credits (${tierConfig.name} plan)`,
        metadata: { subscriptionTier: plan }
      });
    } catch (e) {
      console.error('[CreditService] Error initializing new user:', e);
    }
  },

  /**
   * Upgrade user plan
   */
  async upgradePlan(
    userId: string,
    newPlan: PricingTier['id'],
    stripeSubscriptionId?: string
  ): Promise<boolean> {
    const tierConfig = PRICING_TIERS.find(t => t.id === newPlan);

    if (!tierConfig) {
      return false;
    }

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        plan: newPlan,
        stripeSubscriptionId,
        planUpgradedAt: serverTimestamp()
      });

      // Grant subscription credits immediately on upgrade
      await this.grantSubscriptionCredits(userId, newPlan);

      return true;
    } catch (e) {
      console.error('[CreditService] Error upgrading plan:', e);
      return false;
    }
  },

  /**
   * Get all pricing tiers
   */
  getPricingTiers(): PricingTier[] {
    return PRICING_TIERS;
  },

  /**
   * Get all credit packages
   */
  getCreditPackages(): CreditPackage[] {
    return CREDIT_PACKAGES;
  },

  /**
   * Get credit costs for all features
   */
  getAllCosts(): typeof CREDIT_COSTS {
    return CREDIT_COSTS;
  }
};

export default creditService;
