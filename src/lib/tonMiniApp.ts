import { TonConnect } from "@tonconnect/sdk";

let tonConnectInstance: TonConnect | null = null;

export function getTonConnect(): TonConnect {
  if (!tonConnectInstance) {
    tonConnectInstance = new TonConnect({
      manifestUrl: "https://tap-duel-game-production.up.railway.app/tonconnect-manifest.json"
    });
  }
  return tonConnectInstance;
}

export const tonConnect = getTonConnect();
