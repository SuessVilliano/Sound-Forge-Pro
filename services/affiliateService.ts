
import { User } from '../types';

const PUSHLAP_API_KEY = process.env.PUSHLAP_API_KEY; 
const AFFILIATE_DOMAIN = "https://soundmerge.club";

export const affiliateService = {
  
  /**
   * Track a new user signup and attribute it to an affiliate if applicable.
   * Matches body structure: { affiliateId, name, email, referredUserExternalId, plan, status }
   */
  trackSignup: async (user: User) => {
    // 1. Check if an affiliate ID exists in the window (set by the script)
    // We check window.affiliateId as per the provided snippet
    // Fixed: Cast window to any for affiliateId access
    const affiliateId = (window as any).affiliateId;
    
    if (!affiliateId) {
        console.debug("No affiliate referral detected (organic signup).");
        return;
    }

    if (!PUSHLAP_API_KEY) {
        console.warn("PushLap API Key missing. Skipping signup tracking.");
        return;
    }

    console.log(`Tracking signup for affiliate: ${affiliateId}`);

    const body = {
      affiliateId: affiliateId,
      name: user.displayName,
      email: user.email,
      referredUserExternalId: user.uid, // External ID (Firebase UID)
      plan: user.plan || 'free', // Plan name
      status: 'active', // Status of the referred user
    };

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PUSHLAP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };

    try {
      const response = await fetch('https://www.pushlapgrowth.com/api/v1/referrals', options);
      if (!response.ok) {
          const errText = await response.text();
          throw new Error(`PushLap API Error (${response.status}): ${errText}`);
      }
      const data = await response.json();
      console.log('PushLap Signup Tracked Successfully:', data);
    } catch (err) {
      console.error('PushLap Tracking Error:', err);
    }
  },

  /**
   * Track a sale (Upgrade or Merch)
   * Matches body structure: { referralId, externalId, externalInvoiceId, totalEarned, commissionRate? }
   */
  trackSale: async (user: User, amount: number, invoiceId: string, commissionRate?: number) => {
    // If no API key configured, skip
    if (!PUSHLAP_API_KEY) {
        console.warn("PushLap API Key missing. Skipping sale tracking.");
        return;
    }

    const body: any = {
      referralId: user.email, // The email of the user who bought the item (links to the referral)
      externalId: user.uid,   // Optional external user ID
      externalInvoiceId: invoiceId, // Unique Invoice ID
      totalEarned: amount,    // Total amount of the sale
    };

    // Optional field to override commission rate
    if (commissionRate !== undefined) {
        body.commissionRate = commissionRate;
    }

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PUSHLAP_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    };

    try {
      const response = await fetch('https://www.pushlapgrowth.com/api/v1/sales', options);
      if (!response.ok) {
          const errText = await response.text();
          throw new Error(`PushLap API Error (${response.status}): ${errText}`);
      }
      const data = await response.json();
      console.log('PushLap Sale Tracked:', data);
    } catch (err) {
      console.error('PushLap Sale Error:', err);
    }
  },

  /**
   * Generate a sharable affiliate link
   */
  generateLink: (affiliateCode: string) => {
      // Constructs the link using the domain and the affiliate code
      // Uses ?via= parameter which is standard for the affiliate-tracker.js script
      const cleanCode = affiliateCode.trim();
      return `${AFFILIATE_DOMAIN}?via=${cleanCode}`;
  }
};
