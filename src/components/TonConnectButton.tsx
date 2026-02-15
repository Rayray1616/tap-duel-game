import React from 'react';
import { useTonConnect } from './TonConnectContext';

export function TonConnectButton({ className }: { className?: string }) {
  const tonConnect = useTonConnect();

  const handleConnect = () => {
    if (tonConnect.connected) {
      tonConnect.disconnect();
    } else {
      tonConnect.connect([]);
    }
  };

  return (
    <button 
      className={className}
      onClick={handleConnect}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: tonConnect.connected ? '#ff4444' : '#0088cc',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      {tonConnect.connected ? 'Disconnect' : 'Connect Wallet'}
    </button>
  );
}
