
import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, DollarSign, Users, Music, TrendingUp, Globe, Play, Lock, ListMusic, ExternalLink } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { fetchArtistAnalytics, MetricStats, PlatformData, ChartmetricTrack, Demographics, PlaylistInfo, RevenueBreakdown } from '../services/chartmetricService';
import { RapidApiAgent, SpotifyStreamData, SpotifyArtistStats } from '../services/rapidApiService';
import { User } from '../types';

// Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-md min-w-[200px] z-50">
                {label && <p className="text-slate-300 font-bold mb-3 border-b border-slate-800 pb-2">{label}</p>}
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 mb-2 last:mb-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></div>
                            <span className="text-xs text-slate-400 capitalize">{entry.name}</span>
                        </div>
                        <span className="text-sm font-bold text-white font-mono">
                            {typeof entry.value === 'number' && entry.name !== 'Percentage' ? entry.value.toLocaleString() : entry.value}
                            {entry.unit || ''}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

interface AnalyticsViewProps {
  user: User;
  onUpgrade: () => void;
  artistId?: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ user, onUpgrade, artistId }) => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');
  
  // Real-time API State
  const [realSpotifyData, setRealSpotifyData] = useState<SpotifyStreamData | null>(null);
  const [realArtistData, setRealArtistData] = useState<SpotifyArtistStats | null>(null);
  const [loadingRealData, setLoadingRealData] = useState(false);

  const [data, setData] = useState<{
    dailyStats: MetricStats[];
    platforms: PlatformData[];
    topTracks: ChartmetricTrack[];
    demographics: Demographics;
    playlists: PlaylistInfo[];
    revenue: RevenueBreakdown[];
  } | null>(null);

  const [connectedSources, setConnectedSources] = useState<Record<string, boolean>>({
    'Official Ledgers': true,
    'Spotify': true,
    'Apple Music': false,
    'TikTok': true,
    'YouTube': true
  });
  
  const isPro = user.plan !== 'free';

  const loadData = async (range: string = timeRange, id?: number) => {
    setLoading(true);
    setLoadingRealData(true);
    try {
      // 1. Load Data Structure
      const result = await fetchArtistAnalytics(range, id);
      setData(result);

      // 2. Fetch REAL data
      const spotifyArtistId = '1Xyo4u8uXC1ZmMpatF05PJ';
      const spotifyTrackId = '4cOdK2wGLETKBW3PvgPWqT';

      const [trackStats, artistStats] = await Promise.all([
          RapidApiAgent.getSpotifyTrackStats(spotifyTrackId),
          RapidApiAgent.getSpotifyArtistOverview(spotifyArtistId)
      ]);

      if (trackStats) setRealSpotifyData(trackStats);
      if (artistStats) setRealArtistData(artistStats);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingRealData(false);
    }
  };

  useEffect(() => {
    loadData(timeRange, artistId);
  }, [timeRange, artistId]);

  const toggleSource = (source: string) => {
    setConnectedSources(prev => ({ ...prev, [source]: !prev[source] }));
  };

  const isSourceVisible = (platformName: string) => {
      const map: Record<string, string> = {
          'Spotify': 'Spotify',
          'TikTok': 'TikTok',
          'YouTube': 'YouTube',
          'Apple Music': 'Apple Music'
      };
      const key = map[platformName];
      return key ? connectedSources[key] : true;
  };

  if (!data && loading) {
      return (
        <div className="flex flex-col items-center justify-center h-[600px] text-slate-500">
            <RefreshCw className="w-12 h-12 mb-4 animate-spin text-cyan-500" />
            <p>Fetching institutional ledger data...</p>
        </div>
      );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-start">
         <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                Industry Signals & Insights
                <span className="text-[10px] bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 px-2 py-0.5 rounded font-bold uppercase tracking-wide">Institutional Sync</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
                {artistId 
                    ? `Viewing analytics for Global Artist Node: ${artistId}`
                    : "Track your music performance, audience engagement, and revenue across all official ledgers."
                }
            </p>
         </div>
         <div className="flex gap-3">
             <button onClick={() => loadData(timeRange, artistId)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                 <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
             </button>
             <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors">
                 <Download className="w-4 h-4" /> Export
             </button>
         </div>
      </div>

      {/* Platform Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* LISTENERS (Live Data) */}
          {isSourceVisible('Spotify') && (
          <div className="bg-slate-850 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden group animate-in fade-in zoom-in duration-300">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-16 h-16 text-cyan-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                  <Play className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Monthly Listeners</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loadingRealData ? (
                      <span className="animate-pulse">...</span>
                  ) : realArtistData ? (
                      realArtistData.monthlyListeners.toLocaleString()
                  ) : (
                      data.platforms.find(p => p.platform === 'Spotify')?.monthly_listeners?.toLocaleString()
                  )}
              </div>
              <div className="text-xs text-slate-500">Consolidated Signal</div>
              <div className="mt-2 text-xs font-bold text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Real-time
              </div>
          </div>
          )}

          {/* FOLLOWERS (Live Data) */}
          <div className="bg-slate-850 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden group animate-in fade-in zoom-in duration-300">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-16 h-16 text-pink-500" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-4 h-4 text-pink-500" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Followers</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {loadingRealData ? (
                      <span className="animate-pulse">...</span>
                  ) : realArtistData ? (
                      realArtistData.followers.toLocaleString()
                  ) : (
                      data.platforms.find(p => p.platform === 'TikTok')?.followers?.toLocaleString()
                  )}
              </div>
              <div className="text-xs text-slate-500">Cross-Platform Reach</div>
              <div className="mt-2 text-xs font-bold text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Growing
              </div>
          </div>

           {/* POPULARITY (Track Data) */}
           <div className="bg-slate-850 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden group animate-in fade-in zoom-in duration-300">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users className="w-16 h-16 text-purple-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                  <Music className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Top Track Streams</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {realSpotifyData ? realSpotifyData.playCount.toLocaleString() : "..."}
              </div>
              <div className="text-xs text-slate-500">Verified Consumption</div>
              <div className="mt-2 text-xs font-bold text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> Live
              </div>
          </div>

           <div className="bg-slate-850 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col relative overflow-hidden group animate-in fade-in zoom-in duration-300">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <DollarSign className="w-16 h-16 text-green-400" />
              </div>
              <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-bold text-slate-400 uppercase">Revenue Est.</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">${data.revenue.reduce((a, b) => a + b.amount, 0).toLocaleString()}</div>
              <div className="text-xs text-slate-500">Last 30 Days</div>
              <div className="mt-2 text-xs font-bold text-green-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> +15%
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 min-h-[400px]">
              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <div>
                     <h3 className="text-lg font-bold text-slate-900 dark:text-white">Institutional Growth</h3>
                     <p className="text-xs text-slate-500 dark:text-slate-400">Combined streams and listeners across all platform nodes</p>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      {['7d', '30d', '90d', '1y'].map(range => (
                          <button 
                            key={range}
                            onClick={() => setTimeRange(range)} 
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                              timeRange === range 
                                ? 'bg-cyan-500 text-slate-950 shadow-lg' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'
                            }`}
                          >
                              {range}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="h-80 w-full relative">
                  {loading && (
                    <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-850/50 backdrop-blur-sm flex items-center justify-center z-10">
                        <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
                    </div>
                  )}
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.dailyStats}>
                          <defs>
                              <linearGradient id="colorStreams" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                              </linearGradient>
                               <linearGradient id="colorListeners" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                              </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.4} />
                          <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} minTickGap={30} />
                          <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#22d3ee', strokeWidth: 1, strokeDasharray: '3 3' }} />
                          <Area type="monotone" dataKey="streams" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorStreams)" name="Streams" activeDot={{ r: 6, strokeWidth: 0, fill: '#06b6d4' }} />
                          <Area type="monotone" dataKey="listeners" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorListeners)" name="Listeners" activeDot={{ r: 6, strokeWidth: 0, fill: '#8b5cf6' }} />
                      </AreaChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* Connected Sources */}
          <div className="bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Official Sources</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Toggle data points for aggregate analysis.</p>
              
              <div className="space-y-3 flex-1">
                  {Object.entries(connectedSources).map(([source, isConnected]) => (
                      <div key={source} className={`flex justify-between items-center p-3 rounded-lg border transition-all cursor-pointer ${isConnected ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700' : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-80'}`} onClick={() => toggleSource(source)}>
                          <div className="flex items-center gap-3">
                              <div className={`w-2.5 h-2.5 rounded-full transition-all ${isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-400 dark:bg-slate-600'}`}></div>
                              <span className={`text-sm font-medium transition-colors ${isConnected ? 'text-slate-900 dark:text-slate-200' : 'text-slate-500'}`}>{source}</span>
                          </div>
                          <div 
                            className={`relative w-10 h-5 rounded-full transition-colors ${isConnected ? 'bg-cyan-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${isConnected ? 'left-6' : 'left-1'}`}></div>
                          </div>
                      </div>
                  ))}
                  
                  <div className="mt-4 p-3 bg-cyan-50 dark:bg-cyan-900/10 rounded-lg border border-cyan-200 dark:border-cyan-800">
                      <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">Sync Active</span>
                      </div>
                      <p className="text-[10px] text-cyan-600 dark:text-cyan-400/70">
                          Fetching real-time stats from official industry ledgers.
                      </p>
                  </div>
              </div>
          </div>
      </div>
      {/* ... Remaining revenue and tracks components with abstracted labels ... */}
    </div>
  );
};
