
import React, { useState, useEffect } from 'react';
import { Shield, Globe, FileText, Clock, AlertTriangle, ExternalLink, Copy, Activity, Trash2, CheckCircle2, XCircle, Fingerprint, Download, Check, Plus, Database, Music, FileJson, RefreshCw, Coins, Zap } from 'lucide-react';
import { VoiceAsset, VoiceLicense, User } from '../types';
import { dataService } from '../services/dataService';
import { alchemyService, AlchemyNFT } from '../services/alchemyService';
import { useWallet } from '../contexts/WalletContext';

interface VoiceAssetManagerProps {
  user: User | null;
  onNavigateToRegister?: () => void;
}

export const VoiceAssetManager: React.FC<VoiceAssetManagerProps> = ({ user, onNavigateToRegister }) => {
  const [assets, setAssets] = useState<VoiceAsset[]>([]);
  const [onChainAssets, setOnChainAssets] = useState<AlchemyNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { walletAddress } = useWallet();

  // Fallback Mock for Demo Mode (Solana Default)
  const MOCK_ASSET: VoiceAsset = {
    token_id: "vAsset-SOL-8823",
    contract_address: "7Xw...9zB", 
    fingerprint_hash: "QmXyZ...9B2a",
    mint_date: new Date().toLocaleDateString(),
    transaction_hash: "5Kj...9xP",
    status: "active",
    network: "Solana"
  };

  const fetchAssets = async () => {
        setLoading(true);
        if (user) {
            const unsubscribe = dataService.subscribeToVoiceRegistrations(user.uid, (updatedAssets) => {
                if (updatedAssets.length > 0) {
                    setAssets(updatedAssets as any);
                } else if (user.plan === 'pro') {
                    setAssets([MOCK_ASSET]);
                } else {
                    setAssets([]);
                }
            });

            if (walletAddress) {
                const realAssets = await alchemyService.getNftsByOwner(walletAddress);
                setOnChainAssets(realAssets);
            }
            
            setLoading(false);
            return () => unsubscribe();
        } else {
            setAssets([MOCK_ASSET]);
            setLoading(false);
        }
  };

  useEffect(() => {
    fetchAssets();
  }, [user, walletAddress]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleRevoke = async () => {
      setShowRevokeModal(false);
      setAssets(prev => prev.map(n => n.token_id === selectedAssetId ? { ...n, status: 'revoked' } : n));
  };

  const MOCK_LICENSES: VoiceLicense[] = [
    {
      id: "lic_1",
      licensee: "Ubisoft Entertainment",
      project_name: "NPC Dialogue Pack A",
      usage_type: "Commercial",
      price: 1500,
      expiry: "2025-11-15",
      status: "active",
      terms_hash: "0x123..."
    }
  ];

  if (loading) {
      return <div className="p-8 text-center text-slate-500 flex flex-col items-center"><Activity className="w-8 h-8 animate-spin mb-4 text-cyan-500"/>Syncing Ledger Node...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Reputation / Token Tie-In Hero */}
      <div className="bg-gradient-to-r from-cyan-900/40 to-purple-900/40 border border-cyan-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border-2 border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  <Zap className="w-8 h-8 text-cyan-400" />
              </div>
              <div>
                  <h3 className="text-xl font-bold text-white">Merge Reputation Profile</h3>
                  <p className="text-slate-400 text-sm">Your secured assets contribute to your future $MERGE token allocation.</p>
              </div>
          </div>
          <div className="flex items-center gap-4 bg-black/40 px-6 py-4 rounded-xl border border-white/5">
              <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Assets</div>
                  <div className="text-2xl font-black text-white">{assets.length + onChainAssets.length}</div>
              </div>
              <div className="w-px h-10 bg-slate-800"></div>
              <div className="text-center">
                  <div className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest">Estimated $MERGE</div>
                  <div className="text-2xl font-black text-cyan-400">1,240</div>
              </div>
          </div>
      </div>

      {assets.length === 0 && onChainAssets.length === 0 ? (
          <div className="bg-slate-850 rounded-xl border border-slate-800 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700 shadow-lg shadow-purple-500/10">
                  <Fingerprint className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Verified Voice Assets</h3>
              <p className="text-slate-400 max-w-md mb-8">
                  Authenticate your vocal likeness on the Sound Merge Ledger to enable licensing and automated monitoring.
              </p>
              <button 
                onClick={onNavigateToRegister}
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                  <Plus className="w-4 h-4" /> Secure Your Voice Identity
              </button>
          </div>
      ) : (
          <div className="grid grid-cols-1 gap-6">
              {assets.map((asset, idx) => (
                  <div key={`${asset.token_id}-${idx}`} className={`rounded-2xl border overflow-hidden relative group transition-all ${asset.status === 'revoked' ? 'bg-red-950/20 border-red-900 opacity-60' : 'bg-slate-900 border-slate-800'}`}>
                      <div className="p-8 flex flex-col md:flex-row items-start gap-8 relative z-10">
                          <div className="w-32 h-32 rounded-2xl bg-slate-800 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-2xl relative overflow-hidden">
                              <Shield className="w-16 h-16 opacity-80" />
                              <div className="absolute bottom-1 text-[8px] font-black uppercase tracking-tighter opacity-40">Verified Identity</div>
                          </div>
                          
                          <div className="flex-1 w-full">
                              <div className="flex justify-between items-start mb-4">
                                  <div>
                                      <h3 className="text-2xl font-bold text-white mb-1">Vocal Identity Certificate</h3>
                                      <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                                          <span>ID: {asset.token_id}</span>
                                          <span className="text-slate-700">|</span>
                                          <span className="text-cyan-500 font-bold uppercase tracking-widest">{asset.network} Ledger</span>
                                      </div>
                                  </div>
                                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${asset.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                      {asset.status}
                                  </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                  <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                                      <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Ledger Address</span>
                                      <div className="flex items-center justify-between">
                                          <code className="text-cyan-400 text-xs truncate">{asset.contract_address}</code>
                                          <button onClick={() => handleCopy(asset.contract_address, 'contract')} className="text-slate-500 hover:text-white transition-colors">
                                              {copiedField === 'contract' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                          </button>
                                      </div>
                                  </div>
                                  <div className="bg-black/30 rounded-lg p-3 border border-white/5">
                                      <span className="text-[10px] text-slate-500 block mb-1 uppercase font-bold">Biometric Hash</span>
                                      <div className="flex items-center justify-between">
                                          <code className="text-purple-400 text-xs truncate">{asset.fingerprint_hash}</code>
                                          <button onClick={() => handleCopy(asset.fingerprint_hash, 'hash')} className="text-slate-500 hover:text-white transition-colors">
                                              {copiedField === 'hash' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                                          </button>
                                      </div>
                                  </div>
                              </div>

                              <div className="flex gap-3">
                                  <button className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700">
                                      <ExternalLink className="w-3.5 h-3.5" /> Explorer
                                  </button>
                                  <button className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 border border-slate-700">
                                      <Download className="w-3.5 h-3.5" /> Certificate
                                  </button>
                                  <button 
                                    onClick={() => { setSelectedAssetId(asset.token_id); setShowRevokeModal(true); }}
                                    className="px-4 py-2.5 rounded-lg bg-red-900/10 hover:bg-red-900/30 text-red-500 border border-red-900/20 transition-all"
                                  >
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Licensing History */}
      <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-500" /> Professional License Ledger
          </h3>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                      <tr className="text-[10px] text-slate-500 border-b border-slate-200 dark:border-slate-700 uppercase tracking-widest font-black">
                          <th className="pb-3 pl-2">Licensee</th>
                          <th className="pb-3">Agreement Type</th>
                          <th className="pb-3">Valid Until</th>
                          <th className="pb-3 text-right pr-2">Revenue</th>
                      </tr>
                  </thead>
                  <tbody className="text-sm">
                      {MOCK_LICENSES.map((lic) => (
                          <tr key={lic.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                              <td className="py-4 pl-2 font-bold text-slate-900 dark:text-white">{lic.licensee}</td>
                              <td className="py-4 text-slate-600 dark:text-slate-300 capitalize">{lic.usage_type}</td>
                              <td className="py-4 text-slate-500 font-mono text-xs">{lic.expiry}</td>
                              <td className="py-4 text-right pr-2 font-mono font-bold text-green-500">${lic.price.toLocaleString()}</td>
                          </tr>
                      ))}
                  </tbody>
              </table>
          </div>
      </div>

      {showRevokeModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl max-w-sm w-full p-8 border border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mb-6 mx-auto text-red-500 border border-red-500/20 shadow-lg shadow-red-500/10">
                    <AlertTriangle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white text-center mb-2">Revoke Rights?</h3>
                <p className="text-slate-400 text-center text-sm mb-8 leading-relaxed">
                    This will permanently invalidate this certificate on the ledger. This action is <span className="text-red-400 font-bold uppercase">irreversible</span> and will stop all automated royalty payouts.
                </p>
                <div className="flex gap-3">
                    <button onClick={() => setShowRevokeModal(false)} className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-all">Keep Asset</button>
                    <button onClick={handleRevoke} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-500 shadow-lg shadow-red-600/20 transition-all">Revoke Rights</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
