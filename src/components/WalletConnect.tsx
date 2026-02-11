import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function WalletConnect() {
  const wallet = useTonWallet();
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
    if (wallet?.account?.address && telegramUser) {
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
              .update({ ton_address: wallet.account.address })
              .eq('id', user.id);
          }
        } catch (error) {
          console.error('Error saving wallet address:', error);
        }
      };
      saveWalletAddress();
    }
  }, [wallet, telegramUser]);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <div className="mb-4 text-center">
      {wallet ? (
        <div className="neon-text">
          <div className="text-sm mb-2">🔗 Wallet Connected</div>
          <div className="font-bold">{formatAddress(wallet.account.address)}</div>
          <TonConnectButton className="neon-button pulse mt-2" />
        </div>
      ) : (
        <TonConnectButton className="neon-button pulse" />
      )}
    </div>
  );
}
