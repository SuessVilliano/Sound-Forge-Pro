
import { format, subDays } from 'date-fns';

// --- Types ---

export interface MetricStats {
  date: string;
  streams: number;
  listeners: number;
  followers: number;
}

export interface PlatformData {
  platform: 'Spotify' | 'Apple Music' | 'TikTok' | 'YouTube' | 'SoundCloud' | 'Instagram';
  followers: number;
  monthly_listeners?: number;
  popularity?: number;
  daily_views?: number;
  engagement_rate?: string;
  icon?: string;
}

export interface ChartmetricTrack {
  id: string;
  title: string;
  image: string;
  streams: number;
  releaseDate: string;
  chart_position?: number;
  playlists: number;
}

export interface Demographics {
  age: { range: string; percent: number }[];
  gender: { type: string; percent: number }[];
  locations: { country: string; percent: number }[];
}

export interface PlaylistInfo {
  id: string;
  name: string;
  platform: 'Spotify' | 'Apple Music' | 'Deezer';
  followers: number;
  type: 'Editorial' | 'Algorithmic' | 'User';
  image: string;
  addedAt: string;
}

export interface RevenueBreakdown {
  source: string;
  amount: number;
  color: string;
}

export interface ChartmetricArtist {
  id: number;
  name: string;
  image_url: string;
  is_verified: boolean;
  code2?: string;
  rank?: number;
}

export interface ChartmetricTrackResult {
  id: number;
  name: string;
  artist_names: string[];
  image_url: string;
  code2?: string;
}

// --- API Configuration ---

const REFRESH_TOKEN = process.env.CHARTMETRIC_REFRESH_TOKEN; 
const BASE_URL = "https://api.chartmetric.com/api";

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const getAccessToken = async (): Promise<string | null> => {
  if (!REFRESH_TOKEN) return null;
  if (cachedToken && Date.now() < tokenExpiry - 60000) return cachedToken;

  try {
    const response = await fetch(`${BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshtoken: REFRESH_TOKEN })
    });
    if (!response.ok) return null;
    const data = await response.json();
    cachedToken = data.token;
    tokenExpiry = Date.now() + (data.expires_in * 1000);
    return cachedToken;
  } catch (error) {
    return null;
  }
};

const cmFetch = async (endpoint: string) => {
    const token = await getAccessToken();
    if (!token) return null;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return null;
    return response.json();
};

export const searchArtists = async (query: string): Promise<ChartmetricArtist[]> => {
    if (!query || query.length < 2) return [];

    // Fallback known artists to make the app feel alive even without keys
    const POPULAR_ARTISTS: ChartmetricArtist[] = [
        { id: 112, name: 'The Weeknd', image_url: 'https://images.unsplash.com/photo-1629783509182-68c8c190e952?auto=format&fit=crop&w=100&q=80', is_verified: true, rank: 1 },
        { id: 245, name: 'Taylor Swift', image_url: 'https://images.unsplash.com/photo-1544717297-fa15c3902727?auto=format&fit=crop&w=100&q=80', is_verified: true, rank: 2 },
        { id: 501, name: 'Drake', image_url: 'https://images.unsplash.com/photo-1514525253440-b393452e8d26?auto=format&fit=crop&w=100&q=80', is_verified: true, rank: 5 }
    ];

    try {
        // Increased limit from 5 to 15 for better scrolling coverage
        const response = await cmFetch(`/search?q=${encodeURIComponent(query)}&type=artists&limit=15`);
        if (response?.obj?.artists) {
            return response.obj.artists.map((a: any) => ({
                id: a.id,
                name: a.name,
                image_url: a.image_url || 'https://picsum.photos/100',
                is_verified: a.is_verified,
                code2: a.code2
            }));
        }
    } catch (e) {}

    // Smart Local Fallback
    return POPULAR_ARTISTS.filter(a => a.name.toLowerCase().includes(query.toLowerCase()));
};

export const searchTracks = async (query: string): Promise<ChartmetricTrackResult[]> => {
    if (!query || query.length < 2) return [];
    try {
        const response = await cmFetch(`/search?q=${encodeURIComponent(query)}&type=tracks&limit=10`);
        if (response?.obj?.tracks) {
            return response.obj.tracks.map((t: any) => ({
                id: t.id,
                name: t.name,
                artist_names: t.artist_names || ['Unknown Artist'],
                image_url: t.image_url || 'https://picsum.photos/100',
                code2: t.isrc
            }));
        }
    } catch (e) {}
    return [];
};

export const fetchArtistAnalytics = async (timeRange: string = '30d', specificArtistId?: number): Promise<any> => {
    const days = timeRange === '7d' ? 7 : timeRange === '90d' ? 90 : 30;
    const stats: MetricStats[] = Array.from({ length: days }).map((_, i) => ({
        date: format(subDays(new Date(), days - i), 'MMM d'),
        streams: Math.floor(5000 + Math.random() * 10000),
        listeners: Math.floor(2000 + Math.random() * 5000),
        followers: Math.floor(1000 + Math.random() * 200)
    }));

    return {
        dailyStats: stats,
        platforms: [
            { platform: 'Spotify', followers: 120000, monthly_listeners: 450000 },
            { platform: 'TikTok', followers: 89000, engagement_rate: '4.5%' }
        ],
        topTracks: [
            { id: 't1', title: 'Starboy', image: 'https://picsum.photos/100/100?random=1', streams: 1200000, releaseDate: '2023', playlists: 45 }
        ],
        demographics: { age: [], gender: [], locations: [] },
        playlists: [],
        revenue: [{ source: 'Streaming', amount: 3450, color: '#06b6d4' }]
    };
};
