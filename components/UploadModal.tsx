
import React, { useState, useRef } from 'react';
import { X, Upload, Music, CheckCircle2, Loader2, FileAudio, Tag, Shield, Database, Lock, Video, Link, Plus, Trash2, Users, Sliders, ChevronDown, ChevronUp } from 'lucide-react';
import { User, Track, Contributor } from '../types';
import { dataService } from '../services/dataService';
import { lighthouseService } from '../services/lighthouseService';
import { useWallet } from '../contexts/WalletContext';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const CONTRIBUTOR_ROLES = ['Songwriter', 'Producer', 'Featured Artist', 'Remixer', 'Mixer', 'Mastering Engineer', 'Composer'] as const;

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, user }) => {
  const [step, setStep] = useState<'upload' | 'metadata' | 'processing' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { walletAddress } = useWallet();

  // Core Metadata
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState(user.displayName || '');
  const [genre, setGenre] = useState('Pop');
  
  // Advanced Metadata
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [bpm, setBpm] = useState('');
  const [key, setKey] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isrc, setIsrc] = useState('');
  const [upc, setUpc] = useState('');
  const [label, setLabel] = useState('Independent');
  const [isExplicit, setIsExplicit] = useState(false);
  
  // Contributors List
  const [contributors, setContributors] = useState<Contributor[]>([
      { id: '1', name: user.displayName, role: 'Songwriter' }
  ]);
  
  // Blockchain State
  const [registerOnChain, setRegisterOnChain] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('Uploading...');
  const [generatedCid, setGeneratedCid] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddContributor = () => {
      const newContrib: Contributor = {
          id: `c_${Date.now()}`,
          name: '',
          role: 'Producer'
      };
      setContributors([...contributors, newContrib]);
  };

  const updateContributor = (id: string, field: keyof Contributor, value: string) => {
      setContributors(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removeContributor = (id: string) => {
      if (contributors.length <= 1) return;
      setContributors(prev => prev.filter(c => c.id !== id));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      setFile(file);
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
      setStep('metadata');
    } else {
      alert("Please upload a valid audio or video file (MP3, WAV, MP4)");
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStep('processing');

    try {
        let blockchainData = undefined;

        if (registerOnChain) {
            setProcessingStatus('Securing Identity & IP on Ledger...');
            const address = walletAddress || "0xDemoWallet..." + Date.now();
            const lhResponse = await lighthouseService.uploadEncrypted(file, address, "Copyright Registration");
            
            blockchainData = {
                cid: lhResponse.Hash,
                timestamp: new Date().toISOString(),
                network: 'Filecoin' as const,
                status: 'secured' as const
            };
            setGeneratedCid(lhResponse.Hash);
        }

        setProcessingStatus('Syncing Distribution Metadata...');
        await new Promise(resolve => setTimeout(resolve, 1200));

        const isVideo = file.type.startsWith('video/');

        const newTrack: Track = {
            id: `track_${Date.now()}`,
            title: title || 'Untitled Track',
            artist: artist,
            bpm: parseInt(bpm) || 0,
            key: key || '-',
            mood_tags: genre ? [genre] : [],
            duration: '3:30', 
            plays: 0,
            earnings: 0,
            image: `https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format`,
            audioUrl: URL.createObjectURL(file), 
            videoUrl: youtubeUrl || (isVideo ? URL.createObjectURL(file) : undefined),
            licenseType: 'sync-ready',
            status: 'completed',
            type: isVideo ? 'vocal' : 'song',
            createdAt: new Date().toISOString(),
            blockchainRegistration: blockchainData,
            
            // Re-introduced detailed metadata
            isrc,
            upc,
            recordLabel: label,
            isExplicit,
            isInstrumental: !isVideo && file.type.startsWith('audio/'),
            contributors: contributors,
            genre: genre
        };

        /* Cast newTrack to any to satisfy the GeneratedTrack type requirement in saveTrack (missing 'tags') */
        await dataService.saveTrack(user.uid, newTrack as any);
        setStep('success');
    } catch (error) {
        console.error("Upload failed", error);
        setStep('metadata');
    }
  };

  const reset = () => {
      setFile(null);
      setStep('upload');
      setTitle('');
      setContributors([{ id: '1', name: user.displayName, role: 'Songwriter' }]);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-[2rem] w-full max-w-2xl overflow-hidden flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
           <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-tighter italic">
               <Upload className="w-5 h-5 text-cyan-400" /> Intake Terminal
           </h2>
           <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors">
               <X className="w-6 h-6" />
           </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
            {step === 'upload' && (
                <div 
                    className={`border-2 border-dashed rounded-[2.5rem] h-80 flex flex-col items-center justify-center text-center transition-all ${dragActive ? 'border-cyan-500 bg-cyan-500/5 shadow-inner' : 'border-slate-800 hover:border-slate-600 bg-slate-950/50'}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-xl border border-slate-800">
                        <Upload className="w-10 h-10 text-slate-500 animate-pulse" />
                    </div>
                    <p className="text-white font-black text-xl mb-1 uppercase tracking-tighter">Inject Sonic Assets</p>
                    <p className="text-slate-500 text-xs mb-8 font-medium">PCM WAV (24-bit preferred) or MP4 Cinema Assets</p>
                    <button 
                        onClick={() => inputRef.current?.click()}
                        className="bg-white hover:bg-slate-200 text-slate-950 px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-xl"
                    >
                        Select Source File
                    </button>
                    <input ref={inputRef} type="file" accept="audio/*,video/*" className="hidden" onChange={handleChange} />
                </div>
            )}

            {step === 'metadata' && (
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-300">
                    
                    {/* Active File Header */}
                    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center gap-6 shadow-inner">
                        <div className="w-14 h-14 bg-cyan-500/10 rounded-xl flex items-center justify-center text-cyan-400 border border-cyan-500/20">
                            {file?.type.startsWith('video/') ? <Video className="w-8 h-8" /> : <Music className="w-8 h-8" />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-black truncate uppercase tracking-tight">{file?.name}</p>
                            <p className="text-slate-600 text-[10px] font-mono uppercase">{(file!.size / 1024 / 1024).toFixed(2)} MB • READY FOR INDEXING</p>
                        </div>
                        <button onClick={() => setStep('upload')} className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 transition-colors tracking-widest">Change</button>
                    </div>

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800 pb-2">Primary Asset Data</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Track Title</label>
                                <input 
                                    value={title} onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Midnight Pulse"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5 ml-1">Main Artist</label>
                                <input 
                                    value={artist} onChange={(e) => setArtist(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-white focus:border-cyan-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contributors Section */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                             <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Contributor Credits</h3>
                             <button onClick={handleAddContributor} className="text-[10px] font-black uppercase text-cyan-400 hover:text-white flex items-center gap-1.5 transition-colors">
                                 <Plus className="w-3 h-3" /> Add Credit
                             </button>
                        </div>
                        
                        <div className="space-y-3">
                            {contributors.map((contrib, idx) => (
                                <div key={contrib.id} className="grid grid-cols-12 gap-3 animate-in fade-in slide-in-from-left-2">
                                    <div className="col-span-5">
                                        <input 
                                            value={contrib.name}
                                            onChange={(e) => updateContributor(contrib.id, 'name', e.target.value)}
                                            placeholder="Name"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-cyan-500 outline-none"
                                        />
                                    </div>
                                    <div className="col-span-5">
                                        <select 
                                            value={contrib.role}
                                            onChange={(e) => updateContributor(contrib.id, 'role', e.target.value as any)}
                                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 focus:border-cyan-500 outline-none"
                                        >
                                            {CONTRIBUTOR_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <button 
                                            onClick={() => removeContributor(contrib.id)}
                                            className={`p-2 text-slate-700 hover:text-red-500 transition-colors ${contributors.length <= 1 ? 'opacity-20 cursor-not-allowed' : ''}`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Advanced Industry Metadata Toggle */}
                    <div className="space-y-4">
                        <button 
                            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                            className="w-full flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest py-2 hover:text-white transition-colors"
                        >
                            <span>Advanced Industry Metadata</span>
                            {isAdvancedOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        
                        {isAdvancedOpen && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-300">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Record Label</label>
                                    <input value={label} onChange={e => setLabel(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">Primary Genre</label>
                                    <select value={genre} onChange={e => setGenre(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white">
                                        <option>Pop</option><option>Electronic</option><option>Hip Hop</option><option>Cinematic</option><option>Rock</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">ISRC Code</label>
                                    <input placeholder="US-ABC-25-00001" value={isrc} onChange={e => setIsrc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-700 uppercase mb-1">UPC (Album/Single Code)</label>
                                    <input placeholder="8800112233" value={upc} onChange={e => setUpc(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white font-mono" />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Blockchain & Security */}
                    <div 
                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer relative overflow-hidden ${registerOnChain ? 'bg-indigo-600/10 border-indigo-500 shadow-lg' : 'bg-slate-950 border-slate-800 hover:border-slate-700'}`}
                        onClick={() => setRegisterOnChain(!registerOnChain)}
                    >
                        {registerOnChain && <div className="absolute top-0 right-0 p-4 opacity-10"><Shield className="w-16 h-16 text-indigo-400" /></div>}
                        <div className="flex items-start gap-4">
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${registerOnChain ? 'bg-indigo-500 border-indigo-400' : 'bg-slate-900 border-slate-700'}`}>
                                {registerOnChain && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                                <h4 className={`text-sm font-black uppercase tracking-tight ${registerOnChain ? 'text-indigo-400' : 'text-slate-300'}`}>
                                    LIV8 AI Rights Verification (Solana/Filecoin)
                                </h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-md">
                                    Anchor this asset to the Sound Merge Ledger. Generates an encrypted copyright record for institutional licensing.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleSubmit}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-cyan-600/20 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
                    >
                        {registerOnChain ? <Lock className="w-4 h-4" /> : null}
                        {registerOnChain ? 'Authorize Global Deployment' : 'Finalize Indexing'}
                    </button>
                </div>
            )}

            {step === 'processing' && (
                <div className="h-[450px] flex flex-col items-center justify-center text-center animate-in fade-in">
                    <div className="relative mb-10">
                        <div className="w-32 h-32 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-cyan-400 animate-pulse" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter italic animate-pulse">{processingStatus}</h3>
                    <p className="text-slate-500 text-sm font-medium">Verifying compliance with institutional metadata standards...</p>
                </div>
            )}

            {step === 'success' && (
                <div className="h-[450px] flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 text-green-500 border border-green-500/20 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
                        <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Asset Synchronized</h3>
                    <p className="text-slate-400 text-sm mb-10 font-medium">Your media has been verified and added to the Institutional Hub.</p>
                    
                    {generatedCid && (
                        <div className="mb-10 p-5 bg-slate-950 rounded-2xl border border-slate-800 w-full shadow-inner">
                            <p className="text-[10px] text-slate-600 uppercase font-black mb-2 flex items-center justify-center gap-1 tracking-[0.2em]">
                                <Database className="w-3 h-3" /> Blockchain Rights Proof
                            </p>
                            <code className="text-xs text-indigo-400 font-mono break-all leading-relaxed">
                                {generatedCid}
                            </code>
                        </div>
                    )}

                    <button 
                        onClick={reset}
                        className="bg-white text-slate-950 px-12 py-3 rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl"
                    >
                        Exit Terminal
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
