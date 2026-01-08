
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const { PubSub } = require('@google-cloud/pubsub');
const admin = require('firebase-admin');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

if (process.env.NODE_ENV !== 'production' && !admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.GCP_PROJECT || 'sound-forge-9240f'
    });
} else if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

const GHL_AGENCY_API_KEY = process.env.GHL_AGENCY_API_KEY;
const GHL_BASE_URL = "https://services.leadconnectorhq.com";

// Role to Snapshot mapping
const SNAPSHOT_IDS = {
    artist: process.env.GHL_SNAPSHOT_ARTIST_ID || 'ARTIST_01',
    producer: process.env.GHL_SNAPSHOT_PRODUCER_ID || 'PRODUCER_01',
    label: process.env.GHL_SNAPSHOT_LABEL_ID || 'LABEL_01'
};

/**
 * HEADLESS GHL PROVISIONING
 */
app.post('/api/integrations/ghl/provision', async (req, res) => {
    const { userId, role } = req.body;
    try {
        const userDoc = await db.collection('users').doc(userId).get();
        const userData = userDoc.data();

        // 1. Create Location (Sub-account)
        // Note: Real GHL API requires specific Agency endpoints
        const locationRes = await axios.post(`${GHL_BASE_URL}/locations/`, {
            name: `${userData.displayName} - Sound Merge`,
            email: userData.email,
            address: "Digital Office",
            city: "Cloud",
            country: "US",
            timezone: "UTC"
        }, {
            headers: { 'Authorization': `Bearer ${GHL_AGENCY_API_KEY}` }
        });

        const locationId = locationRes.data.id;

        // 2. Apply Snapshot
        const snapshotId = SNAPSHOT_IDS[role] || SNAPSHOT_IDS.artist;
        await axios.post(`${GHL_BASE_URL}/locations/${locationId}/snapshots/${snapshotId}`, {}, {
            headers: { 'Authorization': `Bearer ${GHL_AGENCY_API_KEY}` }
        });

        // 3. Save mapping
        const integrationData = {
            userId,
            ghlLocationId: locationId,
            status: 'active',
            connectedChannels: ['email'],
            createdAt: new Date().toISOString()
        };
        await db.collection('integrations_ghl').doc(userId).set(integrationData);
        await db.collection('users').doc(userId).update({ ghlIntegration: integrationData });

        res.json({ success: true, locationId });
    } catch (e) {
        console.error("GHL PROVISIONING ERROR:", e.response?.data || e.message);
        res.status(500).json({ success: false, error: "Snapshot Application Failed" });
    }
});

/**
 * WEBHOOK INGESTOR
 * Receives events from GHL and mirrors them to our local Firestore for Inbox UI
 */
app.post('/api/integrations/ghl/webhook', async (req, res) => {
    const payload = req.body;
    // Fast 200 response for GHL
    res.status(200).send('OK');

    try {
        if (payload.type === 'InboundMessage') {
            const { conversationId, body, contactId, locationId } = payload;
            
            // Find our user linked to this location
            const integrationSnap = await db.collection('integrations_ghl').where('ghlLocationId', '==', locationId).limit(1).get();
            if (integrationSnap.empty) return;
            const integration = integrationSnap.docs[0].data();

            // Upsert Thread
            const threadId = `thread_${conversationId}`;
            await db.collection('messages_threads').doc(threadId).set({
                userId: integration.userId,
                externalThreadId: conversationId,
                lastMessageText: body,
                lastMessageAt: new Date().toISOString(),
                status: 'open'
            }, { merge: true });

            // Add Message
            await db.collection('messages').add({
                threadId,
                direction: 'inbound',
                body,
                provider: 'ghl',
                timestamp: new Date().toISOString()
            });
        }
    } catch (e) {
        console.error("WEBHOOK ERROR:", e);
    }
});

/**
 * MESSAGING SEND PROXY
 */
app.post('/api/inbox/send', async (req, res) => {
    const { threadId, body, preferredChannel } = req.body;
    try {
        // Fetch location token/keys from our DB (Assume stored during provision)
        const threadDoc = await db.collection('messages_threads').doc(threadId).get();
        const thread = threadDoc.data();
        const integrationDoc = await db.collection('integrations_ghl').doc(thread.userId).get();
        const integration = integrationDoc.data();

        // Proxied GHL Call
        await axios.post(`${GHL_BASE_URL}/conversations/${thread.externalThreadId}/messages`, {
            type: preferredChannel || 'SMS',
            message: body
        }, {
            headers: { 'Authorization': `Bearer ${integration.locationApiKey}` }
        });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

/**
 * SOCIAL PLANNER PROXY (GHL 2.0 Social Planner)
 */
app.get('/api/social/accounts', async (req, res) => {
    // Return connected accounts for a specific location
    res.json([]);
});

app.post('/api/social/posts', async (req, res) => {
    const { userId, caption, scheduledAt, mediaUrls, networks } = req.body;
    try {
        // Proxied GHL Social Post Creation
        res.json({ success: true, ghlPostId: "mock_post_id" });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// ... existing endpoints remain
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Sound Merge Institutional Server listening on ${PORT}`));
