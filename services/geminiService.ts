
import { GoogleGenAI, Type, LiveServerMessage, Modality } from "@google/genai";
import { Opportunity, Stats } from "../types";

// Initialize Gemini Client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export interface ChatContext {
  currentView: string;
  stats: Stats;
  opportunities: Opportunity[];
}

// --- MASTER SYSTEM PROMPT ---
// This instructs the AI on exactly how to behave as the SoundForge Core Engine.
const MASTER_SYSTEM_PROMPT = `
YOU ARE THE CORE AI ENGINE OF “SOUNDFORGE,” AN END-TO-END AI MUSIC CREATION, ARTIST DEVELOPMENT, AND RIGHTS-TRACKING PLATFORM.

Your responsibilities:

1. GLOBAL BEHAVIOR
You must always:
- Detect what type of artist or user is speaking.
- Determine their goal and automatically place them onto the correct “track” or pathway.
- Explain things in simple terms, clean steps, and offer buttons, shortcuts, or direct action.
- Reduce confusion. No unnecessary jargon.
- Move them toward actual results (music generated, voice cloned, published, distributed, registered, monetized).
- Automatically track progress in the user’s dashboard.

2. ARTIST IDENTIFICATION (Auto-routing into paths)
When a user interacts, classify them into one of these:
- New Artist (Unregistered, beginner)
- Emerging Artist (Has music but no publishing or distribution)
- Semi-Pro (On ASCAP/BMI but not earning consistently)
- Professional / Label Artist
- Producer / Beatmaker
- Content Creator (non-musician using AI tools)
Each category gets its own personalized workflow and tasks.

3. CORE WORKFLOW STEPS (Pipeline Every Artist Should Move Through)
Every user should be guided through the following simplified, gamified steps:

STEP 1 — Identity Setup
- Artist name
- Genre & vibe
- Goals (choose: hobby, career, monetization, imprint/label, content, distribution, sync licensing)

STEP 2 — PRO Registration Assistance
If user is new:
- Explain ASCAP vs. BMI in simple terms.
- Help them choose one.
- Provide registration links OR let SoundForge collect info to assist.

STEP 3 — Publishing Choice
Ask clearly: “How do you want to publish your music?”
- Option A: Independent → route them to DistroKid / Ditto / UnitedMasters.
- Option B: SoundForge Publishes for You →
  - We become publisher.
  - User gets access to all premium tools free/discounted.
  - We handle metadata, ISRC, UPC, splits, royalty tracking.
  - We automate blockchain registration.
If they choose SoundForge:
- Lock in their publishing agreement inside their dashboard.
- Automatically generate a digital contract summary.

STEP 4 — AI MUSIC CREATION STUDIO
Replicate a Suno-style experience:
- AI Song Generator (prompt → full song)
- Beat Generator
- Structure builder (verse, hook, bridge)
- Style templates
- Mood presets
- Auto mastering
Output must always be: downloadable, saved in user library, versioned.

STEP 5 — AI VOICE CLONING (ElevenLabs/Musicfy equivalent)
Provide:
- Voice clone upload flow
- 30–60 second sample check
- Clean-audio tips
Generate: Singing voice, Speaking voice, Harmonies, Ad-libs, Background vocals.
Save cloned voices in user account.

STEP 6 — LICENSING & BLOCKCHAIN REGISTRATION (Solana)
Automatically:
- Mint a unique NFT voice + song identifier
- Log publishing metadata (ISWC/ISRC/creator ID)
- Enable tracking (stream counts, usage logs, placements)
- Provide transparent royalty dashboard
This is part of your patented system.

STEP 7 — Distribution
If SoundForge Publishing: Auto-assign ISRC and UPC, Prepare metadata, Submit to DSPs (Spotify, Apple, etc.) via integrated pipeline.
If Independent: Route to DistroKid with the pre-formatted metadata package.

STEP 8 — Storage & Dashboard
Automatically store: Voice clones, Draft tracks, Final tracks, Stems, Lyrics, Metadata, Blockchain receipts, Contracts, Royalty statements, Artist progress level.
User should always be able to find everything instantly.

4. GAMIFICATION SYSTEM
Every part of the app should feel like a game.
Levels:
- Level 1: Rookie
- Level 2: Rising Artist
- Level 3: Independent Pro
- Level 4: Verified Artist
- Level 5: Label-Ready
XP is earned by: Completing onboarding, Registering PRO, Uploading a voice, Making a song, Publishing a song, Connecting wallet, Generating AI videos, Sharing a track.
Rewards: Free AI tool credits, More storage, Advanced templates, Voice model upgrades.

5. PREMIUM TOOLS INCLUDED IF THEY CHOOSE SOUNDFORGE PUBLISHING
Tools you unlock for them: Unlimited AI songs, Voice cloning, Studio (melodies, beats, mixdown), AI lyric generation, AI video creator, Cover art generator, Blockchain tracking, Priority distribution, Premium mastering chain.
This is the incentive to choose your publishing option.

6. SUPPORT / “HELP ME” MODE
Whenever the user expresses confusion (“I’m stuck,” “Help me,” “I don’t know what to do”):
Switch into “Mentor Mode.” Explain next steps in simple language.
Provide 2–3 clear buttons: “Let’s Create Music”, “Register My Artist Name”, “Show Me the Path”, “Clone My Voice”, “Publish My Song”, “Explain ASCAP vs BMI”, “Start Over”.

7. INTERNAL CHECKLIST FOR YOUR AI ENGINE
When processing the user’s input, internally check:
- Do they have a voice clone yet?
- Have they completed artist registration?
- Do they have publishing selected?
- Do they have at least one finished song?
- Have they created a wallet or connected one?
- Have they accepted terms for blockchain tracking?
- Are their metadata fields complete?
- Did they save their track in the correct folder?
- Does the song need ISRC assignment?
- Are they trying to distribute?
- Does their song need mastering?
- Are they trying to monetize the voice model?
- Are all assets stored in their library?
If any are missing: Automatically notify and guide them to the missing step.

8. AI BOT LOGIC FOR EXECUTION
Your AI must:
- Tag every interaction with the user’s progress level.
- Auto-create tasks and store them.
- Route user to the next logical step.
- Validate audio quality before cloning.
- Validate song structure before distribution.
- Automatically generate metadata templates.
- Recommend templates based on genre.
- Pre-fill publishing fields when possible.
- Save ALL outputs automatically in user’s library.

9. WEBSITE EXPLANATION TEXT
You must be able to generate: Simple explanations of PROs, How distribution works, How publishing works, What blockchain tracking is, How royalty splits function, How metadata is used, Why voice NFTs protect creators, Step-by-step guides. Tone: Clear. Friendly. No jargon.

10. OUTPUT STYLE
All responses must be:
- Extremely clear
- Short, actionable steps
- Never overwhelming
- Visual when possible (“buttons,” “paths,” “checklists”)
- Always ending with: “What do you want to do next? Choose one:” with 3–5 button options.
`;

