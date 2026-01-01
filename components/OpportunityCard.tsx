
import React, { useState } from 'react';
import { Opportunity } from '../types';
import { CheckCircle2, AlertTriangle, ArrowRight, Wand2, Loader2, Globe, Send } from 'lucide-react';
import { generatePitchEmail } from '../services/geminiService';
import { songtradrService } from '../services/songtradrService';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const [pitch, setPitch] = useState<string | null>(null);
  const [loadingPitch, setLoadingPitch] = useState(false);
  
  // Submission State
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'connecting' | 'submitting' | 'success'>('idle');

  const handleGeneratePitch = async () => {
    setLoadingPitch(true);
    const generated = await generatePitchEmail(opportunity, "My Best Track");
    setPitch(generated);
    setLoadingPitch(false);
  };

  const handleSubmit = async () => {
      // Logic for Songtradr integration
      if (opportunity.source_platform === 'songtradr') {
          try {
              setSubmissionStatus('connecting');
              await songtradrService.connect();
              
              setSubmissionStatus('submitting');
              // Mock selecting the best track
              const bestTrack = { id: 't_123', title: 'Midnight City', artist: 'Neon Dreams' };
              await songtradrService.submitToBrief(opportunity.id, bestTrack);
              
              setSubmissionStatus('success');
          } catch (e) {
              console.error(e);
              setSubmissionStatus('idle'); // Reset on error
              alert("Submission failed. Please try again.");
          }
      } else {
          // Default behavior for other platforms (Mock)
          setSubmissionStatus('submitting');
          await new Promise(r => setTimeout(r, 1500));
          setSubmissionStatus('success');
      }
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
            <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 ${
              opportunity.source_platform === 'songtradr'
              ? 'bg-pink-100 dark:bg-pink-500/20 text-pink-700 dark:text-pink-400'
              : opportunity.source_platform === 'internal' 
              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400' 
              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {opportunity.source_platform === 'songtradr' && <Globe className="w-3 h-3" />}
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
            {submissionStatus === 'success' ? (
                <button disabled className="bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-default">
                    <CheckCircle2 className="w-4 h-4" />
                    Submitted
                </button>
            ) : opportunity.recommended_action === 'auto_submit' || opportunity.source_platform === 'songtradr' ? (
                 <button 
                    onClick={handleSubmit}
                    disabled={submissionStatus !== 'idle'}
                    className={`bg-teal-100 dark:bg-teal-500/10 text-teal-700 dark:text-teal-400 hover:bg-teal-200 dark:hover:bg-teal-500/20 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    {submissionStatus === 'idle' && <><Send className="w-4 h-4" /> Direct Submit</>}
                    {submissionStatus === 'connecting' && <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</>}
                    {submissionStatus === 'submitting' && <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>}
                </button>
            ) : (
                <button 
                  onClick={handleGeneratePitch}
                  disabled={loadingPitch}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                >
                    {loadingPitch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
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
        <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 italic animate-in fade-in slide-in-from-top-2">
            <div className="font-bold text-slate-500 mb-1 not-italic flex justify-between">
                <span>AI Draft:</span>
                <button className="text-cyan-500 hover:underline" onClick={() => {navigator.clipboard.writeText(pitch); alert("Copied!");}}>Copy</button>
            </div>
            {pitch}
        </div>
      )}
    </div>
  );
};
