
import React, { useState } from 'react';
import { X, ShieldCheck, Zap, Music, Mic, FileText, Loader2, ExternalLink, CheckCircle2, AlertTriangle, Fingerprint, Coins, Globe, Lock } from 'lucide-react';
import { solanaService, MintType, MintMetadata } from '../services/solanaService';
import { useWallet } from '../contexts/WalletContext';
import { Track } from '../types';

interface MintNFTModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: Track | any; // Can be a track or a voice registration or a license
    type: MintType;
    onSuccess: (mintData: any) => void;
}

export const MintNFTModal: React.FC<MintNFTModalProps> = ({ isOpen, onClose, asset, type, onSuccess }) => {
    const { walletAddress, connectPhantom } = useWallet();
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
    const [statusMsg, setStatusMsg] = useState('');
    const [mintResult, setMintResult] = useState<any>(null);

    // Metadata State
    const [description, setDescription] = useState(asset.description || `Official ownership record for ${asset.title}. Registered via Sound Merge Pro.`);
    const [royalty, setRoyalty] = useState(5); // 5% default

    if (!isOpen) return null;

    const handleMint = async () => {
        if (!walletAddress) {
            await connectPhantom();
            return;
        }

        setStatus('processing');
        try {
            const metadata: MintMetadata = {
                title: asset.title,
                description: description,
                artist: asset.artist || 'Sound Merge Artist',
                image: asset.image || asset.imageUrl,
                attributes: [
                    { trait_type: 'Asset Type', value: type },
                    { trait_type: 'Creator Royalty', value: `${royalty}%` },
                    { trait_type: 'Ledger Node', value: 'Sound Merge Pro V2.5' }
                ]
            };

            const result = await solanaService.mintAsset(type, metadata, (msg) => setStatusMsg(msg));
            setMintResult(result);
            setStatus('success');
            onSuccess(result);
        } catch (e: any) {
            setStatus('error');
            setStatusMsg(e.message || "On-chain execution failed.");
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden flex flex-col shadow-2xl relative">
                
                {/* Decoration */}
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    {type === 'music' ? <Music className="w-48 h-48" /> : type === 'voice' ? <Fingerprint className="w-48 h-48" /> : <FileText className="w-48 h-48" />}
                </div>

                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/50 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                            {type === 'music' ? <Music className="w-5 h-5" /> : type === 'voice' ? <Mic className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tighter">Mint Ownership NFT</h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Solana Mainnet Ledger</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
                    {status === 'idle' && (
                        <div className="space-y-6 animate-in slide-in-from-bottom-2">
                            <div className="flex gap-6 items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                                <img src={asset.image || asset.imageUrl} className="w-20 h-20 rounded-xl object-cover shadow-lg" alt="Asset" />
                                <div>
                                    <h4 className="text-white font-black text-lg uppercase tracking-tight">{asset.title}</h4>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{type} Asset</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Asset Description</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-cyan-500 outline-none resize-none h-24 transition-all"
                                    />
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-2 ml-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Secondary Royalty</label>
                                        <span className="text-cyan-400 font-black text-xs">{royalty}%</span>
                                    </div>
                                    <input 
                                        type="range" min="0" max="15" step="0.5" value={royalty} 
                                        onChange={(e) => setRoyalty(parseFloat(e.target.value))}
                                        className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-cyan-500"
                                    />
                                    <p className="text-[9px] text-slate-600 mt-2 italic">Creator earnings on every secondary market trade.</p>
                                </div>
                            </div>

                            <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-2xl p-4 flex gap-4">
                                <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                                <p className="text-[10px] text-indigo-300 leading-relaxed">
                                    By minting this NFT, you are anchoring your ownership claim to the Solana blockchain. This record is immutable and globally verifiable for licensing and split payments.
                                </p>
                            </div>

                            <button 
                                onClick={handleMint}
                                className="w-full py-5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-cyan-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-3"
                            >
                                <Zap className="w-4 h-4 fill-white" /> {walletAddress ? 'Authorize Ledger Entry' : 'Connect Ledger to Mint'}
                            </button>
                        </div>
                    )}

                    {status === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-full border-4 border-slate-800 border-t-cyan-500 animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 text-cyan-400 animate-pulse" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tighter italic mb-2">Deploying Token...</h3>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">{statusMsg || 'Communicating with Validators'}</p>
                        </div>
                    )}

                    {status === 'success' && mintResult && (
                        <div className="text-center py-8 animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Ownership Secured</h3>
                            <p className="text-slate-400 text-sm mb-8 font-medium">Your {type} asset is now an immutable token on the Solana Ledger.</p>
                            
                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 mb-8 text-left space-y-3">
                                <div>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Mint Address</span>
                                    <code className="text-[10px] text-cyan-400 font-mono break-all">{mintResult.mintAddress}</code>
                                </div>
                                <div>
                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest block mb-1">Transaction Signature</span>
                                    <code className="text-[10px] text-indigo-400 font-mono break-all">{mintResult.signature}</code>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <a 
                                    href={mintResult.explorerUrl} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-full py-4 bg-white text-slate-950 font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
                                >
                                    View on SolScan <ExternalLink className="w-3 h-3" />
                                </a>
                                <button 
                                    onClick={onClose}
                                    className="w-full py-4 bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-700 transition-all"
                                >
                                    Return to Console
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="text-center py-12 animate-in slide-in-from-top-2">
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white uppercase mb-2">Transaction Failed</h3>
                            <p className="text-slate-400 text-sm mb-8">{statusMsg}</p>
                            <button 
                                onClick={() => setStatus('idle')}
                                className="w-full py-4 bg-slate-800 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-700 transition-all"
                            >
                                Re-Attempt Authorization
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
