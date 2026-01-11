
import React, { useState, useEffect } from 'react';
import { Shield, Globe, FileText, Clock, AlertTriangle, ExternalLink, Copy, Activity, Trash2, CheckCircle2, XCircle, Fingerprint, Download, Check, Plus, Database, Music, FileJson, RefreshCw, Coins, Zap, Loader2 } from 'lucide-react';
import { VoiceAsset, User } from '../types';
import { dataService } from '../services/dataService';
import { useWallet } from '../contexts/WalletContext';

interface VoiceAssetManagerProps {
  user: User | null;
  onNavigateToRegister?: () => void;
}

export const VoiceAssetManager: React.FC<VoiceAssetManagerProps> = ({ user, onNavigateToRegister }) => {
  const [assets, setAssets] = useState<VoiceAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  
  const { walletAddress } = useWallet();

  useEffect(() => {
    if (user) {
        const unsubscribe = dataService.subscribeToVoiceRegistrations(user.uid, (updatedAssets) => {
            setAssets(updatedAssets as any);
            setLoading(false);
        });
        return () => unsubscribe();
    }
  }, [user]);

  const handleRevoke = async (tokenId: string) => {
      setRevokingId(tokenId);
      try {
          await new Promise(r => setTimeout(r, 2000));
          await dataService.updateVoiceAssetStatus(tokenId, 'revoked');
          // Optimistic local update
          setAssets(prev => prev.map(a => a.token_id === tokenId ? { ...a, status: 'revoked' } : a));
      } catch (e) {
          alert("Revocation failed.");
      } finally {
          setRevokingId(null);
      }
  };

  if (loading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-500" /></div>;

  return (
    <div className="space-y-6">
        <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Your Secured Identity Vault</h3>
        {assets.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-[2rem] text-center">
                <p className="text-slate-500 font-medium mb-6">No verified assets found in this node.</p>
                <button onClick={onNavigateToRegister} className="bg-white text-slate-950 px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-widest">Authorize Identity</button>
            </div>
        ) : (
            <div className="grid grid-cols-1 gap-4">
                {assets.map(asset => (
                    <div key={asset.token_id} className={`bg-slate-900 border p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 transition-all ${asset.status === 'revoked' ? 'border-red-900/50 opacity-40 grayscale' : 'border-slate-800'}`}>
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl ${asset.status === 'revoked' ? 'bg-red-900/20 text-red-500' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                <Fingerprint className="w-8 h-8" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white uppercase tracking-tight">Identity Token {asset.token_id}</h4>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Biometric Hash: <span className="font-mono text-cyan-500">{asset.fingerprint_hash.slice(0, 10)}...</span></span>
                                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${asset.status === 'active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{asset.status}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors" title="Download Certificate"><Download className="w-4 h-4" /></button>
                            {asset.status === 'active' && (
                                <button 
                                    onClick={() => handleRevoke(asset.token_id)}
                                    disabled={revokingId === asset.token_id}
                                    className="px-6 py-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white border border-red-900/50 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                                >
                                    {revokingId === asset.token_id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Revoke Identity'}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};
