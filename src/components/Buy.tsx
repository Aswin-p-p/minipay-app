import React from 'react';

interface BuyProps {
    setPage: (page: string) => void;
    refreshBalance: () => void;
}

const Buy: React.FC<BuyProps> = ({ setPage, refreshBalance }) => {
    const containerStyle: React.CSSProperties = {
        padding: '20px',
        margin: '20px',
        fontFamily: 'sans-serif',
        textAlign: 'center'
    };

    const buttonStyle: React.CSSProperties = {
        padding: '12px 20px',
        fontSize: '16px',
        cursor: 'pointer',
        backgroundColor: '#4CAF50',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        width: '100%',
        marginBottom: '10px'
    };

    const backButtonStyle: React.CSSProperties = {
        ...buttonStyle,
        backgroundColor: '#777',
    };

    const handleBuyClick = () => {
        // --- MiniPay On-Ramp Integration ---
        // This is where you would call the on-ramp provider's function.
        // For example, if using Noah, it might look like this:
        // (window as any).noah.show();
        //
        // Since we cannot simulate the actual pop-up, we will just log a message
        // and simulate a successful purchase for demonstration purposes.
        console.log("Initiating MiniPay on-ramp flow...");
        alert("The MiniPay on-ramp flow would open now. After completion, your balance will be refreshed.");

        // After the on-ramp flow is complete, you would listen for a success event
        // and then refresh the balance and go back to the home page.
        setTimeout(() => {
            refreshBalance();
            setPage('home');
        }, 3000); // Simulating a delay for the purchase
    };

    return (
        <div style={containerStyle}>
            <h2>Buy USDC</h2>
            <p>You will be redirected to our trusted partner to purchase USDC securely.</p>
            <button style={buttonStyle} onClick={handleBuyClick}>
                Proceed to Buy
            </button>
            <button style={backButtonStyle} onClick={() => setPage('home')}>
                Back to Wallet
            </button>
        </div>
    );
};

export default Buy;