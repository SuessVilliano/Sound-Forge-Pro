import React from 'react';
import { Mic, Search } from 'lucide-react';

export const VoiceMarketplace: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Mic className="w-8 h-8" /> Voice Avatar Marketplace
        </h1>
        <p className="text-slate-400 text-sm mt-1">Rent professional AI voice avatars for your projects</p>
      </div>

      <div className="flex gap-4">
          <div className="flex bg-slate-800 rounded-full p-1 border border-slate-700">
              <button className="px-6 py-2 rounded-full bg-white text-slate-950 font-bold text-sm">Browse Marketplace</button>
              <button className="px-6 py-2 rounded-full text-slate-400 font-medium text-sm hover:text-white">My Licenses</button>
          </div>
      </div>

      <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search voices by name, description, or tags..." 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500"
          />
      </div>

      <div className="h-96 bg-gradient-to-b from-slate-800/50 to-slate-900 rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-500">
          <Mic className="w-16 h-16 mb-4 opacity-20" />
          <p className="text-lg">No voice avatars available yet. Check back soon!</p>
      </div>
    </div>
  );
};