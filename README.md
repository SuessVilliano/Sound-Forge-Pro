# Sound Merge

The complete music industry platform for artists. AI-powered sync licensing, distribution, revenue recovery, and real-time analytics.

## 🚀 New Features (v2.5)

### 1. Real-Time Data Layer (RapidAPI)
We have integrated **RapidAPI** to replace static mock data with live industry metrics. This allows artists to see actual market trends and performance data.

**Key Integrations:**
- **A&R Dashboard (Billboard)**: Fetches the live **Billboard Hot 100** chart using `billboard-api2.p.rapidapi.com`. It provides rank, previous rank, peak position, and weeks on chart.
- **Analytics (Spotify)**: Pulls real-time **Spotify Artist Stats** (Monthly Listeners, Followers) and Track Stream counts.
- **Architecture**: Implements an "Agent/Connector" pattern in `services/rapidApiService.ts` to normalize external JSON responses into Sound Merge's internal schema.

### 2. Merge Assets (Ledger)
- Users can now **Secure** (Authenticate) their work on the Sound Merge Ledger.
- Assets are persisted to local storage and the blockchain for instant rights verification.
- A dedicated "Asset Vault" allows for quick management of Digital Rights Certificates.

### 3. VoiceShield™
- Biometric voice fingerprinting.
- "Solana" blockchain integration for IP registration and rights management.
- Build your **Merge Reputation** to earn future $MERGE utility tokens.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Lucide React
- **AI**: Google Gemini (GenAI SDK), ElevenLabs (TTS), Kits.AI (Voice Conversion)
- **Data**: Firebase (Firestore/Auth), RapidAPI (Billboard/Spotify)
- **State**: React Context (Player), Local Storage (Persistence)

## 🔑 Environment Setup

Create a `.env` file in the root directory:

```env
# Google Gemini API
API_KEY=your_gemini_api_key

# RapidAPI (Billboard/Spotify)
RAPID_API_KEY=39b9c246b0msh8981e7993ba7354p1804d6jsn4711338b7ff9

# Optional Integrations
VITE_ELEVENLABS_KEY=your_elevenlabs_key
VITE_KITS_API_KEY=your_kits_ai_key
```

## 📦 Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

- `/components`: UI Building blocks (Charts, Modals, Dashboards).
- `/services`: 
  - `geminiService.ts`: AI Chat and Generation.
  - `rapidApiService.ts`: External Data Connectors (RapidAPI).
  - `dataService.ts`: Firebase & Local Storage logic.
  - `audioService.ts`: ElevenLabs & Kits.AI integration.
- `/contexts`: Global state (Music Player).

## 📄 License

Sound Merge is proprietary software.