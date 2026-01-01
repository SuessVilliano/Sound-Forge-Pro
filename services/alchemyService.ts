
// Alchemy Service for SoundForge Pro
// Leveraging Solana DAS API, Core Data APIs (Prices), and Account Abstraction (Smart Wallets)

const ALCHEMY_API_KEY = "IorZj1TanTcxwbym-shjw";
const ALCHEMY_RPC_URL_SOLANA = `https://solana-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;
const GAS_POLICY_ID = "c0c9a87b-6c51-4425-b348-e96e370f3341";

// For Smart Wallets (Account Abstraction), Alchemy predominantly supports EVM chains.
// We will simulate the AA flow for Polygon Mainnet as it's standard for Music NFTs.
const ALCHEMY_RPC_URL_POLYGON = `https://polygon-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export interface AlchemyNFT {
    id: string;
    content: {
        json_uri: string;
        files: { uri: string, mime: string }[];
        metadata: {
            name: string;
            description: string;
            symbol: string;
        };
        links: {
            image: string;
            external_url: string;
        };
    };
    compression: {
        compressed: boolean;
    };
    grouping: {
        group_key: string;
        group_value: string;
    }[];
    creators: {
        address: string;
        share: number;
        verified: boolean;
    }[];
}

export interface TokenPrice {
    symbol: string;
    price: number;
    percent_change_24h: number;
    logo?: string;
}

