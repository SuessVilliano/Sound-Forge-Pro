
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

export const chatWithGemini = async (message: string, history: any[], context: ChatContext): Promise<string> => {
  const ai = getAiClient();

  const goalText = context.user?.primaryGoal ? `The artist's current primary goal is: ${context.user.primaryGoal}.` : "";
  const distContext = context.pendingDistributions && context.pendingDistributions.length > 0 
    ? `The artist has ${context.pendingDistributions.length} pending distribution releases: ${context.pendingDistributions.map(d => `"${d.title}" (${d.status})`).join(', ')}.`
    : "The artist currently has no pending distribution submissions.";

  let systemInstruction = `
    You are a world-class Music Industry Professional and Proactive Strategist at Sound Merge.
    DO NOT wait for the user to ask for everything. If you see a gap in their strategy based on the stats provided, BRING IT UP.
    
    CRITICAL FORMATTING RULES:
    - Respond in PLAIN TEXT ONLY.
    - NEVER use markdown formatting. NO bolding (**), NO italics (*), NO headers (#), NO bullet points (- or *).
    - Keep responses VERY CONCISE and CONVERSATIONAL. Max 2-3 short sentences.
    - Act like you are sending a quick message on WhatsApp or Slack.

    STAFF AGENT CONTEXT:
    - If you are Sarah (Distribution Agent), be proactive about the user's release status. ${distContext}
    - If a user just submitted a release, mention that it's being reviewed for stores.

    Current User Milestone: ${context.stats.artistLevel} (${context.stats.xp} XP).
    Stats: Earnings $${context.stats.totalEarnings}, Streams ${context.stats.totalStreams}.
    ${goalText}

    Role: ${context.agentRole || 'Expert Advisor'}.
    Persona: Authoritative, proactive, and friendly.
  `;

  const chat = ai.chats.create({
    model: "gemini-3-pro-preview",
    config: { 
        systemInstruction,
        thinkingConfig: { thinkingBudget: 0 }
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text || "Analyzing the best path forward for your career.";
};

export const getStudioAgentSuggestions = async (styleInput: string, lyrics: string): Promise<StudioSuggestion[]> => {
  const ai = getAiClient();
  const prompt = `
    Act as a professional music production team (Beat Architect, Melody Scout, and Sound Engineer).
    The artist is currently working on a project with the following style description: "${styleInput}"
    Current Lyrics: "${lyrics}"

    Generate THREE proactive musical suggestions in JSON format.
    One from each agent (agentId: 'beat', 'melody', 'engineer').
    
    Return JSON matching:
    Array of { 
      id: string,
      agentId: 'beat' | 'melody' | 'engineer', 
      type: 'beat' | 'vocal' | 'fx',
      title: string, 
      description: string, 
      promptAddon: string 
    }
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
    const raw = response.text || '[]';
    const data = JSON.parse(raw);
    return data.map((d: any) => ({ ...d, timestamp: new Date().toISOString() }));
  } catch (e) {
    return [];
  }
};

export const parseBriefToSchema = async (rawText: string): Promise<Partial<SyncBrief>> => {
    const ai = getAiClient();
    const prompt = `
      Act as an expert Music Supervisor. 
      Normalize the following raw music sync brief text into a clean, professional JSON schema.
      Extract project title, high-level description, target media type (TV, Film, Ad, Game, Trailer, Brand, or Other), 
      budget details (min/max), deadline, required genres, moods, tempo, vocal requirements, 
      reference artists, and rights required.
      
      Raw Text: "${rawText}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { 
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  mediaType: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  budget: {
                    type: Type.OBJECT,
                    properties: {
                      min: { type: Type.NUMBER },
                      max: { type: Type.NUMBER },
                      currency: { type: Type.STRING }
                    }
                  },
                  requiredGenres: { type: Type.ARRAY, items: { type: Type.STRING } },
                  moods: { type: Type.ARRAY, items: { type: Type.STRING } },
                  tempo: { type: Type.STRING },
                  vocal: { type: Type.STRING },
                  references: { type: Type.ARRAY, items: { type: Type.STRING } },
                  deliverables: { type: Type.ARRAY, items: { type: Type.STRING } },
                  rightsRequired: {
                    type: Type.OBJECT,
                    properties: {
                      master: { type: Type.BOOLEAN },
                      publishing: { type: Type.BOOLEAN }
                    }
                  }
                }
              }
            }
        });
        return JSON.parse(response.text || '{}');
    } catch (e) {
        return { title: "Imported Brief", description: rawText };
    }
};

