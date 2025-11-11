import React, { useState, useEffect } from 'react';
import Home from './components/Home';
import Buy from './components/Buy';
import Send from './components/Send';
import { getWalletAddress, getUSDCBalance } from './utils/wallet';

const App: React.FC = () => {
    const [page, setPage] = useState('home');
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);

    const refreshBalance = async () => {
        if (address) {
            const newBalance = await getUSDCBalance(address);
            setBalance(newBalance);
        }
    };

    useEffect(() => {
        const init = async () => {
            const walletAddress = await getWalletAddress();
            setAddress(walletAddress);
            if (walletAddress) {
                const usdcBalance = await getUSDCBalance(walletAddress);
                setBalance(usdcBalance);
            }
        };
        init();
    }, []);

    const renderPage = () => {
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