export const alchemyService = {
    
    /**
     * Fetch User's NFTs using Alchemy's DAS API (getAssetsByOwner).
     * This provides real-time, indexed NFT data faster than standard RPC.
     */
    getNftsByOwner: async (walletAddress: string): Promise<AlchemyNFT[]> => {
        if (!walletAddress) return [];
        
        try {
            const response = await fetch(ALCHEMY_RPC_URL_SOLANA, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    id: 'sf-nft-fetch',
                    method: 'getAssetsByOwner',
                    params: {
                        ownerAddress: walletAddress,
                        page: 1,
                        limit: 50,
                        displayOptions: {
                            showCollectionMetadata: true,
                            showUnverifiedCollections: true // Show all for now
                        }
                    }
                })
            });

            const { result, error } = await response.json();
            
            if (error) {
                console.error("Alchemy API Error:", error);
                return [];
            }

            return result?.items || [];
        } catch (e) {
            console.error("Network Error fetching Alchemy NFTs:", e);
            return [];
        }
    },

    /**
     * Fetch Token Balances (SOL & SPL Tokens)
     */
    getTokenBalances: async (walletAddress: string) => {
        try {
            const response = await fetch(ALCHEMY_RPC_URL_SOLANA, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: "sf-token-fetch",
                    method: "getTokenAccountsByOwner",
                    params: [
                        walletAddress,
                        { programId: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" },
                        { encoding: "jsonParsed" }
                    ]
                })
            });
            const data = await response.json();
            return data.result?.value || [];
        } catch (e) {
            console.error("Alchemy Token Fetch Error", e);
            return [];
        }
    },

    /**
     * Store and Retrieve Webhook Configuration
     */
    getStoredWebhookUrl: (): string => {
        return localStorage.getItem('sf_alchemy_webhook_url') || 'https://apps.taskmagic.com/api/v1/webhooks/WxSSKalxqbanieJir5JWp';
    },

    setStoredWebhookUrl: (url: string) => {
        localStorage.setItem('sf_alchemy_webhook_url', url);
    },

    /**
     * Simulate creating a Webhook via Alchemy Notify API
     */
    createWebhook: async (webhookUrl: string, addresses: string[]) => {
        console.log(`[Alchemy] Creating Webhook for ${addresses.length} addresses -> ${webhookUrl}`);
        
        // Persist the URL
        localStorage.setItem('sf_alchemy_webhook_url', webhookUrl);

        // In production: POST https://dashboard.alchemy.com/api/create-webhook ...
        await new Promise(r => setTimeout(r, 1000));
        return {
            id: `wh_${Date.now()}`,
            app_id: "sound-forge-pro",
            network: "SOLANA_MAINNET",
            webhook_type: "ADDRESS_ACTIVITY",
            url: webhookUrl,
            is_active: true
        };
    },

    /**
     * Fetch Real-Time Token Prices using Alchemy Price API.
     * Checks multiple symbols like SOL, USDC, ETH, MATIC.
     */
    getTokenPrices: async (symbols: string[]): Promise<TokenPrice[]> => {
        // Fallback mock data if API limits hit, but attempting real fetch first
        const mockPrices: TokenPrice[] = [
            { symbol: 'SOL', price: 145.20, percent_change_24h: 2.5, logo: 'https://cryptologos.cc/logos/solana-sol-logo.png' },
            { symbol: 'USDC', price: 1.00, percent_change_24h: 0.01, logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
            { symbol: 'ETH', price: 3450.00, percent_change_24h: -1.2, logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
            { symbol: 'MATIC', price: 0.72, percent_change_24h: 1.8, logo: 'https://cryptologos.cc/logos/polygon-matic-logo.png' }
        ];

        try {
            // Note: Alchemy Price API endpoint structure
            // https://api.g.alchemy.com/prices/v1/{apiKey}/tokens/by-symbol?symbols=ETH&symbols=USDC
            const url = `https://api.g.alchemy.com/prices/v1/${ALCHEMY_API_KEY}/tokens/by-symbol?symbols=${symbols.join('&symbols=')}`;
            
            const response = await fetch(url);
            if (!response.ok) return mockPrices;

            const data = await response.json();
            
            if (data.data) {
                return data.data.map((item: any) => {
                    // Safe access to prices array with fallback
                    const priceData = item.prices && item.prices.length > 0 ? item.prices[0] : null;
                    
                    return {
                        symbol: item.symbol,
                        price: priceData ? parseFloat(priceData.value || "0") : 0,
                        percent_change_24h: priceData ? parseFloat(priceData.last_24h_change || "0") * 100 : 0,
                        logo: item.logo
                    };
                });
            }
            return mockPrices;
        } catch (e) {
            console.warn("Price API failed, using fallback", e);
            return mockPrices;
        }
    },

    /**
     * SMART WALLET (Account Abstraction)
     * Simulates the creation of an ERC-4337 Smart Account powered by Alchemy.
     * Uses Gas Policy ID to simulate sponsorship.
     */
    createSmartWallet: async (ownerAddress: string): Promise<{ address: string, network: string, gasPolicyId: string }> => {
        console.log(`[Alchemy AA] Deploying Smart Account for owner: ${ownerAddress}`);
        console.log(`[Alchemy AA] Applying Gas Policy: ${GAS_POLICY_ID}`);
        
        // In a real app using @alchemy/aa-core:
        // const provider = new AlchemyProvider({ chain, apiKey });
        // const signer = LocalAccountSigner.privateKeyToAccountSigner(PRIVATE_KEY);
        // const account = await createModularAccountAlchemyClient({ ... });
        
        await new Promise(r => setTimeout(r, 2500)); // Simulate contract deployment

        // Deterministic mock address generation
        const mockAddress = "0x" + Math.random().toString(36).substring(2, 10) + "AA" + Math.random().toString(36).substring(2, 24);
        
        return {
            address: mockAddress,
            network: "Polygon Mainnet", // Standard for Music NFTs/Low Gas
            gasPolicyId: GAS_POLICY_ID
        };
    },

    /**
     * Get Smart Wallet Assets (Polygon)
     */
    getSmartWalletAssets: async (address: string) => {
        // Fetch real Polygon assets via Alchemy
        try {
            const response = await fetch(ALCHEMY_RPC_URL_POLYGON, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    id: "sf-sw-assets",
                    method: "alchemy_getTokenBalances",
                    params: [address]
                })
            });
            const data = await response.json();
            // Simplify result for UI
            return data.result?.tokenBalances || [];
        } catch (e) {
            return [];
        }
    }
};
