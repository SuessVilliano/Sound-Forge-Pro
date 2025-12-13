
// worker.js - DEPLOY TO CLOUD RUN (Worker)
const express = require('express');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
app.use(express.json());

const storage = new Storage();
const BUCKET_NAME = process.env.GCS_BUCKET;
const KITS_API_KEY = process.env.KITS_API_KEY;

app.post('/pubsub/push', async (req, res) => {
    if (!req.body.message) return res.status(400).send('Bad Request');

    const message = Buffer.from(req.body.message.data, 'base64').toString();
    const job = JSON.parse(message);

    console.log(`Processing Job: ${job.jobId} (${job.type})`);

    try {
        if (job.type === 'kits_conversion') {
            await handleKitsConversion(job);
        }
        // Handle other types...
        
        res.status(200).send('OK');
    } catch (e) {
        console.error("Worker Error:", e);
        res.status(500).send(e.message);
    }
});

async function handleKitsConversion(job) {
    // 1. Download file from GCS
    const tempFilePath = path.join(os.tmpdir(), `input-${job.jobId}.wav`);
    await storage.bucket(BUCKET_NAME).file(job.objectName).download({ destination: tempFilePath });

    // 2. Call Kits API
    const formData = new FormData();
    formData.append('soundFile', fs.createReadStream(tempFilePath));
    formData.append('voiceModelId', job.meta.voiceModelId);
    
    const response = await axios.post('https://arpeggi.io/api/kits/v1/voice-conversions', formData, {
        headers: {
            'Authorization': `Bearer ${KITS_API_KEY}`,
            ...formData.getHeaders()
        }
    });

    console.log("Kits Job Started:", response.data);
    
    // 3. Clean up
    fs.unlinkSync(tempFilePath);
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Worker listening on ${PORT}`));
