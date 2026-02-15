import { createContext, useContext } from "react";
import { getTonConnect } from "../lib/tonMiniApp";

export const TonMiniAppContext = createContext(null);

export function TonMiniAppProvider({ children }: { children: React.ReactNode }) {
  const tonConnect = getTonConnect();
  return (
    <TonMiniAppContext.Provider value={tonConnect}>
      {children}
    </TonMiniAppContext.Provider>
  );
}

export function useTonMiniApp() {
  return useContext(TonMiniAppContext);
}
