import React from 'react';
import { useTonConnectUI } from './TonConnectUIContext';

export function TonConnectButton({ className }: { className?: string }) {
  const tonConnectUI = useTonConnectUI();

  const handleConnect = () => {
    if (tonConnectUI.connected) {
      tonConnectUI.disconnect();
    } else {
      tonConnectUI.openModal();
    }
  };

  return (
    <button 
      className={className}
      onClick={handleConnect}
      style={{
        padding: '8px 16px',
        borderRadius: '8px',
        backgroundColor: tonConnectUI.connected ? '#ff4444' : '#0088cc',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        fontSize: '14px'
      }}
    >
      {tonConnectUI.connected ? 'Disconnect' : 'Connect Wallet'}
    </button>
  );
}
