import { BrowserProvider, JsonRpcProvider, formatUnits, parseUnits, Contract } from 'ethers';
import { newKitFromWeb3, StableToken } from '@celo/contractkit';

// Celo Mainnet configuration
const CELO_RPC_URL = 'https://forno.celo.org';
const CUSD_CONTRACT_ADDRESS = '0x765DE816845861e75A25fca122bb6898B8B1282a';
const ERC20_ABI = ["function transfer(address to, uint256 amount) returns (bool)"];

/**
 * This function will wait and poll for the window.miniPay object for up to 5 seconds.
 * This is a robust way to handle timing issues where the wallet injects its code slowly.
 */
const findMiniPayProvider = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        const timeout = 5000; // 5 seconds
        let attempts = 0;
        const interval = setInterval(() => {
            if ((window as any).miniPay) {
                clearInterval(interval);
                resolve((window as any).miniPay);
            }
            attempts++;
            if (attempts > (timeout / 100)) { // Check every 100ms
                clearInterval(interval);
                reject(new Error("FATAL: window.miniPay object was not found after 5 seconds. The MiniPay environment failed to load. Please try restarting the app or clearing the cache."));
            }
        }, 100);
    });
};


// --- Wallet Functions ---

export const getWalletAddress = async (): Promise<string> => {
    try {
        const miniPayInjectedProvider = await findMiniPayProvider();
        const provider = new BrowserProvider(miniPayInjectedProvider);
        const accounts = await provider.send('eth_requestAccounts', []);

        if (!accounts || accounts.length === 0) {
            throw new Error("Provider connected, but eth_requestAccounts returned an empty array. The wallet might be locked.");
        }
        return accounts[0];
    } catch (error: any) {
        // Re-throw the original error to be displayed on the screen
        throw new Error(error.message);
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
        const miniPayInjectedProvider = await findMiniPayProvider();
        const provider = new BrowserProvider(miniPayInjectedProvider);
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