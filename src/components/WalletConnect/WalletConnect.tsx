import { useTonWallet, useTonConnectUI } from '@tonconnect/ui-react';
import { Button, Cell, Section } from '@telegram-apps/telegram-ui';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function WalletConnect() {
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    if (wallet?.account.address) {
      fetchBalance();
      saveWalletAddress(wallet.account.address);
    }
  }, [wallet]);

  const fetchBalance = async () => {
    if (!wallet?.account.address) return;
    
    try {
      // For now, we'll show a placeholder balance
      // In a real implementation, you'd fetch from TON API
      setBalance('0.00 TON');
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance('Error');
    }
  };

  const saveWalletAddress = async (address: string) => {
    try {
      // Get current user from Telegram launch params
      const telegramUser = (window as any).Telegram?.WebApp?.initDataUnsafe?.user;
      if (!telegramUser?.id) return;

      // Upsert user with TON address
      await supabase
        .from('users')
        .upsert({
          telegram_id: telegramUser.id.toString(),
          ton_address: address,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving wallet address:', error);
    }
  };

  const handleConnect = () => {
    tonConnectUI.openModal();
  };

  const handleDisconnect = () => {
    tonConnectUI.disconnect();
    setBalance(null);
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  if (wallet) {
    return (
      <Section className="mb-4">
        <Cell>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-cyan-400 font-semibold">
                Wallet: {formatAddress(wallet.account.address)}
              </div>
              {balance && (
                <div className="text-cyan-300 text-sm">
                  Balance: {balance}
                </div>
              )}
            </div>
            <Button
              onClick={handleDisconnect}
              size="s"
              className="bg-red-600 hover:bg-red-500 text-white"
              style={{
                boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)',
              }}
            >
              Disconnect
            </Button>
          </div>
        </Cell>
      </Section>
    );
  }

  return (
    <Section className="mb-4">
      <Cell>
        <Button
          onClick={handleConnect}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg shadow-cyan-500/50 transition-all duration-200 transform hover:scale-105"
          style={{
            boxShadow: '0 0 20px rgba(6, 182, 212, 0.5), inset 0 0 20px rgba(6, 182, 212, 0.2)',
          }}
        >
          🔗 Connect TON Wallet
        </Button>
      </Cell>
    </Section>
  );
}
