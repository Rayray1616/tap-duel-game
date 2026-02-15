import { createContext } from "react";
import { TonConnectUIProvider as TonConnectUIProviderWrapper, useTonConnectUI as useTonConnectUIWrapper } from "@tonconnect/ui-react";
import { tonConnectUI } from "../lib/tonConnectUI";

export const TonConnectUIContext = createContext(tonConnectUI);

export function TonConnectUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProviderWrapper 
      manifestUrl="https://tap-duel-game-production.up.railway.app/tonconnect-manifest.json"
      uiPreferences={{ isTelegramMiniApp: true }}
    >
      {children}
    </TonConnectUIProviderWrapper>
  );
}

export function useTonConnectUI() {
  return useTonConnectUIWrapper();
}
