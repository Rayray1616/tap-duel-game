import { createContext, useContext } from "react";
import { tonConnect } from "../lib/tonMiniApp";

export const TonMiniAppContext = createContext(tonConnect);

export function TonMiniAppProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonMiniAppContext.Provider value={tonConnect}>
      {children}
    </TonMiniAppContext.Provider>
  );
}

export function useTonMiniApp() {
  return useContext(TonMiniAppContext);
}
