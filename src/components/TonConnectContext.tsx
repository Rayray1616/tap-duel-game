import React, { createContext, useContext, useEffect, useState } from 'react';
import { TonConnect } from '@tonconnect/sdk';
import { getTonConnect } from '@/lib/tonConnect';

interface TonConnectContextType {
  tonConnect: TonConnect | null;
  isConnected: boolean;
  wallet: any;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const TonConnectContext = createContext<TonConnectContextType | null>(null);

export function TonConnectProvider({ children }: { children: React.ReactNode }) {
  const [tonConnect, setTonConnect] = useState<TonConnect | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const tc = getTonConnect();
    if (tc) {
      setTonConnect(tc);
      setIsConnected(tc.connected);
      setWallet(tc.wallet);
      
      // Listen for connection changes
      const unsubscribe = tc.onStatusChange((wallet: any) => {
        setIsConnected(!!wallet);
        setWallet(wallet);
      });
      
      return unsubscribe;
    }
  }, []);

  const connect = async () => {
    if (tonConnect) {
      await tonConnect.connect();
    }
  };

  const disconnect = async () => {
    if (tonConnect) {
      await tonConnect.disconnect();
    }
  };

  return (
    <TonConnectContext.Provider value={{ tonConnect, isConnected, wallet, connect, disconnect }}>
      {children}
    </TonConnectContext.Provider>
  );
}

export function useTonConnectContext() {
  const context = useContext(TonConnectContext);
  if (!context) {
    throw new Error('useTonConnectContext must be used within a TonConnectProvider');
  }
  return context;
}
