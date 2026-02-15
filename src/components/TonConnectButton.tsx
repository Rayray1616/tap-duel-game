import React from 'react';
import { useTonConnectContext } from './TonConnectContext';

export function TonConnectButton({ className }: { className?: string }) {
  const { isConnected, connect, disconnect } = useTonConnectContext();

  return (
    <button 
      className={className}
      onClick={isConnected ? disconnect : connect}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: isConnected ? '#ff4444' : '#0088cc',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      {isConnected ? 'Disconnect' : 'Connect Wallet'}
    </button>
  );
}
