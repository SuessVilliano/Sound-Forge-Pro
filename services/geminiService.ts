
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

// Utility to clean Markdown JSON blocks
const cleanJson = (text: string) => {
  return text.replace(/```json\n?|```/g, '').trim();
};

export const parseRawBrief = async (text: string): Promise<Partial<Opportunity>> => {
  const ai = getAiClient();
  if (!ai) return {};

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
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

export const generatePitchEmail = async (opportunity: Opportunity, artistContext: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing";

  const prompt = `Write a short, professional pitch email to a music supervisor for this opportunity:
  Title: ${opportunity.brief_title}
  Description: ${opportunity.description}
  
  My Artist Context: ${artistContext}
  
  Keep it under 150 words. Focus on why my track fits the mood.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text || "";
};

export const generateCustomPitch = async (brief: string, trackDetails: string): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Error: API Key missing";

  const prompt = `Act as a professional sync licensing agent. Write a pitch email to a music supervisor based on the following:

  OPPORTUNITY BRIEF:
  "${brief}"

  TRACK DETAILS:
  "${trackDetails}"

  The email should be concise (max 150 words), professional, and persuasive. Highlight the specific sonic elements that match the brief. Do not include subject line placeholders unless necessary.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt
  });

  return response.text || "";
};

export const generateSongStructure = async (topic: string, genre: string, vibe: string) => {
    const ai = getAiClient();
    if (!ai) return { lyrics: "Error", structure: "" };

    const prompt = `Write lyrics for a ${genre} song about "${topic}". Vibe: ${vibe}. Include structure markers [Verse], [Chorus].`;
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt
    });

    return { lyrics: response.text || "", structure: "Standard" };
};

export const chatWithGemini = async (message: string, history: any[], context: ChatContext): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "I'm offline right now (No API Key).";

  const systemInstruction = `You are a music industry manager AI agent for SoundForge Pro.
  
  **App Context & Recent Updates (v2.5):**
  1. **Real-Time Analytics**: We now integrate with **RapidAPI** (Spotify Scraper) to fetch live **Monthly Listeners**, **Followers**, and **Stream Counts** for artists in the Analytics view. Data is live, not mocked.
  2. **A&R Discovery**: The A&R Dashboard now pulls the real-time **Billboard Hot 100** chart via RapidAPI to show trending tracks.
  3. **Music Catalog**: Users can now 'Favorite' (Heart) tracks to save them to a personal list.
  4. **Battles Arena**: New feature. Artists compete in AI vs Human music battles.
  5. **Current Stats**: Earnings $${context.stats.totalEarnings}, Streams ${context.stats.totalStreams}.
  6. **Current View**: The user is currently looking at: ${context.currentView}.

  Answer the user's questions about their career, the app features, or the music industry. Be concise, encouraging, and emphasize the new real-time data capabilities when relevant.`;

  // Convert history to Gemini format if needed, here we simplify
  const chat = ai.chats.create({
    model: "gemini-2.5-flash",
    config: { systemInstruction }
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
            model: "gemini-2.5-flash",
            contents: prompt
        });
        return response.text || "This battle is heating up!";
    } catch (e) {
        return "The energy in here is insane!";
    }
};

// --- VISUAL GENERATION ---

export const generateBrandImage = async (prompt: string, size: string, ratio: string): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) return null;

    // Map size to supported '1K' or '2K' if needed, though gemini-3-pro-image-preview supports more
    // Map ratio to "1:1", "16:9", etc.
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image', // Defaulting to standard for speed
            contents: {
                parts: [{ text: prompt }]
            },
            config: {
                imageConfig: {
                    aspectRatio: ratio as any || "1:1",
                }
            }
        });

        // Find image part
        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const editBrandImage = async (image: string, prompt: string, size: string): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) return null;

    try {
        // Strip header if present
        const base64Data = image.split(',')[1];
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/png', data: base64Data } },
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
    } catch (e) {
        console.error(e);
        return null;
    }
};

export const generateVideoFromImage = async (image: string, prompt: string, ratio: string): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) return null;

    try {
        const base64Data = image.split(',')[1];
        
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            image: {
                imageBytes: base64Data,
                mimeType: 'image/png'
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: ratio as any || '16:9'
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({operation: operation});
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (downloadLink) {
            // In a real app, you would fetch this with the API key attached if required by the SDK docs,
            // or return the URI. The provided SDK guidelines say "fetch(`${downloadLink}&key=${process.env.API_KEY}`)"
            return `${downloadLink}&key=${process.env.API_KEY}`;
        }
        return null;

    } catch (e) {
        console.error(e);
        return null;
    }
};

export const analyzeImage = async (image: string): Promise<string[]> => {
    const ai = getAiClient();
    if (!ai) return [];

    const base64Data = image.split(',')[1];
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: base64Data } },
                { text: "List the 5 main objects or themes in this image as a JSON array of strings." }
            ]
        },
        config: { responseMimeType: "application/json" }
    });

    try {
        const cleaned = cleanJson(response.text || "[]");
        return JSON.parse(cleaned);
    } catch {
        return [];
    }
};

export const searchVenues = async (query: string, location?: {latitude: number, longitude: number}) => {
    const ai = getAiClient();
    if (!ai) return { text: "API Key missing", places: [] };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find music venues for: ${query}`,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: location ? {
                retrievalConfig: {
                    latLng: {
                        latitude: location.latitude,
                        longitude: location.longitude
                    }
                }
            } : undefined
        }
    });

    const places = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter((c: any) => c.maps)
        .map((c: any) => ({
            title: c.maps.title,
            uri: c.maps.uri
        })) || [];

    return {
        text: response.text || "No results found.",
        places
    };
};

// --- LIVE API ---

export class LiveSession {
    private client: GoogleGenAI | null;
    private session: any;
    public onAudioData: ((base64: string) => void) | null = null;

    constructor() {
        this.client = getAiClient();
    }

    async connect() {
        if (!this.client) throw new Error("No API Client");
        
        // Mock connection for UI demo if real WebSocket fails or restricted
        // In a real implementation, use ai.live.connect() as per SDK
        console.log("Live Session Connected (Mock)");
    }

    disconnect() {
        // if (this.session) this.session.close();
        console.log("Live Session Disconnected");
    }

    sendAudio(blob: Blob) {
        // this.session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64 } });
    }
}