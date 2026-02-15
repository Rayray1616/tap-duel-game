import React, { createContext, useContext } from 'react';
import { tonConnect } from '@/lib/tonConnect';

export const TonConnectContext = createContext(tonConnect);

export function TonConnectProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectContext.Provider value={tonConnect}>
      {children}
    </TonConnectContext.Provider>
  );
}

export function useTonConnect() {
  return useContext(TonConnectContext);
}
