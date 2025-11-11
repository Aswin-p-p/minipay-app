import React, { useState, useEffect } from 'react';

import { getWalletAddress, getUSDCBalance } from './utils/wallet';
import Buy from './components/Buy';
import Send from './components/Send';
import Home from './components/Home';

const App: React.FC = () => {
    const [page, setPage] = useState('home');
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const refreshBalance = async () => {
        if (address) {
            const newBalance = await getUSDCBalance(address);
            setBalance(newBalance);
        }
    };

    useEffect(() => {
        const init = async () => {
            try {
                // Add a half-second delay to ensure the wallet is ready
                await new Promise(resolve => setTimeout(resolve, 500));

                const walletAddress = await getWalletAddress();
                setAddress(walletAddress);
                
                const usdcBalance = await getUSDCBalance(walletAddress);
                setBalance(usdcBalance);

            } catch (e: any) {
                // Display the new, highly specific error message
                setError(e.message);
            }
        };
        init();
    }, []);

    const renderPage = () => {
        if (error) {
            return (
                <div style={{ padding: '20px', margin: '20px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '8px', textAlign: 'center' }}>
                    <h4>Something went wrong</h4>
                    <p style={{ wordWrap: 'break-word', fontSize: '14px' }}>{error}</p>
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