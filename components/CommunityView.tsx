
import React from 'react';
import { Users } from 'lucide-react';

export const CommunityView: React.FC = () => {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-500" /> SoundForge Community
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Connect, collaborate, and grow with other artists.</p>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative shadow-sm">
        <iframe 
          src="https://soundforge.app.clientclub.net/" 
          className="w-full h-full border-0"
          title="SoundForge Community"
          allow="microphone; camera; fullscreen; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
};
