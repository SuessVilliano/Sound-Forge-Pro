
import React, { useState } from 'react';
import { ShoppingBag, Plus, DollarSign, Image as ImageIcon, QrCode, X, CheckCircle2, Package, Tag, Wallet, Gem, Disc, Music2, Cpu, FileText, Loader2, ExternalLink } from 'lucide-react';
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
        title: 'Genesis: The Golden Era', 
        description: 'First edition Music NFT. Includes stems, commercial license, and 5% streaming royalty rights.', 
        price: 0.5, 
        currency: 'SOL', 
        image: 'https://picsum.photos/400/400?random=51', 
        type: 'nft_drop', 
        stock: 100,
        nftAttributes: {
            royaltyShare: "5%",
            includesVoiceModel: true,
            includesStems: true,
            editionSize: "100"
        }
    },
    { 
        id: 'p2', 
        title: 'Limited Edition Vinyl', 
        description: 'Signed heavyweight vinyl of the latest album.', 
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
  
  // Checkout / Minting State
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
          setStatusMessage('Connecting to Wallet...');
          
          // 1. Connect Wallet
          const walletAddr = await solanaService.connectWallet();
          if (!walletAddr) throw new Error("Wallet not connected");

          // 2. Trigger Mint
          setPaymentStatus('minting');
          setStatusMessage('Preparing Assets...');
          
          const result = await solanaService.mintMusicNFT(
              { title: showCheckout.title },
              (status) => setStatusMessage(status)
          );

          setMintedAddress(result.mintAddress);
          setPaymentStatus('success');
          
          // 3. Track Sale
          const user = authService.getCurrentUser();
          if (user) {
              await affiliateService.trackSale(user, showCheckout.price, result.mintAddress);
          }

      } catch (e: any) {
          console.error(e);
          setPaymentStatus('error');
          setStatusMessage(e.message || "Minting failed");
      }
  };

  const filterProducts = (tab: string) => {
      if (tab === 'drops') return products.filter(p => p.type === 'nft_drop' || p.type === 'digital');
      if (tab === 'physical') return products.filter(p => p.type === 'physical');
      return products;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-purple-500" /> 
                  {activeTab === 'manage' ? 'Manage Inventory' : 'Store & Drops'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                  {activeTab === 'drops' ? 'Limited edition music NFTs and digital assets.' : 'Physical merch and apparel.'}
              </p>
          </div>
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
              <button 
                  onClick={() => setActiveTab('drops')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'drops' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                  <Gem className="w-3 h-3" /> NFT Drops
              </button>
              <button 
                  onClick={() => setActiveTab('physical')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'physical' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                  Merch
              </button>
          </div>
      </div>

      {(activeTab === 'drops' || activeTab === 'physical') && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
              {filterProducts(activeTab).map(product => (
                  <div key={product.id} className={`bg-white dark:bg-slate-850 border rounded-xl overflow-hidden shadow-sm group transition-all relative ${product.type === 'nft_drop' ? 'border-purple-500/30 hover:border-purple-500/60' : 'border-slate-200 dark:border-slate-800 hover:border-slate-400'}`}>
                      {/* Holographic Overlay for NFTs */}
                      {product.type === 'nft_drop' && (
                          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-cyan-500/10 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity"></div>
                      )}

                      <div className="h-56 overflow-hidden relative">
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                              <span className={`text-xs font-bold px-2 py-1 rounded uppercase backdrop-blur-md ${product.type === 'nft_drop' ? 'bg-purple-600/90 text-white' : 'bg-black/60 text-white'}`}>
                                  {product.type === 'nft_drop' ? 'Digital Collectible' : product.type}
                              </span>
                          </div>
                      </div>
                      
                      <div className="p-5 relative z-10">
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{product.title}</h3>
                          <p className="text-slate-500 text-sm line-clamp-2 mb-4 h-10">{product.description}</p>
                          
                          {product.type === 'nft_drop' && product.nftAttributes && (
                              <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
                                  {product.nftAttributes.includesVoiceModel && (
                                      <span className="text-[10px] bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
                                          <Cpu className="w-3 h-3" /> Voice AI Model
                                      </span>
                                  )}
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded flex items-center gap-1 whitespace-nowrap">
                                      <Tag className="w-3 h-3" /> Ed. of {product.nftAttributes.editionSize}
                                  </span>
                              </div>
                          )}

                          <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800/50">
                              <span className="text-xl font-bold text-slate-900 dark:text-white">
                                  {product.currency === 'SOL' ? '◎' : '$'}{product.price}
                              </span>
                              <button 
                                onClick={() => initPurchase(product)}
                                className={`px-4 py-2 rounded-lg font-bold text-sm transition-all flex items-center gap-2 shadow-lg ${product.type === 'nft_drop' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/20' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'}`}
                              >
                                  {product.type === 'nft_drop' ? 'Mint' : 'Buy Now'} <Wallet className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {/* Checkout Modal (Solana Pay / Mint Terminal) */}
      {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative">
                  <button onClick={() => setShowCheckout(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">
                      <X className="w-5 h-5" />
                  </button>
                  
                  <div className="p-8 flex flex-col items-center text-center">
                      <div className="mb-6 relative">
                          <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center border-2 border-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                              <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="Solana" className="w-10 h-10 object-contain" />
                          </div>
                          {(paymentStatus === 'minting' || paymentStatus === 'connecting') && (
                              <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-purple-400 animate-spin"></div>
                          )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-1">
                          {paymentStatus === 'success' ? 'Mint Successful!' : 'Mint Collector Edition'}
                      </h3>
                      
                      {paymentStatus === 'success' ? (
                          <div className="space-y-4">
                              <div className="bg-green-500/20 text-green-400 p-3 rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                                  <CheckCircle2 className="w-5 h-5" /> Asset Transferred
                              </div>
                              <a href={`https://solscan.io/token/${mintedAddress}?cluster=devnet`} target="_blank" className="text-xs text-purple-400 hover:underline flex items-center justify-center gap-1">
                                  View on Solscan <ExternalLink className="w-3 h-3" />
                              </a>
                          </div>
                      ) : (
                          <p className="text-slate-400 text-sm mb-6 max-w-[200px]">
                              {paymentStatus === 'pending' && `Purchase "${showCheckout.title}" for ◎${showCheckout.price}.`}
                              {paymentStatus !== 'pending' && statusMessage}
                          </p>
                      )}
                      
                      {paymentStatus === 'error' && (
                          <div className="mb-4 bg-red-500/10 text-red-400 text-xs p-2 rounded">
                              {statusMessage}
                          </div>
                      )}

                      {paymentStatus === 'pending' && (
                          <div className="flex flex-col w-full gap-4">
                              <button 
                                onClick={handleMintProcess}
                                className="w-full flex items-center justify-center gap-2 text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 py-3 rounded-lg font-bold transition-all shadow-lg"
                              >
                                  <Wallet className="w-4 h-4" /> Connect & Mint
                              </button>
                              
                              <div className="relative">
                                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-900 px-2 text-slate-500">OR Scan to Pay</span></div>
                              </div>

                              <div className="bg-white p-2 rounded-lg mx-auto w-32 h-32">
                                  <img 
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(solanaService.createPaymentRequest("7Xw...mock...9zB", showCheckout.price, "SoundForge", showCheckout.title))}`} 
                                    alt="QR Code" 
                                    className="w-full h-full mix-blend-multiply"
                                  />
                              </div>
                          </div>
                      )}

                      {paymentStatus === 'success' && (
                          <button 
                            onClick={() => setShowCheckout(null)}
                            className="w-full bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-lg font-bold transition-colors mt-4"
                          >
                              Close
                          </button>
                      )}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
