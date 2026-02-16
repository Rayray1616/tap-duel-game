import { Button, Cell, Section } from '@telegram-apps/telegram-ui';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function WalletConnect() {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    // TON Connect functionality removed
    console.log('TON Connect functionality has been removed');
  }, []);

  const fetchBalance = async () => {
    // TON Connect functionality removed
    console.log('Balance fetching disabled');
  };

  const saveWalletAddress = async (address: string) => {
    // TON Connect functionality removed
    console.log('Wallet address saving disabled');
  };

  const handleConnect = () => {
    console.log('TON Connect functionality has been removed');
  };

  const handleDisconnect = () => {
    console.log('TON Connect functionality has been removed');
    setBalance(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Section>
      <Cell>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-cyan-400 font-semibold">
              Wallet: Not Connected
            </div>
            <div className="text-cyan-300 text-sm">
              TON Connect Disabled
            </div>
          </div>
          <Button onClick={handleConnect} size="s" disabled>
            Connect Unavailable
          </Button>
        </div>
      </Cell>
    </Section>
  );
}
