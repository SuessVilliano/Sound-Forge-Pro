
import { CRMContact, CRMAutomaton, CRMCampaign, MessageThread, ChatMessage, SocialPost, SocialAccount } from '../types';

// Headless GHL Gateway URL (Our server)
const API_BASE = "/api";

export const crmService = {
    
    /**
     * Headless Provisioning: Creates GHL sub-account on the fly
     */
    provisionUser: async (userId: string, role: string): Promise<any> => {
        try {
            const response = await fetch(`${API_BASE}/integrations/ghl/provision`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role })
            });
            return await response.json();
        } catch (e) {
            console.error("GHL Provisioning failed", e);
            return { success: false, error: "Gateway Unreachable" };
        }
    },

    /**
     * Social OAuth Connect
     */
    connectSocial: async (network: string): Promise<void> => {
        // Redirect to our backend which handles the GHL OAuth handshake
        window.location.href = `${API_BASE}/social/connect/${network}`;
    },

    getSocialAccounts: async (): Promise<SocialAccount[]> => {
        try {
            const res = await fetch(`${API_BASE}/social/accounts`);
            return await res.json();
        } catch (e) { return []; }
    },

    /**
     * Social Planning
     */
    getScheduledPosts: async (range: string = '30d'): Promise<SocialPost[]> => {
        try {
            const res = await fetch(`${API_BASE}/social/posts?range=${range}`);
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

    /**
     * Unified Inbox (Mirrored from our local DB, fed by GHL Webhooks)
     */
    getThreads: async (): Promise<MessageThread[]> => {
        try {
            const res = await fetch(`${API_BASE}/inbox/threads`);
            return await res.json();
        } catch (e) { return []; }
    },

    getMessages: async (threadId: string): Promise<ChatMessage[]> => {
        try {
            const res = await fetch(`${API_BASE}/inbox/threads/${threadId}/messages`);
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

    // --- LEGACY/MOCK FALLBACKS (For offline testing) ---
    getContacts: async (): Promise<CRMContact[]> => {
        await new Promise(r => setTimeout(r, 800));
        return [
            { id: 'c1', name: 'Alice Wu', email: 'alice@example.com', phone: '+15550101', tags: ['vip', 'merch-buyer'], source: 'Instagram', lastActive: '2 hours ago', status: 'VIP' },
            { id: 'c2', name: 'Bob Smith', email: 'bob@example.com', phone: '', tags: ['new-listener'], source: 'Spotify', lastActive: '1 day ago', status: 'Fan' }
        ];
    },

    getAutomations: async (): Promise<CRMAutomaton[]> => {
        await new Promise(r => setTimeout(r, 600));
        return [
            { id: 'a1', name: 'New Fan Welcome Series', trigger: 'Form Submit: Newsletter', actions: ['Wait 1 min', 'Send Email: Welcome'], status: 'Active', enrolledCount: 1240 }
        ];
    },

    getCampaigns: async (): Promise<CRMCampaign[]> => {
        await new Promise(r => setTimeout(r, 600));
        return [
            { id: 'camp1', name: 'Album Launch Blast', type: 'Email', status: 'Sent', sentCount: 5200, openRate: 42.5, clickRate: 12.3, date: '2025-05-01' }
        ];
    },

    getAnalyticsData: async (timeRange: string) => {
        const points = timeRange === '7d' ? 7 : 30;
        const data = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        for (let i = 0; i < points; i++) {
            data.push({
                name: points === 7 ? days[i % 7] : `Day ${i + 1}`,
                sent: Math.floor(Math.random() * 500) + 100,
                opened: Math.floor(Math.random() * 300) + 50,
                clicked: Math.floor(Math.random() * 100) + 10
            });
        }
        return data;
    },

    isConnected: (): boolean => {
        return localStorage.getItem('sf_ghl_active') === 'true';
    }
};
