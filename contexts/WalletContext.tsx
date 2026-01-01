
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { alchemyService, TokenPrice } from '../services/alchemyService';

interface WalletContextType {
  walletAddress: string | null; // EOA (Phantom/TipLink)
  smartWalletAddress: string | null; // AA Smart Account (Alchemy)
  isConnecting: boolean;
  walletType: 'phantom' | 'tiplink' | 'demo' | null;
  tokenPrices: TokenPrice[];
  
  connectTipLink: () => Promise<void>;
  connectPhantom: () => Promise<void>;
  createSmartAccount: () => Promise<void>;
  disconnectWallet: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [smartWalletAddress, setSmartWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletType, setWalletType] = useState<'phantom' | 'tiplink' | 'demo' | null>(null);
  const [tokenPrices, setTokenPrices] = useState<TokenPrice[]>([]);

  // Check for existing connection on mount
  useEffect(() => {
      const savedWallet = localStorage.getItem('sf_wallet_address');
      const savedType = localStorage.getItem('sf_wallet_type');
      const savedSmartWallet = localStorage.getItem('sf_smart_wallet_address');
      
      if (savedWallet && savedType) {
          setWalletAddress(savedWallet);
          setWalletType(savedType as any);
      }
      if (savedSmartWallet) {
          setSmartWalletAddress(savedSmartWallet);
      }

      // Fetch prices periodically
      const fetchPrices = async () => {
          const prices = await alchemyService.getTokenPrices(['SOL', 'USDC', 'ETH', 'MATIC']);
          setTokenPrices(prices);
      };
      fetchPrices();
      const interval = setInterval(fetchPrices, 60000); // Update every minute
      return () => clearInterval(interval);
  }, []);

  const connectTipLink = async () => {
      setIsConnecting(true);
      try {
          // TipLink.io Simulation (In real app, import { TipLink } from '@tiplink/api')
          await new Promise(r => setTimeout(r, 2000));
          const mockAddress = "Tip" + Math.random().toString(36).substr(2, 4) + "..." + Math.random().toString(36).substr(2, 4);
          
          setWalletAddress(mockAddress);
          setWalletType('tiplink');
          localStorage.setItem('sf_wallet_address', mockAddress);
          localStorage.setItem('sf_wallet_type', 'tiplink');
      } catch (e) {
          console.error(e);
      } finally {
          setIsConnecting(false);
      }
  };

  const connectPhantom = async () => {
      setIsConnecting(true);
      try {
          const { solana } = window as any;
          if (solana && solana.isPhantom) {
              const response = await solana.connect();
              const address = response.publicKey.toString();
              setWalletAddress(address);
              setWalletType('phantom');
              localStorage.setItem('sf_wallet_address', address);
              localStorage.setItem('sf_wallet_type', 'phantom');
          } else {
              const confirmDemo = window.confirm("Phantom Wallet not detected. Connect in Demo Mode to test features?");
              if (confirmDemo) {
                  await new Promise(r => setTimeout(r, 800));
                  const demoAddr = "Demo" + Math.random().toString(36).substr(2, 6) + "Sol";
                  setWalletAddress(demoAddr);
                  setWalletType('demo');
                  localStorage.setItem('sf_wallet_address', demoAddr);
                  localStorage.setItem('sf_wallet_type', 'demo');
              } else {
                  window.open('https://phantom.app/', '_blank');
              }
          }
      } catch (e) {
          console.error("Wallet connection failed:", e);
      } finally {
          setIsConnecting(false);
      }
  };

  const createSmartAccount = async () => {
      if (!walletAddress) {
          alert("Connect your main wallet first to act as the signer.");
          return;
      }
      setIsConnecting(true);
      try {
          const result = await alchemyService.createSmartWallet(walletAddress);
          setSmartWalletAddress(result.address);
          localStorage.setItem('sf_smart_wallet_address', result.address);
      } catch (e) {
          console.error("Smart Wallet creation failed", e);
      } finally {
          setIsConnecting(false);
      }
  };

  const disconnectWallet = () => {
      setWalletAddress(null);
      setWalletType(null);
      // Optional: Don't disconnect smart wallet session immediately to persist "account" feel
      // setSmartWalletAddress(null); 
      localStorage.removeItem('sf_wallet_address');
      localStorage.removeItem('sf_wallet_type');
      
      try {
          const { solana } = window as any;
          if (solana && solana.disconnect) {
              solana.disconnect();
          }
      } catch(e) {}
  };

  return (
    <WalletContext.Provider value={{ 
        walletAddress, 
        smartWalletAddress, 
        isConnecting, 
        walletType, 
        tokenPrices,
        connectTipLink, 
        connectPhantom, 
        createSmartAccount,
        disconnectWallet 
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
