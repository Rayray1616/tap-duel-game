import { createContext, useContext } from "react";
import { tonConnectUI } from "../lib/tonConnectUI";

export const TonConnectUIContext = createContext(tonConnectUI);

export function TonConnectUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIContext.Provider value={tonConnectUI}>
      {children}
    </TonConnectUIContext.Provider>
  );
}

export function useTonConnectUI() {
  return useContext(TonConnectUIContext);
}
