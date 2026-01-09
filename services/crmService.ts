
import { CRMContact, CRMAutomaton, CRMCampaign, MessageThread, ChatMessage, SocialPost, SocialAccount } from '../types';

// Headless GHL Gateway URL (Institutional Rails)
const API_BASE = "https://api.soundmerge.co/api";

export const crmService = {
    
    /**
     * Headless Provisioning: Creates GHL sub-account via Sound Merge Gateway
     */
    provisionUser: async (userId: string, role: string, addressData: any): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE}/integrations/ghl/provision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role, addressData })
            });
            return await response.json();
        } catch (e) {
            console.error("GHL Provisioning failed", e);
            return { success: false, error: "Gateway Unreachable" };
        }
    },

    /**
     * Unified Inbox: Fetches threads from the dedicated institutional API
     */
    getThreads: async (): Promise<MessageThread[]> => {
        try {
            const res = await fetch(`${API_BASE}/inbox/threads`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { return []; }
    },

    getMessages: async (threadId: string): Promise<ChatMessage[]> => {
        try {
            const res = await fetch(`${API_BASE}/inbox/threads/${threadId}/messages`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { return []; }
    },

    sendMessage: async (threadId: string, body: string, channel: string): Promise<any> => {
        const response = await fetch(`${API_BASE}/inbox/send`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ threadId, body, preferredChannel: channel })
        });
        return await response.json();
    },

    /**
     * Social Planning via api.soundmerge.co
     */
    getScheduledPosts: async (range: string = '30d'): Promise<SocialPost[]> => {
        try {
            const res = await fetch(`${API_BASE}/social/posts?range=${range}`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { return []; }
    },

    schedulePost: async (post: Partial<SocialPost>): Promise<any> => {
        const response = await fetch(`${API_BASE}/social/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post)
        });
        return await response.json();
    },

    // --- REGISTRY / ASSETS ---
    getContacts: async (): Promise<CRMContact[]> => {
        try {
            const res = await fetch(`${API_BASE}/registry/contacts`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { 
            // Mock fallback only for development
            return [
                { id: 'c1', name: 'Elite Listener 1', email: 'fan@example.com', tags: ['early-adopter'], source: 'Institutional Signup', lastActive: '2 hours ago', status: 'Active' }
            ];
        }
    },

    getAutomations: async (): Promise<CRMAutomaton[]> => {
        try {
            const res = await fetch(`${API_BASE}/workflows`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { return []; }
    },

    getCampaigns: async (): Promise<CRMCampaign[]> => {
        try {
            const res = await fetch(`${API_BASE}/outreach/campaigns`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) { return []; }
    }
};
