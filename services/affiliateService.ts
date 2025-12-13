
import { User } from '../types';

const PUSHLAP_API_KEY = process.env.PUSHLAP_API_KEY; 
const AFFILIATE_DOMAIN = "https://soundforge.biz";

export const affiliateService = {
  
  /**
   * Track a new user signup and attribute it to an affiliate if applicable.
   */
  trackSignup: async (user: User) => {
    // 1. Check if an affiliate ID exists in the window (set by the script)
    const affiliateId = window.affiliateId;
    
    if (!affiliateId) {
        // console.debug("No affiliate referral detected during signup.");
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
      referredUserExternalId: user.uid,
      plan: 'free', // Default plan on signup
      status: 'active',
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
          throw new Error(`PushLap API Error: ${response.statusText}`);
      }
      const data = await response.json();
      console.log('PushLap Signup Tracked Successfully:', data);
    } catch (err) {
      console.error('PushLap Tracking Error:', err);
    }
  },

  /**
   * Track a sale (Upgrade or Merch)
   */
  trackSale: async (user: User, amount: number, invoiceId: string, itemType: string) => {
    // If no API key configured, skip
    if (!PUSHLAP_API_KEY) {
        console.warn("PushLap API Key missing. Skipping sale tracking.");
        return;
    }

    const body = {
      referralId: user.email, // Using email as the identifier for the user who bought
      externalId: user.uid, 
      externalInvoiceId: invoiceId, 
      totalEarned: amount,
      // Optional: commissionRate can be added here if we want to override defaults
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
      const response = await fetch('https://www.pushlapgrowth.com/api/v1/sales', options);
      if (!response.ok) {
          throw new Error(`PushLap API Error: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`PushLap Sale Tracked (${itemType}):`, data);
    } catch (err) {
      console.error('PushLap Sale Error:', err);
    }
  },

  /**
   * Generate a sharable affiliate link
   */
  generateLink: (affiliateCode: string) => {
      // Constructs the link using the soundforge.biz domain and the affiliate code
      // We use ?via= parameter which is standard for many tracking scripts, 
      // ensuring compatibility with the PushLap tracker script on the landing page.
      const cleanCode = affiliateCode.trim();
      return `${AFFILIATE_DOMAIN}?via=${cleanCode}`;
  }
};
