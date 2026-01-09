
import React, { useState } from 'react';
import { Opportunity } from '../types';
import { CheckCircle2, AlertTriangle, ArrowRight, Wand2, Loader2, Globe, Send, Zap, ShieldCheck } from 'lucide-react';
import { generatePitchEmail } from '../services/geminiService';
import { songtradrService } from '../services/songtradrService';

interface OpportunityCardProps {
  opportunity: Opportunity;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({ opportunity }) => {
  const [pitch, setPitch] = useState<string | null>(null);
  const [loadingPitch, setLoadingPitch] = useState(false);
  
  // Submission State
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'connecting' | 'optimizing' | 'submitting' | 'success'>('idle');
  const [statusText, setStatusText] = useState('');

  const handleGeneratePitch = async () => {
    setLoadingPitch(true);
    try {
        const generated = await generatePitchEmail(opportunity, "My Best Track");
        setPitch(generated);
    } catch (e) {
        console.error(e);
    } finally {
        setLoadingPitch(false);
    }
  };

  const handleSubmit = async () => {
      if (opportunity.source_platform === 'songtradr') {
          try {
              setSubmissionStatus('connecting');
              setStatusText('Authenticating Node...');
              await songtradrService.connect();
              
              setSubmissionStatus('optimizing');
              setStatusText('Optimizing Rights Data...');
              await new Promise(r => setTimeout(r, 1500));

              setSubmissionStatus('submitting');
              setStatusText('Injecting Asset into Songtradr...');
              // Mock selecting the current project track
              const bestTrack = { id: 'isrc_123', title: 'Midnight City', artist: 'Neon Dreams' };
              await songtradrService.submitToBrief(opportunity.id, bestTrack);
              
              setSubmissionStatus('success');
              setStatusText('Submission Secured');
              
              window.dispatchEvent(new CustomEvent('sf-notification', { 
                  detail: { title: 'Direct Submit Success', message: `"${bestTrack.title}" is now under review by Songtradr.`, type: 'success' } 
              }));

          } catch (e) {
              console.error(e);
              setSubmissionStatus('idle'); 
              alert("Node synchronization failed. Please re-authenticate your Songtradr credentials.");
          }
      } else {
          setSubmissionStatus('submitting');
          setStatusText('Processing...');
          await new Promise(r => setTimeout(r, 1500));
          setSubmissionStatus('success');
          setStatusText('Request Forwarded');
      }
  };

  const getMatchColor = (score?: number) => {
    if (!score) return 'text-slate-500';
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const isSongtradr = opportunity.source_platform === 'songtradr';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[2rem] border p-8 hover:border-cyan-500/50 transition-all group shadow-sm relative overflow-hidden ${submissionStatus === 'success' ? 'border-green-500/30' : 'border-slate-200 dark:border-slate-800'}`}>
      
      {isSongtradr && (
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Globe className="w-32 h-32 text-pink-500" />
          </div>
      )}

      <div className="flex justify-between items-start mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1.5 border ${
              isSongtradr
              ? 'bg-pink-500/10 text-pink-500 border-pink-500/20'
              : opportunity.source_platform === 'internal' 
              ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700'
            }`}>
              {isSongtradr ? <Globe className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
              {isSongtradr ? 'Songtradr Direct' : opportunity.source_platform.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{opportunity.usage_type}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• {new Date(opportunity.deadline_datetime).toLocaleDateString()}</span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-cyan-500 transition-colors uppercase tracking-tight italic">{opportunity.brief_title}</h3>
        </div>
        
        {opportunity.match_score && (
          <div className="flex flex-col items-end">
            <div className={`text-3xl font-black ${getMatchColor(opportunity.match_score)}`}>
              {opportunity.match_score}%
            </div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Neural Match</span>
          </div>
        )}
      </div>

      <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 leading-relaxed font-medium line-clamp-3">
        {opportunity.description}
      </p>

      <div className="flex flex-wrap gap-2 mb-8">
        {opportunity.mood_tags.map(tag => (
          <span key={tag} className="text-[10px] font-black bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 px-3 py-1 rounded-lg uppercase tracking-tight">
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 gap-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Indicative Budget</span>
          <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
            ${opportunity.payout_min.toLocaleString()} – ${opportunity.payout_max.toLocaleString()}
          </span>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
            {submissionStatus === 'success' ? (
                <div className="bg-green-500/10 text-green-500 px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-green-500/20 shadow-lg shadow-green-500/5">
                    <CheckCircle2 className="w-4 h-4" />
                    {statusText}
                </div>
            ) : isSongtradr ? (
                 <button 
                    onClick={handleSubmit}
                    disabled={submissionStatus !== 'idle'}
                    className={`flex-1 md:flex-none px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-xl shadow-pink-500/20 ${
                        submissionStatus === 'idle' 
                        ? 'bg-pink-600 text-white hover:bg-pink-500 hover:scale-105 active:scale-95' 
                        : 'bg-slate-800 text-slate-400 cursor-wait border border-slate-700'
                    }`}
                >
                    {submissionStatus === 'idle' && <><Globe className="w-4 h-4" /> Songtradr Direct Submit</>}
                    {submissionStatus !== 'idle' && <><Loader2 className="w-4 h-4 animate-spin" /> {statusText}</>}
                </button>
            ) : (
                <>
                    <button 
                        onClick={handleGeneratePitch}
                        disabled={loadingPitch}
                        className="flex-1 md:flex-none px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                    >
                        {loadingPitch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                        {loadingPitch ? 'Analyzing...' : 'AI Pitch'}
                    </button>
                    <button 
                        onClick={handleSubmit}
                        className="flex-1 md:flex-none px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2"
                    >
                        <ShieldCheck className="w-4 h-4" /> Execute Request
                    </button>
                </>
            )}
        </div>
      </div>
      
      {pitch && (
        <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 italic animate-in fade-in slide-in-from-top-4 relative group/pitch">
            <div className="font-black text-slate-400 mb-3 not-italic flex justify-between uppercase tracking-widest text-[9px]">
                <span className="flex items-center gap-2"><Wand2 className="w-3 h-3 text-indigo-400" /> A&R Pitch Blueprint</span>
                <button className="text-cyan-500 hover:text-cyan-400 transition-colors" onClick={() => {navigator.clipboard.writeText(pitch); alert("Copied to Hub.");}}>Copy to Hub</button>
            </div>
            <p className="leading-relaxed">{pitch}</p>
        </div>
      )}
    </div>
  );
};
