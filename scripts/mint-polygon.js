/**
 * MINTING SCRIPT FOR POLYGON (EVM)
 * Dependencies: npm install ethers dotenv axios form-data
 * Usage: node scripts/mint-polygon.js
 */

const { ethers } = require("ethers");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

// Configuration
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_SECRET_KEY;
const PRIVATE_KEY = process.env.PRIVATE_KEY; // Artist or Admin Wallet
const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const ARTIST_WALLET = "0xArtistWalletAddress...";

// Load Contract ABI (Simplified for script)
const contractABI = [
    "function mintVoice(address artist, string memory tokenURI, string memory fingerprintHash, string memory legalContractHash) public returns (uint256)"
];

async function uploadToIPFS(metadata) {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;
    try {
        const response = await axios.post(url, metadata, {
            headers: {
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_KEY
            }
        });
        return `ipfs://${response.data.IpfsHash}`;
    } catch (error) {
        console.error("IPFS Upload Error:", error);
        throw error;
    }
}

async function mintVoiceNFT() {
    console.log("Starting Polygon Minting Process...");

    // 1. Prepare Metadata
    const fingerprintHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"; // Mock SHA-256
    const legalDocHash = "0xLegalDocHash...";
    
    const metadata = {
        name: "Voice IP: Alex Rivera",
        description: "Registered Voice Identity via SoundForge Pro.",
        image: "ipfs://QmPlaceholderImage", 
        attributes: [
            { trait_type: "Fingerprint", value: fingerprintHash },
            { trait_type: "Status", value: "Verified" }
        ]
    };

    // 2. Upload Metadata to IPFS
    console.log("Uploading metadata to IPFS...");
    const tokenURI = await uploadToIPFS(metadata);
    console.log("Metadata URL:", tokenURI);

    // 3. Connect to Blockchain
    const provider = new ethers.JsonRpcProvider(POLYGON_RPC_URL);
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

    // 4. Mint Token
    console.log("Minting NFT on Polygon...");
    try {
        const tx = await contract.mintVoice(ARTIST_WALLET, tokenURI, fingerprintHash, legalDocHash);
        console.log(`Transaction Sent: ${tx.hash}`);
        
        const receipt = await tx.wait();
        console.log("Minting Confirmed! Block:", receipt.blockNumber);
    } catch (error) {
        console.error("Minting Failed:", error);
    }
}

mintVoiceNFT();