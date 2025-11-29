
/**
 * MINTING SCRIPT FOR SOLANA (VoiceShield™)
 * Dependencies: npm install @solana/web3.js @metaplex-foundation/js dotenv
 * Usage: node scripts/mint-solana.js
 */

const { Connection, Keypair, LAMPORTS_PER_SOL } = require("@solana/web3.js");
const { Metaplex, keypairIdentity, bundlrStorage } = require("@metaplex-foundation/js");
require("dotenv").config();

async function mintSolanaVoiceNFT() {
    console.log("--- Starting Solana Voice NFT Minting ---");

    // 1. Setup Connection to Devnet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    
    // 2. Setup Wallet
    // For this script, we generate a new wallet and airdrop SOL for testing.
    // In production, load from a keypair file or environment variable.
    // const secret = Uint8Array.from(JSON.parse(process.env.SOLANA_WALLET_JSON));
    // const wallet = Keypair.fromSecretKey(secret);
    
    const wallet = Keypair.generate();
    console.log(`Wallet Public Key: ${wallet.publicKey.toBase58()}`);

    // 3. Fund Wallet (Airdrop for Devnet)
    // This is required to pay for minting fees on a new test wallet.
    console.log("Requesting Airdrop...");
    try {
        const signature = await connection.requestAirdrop(wallet.publicKey, 1 * LAMPORTS_PER_SOL);
        const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
        await connection.confirmTransaction({
            blockhash,
            lastValidBlockHeight,
            signature
        });
        console.log("Airdrop successful! Balance: 1 SOL");
    } catch (error) {
        console.error("Airdrop failed (rate limits?). Ensure wallet has funds.");
    }

    // 4. Setup Metaplex
    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(wallet))
        .use(bundlrStorage({
            address: 'https://devnet.bundlr.network',
            providerUrl: 'https://api.devnet.solana.com',
            timeout: 60000,
        }));

    // 5. Prepare Metadata
    // This conforms to the Metaplex standard for NFTs
    const voiceMetadata = {
        name: "Voice IP: Alex Rivera",
        symbol: "VOICE",
        description: "Biometric Voice Registration protected by SoundForge Pro VoiceShield™.",
        image: "https://arweave.net/placeholder_image", // In prod, upload image first -> use URI here
        attributes: [
            { trait_type: "Fingerprint Hash", value: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" },
            { trait_type: "License Type", value: "Commercial & Sync" },
            { trait_type: "Jurisdiction", value: "Delaware, USA" },
            { trait_type: "Platform", value: "SoundForge Pro" },
            { trait_type: "Status", value: "Active" }
        ],
        properties: {
            files: [
                {
                    uri: "https://arweave.net/placeholder_image",
                    type: "image/png"
                }
            ],
            category: "image"
        }
    };

    // 6. Upload Metadata to Arweave
    console.log("Uploading metadata to Arweave via Bundlr...");
    const { uri } = await metaplex.nfts().uploadMetadata(voiceMetadata);
    console.log(`Metadata uploaded: ${uri}`);

    // 7. Mint NFT
    console.log("Minting Voice NFT...");
    const { nft } = await metaplex.nfts().create({
        uri: uri,
        name: "Voice IP: Alex Rivera",
        sellerFeeBasisPoints: 500, // 5% Royalty on secondary sales
        symbol: "VOICE",
        creators: [
            { address: wallet.publicKey, share: 100 }
        ],
        isMutable: true,
    });

    console.log("-----------------------------------------");
    console.log("Minting Complete!");
    console.log(`NFT Address: ${nft.address.toBase58()}`);
    console.log(`View on Solscan: https://solscan.io/token/${nft.address.toBase58()}?cluster=devnet`);
    console.log("-----------------------------------------");
}

mintSolanaVoiceNFT().catch((err) => {
    console.error("Minting Error:", err);
});
