import React, { useState } from 'react';
import { MapPin, Search, Navigation, ExternalLink, Loader2, Map } from 'lucide-react';
import { searchVenues } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

export const GigFinder: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ text: string; places: any[] } | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleGetLocation = () => {
    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setGettingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setGettingLocation(false);
        }
      );
    } else {
      setGettingLocation(false);
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchVenues(query, location || undefined);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" /> Gig & Venue Finder
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Find venues, open mics, and music events using real-time Google Maps data.
          </p>
        </div>
      </div>

      {/* Search Area */}
      <div className="bg-slate-850 rounded-xl border border-slate-800 p-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Jazz clubs in Austin, Open mics near me, Music stores..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={handleGetLocation}
            className={`px-4 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 transition-colors flex items-center gap-2 ${location ? 'text-cyan-400 border-cyan-500/50 bg-cyan-500/10' : ''}`}
            title="Use my location"
          >
            {gettingLocation ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Navigation className={`w-5 h-5 ${location ? 'fill-cyan-400' : ''}`} />
            )}
          </button>
          <button
            onClick={handleSearch}
            disabled={loading || !query}
            className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
        {location && (
          <div className="text-xs text-cyan-400 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Location acquired
          </div>
        )}
      </div>

      {/* Results Area */}
      {result && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* AI Response */}
          <div className="lg:col-span-2 bg-slate-850 rounded-xl border border-slate-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Map className="w-5 h-5 text-purple-400" /> AI Recommendations
            </h3>
            <div className="prose prose-invert prose-sm max-w-none text-slate-300">
              <ReactMarkdown>{result.text}</ReactMarkdown>
            </div>
          </div>

          {/* Map Links */}
          <div className="lg:col-span-1 space-y-4">
             <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-400" /> Found Locations
             </h3>
             <div className="space-y-3">
               {result.places.length > 0 ? (
                 result.places.map((place, idx) => (
                   <a
                     key={idx}
                     href={place.uri}
                     target="_blank"
                     rel="noreferrer"
                     className="block bg-slate-850 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 transition-all group"
                   >
                     <div className="flex justify-between items-start">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-cyan-500/20 flex items-center justify-center transition-colors">
                            <MapPin className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
                         </div>
                         <div>
                           <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">{place.title}</h4>
                           <span className="text-xs text-slate-500">View on Google Maps</span>
                         </div>
                       </div>
                       <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-cyan-400" />
                     </div>
                   </a>
                 ))
               ) : (
                 <div className="bg-slate-850 rounded-xl border border-slate-800 p-6 text-center text-slate-500">
                    <p className="text-sm">No specific map locations returned.</p>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}
      
      {!result && !loading && (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-slate-850/50 rounded-xl border border-dashed border-slate-800">
           <MapPin className="w-12 h-12 mb-4 opacity-20" />
           <p className="font-medium">Search for venues to start planning your tour.</p>
        </div>
      )}
    </div>
  );
};

function CheckCircle(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}