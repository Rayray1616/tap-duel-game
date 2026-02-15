import { Button, Cell, Section } from '@telegram-apps/telegram-ui';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useTonMiniApp } from '../TonMiniAppContext';

export function WalletConnect() {
  const tonConnect = useTonMiniApp();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (tonConnect.account?.address) {
      fetchBalance();
      saveWalletAddress(tonConnect.account.address);
    }
  }, [tonConnect.account]);

  const fetchBalance = async () => {
    try {
      const response = await fetch(`https://toncenter.com/api/v3/account?address=${tonConnect.account.address}`);
      const data = await response.json();
      setBalance(data.balance ? (parseInt(data.balance) / 1e9).toFixed(2) : null);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const saveWalletAddress = async (address: string) => {
    try {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        await supabase
          .from('users')
          .update({ ton_address: address })
          .eq('telegram_id', tg.initDataUnsafe.user.id.toString());
      }
    } catch (error) {
      console.error('Error saving wallet address:', error);
    }
  };

  const handleConnect = () => {
    tonConnect.connect();
  };

  const handleDisconnect = () => {
    tonConnect.disconnect();
    setBalance(null);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <Section>
      <Cell>
        {tonConnect.connected ? (
          <div className="flex justify-between items-center">
            <div>
              <div className="text-cyan-400 font-semibold">
                Wallet: {formatAddress(tonConnect.account.address)}
              </div>
              {balance && (
                <div className="text-cyan-300 text-sm">
                  Balance: {balance} TON
                </div>
              )}
            </div>
            <Button onClick={handleDisconnect} size="s">
              Disconnect
            </Button>
          </div>
        ) : (
          <Button onClick={handleConnect}>
            Connect Wallet
          </Button>
        )}
      </Cell>
    </Section>
  );
}
