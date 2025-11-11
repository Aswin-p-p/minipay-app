import React from 'react';

interface HomeProps {
    setPage: (page: string) => void;
    address: string | null;
    balance: string | null;
}

const Home: React.FC<HomeProps> = ({ setPage, address, balance }) => {
    const cardStyle: React.CSSProperties = {
        padding: '20px',
        margin: '20px',
        border: '1px solid #eee',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        textAlign: 'center',
        fontFamily: 'sans-serif',
    };

    const addressStyle: React.CSSProperties = {
        fontSize: '14px',
        wordWrap: 'break-word',
        color: '#666',
        marginBottom: '10px'
    };

    const balanceStyle: React.CSSProperties = {
        fontSize: '36px',
        fontWeight: 'bold',
        margin: '10px 0 20px 0',
    };

    const buttonContainerStyle: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'space-around',
        gap: '10px'
    };

    const buttonStyle: React.CSSProperties = {
        padding: '12px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        border: 'none',
        borderRadius: '5px',
        flex: 1
    };

    const buyButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: '#4CAF50',
        color: 'white',
    };

    const sendButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: '#008CBA',
        color: 'white',
    };


    return (
        <div style={cardStyle}>
            <h2>My Wallet</h2>
            {address ? (
                <div>
                    <p style={addressStyle}>Address: {address}</p>
                    <p style={balanceStyle}>
                        {balance !== null ? `$${balance}` : 'Loading...'} USDC
                    </p>
                </div>
            ) : (
                <p>Loading Wallet...</p>
            )}
            <div style={buttonContainerStyle}>
                <button style={buyButtonStyle} onClick={() => setPage('buy')}>
                    Buy USDC
                </button>
                <button style={sendButtonStyle} onClick={() => setPage('send')}>
                    Send USDC
                </button>
            </div>
        </div>
    );
};

export default Home;