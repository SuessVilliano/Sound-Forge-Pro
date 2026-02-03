
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { Opportunity, Stats, AiStaffMember, User, StaffProposal, SyncBrief, BriefArtifacts, StudioSuggestion, DistributionSubmission } from "../types";
import { AI_CONFIG, isConfigured } from './config';

const getAiClient = () => {
  if (!isConfigured.gemini()) {
    console.warn('[GeminiService] API key not configured. AI features will use fallback responses.');
    return null;
  }
  return new GoogleGenAI({ apiKey: AI_CONFIG.GEMINI_API_KEY });
};

export interface ChatContext {
  currentView: string;
  stats: Stats;
  opportunities: Opportunity[];
  user?: User;
  agentRole?: AiStaffMember['role'] | 'Team Hub';
  pendingDistributions?: DistributionSubmission[];
}

// Fallback responses for when AI is not configured
const FALLBACK_RESPONSES: Record<string, string[]> = {
  manager: [
    "Let's focus on your top priorities. What's your biggest challenge right now?",
    "Strategic growth requires consistent effort. Keep pushing forward.",
    "Your catalog is your foundation. Let's build on it strategically.",
  ],
  marketing: [
    "Social presence is key. Consistent posting builds momentum.",
    "Engage with your audience authentically - it makes all the difference.",
    "Your brand story is unique. Let's amplify it across channels.",
  ],
  distribution: [
    "Distribution timing matters. Plan releases around key moments.",
    "Multi-platform presence maximizes your reach potential.",
    "Metadata quality directly impacts discoverability.",
  ],
  legal: [
    "Protect your IP early - it's easier than fixing issues later.",
    "Clear rights documentation is essential for sync opportunities.",
    "VoiceShield registration helps secure your vocal identity.",
  ],
  default: [
    "I'm here to help you navigate the music industry.",
    "Let's work together on growing your career.",
    "What aspect of your music business needs attention?",
  ]
};

const getFallbackResponse = (role?: string): string => {
  const responses = FALLBACK_RESPONSES[role || 'default'] || FALLBACK_RESPONSES.default;
  return responses[Math.floor(Math.random() * responses.length)];
};

/**
 * SOUND FORGE PRO CORE INTELLIGENCE ENGINE
 * Optimized for multi-turn institutional strategy sessions.
 */
export const chatWithGemini = async (message: string, history: any[], context: ChatContext): Promise<string> => {
  const ai = getAiClient();

  // If AI not configured, return contextual fallback
  if (!ai) {
    return getFallbackResponse(context.agentRole);
  }

  const systemInstruction = `
    You are an elite Music Industry Professional and Senior Strategist at Sound Forge Pro.
    Your tone is authoritative, highly competent, and conversational.
    Respond in PLAIN TEXT ONLY. Max 2-3 sentences.

    Artist Stats: ${context.stats.totalStreams} streams, $${context.stats.totalEarnings} earnings.
    Current Department: ${context.agentRole || 'General Strategy'}.
    View: ${context.currentView}.
    User Name: ${context.user?.displayName || 'Artist'}.
    Plan: ${context.user?.plan || 'free'}.
  `;

  // Construct proper multi-turn contents array for the SDK
  const contents = [
    ...history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    })),
    { role: 'user', parts: [{ text: message }] }
  ];

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using stable Gemini 2.5 Flash
      contents,
      config: {
        systemInstruction,
      }
    });

    return response.text || "Processing your request...";
  } catch (e: any) {
    console.error("[GeminiService] Chat error:", e?.message || e);
    // Return contextual fallback on error
    return getFallbackResponse(context.agentRole);
  }
};

/**
 * NEURAL PITCH GENERATOR for Affiliate Program
 */
export const generateAffiliatePitch = async (targetVibe: string, artistName: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) {
        return `Hey! ${artistName} here. Sound Forge Pro gives you 100% royalties and VoiceShield protection. Level up your music career!`;
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{
                role: 'user',
                parts: [{ text: `Write a hyper-compelling, 1-sentence social media pitch for Sound Forge Pro. The sender is ${artistName}. The target audience vibe is ${targetVibe}. Highlight: 100% royalties and VoiceShield protection. No markdown.` }]
            }]
        });
        return response.text || "Join the Sound Forge movement and keep 100% of your ownership.";
    } catch (e) {
        return "Upgrade your music career with Sound Forge Pro infrastructure.";
    }
};

