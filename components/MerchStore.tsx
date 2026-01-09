
import React, { useState } from 'react';
import { ShoppingBag, Plus, DollarSign, Image as ImageIcon, QrCode, X, CheckCircle2, Package, Tag, Wallet, Gem, Disc, Music2, Cpu, FileText, Loader2, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { Product } from '../types';
import { affiliateService } from '../services/affiliateService';
import { authService } from '../services/authService';
import { solanaService } from '../services/solanaService';

interface MerchStoreProps {
  userDisplayName?: string;
}

const MOCK_PRODUCTS: Product[] = [
    { 
        id: 'p1', 
        title: 'Genesis: The Merge Era', 
        description: 'Exclusive Sound Merge Asset Release. Includes studio stems, commercial usage rights, and a 5% streaming royalty share secured on-chain.', 
        price: 0.5, 
        currency: 'SOL', 
        image: 'https://picsum.photos/400/400?random=51', 
        type: 'asset_release', 
        stock: 100,
        assetAttributes: {
            royaltyShare: "5%",
            includesVoiceModel: true,
            includesStems: true,
            editionSize: "100"
        }
    },
    { 
        id: 'p2', 
        title: 'Collector Vinyl Pressing', 
        description: 'Signed physical heavyweight vinyl. Comes with a digital ownership certificate for the Sound Merge Ledger.', 
        price: 35.00, 
        currency: 'USD', 
        image: 'https://picsum.photos/400/400?random=50', 
        type: 'physical', 
        stock: 50 
    },
];

export const MerchStore: React.FC<MerchStoreProps> = ({ userDisplayName }) => {
  const [activeTab, setActiveTab] = useState<'drops' | 'physical' | 'manage'>('drops');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [showCheckout, setShowCheckout] = useState<Product | null>(null);
  
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'connecting' | 'minting' | 'success' | 'error'>('pending');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [mintedAddress, setMintedAddress] = useState<string>('');
  
  const initPurchase = (product: Product) => {
      setShowCheckout(product);
      setPaymentStatus('pending');
      setStatusMessage('');
  };

  const handleMintProcess = async () => {
      if (!showCheckout) return;

      try {
          setPaymentStatus('connecting');
          setStatusMessage('Syncing with Sound Merge Ledger...');
          
          const walletAddr = await solanaService.connectWallet();
          if (!walletAddr) throw new Error("Wallet connection required.");

          setPaymentStatus('minting');
          setStatusMessage('Authenticating Asset Rights...');
          
          // Fix: replaced non-existent mintMusicNFT with mintAsset and provided required metadata
          const result = await solanaService.mintAsset(
              'music',
              { 
                  title: showCheckout.title,
                  artist: userDisplayName || 'Sound Merge Artist',
                  description: showCheckout.description,
                  image: showCheckout.image,
                  attributes: [
                      { trait_type: 'Collection', value: 'Merch Store' },
                      { trait_type: 'Asset Type', value: showCheckout.type }
                  ]
              },
              (status) => setStatusMessage(status)
          );

          setMintedAddress(result.mintAddress);
          setPaymentStatus('success');
          
          const user = authService.getCurrentUser();
          if (user) {
              await affiliateService.trackSale(user, showCheckout.price, result.mintAddress);
          }

      } catch (e: any) {
          console.error(e);
          setPaymentStatus('error');
          setStatusMessage(e.message || "Authentication failed");
      }
  };

  const filterProducts = (tab: string) => {
      if (tab === 'drops') return products.filter(p => p.type === 'asset_release' || p.type === 'digital');
      if (tab === 'physical') return products.filter(p => p.type === 'physical');
      return products;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-cyan-500" /> 
                  {activeTab === 'manage' ? 'Rights Inventory' : 'Asset Releases'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                  {activeTab === 'drops' ? 'Secured digital assets and rights certificates.' : 'Physical merch and exclusive pressings.'}
              </p>
          </div>
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
              <button 
                  onClick={() => setActiveTab('drops')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'drops' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                  <Gem className="w-3 h-3" /> Ledger Drops
              </button>
              <button 
                  onClick={() => setActiveTab('physical')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'physical' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                  Physical
              </button>
          </div>
      </div>

      {(activeTab === 'drops' || activeTab === 'physical') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
              {filterProducts(activeTab).map(product => (
                  <div key={product.id} className={`bg-white dark:bg-slate-850 border rounded-2xl overflow-hidden shadow-sm group transition-all relative ${product.type === 'asset_release' ? 'border-cyan-500/30 hover:border-cyan-500/60' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'}`}>
                      {product.type === 'asset_release' && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/5 via-transparent to-blue-500/5 pointer-events-none"></div>
                      )}

                      <div className="h-56 overflow-hidden relative">
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 right-3">
                              <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase backdrop-blur-md border ${product.type === 'asset_release' ? 'bg-cyan-600/90 text-white border-white/20' : 'bg-black/60 text-white border-white/10'}`}>
                                  {product.type === 'asset_release' ? 'Rights Certificate' : 'Physical'}
                              </span>
                          </div>
                      </div>
                      
                      <div className="p-5 relative z-10">
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{product.title}</h3>
                          <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>
                          
                          {product.type === 'asset_release' && product.assetAttributes && (
                              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                                  <span className="text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold uppercase tracking-tighter">
                                      <Zap className="w-2.5 h-2.5" /> +100 Rep Score
                                  </span>
                                  {product.assetAttributes.includesVoiceModel && (
                                      <span className="text-[9px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold uppercase tracking-tighter">
                                          <ShieldCheck className="w-2.5 h-2.5" /> Voice Rights
                                      </span>
                                  )}
                              </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/50">
                              <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                                  {product.currency === 'SOL' ? '◎' : '$'}{product.price}
                              </span>
                              <button 
                                onClick={() => initPurchase(product)}
                                className={`px-4 py-2 rounded-full font-bold text-xs transition-all flex items-center gap-2 shadow-lg ${product.type === 'asset_release' ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
                              >
                                  {product.type === 'asset_release' ? 'Authenticate' : 'Purchase'} <Wallet className="w-3.5 h-3.5" />
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Rebranded Checkout Terminal */}
      {showCheckout && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative">
                  <button onClick={() => setShowCheckout(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">
                      <X className="w-6 h-6" />
                  </button>
                  
                  <div className="p-8 flex flex-col items-center text-center">
                      <div className="mb-6 relative">
                          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center border-2 border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                              <ShieldCheck className="w-10 h-10 text-cyan-400" />
                          </div>
                          {(paymentStatus === 'minting' || paymentStatus === 'connecting') && (
                              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-cyan-400 animate-spin"></div>
                          )}
                      </div>
                      
                      <h3 className="text-2xl font-bold text-white mb-2">
                          {paymentStatus === 'success' ? 'Authenticated!' : 'Secure Asset Record'}
                      </h3>
                      
                      {paymentStatus === 'success' ? (
                          <div className="space-y-4">
                              <div className="bg-green-500/20 text-green-400 p-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2">
                                  <CheckCircle2 className="w-5 h-5" /> Ownership Verified
                              </div>
                              <p className="text-slate-400 text-xs px-4">
                                  Your rights have been recorded on the Sound Merge Ledger. Your Reputation Score has increased by <span className="text-cyan-400 font-bold">+100</span>.
                              </p>
                              <a href={`https://solscan.io/token/${mintedAddress}?cluster=devnet`} target="_blank" className="text-xs text-cyan-400 hover:underline flex items-center justify-center gap-1 font-bold">
                                  View Rights Entry <ExternalLink className="w-3 h-3" />
                              </a>
                          </div>
                      ) : (
                          <div className="mb-6">
                              <p className="text-slate-400 text-sm max-w-[200px] mx-auto">
                                  {paymentStatus === 'pending' && `Authorize rights certification for "${showCheckout.title}" for ◎${showCheckout.price}.`}
                                  {paymentStatus !== 'pending' && statusMessage}
                              </p>
                          </div>
                      )}
                      
                      {paymentStatus === 'error' && (
                          <div className="mb-4 bg-red-500/10 text-red-400 text-xs p-3 rounded-xl border border-red-500/20">
                              {statusMessage}
                          </div>
                      )}

                      {paymentStatus === 'pending' && (
                          <div className="flex flex-col w-full gap-4">
                              <button 
                                onClick={handleMintProcess}
                                className="w-full flex items-center justify-center gap-2 text-slate-950 bg-cyan-500 hover:bg-cyan-400 py-4 rounded-2xl font-black transition-all shadow-lg shadow-cyan-500/20"
                              >
                                  <ShieldCheck className="w-5 h-5" /> Secure Rights Record
                              </button>
                              
                              <div className="relative">
                                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                                  <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-slate-900 px-3 text-slate-500">Scan to Secure</span></div>
                              </div>

                              <div className="bg-white p-3 rounded-2xl mx-auto w-32 h-32 shadow-xl">
                                  <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(solanaService.createPaymentRequest("7Xw...mock...9zB", showCheckout.price, "SoundMerge", showCheckout.title))}`} 
                                    alt="QR Code" 
                                    className="w-full h-full mix-blend-multiply"
                                  />
                              </div>
                          </div>
                      )}

                      {paymentStatus === 'success' && (
                          <button 
                            onClick={() => setShowCheckout(null)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-4 rounded-2xl font-bold transition-colors mt-4"
                          >
                              Return to Store
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
