import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface WalletInfo {
  connected: boolean;
  ton_address: string | null;
  updated_at: string | null;
}

interface ConnectResult {
  success: boolean;
  message: string;
}

export function useTonWallet(userId?: string) {
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    fetchWalletInfo();
  }, [userId]);

  const fetchWalletInfo = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase.rpc('get_wallet_info', {
        user_id: userId
      });

      if (error) {
        console.error('Error fetching wallet info:', error);
        return;
      }

      if (data && data.length > 0) {
        const info = data[0] as WalletInfo;
        setWalletInfo(info);
        
        // Fetch balance if wallet is connected
        if (info.connected && info.ton_address) {
          await fetchBalance(info.ton_address);
        }
      }
    } catch (error) {
      console.error('Error in fetchWalletInfo:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async (address: string) => {
    try {
      // Using TON Center API for balance (free tier)
      const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${address}`, {
        headers: {
          'X-API-Key': 'YOUR_API_KEY' // You'll need to get an API key from toncenter.com
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      
      if (data.ok && data.result) {
        // Convert from nanoTON to TON (1 TON = 1e9 nanoTON)
        const balanceInTON = Number(data.result) / 1e9;
        setBalance(balanceInTON);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      // For demo purposes, set a mock balance
      setBalance(0.0);
    }
  };

  const connectWallet = async (address: string): Promise<ConnectResult | null> => {
    if (!userId || connecting) return null;

    setConnecting(true);
    try {
      const { data, error } = await supabase.rpc('connect_wallet', {
        user_id: userId,
        ton_address: address
      });

      if (error) {
        console.error('Error connecting wallet:', error);
        setConnecting(false);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as ConnectResult;
        
        // Refresh wallet info
        await fetchWalletInfo();
        
        setConnecting(false);
        return result;
      }

      setConnecting(false);
      return null;
    } catch (error) {
      console.error('Error in connectWallet:', error);
      setConnecting(false);
      return null;
    }
  };

  const disconnectWallet = async (): Promise<ConnectResult | null> => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase.rpc('disconnect_wallet', {
        user_id: userId
      });

      if (error) {
        console.error('Error disconnecting wallet:', error);
        return null;
      }

      if (data && data.length > 0) {
        const result = data[0] as ConnectResult;
        
        // Clear local state
        setWalletInfo(null);
        setBalance(null);
        
        return result;
      }

      return null;
    } catch (error) {
      console.error('Error in disconnectWallet:', error);
      return null;
    }
  };

  const refreshBalance = async () => {
    if (walletInfo?.connected && walletInfo.ton_address) {
      await fetchBalance(walletInfo.ton_address);
    }
  };

  const maskAddress = (address: string | null): string => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const refresh = () => {
    fetchWalletInfo();
  };

  return {
    walletInfo,
    balance,
    loading,
    connecting,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    refresh,
    maskAddress
  };
}