// --- NEW: Songwriting Capabilities ---

export interface SongStructure {
  title: string;
  genre: string;
  bpm: number;
  key: string;
  lyrics: string;
  chords: string[];
  structure_analysis: string;
}

export const generateSongStructure = async (topic: string, genre: string, mood: string): Promise<SongStructure> => {
  const ai = getAiClient();
  
  // Fallback if no key
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      title: "Neon Dreams (Demo)",
      genre: genre,
      bpm: 120,
      key: "Am",
      lyrics: "[Verse 1]\nWalking down the boulevard\nNeon lights are shining hard\n\n[Chorus]\nWe are the dreamers of the night\nChasing shadows, chasing light",
      chords: ["Am", "F", "C", "G"],
      structure_analysis: "Standard pop structure with a driving rhythmic verse leading into an anthemic chorus."
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a song about "${topic}". Genre: ${genre}. Mood: ${mood}.
      Return a JSON object with:
      - title
      - bpm (number)
      - key (musical key)
      - lyrics (formatted with [Verse], [Chorus] headers)
      - chords (array of strings, e.g. ["Am", "G"])
      - structure_analysis (brief description of the arrangement)`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            genre: { type: Type.STRING },
            bpm: { type: Type.NUMBER },
            key: { type: Type.STRING },
            lyrics: { type: Type.STRING },
            chords: { type: Type.ARRAY, items: { type: Type.STRING } },
            structure_analysis: { type: Type.STRING }
          }
        }
      }
    });

    return JSON.parse(response.text || "{}") as SongStructure;
  } catch (error) {
    console.error("Songwriting Error:", error);
    throw error;
  }
};

// --- Existing Functions ---

export const parseRawBrief = async (rawText: string): Promise<Partial<Opportunity>> => {
  const ai = getAiClient();
  
  if (!ai) {
    console.warn("No API Key found. Returning mock parsed data.");
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      brief_title: "AI Parsed: " + rawText.substring(0, 20) + "...",
      description: rawText,
      usage_type: "Ad",
      payout_min: 1000,
      payout_max: 5000,
      mood_tags: ["Generated", "AI", "Test"],
      match_score: Math.floor(Math.random() * 40) + 60,
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Extract the structured data from the following raw sync licensing brief.
      Raw Brief: ${rawText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            brief_title: { type: Type.STRING },
            description: { type: Type.STRING },
            usage_type: { type: Type.STRING, enum: ["Ad", "TV", "Film", "Game"] },
            payout_min: { type: Type.NUMBER },
            payout_max: { type: Type.NUMBER },
            mood_tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            recommended_bpm: { type: Type.NUMBER },
          }
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      ...parsed,
      match_score: 88, 
      risk_score: 12,
      submission_status: 'open',
      source_platform: 'internal'
    };
  } catch (error) {
    console.error("Gemini Parsing Error:", error);
    throw error;
  }
};

export const generatePitchEmail = async (opportunity: Opportunity, trackName: string): Promise<string> => {
  const ai = getAiClient();

  if (!ai) {
     await new Promise(resolve => setTimeout(resolve, 1000));
     return `Subject: Submission for ${opportunity.brief_title}\n\nHi there,\n\nI saw your brief for "${opportunity.brief_title}" and wanted to submit my track "${trackName}". It features the high-energy vibe you're looking for.\n\nBest,\n[Artist Name]`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a short, professional sync licensing pitch email for the track "${trackName}" in response to the brief: "${opportunity.brief_title}". The brief requires: ${opportunity.description}. Keep it under 100 words.`
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Pitch Error:", error);
    return "Error generating pitch.";
  }
};

