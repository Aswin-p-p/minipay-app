import { BrowserProvider, JsonRpcProvider, formatUnits, parseUnits, Contract } from 'ethers';
import { newKitFromWeb3, StableToken } from '@celo/contractkit';

// Celo Mainnet configuration
const CELO_RPC_URL = 'https://forno.celo.org';
const CUSD_CONTRACT_ADDRESS = '0x765DE816845861e75A25fca122bb6898B8B1282a';
const ERC20_ABI = ["function transfer(address to, uint256 amount) returns (bool)"];

// Mock test wallet address for development
const MOCK_WALLET_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

/**
 * Check if we're in development mode
 */
const isDevelopment = (): boolean => {
    return process.env.NODE_ENV === 'development' || 
           window.location.hostname === 'localhost' || 
           window.location.hostname === '127.0.0.1';
};

/**
 * Create a mock MiniPay provider for local development testing
 */
const createMockProvider = () => {
    return {
        request: async ({ method, params }: any) => {
            console.log(`🔧 Mock MiniPay: ${method}`, params);
            
            switch (method) {
                case 'eth_requestAccounts':
                    return [MOCK_WALLET_ADDRESS];
                
                case 'eth_accounts':
                    return [MOCK_WALLET_ADDRESS];
                
                case 'eth_chainId':
                    return '0xa4ec'; // Celo Mainnet chain ID (42220)
                
                case 'eth_sendTransaction':
                    // Simulate a transaction hash
                    console.log('🔧 Mock transaction sent:', params);
                    return '0x' + Array(64).fill(0).map(() => 
                        Math.floor(Math.random() * 16).toString(16)
                    ).join('');
                
                case 'eth_getTransactionReceipt':
                    // Simulate transaction receipt
                    return {
                        transactionHash: params[0],
                        status: '0x1',
                        blockNumber: '0x' + Math.floor(Math.random() * 1000000).toString(16)
                    };
                
                default:
                    throw new Error(`Mock method ${method} not implemented`);
            }
        },
        // Add additional provider properties that ethers expects
        isMetaMask: false,
        isMiniPay: true,
    };
};

/**
 * This function will wait and poll for the window.miniPay object for up to 10 seconds.
 * In development mode, it will create a mock provider instead.
 */
const findMiniPayProvider = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        // Check if we're in development mode
        if (isDevelopment()) {
            console.warn('⚠️ Running in DEVELOPMENT mode. Using MOCK MiniPay provider.');
            console.warn('⚠️ Transactions will be simulated and balances will be fetched from the real network.');
            
            // Check if mock already exists
            if (!(window as any).miniPay) {
                (window as any).miniPay = createMockProvider();
            }
            resolve((window as any).miniPay);
            return;
        }

        // Production: Wait for actual MiniPay
        // Check immediately first
        if ((window as any).miniPay) {
            resolve((window as any).miniPay);
            return;
        }

        const timeout = 10000;
        let attempts = 0;
        const interval = setInterval(() => {
            if ((window as any).miniPay) {
                clearInterval(interval);
                resolve((window as any).miniPay);
            }
            attempts++;
            if (attempts > (timeout / 100)) {
                clearInterval(interval);
                reject(new Error("FATAL: window.miniPay object was not found after 10 seconds. Please ensure you're running this app in the Opera Mini browser with MiniPay installed."));
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
        
        if (isDevelopment()) {
            console.log('🔧 Mock wallet address:', accounts[0]);
        }
        
        return accounts[0];
    } catch (error: any) {
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
        
        if (isDevelopment()) {
            console.log('🔧 Fetched balance for:', address, '=', balanceInCUSD, 'cUSD');
        }
        
        return parseFloat(balanceInCUSD).toFixed(2);
    } catch (error) {
        console.error("Error fetching USDC balance:", error);
        return null;
    }
};

export const sendUSDC = async (destinationAddress: string, amount: string): Promise<string | null> => {
    try {
        if (isDevelopment()) {
            console.warn('⚠️ DEVELOPMENT MODE: Transaction will be SIMULATED');
            console.log('🔧 Mock transaction:', {
                from: MOCK_WALLET_ADDRESS,
                to: destinationAddress,
                amount: amount + ' cUSD'
            });
            
            // Simulate a delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Return a fake transaction hash
            const fakeHash = '0x' + Array(64).fill(0).map(() => 
                Math.floor(Math.random() * 16).toString(16)
            ).join('');
            
            console.log('🔧 Mock transaction hash:', fakeHash);
            return fakeHash;
        }

        // Production: Real transaction
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

// Optional: Export for debugging
export const getEnvironmentInfo = () => {
    return {
        isDevelopment: isDevelopment(),
        hasMiniPay: !!(window as any).miniPay,
        mockAddress: isDevelopment() ? MOCK_WALLET_ADDRESS : null
    };
};