
import React, { useState } from 'react';
import { ShoppingBag, Plus, DollarSign, Image as ImageIcon, QrCode, X, CheckCircle2, Package, Tag, Wallet } from 'lucide-react';
import { Product } from '../types';
import { affiliateService } from '../services/affiliateService';
import { authService } from '../services/authService';

interface MerchStoreProps {
  userDisplayName?: string;
}

const MOCK_PRODUCTS: Product[] = [
    { id: 'p1', title: 'Limited Edition Vinyl', description: 'Signed heavyweight vinyl of the latest album.', price: 35.00, currency: 'USD', image: 'https://picsum.photos/400/400?random=50', type: 'physical', stock: 50 },
    { id: 'p2', title: 'Digital Discography', description: 'High-res WAV download of all tracks.', price: 0.5, currency: 'SOL', image: 'https://picsum.photos/400/400?random=51', type: 'digital', stock: 999 },
    { id: 'p3', title: 'Tour Hoodie', description: 'Black oversized hoodie with tour dates.', price: 55.00, currency: 'USD', image: 'https://picsum.photos/400/400?random=52', type: 'physical', stock: 20 },
];

export const MerchStore: React.FC<MerchStoreProps> = ({ userDisplayName }) => {
  const [activeTab, setActiveTab] = useState<'storefront' | 'manage'>('storefront');
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [showCheckout, setShowCheckout] = useState<Product | null>(null);
  
  // New Product Form
  const [newProd, setNewProd] = useState<Partial<Product>>({ currency: 'USD', type: 'physical' });

  const handleAddProduct = () => {
      const product: Product = {
          id: `prod_${Date.now()}`,
          title: newProd.title || 'Untitled Product',
          description: newProd.description || '',
          price: Number(newProd.price) || 0,
          currency: newProd.currency as 'USD' | 'SOL',
          type: newProd.type as 'physical' | 'digital',
          stock: Number(newProd.stock) || 0,
          image: 'https://picsum.photos/400/400?random=' + Date.now() // Mock image
      };
      setProducts([product, ...products]);
      setNewProd({ currency: 'USD', type: 'physical' });
      setActiveTab('storefront');
  };

  const handlePurchase = async (product: Product) => {
      // Simulate successful purchase flow
      // In prod, this would wait for tx confirmation
      
      const user = authService.getCurrentUser();
      if (user) {
          await affiliateService.trackSale(
              user, 
              product.price, 
              `inv_${Date.now()}`, 
              `Merch: ${product.title}`
          );
      }
      
      alert(`Successfully purchased ${product.title}!`);
      setShowCheckout(null);
  };

  const getSolanaPayUrl = (product: Product) => {
      // Simulate a Solana Pay transaction request URL
      // In prod this would be solana:<recipient>?amount=...
      const recipient = "7Xw...mock...9zB"; 
      const amount = product.currency === 'SOL' ? product.price : (product.price / 100).toFixed(4); // simple conversion mock
      const label = encodeURIComponent("SoundForge Store");
      const message = encodeURIComponent(`Payment for ${product.title}`);
      return `solana:${recipient}?amount=${amount}&label=${label}&message=${message}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-purple-500" /> 
                  {activeTab === 'manage' ? 'Manage Store' : 'Official Store'}
              </h2>
              <p className="text-slate-500 text-sm">
                  {activeTab === 'manage' ? 'Add products and track inventory.' : `Merch and digital goods by ${userDisplayName || 'Artist'}.`}
              </p>
          </div>
          <div className="bg-slate-200 dark:bg-slate-800 p-1 rounded-lg flex gap-1">
              <button 
                  onClick={() => setActiveTab('storefront')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'storefront' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                  Storefront
              </button>
              <button 
                  onClick={() => setActiveTab('manage')}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'manage' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
              >
                  Manage Products
              </button>
          </div>
      </div>

      {activeTab === 'storefront' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
              {products.map(product => (
                  <div key={product.id} className="bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm group hover:border-purple-500/50 transition-all">
                      <div className="h-48 overflow-hidden relative">
                          <img src={product.image} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2 py-1 rounded uppercase">
                              {product.type}
                          </div>
                      </div>
                      <div className="p-5">
                          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{product.title}</h3>
                          <p className="text-slate-500 text-sm line-clamp-2 mb-4">{product.description}</p>
                          <div className="flex justify-between items-center">
                              <span className="text-xl font-bold text-slate-900 dark:text-white">
                                  {product.currency === 'SOL' ? '◎' : '$'}{product.price}
                              </span>
                              <button 
                                onClick={() => setShowCheckout(product)}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                              >
                                  Buy Now <Wallet className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      )}

      {activeTab === 'manage' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in">
              {/* Add Product Form */}
              <div className="lg:col-span-1 bg-white dark:bg-slate-850 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                      <Plus className="w-5 h-5 text-green-500" /> Add New Product
                  </h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Product Title</label>
                          <input 
                            type="text" 
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500" 
                            value={newProd.title || ''}
                            onChange={e => setNewProd({...newProd, title: e.target.value})}
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Description</label>
                          <textarea 
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 h-20 resize-none" 
                            value={newProd.description || ''}
                            onChange={e => setNewProd({...newProd, description: e.target.value})}
                          />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Price</label>
                              <div className="relative">
                                  <input 
                                    type="number" 
                                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 pl-8 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500" 
                                    value={newProd.price || ''}
                                    onChange={e => setNewProd({...newProd, price: Number(e.target.value)})}
                                  />
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs font-bold">
                                      {newProd.currency === 'SOL' ? '◎' : '$'}
                                  </span>
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Currency</label>
                              <select 
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                value={newProd.currency}
                                onChange={e => setNewProd({...newProd, currency: e.target.value as any})}
                              >
                                  <option value="USD">USD</option>
                                  <option value="SOL">SOL</option>
                              </select>
                          </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Type</label>
                              <select 
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                                value={newProd.type}
                                onChange={e => setNewProd({...newProd, type: e.target.value as any})}
                              >
                                  <option value="physical">Physical Item</option>
                                  <option value="digital">Digital Download</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">Stock</label>
                              <input 
                                type="number" 
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-purple-500" 
                                value={newProd.stock || ''}
                                onChange={e => setNewProd({...newProd, stock: Number(e.target.value)})}
                              />
                          </div>
                      </div>
                      <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-6 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer">
                          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                          <span className="text-xs font-bold">Upload Product Image</span>
                      </div>
                      <button 
                        onClick={handleAddProduct}
                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold text-sm transition-colors"
                      >
                          List Item
                      </button>
                  </div>
              </div>

              {/* Inventory List */}
              <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Current Inventory</h3>
                  {products.map(p => (
                      <div key={p.id} className="flex items-center gap-4 bg-white dark:bg-slate-850 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                          <img src={p.image} alt={p.title} className="w-16 h-16 rounded-lg object-cover bg-slate-100" />
                          <div className="flex-1">
                              <h4 className="font-bold text-slate-900 dark:text-white text-sm">{p.title}</h4>
                              <p className="text-xs text-slate-500">{p.type} • {p.stock} in stock</p>
                          </div>
                          <div className="text-right">
                              <div className="font-bold text-slate-900 dark:text-white">{p.currency === 'SOL' ? '◎' : '$'}{p.price}</div>
                              <button className="text-xs text-red-500 hover:underline">Remove</button>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Checkout Modal (Simulated Solana Pay) */}
      {showCheckout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl relative">
                  <button onClick={() => setShowCheckout(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">
                      <X className="w-5 h-5" />
                  </button>
                  
                  <div className="p-8 flex flex-col items-center text-center">
                      <div className="w-16 h-16 bg-slate-950 rounded-full flex items-center justify-center mb-6 border border-purple-500/30 shadow-lg shadow-purple-500/20">
                          <img src="https://solanapay.com/img/logo.png" alt="Solana Pay" className="w-8 h-8 object-contain filter invert" onError={(e) => (e.currentTarget.src = "https://cryptologos.cc/logos/solana-sol-logo.png")} />
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-1">Pay with Solana</h3>
                      <p className="text-slate-400 text-sm mb-6">Scan to purchase "{showCheckout.title}"</p>
                      
                      <div className="bg-white p-4 rounded-xl mb-6">
                          {/* Simulate QR Code with API */}
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(getSolanaPayUrl(showCheckout))}`} 
                            alt="QR Code" 
                            className="w-48 h-48"
                          />
                      </div>

                      <div className="flex items-center gap-2 text-white font-bold text-lg mb-6">
                          {showCheckout.currency === 'SOL' ? '◎' : '$'}{showCheckout.price} 
                          <span className="text-slate-500 text-sm font-normal">total</span>
                      </div>

                      <div className="w-full space-y-2">
                          <button 
                            onClick={() => handlePurchase(showCheckout)}
                            className="w-full flex items-center justify-center gap-2 text-xs text-white bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold transition-colors"
                          >
                              <CheckCircle2 className="w-3 h-3" /> Confirm Payment (Demo)
                          </button>
                          <div className="w-full flex items-center gap-2 justify-center text-xs text-slate-500 bg-slate-800/50 py-2 rounded-lg">
                              Instant Settlement
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