export const chatWithGemini = async (
  message: string, 
  history: {role: 'user' | 'model', text: string}[],
  context?: ChatContext
): Promise<string> => {
  const ai = getAiClient();
  
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return "I'm currently in demo mode. Connect an API Key to chat with the real Gemini AI! I can tell you that SoundForge Pro helps you with Sync Licensing, Distribution, and Mastering.";
  }

  try {
    const chatHistory = history.slice(0, history.length - 1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    // Inject real-time context into the Master Prompt
    let fullSystemInstruction = MASTER_SYSTEM_PROMPT;

    if (context) {
        fullSystemInstruction += `\n\nCURRENT USER CONTEXT [REAL-TIME DATA]:
        - Current View: '${context.currentView}'
        - Artist Level: ${context.stats.artistLevel}
        - XP: ${context.stats.xp} / ${context.stats.nextLevelXp}
        - Total Earnings: $${context.stats.totalEarnings}
        - Brand Score: ${context.stats.brandScore}
        - Active Opportunities: ${context.opportunities.length}
        - Top 3 Opportunities: ${context.opportunities.slice(0, 3).map(o => `"${o.brief_title}" (${o.usage_type})`).join(', ')}.
        
        Use this data to personalize the gamified experience. Refer to their Artist Level when appropriate.`;
    }

    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction: fullSystemInstruction,
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I didn't receive a response from the model.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm sorry, I encountered an error processing your request. Please try again later.";
  }
};

export const generateBrandImage = async (
  prompt: string, 
  size: '1K' | '2K' | '4K',
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'
): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return "https://picsum.photos/1024/1024"; 
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: aspectRatio
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Generation Error:", error);
    return null;
  }
};

export const editBrandImage = async (
  imageBase64: string,
  prompt: string,
  size: '1K' | '2K' | '4K'
): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return "https://picsum.photos/1024/1024";
  }

  try {
    // Strip header if present
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/png', data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        imageConfig: {
          imageSize: size,
          aspectRatio: '1:1' 
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Image Edit Error:", error);
    return null;
  }
};

export const generateVideoFromImage = async (
  imageBase64: string,
  prompt: string,
  aspectRatio: '16:9' | '9:16'
): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) {
     // Mock for development without key
     await new Promise(resolve => setTimeout(resolve, 3000));
     return null;
  }

  try {
    // Strip header if present
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt || "Animate this image naturally", 
      image: {
        imageBytes: base64Data,
        mimeType: 'image/png', 
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); 
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) return null;

    // Fetch actual video with key
    const videoResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);

  } catch (error) {
    console.error("Video Gen Error:", error);
    return null;
  }
};

export const analyzeImage = async (imageBase64: string): Promise<string[]> => {
  const ai = getAiClient();
  if (!ai) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return ["Guitar", "Stage", "Microphone", "Lighting", "Concert"];
  }

  try {
    const base64Data = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Multimodal model for analysis
      contents: {
        parts: [
            { inlineData: { mimeType: 'image/png', data: base64Data } },
            { text: "List the top 5 main objects or concepts visible in this image. Return them as a comma-separated list." }
        ]
      }
    });

    const text = response.text || "";
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Analysis Error:", error);
    return [];
  }
};

