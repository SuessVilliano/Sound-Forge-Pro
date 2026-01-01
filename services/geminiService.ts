
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
  studioContext?: {
      tracks: any[];
      currentTime: number;
      bpm: number;
  };
}

// Utility to clean Markdown JSON blocks
const cleanJson = (text: string) => {
  return text.replace(/```json\n?|```/g, '').trim();
};

export const parseRawBrief = async (text: string): Promise<Partial<Opportunity>> => {
  const ai = getAiClient();
  if (!ai) return {};

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract the following details from this music brief into a JSON object: brief_title, description, usage_type (Ad, TV, Film, Game), payout_min (number), payout_max (number), mood_tags (array of strings), match_score (number 0-100 based on 'electronic pop').
      
      Brief: ${text}`,
      config: {
        responseMimeType: "application/json"
      }
    });

    if (response.text) {
      const cleanedText = cleanJson(response.text);
      return JSON.parse(cleanedText);
    }
    return {};
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return {};
  }
};

export const enhanceMusicPrompt = async (simplePrompt: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return simplePrompt;

    const prompt = `You are a world-class Music Producer and Sound Designer. 
    Convert this simple user idea into a high-fidelity audio generation prompt for a state-of-the-art AI music engine.
    Focus on:
    1. Sonic Texture (analog warmth, crisp transients, lush pads).
    2. Specific Instruments (Roland TR-808, Moog Sub37, Fender Stratocaster).
    3. Production Style (wide stereo image, sidechained compression, heavy saturation).
    4. Composition (complex chord progressions, syncopated rhythms).
    Keep the enhanced prompt under 40 words and extremely technical for maximum fidelity.
    
    User Idea: "${simplePrompt}"
    
    Enhanced High-Fidelity Prompt:`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                temperature: 0.8,
                topP: 0.95
            }
        });
        return response.text?.trim() || simplePrompt;
    } catch (e) {
        return simplePrompt;
    }
};

export const chatWithGemini = async (message: string, history: any[], context: ChatContext): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "I'm offline right now (No API Key).";

  let systemInstruction = `You are a high-level Music Business Venture Partner for SoundForge Pro. 
  Your goal is to help the artist manage their "Digital Identity Portfolio" and maximize asset valuation.
  
  **Platform Philosophy:**
  1. **Infrastructure Play**: We are the "Stripe Connect" for audio rights.
  2. **Ownership**: The user owns 100% of their voice and sound.
  3. **Liquid Assets (x402)**: We treat music and voice as liquid on-chain assets.

  Answer questions with a focus on unit economics, rights protection, and scaling their "Asset Valuation." Be strategic.`;

  if (context.currentView === 'studio') {
      systemInstruction = `You are the SoundForge Studio Copilot—a virtual Executive Producer and Mixing Engineer.
      You are assisting the user inside the AI Studio DAW. 
      
      **Current DAW State:**
      - Tracks: ${JSON.stringify(context.studioContext?.tracks || [])}
      - BPM: ${context.studioContext?.bpm}
      - Playhead: ${context.studioContext?.currentTime}s
      
      **Your Tone:**
      - Professional, encouraging, and technically astute.
      - Speak like a pro engineer (e.g., mention "headroom," "transients," "dynamic range," "stereo field").
      
      **Capabilities:**
      - Suggest specific instruments or sounds based on existing tracks.
      - Write creative lyrics or scripts.
      - Provide mixing tips (e.g., "Add some 2k boost to the vocals to help them cut through").
      - Offer guidance on song structure.
      
      If the user wants to "generate" or "make" a sound, encourage them and mention that you will enhance their prompt for high-fidelity results.`;
  }

  const chat = ai.chats.create({
    model: "gemini-3-pro-preview",
    config: { 
        systemInstruction,
        thinkingConfig: { thinkingBudget: 2048 } // Allow for reasoned production advice
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text || "I didn't catch that.";
};

// --- BATTLE COMMENTARY ---
export const generateBattleCommentary = async (genre: string, artistA: string, artistB: string, context: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "The crowd is going wild!";

    const prompt = `You are a hyped-up music battle commentator for a live event called SoundForge Battles. 
    The Genre is ${genre}.
    Artist A: ${artistA}
    Artist B: ${artistB}
    Context: ${context} (e.g. beat drop, crowd reaction, technical skill).
    
    Give me a one-sentence, high-energy comment about the battle right now. Use slang appropriate for music producers. Keep it under 20 words.`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt
        });
        return response.text || "This battle is heating up!";
    } catch (e) {
        return "The energy in here is insane!";
    }
};

export const generatePitchEmail = async (opportunity: Opportunity, trackTitle: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "AI service unavailable.";

  const prompt = `Write a professional, concise pitch email for the following music sync opportunity. 
  The track being pitched is titled "${trackTitle}".
  Opportunity: ${opportunity.brief_title}
  Description: ${opportunity.description}
  Usage: ${opportunity.usage_type}
  
  Keep it under 100 words. Focus on how the track fits the vibe and the rights are 100% cleared via Sound Forge Vault.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || "Failed to generate pitch.";
  } catch (error) {
    return "Error generating pitch.";
  }
};

