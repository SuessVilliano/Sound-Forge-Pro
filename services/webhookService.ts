
import { User, WebhookLog, Opportunity } from '../types';

// This URL should point to your backend automation (Make.com, Zapier, n8n)
// which then routes data to Supabase (Backup) and HighLevel (CRM/Community)
// Example: "https://hook.us1.make.com/..."
const SYSTEM_WEBHOOK_URL = process.env.SYSTEM_BACKUP_WEBHOOK || "https://apps.taskmagic.com/api/v1/webhooks/JPKrlyiBI0keHNRdW38Hw"; 

// Local storage for logs (Mock Database for Webhooks)
let webhookLogs: WebhookLog[] = [];

export const webhookService = {
    
    /**
     * Sends critical user data to the system backup (Supabase) and CRM (HighLevel).
     * This is called immediately after signup.
     */
    sendSystemEvent: async (eventType: 'signup' | 'profile_update' | 'plan_change' | 'admin_test' | 'sync_match', userData: User, extraData?: any) => {
        const payload = {
            event: eventType,
            timestamp: new Date().toISOString(),
            user: {
                uid: userData.uid,
                email: userData.email,
                displayName: userData.displayName,
                phone: userData.phoneNumber || '',
                plan: userData.plan,
                photoURL: userData.photoURL
            },
            ...extraData
        };

        const logEntry: WebhookLog = {
            id: `hook_${Date.now()}`,
            timestamp: new Date().toISOString(),
            event: eventType,
            status: 'pending',
            payload: payload,
            destination: SYSTEM_WEBHOOK_URL
        };

        webhookLogs.unshift(logEntry); // Add to local log

        try {
            // Fire and forget (don't await strictly if performance is key, but good to know if it fails)
            const response = await fetch(SYSTEM_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            logEntry.status = response.ok ? 'success' : 'failed';
            logEntry.responseCode = response.status;
            
            console.log(`[System Webhook] Sent ${eventType} event. Status: ${response.status}`);

        } catch (e) {
            console.error("Error sending system webhook", e);
            logEntry.status = 'failed';
        }
    },

    /**
     * Specifically send a sync match notification
     */
    sendSyncMatchNotification: async (user: User, opportunity: Opportunity) => {
        if (!user.notificationSettings?.emailSyncMatches) return;

        console.log(`[Notification] Dispatching email alert for ${user.email}: New match for ${opportunity.brief_title}`);
        
        await webhookService.sendSystemEvent('sync_match', user, {
            opportunity: {
                id: opportunity.id,
                title: opportunity.brief_title,
                payout: `${opportunity.payout_min} - ${opportunity.payout_max}`,
                usage: opportunity.usage_type
            }
        });
    },

    /**
     * Triggers a user-defined webhook if they have one configured in their profile.
     * Used for things like "New Sale", "New Stream Milestone".
     */
    triggerUserWebhook: async (user: User, event: 'sale' | 'stream' | 'placement', data: any) => {
        if (!user.webhooks?.enabled || !user.webhooks.url) return;
        
        // Check if user subscribed to this event type
        if (user.webhooks.events && !user.webhooks.events.includes(event)) return;

        const payload = {
            event,
            timestamp: new Date().toISOString(),
            data
        };

        const logEntry: WebhookLog = {
            id: `user_hook_${Date.now()}`,
            timestamp: new Date().toISOString(),
            event: event,
            status: 'pending',
            payload: payload,
            destination: user.webhooks.url
        };
        webhookLogs.unshift(logEntry);

        try {
            const response = await fetch(user.webhooks.url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            logEntry.status = response.ok ? 'success' : 'failed';
            logEntry.responseCode = response.status;

            console.log(`[User Webhook] Triggered for ${user.email}`);
        } catch (e) {
            console.error(`[User Webhook] Failed for ${user.email}`, e);
            logEntry.status = 'failed';
        }
    },

    /**
     * Admin Function: Retrieve logs for the dashboard
     */
    getLogs: (): WebhookLog[] => {
        return webhookLogs;
    },

    /**
     * Admin Function: Clear logs
     */
    clearLogs: () => {
        webhookLogs = [];
    }
};