export const searchVenues = async (
  query: string,
  location?: { latitude: number; longitude: number }
) => {
  const ai = getAiClient();
  if (!ai) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      text: "I found a few great venues near you that host live music. The Elephant Room is a classic jazz basement, while Antone's is legendary for blues. For larger shows, check out The Moody Theater.",
      places: [
        { title: "The Elephant Room", uri: "https://maps.google.com/?q=Elephant+Room" },
        { title: "Antone's Nightclub", uri: "https://maps.google.com/?q=Antone's" },
        { title: "ACL Live at The Moody Theater", uri: "https://maps.google.com/?q=ACL+Live" }
      ]
    };
  }

  try {
    const config: any = {
      tools: [{ googleMaps: {} }],
    };

    if (location) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: location,
        },
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: config,
    });

    const text = response.text || "No results found.";
    
    // Extract grounding chunks to get map links
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places = chunks
      .filter((c: any) => c.maps?.uri || c.web?.uri)
      .map((c: any) => {
        const mapData = c.maps;
        const webData = c.web;
        return {
          title: mapData?.title || webData?.title || "View Location",
          uri: mapData?.uri || webData?.uri
        };
      });

    return { text, places };
  } catch (error) {
    console.error("Maps Grounding Error:", error);
    return { text: "Sorry, I couldn't access Google Maps at the moment.", places: [] };
  }
};

// Helpers for Live API
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export class LiveSession {
  private client: GoogleGenAI | null;
  private sessionPromise: Promise<any> | null = null;
  private inputAudioContext: AudioContext | null = null;
  private outputAudioContext: AudioContext | null = null;
  private inputSource: MediaStreamAudioSourceNode | null = null;
  private processor: ScriptProcessorNode | null = null;
  private outputNode: GainNode | null = null;
  private nextStartTime: number = 0;
  private stream: MediaStream | null = null;
  
  public onAudioData: () => void = () => {};

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
        this.client = new GoogleGenAI({ apiKey });
    } else {
        this.client = null;
        console.warn("No API Key for LiveSession");
    }
  }

  async connect() {
    if (!this.client) return;

    this.inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    this.outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    this.outputNode = this.outputAudioContext.createGain();
    this.outputNode.connect(this.outputAudioContext.destination);

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    this.sessionPromise = this.client.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
            onopen: () => {
                console.log("Live Session Opened");
                this.startAudioStream();
            },
            onmessage: (msg: LiveServerMessage) => {
                this.handleMessage(msg);
            },
            onclose: () => {
                console.log("Live Session Closed");
            },
            onerror: (err: any) => {
                console.error("Live Session Error", err);
            }
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
            },
        }
    });
  }

  private startAudioStream() {
    if (!this.inputAudioContext || !this.stream || !this.sessionPromise) return;
    
    this.inputSource = this.inputAudioContext.createMediaStreamSource(this.stream);
    this.processor = this.inputAudioContext.createScriptProcessor(4096, 1, 1);
    
    this.processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert Float32 to Int16 PCM
        const l = inputData.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = inputData[i] * 32768;
        }
        const base64 = bytesToBase64(new Uint8Array(int16.buffer));
        
        this.sessionPromise?.then(session => {
            session.sendRealtimeInput({
                media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64
                }
            });
        });
    };
    
    this.inputSource.connect(this.processor);
    this.processor.connect(this.inputAudioContext.destination);
  }

  private async handleMessage(message: LiveServerMessage) {
      const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
      if (base64Audio && this.outputAudioContext) {
          this.onAudioData(); 
          
          const audioBytes = base64ToBytes(base64Audio);
          const dataInt16 = new Int16Array(audioBytes.buffer);
          const float32 = new Float32Array(dataInt16.length);
          for(let i=0; i<dataInt16.length; i++) {
              float32[i] = dataInt16[i] / 32768.0;
          }
          
          const buffer = this.outputAudioContext.createBuffer(1, float32.length, 24000);
          buffer.getChannelData(0).set(float32);
          
          const source = this.outputAudioContext.createBufferSource();
          source.buffer = buffer;
          source.connect(this.outputNode!);
          
          const currentTime = this.outputAudioContext.currentTime;
          if (this.nextStartTime < currentTime) {
              this.nextStartTime = currentTime;
          }
          source.start(this.nextStartTime);
          this.nextStartTime += buffer.duration;
      }
  }

  disconnect() {
    if (this.sessionPromise) {
        this.sessionPromise.then((s: any) => s.close());
    }
    this.processor?.disconnect();
    this.inputSource?.disconnect();
    this.stream?.getTracks().forEach(t => t.stop());
    this.inputAudioContext?.close();
    this.outputAudioContext?.close();
  }
}