export const parseRawBrief = parseBriefToSchema;

export const searchAddresses = async (query: string): Promise<any[]> => {
  if (!query || query.length < 4) return [];
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the full verified business addresses matching: "${query}".`,
      config: { tools: [{ googleMaps: {} }] }
    });
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    return chunks.filter((c: any) => c.maps).map((c: any) => ({ title: c.maps.title, uri: c.maps.uri }));
  } catch (e) { return []; }
};

export const generateBriefArtifacts = async (brief: SyncBrief): Promise<BriefArtifacts> => {
    const ai = getAiClient();
    const prompt = `
      Act as a professional Sync Music Producer.
      Based on the following sync brief, generate two high-fidelity artifacts:
      1. A "Production Prompt Pack" to guide an AI or human composer in creating the perfect track. Include arrangement arc, mood, tempo, genre, and technical keywords.
      2. A "Pitch Checklist" of technical and legal requirements for a successful submission.
      
      Brief: "${brief.title} - ${brief.description}"
    `;
    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: { 
          responseMimeType: "application/json", 
          thinkingConfig: { thinkingBudget: 2048 },
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              productionPromptPack: {
                type: Type.OBJECT,
                properties: {
                  arrangement: { type: Type.STRING },
                  mood: { type: Type.STRING },
                  tempo: { type: Type.STRING },
                  genre: { type: Type.STRING },
                  instruments: { type: Type.ARRAY, items: { type: Type.STRING } },
                  keywordsInclude: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              },
              pitchChecklist: {
                type: Type.OBJECT,
                properties: {
                  technical: { type: Type.ARRAY, items: { type: Type.STRING } },
                  legal: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        }
    });
    const data = JSON.parse(response.text || '{}');
    return { id: `art_${Date.now()}`, briefId: brief.id, ...data };
};

export const generatePitchEmail = async (opportunity: Opportunity, trackTitle: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Write a professional, concise pitch email for: "${opportunity.brief_title}". Track: "${trackTitle}".`;
  const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
  return response.text || "Pitch draft unavailable.";
};

export const generateBattleCommentary = async (genre: string, p1: string, p2: string, status: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Act as a high-energy music battle commentator. Battle: ${p1} vs ${p2} in ${genre}. Status: ${status}. One sentence hype.`;
  const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
  return response.text || "The sonic clash continues!";
};

export const generateProactiveProposal = async (context: ChatContext): Promise<StaffProposal | null> => {
    const ai = getAiClient();
    const prompt = `ACT AS: ${context.agentRole || 'manager'}. Generate ONE proactive industry strategy proposal in JSON format.`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
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
        contents: { parts: [{ text: prompt }] },
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
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts: [{ inlineData: { mimeType: 'image/png', data: imgBase64.split(',')[1] || imgBase64 } }, { text: "List objects/themes as JSON array." }] },
        config: { responseMimeType: "application/json" }
    });
    try { return JSON.parse(response.text || '[]'); } catch (e) { return []; }
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
  return { text: response.text || "No results found.", places };
};

function encode(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
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
                    if (message.serverContent?.interrupted) { this.sources.forEach(s => s.stop()); this.sources.clear(); this.nextStartTime = 0; }
                },
                onerror: (e) => console.error(e),
                onclose: (e) => console.log('closed', e)
            },
            config: { responseModalities: [Modality.AUDIO], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } }, systemInstruction: 'You are a professional music industry strategist.' }
        });
        return this.sessionPromise;
    }
    disconnect() { this.sessionPromise?.then(s => s.close()); this.audioContext?.close(); }
}
