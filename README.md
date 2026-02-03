# Sound Forge Pro v3.0

**The Institutional Operating System for Modern Music Creators**

Sound Forge Pro provides artists and labels with enterprise-grade infrastructure for AI-powered music creation, global distribution, and intelligent opportunity matching.

---

## Core Features

### AI Music Studio
Multi-engine music generation powered by leading AI platforms:
- **Udio** - High-fidelity vocal and instrumental generation
- **Suno** - Vocal synthesis and song creation
- **MusicGPT** - Rapid prototype generation
- **Mureka** - Cinematic and orchestral composition
- **AIMusic** - Experimental hybrid generation

**Credit Cost:** 5 credits per generation

### AI Staff (Virtual Team)
Powered by Google Gemini, your AI staff handles business operations:
- **Manager** - Strategic planning and career guidance
- **Marketing** - Social media and brand growth
- **Distribution** - Platform strategy and metadata
- **Legal** - Rights protection and contract guidance

### Live Agent
Real-time voice conversation with your AI manager using Gemini Native Audio.

### Sync Licensing Opportunities
Intelligent opportunity matching across 8 platforms:

| Platform | Tier Required | Avg Payout |
|----------|---------------|------------|
| Songtradr | Free | $500 - $50K |
| Musicbed | Pro | $1K - $100K |
| Artlist | Free | $100 - $5K |
| Epidemic Sound | Free | $50 - $2K |
| Music Gateway | Pro | $500 - $25K |
| Syncr | Free | $200 - $10K |
| TAXI | Pro | $1K - $50K |
| Songistry | Free | $100 - $15K |

**Opportunity Categories:**
- Advertising, Film, Television, Video Games
- Trailers, Social Media, Podcasts, Corporate

### Distribution (DistroKid-Compatible)
Seamless export to DistroKid with:
- Auto-generated ISRC codes
- UPC code generation
- Metadata formatting
- Multiple export formats (CSV, JSON, TXT)
- Copy-paste ready submission data

### Brand Builder
AI-powered visual identity creation:
- Cover art generation (Gemini Image)
- Promotional videos (Veo 3.1)
- Social media assets
- Cinematic lip-sync videos (Kling AI)

**Credit Costs:**
- Brand Image: 3 credits
- Brand Video: 15 credits

### VoiceShield Protection
Biometric vocal fingerprinting and deepfake detection:
- Voice DNA registration on Solana ledger
- Synthetic artifact scanning
- IP ownership proofs

### Smart Wallet
On-chain rights management via Alchemy:
- Solana and Polygon integration
- Gasless transactions
- NFT minting for rights

---

## Pricing & Credits

### Subscription Tiers

| Plan | Price | Credits/Month | Royalty Share |
|------|-------|---------------|---------------|
| Artist (Free) | $0 | 50 | 80% |
| Artist Pro | $19/mo | 500 | 100% |
| Label | $99/mo | 2,500 | 100% |

### Credit Packages (One-Time)

| Package | Credits | Price | Bonus |
|---------|---------|-------|-------|
| Starter | 100 | $9 | - |
| Creator | 300 | $24 | +10% |
| Pro | 750 | $49 | +25% |
| Studio | 2,000 | $99 | +50% |

### Credit Costs

| Feature | Cost |
|---------|------|
| Music Generation | 5 credits |
| Video Generation | 10 credits |
| Stem Separation | 3 credits |
| Voice Conversion | 5 credits |
| AI Mastering | 2 credits |
| Brand Image | 3 credits |
| Brand Video | 15 credits |

---

## Progressive Unlocks (XP-Based)

Features unlock as you gain reputation (XP):

**Core (Always Available):**
- Dashboard, AI Staff, AI Studio, Voice Market

**Level 1 (First Asset):**
- My Library, Music Catalog

**Level 2 (500 XP):**
- Opportunities, Brand Builder, Music Battles, Partners

**Level 3 (1000 XP):**
- Distribution, Revenue Recovery, Gig Finder

**Level 4 (2000 XP):**
- CRM, Advances, Smart Wallet, DAO

**Pro Only:**
- Advanced Analytics, A&R Dashboard

---

## Environment Configuration

Copy `.env.example` to `.env` and configure:

### Required for AI Features
```
VITE_GEMINI_API_KEY=           # Google Gemini (AI Staff, Brand Builder)
```

### Music Generation Engines (Optional - any one enables generation)
```
VITE_UDIO_API_KEY=             # Udio
VITE_SUNO_API_KEY=             # Suno
VITE_MUSICGPT_API_KEY=         # MusicGPT
VITE_MUREKA_API_KEY=           # Mureka
VITE_AIMUSIC_API_KEY=          # AIMusic
```

### Video & Audio
```
VITE_KLING_ACCESS_KEY=         # Kling AI video
VITE_KLING_SECRET_KEY=
VITE_KITS_API_KEY=             # Kits.AI voice/stems
VITE_RESEMBLE_API_KEY=         # Resemble deepfake detection
```

### Firebase (Required for auth/data)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### Payments (Required for subscriptions)
```
VITE_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=             # Backend only
```

### Blockchain (Optional)
```
VITE_ALCHEMY_API_KEY=          # Solana/Polygon RPC
```

---

## Tech Stack

- **Frontend:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **AI:** Google Gemini (2.5 Flash, Native Audio, Veo 3.1)
- **Music:** Udio, Suno, MusicGPT, Mureka, AIMusic
- **Video:** Kling AI, Gemini Veo
- **Voice:** Kits.AI, Resemble AI
- **Auth/DB:** Firebase (Firestore, Auth)
- **Payments:** Stripe
- **Blockchain:** Alchemy (Solana, Polygon)

---

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Architecture

```
/components          # React UI components
/services
  ├── config.ts      # Centralized configuration
  ├── geminiService.ts    # AI agents and generation
  ├── creditService.ts    # Credit management
  ├── opportunityService.ts # Sync licensing
  ├── distributionService.ts # DistroKid export
  ├── authService.ts      # Authentication
  ├── dataService.ts      # Firestore operations
  └── paymentService.ts   # Stripe integration
/types               # TypeScript definitions
/constants.tsx       # App constants and navigation
```

---

## Security

- All API keys managed via environment variables
- No hardcoded credentials in source
- Firebase Auth with email/password and OAuth
- Stripe for PCI-compliant payments
- On-chain rights anchoring for IP protection

---

## Support

For issues or feature requests:
- Create an issue in the repository
- Contact support via the in-app AI Staff

---

**Sound Forge Pro** - The Rails for the Next Era of Music

2025 Sound Forge Inc.
