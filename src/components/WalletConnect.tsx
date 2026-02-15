import { useEffect, useState } from 'react';
import { useTonConnectUI } from './TonConnectUIContext';
import { supabase } from '../lib/supabase';

export function WalletConnect() {
  const tonConnectUI = useTonConnectUI();
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    // Get Telegram user from launch params
    const getTelegramUser = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initDataUnsafe?.user) {
        setTelegramUser(tg.initDataUnsafe.user);
      }
    };
    getTelegramUser();
  }, []);

  useEffect(() => {
    // Save wallet address to Supabase when connected
    if (tonConnectUI.wallet?.account.address && telegramUser) {
      const saveWalletAddress = async () => {
        try {
          // Find user by telegram_id
          const { data: user } = await supabase
            .from('users')
            .select('id')
            .eq('telegram_id', telegramUser.id.toString())
            .single();

          if (user) {
            // Update ton_address
            await supabase
              .from('users')
              .update({ ton_address: tonConnectUI.wallet.account.address })
              .eq('id', user.id);
          }
        } catch (error) {
          console.error('Error saving wallet address:', error);
        }
      };
      saveWalletAddress();
    }
  }, [tonConnectUI.wallet, telegramUser]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      {tonConnectUI.connected ? (
        <div className="neon-text">
          <div className="text-sm mb-2">🔗 Wallet Connected</div>
          <div className="font-bold">{formatAddress(tonConnectUI.wallet.account.address)}</div>
          <button 
            className="neon-button pulse mt-2"
            onClick={() => tonConnectUI.disconnect()}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          className="neon-button pulse"
          onClick={() => tonConnectUI.openModal()}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
