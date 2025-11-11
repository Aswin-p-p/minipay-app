import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Buy from './components/Buy';
import Send from './components/Send';
import { getWalletAddress, getUSDCBalance } from './utils/wallet';

const App: React.FC = () => {
    const [page, setPage] = useState('home');
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    // NEW: Add state to hold any error messages
    const [error, setError] = useState<string | null>(null);

    const refreshBalance = async () => {
        if (address) {
            const newBalance = await getUSDCBalance(address);
            setBalance(newBalance);
        }
    };

    useEffect(() => {
        const init = async () => {
            // NEW: Wrap everything in a try...catch block
            try {
                const walletAddress = await getWalletAddress();
                
                if (!walletAddress) {
                    // This is a critical error if it happens inside MiniPay
                    throw new Error("Could not get wallet address. Make sure you are using the 'Test your app' button inside MiniPay.");
                }
                
                setAddress(walletAddress);
                
                const usdcBalance = await getUSDCBalance(walletAddress);
                setBalance(usdcBalance);

            } catch (e: any) {
                // If any error happens, we'll show it on the screen
                setError(`Initialization Error: ${e.message}`);
            }
        };
        init();
    }, []);

    const renderPage = () => {
        // NEW: If there is an error, display it instead of the app
        if (error) {
            return (
                <div style={{ padding: '20px', margin: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', textAlign: 'center' }}>
                    <h4>Something went wrong</h4>
                    <p style={{ wordWrap: 'break-word' }}>{error}</p>
                    <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '10px', cursor: 'pointer', border: 'none', borderRadius: '5px' }}>
                        Reload App
                    </button>
                </div>
            );
        }

        switch (page) {
            case 'buy':
                return <Buy setPage={setPage} refreshBalance={refreshBalance} />;
            case 'send':
                return <Send setPage={setPage} refreshBalance={refreshBalance} />;
            default:
                return (
                    <Home
                        setPage={setPage}
                        address={address}
                        balance={balance}
                    />
                );
        }
    };

    return <div>{renderPage()}</div>;
};

export default App;