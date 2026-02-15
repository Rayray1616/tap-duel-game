import React, { createContext, useContext, useEffect, useState } from 'react';
import { tonConnect } from '@/lib/tonConnect';
import { TonConnect } from '@tonconnect/sdk';

interface TonConnectContextType {
  tonConnect: TonConnect;
  isConnected: boolean;
  wallet: any;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const TonConnectContext = createContext<TonConnectContextType | null>(null);

export function TonConnectProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    setIsConnected(tonConnect.connected);
    setWallet(tonConnect.wallet);
    
    // Listen for connection changes
    const unsubscribe = tonConnect.onStatusChange((wallet: any) => {
      setIsConnected(!!wallet);
      setWallet(wallet);
    });
    
    return unsubscribe;
  }, []);

  const connect = async () => {
    await tonConnect.connect([]);
  };

  const disconnect = async () => {
    await tonConnect.disconnect();
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
