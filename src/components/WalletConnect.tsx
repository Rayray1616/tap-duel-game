import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function WalletConnect() {
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    // Telegram WebApp functionality removed - no user data available
    console.log('Telegram WebApp user data retrieval disabled');
  }, []);

  useEffect(() => {
    // TON Connect functionality removed - no wallet address to save
    console.log('TON Connect functionality has been removed');
  }, [telegramUser]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      <div className="neon-text">
        <div className="text-sm mb-2">🔗 Wallet Connect Disabled</div>
        <div className="font-bold">No wallet connected</div>
        <button 
          className="neon-button pulse mt-2"
          disabled
          style={{ opacity: 0.5, cursor: 'not-allowed' }}
        >
          Wallet Connect Unavailable
        </button>
      </div>
    </div>
  );
}
