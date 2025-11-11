import { BrowserProvider, JsonRpcProvider, formatUnits, parseUnits, Contract } from 'ethers';
import { newKitFromWeb3, StableToken } from '@celo/contractkit';

// Celo Mainnet configuration
const CELO_RPC_URL = 'https://forno.celo.org';
// Official cUSD address on Celo Mainnet
const CUSD_CONTRACT_ADDRESS = '0x765DE816845861e75A25fCA122bb6898B8B1282a';

// A minimal ABI for an ERC20 token's transfer function
const ERC20_ABI = [
    "function transfer(address to, uint256 amount) returns (bool)"
];

// --- Injected MiniPay Provider ---
const getMiniPayProvider = () => {
    if ((window as any).miniPay) {
        return new BrowserProvider((window as any).miniPay);
    }
    console.error("MiniPay provider not found. Make sure you are in the MiniPay environment.");
    return null;
};

// --- Wallet Functions ---

/**
 * Fetches the user's wallet address from the MiniPay provider.
 */
export const getWalletAddress = async (): Promise<string | null> => {
    try {
        const provider = getMiniPayProvider();
        if (!provider) return null;

        // --- THE CRITICAL FIX IS HERE ---
        // We must first request the accounts from the wallet.
        // This prompts MiniPay to connect and provide the address.
        const accounts = await provider.send('eth_requestAccounts', []);
        
        if (accounts && accounts.length > 0) {
            return accounts[0]; // Return the first account
        }

        // If no accounts are returned, we can't proceed.
        return null;

    } catch (error) {
        console.error("Error getting wallet address:", error);
        return null;
    }
};

/**
 * Fetches the user's USDC (cUSD) balance using a read-only provider.
 */
export const getUSDCBalance = async (address: string): Promise<string | null> => {
    try {
        const provider = new JsonRpcProvider(CELO_RPC_URL);
        const kit = newKitFromWeb3(provider as any);
        const stableToken = await kit.contracts.getStableToken(StableToken.cUSD);
        const balanceInWei = await stableToken.balanceOf(address);
        const balanceInCUSD = formatUnits(balanceInWei.toString(), 18);
        return parseFloat(balanceInCUSD).toFixed(2);
    } catch (error) {
        console.error("Error fetching USDC balance:", error);
        return null;
    }
};

/**
 * Sends USDC (cUSD) using ethers.js and the MiniPay signer.
 */
export const sendUSDC = async (destinationAddress: string, amount: string): Promise<string | null> => {
    try {
        const provider = getMiniPayProvider();
        if (!provider) throw new Error("MiniPay provider not found");

        const signer = await provider.getSigner();
        const cusdContract = new Contract(CUSD_CONTRACT_ADDRESS, ERC20_ABI, signer);
        const amountInWei = parseUnits(amount, 18);
        const tx = await cusdContract.transfer(destinationAddress, amountInWei);
        const receipt = await tx.wait();

        return receipt.hash;
    } catch (error) {
        console.error("Error sending USDC:", error);
        return null;
    }
};