export const generateBrandImage = async (prompt: string, imageSize: string = '1K', aspectRatio: string = '1:1'): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: imageSize === '1K' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
          imageSize: imageSize as any
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image generation error:", error);
    return null;
  }
};

export const editBrandImage = async (base64Image: string, prompt: string, imageSize: string = '1K'): Promise<string | null> => {
  const ai = getAiClient();
  if (!ai) return null;

  const mimeType = base64Image.split(';')[0].split(':')[1];
  const data = base64Image.split(',')[1];

  try {
    const response = await ai.models.generateContent({
      model: imageSize === '1K' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          { inlineData: { data, mimeType } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Image editing error:", error);
    return null;
  }
};

export const analyzeImage = async (base64Image: string): Promise<string[]> => {
    const ai = getAiClient();
    if (!ai) return [];

    const mimeType = base64Image.split(';')[0].split(':')[1];
    const data = base64Image.split(',')[1];

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: "List the main objects detected in this image as a JSON array of strings." }
                ]
            },
            config: {
                responseMimeType: "application/json"
            }
        });

        if (response.text) {
            const cleanedText = cleanJson(response.text);
            return JSON.parse(cleanedText);
        }
        return [];
    } catch (error) {
        return [];
    }
};

export const generateVideoFromText = async (prompt: string, aspectRatio: string = '16:9'): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) return null;

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio as any
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) return null;

        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Video generation error:", error);
        return null;
    }
};

export const generateVideoFromImage = async (base64Image: string, prompt: string, aspectRatio: string = '16:9'): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) return null;

    const mimeType = base64Image.split(';')[0].split(':')[1];
    const data = base64Image.split(',')[1];

    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: data,
                mimeType: mimeType
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio as any
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) return null;

        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    } catch (error) {
        console.error("Video generation error:", error);
        return null;
    }
};

export const generateSongStructure = async (topic: string, genre: string, style: string): Promise<{ lyrics: string }> => {
    const ai = getAiClient();
    if (!ai) return { lyrics: "Service unavailable." };

    const prompt = `Write song lyrics for a ${genre} song about "${topic}" in a ${style} style. 
    Include structure labels like [Verse 1], [Chorus], etc.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return { lyrics: response.text || "Failed to generate lyrics." };
    } catch (error) {
        return { lyrics: "Error generating lyrics." };
    }
};

export const searchVenues = async (query: string, location?: { latitude: number; longitude: number }): Promise<{ text: string; places: any[] }> => {
    const ai = getAiClient();
    if (!ai) return { text: "Service unavailable.", places: [] };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find music venues and related places for: ${query}`,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: location ? {
                            latitude: location.latitude,
                            longitude: location.longitude
                        } : undefined
                    }
                }
            },
        });

        const places: any[] = [];
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        if (groundingChunks) {
            for (const chunk of groundingChunks) {
                if (chunk.maps) {
                    places.push({
                        title: chunk.maps.title,
                        uri: chunk.maps.uri
                    });
                }
            }
        }

        return {
            text: response.text || "Here are some venues I found.",
            places
        };
    } catch (error) {
        console.error("Maps search error:", error);
        return { text: "Error searching for venues.", places: [] };
    }
};

export class LiveSession {
    private ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    private session: any = null;
    private audioContext: AudioContext | null = null;
    private nextStartTime = 0;
    private sources = new Set<AudioBufferSourceNode>();
    public onAudioData?: () => void;

    async connect() {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        
        const sessionPromise = this.ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    const source = inputAudioContext.createMediaStreamSource(stream);
                    const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = this.createBlob(inputData);
                        sessionPromise.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    if (base64EncodedAudioString && this.audioContext) {
                        if (this.onAudioData) this.onAudioData();
                        this.nextStartTime = Math.max(this.nextStartTime, this.audioContext.currentTime);
                        const audioBuffer = await this.decodeAudioData(
                            this.decode(base64EncodedAudioString),
                            this.audioContext,
                            24000,
                            1
                        );
                        const source = this.audioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(this.audioContext.destination);
                        source.addEventListener('ended', () => {
                            this.sources.delete(source);
                        });
                        source.start(this.nextStartTime);
                        this.nextStartTime += audioBuffer.duration;
                        this.sources.add(source);
                    }

                    if (message.serverContent?.interrupted) {
                        for (const source of this.sources.values()) {
                            source.stop();
                        }
                        this.sources.clear();
                        this.nextStartTime = 0;
                    }
                },
                onerror: (e: any) => console.error("Live session error", e),
                onclose: () => console.log("Live session closed"),
            },
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
                },
                systemInstruction: 'You are a helpful music industry assistant focusing on portfolio strategy and rights management.',
            },
        });

        this.session = await sessionPromise;
    }

    disconnect() {
        if (this.session) {
            this.session.close();
            this.session = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    private createBlob(data: Float32Array): any {
        const l = data.length;
        const int16 = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            int16[i] = data[i] * 32768;
        }
        return {
            data: this.encode(new Uint8Array(int16.buffer)),
            mimeType: 'audio/pcm;rate=16000',
        };
    }

    private decode(base64: string) {
        const binaryString = atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    private encode(bytes: Uint8Array) {
        let binary = '';
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private async decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
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
}
