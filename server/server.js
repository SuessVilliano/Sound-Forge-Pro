
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const axios = require('axios');

// Updated to point to the new project node: soundmerge-77880
if (process.env.NODE_ENV !== 'production' && !admin.apps.length) {
    admin.initializeApp({
        projectId: process.env.GCP_PROJECT || 'soundmerge-77880'
    });
} else if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();
const app = express();
app.use(cors());
app.use(express.json());

const RAPID_API_KEY = process.env.RAPID_API_KEY || "39b9c246b0msh8981e7993ba7354p1804d6jsn4711338b7ff9";

/**
 * AUTH MIDDLEWARE
 * Verifies the Firebase ID token sent from the frontend.
 */
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const idToken = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

/**
 * RAPIDAPI SECURE PROXY
 */
app.get('/api/sync/:node', authenticateToken, async (req, res) => {
    const { node } = req.params;
    const { q, type, id, isrc } = req.query;

    let url = '';
    let host = '';

    switch (node) {
        case 'spotify-search':
            url = `https://spotify23.p.rapidapi.com/search/?q=${encodeURIComponent(q)}&type=${type || 'multi'}&offset=0&limit=15`;
            host = 'spotify23.p.rapidapi.com';
            break;
        case 'spotify-streams':
            url = `https://spotify-track-streams-playback-count1.p.rapidapi.com/tracks/spotify_track_streams?spotify_track_id=${id}${isrc ? `&isrc=${isrc}` : ''}`;
            host = 'spotify-track-streams-playback-count1.p.rapidapi.com';
            break;
        case 'billboard':
            url = 'https://billboard-api2.p.rapidapi.com/hot-100?range=1-100';
            host = 'billboard-api2.p.rapidapi.com';
            break;
        default:
            return res.status(400).json({ error: 'Invalid sync node' });
    }

    try {
        const response = await axios.get(url, {
            headers: {
                'X-RapidAPI-Key': RAPID_API_KEY,
                'X-RapidAPI-Host': host
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error(`[RapidProxy] Error fetching from ${host}:`, error.message);
        res.status(500).json({ error: 'Failed to synchronize with industry node' });
    }
});

/**
 * HEADLESS GHL PROVISIONING
 */
app.post('/api/integrations/ghl/provision', authenticateToken, async (req, res) => {
    const { userId, role } = req.body;
    // Logic for HighLevel sub-account creation via Sound Merge rails
    res.json({ success: true, message: 'Institutional node provisioning initiated' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Sound Merge Server active on port ${PORT}`));