export const getStudioAgentSuggestions = async (styleInput: string, lyrics: string): Promise<StudioSuggestion[]> => {
  const ai = getAiClient();

  // Return default suggestions if AI not configured
  if (!ai) {
    return [
      { id: 'sug_1', agentId: 'beat', type: 'beat', title: 'Add punch to drums', description: 'Layer a kick sample for more impact', promptAddon: 'punchy drums, hard hitting kick', timestamp: new Date().toISOString() },
      { id: 'sug_2', agentId: 'melody', type: 'vocal', title: 'Melodic hook', description: 'Consider a catchy vocal hook in the chorus', promptAddon: 'memorable vocal melody, singable hook', timestamp: new Date().toISOString() },
      { id: 'sug_3', agentId: 'engineer', type: 'fx', title: 'Add atmosphere', description: 'Reverb and delay for depth', promptAddon: 'atmospheric, spacious mix, reverb', timestamp: new Date().toISOString() },
    ];
  }

  const prompt = `
    Act as a professional production team. Generate 3 musical suggestions in JSON format.
    Style: "${styleInput}"
    ${lyrics ? `Lyrics context: "${lyrics.substring(0, 200)}"` : ''}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              agentId: { type: Type.STRING },
              type: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              promptAddon: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]').map((d: any) => ({ ...d, timestamp: new Date().toISOString() }));
  } catch (e) {
    console.error('[GeminiService] Studio suggestions error:', e);
    return [];
  }
};

export const parseBriefToSchema = async (rawText: string): Promise<Partial<SyncBrief>> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Normalize this sync brief into JSON: "${rawText}"` }] }],
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { title: "Imported Brief" };
    }
};

export const searchAddresses = async (query: string): Promise<any[]> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [{ role: 'user', parts: [{ text: `Business addresses for: "${query}".` }] }],
      config: { tools: [{ googleMaps: {} }] }
    });
    return response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri })) || [];
  } catch (e) { return []; }
};

export const generateBriefArtifacts = async (brief: SyncBrief): Promise<BriefArtifacts> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: [{ role: 'user', parts: [{ text: `Blueprint for: "${brief.title}"` }] }],
            config: { responseMimeType: "application/json" }
        });
        return { id: `art_${Date.now()}`, briefId: brief.id, ...JSON.parse(response.text || '{}') };
    } catch (e) {
        return { id: 'err', briefId: brief.id, productionPromptPack: { arrangement: '', mood: '', tempo: '', genre: '', instruments: [], keywordsInclude: [] }, pitchChecklist: { technical: [], legal: [] } };
    }
};

export const generatePitchEmail = async (opportunity: Opportunity, trackTitle: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: [{ role: 'user', parts: [{ text: `Professional pitch for "${opportunity.brief_title}" using track "${trackTitle}".` }] }] 
  });
  return response.text || "Draft currently unavailable.";
};

export const generateBattleCommentary = async (genre: string, p1: string, p2: string, status: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({ 
      model: "gemini-3-flash-preview", 
      contents: [{ role: 'user', parts: [{ text: `${p1} vs ${p2} in ${genre}. One sentence hype.` }] }] 
  });
  return response.text || "The sonic clash continues!";
};

export const generateProactiveProposal = async (context: ChatContext): Promise<StaffProposal | null> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: [{ role: 'user', parts: [{ text: `Proposal for ${context.agentRole} based on views.` }] }],
            config: { responseMimeType: "application/json" }
        });
        const data = JSON.parse(response.text || '{}');
        return { id: `prop_${Date.now()}`, agentId: context.agentRole || 'mgr', timestamp: new Date().toISOString(), ...data };
    } catch (e) { return null; }
};

export const generateBrandImage = async (prompt: string, size: string, aspectRatio: string): Promise<string | null> => {
    const ai = getAiClient();
    const isHighQuality = size === '2K' || size === '4K';
    const model = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: isHighQuality ? (size as any) : undefined } }
    });
    for (const part of response.candidates[0].content.parts) { if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`; }
    return null;
};

export const editBrandImage = async (imgBase64: string, prompt: string, size: string): Promise<string | null> => {
    const ai = getAiClient();
    const isHighQuality = size === '2K' || size === '4K';
    const model = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    const response = await ai.models.generateContent({
        model,
        contents: { parts: [{ inlineData: { mimeType: 'image/png', data: imgBase64.split(',')[1] || imgBase64 } }, { text: prompt }] },
        config: { imageConfig: { imageSize: isHighQuality ? (size as any) : undefined } }
    });
    for (const part of response.candidates[0].content.parts) { if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`; }
    return null;
};

