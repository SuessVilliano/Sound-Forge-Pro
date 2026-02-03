/**
 * SOUND FORGE PRO - PAYMENT SERVICE
 * Handles Stripe integration for subscriptions and one-time purchases
 */

import { PAYMENT_CONFIG, CREDIT_PACKAGES, PRICING_TIERS, isConfigured } from './config';
import { creditService } from './creditService';

// ============================================
// TYPES
// ============================================

export interface PaymentIntent {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface SubscriptionStatus {
  active: boolean;
  plan: 'free' | 'pro' | 'label';
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

// ============================================
// STRIPE INITIALIZATION
// ============================================

let stripePromise: Promise<any> | null = null;

const getStripe = async () => {
  if (!isConfigured.stripe()) {
    console.warn('[PaymentService] Stripe not configured. Payment features unavailable.');
    return null;
  }

  if (!stripePromise) {
    // Dynamically import Stripe to avoid loading if not configured
    const { loadStripe } = await import('@stripe/stripe-js');
    stripePromise = loadStripe(PAYMENT_CONFIG.STRIPE_PUBLISHABLE_KEY);
  }

  return stripePromise;
};

// ============================================
// PAYMENT SERVICE
// ============================================

export const paymentService = {
  /**
   * Check if Stripe is configured
   */
  isAvailable(): boolean {
    return isConfigured.stripe();
  },

  /**
   * Create a checkout session for credit package purchase
   */
  async createCreditPurchaseSession(
    userId: string,
    packageId: string,
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession | null> {
    const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
    if (!pkg) {
      console.error('[PaymentService] Invalid package ID:', packageId);
      return null;
    }

    try {
      // In production, this would call your backend to create the session
      // For now, we'll simulate the response
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          packageId,
          amount: pkg.price * 100, // Stripe uses cents
          successUrl,
          cancelUrl,
          metadata: {
            type: 'credit_purchase',
            packageId,
            credits: pkg.credits,
            bonus: pkg.bonus
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      return await response.json();
    } catch (e) {
      console.error('[PaymentService] Error creating checkout session:', e);

      // Return simulated session for demo mode
      if (!isConfigured.stripe()) {
        return {
          id: `demo_session_${Date.now()}`,
          url: `${successUrl}?demo=true&package=${packageId}`
        };
      }

      return null;
    }
  },

  /**
   * Create a checkout session for subscription upgrade
   */
  async createSubscriptionSession(
    userId: string,
    planId: 'pro' | 'label',
    successUrl: string,
    cancelUrl: string
  ): Promise<CheckoutSession | null> {
    const plan = PRICING_TIERS.find(p => p.id === planId);
    if (!plan || !plan.stripePriceId) {
      console.error('[PaymentService] Invalid plan or missing Stripe price ID:', planId);
      return null;
    }

    try {
      const response = await fetch('/api/create-subscription-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          priceId: plan.stripePriceId,
          successUrl,
          cancelUrl,
          metadata: {
            type: 'subscription',
            planId
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription session');
      }

      return await response.json();
    } catch (e) {
      console.error('[PaymentService] Error creating subscription session:', e);

      // Return simulated session for demo mode
      if (!isConfigured.stripe()) {
        return {
          id: `demo_sub_${Date.now()}`,
          url: `${successUrl}?demo=true&plan=${planId}`
        };
      }

      return null;
    }
  },

  /**
   * Get user's subscription status
   */
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus> {
    try {
      const response = await fetch(`/api/subscription-status?userId=${userId}`);

      if (!response.ok) {
        throw new Error('Failed to get subscription status');
      }

      return await response.json();
    } catch (e) {
      console.error('[PaymentService] Error getting subscription status:', e);

      // Return default status
      return {
        active: false,
        plan: 'free'
      };
    }
  },

  /**
   * Cancel subscription at period end
   */
  async cancelSubscription(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      return response.ok;
    } catch (e) {
      console.error('[PaymentService] Error canceling subscription:', e);
      return false;
    }
  },

  /**
   * Resume canceled subscription
   */
  async resumeSubscription(userId: string): Promise<boolean> {
    try {
      const response = await fetch('/api/resume-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      return response.ok;
    } catch (e) {
      console.error('[PaymentService] Error resuming subscription:', e);
      return false;
    }
  },

  /**
   * Handle successful payment (called after redirect from Stripe)
   */
  async handlePaymentSuccess(
    sessionId: string,
    userId: string
  ): Promise<{ success: boolean; type: string; details: any }> {
    try {
      const response = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId })
      });

      if (!response.ok) {
        throw new Error('Failed to verify payment');
      }

      const data = await response.json();

      // Process based on payment type
      if (data.type === 'credit_purchase') {
        await creditService.purchasePackage(
          userId,
          data.metadata.packageId,
          data.paymentId
        );
      } else if (data.type === 'subscription') {
        await creditService.upgradePlan(
          userId,
          data.metadata.planId,
          data.subscriptionId
        );
      }

      return {
        success: true,
        type: data.type,
        details: data
      };
    } catch (e) {
      console.error('[PaymentService] Error handling payment success:', e);
      return {
        success: false,
        type: 'unknown',
        details: null
      };
    }
  },

  /**
   * Process demo payment (for testing without Stripe)
   */
  async processDemoPayment(
    userId: string,
    type: 'credit_purchase' | 'subscription',
    itemId: string
  ): Promise<boolean> {
    if (type === 'credit_purchase') {
      const result = await creditService.purchasePackage(userId, itemId, 'demo_payment');
      return result.success;
    } else if (type === 'subscription') {
      return await creditService.upgradePlan(userId, itemId as any, 'demo_subscription');
    }
    return false;
  },

  /**
   * Get Stripe instance for custom integrations
   */
  async getStripeInstance() {
    return getStripe();
  }
};

export default paymentService;
