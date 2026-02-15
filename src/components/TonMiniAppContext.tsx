import { createContext, useContext, useEffect, useState } from "react";
import { getTonConnect } from "../lib/tonMiniApp";

export const TonMiniAppContext = createContext(null);

export function TonMiniAppProvider({ children }: { children: React.ReactNode }) {
  const [tonConnect, setTonConnect] = useState(null);

  useEffect(() => {
    const instance = getTonConnect();
    setTonConnect(instance);
  }, []);

  if (!tonConnect) return null; // or a loading screen

  return (
    <TonMiniAppContext.Provider value={tonConnect}>
      {children}
    </TonMiniAppContext.Provider>
  );
}

export function useTonMiniApp() {
  return useContext(TonMiniAppContext);
}
