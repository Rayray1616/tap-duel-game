import { useEffect, useState } from 'react';
import { useTonMiniApp } from './TonMiniAppContext';
import { supabase } from '../lib/supabase';

export function WalletConnect() {
  const tonConnect = useTonMiniApp();
  const [telegramUser, setTelegramUser] = useState<any>(null);

  useEffect(() => {
    // Get Telegram user from launch params
    const getTelegramUser = () => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg?.initData?.user) {
        setTelegramUser(tg.initData.user);
      }
    };
    getTelegramUser();
  }, []);

  useEffect(() => {
    // Save wallet address to Supabase when connected
    if (tonConnect.account?.address && telegramUser) {
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
              .update({ ton_address: tonConnect.account.address })
              .eq('id', user.id);
          }
        } catch (error) {
          console.error('Error saving wallet address:', error);
        }
      };
      saveWalletAddress();
    }
  }, [tonConnect.account, telegramUser]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="wallet-connect">
      {tonConnect.connected ? (
        <div className="neon-text">
          <div className="text-sm mb-2">🔗 Wallet Connected</div>
          <div className="font-bold">{formatAddress(tonConnect.account.address)}</div>
          <button 
            className="neon-button pulse mt-2"
            onClick={() => tonConnect.disconnect()}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button 
          className="neon-button pulse"
          onClick={() => tonConnect.connect()}
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
}