export const analyzeImage = async (imgBase64: string): Promise<string[]> => {
    const ai = getAiClient();
    if (!ai) return ['image', 'visual content'];
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts: [{ inlineData: { mimeType: 'image/png', data: imgBase64.split(',')[1] || imgBase64 } }, { text: "List objects/themes as JSON array." }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) {
        console.error('[GeminiService] Image analysis error:', e);
        return [];
    }
};

export const generateVideoFromText = async (prompt: string, aspectRatio: string): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) {
        console.warn('[GeminiService] Video generation requires API key configuration');
        return null;
    }
    try {
        let operation = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any } });
        while (!operation.done) { await new Promise(r => setTimeout(r, 10000)); operation = await ai.operations.getVideosOperation({ operation }); }
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            const response = await fetch(`${downloadLink}&key=${AI_CONFIG.GEMINI_API_KEY}`);
            return URL.createObjectURL(await response.blob());
        }
        return null;
    } catch (e) {
        console.error('[GeminiService] Video generation error:', e);
        return null;
    }
};

export const generateVideoFromImage = async (imgBase64: string, prompt: string, aspectRatio: string): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) {
        console.warn('[GeminiService] Video generation requires API key configuration');
        return null;
    }
    try {
        let operation = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt, image: { imageBytes: imgBase64.split(',')[1] || imgBase64, mimeType: 'image/png' }, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any } });
        while (!operation.done) { await new Promise(r => setTimeout(r, 10000)); operation = await ai.operations.getVideosOperation({ operation }); }
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            const response = await fetch(`${downloadLink}&key=${AI_CONFIG.GEMINI_API_KEY}`);
            return URL.createObjectURL(await response.blob());
        }
        return null;
    } catch (e) {
        console.error('[GeminiService] Video from image error:', e);
        return null;
    }
};

export const searchVenues = async (query: string, location?: { latitude: number, longitude: number }): Promise<{ text: string, places: any[] }> => {
    const ai = getAiClient();
    if (!ai) {
        return { text: "Venue search requires AI configuration.", places: [] };
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [{ role: 'user', parts: [{ text: query }] }],
            config: { tools: [{ googleMaps: {} }], toolConfig: { retrievalConfig: { latLng: location ? { latitude: location.latitude, longitude: location.longitude } : undefined } } as any }
        });
        const places = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.maps)?.map((c: any) => ({ title: c.maps.title, uri: c.maps.uri })) || [];
        return { text: response.text || "Results found.", places };
    } catch (e) {
        console.error('[GeminiService] Venue search error:', e);
        return { text: "Search unavailable.", places: [] };
    }
};

// Internal Audio Utilities
function encode(bytes: Uint8Array) { let binary = ''; for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]); return btoa(binary); }
function decode(base64: string) { const binaryString = atob(base64); const bytes = new Uint8Array(binaryString.length); for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i); return bytes; }
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export class LiveSession {
    private ai: GoogleGenAI | null;
    private sessionPromise: Promise<any> | null = null;
    private audioContext: AudioContext | null = null;
    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();
    public onAudioData: () => void = () => {};
    public isConfigured: boolean;

    constructor() {
        this.isConfigured = isConfigured.gemini();
        this.ai = this.isConfigured ? new GoogleGenAI({ apiKey: AI_CONFIG.GEMINI_API_KEY }) : null;
    }
    async connect() {
        if (!this.ai) {
            throw new Error('Live session requires API key configuration. Please set VITE_GEMINI_API_KEY in your environment.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        this.sessionPromise = this.ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            callbacks: {
                onopen: () => {
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (e) => {
                        const inputData = e.inputBuffer.getChannelData(0);
                        const int16 = new Int16Array(inputData.length);
                        for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
                        const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
                        this.sessionPromise?.then(session => session.sendRealtimeInput({ media: pcmBlob }));
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio && this.audioContext) {
                        this.onAudioData();
                        this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), this.audioContext, 24000, 1);
                        const source = this.audioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(this.audioContext.destination);
                        source.addEventListener('ended', () => this.sources.delete(source));
                        source.start(this.nextStartTime);
                        this.nextStartTime += audioBuffer.duration;
                        this.sources.add(source);
                    }
                },
                onerror: (e) => console.error(e),
                onclose: (e) => console.log('closed')
            },
            config: { 
                responseModalities: [Modality.AUDIO], 
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }, 
                systemInstruction: 'You are an institutional music strategy advisor.' 
            }
        });
        return this.sessionPromise;
    }
    disconnect() { this.sessionPromise?.then(s => s.close()); this.audioContext?.close(); }
}
