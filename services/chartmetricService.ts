
export interface MetricStats {
  date: string;
  streams: number;
  listeners: number;
  followers: number;
}

export interface PlatformData {
  platform: 'Spotify' | 'Apple Music' | 'TikTok' | 'YouTube' | 'SoundCloud';
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

export const fetchArtistAnalytics = async (timeRange: string = '30d'): Promise<{
  dailyStats: MetricStats[];
  platforms: PlatformData[];
  topTracks: ChartmetricTrack[];
  demographics: Demographics;
}> => {
  // Simulate API latency to mimic real Chartmetric network call
  await new Promise(resolve => setTimeout(resolve, 800));

  let points = 30;
  let isYearly = false;

  switch (timeRange) {
    case '7d': 
      points = 7; 
      break;
    case '90d': 
      points = 90; 
      break;
    case '1y': 
      points = 12; 
      isYearly = true; 
      break;
    default: 
      points = 30;
  }

  // Mock history based on requested range
  const dailyStats: MetricStats[] = Array.from({ length: points }, (_, i) => {
    const date = new Date();
    if (isYearly) {
        date.setMonth(date.getMonth() - (points - 1 - i));
    } else {
        date.setDate(date.getDate() - (points - 1 - i));
    }
    
    const label = isYearly 
        ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Add some randomness based on index to simulate trends
    const trendMultiplier = 1 + (i / points) * 0.5; 
    
    return {
      date: label,
      streams: Math.floor((1200 + Math.random() * 800) * (isYearly ? 30 : 1) * trendMultiplier),
      listeners: Math.floor((400 + Math.random() * 200) * (isYearly ? 30 : 1) * trendMultiplier),
      followers: Math.floor(15000 + (i * (isYearly ? 500 : 50)))
    };
  });

  const platforms: PlatformData[] = [
    { platform: 'Spotify', followers: 12540, monthly_listeners: 45200, popularity: 42 },
    { platform: 'TikTok', followers: 89000, daily_views: 15000, engagement_rate: '8.5%' },
    { platform: 'YouTube', followers: 3200, daily_views: 1200, engagement_rate: '4.2%' },
    { platform: 'Apple Music', followers: 1500, monthly_listeners: 8900 }
  ];

  const topTracks: ChartmetricTrack[] = [
    { id: '1', title: 'Neon Horizon', image: 'https://picsum.photos/100/100?random=1', streams: 450000, releaseDate: '2024-11-15', playlists: 142 },
    { id: '2', title: 'Summer Breeze', image: 'https://picsum.photos/100/100?random=2', streams: 125000, releaseDate: '2024-08-20', playlists: 45 },
    { id: '3', title: 'Midnight Drive', image: 'https://picsum.photos/100/100?random=3', streams: 89000, releaseDate: '2025-01-10', playlists: 28 },
    { id: '4', title: 'Echoes', image: 'https://picsum.photos/100/100?random=7', streams: 54000, releaseDate: '2025-02-01', playlists: 12 },
    { id: '5', title: 'City Lights', image: 'https://picsum.photos/100/100?random=9', streams: 32000, releaseDate: '2025-03-15', playlists: 8 },
  ];

  const demographics: Demographics = {
    age: [
      { range: '13-17', percent: 15 },
      { range: '18-24', percent: 45 },
      { range: '25-34', percent: 25 },
      { range: '35-44', percent: 10 },
      { range: '45+', percent: 5 },
    ],
    gender: [
      { type: 'Male', percent: 42 },
      { type: 'Female', percent: 55 },
      { type: 'Non-binary', percent: 3 },
    ],
    locations: [
      { country: 'United States', percent: 45 },
      { country: 'United Kingdom', percent: 15 },
      { country: 'Germany', percent: 10 },
      { country: 'Brazil', percent: 8 },
      { country: 'Other', percent: 22 },
    ]
  };

  return { dailyStats, platforms, topTracks, demographics };
};
