import { BrowserProvider, JsonRpcProvider, formatUnits, parseUnits, Contract } from 'ethers';
import { newKitFromWeb3, StableToken } from '@celo/contractkit';

// Celo Mainnet configuration
const CELO_RPC_URL = 'https://forno.celo.org';
const CUSD_CONTRACT_ADDRESS = '0x765DE816845861e75A25fca122bb6898B8B1282a';
const ERC20_ABI = ["function transfer(address to, uint256 amount) returns (bool)"];

// --- Wallet Functions ---

export const getWalletAddress = async (): Promise<string> => {
    // We will throw very specific errors now
    if (!(window as any).miniPay) {
        throw new Error("FATAL: window.miniPay object was not found. This app is not running inside MiniPay.");
    }

    try {
        const provider = new BrowserProvider((window as any).miniPay);
        const accounts = await provider.send('eth_requestAccounts', []);

        if (!accounts || accounts.length === 0) {
            throw new Error("Provider connected, but eth_requestAccounts returned an empty array. Wallet may be locked or disconnected.");
        }

        return accounts[0];

    } catch (error: any) {
        // Catch any other errors during connection and show them
        throw new Error(`Provider Error: ${error.message}`);
    }
};

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

export const sendUSDC = async (destinationAddress: string, amount: string): Promise<string | null> => {
    try {
        if (!(window as any).miniPay) throw new Error("MiniPay provider not found");
        const provider = new BrowserProvider((window as any).miniPay);
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