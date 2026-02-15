import React, { createContext, useContext, useEffect, useState } from 'react';
import { getTonConnectUI } from '@/lib/tonConnect';

interface TonConnectContextType {
  tonConnectUI: any;
  isConnected: boolean;
  wallet: any;
}

const TonConnectContext = createContext<TonConnectContextType | null>(null);

export function TonConnectProvider({ children }: { children: React.ReactNode }) {
  const [tonConnectUI, setTonConnectUI] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    const ui = getTonConnectUI();
    if (ui) {
      setTonConnectUI(ui);
      setIsConnected(ui.connected);
      setWallet(ui.wallet);
      
      // Listen for connection changes
      const unsubscribe = ui.onStatusChange((wallet: any) => {
        setIsConnected(!!wallet);
        setWallet(wallet);
      });
      
      return unsubscribe;
    }
  }, []);

  return (
    <TonConnectContext.Provider value={{ tonConnectUI, isConnected, wallet }}>
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
