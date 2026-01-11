

import React, { useState, useEffect } from 'react';
import { Shield, Globe, FileText, Clock, AlertTriangle, ExternalLink, Copy, Activity, Trash2, CheckCircle2, XCircle, Fingerprint, Download, Check, Plus, Database, Music, FileJson, RefreshCw } from 'lucide-react';
/* Updated VoiceNFT to VoiceAsset to match rebranded type in types.ts */
import { VoiceAsset, VoiceLicense, User } from '../types';
import { dataService } from '../services/dataService';
import { alchemyService, AlchemyNFT } from '../services/alchemyService';
import { useWallet } from '../contexts/WalletContext';

interface VoiceNFTManagerProps {
  user: User | null;
  onNavigateToRegister?: () => void;
}

export const VoiceNFTManager: React.FC<VoiceNFTManagerProps> = ({ user, onNavigateToRegister }) => {
  /* Updated nfts state to use VoiceAsset[] */
  const [nfts, setNfts] = useState<VoiceAsset[]>([]);
  const [alchemyNfts, setAlchemyNfts] = useState<AlchemyNFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [selectedNftId, setSelectedNftId] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const { walletAddress } = useWallet();

  // Fallback Mock for Demo Mode (Solana Default)
  /* Updated MOCK_NFT to use VoiceAsset with required properties */
  const MOCK_NFT: VoiceAsset = {
    token_id: "vNFT-SOL-8823",
    voice_id: "v-8823",
    contract_address: "7Xw...9zB", // Solana Address format
    fingerprint_hash: "QmXyZ...9B2a",
    mint_date: new Date().toLocaleDateString(),
    transaction_hash: "5Kj...9xP",
    status: "active",
    network: "Solana",
    is_marketplace_enabled: false
  };

  const fetchAssets = async () => {
        setLoading(true);
        if (user) {
            // 1. Fetch Internal Registrations (Firebase)
            const unsubscribe = dataService.subscribeToVoiceRegistrations(user.uid, (updatedNfts) => {
                if (updatedNfts.length > 0) {
                    /* updatedNfts is now VoiceAsset[] via dataService update */
                    setNfts(updatedNfts);
                } else if (user.plan === 'pro') {
                    setNfts([MOCK_NFT]);
                } else {
                    setNfts([]);
                }
            });

            // 2. Fetch Real On-Chain Assets via Alchemy (if wallet connected)
            if (walletAddress) {
                const realAssets = await alchemyService.getNftsByOwner(walletAddress);
                setAlchemyNfts(realAssets);
            }
            
            setLoading(false);
            return () => unsubscribe();
        } else {
            setNfts([MOCK_NFT]);
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

  const handleDownloadCertificate = () => {
      alert("Downloading cryptographic proof of ownership...");
  };

  const handleRevoke = async () => {
      setShowRevokeModal(false);
      setNfts(prev => prev.map(n => n.token_id === selectedNftId ? { ...n, status: 'revoked' } : n));
  };

  const MOCK_LICENSES: VoiceLicense[] = [
    {
      id: "lic_1",
      license_id: "l-1",
      licensee: "Ubisoft Entertainment",
      voice_id: "v-8823",
      project_name: "NPC Dialogue Pack A",
      usage_type: "Commercial",
      price: 1500,
      expiry: "2025-11-15",
      status: "active",
      terms_hash: "0x123..."
    },
    {
      id: "lic_2",
      license_id: "l-2",
      licensee: "Indie Game Devs",
      voice_id: "v-8823",
      project_name: "Character Voices",
      usage_type: "Non-Commercial",
      price: 0,
      expiry: "2024-12-01",
      status: "expired",
      terms_hash: "0x456..."
    }
  ];

  if (loading) {
      return <div className="p-8 text-center text-slate-500 flex flex-col items-center"><Activity className="w-8 h-8 animate-spin mb-4 text-cyan-500"/>Syncing Alchemy Node...</div>;
  }

  if (nfts.length === 0 && alchemyNfts.length === 0) {
      return (
          <div className="bg-slate-850 rounded-xl border border-slate-800 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-700 shadow-lg shadow-purple-500/10">
                  <Fingerprint className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Voice IP Registered</h3>
              <p className="text-slate-400 max-w-md mb-8">
                  Protect your vocal likeness on the Solana blockchain to enable licensing and automated monitoring.
              </p>
              <button 
                onClick={onNavigateToRegister}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg shadow-purple-500/20"
              >
                  <Plus className="w-4 h-4" /> Register Voice ID
              </button>
          </div>
      );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* INTERNAL / MINTED VOICE NFTS */}
      {nfts.map((voiceNFT, idx) => {
        const isRevoked = voiceNFT.status === 'revoked';
        const isSolana = voiceNFT.network === 'Solana';
        
        return (
            <div key={`${voiceNFT.token_id}-${idx}`} className="space-y-8">
                {/* NFT Passport Card */}
                <div className={`rounded-2xl border overflow-hidden relative group transition-all ${isRevoked ? 'bg-red-950/20 border-red-900' : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800'}`}>
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
                    
                    <div className="absolute top-0 right-0 p-6 z-20">
                        {isRevoked ? (
                            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                                <XCircle className="w-4 h-4 text-red-500" />
                                <span className="text-red-500 text-xs font-bold uppercase tracking-wider">Revoked</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full backdrop-blur-sm">
                                <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-green-400 text-xs font-bold uppercase tracking-wider">On-Chain Active</span>
                            </div>
                        )}
                    </div>

                    <div className="p-8 relative z-10">
                        <div className="flex flex-col md:flex-row items-start gap-8">
                            <div className={`w-36 h-36 rounded-2xl border-2 flex items-center justify-center shadow-2xl relative overflow-hidden ${isRevoked ? 'bg-red-900/20 border-red-800 text-red-500' : 'bg-slate-800 border-purple-500/30 text-purple-400 shadow-purple-900/20'}`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/40"></div>
                                <Fingerprint className={`w-20 h-20 ${isSolana ? 'text-purple-400' : 'text-cyan-400'}`} />
                                {isSolana && <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] font-bold text-purple-300 uppercase tracking-widest">Solana</div>}
                            </div>
                            
                            <div className="flex-1 w-full">
                                <h3 className="text-3xl font-bold text-white mb-2 font-mono tracking-tight">VOICE PASSPORT <span className="text-slate-600">#{voiceNFT.token_id.slice(-4)}</span></h3>
                                <div className="flex items-center gap-3 text-slate-400 text-sm mb-6">
                                    <span className={`font-bold flex items-center gap-1 ${isSolana ? 'text-purple-400' : 'text-slate-300'}`}>
                                        <Globe className="w-3 h-3" /> {voiceNFT.network} Network
                                    </span>
                                    <span className="text-slate-600">•</span>
                                    <span>Minted {voiceNFT.mint_date || new Date().toLocaleDateString()}</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:bg-slate-800 transition-colors group/field">
                                        <span className="text-xs text-slate-500 block mb-1">Contract Address</span>
                                        <div className="flex items-center justify-between">
                                            <code className="text-cyan-400 text-sm font-mono truncate mr-2">{voiceNFT.contract_address}</code>
                                            <button onClick={() => handleCopy(voiceNFT.contract_address, 'contract')} className="text-slate-500 hover:text-white transition-colors">
                                                {copiedField === 'contract' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50 hover:bg-slate-800 transition-colors group/field">
                                        <span className="text-xs text-slate-500 block mb-1">Voiceprint Hash (IPFS)</span>
                                        <div className="flex items-center justify-between">
                                            <code className="text-purple-400 text-sm font-mono truncate mr-2">{voiceNFT.fingerprint_hash}</code>
                                            <button onClick={() => handleCopy(voiceNFT.fingerprint_hash, 'hash')} className="text-slate-500 hover:text-white transition-colors">
                                                {copiedField === 'hash' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-wrap gap-4">
                                    <a href="#" className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-2 transition-colors border border-slate-700">
                                        <ExternalLink className="w-3 h-3" /> View on SolScan
                                    </a>
                                    <button onClick={handleDownloadCertificate} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-2 transition-colors border border-slate-700">
                                        <Download className="w-3 h-3" /> Download Certificate
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {!isRevoked && (
                    <div className="bg-red-950/10 border border-red-900/30 rounded-xl p-6 animate-in fade-in">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-red-400 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5" /> Danger Zone
                                </h3>
                                <p className="text-red-400/70 text-sm mt-1">Revoking your Voice NFT will permanently burn the token on the Solana blockchain.</p>
                            </div>
                            <button onClick={() => { setSelectedNftId(voiceNFT.token_id); setShowRevokeModal(true); }} className="bg-red-900/20 text-red-400 border border-red-900/50 px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-red-900/40 transition-colors flex items-center gap-2">
                                <Trash2 className="w-4 h-4" /> Revoke Voice IP
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
      })}

      {/* REAL-TIME ALCHEMY ASSETS (Read from connected wallet) */}
      {alchemyNfts.length > 0 && (
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-green-400" /> Wallet Assets (Alchemy Mainnet)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {alchemyNfts.map((nft) => (
                      <div key={nft.id} className="bg-slate-950 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-700 transition-colors">
                          <div className="aspect-square bg-slate-800 relative">
                              {nft.content.links?.image ? (
                                  <img src={nft.content.links.image} alt={nft.content.metadata.name} className="w-full h-full object-cover" />
                              ) : (
                                  <div className="flex items-center justify-center h-full text-slate-600"><Fingerprint className="w-8 h-8"/></div>
                              )}
                          </div>
                          <div className="p-3">
                              <h4 className="text-xs font-bold text-white truncate">{nft.content.metadata.name || "Unknown NFT"}</h4>
                              <p className="text-[10px] text-slate-500 truncate">{nft.id}</p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Licensing Status */}
      {nfts.length > 0 && (
        <div className="bg-white dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-slate-500" /> Active Licenses
                </h3>
                <div className="text-sm text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    Total Revenue: <span className="text-slate-900 dark:text-white font-bold">$1,500.00</span>
                </div>
            </div>
            {/* Table Mock as before... */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-xs text-slate-500 border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider">
                            <th className="pb-3 pl-2 font-medium">Licensee</th>
                            <th className="pb-3 font-medium">Type</th>
                            <th className="pb-3 font-medium">Expiry</th>
                            <th className="pb-3 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {MOCK_LICENSES.map((lic) => (
                            <tr key={lic.id} className="border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <td className="py-4 pl-2 font-bold text-slate-900 dark:text-white">{lic.licensee}</td>
                                <td className="py-4 text-slate-600 dark:text-slate-300">{lic.usage_type}</td>
                                <td className="py-4 text-slate-500 font-mono text-xs">{lic.expiry}</td>
                                <td className="py-4">
                                    <span className={`flex items-center gap-1 text-xs font-bold ${lic.status === 'active' ? 'text-green-500' : 'text-slate-500'}`}>
                                        {lic.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />} {lic.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {showRevokeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 mx-auto text-red-600 dark:text-red-500 border border-red-500/20">
                    <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white text-center mb-2">Revoke Voice IP?</h3>
                <p className="text-slate-500 dark:text-slate-400 text-center text-sm mb-6">This will burn Token <span className="text-white font-mono bg-slate-800 px-1 rounded">#{selectedNftId?.slice(-4)}</span>.</p>
                <div className="flex gap-3">
                    <button onClick={() => setShowRevokeModal(false)} className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700">Cancel</button>
                    <button onClick={handleRevoke} className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700">Yes, Revoke</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
