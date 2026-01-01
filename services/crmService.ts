
import { CRMContact, CRMAutomaton, CRMCampaign } from '../types';

// Mock Data Stores
let MOCK_CONTACTS: CRMContact[] = [
    { id: 'c1', name: 'Alice Wu', email: 'alice@example.com', phone: '+15550101', tags: ['vip', 'merch-buyer'], source: 'Instagram', lastActive: '2 hours ago', status: 'VIP' },
    { id: 'c2', name: 'Bob Smith', email: 'bob@example.com', phone: '', tags: ['new-listener'], source: 'Spotify', lastActive: '1 day ago', status: 'Fan' },
    { id: 'c3', name: 'Charlie D', email: 'charlie@example.com', tags: ['waitlist'], source: 'Website', lastActive: '3 days ago', status: 'Lead' },
    { id: 'c4', name: 'Diana Prince', email: 'diana@example.com', phone: '+15550202', tags: ['presave'], source: 'TikTok', lastActive: '5 mins ago', status: 'Fan' }
];

let MOCK_AUTOMATIONS: CRMAutomaton[] = [
    { id: 'a1', name: 'New Fan Welcome Series', trigger: 'Form Submit: Newsletter', actions: ['Wait 1 min', 'Send Email: Welcome', 'Wait 2 days', 'Send Email: Story'], status: 'Active', enrolledCount: 1240 },
    { id: 'a2', name: 'Merch Cart Abandonment', trigger: 'Checkout: Abandoned', actions: ['Wait 1 hour', 'Send SMS: Discount', 'Wait 24 hours', 'Send Email: Reminder'], status: 'Active', enrolledCount: 45 },
    { id: 'a3', name: 'Tour VIP Announcement', trigger: 'Tag Added: VIP', actions: ['Send Email: Presale Code'], status: 'Draft', enrolledCount: 0 },
];

let MOCK_CAMPAIGNS: CRMCampaign[] = [
    { id: 'camp1', name: 'Album Launch Blast', type: 'Email', status: 'Sent', sentCount: 5200, openRate: 42.5, clickRate: 12.3, date: '2025-05-01' },
    { id: 'camp2', name: 'LA Show SMS', type: 'SMS', status: 'Sent', sentCount: 850, openRate: 98.0, clickRate: 45.2, date: '2025-05-15' },
    { id: 'camp3', name: 'Merch Drop Teaser', type: 'Email', status: 'Scheduled', sentCount: 0, openRate: 0, clickRate: 0, date: '2025-06-01' },
];

export const crmService = {
    
    /**
     * Connects to HighLevel via API Key (Simulation)
     */
    connectHighLevel: async (apiKey: string, locationId: string): Promise<boolean> => {
        // In a real app, we would validate this against the HighLevel API
        // For now, we simulate a network request and store the status
        console.log(`[CRM] Connecting to HighLevel Location: ${locationId}`);
        await new Promise(r => setTimeout(r, 1500));
        
        localStorage.setItem('sf_hl_connected', 'true');
        localStorage.setItem('sf_hl_location_id', locationId);
        return true;
    },

    disconnectHighLevel: () => {
        localStorage.removeItem('sf_hl_connected');
        localStorage.removeItem('sf_hl_location_id');
    },

    isConnected: (): boolean => {
        return localStorage.getItem('sf_hl_connected') === 'true';
    },

    /**
     * Fetches Contacts (simulated sync)
     */
    getContacts: async (): Promise<CRMContact[]> => {
        await new Promise(r => setTimeout(r, 800));
        return MOCK_CONTACTS;
    },

    addContact: async (contact: Partial<CRMContact>): Promise<CRMContact> => {
        const newContact: CRMContact = {
            id: `c_${Date.now()}`,
            name: contact.name || 'Unknown',
            email: contact.email || '',
            tags: contact.tags || [],
            source: contact.source || 'Manual',
            lastActive: 'Just now',
            status: 'Lead',
            ...contact
        } as CRMContact;
        
        MOCK_CONTACTS.unshift(newContact);
        return newContact;
    },

    /**
     * Fetches Automations
     */
    getAutomations: async (): Promise<CRMAutomaton[]> => {
        await new Promise(r => setTimeout(r, 600));
        return MOCK_AUTOMATIONS;
    },

    createAutomation: async (name: string, trigger: string, actions: string[]): Promise<CRMAutomaton> => {
        const newAuto: CRMAutomaton = {
            id: `a_${Date.now()}`,
            name,
            trigger,
            actions,
            status: 'Active',
            enrolledCount: 0
        };
        MOCK_AUTOMATIONS.unshift(newAuto);
        return newAuto;
    },

    /**
     * Fetches Campaigns
     */
    getCampaigns: async (): Promise<CRMCampaign[]> => {
        await new Promise(r => setTimeout(r, 600));
        return MOCK_CAMPAIGNS;
    },

    createCampaign: async (campaign: Partial<CRMCampaign>): Promise<CRMCampaign> => {
        const newCamp: CRMCampaign = {
            id: `camp_${Date.now()}`,
            name: campaign.name || 'New Campaign',
            type: campaign.type || 'Email',
            status: 'Scheduled',
            sentCount: 0,
            openRate: 0,
            clickRate: 0,
            date: new Date().toISOString().split('T')[0],
            ...campaign
        } as CRMCampaign;
        MOCK_CAMPAIGNS.unshift(newCamp);
        return newCamp;
    },

    /**
     * Get Analytics Data for Charts
     */
    getAnalyticsData: async (timeRange: string) => {
        // Generate mock data based on range
        const points = timeRange === '7d' ? 7 : 30;
        const data = [];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        
        for (let i = 0; i < points; i++) {
            const dayLabel = points === 7 ? days[i % 7] : `Day ${i + 1}`;
            data.push({
                name: dayLabel,
                sent: Math.floor(Math.random() * 500) + 100,
                opened: Math.floor(Math.random() * 300) + 50,
                clicked: Math.floor(Math.random() * 100) + 10
            });
        }
        return data;
    }
};
