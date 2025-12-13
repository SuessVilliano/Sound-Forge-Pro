
// server.js - DEPLOY TO CLOUD RUN
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const { PubSub } = require('@google-cloud/pubsub');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const storage = new Storage();
const pubsub = new PubSub();

const BUCKET_NAME = process.env.GCS_BUCKET || 'soundforge-uploads';
const PROJECT_ID = process.env.GCP_PROJECT;
const TOPIC_NAME = process.env.PUBSUB_TOPIC || 'audio-jobs';

// 1. Get Signed URL for direct upload
app.post('/api/upload-url', async (req, res) => {
    try {
        const { filename, contentType } = req.body;
        const objectName = `uploads/${uuidv4()}-${filename}`;
        
        const options = {
            version: 'v4',
            action: 'write',
            expires: Date.now() + 15 * 60 * 1000, // 15 minutes
            contentType: contentType
        };

        const [url] = await storage
            .bucket(BUCKET_NAME)
            .file(objectName)
            .getSignedUrl(options);

        res.json({ uploadUrl: url, objectName, jobId: uuidv4() });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// 2. Trigger Job (After upload is complete)
app.post('/api/jobs', async (req, res) => {
    try {
        const { jobId, objectName, type, meta } = req.body;
        
        const jobData = {
            jobId,
            objectName,
            type, // 'kits_conversion' | 'separation' | 'mastering'
            meta, // { voiceModelId, pitchShift, etc }
            status: 'queued',
            createdAt: new Date().toISOString()
        };

        const dataBuffer = Buffer.from(JSON.stringify(jobData));
        await pubsub.topic(TOPIC_NAME).publish(dataBuffer);

        res.json({ success: true, jobId, status: 'queued' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});

// 3. Webhook Receiver (for Kits.AI callbacks)
app.post('/webhooks/kits', async (req, res) => {
    console.log("Kits Webhook Received:", req.body);
    // Logic to update Firestore with job status
    res.sendStatus(200);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
