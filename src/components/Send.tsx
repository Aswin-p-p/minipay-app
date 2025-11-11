import React, { useState } from 'react';
import { sendUSDC } from '../utils/wallet';

interface SendProps {
    setPage: (page: string) => void;
    refreshBalance: () => void;
}

const Send: React.FC<SendProps> = ({ setPage, refreshBalance }) => {
    const [destinationAddress, setDestinationAddress] = useState('');
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successTx, setSuccessTx] = useState<string | null>(null);

    const containerStyle: React.CSSProperties = {
        padding: '20px',
        margin: '20px',
        fontFamily: 'sans-serif',
    };

    const inputStyle: React.CSSProperties = {
        width: 'calc(100% - 20px)',
        padding: '10px',
        marginBottom: '15px',
        fontSize: '16px',
        border: '1px solid #ccc',
        borderRadius: '5px'
    };

    const buttonStyle: React.CSSProperties = {
        padding: '12px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#008CBA',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        width: '100%',
        opacity: loading ? 0.6 : 1
    };

    const backButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: '#777',
        marginTop: '10px'
    };

    const messageStyle: React.CSSProperties = {
        padding: '10px',
        margin: '10px 0',
        borderRadius: '5px',
        textAlign: 'center',
        wordWrap: 'break-word'
    };

    const errorStyle: React.CSSProperties = {
        ...messageStyle,
        backgroundColor: '#f8d7da',
        color: '#721c24',
    };

    const successStyle: React.CSSProperties = {
        ...messageStyle,
        backgroundColor: '#d4edda',
        color: '#155724',
    };


    const handleSend = async () => {
        if (!destinationAddress || !amount || parseFloat(amount) <= 0) {
            setError("Please enter a valid address and amount.");
            return;
        }
        setError(null);
        setLoading(true);

        // Note: Gas estimation is handled automatically by ContractKit and the MiniPay provider.
        // You could add a separate step to display the estimate if needed, but it's not required for the transaction.
        const txHash = await sendUSDC(destinationAddress, amount);

        setLoading(false);
        if (txHash) {
            setSuccessTx(txHash);
            refreshBalance();
        } else {
            setError("Transaction failed. Please check the details and try again.");
        }
    };

    if (successTx) {
        return (
            <div style={containerStyle}>
                <div style={successStyle}>
                    <h4>Success!</h4>
                    <p>USDC sent successfully.</p>
                    <p><strong>Transaction Hash:</strong> {successTx}</p>
                </div>
                <button style={backButtonStyle} onClick={() => setPage('home')}>
                    Back to Wallet
                </button>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <h2>Send USDC</h2>
            <input
                type="text"
                placeholder="Destination Address"
                value={destinationAddress}
                onChange={(e) => setDestinationAddress(e.target.value)}
                style={inputStyle}
            />
            <input
                type="number"
                placeholder="Amount (USDC)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={inputStyle}
            />
            {error && <div style={errorStyle}>{error}</div>}
            <button onClick={handleSend} disabled={loading} style={buttonStyle}>
                {loading ? 'Sending...' : 'Send'}
            </button>
            <button onClick={() => setPage('home')} style={backButtonStyle} disabled={loading}>
                Cancel
            </button>
        </div>
    );
};

export default Send;