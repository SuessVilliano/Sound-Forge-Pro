
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Opportunity, Stats, AiStaffMember } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export interface ChatContext {
  currentView: string;
  stats: Stats;
  opportunities: Opportunity[];
  agentRole?: AiStaffMember['role'];
  studioContext?: {
      tracks: any[];
      currentTime: number;
      bpm: number;
  };
}

const cleanJson = (text: string) => {
  return text.replace(/```json\n?|```/g, '').trim();
};

export const chatWithGemini = async (message: string, history: any[], context: ChatContext): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "I'm offline right now (No API Key).";

  let systemInstruction = `You are a world-class Music Business Professional at Sound Merge.`;

  // Role-based personality injection
  if (context.agentRole === 'manager') {
      systemInstruction = `You are the Executive Artist Manager for the user at Sound Merge. 
      Tone: Professional, big-picture, strategic, supportive.
      Goals: Grow the artist's brand, coordinate other staff, and ensure financial stability.
      You focus on "Digital Asset Valuation" and high-level career milestones.`;
  } else if (context.agentRole === 'marketing') {
      systemInstruction = `You are the Head of Growth and Marketing at Sound Merge.
      Tone: High-energy, creative, data-driven, trendy.
      Goals: Increase streams, grow social following, and run effective ad campaigns.
      Speak in terms of "hooks," "viral potential," and "engagement metrics."`;
  } else if (context.agentRole === 'booking') {
      systemInstruction = `You are the Senior Booking and Touring Agent at Sound Merge.
      Tone: Pragmatic, logistical, persistent, industry-savvy.
      Goals: Secure live performances, plan tour routes, and negotiate gig fees.
      Focus on "routing," "venue capacity," and "tech riders."`;
  } else if (context.agentRole === 'distribution') {
      systemInstruction = `You are the Head of Global Distribution and Metadata at Sound Merge.
      Tone: Detail-oriented, technical, organized.
      Goals: Ensure music is delivered to all stores correctly, manage ISRC/UPC, and optimize SEO in stores.
      Focus on "DSP standards," "delivery windows," and "playlist pitching."`;
  } else if (context.agentRole === 'legal') {
      systemInstruction = `You are the Intellectual Property and Rights Officer at Sound Merge.
      Tone: Authoritative, protective, precise, logical.
      Goals: Secure VoiceShield registrations, monitor for deepfakes, and review sync license contracts.
      Focus on "ownership," "royalties," "smart contracts," and "DMCA."`;
  }

  const chat = ai.chats.create({
    model: "gemini-3-pro-preview",
    config: { 
        systemInstruction,
        thinkingConfig: { thinkingBudget: 2048 }
    }
  });

  const response = await chat.sendMessage({ message });
  return response.text || "I'm processing that update.";
};

export const generatePitchEmail = async (opportunity: Opportunity, trackTitle: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Draft: Hey, check out my track for this brief.";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Draft a professional music sync pitch email for the following opportunity: ${opportunity.brief_title}. The track name is "${trackTitle}". Keep it concise and industry-standard.`
        });
        return response.text || "Draft generated.";
    } catch (e) { return "Draft generated."; }
};

export const generateBrandImage = async (prompt: string, size: '1K' | '2K' | '4K' = '1K', aspectRatio: string = '1:1'): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) return null;
    try {
        const response = await ai.models.generateContent({
            model: size === '1K' ? 'gemini-2.5-flash-image' : 'gemini-3-pro-image-preview',
            contents: { parts: [{ text: prompt }] },
            config: {
                imageConfig: {
                    aspectRatio,
                    imageSize: size as any
                }
            }
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) { return null; }
};

export const editBrandImage = async (base64Image: string, prompt: string, size: string = '1K'): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) return null;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
                    { text: prompt }
                ]
            }
        });
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
        return null;
    } catch (e) { return null; }
};

export const generateVideoFromImage = async (base64Image: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) return null;
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            image: {
                imageBytes: base64Image.split(',')[1],
                mimeType: 'image/png'
            },
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio
            }
        });
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) return null;
        const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    } catch (e) { return null; }
};

export const generateVideoFromText = async (prompt: string, aspectRatio: '16:9' | '9:16' = '16:9'): Promise<string | null> => {
    const ai = getAiClient();
    if (!ai) return null;
    try {
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio
            }
        });
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) return null;
        const res = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const blob = await res.blob();
        return URL.createObjectURL(blob);
    } catch (e) { return null; }
};

export const analyzeImage = async (base64Image: string): Promise<string[]> => {
    const ai = getAiClient();
    if (!ai) return [];
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/png' } },
                    { text: "Analyze this image and return a JSON array of detected objects/themes." }
                ]
            },
            config: { responseMimeType: "application/json" }
        });
        return response.text ? JSON.parse(cleanJson(response.text)) : [];
    } catch (e) { return []; }
};

export const generateSongStructure = async (genre: string, theme: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Structure: Intro, Verse, Chorus, Outro";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: `Generate a suggested song structure and lyrical themes for a ${genre} track about ${theme}.`
        });
        return response.text || "Structure generated.";
    } catch (e) { return "Structure generated."; }
};

export const searchVenues = async (query: string, location?: { latitude: number, longitude: number }): Promise<{ text: string, places: any[] }> => {
    const ai = getAiClient();
    if (!ai) return { text: "No venues found.", places: [] };
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: query,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: location
                    }
                } as any
            }
        });
        const places = response.candidates?.[0]?.groundingMetadata?.groundingChunks
            ?.filter((chunk: any) => chunk.maps)
            ?.map((chunk: any) => ({
                title: chunk.maps.title,
                uri: chunk.maps.uri
            })) || [];
        return { text: response.text || "Here are some venues:", places };
    } catch (e) { return { text: "Search failed.", places: [] }; }
};

export class LiveSession {
    private ai = getAiClient();
    private session: any = null;
    public onAudioData?: (data: string) => void;

    async connect() {
        if (!this.ai) throw new Error("API Key missing");
        console.log("Sound Merge Live Session Connecting...");
        return true;
    }

    disconnect() {
        console.log("Sound Merge Live Session Disconnected.");
    }
}

export const parseRawBrief = async (text: string): Promise<Partial<Opportunity>> => {
  const ai = getAiClient();
  if (!ai) return {};
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extract into JSON: brief_title, description, usage_type, payout_min, payout_max, mood_tags, match_score. Brief: ${text}`,
      config: { responseMimeType: "application/json" }
    });
    return response.text ? JSON.parse(cleanJson(response.text)) : {};
  } catch (error) { return {}; }
};

export const enhanceMusicPrompt = async (simplePrompt: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return simplePrompt;
    const prompt = `Convert user idea into technical music generation prompt focusing on texture, instruments, style. User: "${simplePrompt}"`;
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt
        });
        return response.text?.trim() || simplePrompt;
    } catch (e) { return simplePrompt; }
};

export const generateBattleCommentary = async (genre: string, artistA: string, artistB: string, context: string): Promise<string> => {
    const ai = getAiClient();
    if (!ai) return "Crowd is wild!";
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Music battle commentator for ${genre}. A vs B. Context: ${context}. One hyped sentence.`
        });
        return response.text || "Energy is insane!";
    } catch (e) { return "Go!"; }
};
