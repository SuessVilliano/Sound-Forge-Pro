import React, { useState } from 'react';
import { Opportunity } from '../types';
import { CheckCircle2, AlertTriangle, ArrowRight, Wand2 } from 'lucide-react';
import { generatePitchEmail } from '../services/geminiService';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const [pitch, setPitch] = useState<string | null>(null);
  const [loadingPitch, setLoadingPitch] = useState(false);

  const handleGeneratePitch = async () => {
    setLoadingPitch(true);
    const generated = await generatePitchEmail(opportunity, "My Best Track");
    setPitch(generated);
    setLoadingPitch(false);
  };

  const getMatchColor = (score?: number) => {
    if (!score) return 'text-slate-500';
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6 hover:border-cyan-500/50 dark:hover:border-slate-700 transition-all group shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
              opportunity.source_platform === 'internal' 
              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {opportunity.source_platform.replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-500">• {opportunity.usage_type}</span>
            <span className="text-xs text-slate-500">• Due {new Date(opportunity.deadline_datetime).toLocaleDateString()}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">{opportunity.brief_title}</h3>
        </div>
        
        {opportunity.match_score && (
          <div className="flex flex-col items-end">
            <div className={`text-2xl font-bold ${getMatchColor(opportunity.match_score)}`}>
              {opportunity.match_score}%
            </div>
            <span className="text-xs text-slate-500">Match Score</span>
          </div>
        )}
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 line-clamp-2">
        {opportunity.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {opportunity.mood_tags.map(tag => (
          <span key={tag} className="text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 mb-0.5">Estimated Payout</span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-200">
            ${opportunity.payout_min.toLocaleString()} - ${opportunity.payout_max.toLocaleString()}
          </span>
        </div>

        <div className="flex gap-3">
            {opportunity.recommended_action === 'auto_submit' ? (
                 <button className="bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-500/20 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                    <CheckCircle2 className="w-4 h-4" />
                    Auto-Submit
                </button>
            ) : (
                <button 
                  onClick={handleGeneratePitch}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    <Wand2 className="w-4 h-4" />
                    {loadingPitch ? 'Drafting...' : 'AI Pitch'}
                </button>
            )}
            
            <button className="bg-cyan-500 text-white dark:text-slate-950 hover:bg-cyan-400 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/10">
                View Brief
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
      </div>
      
      {pitch && (
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 italic">
            <div className="font-bold text-slate-500 mb-1 not-italic">AI Draft:</div>
            {pitch}
        </div>
      )}
    </div>
  );
};