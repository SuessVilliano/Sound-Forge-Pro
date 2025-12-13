
import React from 'react';
import { Activity, Search, Globe } from 'lucide-react';
import { Opportunity } from '../types';
import { OpportunityCard } from './OpportunityCard';
import { PLACEMENT_PLATFORMS } from '../constants';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  isScanning: boolean;
  onScan: () => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({ opportunities, isScanning, onScan }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sync Opportunities</h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">AI-curated briefs matched to your catalog.</p>
        </div>
        <button 
          onClick={onScan}
          disabled={isScanning}
          className="bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isScanning ? (
            <>
               <Activity className="w-4 h-4 animate-spin" />
               Scanning Agents...
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              Scan for New Briefs
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {opportunities.map(op => (
          <OpportunityCard key={op.id} opportunity={op} />
        ))}
      </div>
      
      {/* Placement Platforms List */}
      <div className="mt-12">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Integrated Placement Platforms</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {PLACEMENT_PLATFORMS.map((p, i) => (
                  <a key={i} href={p.url} target="_blank" rel="noreferrer" className="bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 p-4 rounded-xl flex flex-col items-center justify-center text-center transition-colors group shadow-sm">
                      <Globe className="w-6 h-6 text-slate-400 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 mb-2" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">{p.name}</span>
                  </a>
              ))}
          </div>
      </div>
    </div>
  );
};
