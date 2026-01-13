
import { GoogleGenAI, Type, Modality, LiveServerMessage } from "@google/genai";
import { Opportunity, Stats, AiStaffMember, User, StaffProposal, SyncBrief, BriefArtifacts, StudioSuggestion, DistributionSubmission } from "../types";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export interface ChatContext {
  currentView: string;
  stats: Stats;
  opportunities: Opportunity[];
  user?: User;
  agentRole?: AiStaffMember['role'] | 'Team Hub';
  pendingDistributions?: DistributionSubmission[];
}

/**
 * SOUND MERGE CORE INTELLIGENCE ENGINE
 * Acting as a world-class institutional music strategy advisor.
 */
export const chatWithGemini = async (message: string, history: any[], context: ChatContext): Promise<string> => {
  const ai = getAiClient();

  const goalText = context.user?.primaryGoal ? `The artist's current primary goal is: ${context.user.primaryGoal}.` : "";
  const distContext = context.pendingDistributions && context.pendingDistributions.length > 0 
    ? `The artist has ${context.pendingDistributions.length} pending distribution releases.`
    : "";

  let systemInstruction = `
    You are an elite Music Industry Professional and Senior Strategist at Sound Merge.
    Your tone is authoritative, highly competent, and conversational.
    
    PRODUCTION SUITE KNOWLEDGE (KLING AI):
    - Recommend "Cinema Forge" for high-end music video production.
    - Features: Lip-Sync (vocals-to-avatar), Cinema Extension (scaling clips), Motion Control (pan/zoom/tilt vectors).
    
    GUIDELINES:
    - Respond in PLAIN TEXT ONLY. No markdown, no bolding, no headers.
    - Be punchy and concise. Max 2-3 sentences.
    - Proactively suggest next steps based on the user's view: ${context.currentView}.
    
    Current Stats: ${context.stats.totalStreams} streams, ${context.stats.totalEarnings} earnings.
    Role: ${context.agentRole || 'Consultant'}.
    ${goalText}
    ${distContext}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: message,
      config: { 
          systemInstruction,
          thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text || "Synchronizing with industry signals...";
  } catch (e) {
    return "The Sound Merge brain is currently recalculating. Please try again in a moment.";
  }
};

export const getStudioAgentSuggestions = async (styleInput: string, lyrics: string): Promise<StudioSuggestion[]> => {
  const ai = getAiClient();
  const prompt = `
    Act as a professional production team. Generate 3 proactive musical suggestions in JSON format.
    Style: "${styleInput}"
    Lyrics: "${lyrics}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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
    return [];
  }
};

export const parseBriefToSchema = async (rawText: string): Promise<Partial<SyncBrief>> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Normalize this sync brief into JSON: "${rawText}"`,
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
      contents: `Business addresses for: "${query}".`,
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
            contents: `Blueprint for: "${brief.title} - ${brief.description}"`,
            config: { responseMimeType: "application/json" }
        });
        return { id: `art_${Date.now()}`, briefId: brief.id, ...JSON.parse(response.text || '{}') };
    } catch (e) {
        return { id: 'err', briefId: brief.id, productionPromptPack: { arrangement: '', mood: '', tempo: '', genre: '', instruments: [], keywordsInclude: [] }, pitchChecklist: { technical: [], legal: [] } };
    }
};

export const generatePitchEmail = async (opportunity: Opportunity, trackTitle: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: `Professional pitch for "${opportunity.brief_title}" using track "${trackTitle}".` });
  return response.text || "Draft currently unavailable.";
};

export const generateBattleCommentary = async (genre: string, p1: string, p2: string, status: string): Promise<string> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: `${p1} vs ${p2} in ${genre}. One sentence hype.` });
  return response.text || "The sonic clash continues!";
};

export const generateProactiveProposal = async (context: ChatContext): Promise<StaffProposal | null> => {
    const ai = getAiClient();
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Proposal for ${context.agentRole} based on views.`,
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
        contents: prompt,
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
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: { parts: [{ inlineData: { mimeType: 'image/png', data: imgBase64.split(',')[1] || imgBase64 } }, { text: "List objects/themes as JSON array." }] },
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text || '[]');
    } catch (e) { return []; }
};

export const generateVideoFromText = async (prompt: string, aspectRatio: string): Promise<string | null> => {
    const ai = getAiClient();
    let operation = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any } });
    while (!operation.done) { await new Promise(r => setTimeout(r, 10000)); operation = await ai.operations.getVideosOperation({ operation }); }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        return URL.createObjectURL(await response.blob());
    }
    return null;
};

export const generateVideoFromImage = async (imgBase64: string, prompt: string, aspectRatio: string): Promise<string | null> => {
    const ai = getAiClient();
    let operation = await ai.models.generateVideos({ model: 'veo-3.1-fast-generate-preview', prompt, image: { imageBytes: imgBase64.split(',')[1] || imgBase64, mimeType: 'image/png' }, config: { numberOfVideos: 1, resolution: '720p', aspectRatio: aspectRatio as any } });
    while (!operation.done) { await new Promise(r => setTimeout(r, 10000)); operation = await ai.operations.getVideosOperation({ operation }); }
    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        return URL.createObjectURL(await response.blob());
    }
    return null;
};

export const searchVenues = async (query: string, location?: { latitude: number, longitude: number }): Promise<{ text: string, places: any[] }> => {
  const ai = getAiClient();
  const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      config: { tools: [{ googleMaps: {} }], toolConfig: { retrievalConfig: { latLng: location ? { latitude: location.latitude, longitude: location.longitude } : undefined } } as any }
  });
  const places = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.filter((c: any) => c.maps)?.map((c: any) => ({ title: c.maps.title, uri: c.maps.uri })) || [];
  return { text: response.text || "Mapping results localized.", places };
};

// Internal Audio Utilities (Live API)
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
    private ai: GoogleGenAI;
    private sessionPromise: Promise<any> | null = null;
    private audioContext: AudioContext | null = null;
    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();
    public onAudioData: () => void = () => {};
    constructor() { this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY }); }
    async connect() {
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
