import React from 'react';

export function TonConnectButton({ className }: { className?: string }) {
  const handleConnect = () => {
    // TON Connect functionality removed
    console.log('TON Connect functionality has been removed');
  };

  return (
    <button 
      className={className}
      onClick={handleConnect}
      disabled
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: '#ccc',
        color: '#666',
        border: 'none',
        cursor: 'not-allowed',
        fontSize: '14px'
      }}
    >
      Wallet Connect Disabled
    </button>
  );
}
