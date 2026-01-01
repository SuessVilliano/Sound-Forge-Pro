
import React, { useState } from 'react';
import { Wallet, Shield, Zap, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard, RefreshCw, Key, Layers, Globe, Copy, Check, Info, Coins, BarChart3, Music } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { alchemyService } from '../services/alchemyService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

/**
 * Fix: Added Music to lucide-react imports above
 */

// Mock historical data for the chart since we only fetch current price live
const MOCK_HISTORY = [
    { name: 'Mon', value: 1200 },
    { name: 'Tue', value: 1350 },
    { name: 'Wed', value: 1280 },
    { name: 'Thu', value: 1400 },
    { name: 'Fri', value: 1600 },
    { name: 'Sat', value: 1550 },
    { name: 'Sun', value: 1820 },
];

export const SmartWalletDashboard: React.FC = () => {
  const { walletAddress, smartWalletAddress, tokenPrices, createSmartAccount, isConnecting } = useWallet();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'tokens' | 'liquid_rights' | 'activity'>('tokens');

  const handleCopy = (addr: string) => {
      navigator.clipboard.writeText(addr);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
  };

  // Calculate Total Portfolio Value based on mock balances * real prices
  const portfolioValue = tokenPrices.reduce((acc, token) => {
      // Mock balance logic: SOL gets 10, others get 1000 for demo visualization
      const balance = token.symbol === 'SOL' ? 12.5 : token.symbol === 'ETH' ? 0.5 : 1500;
      return acc + (balance * token.price);
  }, 0);

  if (!smartWalletAddress) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[600px] text-center space-y-8 animate-in fade-in">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/30">
                  <Shield className="w-12 h-12 text-white" />
              </div>
              <div className="max-w-md">
                  <h1 className="text-3xl font-bold text-white mb-4">Create Your Rights Ledger</h1>
                  <p className="text-slate-400 mb-8">
                      Deploy your institutional Smart Account powered by Alchemy. Manage your Voice IP, Music Rights, and Liquid Assets in a gas-free environment.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-8 text-left">
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                          <Zap className="w-5 h-5 text-yellow-400 mb-2" />
                          <h3 className="font-bold text-white text-sm">Automated Royalties</h3>
                          <p className="text-xs text-slate-500">Instant on-chain splits.</p>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                          <Coins className="w-5 h-5 text-purple-400 mb-2" />
                          <h3 className="font-bold text-white text-sm">x402 Liquidity</h3>
                          <p className="text-xs text-slate-500">Trade rights seamlessly.</p>
                      </div>
                  </div>
                  <button 
                    onClick={createSmartAccount}
                    disabled={isConnecting}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                      {isConnecting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wallet className="w-5 h-5" />}
                      Initialize Rights Ledger
                  </button>
                  {!walletAddress && <p className="text-xs text-red-400 mt-4">Please connect your external wallet (Phantom/TipLink) first.</p>}
              </div>
          </div>
      );
  }

  return (
    <div className="space-y-8 pb-24 animate-in fade-in">
        
        {/* Header Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Balance Card */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-8 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Layers className="w-48 h-48 text-indigo-400" />
                </div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                <Shield className="w-3 h-3" /> Institutional Rights Ledger
                            </span>
                            <div className="flex items-center gap-2 text-slate-400 text-sm font-mono cursor-pointer hover:text-white transition-colors" onClick={() => handleCopy(smartWalletAddress)}>
                                {smartWalletAddress.slice(0, 10)}...{smartWalletAddress.slice(-8)}
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                            </div>
                        </div>
                        <div className="bg-slate-900/50 backdrop-blur border border-white/10 p-2 rounded-lg">
                            <img src="https://cryptologos.cc/logos/polygon-matic-logo.png" className="w-8 h-8 opacity-80" alt="Polygon" />
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="text-sm text-slate-400 mb-1">Asset Portfolio Valuation</div>
                        <div className="text-5xl font-bold text-white tracking-tight">
                            ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-green-400 text-sm font-bold">
                            <TrendingUp className="w-4 h-4" /> +5.2% (24h Market Growth)
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 bg-white text-slate-900 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                            <ArrowDownRight className="w-5 h-5" /> Inbound
                        </button>
                        <button className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2">
                            <ArrowUpRight className="w-5 h-5" /> Settle
                        </button>
                        <button className="flex-1 bg-slate-800 text-white border border-slate-700 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                            <BarChart3 className="w-5 h-5" /> Liquidate
                        </button>
                    </div>
                </div>
            </div>

            {/* Price Feed / Mini Chart */}
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-white">Market Pulse</h3>
                    <div className="p-1 bg-slate-800 rounded-md">
                        <TrendingUp className="w-4 h-4 text-cyan-500" />
                    </div>
                </div>
                <div className="flex-1 min-h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={MOCK_HISTORY}>
                            <defs>
                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                            <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-3">
                    {tokenPrices.slice(0, 2).map(token => (
                        <div key={token.symbol} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-3">
                                <img src={token.logo} className="w-6 h-6 rounded-full" />
                                <span className="font-bold text-white">{token.symbol}</span>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-mono">${token.price.toLocaleString()}</div>
                                <div className={`text-xs ${token.percent_change_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {token.percent_change_24h.toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Assets & Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-200 dark:border-slate-800">
                <button 
                    onClick={() => setActiveTab('tokens')}
                    className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'tokens' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Cash & Tokens
                </button>
                <button 
                    onClick={() => setActiveTab('liquid_rights')}
                    className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'liquid_rights' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Liquid Rights (x402)
                </button>
                <button 
                    onClick={() => setActiveTab('activity')}
                    className={`px-8 py-4 text-sm font-bold border-b-2 transition-colors ${activeTab === 'activity' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                    Settlement History
                </button>
            </div>

            <div className="p-6">
                {activeTab === 'tokens' && (
                    <div className="space-y-2">
                        <div className="grid grid-cols-4 text-xs font-bold text-slate-500 uppercase px-4 mb-2">
                            <div>Asset</div>
                            <div className="text-right">Market Price</div>
                            <div className="text-right">Balance</div>
                            <div className="text-right">Value</div>
                        </div>
                        {tokenPrices.map(token => {
                            const balance = token.symbol === 'SOL' ? 12.5 : token.symbol === 'ETH' ? 0.5 : 1500;
                            return (
                                <div key={token.symbol} className="grid grid-cols-4 items-center p-4 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <img src={token.logo} className="w-8 h-8 rounded-full shadow-sm" />
                                        <div>
                                            <div className="font-bold text-slate-900 dark:text-white">{token.symbol}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Settlement Currency</div>
                                        </div>
                                    </div>
                                    <div className="text-right font-mono text-slate-600 dark:text-slate-300">
                                        ${token.price.toLocaleString()}
                                    </div>
                                    <div className="text-right font-bold text-slate-900 dark:text-white">
                                        {balance.toLocaleString()} {token.symbol}
                                    </div>
                                    <div className="text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                        ${(balance * token.price).toLocaleString()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'liquid_rights' && (
                    <div className="space-y-6">
                         <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 flex gap-4 items-center">
                            <Info className="w-6 h-6 text-indigo-400 shrink-0" />
                            <p className="text-xs text-indigo-300 leading-relaxed">
                                <strong>x402 Protocol Active:</strong> Your IP assets (Voice and Sound) are now semi-fungible. This allows for instant fractional licensing and secondary market liquidity. You can liquidate up to 20% of your future royalties for immediate cash flow.
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[
                                { title: "Voice IP: Core DNA", symbol: "vDNA", value: "$45,200", liquidity: "High", share: "100%", icon: Shield },
                                { title: "Midnight City (Master)", symbol: "MID-S", value: "$12,400", liquidity: "Moderate", share: "90%", icon: Music },
                                { title: "Vocal Pack Vol 1", symbol: "VP1", value: "$3,150", liquidity: "Liquid", share: "50%", icon: Coins },
                            ].map((right, i) => (
                                <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6 group hover:border-indigo-500/50 transition-all relative overflow-hidden">
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl group-hover:bg-indigo-500/10 transition-colors"></div>
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                                            <right.icon className="w-5 h-5 text-indigo-400" />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{right.symbol}</div>
                                            <div className="text-xs text-slate-500">Ownership: {right.share}</div>
                                        </div>
                                    </div>
                                    <h4 className="text-white font-bold mb-1">{right.title}</h4>
                                    <div className="text-2xl font-bold text-white mb-4">{right.value}</div>
                                    <div className="flex gap-2">
                                        <button className="flex-1 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 text-xs font-bold hover:bg-indigo-600/30 border border-indigo-600/30">Terms</button>
                                        <button className="flex-1 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold hover:bg-slate-200">Liquidate</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="text-center py-12 text-slate-500">
                        <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No recent automated settlements detected.</p>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
