
import React, { useState, useMemo } from 'react';
import { Activity, Search, Globe, ArrowUpDown } from 'lucide-react';
import { Opportunity } from '../types';
import { OpportunityCard } from './OpportunityCard';
import { PLACEMENT_PLATFORMS } from '../constants';

interface OpportunitiesViewProps {
  opportunities: Opportunity[];
  isScanning: boolean;
  onScan: () => void;
}

export const OpportunitiesView: React.FC<OpportunitiesViewProps> = ({ opportunities, isScanning, onScan }) => {
  const [sortMode, setSortMode] = useState<'deadline_asc' | 'deadline_desc' | 'payout_desc' | 'match_desc'>('deadline_asc');

  const sortedOpportunities = useMemo(() => {
    return [...opportunities].sort((a, b) => {
      switch (sortMode) {
        case 'deadline_asc':
          // Earliest deadline first (Upcoming/Past due at top if any)
          return new Date(a.deadline_datetime).getTime() - new Date(b.deadline_datetime).getTime();
        case 'deadline_desc':
          // Latest deadline first
          return new Date(b.deadline_datetime).getTime() - new Date(a.deadline_datetime).getTime();
        case 'payout_desc':
          // Highest max payout first
          return b.payout_max - a.payout_max;
        case 'match_desc':
          // Highest match score first
          return (b.match_score || 0) - (a.match_score || 0);
        default:
          return 0;
      }
    });
  }, [opportunities, sortMode]);

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

      {/* Sort & Filter Toolbar */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <ArrowUpDown className="w-4 h-4" />
                  Sort By:
              </div>
              <select
                  value={sortMode}
                  onChange={(e) => setSortMode(e.target.value as any)}
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
              >
                  <option value="deadline_asc">Deadline (Soonest)</option>
                  <option value="deadline_desc">Deadline (Latest)</option>
                  <option value="payout_desc">Highest Payout</option>
                  <option value="match_desc">Best Match</option>
              </select>
          </div>
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {sortedOpportunities.length} Active Briefs
          </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sortedOpportunities.map(op => (
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
